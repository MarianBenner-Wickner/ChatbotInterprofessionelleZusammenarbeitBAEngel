// public/admin.js

/* ===============================================
   1. Element-Referenzen und Initialisierung
   =============================================== */

  const roleContainer           = document.getElementById('role-prompts-container');
  const roleForm                = document.getElementById('role-prompt-edit-form');
  const roleSelect              = document.getElementById('role-edit-role');
  const roleFieldsContainer     = document.getElementById('role-edit-fields');
  const roleInputDisplayR       = document.getElementById('role-edit-displayRolle');
  const roleInputDisplayN       = document.getElementById('role-edit-displayName');
  const roleTextareaText        = document.getElementById('role-edit-promptText');
  const roleDeleteBtn           = document.getElementById('role-delete-prompt-btn');
  const roleCreateForm          = document.getElementById('role-prompt-create-form');
  const roleInputNewRole        = document.getElementById('role-create-role');
  const roleInputNewDisplayR    = document.getElementById('role-create-displayRolle');
  const roleInputNewDisplayN    = document.getElementById('role-create-displayName');
  const roleTextareaNew         = document.getElementById('role-create-promptText');
  const showRoleCreateBtn       = document.getElementById('show-role-create-btn');
  const roleCreateWarning       = document.getElementById('role-create-warning');
  const sysContainer            = document.getElementById('system-prompts-container');
  const sysFormEdit             = document.getElementById('system-prompt-edit-form');
  const sysFieldsContainer      = document.getElementById('system-edit-fields');
  const sysEditBtn              = document.getElementById('system-edit-btn');
  const sysTextareaText         = document.getElementById('system-edit-promptText');
  const modal                   = document.getElementById('confirm-modal');
  const modalText               = document.getElementById('confirm-text');
  const btnYes                  = document.getElementById('confirm-yes');
  const btnNo                   = document.getElementById('confirm-no');
  const introTriggerAdmin       = document.getElementById('admin-intro-toggle-trigger');
  const introSectionAdmin       = document.getElementById('admin-intro-toggle-section');
  const systemPromptTrigger = document.getElementById('admin-system-prompt-trigger');
  const systemPromptSection = document.getElementById('admin-system-prompt-toggle-section');
  const rolePromptTrigger = document.getElementById('admin-role-prompt-trigger');
  const rolePromptSection = document.getElementById('admin-role-prompt-toggle-section');
  const patientPromptTrigger = document.getElementById('admin-patient-prompt-trigger');
  const patientPromptSection = document.getElementById('admin-patient-prompt-toggle-section');
  const adminSessionSelect = document.getElementById('admin-session-select');
  const adminGroupSelect = document.getElementById('admin-group-select');
  const adminChatSelect = document.getElementById('admin-chat-select');
  const adminChatbox = document.getElementById('admin-chatbox');
  const closeBtn = document.getElementById('close-chat-btn');
  const downloadBtn = document.getElementById('download-chat-btn');
  const activePatientSelect = document.getElementById('active-patient-select');
  const activePatientForm = document.getElementById('set-active-patient-form');
  const activePatientFeedback = document.getElementById('active-patient-feedback');
  const mainPageBtn = document.getElementById('main-page-btn');
  const logo = document.querySelector('.site-logo');
  const feedbackContainer = document.getElementById('feedback-container');
  const sessionForm = document.getElementById('chat-session-form');
  const jahrInput = document.getElementById('session-jahr');
  const quartalSelect = document.getElementById('session-quartal');
  const sessionFeedback = document.getElementById('session-feedback');
  const sessionLabel = document.getElementById('current-session-label');
  const patientLabel = document.getElementById('current-patient-label');
  const patientListContainer = document.getElementById('patient-list-container');
  const patientEditForm = document.getElementById('patient-edit-form');
  const patientCreateForm = document.getElementById('patient-create-form');
  const deletePatientBtn = document.getElementById('patient-delete-btn');
  const patientSelect = document.getElementById('edit-patient-select');
  const showPatientCreateBtn = document.getElementById('show-patient-create-btn');
  const patientCreateWarning = document.getElementById('patient-create-warning');
  const fieldId = document.getElementById('edit-patient-id');
  const fieldName = document.getElementById('edit-patient-name');
  const fieldHintergrund = document.getElementById('edit-patient-hintergrund');
  const fieldArztbrief = document.getElementById('edit-patient-arztbrief');
  const fieldLabor = document.getElementById('edit-patient-laborbericht');
  const fieldUeberleitung = document.getElementById('edit-patient-ueberleitungsbogen');

  let adminCurrentSessionId = null;
  let adminCurrentGroupId = null;
  let adminCurrentChatId = null;
  let rolePromptsData = [];
  let systemPromptsData = [];
  let adminCurrentSessionJahr = null;
  let adminCurrentSessionQuartal = null;
  let adminCurrentGroupName = null;

  

