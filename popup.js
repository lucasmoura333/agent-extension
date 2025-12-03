let profiles = [];
let activeProfileId = null;
let editingProfileId = null;

// ============ INITIALIZATION ============
async function init() {
  await loadProfiles();
  updateStatus();
  bindEvents();
}

async function loadProfiles() {
  const result = await chrome.storage.sync.get(['profiles', 'activeProfileId']);
  profiles = result.profiles || [];
  activeProfileId = result.activeProfileId || null;
  renderProfiles();
  updateStatus();
}

// ============ RENDERING ============
function renderProfiles() {
  const container = document.getElementById('profiles');
  
  if (profiles.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">📋</div>
        <div>Nenhum perfil criado</div>
        <div style="font-size: 12px; margin-top: 5px;">Clique em "Novo Perfil" para começar</div>
      </div>
    `;
    return;
  }
  
  container.innerHTML = profiles.map(p => `
    <div class="profile-card ${p.id === activeProfileId ? 'active' : ''}" data-id="${p.id}">
      <div class="profile-avatar">${getInitials(p.profileName)}</div>
      <div class="profile-info">
        <div class="profile-name">${escapeHtml(p.profileName)}</div>
        <div class="profile-subtitle">${p.subtitle ? escapeHtml(p.subtitle) : 'Sem subtítulo'}</div>
      </div>
      <div class="profile-actions">
        <button class="btn-icon btn-edit" data-action="edit" data-id="${p.id}" title="Editar">✏️</button>
        <button class="btn-icon btn-delete" data-action="delete" data-id="${p.id}" title="Remover">🗑️</button>
      </div>
    </div>
  `).join('');
}

function updateStatus() {
  const dot = document.getElementById('statusDot');
  const text = document.getElementById('statusText');
  const deactivateBtn = document.getElementById('deactivateBtn');
  
  if (activeProfileId) {
    const profile = profiles.find(p => p.id === activeProfileId);
    if (profile) {
      dot.className = 'status-dot active';
      text.textContent = `Ativo: ${profile.profileName}`;
      text.style.color = '#25D366';
      deactivateBtn.style.display = 'flex';
    } else {
      // Profile was deleted
      activeProfileId = null;
      chrome.storage.sync.set({ activeProfileId: null });
      updateStatus();
    }
  } else {
    dot.className = 'status-dot inactive';
    text.textContent = 'Extensão desativada';
    text.style.color = '#888';
    deactivateBtn.style.display = 'none';
  }
}

// ============ EVENT HANDLERS ============
function bindEvents() {
  // Add new profile
  document.getElementById('addBtn').addEventListener('click', () => {
    editingProfileId = null;
    document.getElementById('formTitle').textContent = 'Novo Perfil';
    document.getElementById('inputName').value = '';
    document.getElementById('inputSubtitle').value = '';
    document.getElementById('formOverlay').classList.add('show');
    document.getElementById('inputName').focus();
  });
  
  // Cancel form
  document.getElementById('cancelBtn').addEventListener('click', closeForm);
  
  // Close on overlay click
  document.getElementById('formOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'formOverlay') closeForm();
  });
  
  // Save profile
  document.getElementById('saveBtn').addEventListener('click', saveProfile);
  
  // Enter to save
  document.getElementById('inputName').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') saveProfile();
  });
  document.getElementById('inputSubtitle').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') saveProfile();
  });
  
  // Deactivate
  document.getElementById('deactivateBtn').addEventListener('click', deactivateExtension);
  
  // Profile card clicks (activate, edit, delete)
  document.getElementById('profiles').addEventListener('click', handleProfileClick);
}

async function handleProfileClick(e) {
  const action = e.target.dataset.action;
  const id = e.target.dataset.id;
  
  if (action === 'edit') {
    e.stopPropagation();
    editProfile(id);
    return;
  }
  
  if (action === 'delete') {
    e.stopPropagation();
    deleteProfile(id);
    return;
  }
  
  // Click on card = activate
  const card = e.target.closest('.profile-card');
  if (card) {
    const profileId = card.dataset.id;
    if (profileId !== activeProfileId) {
      await activateProfile(profileId);
    }
  }
}

// ============ PROFILE ACTIONS ============
async function activateProfile(id) {
  activeProfileId = id;
  await chrome.storage.sync.set({ activeProfileId: id });
  await notifyWhatsApp();
  renderProfiles();
  updateStatus();
}

async function deactivateExtension() {
  activeProfileId = null;
  await chrome.storage.sync.set({ activeProfileId: null });
  await notifyWhatsApp();
  renderProfiles();
  updateStatus();
}

function editProfile(id) {
  const profile = profiles.find(p => p.id === id);
  if (!profile) return;
  
  editingProfileId = id;
  document.getElementById('formTitle').textContent = 'Editar Perfil';
  document.getElementById('inputName').value = profile.profileName;
  document.getElementById('inputSubtitle').value = profile.subtitle || '';
  document.getElementById('formOverlay').classList.add('show');
  document.getElementById('inputName').focus();
}

async function deleteProfile(id) {
  const profile = profiles.find(p => p.id === id);
  if (!profile) return;
  
  if (!confirm(`Remover perfil "${profile.profileName}"?`)) return;
  
  profiles = profiles.filter(p => p.id !== id);
  
  // If deleting active profile, deactivate
  if (activeProfileId === id) {
    activeProfileId = null;
    await chrome.storage.sync.set({ activeProfileId: null });
  }
  
  await chrome.storage.sync.set({ profiles });
  await notifyWhatsApp();
  renderProfiles();
  updateStatus();
}

async function saveProfile() {
  const name = document.getElementById('inputName').value.trim();
  const subtitle = document.getElementById('inputSubtitle').value.trim();
  
  if (!name) {
    document.getElementById('inputName').style.borderColor = '#c62828';
    return;
  }
  
  if (editingProfileId) {
    // Editing existing profile
    const index = profiles.findIndex(p => p.id === editingProfileId);
    if (index !== -1) {
      profiles[index].profileName = name;
      profiles[index].subtitle = subtitle;
    }
  } else {
    // Creating new profile
    const profile = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      profileName: name,
      subtitle: subtitle
    };
    profiles.push(profile);
    
    // Auto-activate if first profile
    if (profiles.length === 1) {
      activeProfileId = profile.id;
      await chrome.storage.sync.set({ activeProfileId: profile.id });
    }
  }
  
  await chrome.storage.sync.set({ profiles });
  await notifyWhatsApp();
  closeForm();
  renderProfiles();
  updateStatus();
}

function closeForm() {
  document.getElementById('formOverlay').classList.remove('show');
  document.getElementById('inputName').style.borderColor = '#ddd';
  editingProfileId = null;
}

// ============ COMMUNICATION ============
async function notifyWhatsApp() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, url: 'https://web.whatsapp.com/*' });
    if (tab) {
      chrome.tabs.sendMessage(tab.id, { action: 'updateProfile' });
    }
  } catch (e) {
    // Tab might not be available
  }
}

// ============ UTILITIES ============
function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Start
init();
