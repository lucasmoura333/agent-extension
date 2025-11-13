let profiles = [];
let activeProfileId = null;

async function loadProfiles() {
  const result = await chrome.storage.sync.get(['profiles', 'activeProfileId']);
  profiles = result.profiles || [];
  activeProfileId = result.activeProfileId || null;
  renderProfiles();
}

function renderProfiles() {
  const container = document.getElementById('profiles');
  container.innerHTML = '';
  profiles.forEach(p => {
    const div = document.createElement('div');
    div.className = 'profile' + (p.id === activeProfileId ? ' active' : '');
    div.textContent = p.profileName + (p.subtitle ? ' - ' + p.subtitle : '');
    div.onclick = () => activateProfile(p.id);
    container.appendChild(div);
  });
}

async function activateProfile(id) {
  activeProfileId = id;
  await chrome.storage.sync.set({ activeProfileId: id });
  const [tab] = await chrome.tabs.query({ active: true, url: 'https://web.whatsapp.com/*' });
  if (tab) {
    chrome.tabs.sendMessage(tab.id, { action: 'updateProfile' });
  }
  loadProfiles();
}

document.getElementById('add').onclick = () => {
  document.getElementById('form').style.display = 'block';
};

document.getElementById('cancel').onclick = () => {
  document.getElementById('form').style.display = 'none';
  document.getElementById('name').value = '';
  document.getElementById('subtitle').value = '';
};

document.getElementById('save').onclick = async () => {
  const name = document.getElementById('name').value.trim();
  if (!name) return;
  
  const profile = {
    id: Date.now().toString(36),
    profileName: name,
    subtitle: document.getElementById('subtitle').value.trim()
  };
  
  profiles.push(profile);
  await chrome.storage.sync.set({ profiles });
  document.getElementById('form').style.display = 'none';
  document.getElementById('name').value = '';
  document.getElementById('subtitle').value = '';
  loadProfiles();
};

loadProfiles();