/* ===============================================
   2. Hilfsfunktionen
   =============================================== */

//Darstellung Bestätigungsabfrage
function showConfirm(message) {
  return new Promise(resolve => {
    modalText.textContent = message;
    modal.classList.remove('hidden');
    btnYes.onclick = () => { modal.classList.add('hidden'); resolve(true); };
    btnNo.onclick  = () => { modal.classList.add('hidden'); resolve(false); };
  });
}
  
//Einführungstext anzeigen
if (introTriggerAdmin && introSectionAdmin) {
  introTriggerAdmin.style.cursor = 'pointer';
  introSectionAdmin.style.cursor = 'pointer';
  introTriggerAdmin.addEventListener('click', () => {
    introSectionAdmin.classList.toggle('hidden');
  });
  introSectionAdmin.addEventListener('click', () => {
    introSectionAdmin.classList.toggle('hidden');
  });
}

// Template-Text SystemPrompt anzeigen
if (systemPromptTrigger && systemPromptSection) {
  systemPromptTrigger.style.cursor = 'pointer';
  systemPromptSection.style.cursor = 'pointer';
  systemPromptTrigger.addEventListener('click', () => {
    systemPromptSection.classList.toggle('hidden');
  });
  systemPromptSection.addEventListener('click', () => {
    systemPromptSection.classList.toggle('hidden');
  });
}

// Template-Text RollenPrompt anzeigen
if (rolePromptTrigger && rolePromptSection) {
  rolePromptTrigger.style.cursor = 'pointer';
  rolePromptSection.style.cursor = 'pointer';
  rolePromptTrigger.addEventListener('click', () => {
    rolePromptSection.classList.toggle('hidden');
  });
  rolePromptSection.addEventListener('click', () => {
    rolePromptSection.classList.toggle('hidden');
  });
}

// Template-Text PatientenPrompt anzeigen
if (patientPromptTrigger && patientPromptSection) {
  patientPromptTrigger.style.cursor = 'pointer';
  patientPromptSection.style.cursor = 'pointer';
  patientPromptTrigger.addEventListener('click', () => {
    patientPromptSection.classList.toggle('hidden');
  });
  patientPromptSection.addEventListener('click', () => {
    patientPromptSection.classList.toggle('hidden');
  });
}

// Darstellung von Benachrichtigungen
function showNotification(message, type = 'info') {
  const container = document.getElementById('notification-container');
  if (!container) return;
  const note = document.createElement('div'); note.className = `notification ${type}`;
  note.textContent = message; container.appendChild(note);
  setTimeout(() => { note.style.opacity = '0'; note.style.transition = 'opacity 0.5s';
    setTimeout(() => container.removeChild(note), 500);
  }, 3000);
}

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

// Darstellung Nutzereingaben in HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Hilfsfunktion zur Formatierung von Text mit Zeilenumbrüchen
function formatText(text) {
  if (!text) return '<em>– leer –</em>';
  return escapeHtml(text).replace(/\n/g, '<br>');
}




/* ===============================================
   3. Funktionen zum Setzen der aktiven Session / aktiven Patienten
   =============================================== */


// Laden des derzeit aktiven Patienten
async function loadActivePatientSelect() {
  const res = await fetch('/api/patients');
  const data = await res.json();
  activePatientSelect.innerHTML = '<option value="" disabled selected>– Patient auswählen –</option>';
  data.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.name;
    activePatientSelect.appendChild(opt);
  });

  const activeRes = await fetch('/api/patients/active');
  if (activeRes.ok) {
    const active = await activeRes.json();
    if (active?.id) {
      activePatientSelect.value = active.id;
    }
  }
}

// Listener für Auswahl des aktiven Patienten
activePatientForm.addEventListener('submit', async e => {
  e.preventDefault();
  const patientId = activePatientSelect.value;
  activePatientFeedback.textContent = '';
  if (!patientId) {
    activePatientFeedback.textContent = 'Bitte wähle einen Patienten aus.';
    return;
  }

  try {
    const res = await fetch('/api/patients/active', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId: parseInt(patientId, 10) })
    });

    if (res.ok) {
      showNotification('Aktiver Patient gesetzt!', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 1000);  
    } else {
      activePatientFeedback.textContent = 'Fehler beim Setzen.';
    }
  } catch (err) {
    console.error(err);
    activePatientFeedback.textContent = 'Netzwerkfehler.';
  }
});

