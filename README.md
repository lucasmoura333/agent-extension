# Agent Extension

WhatsApp Web extension that automatically adds agent prefixes to outgoing messages, making them appear in bold to recipients.

## Features

- **Message Prefixing**: Automatically adds `*Name - Subtitle:*` prefix to all outgoing messages
- **Bold Formatting**: Recipients see the prefix in bold text
- **Line Break**: Message content appears on a new line below the prefix
- **Profile Management**: Create and switch between different agent profiles
- **Clipboard Integration**: Bypasses WhatsApp's Lexical Editor for reliable formatting

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked" and select the `whatsapp-extension` folder
5. Open WhatsApp Web and click the extension icon

## Usage

1. Click the extension icon in WhatsApp Web
2. Create a new profile (e.g., "Lucas - GDPro Dev")
3. Activate the profile
4. Start chatting — all messages will be prefixed automatically

## Example

**Sent Message:**
```
Hello, how can I help you today?
```

**Recipient Sees:**
```
*Lucas - GDPro Dev:*
Hello, how can I help you today?
```

## Development

- Built with Manifest V3
- Uses capture-phase event interception
- Clipboard API for text insertion
- Chrome Storage API for profiles

## Author

Lucas Moura (github.com/lucasmoura333)

## License

MIT License - see LICENSE file for details
