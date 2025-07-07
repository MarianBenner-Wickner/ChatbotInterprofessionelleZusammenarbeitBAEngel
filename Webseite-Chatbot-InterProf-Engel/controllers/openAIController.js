// controllers/openAIController.js

const { handleUserMessage } = require('../utils/openAIClient');
const chatSessionModel = require('../models/chatSessionModel');
const promptModel = require('../models/promptModel');
const patientModel = require('../models/patientModel');

exports.processMessage = async (req, res) => {
  // Funktion zum Vorbereiten der Nachricht für openAI
  try {
    const { chatId, roleId, role, text } = req.body;

    // Rollenprompt vorbereiten
    const rollenPrompt = promptModel.getRolePromptById(parseInt(roleId, 10));
    const rollenBeschreibung = rollenPrompt
      ? `${rollenPrompt.displayRolle} ${rollenPrompt.displayName}:\n${rollenPrompt.promptText}`
      : '';

    // atienteninformationen vorbereiten
    const aktiverPatient = patientModel.getAktiverPatient();

    if (!aktiverPatient) {
      throw new Error('Kein aktiver Patient gefunden');
    }

    const { name, hintergrund, arztbrief, laborbericht, ueberleitungsbogen } = aktiverPatient;

    const patientenInformationen =
      `Name: ${name}\n\n` +
      `Hintergrund:\n${hintergrund}\n\n` +
      `Arztbrief:\n${arztbrief}\n\n` +
      `Laborbericht:\n${laborbericht}\n\n` +
      `Überleitungsbogen:\n${ueberleitungsbogen}`;


    // System-Prompt vorbereiten
    const alleSystemPrompts = promptModel.getAllSystemPrompts();
    const systemPromptEintrag = alleSystemPrompts[0];
    const systemPrompt = systemPromptEintrag?.promptText || '';

    // Finale System Anweisung vorbereiten
    const systemAnweisungen = 
      `Allgemeine Anweisung: ${systemPrompt}\n\n` +
      `Deine Rolle:\n${rollenBeschreibung}\n\n` +
      `Informationen zum Patienten:\n${patientenInformationen}`;


    // Nutzernachricht vorbereiten
    const nutzerNachricht = text?.trim();
    if (!nutzerNachricht || !chatId || !roleId || !role) {
      throw new Error('Fehlende Daten in der Anfrage');
    }

    // Chatverlauf vorbereiten
    const verlaufRoh = chatSessionModel.getChatverlaufById(parseInt(chatId, 10));
    let chatVerlauf = [];
    try {
      const parsed = verlaufRoh?.messages ? JSON.parse(verlaufRoh.messages) : [];
      chatVerlauf = parsed.map(({ sender, role, text }) => ({ sender, role, text }));
    } catch (e) {
      console.warn('Fehler beim Parsen des Chatverlaufs:', e.message);
    }

    // Chatverlauf in Format für OpenAI übertragen (Assistant-Anweisung zur Darstellung der Chatverläufe)
    const chatVerlaufAlsMessages = chatVerlauf.map(entry => {
      if (entry.sender === 'user') return { role: 'user', content: entry.text };
      if (entry.sender === 'bot') return { role: 'assistant', content: entry.text };
      if (entry.sender === 'system') return { role: 'user', content: `Systemnachricht: ${entry.text}` };
      return { role: 'user', content: entry.text };
    });

    // Antwort von OpenAI anfragen
    const reply = await handleUserMessage({
        chatId,
        roleId,
        role,
        message: text,
        nutzerNachricht,
        chatVerlaufAlsMessages,
        systemAnweisungen
      });

    // Antwort an Nutzer übermitteln
    res.json({ reply });
  } 
  
  //Fehler abfangen
  catch (err) {
    console.error('Fehler bei processMessage:', err.message);
    res.status(400).json({ error: err.message });
  }
};
