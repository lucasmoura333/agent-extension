// WhatsApp Agent Identifier v3.0.0
// Author: Lucas Moura (github.com/lucasmoura333)
(function() {
  'use strict';

  const state = {
    activeProfile: null,
    displayMode: 'label',
    initialized: false
  };

  async function loadConfiguration() {
    try {
      state.activeProfile = await WhatsAppAgentSettings.getActiveProfile();
      const settings = await WhatsAppAgentSettings.getSettings();
      state.displayMode = settings.displayMode || 'label';
      console.log('[Agent] Config loaded:', state.activeProfile?.profileName);
    } catch (error) {
      console.error('[Agent] Config error:', error);
    }
  }

  async function applyIdentification() {
    if (!state.activeProfile) return;
    MessagePrefixer.start(state.activeProfile);
    console.log('[Agent] Applied for:', state.activeProfile.profileName);
  }

  function removeIdentification() {
    MessagePrefixer.stop();
    console.log('[Agent] Identification removed');
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'updateProfile') {
      removeIdentification();
      loadConfiguration().then(() => {
        applyIdentification();
        sendResponse({ success: true });
      });
      return true;
    }
  });

  async function initialize() {
    console.log('═══════════════════════════════════════');
    console.log('WhatsApp Agent Identifier v3.0.0');
    console.log('by Lucas Moura (github.com/lucasmoura333)');
    console.log('═══════════════════════════════════════');

    const loaded = await DOMHelper.waitForWhatsApp();
    if (!loaded) {
      console.error('[Agent] WhatsApp failed to load');
      return;
    }

    await loadConfiguration();
    if (state.activeProfile) {
      await applyIdentification();
    }

    state.initialized = true;
    console.log('✓ Extension Active');
    if (state.activeProfile) {
      console.log('✓ Profile:', state.activeProfile.profileName);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();
