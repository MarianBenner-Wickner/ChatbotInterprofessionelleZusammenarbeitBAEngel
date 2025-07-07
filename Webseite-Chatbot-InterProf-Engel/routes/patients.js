// routes/patients.js

const express = require('express');
const router = express.Router();
const controller = require('../controllers/patientController')();
const requireAdmin = require('../middleware/requireAdmin'); // Admin-Zugriff absichern

// Routen
router.get('/active', controller.getAktiverPatient);
router.use(requireAdmin); // Schutz für alle Routen
router.post('/active', controller.setAktiverPatient);
router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

// Export
module.exports = router;