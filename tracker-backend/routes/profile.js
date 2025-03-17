const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Get user profile
router.get('/', auth, async (req, res) => {
  try {
    // Get user ID from the auth middleware
    const userId = req.user.id;
    
    // Query the database for user information
    const userResult = await pool.query(
      'SELECT id, email, first_name, last_name, created_at FROM users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user profile information
    const profileResult = await pool.query(
      'SELECT * FROM user_profiles WHERE user_id = $1',
      [userId]
    );
    
    const profile = profileResult.rows.length > 0 ? profileResult.rows[0] : {};
    
    // Return user data and profile
    res.json({
      user: userResult.rows[0],
      profile: profile
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 