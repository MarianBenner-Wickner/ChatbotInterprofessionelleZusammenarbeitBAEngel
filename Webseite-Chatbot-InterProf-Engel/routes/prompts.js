// routes/prompts.js

const express = require('express');
const router = express.Router();
const controller = require('../controllers/promptsController')();

// Routen
router.get('/rolePrompts', controller.getRolePrompts);
router.post('/rolePrompts', controller.createOrUpdateRolePrompts);
router.put('/rolePrompts/:id', controller.updateRolePromptById);
router.delete('/rolePrompts/:id', controller.deleteRolePromptById);
router.get('/systemPrompts', controller.getSystemPrompts);
router.put('/systemPrompts', controller.updateSystemPrompt);

// Export
module.exports = router;