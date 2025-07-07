// models/chatSessionModel.js

const db = require('./db');

module.exports = {
  // Neue ChatSession erstellen
  createChatSession(jahr, quartal) {
    const existing = db.prepare(`
      SELECT id FROM chatSessions WHERE jahr = ? AND quartal = ?
    `).get(jahr, quartal);

    let sessionId;

    if (existing) {
      sessionId = existing.id;
    } else {
      // Neue Session anlegen
      const result = db.prepare(`
        INSERT INTO chatSessions (jahr, quartal) VALUES (?, ?)
      `).run(jahr, quartal);
      sessionId = result.lastInsertRowid;

      // Gruppen und zugehörige Chatverläufe anlegen
      const insertGroup = db.prepare(`
        INSERT INTO gruppen (chatSessionId, name) VALUES (?, ?)
      `);
      const insertChat = db.prepare(`
        INSERT INTO chatverlaeufe (chatSessionId, gruppenId, messages)
        VALUES (?, ?, ?)
      `);

      for (let i = 1; i <= 5; i++) {
        const groupResult = insertGroup.run(sessionId, `Gruppe ${i}`);
        const groupId = groupResult.lastInsertRowid;
        insertChat.run(sessionId, groupId, JSON.stringify([]));
      }
    }

    // Aktive Session setzen
    const exists = db.prepare(`SELECT 1 FROM aktiveChatSession WHERE id = 1`).get();
    if (exists) {
      db.prepare(`UPDATE aktiveChatSession SET chatSessionId = ? WHERE id = 1`).run(sessionId);
    } else {
      db.prepare(`INSERT INTO aktiveChatSession (id, chatSessionId) VALUES (1, ?)`).run(sessionId);
    }

    return { id: sessionId, jahr, quartal };
  },

  // Alle Chat-Sessions abrufen
  getAllChatSessions() {
    return db.prepare(`SELECT * FROM chatSessions ORDER BY createdAt DESC`).all();
  },

  // Aktive Chat-Session laden
  getAktiveChatSession() {
    const row = db.prepare(`
      SELECT cs.id, cs.jahr, cs.quartal
      FROM aktiveChatSession a
      JOIN chatSessions cs ON cs.id = a.chatSessionId
      WHERE a.id = 1
    `).get();
    return row || null;
  },

  // Gruppe nach bestimmter Chat-Session laden
  getGroupsForSession(sessionId) {
    return db.prepare(`
      SELECT groupId, name FROM gruppen WHERE chatSessionId = ?
    `).all(sessionId);
  },

  // ChatSession-ID nach Gruppe laden
  getChatSessionIdForGroup(groupId) {
    const row = db.prepare(`
      SELECT chatSessionId FROM gruppen WHERE groupId = ?
    `).get(groupId);
    return row?.chatSessionId || null;
  },

  // Alle ChatSessions nach Gruppe laden
  getAllChatverlaeufeForGroup(groupId) {
    return db.prepare(`
      SELECT id, createdAt, updatedAt FROM chatverlaeufe
      WHERE gruppenId = ?
      ORDER BY createdAt DESC
    `).all(groupId);
  },

  // Aktuellen Chatverlauf nach Gruppe laden
  getChatverlaeufeByGroupId(groupId) { 
    return db.prepare(`
      SELECT * FROM chatverlaeufe
      WHERE gruppenId = ?
      ORDER BY createdAt DESC
      LIMIT 1
    `).get(groupId);
  },

  // Neuen Chatverlauf erstellen
  createChatverlauf(groupId, chatSessionId) {
    const result = db.prepare(`
      INSERT INTO chatverlaeufe (chatSessionId, gruppenId, messages)
      VALUES (?, ?, ?)
    `).run(chatSessionId, groupId, JSON.stringify([]));

    return {
      id: result.lastInsertRowid,
      chatSessionId,
      gruppenId: groupId
    };
  },

  // Chatverlauf nach ID erhalten
  getChatverlaufById(chatId) {
    return db.prepare(`
      SELECT * FROM chatverlaeufe WHERE id = ?
    `).get(chatId);
  },

  // Chatverlauf aktualisieren
  updateChatverlauf(chatId, messages) {
    const time = new Date().toISOString().slice(0, 19).replace('T', ' ');
    db.prepare(`
      UPDATE chatverlaeufe
      SET messages = ?, updatedAt = ?
      WHERE id = ?
    `).run(JSON.stringify(messages), time, chatId);
  }
};