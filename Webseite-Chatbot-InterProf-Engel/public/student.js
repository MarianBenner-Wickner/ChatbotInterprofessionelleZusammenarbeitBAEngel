// public/student.js

/* ===============================================
   1. Element-Referenzen und Initialisierung
   =============================================== */
const groupSelect        = document.getElementById('groupSelect');
const sessionDisplay     = document.getElementById('session-display');
const chatSection        = document.getElementById('chat-section');
const roleSelect         = document.getElementById('expert');
const newChatBtn         = document.getElementById('newChatInGroupButton');
const sessionControl     = document.getElementById('session-control');
const errorForm          = document.getElementById('error-form');
const chatForm           = document.getElementById('chat-form');
const userInput          = document.getElementById('user-input');
const chatBox            = document.getElementById('chatbox');
const chatSelect      = document.getElementById('chatSelect');
const adminPageBtn       = document.getElementById('admin-btn');
const loginForm          = document.getElementById('login-form');
const errorDiv           = document.getElementById('login-error');
const noteText           = document.getElementById('note-text');
const errorText          = document.getElementById('error-text');
const errorFeedback      = document.getElementById('error-feedback');
const expertSelectSection = document.querySelector('.expert-selection-section');
const patientLabel = document.getElementById('student-aktiver-patient');
const introTrigger = document.getElementById('intro-toggle-trigger');
const introSection = document.getElementById('intro-toggle-section');

let currentGroupId = null;
let currentRole = null;
let currentRoleId = null;
let currentRoleDisplayName = null;
let activeChatSessionId = null;
let currentChatId        = null;
let roleDisplayMap = {};
let roleDataById = {};


/* ===============================================
   2. Hilfsfunktionen
   =============================================== */

// Formatierung Zeitstempel
function formatTimestamp(timestamp) {
  const utcDate = new Date(timestamp + 'Z');
  const germanyDate = new Date(utcDate.toLocaleString('en-US', { timeZone: 'Europe/Berlin' }));

  const day = germanyDate.getDate().toString().padStart(2, '0');
  const month = (germanyDate.getMonth() + 1).toString().padStart(2, '0');
  const year = germanyDate.getFullYear();
  const hours = germanyDate.getHours().toString().padStart(2, '0');
  const minutes = germanyDate.getMinutes().toString().padStart(2, '0');

  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

// Werte in lokalen Speicher speichern
function setItemWithExpiry(key, value, ttlMs) {
  const now = new Date();
  const item = {
    value,
    expiry: now.getTime() + ttlMs,
  };
  localStorage.setItem(key, JSON.stringify(item));
}

// Werte aus lokalem Speicher auslesen
function getItemWithExpiry(key) {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;
  try {
    const item = JSON.parse(itemStr);
    if (new Date().getTime() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
  } catch (e) {
    localStorage.removeItem(key);
    return null;
  }
}

// Senden mit Enter, Zeilenumbruch mit Shift+Enter
userInput?.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    chatForm?.requestSubmit();
  }
});

// Ein-/Ausblenden Einführungstext
if (introTrigger && introSection) {
  introTrigger.style.cursor = 'pointer';
  introSection.style.cursor = 'pointer';
  introTrigger.addEventListener('click', () => {
    introSection.classList.toggle('hidden');
  });
  introSection.addEventListener('click', () => {
    introSection.classList.toggle('hidden');
  });
}

// Sichtbarkeit von Elementen steuern
function hideAllControls() {
  roleSelect.classList.add('hidden');
  expertSelectSection.classList.add('hidden');
  newChatBtn.classList.add('hidden');
  sessionControl.classList.add('hidden');
  chatSection.classList.add('hidden');
}

// Anzeige Rollenauswahl
function showRoleSelector() {
  roleSelect.classList.remove('hidden');
  expertSelectSection.classList.remove('hidden');
}

// Aktualisierung Sichtbarkeit Chatbox-Elemente
function updateVisibility() {
  const showCore = currentGroupId && currentRole;
  if (showCore) {
    newChatBtn.classList.remove('hidden');
    sessionControl.classList.remove('hidden');
    chatSection.classList.remove('hidden');
  } else {
    newChatBtn.classList.add('hidden');
    sessionControl.classList.add('hidden');
    chatSection.classList.add('hidden');
  }
}


/* ===============================================
   3. Login
   =============================================== */

