// routes/static.js

const express = require('express');
const path = require('path');
const router = express.Router();

// Startseite
router.get('/', (req, res) => {
  res.redirect('/student.html');
});

// Auslieferung der admin.html
router.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

// Export
module.exports = router;
