// models/initTables.js

const db = require('./db');

function initTables() {

  // Tabellen vorbereiten (und ggf. befüllen), wenn nicht vorhanden
  db.prepare(`
    CREATE TABLE IF NOT EXISTS rolePrompts (
      id           INTEGER    PRIMARY KEY AUTOINCREMENT,
      role         TEXT       UNIQUE NOT NULL,
      displayRolle TEXT       NOT NULL,
      displayName  TEXT       NOT NULL,
      promptText   TEXT       NOT NULL
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS systemPrompts (
      promptId    INTEGER     PRIMARY KEY AUTOINCREMENT,
      name        TEXT        UNIQUE NOT NULL,
      promptText  TEXT        NOT NULL
    )
  `).run();

  // Default-Prompt einfügen, wenn Tabelle leer ist
  const count = db.prepare(`SELECT COUNT(*) AS count FROM systemPrompts`).get().count;
  if (count === 0) {
    db.prepare(`
      INSERT INTO systemPrompts (name, promptText)
      VALUES (?, ?)
    `).run('default', 'Dies ist der voreingestellte System-Prompt für den Chatbot.');
  }

  db.prepare(`
    CREATE TABLE IF NOT EXISTS feedback (
      id         INTEGER    PRIMARY KEY AUTOINCREMENT,
      timestamp  TEXT       NOT NULL,
      comment    TEXT       NOT NULL,
      chatProof  TEXT,
      status     TEXT       DEFAULT 'new'
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS patients (
      id                    INTEGER     PRIMARY KEY AUTOINCREMENT,
      name                  TEXT        NOT NULL,       
      hintergrund           TEXT,                
      arztbrief             TEXT,                
      laborbericht          TEXT,                
      ueberleitungsbogen    TEXT,              
      createdAt             DATETIME    DEFAULT CURRENT_TIMESTAMP,
      status                TEXT        DEFAULT 'new'
    )
  `).run();

  //Default Patient von Hausen einfügen, wenn Tabelle leer ist
  const patientCount = db.prepare(`SELECT COUNT(*) AS count FROM patients`).get().count;
  if (patientCount === 0) {
    db.prepare(`
      INSERT INTO patients (name, hintergrund, arztbrief, laborbericht, ueberleitungsbogen)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      'Karl von Hausen',
      'Hintergrundinformationen über Karl von Hausen.',
      'Arztbrief von Karl von Hausen.',
      'Laborbericht von Karl von Hausen.',
      'Überleitungsbogen von Karl von Hausen.'
    );
  }

    db.prepare(`
    CREATE TABLE IF NOT EXISTS aktivePatient (
      id            INTEGER     PRIMARY KEY CHECK (id = 1),
      patientId     INTEGER     NOT NULL,
      FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE
    );
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS chatverlaeufe (
      id              INTEGER       PRIMARY KEY AUTOINCREMENT,
      chatSessionId   INTEGER       NOT NULL,
      gruppenId       INTEGER       NOT NULL,
      messages        TEXT,
      updatedAt       TEXT          DEFAULT CURRENT_TIMESTAMP,
      createdAt       TEXT          DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chatSessionId) REFERENCES chatSessions(id) ON DELETE CASCADE,
      FOREIGN KEY (gruppenId) REFERENCES gruppen(groupId) ON DELETE CASCADE
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS aktiveChatSession (
      id              INTEGER       PRIMARY KEY CHECK (id = 1),
      chatSessionId   INTEGER       NOT NULL,
      FOREIGN KEY (chatSessionId) REFERENCES chatSessions(id) ON DELETE CASCADE
    );
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS gruppen (
      groupId         INTEGER       PRIMARY KEY AUTOINCREMENT,
      chatSessionId   INTEGER       NOT NULL,
      name            TEXT          NOT NULL,
      FOREIGN KEY (chatSessionId) REFERENCES chatSessions(id) ON DELETE CASCADE
    );
  `).run();
  
  db.prepare(`
    CREATE TABLE IF NOT EXISTS chatSessions (
      id              INTEGER       PRIMARY KEY AUTOINCREMENT,
      jahr            INTEGER       NOT NULL,
      quartal         TEXT          NOT NULL,  
      createdAt       TEXT          DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

}

module.exports = initTables;