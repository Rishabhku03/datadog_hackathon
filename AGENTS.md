# AGENTS.md - AI Content Detector Extension

## Project Overview

This is a Chrome Extension (Manifest V3) for AI-generated content detection on social media platforms. The project uses vanilla JavaScript with no build system.

## Build, Lint, and Test Commands

### Currently Available Commands

```bash
# Load extension in Chrome
# 1. Open chrome://extensions/
# 2. Enable Developer mode
# 3. Click "Load unpacked"
# 4. Select ai-detector-extension/ directory

# Validate manifest.json
npx ajv validate -s node_modules/chrome-extension-manifest-schema/schema.json -d ai-detector-extension/manifest.json
```

### Recommended Setup (Run First)

```bash
# Initialize npm project
npm init -y

# Install development dependencies
npm install --save-dev eslint eslint-plugin-chrome jshint

# Install Chrome extension-specific validators
npm install --save-dev chrome-extension-manifest-schema ajv
```

### Lint Commands

```bash
# Run ESLint on all JS files
npx eslint ai-detector-extension/**/*.js

# Run ESLint with auto-fix
npx eslint ai-detector-extension/**/*.js --fix

# Run JSHint
npx jshint ai-detector-extension/background/ ai-detector-extension/content/ ai-detector-extension/popup/

# Validate manifest.json structure
npx ajv validate -s node_modules/chrome-extension-manifest-schema/schema.json -d ai-detector-extension/manifest.json
```

### Test Commands

```bash
# Run ESLint (primary linter)
npx eslint ai-detector-extension/**/*.js

# Run specific test file
npx eslint --rulesdir ./tests/rules ai-detector-extension/content/content.js

# Chrome Extension Tests - Manual
# 1. Load unpacked extension
# 2. Open chrome://extensions/
# 3. Click "Service worker" link to view console
# 4. Test on social media sites
```

---

## API Keys Configuration

### Required Keys

| Service | Key | Description |
|---------|-----|-------------|
| Airia | `agentId` | Your Airia agent identifier |
| Airia | `apiKey` | Airia API authentication key |

### Configuration Location

API keys are configured in `ai-detector-extension/background/background.js`:

```javascript
const AIRIA_CONFIG = {
  agentId: 'YOUR_AIRIA_AGENT_ID',
  apiKey: 'YOUR_AIRIA_API_KEY',
  endpoint: 'https://api.airia.ai/v1/agents/{agentId}/execute'
};
```

### Environment-Based Configuration (Recommended)

For production, use chrome.storage to store API keys securely:

```javascript
// In background.js - load from storage on startup
chrome.runtime.onInstalled.addListener(async () => {
  const stored = await chrome.storage.local.get('airia_config');
  if (stored.airia_config) {
    Object.assign(AIRIA_CONFIG, stored.airia_config);
  }
});

// Update config via message from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateConfig') {
    Object.assign(AIRIA_CONFIG, request.config);
    chrome.storage.local.set({ airia_config: request.config });
  }
});
```

### Airia Agent Setup

