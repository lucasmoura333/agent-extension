window.DOMHelper = {
  DEBUG: false, // 🔧 Mude para true para ativar logs

  async waitForWhatsApp() {
    for (let i = 0; i < 100; i++) {
      const app = document.querySelector('#app');
      const main = document.querySelector('#main');
      const side = document.querySelector('#side');
      
      if (app && (main || side)) {
        return true;
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
