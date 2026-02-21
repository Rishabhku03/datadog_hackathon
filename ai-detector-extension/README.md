# AI Content Detector Chrome Extension

Agentic AI content detection for social media platforms.

## Features

- Captures images, videos, and audio from social media pages
- Sends content to Airia orchestrator for AI detection
- Supports multiple platforms: Twitter/X, Facebook, Instagram, TikTok, YouTube, Reddit, LinkedIn

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `ai-detector-extension` folder

## Configuration

### 1. Update Airia Credentials

Edit `background/background.js`:

```javascript
const AIRIA_CONFIG = {
  agentId: 'YOUR_AIRIA_AGENT_ID',
  apiKey: 'YOUR_AIRIA_API_KEY',
  endpoint: 'https://api.airia.ai/v1/agents/{agentId}/execute'
};
```

### 2. Set Up Airia Agent

See `AIRIA_CONFIG.md` for detailed setup instructions.

## Usage

1. Navigate to any supported social media platform
2. Click the extension icon in Chrome toolbar
3. View detected media counts
4. Click "Scan for AI Content" to analyze

## Supported Platforms

- Twitter / X
- Facebook
- Instagram
- TikTok
- YouTube
- Reddit
- LinkedIn

## Project Structure

```
ai-detector-extension/
├── manifest.json          # Extension manifest (MV3)
├── popup/
│   ├── popup.html        # Extension popup UI
│   └── popup.js         # Popup logic
├── background/
│   └── background.js    # Service worker & Airia API
├── content/
│   └── content.js       # DOM media capture
└── icons/               # Extension icons
```

## Phase Roadmap

| Phase | Description |
|-------|-------------|
| 1 | Basic content capture → "Doc captured" response |
| 2 | Full detection: Gemini 3.1, Velma, deepfake APIs |
| 3 | Contextual verification (fact-checking) |
| 4 | BigQuery + LightDash analytics |
| 5 | Continuous learning feedback loop |

## Tech Stack

- **Chrome Extension**: Manifest V3
- **Orchestration**: Airia
- **Detection Models**: Gemini 3.1 Pro, Modulate Velma
- **Analytics**: BigQuery, LightDash
