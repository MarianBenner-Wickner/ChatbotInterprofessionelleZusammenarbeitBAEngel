// models/feedbackModel.js

const db = require('./db');

// Funktionen exportieren
module.exports = {
  // Feedback speichern
  saveFeedback({ comment, chatProof }) {
    const timestamp = new Date().toLocaleString('sv-SE', {
      timeZone: 'UTC',
      hour12: false
    }).replace('T', ' ');

    db.prepare(`
      INSERT INTO feedback (timestamp, comment, chatProof, status)
      VALUES (?, ?, ?, 'new')
    `).run(timestamp, comment, chatProof || '');
  },

  // Alle Feedback-Einträge laden
  getAllFeedback() {
    return db.prepare(`
      SELECT id, timestamp, comment, chatProof, status
      FROM feedback
      ORDER BY timestamp DESC
    `).all();
  },

  // Feedback löschen
  deleteFeedback(id) {
    return db.prepare(`DELETE FROM feedback WHERE id = ?`).run(id);
  },

  // Feedback als "Gesehen" markieren
  markAsSeen(id) {
    return db.prepare(`UPDATE feedback SET status = 'old' WHERE id = ?`).run(id);
  }
};
