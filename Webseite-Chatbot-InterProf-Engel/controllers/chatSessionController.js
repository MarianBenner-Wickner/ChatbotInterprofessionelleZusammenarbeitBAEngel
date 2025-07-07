// controllers/chatSessionController.js

const model = require('../models/chatSessionModel');

module.exports = () => ({
  // Erstellen neuer Chat-Session
  createChatSession: (req, res) => {
    const { jahr, quartal } = req.body;
    if (!jahr || !quartal) {
      return res.status(400).json({ error: 'jahr und quartal erforderlich' });
    }
    const session = model.createChatSession(jahr, quartal);
    res.status(201).json(session);
  },

  // Aufrufen aller ChatSessions
  getAllChatSessions: (req, res) => {
    const sessions = model.getAllChatSessions();
    res.json(sessions);
  },

  // Aufrufen aktiver ChatSession
  getAktiveChatSession: (req, res) => {
    const session = model.getAktiveChatSession();
    if (!session) return res.status(404).json({ id: null, jahr: null, quartal: null });
    res.json(session);
  },

  // Aufrufen Gruppen für ChatSession
  getGroupsForSession: (req, res) => {
    const id = req.params.id;
    const groups = model.getGroupsForSession(id);
    res.json(groups);
  },

  // Sicherstellung, dass ein Chatverlauf für eine Gruppe vorhanden ist
  ensureChatverlauf: (req, res) => {
    const { groupId } = req.body;
    if (!groupId) {
      return res.status(400).json({ error: 'groupId erforderlich' });
    }

    const sessionId = model.getChatSessionIdForGroup(groupId);
    if (!sessionId) {
      return res.status(404).json({ error: 'Keine zugeordnete Session gefunden' });
    }

    let chat = model.getChatByGroup(groupId);
    if (!chat) {
      chat = model.createChatverlauf(groupId, sessionId);
    }

    res.json({ chatId: chat.id, sessionId });
    },

  // Chatverlauf nach ID erhalten
  getChatverlauf: (req, res) => {
    const chatId = parseInt(req.params.chatId, 10);      
    if (!chatId) return res.status(400).json({ error: 'chatId erforderlich' });

    const chat = model.getChatverlaufById(chatId);
    if (!chat) return res.status(404).json({ error: 'Kein Verlauf gefunden' });

    let messages = [];
    try {
      messages = JSON.parse(chat.messages || '[]');
    } catch { }

    res.json({
      chatId,
      chatSessionId: chat.chatSessionId,
      gruppenId: chat.gruppenId,
      messages
    });
  },

  // Nachricht in Chatverlauf einfügen
  postChatMessage: (req, res) => {
    const chatId = parseInt(req.params.chatId, 10);
    const { sender, text, role } = req.body;

    if (isNaN(chatId) || !sender || !text) {
      return res.status(400).json({ error: 'chatId (Route), sender und text sind erforderlich' });
    }

    const chat = model.getChatverlaufById(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Kein Verlauf gefunden' });
    }

    let messages = [];
    try {
      messages = JSON.parse(chat.messages || '[]');
    } catch {}

    messages.push({
      sender,
      text,
      role: role || null,
      timestamp: new Date().toISOString(),
    });

    model.updateChatverlauf(chatId, messages);
    return res.json({ status: 'ok' });
  },

  // Laden des neuesten Chatverlaufs einer Gruppe
  getLatestChatForGroup: (req, res) => {
    const groupId = parseInt(req.params.groupId, 10);
    if (!groupId) return res.status(400).json({ error: 'groupId erforderlich' });

    const chat = model.getChatverlaeufeByGroupId(groupId);
    if (!chat) return res.status(404).json({ error: 'Kein Verlauf gefunden' });

    let messages = [];
    try {
      messages = JSON.parse(chat.messages || '[]');
    } catch {}

    res.json({
      chatId: chat.id,
      chatSessionId: chat.chatSessionId,
      gruppenId: chat.gruppenId,
      messages
    });
  },

  // Laden aller Chats einer Gruppe
  getAllChatsForGroup: (req, res) => {
    const groupId = parseInt(req.params.groupId, 10);
    if (!groupId) return res.status(400).json({ error: 'groupId erforderlich' });

    const chats = model.getAllChatverlaeufeForGroup(groupId); 
    res.json(chats);
  },

  // Erstellen eines neuen Chats für eine Gruppe
  createChatForGroup: (req, res) => {
    const groupId = parseInt(req.params.groupId, 10);
    if (!groupId) return res.status(400).json({ error: 'groupId erforderlich' });

    const sessionId = model.getChatSessionIdForGroup(groupId);
    if (!sessionId) return res.status(404).json({ error: 'Keine zugeordnete Session gefunden' });

    const chat = model.createChatverlauf(groupId, sessionId);
    res.status(201).json(chat); 
  }

});