// Listener zum Starten neuer Sessions
sessionForm?.addEventListener('submit', async e => {
  e.preventDefault();

  const jahrText = jahrInput.value.trim();
  const quartal = quartalSelect.value;
  const jahr = parseInt(jahrText, 10);

  sessionFeedback.textContent = '';
  sessionFeedback.style.color = 'red';

  if (!jahrText || !quartal) {
    sessionFeedback.textContent = 'Bitte Jahr und Quartal angeben.';
    return;
  }

  if (!/^(20\d{2})$/.test(jahrText)) {
    sessionFeedback.textContent = 'Bitte ein gültiges Jahr im Format 20xx eingeben.';
    return;
  }

  try {
    const res = await fetch('/api/chatSessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jahr, quartal })
    });

    if (res.ok) {
      const data = await res.json();
      sessionFeedback.style.color = 'green';
      sessionFeedback.textContent = `Session ${quartal}-${jahr} gestartet.`;
      jahrInput.value = '';
      quartalSelect.value = '';
      loadActiveSession();
    } else {
      sessionFeedback.textContent = 'Fehler beim Erstellen.';
    }
  } catch (err) {
    sessionFeedback.textContent = 'Netzwerkfehler.';
  }
});

// Aktive Session und Patienten laden
async function loadActiveSession() {
  try {
    const res = await fetch('/api/chatSessions/active');
    if (res.ok) {
      const session = await res.json();
      if (session?.id) {
        sessionLabel.textContent = `${session.quartal}-${session.jahr}`;
      } else {
        sessionLabel.textContent = '(keine aktive Session)';
      }
    } else {
      sessionLabel.textContent = '(nicht verfügbar)';
    }
  } catch (err) {
    console.error('Fehler beim Laden der aktiven Session:', err);
    sessionLabel.textContent = '(Ladefehler)';
  }

  try {
    const pRes = await fetch('/api/patients/active');
    if (pRes.ok) {
      const patient = await pRes.json();
      if (patient?.id) {
        patientLabel.textContent = patient.name;
      } else {
        patientLabel.textContent = '(kein Patient aktiv)';
      }
    } else {
      patientLabel.textContent = '(nicht verfügbar)';
    }
  } catch (err) {
    console.error('Fehler beim Laden des aktiven Patienten:', err);
    patientLabel.textContent = '(Ladefehler)';
  }
}
  

/* ===============================================
   4. Anzeige Chatverläufe
   =============================================== */


// Alle vorhandenen Sessions laden
async function loadAllSessions() {
  const res = await fetch('/api/chatSessions');
  const sessions = await res.json();

  adminSessionSelect.innerHTML = '<option value="" disabled selected>– Session auswählen –</option>';
  sessions.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = `${s.quartal}-${s.jahr}`;
    adminSessionSelect.appendChild(opt);
  });
}

// Listener für Auswahl ChatSession
adminSessionSelect?.addEventListener('change', async () => {
  adminCurrentSessionId = adminSessionSelect.value;
  const res = await fetch(`/api/chatSessions/${adminCurrentSessionId}/gruppen`);
  const gruppen = await res.json();
  const selectedOption = adminSessionSelect.options[adminSessionSelect.selectedIndex];
  const [quartal, jahr] = selectedOption.textContent.split('-');
  adminCurrentSessionJahr = jahr;
  adminCurrentSessionQuartal = quartal;

  adminGroupSelect.innerHTML = '<option value="" disabled selected>– Gruppe wählen –</option>';
  adminChatSelect.innerHTML = '<option value="" disabled selected>– Chat auswählen –</option>';
  adminChatbox.innerHTML = '';

  gruppen.forEach(g => {
    const opt = document.createElement('option');
    opt.value = g.groupId;
    opt.textContent = g.name;
    adminGroupSelect.appendChild(opt);
  });
});