// Login
if (loginForm) {
  loginForm.addEventListener('submit', async event => {
    event.preventDefault();
    errorDiv.textContent = '';
    const pw = document.getElementById('admin-password').value;
    try {
      const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ password: pw })
      });
      if (res.ok) {
        window.location.href = '/admin.html';
      } else if (res.status === 401) {
        errorDiv.textContent = 'Falsches Passwort';
      } else {
        errorDiv.textContent = 'Ein Fehler ist aufgetreten';
      }
    } catch (e) {
      errorDiv.textContent = 'Netzwerkfehler';
    }
  });
}


/* ===============================================
   4. Chatbot-Chatbox
   =============================================== */

// Prüfung aktiver Patient
async function checkAktiverPatientUndSteuern() {
  try {
    const res = await fetch('/api/patients/active');
    if (!res.ok) throw new Error('Nicht erreichbar');
    const patient = await res.json();

    if (!patient?.id) {
      patientLabel.textContent = '(kein Patient aktiv)';
      hideAllControls();
      return false;
    }

    patientLabel.textContent = patient.name;
    return true;

  } catch (err) {
    console.error('Fehler beim Abrufen des aktiven Patienten:', err);
    patientLabel.textContent = '(Kein Patient ausgewählt)';
    hideAllControls();
    return false;
  }
}

// Gruppen und Session laden
async function loadGroupsAndSession() {
  try {
    const res = await fetch('/api/chatSessions/active');
    if (res.ok) {
      const session = await res.json();
      if (session?.id) {
        sessionDisplay.textContent = `${session.quartal}-${session.jahr}`;
        activeChatSessionId = session.id;

        const groupRes = await fetch(`/api/chatSessions/${activeChatSessionId}/gruppen`);
        const gruppen = await groupRes.json();

        groupSelect.innerHTML = '<option value="" disabled selected>– Gruppe wählen –</option>';
        gruppen.forEach(g => {
          const opt = document.createElement('option');
          opt.value = g.groupId || g.id;
          opt.textContent = g.name;
          groupSelect.appendChild(opt);
        });

        const storedGroup = getItemWithExpiry('currentGroupId');
        if (storedGroup && gruppen.some(g => (g.groupId || g.id) === parseInt(storedGroup))) {
          groupSelect.value = storedGroup;
          currentGroupId = storedGroup;
          showRoleSelector();
          updateVisibility();
          await populateChatDropdown(currentGroupId);
        }

        groupSelect.addEventListener('change', async () => {
          currentGroupId = groupSelect.value;
          setItemWithExpiry('currentGroupId', currentGroupId, 3600000);

          localStorage.removeItem('selectedRole');
          currentRole = null;
          currentRoleDisplayName = null;
          roleSelect.value = "";
          updateVisibility();
          hideAllControls();
          showRoleSelector();
          await populateChatDropdown(currentGroupId);
        });

      } else {
        sessionDisplay.textContent = '(Keine aktive Session)';
      }
    } else {
      sessionDisplay.textContent = '(Keine aktive Session)';
    }
  } catch (err) {
    console.error('Fehler beim Laden der Session oder Gruppen:', err);
    sessionDisplay.textContent = '(Ladefehler)';
  }
}

// Laden aller verfügbaren Rollen in Drop-Down
async function loadRoles() {
  try {
    const res = await fetch('/api/rolePrompts');
    if (!res.ok) throw new Error('Fehler beim Abrufen der Rollen');
    const data = await res.json();

    roleSelect.innerHTML = '<option value="" disabled selected>– Fachperson auswählen –</option>';
    data.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.dataset.role = p.role; 
      opt.textContent = `${p.displayRolle} – ${p.displayName}`;
      roleSelect.appendChild(opt);
    });

      roleDisplayMap = {};
      roleDataById = {};
      data.forEach(p => {
        roleDisplayMap[p.role] = `${p.displayRolle} ${p.displayName}`;
        roleDataById[p.id] = p;
      });

      const storedRoleId = getItemWithExpiry('selectedRoleId');
      if (storedRoleId && roleDataById[storedRoleId]) {
        const selected = roleDataById[storedRoleId];
        currentRoleId = storedRoleId;
        currentRole = selected.role;
        currentRoleDisplayName = `${selected.displayRolle} ${selected.displayName}`;
        roleSelect.value = currentRoleId;
        updateVisibility();
        renderSystemNotice(`Rolle gewechselt. Du sprichst jetzt mit: ${currentRoleDisplayName}.`);

      if (currentChatId) {
        await fetch(`/api/chatSessions/chat/${currentChatId}/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender: 'system',
            text: systemText
          })
        });
      }
    }

  } catch (err) {
    console.error('Fehler beim Laden der Rollen oder Systemnachricht:', err);
  }
}

// Listener für Rollenauswahl
roleSelect.addEventListener('change', async () => {
  const notice = document.getElementById('new-chat-notice');
  if (notice) {
    notice.textContent = '';
  }
  currentRoleId = parseInt(roleSelect.value, 10);
  const selected = roleDataById[currentRoleId];
  if (!selected) return;

  currentRole = selected.role;
  currentRoleDisplayName = `${selected.displayRolle} ${selected.displayName}`;
  setItemWithExpiry('selectedRoleId', currentRoleId, 3600000);
  updateVisibility();
  try {
    const res = await fetch('/api/rolePrompts');
    const prompts = await res.json();
    const selected = prompts.find(p => p.role === currentRole);
    if (!selected) return;

    currentRoleDisplayName = `${selected.displayRolle} ${selected.displayName}`;
    const systemText = `Rolle gewechselt. Du sprichst jetzt mit: ${currentRoleDisplayName}.`;
    renderSystemNotice(systemText);

    if (currentChatId) {
      await fetch(`/api/chatSessions/chat/${currentChatId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: 'system',
          text: systemText
        })
      });
    }

  } catch (err) {
    console.error('Systemnachricht konnte nicht gespeichert werden:', err);
  }
});

