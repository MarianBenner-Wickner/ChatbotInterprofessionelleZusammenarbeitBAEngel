// models/promptModel.js

const db = require('./db');


module.exports = {

  // === Rollen-Prompts ===

  // Alle Rollen-Prompts laden
  getAllRolePrompts() {
    return db.prepare(`
      SELECT id, role, displayRolle, displayName, promptText FROM rolePrompts
    `).all();
  },

  // Rollen-Prompt erstellen
  upsertRolePrompts(prompts) {
    const insert = db.prepare(`
      INSERT INTO rolePrompts (role, displayRolle, displayName, promptText)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(role) DO UPDATE SET
        displayRolle = excluded.displayRolle,
        displayName  = excluded.displayName,
        promptText   = excluded.promptText
    `);

    const transaction = db.transaction((list) => {
      for (const p of list) {
        insert.run(p.role, p.displayRolle, p.displayName, p.promptText);
      }
    });

    transaction(prompts);
  },

  // Rollen-Prompt bearbeiten
  updateRolePromptById(id, { displayRolle, displayName, promptText }) {
    return db.prepare(`
      UPDATE rolePrompts
      SET displayRolle = ?, displayName = ?, promptText = ?
      WHERE id = ?
    `).run(displayRolle, displayName, promptText, id);
  },

  // Rollen-Prompt löschen
  deleteRolePromptById(id) {
    return db.prepare(`DELETE FROM rolePrompts WHERE id = ?`).run(id);
  },

  // Rollen-Prompt nach ID laden
  getRolePromptById(id) {
    return db.prepare(`SELECT * FROM rolePrompts WHERE id = ?`).get(id);
  },


  // === System-Prompts ===

  // System-Prompt laden
  getAllSystemPrompts() {
    return db.prepare(`SELECT promptId, name, promptText FROM systemPrompts`).all();
  },

  // System-Prompt aktualisieren
  upsertSystemPrompt(name, promptText) {
    return db.prepare(`
      INSERT INTO systemPrompts (name, promptText)
      VALUES (?, ?)
      ON CONFLICT(name) DO UPDATE SET promptText = excluded.promptText
    `).run(name, promptText);
  }
};