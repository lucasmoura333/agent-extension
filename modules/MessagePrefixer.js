// MessagePrefixer V3 - by Lucas Moura
window.MessagePrefixer = {
  isActive: false,
  activeProfile: null,
  processing: false,

  start(profile) {
    this.isActive = true;
    this.activeProfile = profile;
    this.setupListener();
  },

  stop() {
    this.isActive = false;
    this.activeProfile = null;
  },

  setupListener() {
    document.addEventListener('keydown', (e) => {
      if (!this.isActive || this.processing) return;
      if (e.key === 'Enter' && !e.shiftKey) {
        const input = this.findInput();
        if (input && input.contains(e.target)) {
          const text = (input.textContent || '').trim();
          if (text && !this.hasPrefix(text)) {
            e.preventDefault();
            e.stopImmediatePropagation();
            this.send(input, text);
            return false;
          }
        }
      }
    }, true);
  },

  send(input, text) {
    this.processing = true;
    const name = this.activeProfile?.profileName || 'Agent';
    const sub = this.activeProfile?.subtitle || '';
    const prefix = sub ? `*${name} - ${sub}:*` : `*${name}:*`;
    const msg = `${prefix}\n${text}`;
    
    navigator.clipboard.writeText(msg).then(() => {
      input.focus();
      document.execCommand('selectAll');
      document.execCommand('paste');
      setTimeout(() => {
        const btn = document.querySelector('[data-testid="send"]');
        if (btn) btn.click();
        this.processing = false;
      }, 50);
    }).catch(() => {
      this.processing = false;
    });
  },

  findInput() {
    return document.querySelector('div[contenteditable="true"][data-tab="10"]');
  },

  hasPrefix(text) {
    const name = this.activeProfile?.profileName;
    return name && text.startsWith(`*${name}`);
  }
};
