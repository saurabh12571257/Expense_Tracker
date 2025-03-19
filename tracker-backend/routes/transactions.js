const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Get all transactions for a user
router.get('/', auth, async (req, res) => {
  try {
    // Get user ID from the auth middleware
    const userId = req.user.id;
    
    // Query the database for user's transactions
    const transactionsResult = await pool.query(
      'SELECT t.*, c.name as category_name FROM transactions t ' +
      'LEFT JOIN categories c ON t.category_id = c.id ' +
      'WHERE t.user_id = $1 ' +
      'ORDER BY t.transaction_date DESC, t.created_at DESC',
      [userId]
    );
    
    // Format transactions for frontend
    const transactions = transactionsResult.rows.map(transaction => ({
      id: transaction.id,
      description: transaction.description,
      amount: parseFloat(transaction.amount),
      category: transaction.category_name || 'Others',
      date: transaction.transaction_date,
      type: transaction.transaction_type || (transaction.amount >= 0 ? 'income' : 'expense'),
      created_at: transaction.created_at
    }));
    
    res.json({ transactions });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new transaction
router.post('/', auth, async (req, res) => {
  try {
    const { description, amount, category, date, type } = req.body;
    const userId = req.user.id;
    
    const transactionType = type || (amount >= 0 ? 'income' : 'expense');
    
    const accountResult = await pool.query(
      'SELECT id FROM accounts WHERE user_id = $1 LIMIT 1',
      [userId]
    );
    
    let accountId = null;
    
    // If no account exists, create one (just one "Primary Account")
    if (accountResult.rows.length === 0) {
      const newAccountResult = await pool.query(
        'INSERT INTO accounts (user_id, name, balance, account_type) VALUES ($1, $2, $3, $4) RETURNING id',
        [userId, 'Primary Account', 0, 'personal']
      );
      accountId = newAccountResult.rows[0].id;
    } else {
      accountId = accountResult.rows[0].id;
    }
    
    // Get or create category
    let categoryId = null;
    if (category) {
      // First check if the category exists in the global categories table
      const categoryResult = await pool.query(
        'SELECT id FROM categories WHERE name = $1',
        [category]
      );
      
      let globalCategoryId = null;
      
      if (categoryResult.rows.length > 0) {
        globalCategoryId = categoryResult.rows[0].id;
      } else {
        // Create a new global category
        const newCategoryResult = await pool.query(
          'INSERT INTO categories (name, color) VALUES ($1, $2) RETURNING id',
          [category, 'bg-gray-500']
        );
        globalCategoryId = newCategoryResult.rows[0].id;
      }
      
      // Now check if the user has this category in their user_categories
      const userCategoryResult = await pool.query(
        'SELECT category_id FROM user_categories WHERE user_id = $1 AND category_id = $2',
        [userId, globalCategoryId]
      );
      
      if (userCategoryResult.rows.length > 0) {
        categoryId = globalCategoryId;
      } else {
        // Add this category to the user's categories
        await pool.query(
          'INSERT INTO user_categories (user_id, category_id) VALUES ($1, $2)',
          [userId, globalCategoryId]
        );
        categoryId = globalCategoryId;
      }
    }
    
    // Insert transaction
    const newTransaction = await pool.query(
      'INSERT INTO transactions (user_id, account_id, category_id, description, amount, transaction_date, transaction_type) ' +
      'VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [userId, accountId, categoryId, description, amount, date || new Date(), transactionType]
    );
    
    // Update account balance
    await pool.query(
      'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
      [parseFloat(amount), accountId]
    );
    
    res.status(201).json({
      transaction: {
        id: newTransaction.rows[0].id,
        description: newTransaction.rows[0].description,
        amount: parseFloat(newTransaction.rows[0].amount),
        category: category || 'Others',
        date: newTransaction.rows[0].transaction_date,
        type: newTransaction.rows[0].transaction_type,
        created_at: newTransaction.rows[0].created_at
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 