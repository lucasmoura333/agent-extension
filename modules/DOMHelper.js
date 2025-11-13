window.DOMHelper = {
  async waitForWhatsApp() {
    for (let i = 0; i < 50; i++) {
      if (document.querySelector('#main')) return true;
      await new Promise(r => setTimeout(r, 200));
    }
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
