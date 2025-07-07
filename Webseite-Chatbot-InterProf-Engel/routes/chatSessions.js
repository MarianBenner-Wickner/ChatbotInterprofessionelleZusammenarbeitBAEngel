// routes/chatSessions.js

const express = require('express');
const router = express.Router();
const controller = require('../controllers/chatSessionController')();

// Routen
router.get('/chatSessions', controller.getAllChatSessions);
router.get('/chatSessions/active', controller.getAktiveChatSession);
router.post('/chatSessions', controller.createChatSession);
router.get('/chatSessions/:id/gruppen', controller.getGroupsForSession);
router.get('/chatSessions/chat/:chatId', controller.getChatverlauf);
router.post('/chatSessions/chat/:chatId/message', controller.postChatMessage);
router.get('/chatSessions/group/:groupId/latest', controller.getLatestChatForGroup);
router.post('/chatSessions/group/:groupId/chats', controller.createChatForGroup);
router.get('/chatSessions/group/:groupId/chats', controller.getAllChatsForGroup);

// Export
module.exports = router;