// Laden aller verfügbaren Chat-Verläufe in Drop-Down
async function populateChatDropdown(groupId) {
  try {
    const res = await fetch(`/api/chatSessions/group/${groupId}/chats`);
    if (!res.ok) throw new Error('Chats konnten nicht geladen werden');

    const chats = await res.json();
    chatSelect.innerHTML = '';

    if (chats.length === 0) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = '-- Keine Chats vorhanden --';
      chatSelect.appendChild(opt);
      return;
    }

    chats.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `Chat vom ${formatTimestamp(c.createdAt)}`;
      chatSelect.appendChild(opt);
    });

    const storedChatId = getItemWithExpiry('selectedChatId');
    const fallback = storedChatId && chats.find(c => c.id === storedChatId);

    const toLoad = fallback ? fallback.id : chats[0].id;
    chatSelect.value = toLoad;

    await loadChatById(toLoad);

  } catch (err) {
    console.error('Fehler beim Laden der Chatliste:', err);
  }
}

// Listener für Auswahl Chatverlauf
chatSelect?.addEventListener('change', async () => {
  const selectedId = chatSelect.value;
  if (selectedId) {
    // Rolle zurücksetzen
    localStorage.removeItem('selectedRole');
    currentRole = null;
    currentRoleDisplayName = null;
    roleSelect.value = '';
    updateVisibility();
    await loadChatById(selectedId);
  }
});

// Neuesten Chatverlauf nach Gruppe laden
async function loadLatestChatForGroup(groupId) {
  try {
    const res = await fetch(`/api/chatSessions/group/${groupId}/latest`);
    if (!res.ok) throw new Error('Verlauf konnte nicht geladen werden');
    const { chatId, messages } = await res.json();
    currentChatId = chatId;                 
    chatBox.innerHTML = '';
    messages.forEach(m =>
      m.sender === 'system'
        ? renderSystemNotice(m.text)
        : renderMessage(m.text, m.sender, m.role)
    );
  } catch (err) {
    console.error('Fehler beim Laden des Chatverlaufs:', err);
    chatBox.innerHTML =
      '<p style="color:red;">Fehler beim Laden des Verlaufs.</p>';
  }
}

// Chatverlauf nach ID laden
async function loadChatById(chatId) {
  try {
    const res = await fetch(`/api/chatSessions/chat/${chatId}`);
    if (!res.ok) throw new Error('Verlauf konnte nicht geladen werden');
    const { chatId: id, messages } = await res.json();
    currentChatId = id;
    setItemWithExpiry('selectedChatId', id, 3600000);
    chatBox.innerHTML = '';
    messages.forEach(m =>
      m.sender === 'system'
        ? renderSystemNotice(m.text)
        : renderMessage(m.text, m.sender, m.role)
    );
    updateVisibility();
  } catch (err) {
    console.error('Fehler beim Laden des ausgewählten Chats:', err);
    chatBox.innerHTML =
      '<p style="color:red;">Fehler beim Laden des Chatverlaufs.</p>';
  }
}

