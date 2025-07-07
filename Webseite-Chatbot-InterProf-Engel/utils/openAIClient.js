//utils/openAIClients.js

require('dotenv').config();
const OpenAI = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
const chatSessionModel = require('../models/chatSessionModel');

// Nutzung verschiedener GPT-Modelle zur Absicherung
const MODEL_PRIORITIES = [
  { name: 'gpt-4.1-2025-04-14', label: 'GPT-4.1' },
  { name: 'gpt-4o', label: 'GPT-4o' },
  { name: 'gpt-3.5-turbo-0125', label: 'GPT-3.5' }
];

// Aufruf an versch. Modelle für Antwort
async function tryModel(model, messages) {
  try {
    const completion = await openai.chat.completions.create({
      model,
      messages
    });
    const content = completion.choices?.[0]?.message?.content;
    if (!content) 
      throw new Error('Leere Antwort vom Modell');
    return { success: true, reply: content };
  } 
  catch (err) {
    return { success: false, error: err };
  }
}

// Nutzernachricht an openAI schicken
async function handleUserMessage({ chatId, roleId, role, message, nutzerNachricht, chatVerlaufAlsMessages, systemAnweisungen }) {
  if (!chatId || !role || !message) throw new Error('chatId, role und message sind erforderlich');

  const messages = [
    { role: 'system', content: systemAnweisungen },
    ...chatVerlaufAlsMessages,
    { role: 'user', content: nutzerNachricht }
  ];

  let finalReply = '[Fehler bei der Anfrage an GPT]';
  let lastError = null;

  for (const model of MODEL_PRIORITIES) {
    const result = await tryModel(model.name, messages);
    if (result.success) {
      finalReply = result.reply;
      break;
    } else {
      console.warn(`Fehler mit Modell: ${model.label} (${model.name}) – ${result.error.message}`);
      lastError = result.error;
    }
  }

  // Fehlerbehandlung und differenzierte Ausgabe
  if (finalReply === '[Fehler bei der Anfrage an GPT]') {
    console.error('Letzter Fehler:', lastError?.message);
    if (lastError?.message.includes('maximum context length')) {
      finalReply = 'Die Anfrage überschreitet das Token-Limit. Bitte starte einen neuen Chat.';
    } else if (lastError?.message.includes('network') || lastError?.code === 'ENOTFOUND') {
      finalReply = 'Der Chatbot konnte keine Verbindung zur KI aufbauen. Bitte versuche es später erneut.';
    } else if (lastError?.message.includes('401') || lastError?.message.includes('Invalid authentication')) {
      finalReply = 'Der API-Zugang ist aktuell nicht korrekt konfiguriert. Bitte informiere die Betreuung.';
    } else {
      finalReply = `Ein unerwarteter Fehler ist aufgetreten: ${lastError?.message || 'Unbekannter Fehler'}`;
    }
  }

  // Chatverlauf aktualisieren
  const timestamp = new Date().toISOString();
  const toStore = [
    { sender: 'user', text: message, role, roleId, timestamp },
    { sender: 'bot', text: finalReply, role, roleId, timestamp }
  ];
  const existing = chatSessionModel.getChatverlaufById(parseInt(chatId, 10));
  const old = (() => {
    try { return existing?.messages ? JSON.parse(existing.messages) : []; }
    catch { return []; }
  })();

  chatSessionModel.updateChatverlauf(chatId, old.concat(toStore));
  return finalReply;
}

module.exports = { handleUserMessage };
