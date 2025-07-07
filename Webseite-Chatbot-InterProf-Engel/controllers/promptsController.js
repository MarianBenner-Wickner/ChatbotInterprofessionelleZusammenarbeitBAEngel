// controllers/promptsController.js

const promptModel = require('../models/promptModel');

module.exports = () => {
  return {

    // === Rollen-Prompts ===

    // Alle Rollen-Prompts abrufen
    getRolePrompts(req, res) {
      try {
        const rows = promptModel.getAllRolePrompts();
        res.json(rows);
      } catch (err) {
        console.error('Fehler beim Lesen der Prompts:', err);
        res.status(500).json({ error: 'DB-Lese-Fehler' });
      }
    },

    // Rollen-Prompt erstellen
    createOrUpdateRolePrompts(req, res) {
      try {
        promptModel.upsertRolePrompts(req.body);
        res.json({ status: 'ok' });
      } catch (err) {
        console.error('DB-Fehler:', err);
        res.status(500).json({ status: 'error', message: err.message });
      }
    },

    // Rollen-Prompt nach ID updaten
    updateRolePromptById(req, res) {
      const id = parseInt(req.params.id, 10);
      const { displayRolle, displayName, promptText } = req.body;
      if (!displayRolle || !displayName || !promptText || isNaN(id)) {
        return res.status(400).json({ error: 'Fehlende Felder oder ungültige ID' });
      }
      try {
        const result = promptModel.updateRolePromptById(id, { displayRolle, displayName, promptText });
        if (result.changes === 0) {
          return res.status(404).json({ error: 'Prompt nicht gefunden' });
        }
        res.json({ status: 'ok' });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    },

    // Rollen-Prompt löschen
    deleteRolePromptById(req, res) {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Ungültige ID' });
      }
      try {
        const result = promptModel.deleteRolePromptById(id);
        if (result.changes === 0) {
          return res.status(404).json({ error: 'Prompt nicht gefunden' });
        }
        res.json({ status: 'ok' });
      } catch (err) {
        console.error('DB-Lösch-Fehler:', err);
        res.status(500).json({ error: 'Fehler beim Löschen' });
      }
    },

    // === System-Prompts ===

    // System-Prompt abrufen
    getSystemPrompts(req, res) {
      try {
        const rows = promptModel.getAllSystemPrompts();
        res.json(rows);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    },

    // System-Prompt aktualisieren
    updateSystemPrompt(req, res) {
      const { name, promptText } = req.body;
      if (!name || !promptText) {
        return res.status(400).json({ error: 'name und promptText erforderlich' });
      }
      try {
        promptModel.upsertSystemPrompt(name, promptText);
        res.json({ status: 'ok' });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    }
  };
};