// Laden der Gruppen nach Session
async function loadAdminSessionAndGroups() {
  const sessionRes = await fetch('/api/chatSessions/active');
  const session = await sessionRes.json();
  adminSessionDisplay.textContent = session ? `${session.quartal}-${session.jahr}` : '(keine aktive Session)';
  if (!session?.id) return;

  adminCurrentSessionId = session.id;
  const groupsRes = await fetch(`/api/chatSessions/${adminCurrentSessionId}/gruppen`);
  const gruppen = await groupsRes.json();

  adminGroupSelect.innerHTML = '<option value="" disabled selected>– Gruppe wählen –</option>';
  gruppen.forEach(g => {
    const opt = document.createElement('option');
    opt.value = g.groupId || g.id;
    opt.textContent = g.name;
    adminGroupSelect.appendChild(opt);
  });
}
// Laden der Chats nach Gruppe / Session
async function loadAdminChats(groupId) {
  const res = await fetch(`/api/chatSessions/group/${groupId}/chats`);
  const chats = await res.json();
  adminChatSelect.innerHTML = '<option value="" disabled selected>– Chat auswählen –</option>';
  chats.forEach(chat => {
    const opt = document.createElement('option');
    opt.value = chat.id;
    opt.textContent = formatTimestamp(chat.createdAt);
    adminChatSelect.appendChild(opt);
  });
}
// Listener für Auswahl der Gruppe
  adminGroupSelect?.addEventListener('change', async () => {
    adminCurrentGroupId = adminGroupSelect.value;
    await loadAdminChats(adminCurrentGroupId);
    adminChatbox.innerHTML = '';
    const selectedGroup = adminGroupSelect.options[adminGroupSelect.selectedIndex];
    adminCurrentGroupName = selectedGroup.textContent;
});

// Listener für Auswahl des Chats
adminChatSelect?.addEventListener('change', async () => {
  const chatId = adminChatSelect.value;
  const chatSection = document.getElementById('admin-chat-section');

  if (chatId) {
    adminCurrentChatId = chatId;
    adminChatbox.classList.remove('hidden');
    chatSection?.classList.remove('hidden'); 
    await loadAdminChatById(chatId);
  } else {
    chatSection?.classList.add('hidden');
    adminChatbox.innerHTML = '';
  }
});

// Laden der Chats nach ID
async function loadAdminChatById(chatId) {
  adminChatbox.innerHTML = '';
  try {
    const res = await fetch(`/api/chatSessions/chat/${chatId}`);
    const { messages } = await res.json();
    messages.forEach(m =>
      m.sender === 'system'
        ? renderSystemNotice(m.text)
        : renderAdminMessage(m.text, m.sender, m.role)
    );
  } catch (err) {
    adminChatbox.innerHTML = '<p style="color:red;">Fehler beim Laden des Chats</p>';
  }
}

// Laden von Systemnachrichten
function renderSystemNotice(text) {
  const div = document.createElement('div');
  div.className = 'chat-system-message';
  div.innerHTML = `<div class="system-text">${text.replace(/\n/g, '<br>')}</div>`;
  adminChatbox.appendChild(div);
}

// Chatverläufe in Chatbox anzeigen
function renderAdminMessage(text, sender, roleKey = null) {
  const msgEl = document.createElement('div');
  msgEl.classList.add('chat-message', sender);

  let label = 'Fachperson';
  if (sender === 'user') {
    label = 'Student:in';
  } else if (roleKey) {
    const found = rolePromptsData.find(r => r.role === roleKey);
    if (found) {
      label = `${found.displayRolle} ${found.displayName}`;
    }
  }

  msgEl.innerHTML = `
    <div class="message-header">${label}</div>
    <div class="message-body">${text.replace(/\n/g, '<br>')}</div>
  `;
  adminChatbox.appendChild(msgEl);
  adminChatbox.scrollTop = adminChatbox.scrollHeight;
}

// Listener für Button zum Ausblenden der Chatverläufe
if (closeBtn) {
  closeBtn.addEventListener('click', () => {
    const chatSection = document.getElementById('admin-chat-section');
    if (chatSection) chatSection.classList.add('hidden');
    adminChatSelect.value = ''; // Auswahl zurücksetzen (optional)
    adminChatbox.innerHTML = ''; // Chat leeren
  });
}

