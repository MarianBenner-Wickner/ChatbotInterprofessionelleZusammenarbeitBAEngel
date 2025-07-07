// middleware/session.js

const session = require('express-session');

module.exports = session({
  // Verwaltung der Session für Zugang zum Admin-Menü
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
});