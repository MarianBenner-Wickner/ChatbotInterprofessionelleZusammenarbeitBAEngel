// server.js

// Element-Referenzen und Initialisierung
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config();
const sessionMiddleware = require('./middleware/session');
const requireAdmin = require('./middleware/requireAdmin');
const authRoutes = require('./routes/auth');
const staticRoutes = require('./routes/static');
const promptRoutes = require('./routes/prompts');
const feedbackRoutes = require('./routes/feedback');
const patientRoutes = require('./routes/patients');
const chatSessionRoutes = require('./routes/chatSessions');
const openAIRoutes = require('./routes/openAI');
const db = require('./models/db');
const initTables = require('./models/initTables');
initTables();
const app = express();
const PORT = process.env.PORT || 3000;


//Middleware für Session-Verwaltung initialisieren
app.use(sessionMiddleware);
app.use(bodyParser.json());


//Routen definieren
app.use('/', authRoutes);
app.use('/admin.html', requireAdmin);
app.use('/', staticRoutes);
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', promptRoutes);
app.use('/api', feedbackRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api', chatSessionRoutes);
app.use('/api/openai', openAIRoutes);


//Server-Start 
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
