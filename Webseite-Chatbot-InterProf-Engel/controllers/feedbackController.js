// controllers/feedbackController.js

const feedbackModel = require('../models/feedbackModel');

module.exports = {
  // Feedback speichern
  submitFeedback(req, res) {
    const { comment, chatProof } = req.body;
    if (!comment) {
      return res.status(400).json({ error: 'Kommentar erforderlich' });
    }

    try {
      feedbackModel.saveFeedback({ comment, chatProof });
      res.json({ status: 'ok' });
    } catch (err) {
      console.error('Fehler beim Speichern des Feedbacks:', err);
      res.status(500).json({ error: 'Datenbankfehler' });
    }
  },

  // Feedback laden
  getFeedbackList(req, res) {
    try {
      const rows = feedbackModel.getAllFeedback();
      res.json(rows);
    } catch (err) {
      console.error('Fehler beim Laden des Feedbacks:', err);
      res.status(500).json({ error: 'DB-Fehler' });
    }
  },

  // Feedback löschen
  deleteFeedback(req, res) {
    const id = req.params.id;
    try {
      const result = feedbackModel.deleteFeedback(id);
      if (result.changes === 0) return res.status(404).json({ error: 'Nicht gefunden' });
      res.json({ status: 'ok' });
    } catch (err) {
      console.error('Fehler beim Löschen des Feedbacks:', err);
      res.status(500).json({ error: 'Löschfehler' });
    }
  },

  // Feedback als "Gesehen" kennzeichnen
  markFeedbackAsSeen(req, res) {
    const id = req.params.id;
    try {
      const result = feedbackModel.markAsSeen(id);
      if (result.changes === 0) return res.status(404).json({ error: 'Nicht gefunden' });
      res.json({ status: 'ok' });
    } catch (err) {
      console.error('Fehler beim Aktualisieren des Status:', err);
      res.status(500).json({ error: 'Status-Fehler' });
    }
  }
};