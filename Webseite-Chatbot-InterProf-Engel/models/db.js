// models/db.js

const Database = require('better-sqlite3');
const DB_PATH = process.env.DB_PATH || './chatbot.db';


let db;

// Initialisierung / Anbindung Datenbank
try {
  db = new Database(DB_PATH);
  console.log('Datenbank erfolgreich verbunden.');
} 

catch (err) {
  console.error('Konnte Datenbank nicht verbinden:', err.message);
  process.exit(1);
}

module.exports = db;