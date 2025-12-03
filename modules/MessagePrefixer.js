/**
 * WhatsApp Agent - MessagePrefixer
 * 
 * @author Lucas Moura (github.com/lucasmoura333)
 * @contributor Marcus Vinicius (github.com/mvfernandes)
 * 
 * Adiciona prefixo invisível às mensagens do WhatsApp Web
 */

window.MessagePrefixer = {
  // ============ CONFIG ============
  DEBUG: false, // 🔧 Mude para true para ativar logs

  // ============ STATE ============
  isActive: false,
  activeProfile: null,
  observer: null,
  hiddenPrefix: null,

  // ============ LOGGING ============
  log(...args) {
    if (this.DEBUG) console.log('📱', ...args);
  },

  // ============ LIFECYCLE ============
  start(profile) {
    this.log('Iniciando para:', profile.profileName);
    this.activeProfile = profile;
    this.isActive = true;

    if (this.observer) {
      this.observer.disconnect();
    }

    this.setupObserver();
  },

  stop() {
    this.log('Parando...');
    this.isActive = false;
    this.activeProfile = null;
    this.hiddenPrefix = null;
    
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  },

  // ============ OBSERVER ============
  setupObserver() {
    this.observer = new MutationObserver(() => {
      const input = this.findInput();
      if (input && !input.hasAttribute('data-prefix-ready')) {
        input.setAttribute('data-prefix-ready', 'true');
        this.attachToInput(input);
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Checa se já existe um input
    const input = this.findInput();
    if (input) {
      input.setAttribute('data-prefix-ready', 'true');
      this.attachToInput(input);
    }
  },

  // ============ INPUT HANDLING ============
  attachToInput(input) {
    if (input.contentEditable !== 'true') return;

    this.log('Input anexado');

    // FOCUS: configura prefixo oculto
    input.addEventListener('focus', () => {
      if (!this.isActive || !this.activeProfile) return;

      const text = (input.textContent || '').trim();
      if (!text) {
        const { profileName, subtitle } = this.activeProfile;
        this.hiddenPrefix = subtitle 
          ? `*${profileName} - ${subtitle}:*` 
          : `*${profileName}:*`;
        input.setAttribute('data-has-hidden-prefix', 'true');
        this.log('Prefixo configurado:', this.hiddenPrefix);
      }
    });

    // KEYDOWN: intercepta Enter e envia com prefixo
    input.addEventListener('keydown', (e) => {
      if (!this.isActive || !this.activeProfile) return;
      if (e.key !== 'Enter' || e.shiftKey) return;
      if (!this.hiddenPrefix || !input.hasAttribute('data-has-hidden-prefix')) return;

      const currentText = (input.textContent || '').trim();
      if (!currentText || this.hasPrefix(currentText)) return;

      // Bloqueia Enter
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      this.sendInvisibly(input, currentText);
    }, true);

    // BLUR: limpa prefixo se sair sem enviar
    input.addEventListener('blur', () => {
      if (input.hasAttribute('data-has-hidden-prefix')) {
        const text = (input.textContent || '').trim();
        if (!text) {
          this.hiddenPrefix = null;
          input.removeAttribute('data-has-hidden-prefix');
        }
      }
    });
  },

  // ============ INVISIBLE SEND ============
  sendInvisibly(input, text) {
    const fullText = `${this.hiddenPrefix}\n${text}`;
    
    // 1. Esconde texto (transparente)
    const originalColor = input.style.color;
    const originalCaret = input.style.caretColor;
    input.style.color = 'transparent';
    input.style.caretColor = 'transparent';

    // 2. Copia, cola e envia
    navigator.clipboard.writeText(fullText).then(() => {
      input.focus();
      document.execCommand('selectAll');
      document.execCommand('paste');

      // 3. Clica send no próximo frame
      requestAnimationFrame(() => {
        const sendBtn = 
          document.querySelector('[data-testid="send"]') ||
          document.querySelector('button[aria-label="Send"]') ||
          document.querySelector('button[aria-label="Enviar"]') ||
          document.querySelector('span[data-icon="send"]')?.closest('button');

        if (sendBtn) {
          sendBtn.click();
          this.log('✓ Mensagem enviada');
        }

        // 4. Restaura cor
        setTimeout(() => {
          input.style.color = originalColor;
          input.style.caretColor = originalCaret;
        }, 10);
      });

      // Limpa estado
      this.hiddenPrefix = null;
      input.removeAttribute('data-has-hidden-prefix');
    });
  },

  // ============ UTILITIES ============
  findInput() {
    const selectors = [
      'div[contenteditable="true"][data-tab="10"]',
      '[data-testid="conversation-compose-box-input"]',
      'footer div[contenteditable="true"][role="textbox"]'
    ];

    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    return null;
  },

  hasPrefix(text) {
    if (!this.activeProfile) return false;
    return text.startsWith(`*${this.activeProfile.profileName}`);
  }
};
