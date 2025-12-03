// MessagePrefixer V7 - by Lucas Moura (Invisible Prefix)
console.log('🔵 MessagePrefixer.js carregado!');

window.MessagePrefixer = {
  isActive: false,
  activeProfile: null,
  observer: null,
  hiddenPrefix: null,

  start(profile) {
    console.log('🚀 MessagePrefixer.start() chamado para:', profile.profileName);

    this.activeProfile = profile;
    this.isActive = true;

    // Remove listener antigo se existir
    if (this.observer) {
      this.observer.disconnect();
    }

    this.setupObserver();
    console.log('✅ MessagePrefixer ativo:', this.isActive);
  },

  stop() {
    this.isActive = false;
    this.activeProfile = null;
    this.hiddenPrefix = null;
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    console.log('⏹️ MessagePrefixer parado');
  },

  setupObserver() {
    console.log('🔍 Configurando MutationObserver para detectar novos inputs');

    // DEBUG: Adiciona listener global para capturar todos os keydown
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        console.log('🌍 GLOBAL KEYDOWN Enter detectado!');
        console.log('🌍 Target:', e.target);
        console.log('🌍 Target details:', {
          tagName: e.target.tagName,
          contentEditable: e.target.contentEditable,
          dataTab: e.target.getAttribute('data-tab'),
          dataTestId: e.target.getAttribute('data-testid'),
          role: e.target.getAttribute('role'),
          className: e.target.className
        });
      }
    }, true);

    // DEBUG: Adiciona listener global para focus
    document.addEventListener('focus', (e) => {
      if (e.target.contentEditable === 'true') {
        console.log('🌍 GLOBAL FOCUS em elemento editável!');
        console.log('🌍 Focus target:', e.target);
        console.log('🌍 Focus target details:', {
          tagName: e.target.tagName,
          contentEditable: e.target.contentEditable,
          dataTab: e.target.getAttribute('data-tab'),
          dataTestId: e.target.getAttribute('data-testid'),
          role: e.target.getAttribute('role'),
          className: e.target.className
        });
      }
    }, true);

    // Observa mudanças no DOM para detectar quando o input aparece
    this.observer = new MutationObserver(() => {
      const input = this.findInput();
      if (input && !input.hasAttribute('data-prefix-ready')) {
        console.log('🎯 NOVO INPUT DE MENSAGEM DETECTADO!');
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
      console.log('🎯 INPUT DE MENSAGEM JÁ EXISTE!');
      input.setAttribute('data-prefix-ready', 'true');
      this.attachToInput(input);
    } else {
      console.log('⏳ Aguardando input de mensagem aparecer...');
    }
  },

  attachToInput(input) {
    console.log('📎 Anexando listeners ao input');
    console.log('🎯 Input element:', input);
    console.log('🎯 Input attributes:', {
      contenteditable: input.getAttribute('contenteditable'),
      'data-tab': input.getAttribute('data-tab'),
      'data-testid': input.getAttribute('data-testid'),
      role: input.getAttribute('role'),
      class: input.className
    });

    // Verifica se é realmente um input editável
    if (input.contentEditable !== 'true') {
      console.log('⚠️ AVISO: Input não é contenteditable!');
      return;
    }

    // Listener para FOCUS - configura prefixo invisível
    input.addEventListener('focus', (e) => {
      console.log('🎯 FOCUS EVENTO ACIONADO!');
      console.log('🎯 Focus target:', e.target);
      console.log('🎯 Focus target is input:', e.target === input);

      if (!this.isActive || !this.activeProfile) {
        console.log('⏭️ Ignorado - extensão inativa');
        return;
      }

      const text = (input.textContent || '').trim();
      console.log('📝 Texto atual no focus:', `"${text}"`);

      if (!text) {
        const name = this.activeProfile.profileName || 'Agent';
        const sub = this.activeProfile.subtitle || '';
        const prefix = sub ? `*${name} - ${sub}:*` : `*${name}:*`;

        // Guarda o prefixo mas não mostra
        this.hiddenPrefix = prefix;

        // Adiciona atributo indicando que tem prefixo oculto
        input.setAttribute('data-has-hidden-prefix', 'true');

        console.log('✅ Prefixo oculto configurado:', `"${this.hiddenPrefix}"`);
        console.log('🏷️ Atributo data-has-hidden-prefix adicionado');
      } else {
        console.log('⏭️ Campo não está vazio, não configurando prefixo');
      }
    });

    // Abordagem: bloqueia Enter, modifica via clipboard, e reenvia
    input.addEventListener('keydown', (e) => {
      console.log('⌨️ KEYDOWN EVENTO ACIONADO:', e.key);
      console.log('⌨️ Keydown target is input:', e.target === input);

      if (!this.isActive || !this.activeProfile) {
        console.log('⏭️ Ignorado - extensão inativa');
        return;
      }

      if (e.key === 'Enter' && !e.shiftKey) {
        console.log('✅ Enter pressionado');

        if (this.hiddenPrefix && input.hasAttribute('data-has-hidden-prefix')) {
          const currentText = (input.textContent || '').trim();
          console.log('📝 Texto atual:', `"${currentText}"`);

          if (currentText && !this.hasPrefix(currentText)) {
            console.log('⚡ BLOQUEANDO Enter - ENVIO 100% INVISÍVEL');
            
            // BLOQUEIA o Enter original
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            const fullText = `${this.hiddenPrefix}\n\n${currentText}`;
            
            // ========== ENVIO 100% INVISÍVEL ==========
            // 1. Esconde o input COMPLETAMENTE (cor do texto = transparente)
            const originalColor = input.style.color;
            const originalCaretColor = input.style.caretColor;
            input.style.color = 'transparent';
            input.style.caretColor = 'transparent';
            
            // 2. Modifica e envia instantaneamente
            navigator.clipboard.writeText(fullText).then(() => {
              input.focus();
              document.execCommand('selectAll');
              document.execCommand('paste');
              
              // 3. Clica no botão send IMEDIATAMENTE
              requestAnimationFrame(() => {
                const sendBtn = document.querySelector('[data-testid="send"]') ||
                                document.querySelector('button[aria-label="Send"]') ||
                                document.querySelector('button[aria-label="Enviar"]') ||
                                document.querySelector('span[data-icon="send"]')?.closest('button');
                
                if (sendBtn) {
                  sendBtn.click();
                  console.log('✅ Enviado INVISIVELMENTE!');
                }
                
                // 4. Restaura cor (o input já vai estar vazio após envio)
                setTimeout(() => {
                  input.style.color = originalColor;
                  input.style.caretColor = originalCaretColor;
                }, 10);
              });
              
              // Limpa estado
              this.hiddenPrefix = null;
              input.removeAttribute('data-has-hidden-prefix');
            });
            // ==========================================

            return false;
          } else {
            console.log('⏭️ Texto vazio ou já tem prefixo');
          }
        } else {
          console.log('⏭️ Sem prefixo oculto');
        }
      }
    }, true); // Capture phase

    console.log('✅ Listeners anexados com sucesso');

    // Teste: adiciona um listener global para verificar se eventos estão chegando
    document.addEventListener('keydown', (e) => {
      if (e.target === input) {
        console.log('🌍 DOCUMENT KEYDOWN: target é o input correto');
      }
    });

    // Listener para BLUR - limpa prefixo oculto se sair sem enviar
    input.addEventListener('blur', () => {
      console.log('👋 BLUR EVENTO ACIONADO');
      if (input.hasAttribute('data-has-hidden-prefix')) {
        const text = (input.textContent || '').trim();
        if (!text) {
          this.hiddenPrefix = null;
          input.removeAttribute('data-has-hidden-prefix');
          console.log('🧹 Prefixo oculto limpo (blur sem texto)');
        }
      }
    });
  },

  findInput() {
    // IMPORTANTE: data-tab="10" é o campo de mensagem
    // data-tab="3" é o campo de pesquisa (NÃO queremos esse!)
    const selectors = [
      'div[contenteditable="true"][data-tab="10"]', // Campo de mensagem - PRIORIDADE!
      '[data-testid="conversation-compose-box-input"]',
      'footer div[contenteditable="true"][role="textbox"]'
    ];

    for (const selector of selectors) {
      const input = document.querySelector(selector);
      if (input) {
        console.log('🔍 Input encontrado com selector:', selector);
        console.log('📍 Input details:', {
          tagName: input.tagName,
          contentEditable: input.contentEditable,
          dataTab: input.getAttribute('data-tab'),
          dataTestId: input.getAttribute('data-testid'),
          role: input.getAttribute('role'),
          ariaLabel: input.getAttribute('aria-label')
        });
        return input;
      }
    }

    console.log('🔍 Nenhum input de mensagem encontrado');
    return null;
  },

  getSelectorUsed(element, selectors) {
    for (const selector of selectors) {
      try {
        if (element.matches && element.matches(selector)) {
          return selector;
        }
      } catch (e) {
        // Ignora seletores inválidos
      }
    }
    return 'unknown';
  },

  hasPrefix(text) {
    if (!this.activeProfile) return false;
    const name = this.activeProfile.profileName;
    return text.startsWith(`*${name}`);
  }
};
