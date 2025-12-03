/**
 * WhatsApp Agent
 * 
 * @author Lucas Moura (github.com/lucasmoura333)
 * @contributor Marcus Vinicius (github.com/mvfernandes)
 */
(function() {
  'use strict';

  const DEBUG = false; // 🔧 Mude para true para ativar logs
  const log = (...args) => DEBUG && console.log(...args);

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
      log('[Agent] Config loaded:', state.activeProfile?.profileName);
    } catch (error) {
      console.error('[Agent] Config error:', error);
    }
  }

  async function applyIdentification() {
    if (!state.activeProfile) return;
    MessagePrefixer.start(state.activeProfile);
    log('[Agent] Applied for:', state.activeProfile.profileName);
  }

  function removeIdentification() {
    MessagePrefixer.stop();
    log('[Agent] Identification removed');
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
    log('═══════════════════════════════════════');
    log('WhatsApp Agent');
    log('by Lucas Moura & Marcus Vinicius');
    log('═══════════════════════════════════════');

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
    log('✓ Extension Active');
    if (state.activeProfile) {
      log('✓ Profile:', state.activeProfile.profileName);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();