// Allgemeine Nachrichten anzeigen
function renderMessage(text, sender, role = null) {
  const msgEl = document.createElement('div');
  msgEl.classList.add('chat-message', sender);

  let label = 'Ich';

  if (sender === 'bot') {
    if (role && roleDisplayMap[role]) {
      label = roleDisplayMap[role];          
    }              
     else {
      label = 'Unbekannte Rolle';             
    }
  }

  const html = text
    .split('\n')
    .map(line => line || '&nbsp;')
    .join('<br/>');

  msgEl.innerHTML = `
    <div class="message-header">${label}</div>
    <div class="message-body">${html}</div>
  `;
  chatBox.appendChild(msgEl);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Systemnachrichten anzeigen
function renderSystemNotice(text) {
  const msgEl = document.createElement('div');
  msgEl.classList.add('chat-system-message');

  const html = text
    .split('\n')
    .map(line => line || '&nbsp;')
    .join('<br/>');

  msgEl.innerHTML = `<div class="system-text">${html}</div>`;
  chatBox.appendChild(msgEl);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Listener Button zum Erstellen eines neuen Chats
newChatBtn?.addEventListener('click', async () => {
  if (!currentGroupId) return;

  try {
    const res = await fetch(`/api/chatSessions/group/${currentGroupId}/chats`, {
      method: 'POST'
    });

    if (!res.ok) throw new Error('Chat konnte nicht erstellt werden');
    const { id } = await res.json();

    await populateChatDropdown(currentGroupId);
    chatSelect.value = id;
    await loadChatById(id);                 
    setItemWithExpiry('selectedChatId', id, 3600000);

     roleSelect.value          = '';
     currentRole               = null;
     currentRoleDisplayName    = null;
     localStorage.removeItem('selectedRole');
    
    const notice = document.getElementById('new-chat-notice');
    if (notice) {
      notice.textContent = 'Neuer Chat gestartet. Bitte wähle eine Fachperson.';
    }

    updateVisibility();

  } catch (err) {
    console.error('Fehler beim Erstellen eines neuen Chats:', err);
    const notice = document.getElementById('new-chat-notice');
    if (notice) {
      notice.textContent = 'Fehler beim Starten eines neuen Chats.';
      notice.style.color = 'red';
    }
  }
});

// Nachricht senden
chatForm.addEventListener('submit', async e => {
  e.preventDefault();
  const text = userInput.value.trim();
  if (!text || !currentGroupId || !currentRole) return;

  renderMessage(text, 'user');
  userInput.value = '';
  const tempMsgEl = document.createElement('div');
  tempMsgEl.classList.add('chat-message', 'bot', 'typing-indicator');
  tempMsgEl.innerHTML = `
    <div class="message-header">${currentRoleDisplayName || 'Unbekannte Rolle'}</div>
    <div class="message-body"><i>schreibt …</i></div>
  `;
  chatBox.appendChild(tempMsgEl);
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const res = await fetch('/api/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId: currentChatId,
        role: currentRole,
        roleId: currentRoleId,
        text
      })
    });

    if (!res.ok) throw new Error('Antwort vom Server fehlgeschlagen');
    const data = await res.json();

    if (!data.reply || typeof data.reply !== 'string') {
      throw new Error('Ungültige Antwort vom Server');
    }

    if (tempMsgEl?.remove) tempMsgEl.remove();
    renderMessage(data.reply, 'bot', currentRole);

  } catch (err) {
    if (tempMsgEl?.remove) tempMsgEl.remove();
    console.error('Fehler bei Bot-Antwort:', err);
    renderSystemNotice('Fehler bei der Chatbot-Antwort.');
  }
});



/* ===============================================
   5. Fehlermeldungen
   =============================================== */

// Funktion zum Senden von Fehlermeldungen
if (errorForm) {
  errorForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorFeedback.textContent = '';
    errorFeedback.style.color = 'red';

    const comment = noteText.value.trim();
    const chatProof = errorText.value.trim();

    if (!comment) {
      errorFeedback.textContent = 'Bitte gib einen Kommentar ein.';
      return;
    }

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment, chatProof })
      });

      if (res.ok) {
        errorFeedback.style.color = 'green';
        errorFeedback.textContent = 'Vielen Dank für dein Feedback!';
        errorForm.reset();
      } else {
        errorFeedback.textContent = 'Fehler beim Absenden.';
      }
    } catch (err) {
      errorFeedback.textContent = 'Netzwerkfehler beim Absenden.';
    }
  });
}

/* ===============================================
   6. Initialisierung Seite
   =============================================== */

document.addEventListener('DOMContentLoaded', async () => {
  hideAllControls();  
  const patientAktiv = await checkAktiverPatientUndSteuern();
  if (!patientAktiv) return; // nichts weitermachen
  await loadRoles();
  await loadGroupsAndSession();
});