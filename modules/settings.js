window.WhatsAppAgentSettings = {
  async getProfiles() {
    const result = await chrome.storage.sync.get(['profiles']);
    return result.profiles || [];
  },
  
  async getActiveProfile() {
    const result = await chrome.storage.sync.get(['activeProfileId']);
    if (!result.activeProfileId) return null;
    const profiles = await this.getProfiles();
    return profiles.find(p => p.id === result.activeProfileId) || null;
  },
  
  async getSettings() {
    const result = await chrome.storage.sync.get(['displayMode']);
    return { displayMode: result.displayMode || 'label' };
  }
};
