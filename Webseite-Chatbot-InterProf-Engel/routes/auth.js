// routes/auth.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Routen
router.post('/login', express.urlencoded({ extended: false }), authController.login);
router.post('/logout', authController.logout);

// Export
module.exports = router;