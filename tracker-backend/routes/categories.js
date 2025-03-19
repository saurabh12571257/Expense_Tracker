const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Get all categories for a user
router.get('/', auth, async (req, res) => {
  try {
    // Get user ID from the auth middleware
    const userId = req.user.id;
    
    // Query the database for user's categories through the user_categories table
    const categoriesResult = await pool.query(
      'SELECT c.*, uc.budget, ' +
      '(SELECT COALESCE(SUM(ABS(t.amount)), 0) FROM transactions t WHERE t.category_id = c.id AND t.user_id = $1) as total_amount ' +
      'FROM categories c ' +
      'JOIN user_categories uc ON c.id = uc.category_id ' +
      'WHERE uc.user_id = $1 ' +
      'ORDER BY total_amount DESC',
      [userId]
    );
    
    // Format categories for frontend
    const categories = categoriesResult.rows.map(category => ({
      id: category.id,
      name: category.name,
      color: category.color || 'bg-gray-500',
      budget: parseFloat(category.budget || 0),
      amount: parseFloat(category.total_amount || 0),
      created_at: category.created_at
    }));
    
    res.json({ categories });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new category
router.post('/', auth, async (req, res) => {
  try {
    const { name, color } = req.body;
    const userId = req.user.id;
    
    // Check if category already exists in the global categories table
    const categoryCheck = await pool.query(
      'SELECT id FROM categories WHERE name = $1',
      [name]
    );
    
    let categoryId;
    
    if (categoryCheck.rows.length > 0) {
      categoryId = categoryCheck.rows[0].id;
      
      // Check if user already has this category
      const userCategoryCheck = await pool.query(
        'SELECT id FROM user_categories WHERE user_id = $1 AND category_id = $2',
        [userId, categoryId]
      );
      
      if (userCategoryCheck.rows.length > 0) {
        return res.status(400).json({ message: 'Category already exists for this user' });
      }
    } else {
      // Insert new category in the global categories table
      const newCategory = await pool.query(
        'INSERT INTO categories (name, color) VALUES ($1, $2) RETURNING *',
        [name, color || 'bg-gray-500']
      );
      
      categoryId = newCategory.rows[0].id;
    }
    
    // Add category to user's categories
    await pool.query(
      'INSERT INTO user_categories (user_id, category_id) VALUES ($1, $2)',
      [userId, categoryId]
    );
    
    res.status(201).json({
      category: {
        id: categoryId,
        name,
        color: color || 'bg-gray-500',
        budget: 0,
        amount: 0
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 