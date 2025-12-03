window.DOMHelper = {
  async waitForWhatsApp() {
    console.log('[DOMHelper] Aguardando WhatsApp carregar...');
    for (let i = 0; i < 100; i++) {
      // Só precisa do #app ou #main para saber que o WhatsApp carregou
      const app = document.querySelector('#app');
      const main = document.querySelector('#main');
      const side = document.querySelector('#side');
      
      if (app && (main || side)) {
        console.log(`[DOMHelper] WhatsApp carregado após ${i * 200}ms`);
        return true;
      }
      
      if (i % 10 === 0) {
        console.log(`[DOMHelper] Tentativa ${i}/100...`);
      }
      
      await new Promise(r => setTimeout(r, 200));
    }
    console.error('[DOMHelper] Timeout aguardando WhatsApp');
    return false;
  },
  
  findElement(selectors) {
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
};
