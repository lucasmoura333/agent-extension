#!/bin/bash

# Create all necessary files for WhatsApp Extension v3.0.0

echo "Creating WhatsApp Extension v3.0.0..."
echo "Author: Lucas Moura (github.com/lucasmoura333)"

# Create manifest.json
cat > manifest.json << 'EOF'
{
  "manifest_version": 3,
  "name": "WhatsApp Multi-Profile Agent Identifier",
  "version": "3.0.0",
  "description": "Identify support agents on WhatsApp Web - by Lucas Moura",
  "author": "Lucas Moura",
  "permissions": ["storage", "activeTab", "scripting", "clipboardRead", "clipboardWrite"],
  "host_permissions": ["https://web.whatsapp.com/*"],
  "action": {
    "default_popup": "popup.html",
    "default_title": "Agent Profile Manager"
  },
  "content_scripts": [{
    "matches": ["https://web.whatsapp.com/*"],
    "js": ["modules/settings.js", "modules/DOMHelper.js", "modules/ActivityLogger.js", "modules/BannerManager.js", "modules/NameReplacer.js", "modules/MessagePrefixer.js", "content.js"],
    "css": ["style.css"],
    "run_at": "document_end"
  }]
}
EOF

echo "✓ manifest.json created"

# Create MessagePrefixer.js
cat > modules/MessagePrefixer.js << 'EOF'
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
EOF

echo "✓ MessagePrefixer.js created"

echo ""
echo "Extension structure created successfully!"
echo "Files created: manifest.json, modules/MessagePrefixer.js"
echo ""
echo "To complete setup, you still need:"
echo "- content.js"
echo "- modules/settings.js, DOMHelper.js, ActivityLogger.js, etc."
echo "- popup.html, popup.js"
echo "- style.css"