// Funktion zum Herunterladen von Chatverläufen
function downloadChatAsText(messages, rolePromptsData, filename = 'chatverlauf.txt') {
  const lines = messages.map(m => {
    if (m.sender === 'system') {
      return `System: ${m.text}`;
    }

    let sender = 'Student:in';
    if (m.sender === 'bot') {
      const roleObj = rolePromptsData.find(r => r.role === m.role);
      const displayRolle = roleObj?.displayRolle || m.role || 'Fachperson';
      const displayName = roleObj?.displayName || '';
      sender = `${displayRolle}${displayName ? ' – ' + displayName : ''}`;
    }

    return `${sender}: ${m.text}`;
  });

  const textContent = lines.join('\n\n');
  const blob = new Blob([textContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute("href", url);
  dlAnchor.setAttribute("download", filename);
  document.body.appendChild(dlAnchor);
  dlAnchor.click();
  dlAnchor.remove();

  URL.revokeObjectURL(url);
}

// Listener für Download-Button
downloadBtn.addEventListener('click', async () => {
  if (!adminCurrentChatId) return;

  try {
    const res = await fetch(`/api/chatSessions/chat/${adminCurrentChatId}`);
    const { messages } = await res.json();
    const filename = `Chatverlauf_${adminCurrentSessionJahr}_${adminCurrentSessionQuartal}_${adminCurrentGroupName.replace(/\s+/g, '')}.txt`;
    downloadChatAsText(messages, rolePromptsData, filename);

  } catch (err) {
    console.error('Download fehlgeschlagen:', err);
    showNotification('Fehler beim Herunterladen', 'error');
  }
});

  
/* ===============================================
   5. Verwaltung Rollen-Prompts
   =============================================== */
  

// Laden der Rollen-Prompts
function renderRolePrompts() {
  roleContainer.innerHTML = '';
  rolePromptsData.forEach(item => {
    const box = document.createElement('div');
    box.className = 'prompt';
    box.innerHTML = `
      <h3>${item.displayRolle}</h3>
      <h4>${item.displayName}</h4>
      <p class="prompt-text">${item.promptText}</p>
    `;
    box.addEventListener('click', () => {
      box.classList.toggle('expanded');
    });
    roleContainer.appendChild(box);
  });
}

// Befüllen DropDown zur Auswahl der Rollen-Prompts
function populateRoleSelect() {
  roleSelect.innerHTML = '';
  const ph = document.createElement('option');
  ph.value = ''; ph.textContent = '– Rolle auswählen –'; ph.disabled = true; ph.selected = true;
  roleSelect.appendChild(ph);
  rolePromptsData.forEach(item => {
    const opt = document.createElement('option'); opt.value = item.id;
    opt.textContent = `${item.displayRolle} – ${item.displayName}`;
    roleSelect.appendChild(opt);
  });
  roleInputDisplayR.value = ''; roleInputDisplayN.value = ''; roleTextareaText.value = '';
}

// Listener für Auswahl des Rollen-Prompts
roleSelect.addEventListener('change', () => {
  roleFieldsContainer.classList.remove('fields-collapsed');
  const selectedId = parseInt(roleSelect.value, 10);
  const item = rolePromptsData.find(p => p.id === selectedId);
  roleInputDisplayR.value = item.displayRolle;
  roleInputDisplayN.value = item.displayName;
  roleTextareaText.value  = item.promptText;
});

// Listener für Formular zur Bearbeitung von Rollen-Prompts
roleForm.addEventListener('submit', async e => {
  e.preventDefault();

  const selectedId = parseInt(roleSelect.value, 10);

  const updated = {
    displayRolle: roleInputDisplayR.value.trim(),
    displayName: roleInputDisplayN.value.trim(),
    promptText: roleTextareaText.value.trim()
  };

  try {
    await fetch(`/api/rolePrompts/${selectedId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });

    Object.assign(rolePromptsData.find(p => p.id === selectedId), updated);
    showNotification('Rollen-Prompt gespeichert!', 'success');
    setTimeout(() => {
      window.location.reload();
    }, 1000);  
  } catch (err) {
    console.error(err);
    showNotification('Fehler beim Speichern!', 'error');
  }

  renderRolePrompts();
  populateRoleSelect();
  roleFieldsContainer.classList.add('fields-collapsed');
});

// Listener für Button zum Löschen von Rollen-Prompts
roleDeleteBtn.addEventListener('click', async () => {
  const role = roleSelect.value;
  if(!role) { showNotification('Bitte auswählen!', 'error'); return; }
  if(!(await showConfirm('Prompt wirklich löschen?'))) return;
  try {
    const selectedId = parseInt(roleSelect.value, 10);
    await fetch(`/api/rolePrompts/${selectedId}`, { method: 'DELETE' });
    rolePromptsData = rolePromptsData.filter(p => p.id !== selectedId);
    showNotification('Rollen-Prompt gelöscht!', 'success');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } catch(err) { console.error(err); showNotification('Fehler beim Löschen!', 'error'); }
  renderRolePrompts(); populateRoleSelect(); roleFieldsContainer.classList.add('fields-collapsed');
});

// Darstellung Erstellen-Menü für Rollen-Prompts
showRoleCreateBtn?.addEventListener('click', () => {
  const isVisible = !roleCreateForm.classList.contains('fields-collapsed');
  const values = [
    roleInputNewRole.value,
    roleInputNewDisplayR.value,
    roleInputNewDisplayN.value,
    roleTextareaNew.value
  ];
  const isFilled = values.some(v => v.trim() !== '');

  if (isVisible && isFilled) {
    roleCreateWarning.textContent = 'Die Eingabefelder sind nicht leer.';
    roleCreateWarning.classList.remove('hidden');
    return;
  }

  roleCreateWarning.classList.add('hidden');
  roleCreateForm.classList.toggle('fields-collapsed');
  showRoleCreateBtn.textContent = roleCreateForm.classList.contains('fields-collapsed')
    ? 'Rolle erstellen'
    : 'Erstellen ausblenden';
});

// Listener für Formular zum Erstellen von Rollen-Prompts
roleCreateForm.addEventListener('submit', async e => {
  e.preventDefault();
  const base = roleInputNewRole.value.trim();
  const displayR = roleInputNewDisplayR.value.trim();
  const displayN = roleInputNewDisplayN.value.trim();
  const text = roleTextareaNew.value.trim();
  if(!base||!displayR||!displayN||!text) { showNotification('Alle Felder ausfüllen!', 'error'); return; }
  let key = base, i=1;
  while(rolePromptsData.some(p=>p.role===key)) key = `${base}${i++}`;
  const newItem = { role:key, displayRolle:displayR, displayName:displayN, promptText:text };
  try {
    await fetch('/api/rolePrompts', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify([newItem]) });
    rolePromptsData.push(newItem);
    showNotification('Neue Rolle erstellt!', 'success');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } catch(err) { console.error(err); showNotification('Fehler beim Erstellen!', 'error'); }
  renderRolePrompts(); populateRoleSelect(); roleCreateForm.reset();
});



/* ===============================================
   5. Verwaltung System-Prompts
   =============================================== */

// Laden der System-Prompts
function renderSystemPrompts() {
  sysContainer.innerHTML = '';
  systemPromptsData.forEach(item => {
    const box = document.createElement('div');
    box.className = 'prompt';

    const hint = document.createElement('p');
    hint.className = 'toggle-hint';
    hint.textContent = 'Klicke hier, um den vollständigen System-Prompt anzuzeigen';

    const text = document.createElement('p');
    text.className = 'prompt-text';
    text.textContent = item.promptText;

    box.appendChild(hint);
    box.appendChild(text);

    box.addEventListener('click', () => {
      const isExpanded = box.classList.toggle('expanded');
      hint.style.display = isExpanded ? 'none' : '';
    });

    sysContainer.appendChild(box);
  });
}

  sysEditBtn.addEventListener('click', () => {
  if (!systemPromptsData.length) return;
  const item = systemPromptsData[0];
  sysTextareaText.value = item.promptText;
  sysFieldsContainer.classList.remove('fields-collapsed');
});

// Listener Formular zum Bearbeiten von System-Prompts
sysFormEdit.addEventListener('submit', async e => {
  e.preventDefault();
  const body = {
    name: systemPromptsData[0].name,
    promptText: sysTextareaText.value.trim()
  };
  try {
    await fetch('/api/systemPrompts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    Object.assign(systemPromptsData[0], body);
    showNotification('System-Prompt gespeichert!', 'success');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } catch (err) {
    console.error(err);
    showNotification('Fehler beim Speichern!', 'error');
  }
  renderSystemPrompts();
  sysFieldsContainer.classList.add('fields-collapsed');
});


/* ===============================================
   5. Verwaltung Patienten
   =============================================== */

// Laden der Patienten
async function loadPatients() {
  const res = await fetch('/api/patients');
  const data = await res.json();

  if (patientSelect) {
    patientSelect.innerHTML = '<option value="" disabled selected>– Patient auswählen –</option>';
    data.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.name}`;
      patientSelect.appendChild(opt);
    });
  }

  if (patientListContainer) {
    patientListContainer.innerHTML = '';
    data.forEach(p => {
      const div = document.createElement('div');
      div.className = 'prompt';
      div.innerHTML = `
        <h4>${p.name}</h4>
        <p class="prompt-text">
          <strong>Hintergrund:</strong><br/>${formatText(p.hintergrund)}
          <br/><br/><strong>Arztbrief:</strong><br/>${formatText(p.arztbrief)}
          <br/><br/><strong>Laborbericht:</strong><br/>${formatText(p.laborbericht)}
          <br/><br/><strong>Überleitungsbogen:</strong><br/>${formatText(p.ueberleitungsbogen)}
        </p>
      `;

      const text = div.querySelector('.prompt-text');
      text.style.display = 'none';

      div.addEventListener('click', () => {
        const isOpen = div.classList.toggle('expanded');
        text.style.display = isOpen ? 'block' : 'none';
      });

      patientListContainer.appendChild(div);
    });
  }
}

// Listener Auswahl Patienten
patientSelect?.addEventListener('change', async () => {
  const id = patientSelect.value;
  if (!id) return;

  const res = await fetch(`/api/patients/${id}`);
  const p = await res.json();

  fieldId.value = p.id;
  fieldName.value = p.name;
  fieldHintergrund.value = p.hintergrund || '';
  fieldArztbrief.value = p.arztbrief || '';
  fieldLabor.value = p.laborbericht || '';
  fieldUeberleitung.value = p.ueberleitungsbogen || '';

  patientEditForm.classList.remove('fields-collapsed');
});

// Listener Formular zum Speichern von Patienten
patientEditForm.addEventListener('submit', async e => {
  e.preventDefault();
  const id = fieldId.value;
  const body = {
    name: fieldName.value,
    hintergrund: fieldHintergrund.value,
    arztbrief: fieldArztbrief.value,
    laborbericht: fieldLabor.value,
    ueberleitungsbogen: fieldUeberleitung.value
  };
  const res = await fetch(`/api/patients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (res.ok) {
    showNotification('Patient gespeichert', 'success');
    await loadPatients();
    patientEditForm.reset();
    patientEditForm.classList.add('fields-collapsed');
    patientSelect.value = '';
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } else {
    showNotification('Fehler beim Speichern', 'error');
  }
});

// Listener Button zum Löschen von Patienten
deletePatientBtn.addEventListener('click', async () => {
  const id = fieldId.value;
  if (!id || !(await showConfirm('Patient wirklich löschen?'))) return;
  const res = await fetch(`/api/patients/${id}`, { method: 'DELETE' });
  if (res.ok) {
    showNotification('Patient gelöscht', 'success');
    await loadPatients();
    patientEditForm.reset();
    patientEditForm.classList.add('fields-collapsed');
    patientSelect.value = '';
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } else {
    showNotification('Fehler beim Löschen', 'error');
  }
});

//Anzeige Erstellungsformular
showPatientCreateBtn?.addEventListener('click', () => {
  const isVisible = !patientCreateForm.classList.contains('fields-collapsed');
  const values = [
    document.getElementById('new-patient-name').value,
    document.getElementById('new-patient-hintergrund').value,
    document.getElementById('new-patient-arztbrief').value,
    document.getElementById('new-patient-laborbericht').value,
    document.getElementById('new-patient-ueberleitungsbogen').value
  ];
  const isFilled = values.some(v => v.trim() !== '');

  if (isVisible && isFilled) {
    patientCreateWarning.textContent = 'Die Eingabefelder sind nicht leer.';
    patientCreateWarning.classList.remove('hidden');
    return;
  }

  patientCreateWarning.classList.add('hidden');
  patientCreateForm.classList.toggle('fields-collapsed');
  showPatientCreateBtn.textContent = patientCreateForm.classList.contains('fields-collapsed')
    ? 'Patient erstellen'
    : 'Erstellen ausblenden';
});

// Listener Formular zum Erstellen eines Patienten
patientCreateForm.addEventListener('submit', async e => {
  e.preventDefault();
  const body = {
    name: document.getElementById('new-patient-name').value,
    hintergrund: document.getElementById('new-patient-hintergrund').value,
    arztbrief: document.getElementById('new-patient-arztbrief').value,
    laborbericht: document.getElementById('new-patient-laborbericht').value,
    ueberleitungsbogen: document.getElementById('new-patient-ueberleitungsbogen').value
  };
  const res = await fetch('/api/patients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (res.ok) {
    showNotification('Neuer Patient erstellt', 'success');
    patientCreateForm.reset();
    await loadPatients();
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } else {
    showNotification('Fehler beim Erstellen', 'error');
  }
});



/* ===============================================
   6. Anzeige von Fehlermeldungen
   =============================================== */

// Feedback anzeigen und verwalten
async function loadFeedback() {
  feedbackContainer.innerHTML = `
    <div id="feedback-new">
      <h3>Neue Rückmeldungen</h3>
      <div class="feedback-group"></div>
    </div>
    <div id="feedback-old">
      <h3>Gesehene Rückmeldungen</h3>
      <div class="feedback-group"></div>
    </div>
  `;

  const newGroup = feedbackContainer.querySelector('#feedback-new .feedback-group');
  const oldGroup = feedbackContainer.querySelector('#feedback-old .feedback-group');

  let hasNew = false;
  let hasOld = false;

  try {
    const res = await fetch('/api/feedback');
    const feedbackList = await res.json();

    feedbackList.forEach(item => {
      const box = document.createElement('div');
      box.className = 'fehler-item';

      box.innerHTML = `
        <div class="fehler-content">
          <span class="fehler-number">${formatTimestamp(item.timestamp)}:</span>
          <span class="fehler-text">${escapeHtml(item.comment)}</span>
          <span class="anmerkung-text">${escapeHtml(item.chatProof || '(kein Chatbezug)')}</span>
        </div>
      `;

      if (item.status === 'new') {
        const seenBtn = document.createElement('button');
        seenBtn.textContent = 'Gesehen';
        seenBtn.className = 'fehler-seen-button';
        seenBtn.onclick = async () => {
          await fetch(`/api/feedback/${item.id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'old' })
          });
          showNotification('Feedback als "gesehen" markiert.', 'success');
          loadFeedback();
        };
        box.appendChild(seenBtn);
        hasNew = true;
        newGroup.appendChild(box);
      } else {
        hasOld = true;
        oldGroup.appendChild(box);
      }

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Löschen';
      deleteBtn.className = 'fehler-loeschen-button';
      deleteBtn.dataset.id = item.id;
      deleteBtn.onclick = async () => {
        try {
          const res = await fetch(`/api/feedback/${item.id}`, { method: 'DELETE' });
          if (res.ok) {
            showNotification('Feedback gelöscht!', 'success');
            loadFeedback();
          } else {
            showNotification('Löschen fehlgeschlagen.', 'error');
          }
        } catch (err) {
          console.error(err);
          showNotification('Netzwerkfehler beim Löschen.', 'error');
        }
      };
      box.appendChild(deleteBtn);
    });

    if (!hasNew) {
      const msg = document.createElement('div');
      msg.className = 'fehler-item';
      msg.innerHTML = `
        <div class="fehler-content">
          <span class="fehler-text" style="font-style: italic; color: #666;">
            Keine neuen Rückmeldungen.
          </span>
        </div>
      `;
      newGroup.appendChild(msg);
    }

    if (!hasOld) {
      const msg = document.createElement('div');
      msg.className = 'fehler-item';
      msg.innerHTML = `
        <div class="fehler-content">
          <span class="fehler-text" style="font-style: italic; color: #666;">
            Keine alten Rückmeldungen.
          </span>
        </div>
      `;
      oldGroup.appendChild(msg);
    }

  } catch (err) {
    console.error('Fehler beim Laden der Feedbacks:', err);
    feedbackContainer.innerHTML = '<p style="color:red;">Fehler beim Laden der Rückmeldungen.</p>';
  }
}



