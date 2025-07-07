// routes/openAI.js

const express = require('express');
const router = express.Router();
const controller = require('../controllers/openAIController');

// Routen
router.post('/', controller.processMessage);

// Export
module.exports = router;