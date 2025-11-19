// MessagePrefixer V5 - by Lucas Moura (Input Modification Approach)
console.log('🔵 MessagePrefixer.js carregado!');

window.MessagePrefixer = {
  isActive: false,
  activeProfile: null,
  listenerAttached: false,

  start(profile) {
    console.log('🚀 MessagePrefixer.start() para:', profile.profileName);
    console.log('📊 Estado atual - isActive:', this.isActive, 'listenerAttached:', this.listenerAttached);
    
    this.isActive = true;
    this.activeProfile = profile;
    
    if (!this.listenerAttached) {
      console.log('🔧 Configurando listener pela primeira vez...');
      this.setupListener();
      this.listenerAttached = true;
    } else {
      console.log('ℹ️ Listener já estava configurado');
    }
    
    console.log('✅ MessagePrefixer ativo - Profile:', profile.profileName, 'Subtitle:', profile.subtitle);
  },

  stop() {
    console.log('⏹️ MessagePrefixer.stop()');
    this.isActive = false;
    this.activeProfile = null;
  },

  setupListener() {
    console.log('🎧 MessagePrefixer: configurando listener');
    
    // Interceptar ANTES do WhatsApp processar o Enter
    document.addEventListener('keydown', (e) => {
      console.log('⌨️ Key detectada:', e.key, 'isActive:', this.isActive);
      
      if (!this.isActive) {
        console.log('⏭️ Ignorando - não está ativo');
        return;
      }
      
      // Detectar Enter (não Shift+Enter)
      if (e.key === 'Enter' && !e.shiftKey) {
        console.log('✅ Enter detectado (sem Shift)');
        const input = this.findInput();
        console.log('🔍 Input encontrado:', !!input);
        
        if (input && input.contains(e.target)) {
          console.log('✅ Target está dentro do input');
          const text = (input.textContent || '').trim();
          console.log('📝 Texto capturado:', text);
          
          const hasPrefix = this.hasPrefix(text);
          console.log('🏷️ Já tem prefixo?', hasPrefix);
          
          // Se tem texto e não tem prefixo, adicionar
          if (text && !hasPrefix) {
            console.log('🎯 BLOQUEANDO Enter e inserindo prefixo');
            e.preventDefault();
            e.stopImmediatePropagation();
            this.send(input, text);
            return false;
          } else {
            console.log('⏭️ Pulando - texto vazio ou já tem prefixo');
          }
        } else {
          console.log('⏭️ Target não está no input ou input não encontrado');
        }
      }
    }, true); // Capture phase para pegar antes do WhatsApp
    
    console.log('✅ Listener configurado');
  },

  send(input, text) {
    this.processing = true;
    const name = this.activeProfile?.profileName || 'Agent';
    const sub = this.activeProfile?.subtitle || '';
    const prefix = sub ? `*${name} - ${sub}:*` : `*${name}:*`;
    const msg = `${prefix}\n${text}`;
    
    console.log('📋 Copiando para clipboard:', msg);
    
    navigator.clipboard.writeText(msg).then(() => {
      console.log('✅ Clipboard atualizado');
      input.focus();
      document.execCommand('selectAll');
      document.execCommand('paste');
      console.log('✅ Paste executado');
      
      // Aguarda o paste ser processado e clica no botão
      setTimeout(() => {
        const btn = document.querySelector('[data-testid="send"]') || 
                    document.querySelector('button[aria-label="Send"]') ||
                    document.querySelector('button[aria-label="Enviar"]') ||
                    document.querySelector('span[data-icon="send"]')?.parentElement;
        
        console.log('🔍 Botão send encontrado:', !!btn);
        
        if (btn) {
          btn.click();
          console.log('✅ Mensagem enviada!');
        } else {
          console.warn('⚠️ Botão send não encontrado - enviando Enter manualmente');
          input.dispatchEvent(new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13,
            bubbles: true
          }));
        }
        
        this.processing = false;
      }, 150);
    }).catch((err) => {
      console.error('❌ Erro no clipboard:', err);
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
