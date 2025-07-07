// controllers/patientController.js

const patientModel = require('../models/patientModel');

module.exports = () => ({
  // Alle Patienten abrufen
  getAll(req, res) {
    try {
      const patients = patientModel.getAllPatients();
      res.json(patients);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Einen Patienten nach ID abrufen
  getOne(req, res) {
    try {
      const patient = patientModel.getPatientById(req.params.id);
      if (!patient) return res.status(404).json({ error: 'Nicht gefunden' });
      res.json(patient);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Neuen Patienten anlegen
  create(req, res) {
    try {
      const { name, hintergrund, arztbrief, laborbericht, ueberleitungsbogen } = req.body;
      if (!name) return res.status(400).json({ error: 'Name ist erforderlich' });
      patientModel.createPatient({ name, hintergrund, arztbrief, laborbericht, ueberleitungsbogen });
      res.json({ status: 'ok' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Patienten aktualisieren
  update(req, res) {
    try {
      const { name, hintergrund, arztbrief, laborbericht, ueberleitungsbogen } = req.body;
      if (!name) return res.status(400).json({ error: 'Name ist erforderlich' });
      const result = patientModel.updatePatient(req.params.id, { name, hintergrund, arztbrief, laborbericht, ueberleitungsbogen });
      if (result.changes === 0) return res.status(404).json({ error: 'Nicht gefunden' });
      res.json({ status: 'ok' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Aktiven Patienten abrufen
  getAktiverPatient(req, res) {
    try {
      const patient = patientModel.getAktiverPatient();
      if (!patient) return res.status(404).json({ id: null, name: null });
      res.json(patient);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Aktiven Patienten setzen
  setAktiverPatient(req, res) {
    try {
      const { patientId } = req.body;
      if (!patientId) return res.status(400).json({ error: 'patientId erforderlich' });
      const patient = patientModel.getPatientById(patientId);
      if (!patient) return res.status(404).json({ error: 'Patient nicht gefunden' });
      patientModel.setAktiverPatient(patientId);
      res.json({ status: 'ok' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Patienten löschen
  delete(req, res) {
    try {
      patientModel.clearAktiverPatientIfMatches(req.params.id);
      const result = patientModel.deletePatient(req.params.id);
      if (result.changes === 0) return res.status(404).json({ error: 'Nicht gefunden' });
      res.json({ status: 'ok' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
});