1. Go to [Airia Platform](https://explore.airia.com)
2. Create new agent: "AI Content Detector"
3. Deploy as API Interface
4. Copy Agent ID and generate API Key
5. Update `background.js` with credentials

---

## Code Style Guidelines

### General Principles

- Use **IIFE** wrapping `(function() { ... })();` for all extension scripts to avoid global scope pollution
- Always use `'use strict';` at the top of every JavaScript file
- Use **2 spaces** for indentation
- Use **single quotes** for strings in JavaScript
- Maximum line length: **100 characters**
- No trailing whitespace
- Add newline at end of every file

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Variables | camelCase | `capturedMedia`, `mediaCount` |
| Constants | UPPER_SNAKE_CASE | `MEDIA_TYPES`, `STORAGE_KEYS` |
| Functions | camelCase | `captureImages()`, `detectPlatform()` |
| Classes | PascalCase | `ContentCapture`, `MediaDetector` |
| File names | kebab-case | `background.js`, `content-script.js` |
| HTML IDs | kebab-case | `scan-btn`, `media-counts` |
| CSS Classes | kebab-case | `result-card`, `platform-badge` |

### Import/Export Patterns

```javascript
// Chrome Extension - Use chrome.runtime for messaging
// Background script sends to content script
chrome.tabs.sendMessage(tabId, { action: 'captureMedia' }, callback);

// Content script listens
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle request
  sendResponse({ data: result });
  return true; // Keep channel open for async response
});

// Popup communicates with background
chrome.runtime.sendMessage({ action: 'analyzeContent', data: payload });
```

### Error Handling

```javascript
// Always wrap async operations in try-catch
async function fetchAiriaApi(payload) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('[AI Detector] Request failed:', error);
    throw error;
  }
}

// Always provide fallback values
const width = img.width || 0;
const title = document.title || 'Untitled';
```

### Type Annotations (JSDoc)

```javascript
/**
 * Captures all media elements from the current page
 * @returns {{success: boolean, mediaCount: {images: number, videos: number, audio: number}, media: Object}}
 */
function captureAllMedia() {
  // implementation
}

/**
 * Sends captured content to Airia orchestrator
 * @param {Object} mediaData - The captured media data
 * @param {string} mediaData.pageUrl - URL of the captured page
 * @param {Array} mediaData.images - Array of image data
 * @returns {Promise<Object>} Response from Airia
 */
async function callAiriaAgent(mediaData) {
  // implementation
}
```

### Chrome Extension Specific Rules

1. **Service Workers**: Background scripts run as service workers - no DOM access, use chrome.storage instead of localStorage
2. **Content Scripts**: Injected into page context - use IIFE to avoid conflicts
3. **Message Passing**: Always return `true` from onMessage listener for async responses
4. **Permissions**: Request minimum required permissions in manifest.json
5. **Host Permissions**: Use specific domains instead of `<all_urls>` when possible

### JSON Style (manifest.json)

```json
{
  "manifest_version": 3,
  "name": "AI Content Detector",
  "version": "1.0.0",
  "description": "Detect AI-generated content on social media",
  "permissions": [
    "activeTab",
    "scripting"
  ],
  "host_permissions": [
    "*://*.twitter.com/*",
    "*://*.facebook.com/*"
  ]
}
```

### CSS Style Guidelines

- Use **BEM-like** class naming: `block__element--modifier`
- Use **CSS custom properties** for theming
- Keep styles in popup.html `<style>` block (no external CSS file for simple extensions)
- Use **flexbox** for layout
- Use **rem** for font sizes, **px** for spacing

### Console Logging

```javascript
// Use consistent prefix for all console output
console.log('[AI Detector] Extension initialized');
console.error('[AI Detector] Failed to capture media:', error.message);
console.warn('[AI Detector] Using fallback for', missingField);
```

---

## File Structure

```
ai-detector-extension/
├── manifest.json           # Extension manifest (MV3)
├── popup/
│   ├── popup.html         # Extension popup UI
│   └── popup.js           # Popup logic
├── background/
│   └── background.js      # Service worker
├── content/
│   └── content.js         # Content script (injected)
├── icons/                 # Extension icons (16, 48, 128px)
└── tests/                 # Test files (to be added)
```

---

## Common Tasks

### Adding a New Social Media Platform

1. Add URL pattern to `manifest.json` → `content_scripts[].matches`
2. Add platform detection in `content.js` → `detectPlatform()`
3. Test on the platform

### Adding New Detection Model

1. Add API config in `background.js` → `AIRIA_CONFIG`
2. Add model call function
3. Add response handling
4. Test with sample content

### Debugging

```bash
# View service worker console
# 1. Go to chrome://extensions/
# 2. Find extension
# 3. Click "Service worker" link
# 4. View Console tab

# View content script console
# 1. Go to target page
# 2. Right-click → Inspect
# 3. View Console tab
```

---

## Security Guidelines

- **NEVER commit API keys** - Add `secrets.json` or similar to `.gitignore`
- For development, create a `.env` file and load from environment variables
- Use chrome.storage for user-provided API keys (see Environment-Based Configuration above)
- Validate all data from external sources
- Use Content Security Policy in manifest.json
- Avoid eval() or Function() constructors
- Sanitize user input before using in DOM