/* ===============================================
   7. Navigation
   =============================================== */

// Funktion zum Ausloggen
function redirectToStudentPage() {
  fetch('/logout', { method: 'POST' })
    .catch(err => console.error('Logout fehlgeschlagen', err))
    .finally(() => window.location.href = 'student.html');
}

// Listener für Button zur Navigation zur Hauptseite
if (mainPageBtn) {
  mainPageBtn.addEventListener('click', redirectToStudentPage);
}

if (logo) {
  logo.style.cursor = 'pointer';
  logo.addEventListener('click', redirectToStudentPage);
}



/* ===============================================
   8. Initialisierung
   =============================================== */

  

document.addEventListener('DOMContentLoaded', async () => {
  // Verwaltung aktive Sessions / Patienten
  await loadActivePatientSelect();
  loadActiveSession();

  // Verwaltung Chatverläufe
  adminChatbox.classList.add('hidden');
  await loadAllSessions();

  // Verwaltung Rollen-Prompts
  roleFieldsContainer.classList.add('fields-collapsed');
  fetch('/api/rolePrompts')
    .then(res => res.ok ? res.json() : Promise.reject(res.status))
    .then(data => { rolePromptsData = data; renderRolePrompts(); populateRoleSelect(); })
    .catch(err => { console.error('Fehler beim Laden der Rollen-Prompts:', err); roleContainer.innerHTML = '<p>Fehler beim Laden.</p>'; });

  // Verwaltung System-Prompts
  sysFieldsContainer.classList.add('fields-collapsed');
  fetch('/api/systemPrompts')
    .then(res => res.ok ? res.json() : Promise.reject(res.status))
    .then(data => { systemPromptsData = data; renderSystemPrompts(); })
    .catch(err => { console.error('Fehler beim Laden System-Prompts:', err); sysContainer.innerHTML = '<p>Fehler beim Laden.</p>'; });

  // Patienten-Verwaltung
  await loadPatients();

  // Feedback-Verwaltung
  loadFeedback();
});

