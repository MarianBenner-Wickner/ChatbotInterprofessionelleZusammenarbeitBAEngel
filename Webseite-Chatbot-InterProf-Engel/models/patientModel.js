// models/patientModel.js

const db = require('./db');

// Funktionen exportieren
module.exports = {
  // Alle Patienten laden
  getAllPatients() {
    return db.prepare(`SELECT * FROM patients ORDER BY createdAt DESC`).all();
  },

  // Patient nach ID laden
  getPatientById(id) {
    return db.prepare(`SELECT * FROM patients WHERE id = ?`).get(id);
  },

  // Patient erstellen
  createPatient({ name, hintergrund, arztbrief, laborbericht, ueberleitungsbogen }) {
    return db.prepare(`
      INSERT INTO patients (name, hintergrund, arztbrief, laborbericht, ueberleitungsbogen)
      VALUES (?, ?, ?, ?, ?)
    `).run(name, hintergrund, arztbrief, laborbericht, ueberleitungsbogen);
  },

  // Patient aktualisieren
  updatePatient(id, { name, hintergrund, arztbrief, laborbericht, ueberleitungsbogen }) {
    return db.prepare(`
      UPDATE patients
      SET name = ?, hintergrund = ?, arztbrief = ?, laborbericht = ?, ueberleitungsbogen = ?
      WHERE id = ?
    `).run(name, hintergrund, arztbrief, laborbericht, ueberleitungsbogen, id);
  },

  // Patient löschen
  deletePatient(id) {
    return db.prepare(`DELETE FROM patients WHERE id = ?`).run(id);
  },

  // Aktiven Patienten setzen
  setAktiverPatient(patientId) {
    const exists = db.prepare(`SELECT 1 FROM aktivePatient WHERE id = 1`).get();
    if (exists) {
      db.prepare(`UPDATE aktivePatient SET patientId = ? WHERE id = 1`).run(patientId);
    } else {
      db.prepare(`INSERT INTO aktivePatient (id, patientId) VALUES (1, ?)`).run(patientId);
    }
  },

  // Aktiven Patienten erhalten
  getAktiverPatient() {
    const row = db.prepare(`
      SELECT p.*
      FROM aktivePatient a
      JOIN patients p ON a.patientId = p.id
      WHERE a.id = 1
    `).get();
    return row || null;
  },

  // Aktiven Patienten löschen
  clearAktiverPatientIfMatches(patientId) {
    db.prepare(`DELETE FROM aktivePatient WHERE patientId = ?`).run(patientId);
  }
};