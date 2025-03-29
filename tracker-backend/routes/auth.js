const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const pool = require('../db');

// Register User
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user already exists
    const userCheck = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password using SHA-256
    const hashedPassword = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');
    
    // Insert new user
    const newUser = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email, hashedPassword]
    );
    
    // Create default account for user
    await pool.query(
      'INSERT INTO accounts (user_id, name, balance, account_type) VALUES ($1, $2, $3, $4)',
      [newUser.rows[0].id, 'Primary Account', 0, 'personal']
    );
    
    // Create user profile
    await pool.query(
      'INSERT INTO user_profiles (user_id, theme, currency, notification_preferences) VALUES ($1, $2, $3, $4)',
      [newUser.rows[0].id, 'light', '₹', '{}']
    );
    
    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.rows[0].id, email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    res.status(201).json({
      token,
      user: {
        id: newUser.rows[0].id,
        email: newUser.rows[0].email
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Register first' });
    }
    
    // Hash the provided password using SHA-256
    const hashedPassword = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');
    
    // Compare hashed passwords
    if (hashedPassword !== user.rows[0].password_hash) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Update last login time
    await pool.query(
      'UPDATE user_profiles SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1',
      [user.rows[0].id]
    );
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.rows[0].id, email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    res.json({
      token,
      user: {
        id: user.rows[0].id,
        email: user.rows[0].email
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
