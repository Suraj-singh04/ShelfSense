const express = require('express');
const router = express.Router();
const { login, signup, logout, verifyToken } = require('../controllers/auth-controller');

// Login route
router.post('/login', login);

// Signup route
router.post('/signup', signup);

// Logout route
router.post('/logout', logout);

// Verify token route
router.get('/verify', verifyToken);

module.exports = router; 