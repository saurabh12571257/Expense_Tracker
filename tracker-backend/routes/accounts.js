const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Get all accounts for a user
router.get('/', auth, async (req, res) => {
  try {
    // Get user ID from the auth middleware
    const userId = req.user.id;
    
    // Query the database for user's accounts
    const accountsResult = await pool.query(
      'SELECT * FROM accounts WHERE user_id = $1 ORDER BY name',
      [userId]
    );
    
    // Format accounts for frontend
    const accounts = accountsResult.rows.map(account => ({
      id: account.id,
      name: account.name,
      balance: parseFloat(account.balance),
      savings_goal: parseFloat(account.savings_goal || 1000),
      created_at: account.created_at
    }));
    
    res.json({ accounts });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update account savings goal
router.put('/:id/savings-goal', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { savings_goal } = req.body;
    const userId = req.user.id;
    
    // Verify account belongs to user
    const accountCheck = await pool.query(
      'SELECT * FROM accounts WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (accountCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Account not found or not authorized' });
    }
    
    // Update savings goal
    const updatedAccount = await pool.query(
      'UPDATE accounts SET savings_goal = $1 WHERE id = $2 RETURNING *',
      [savings_goal, id]
    );
    
    res.json({
      account: {
        id: updatedAccount.rows[0].id,
        name: updatedAccount.rows[0].name,
        balance: parseFloat(updatedAccount.rows[0].balance),
        savings_goal: parseFloat(updatedAccount.rows[0].savings_goal),
        created_at: updatedAccount.rows[0].created_at
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 