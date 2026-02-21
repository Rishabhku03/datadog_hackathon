# AGENTS.md - AI Content Detector Extension

## Project Overview

This is a Chrome Extension (Manifest V3) for AI-generated content detection on social media. The project includes:
- **Chrome Extension** (Vanilla JavaScript, no build system)
- **Cloud Function** (Python 3.11, deployed on GCP)
- **Data Pipeline** (GCS for storage, BigQuery for metadata)

## Project Structure

```
ai-detector-extension/          # Chrome Extension (Manifest V3)
├── manifest.json               # Extension manifest
├── popup/                      # Extension popup UI
├── background/                 # Service worker
├── content/                   # Content script
└── icons/                     # Extension icons

cloud_function/                # GCP Cloud Function
├── main.py                    # Python function code
└── requirements.txt            # Python dependencies
```

---

## Build, Lint, and Test Commands

### Chrome Extension

```bash
# Load extension in Chrome
# 1. Open chrome://extensions/
# 2. Enable Developer mode
# 3. Click "Load unpacked"
# 4. Select ai-detector-extension/ directory

# Validate manifest.json (requires node_modules)
npx ajv validate -s node_modules/chrome-extension-manifest-schema/schema.json -d ai-detector-extension/manifest.json

# Run ESLint
npx eslint ai-detector-extension/**/*.js

# Run ESLint with auto-fix
npx eslint ai-detector-extension/**/*.js --fix
```

### Cloud Function (GCP)

```bash
# Deploy Cloud Function
gcloud functions deploy upload_image \
  --runtime python311 \
  --trigger-http \
  --allow-unauthenticated \
  --region us-central1 \
  --project datadog-hackthon \
  --source=./cloud_function

# View Cloud Function logs
gcloud functions logs read upload_image --region us-central1 --project datadog-hackthon --limit=10

# Test Cloud Function locally
functions-framework --target=upload_image
```

### Manual Testing

```bash
# Chrome Extension Testing
# 1. Load unpacked extension: chrome://extensions/
# 2. Click "Service worker" for background console
# 3. Test on supported sites: Reddit, Twitter, Facebook, Instagram, TikTok, YouTube, LinkedIn

# View BigQuery data
# Go to GCP Console > BigQuery > Run query:
SELECT * FROM `datadog-hackthon.image_pipeline.image_metadata` ORDER BY captured_at DESC LIMIT 10;
```

---

## Code Style Guidelines

### JavaScript (Chrome Extension)

**General Principles:**
- Use **IIFE** wrapping `(function() { ... })();` for all extension scripts
- Always use `'use strict';` at the top of every JavaScript file
- Use **2 spaces** for indentation
- Use **single quotes** for strings
- Maximum line length: **100 characters**

**Naming Conventions:**
| Element | Convention | Example |
|---------|------------|---------|
| Variables | camelCase | `capturedMedia`, `mediaCount` |
| Constants | UPPER_SNAKE_CASE | `MEDIA_TYPES`, `STORAGE_KEYS` |
| Functions | camelCase | `captureImages()`, `detectPlatform()` |
| File names | kebab-case | `background.js`, `popup.js` |

**Error Handling:**
```javascript
async function fetchData() {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('[AI Detector] Request failed:', error);
    throw error;
  }
}
```

**Chrome Extension Message Passing:**
```javascript
// Always return true for async responses
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'capture') {
    handleCapture().then(result => sendResponse(result));
    return true;
  }
});
```

### Python (Cloud Function)

**General Principles:**
- Follow PEP 8 style guide
- Use **4 spaces** for indentation
- Use **type hints** where appropriate
- Maximum line length: **100 characters**

**Naming Conventions:**
| Element | Convention | Example |
|---------|------------|---------|
| Variables | snake_case | `image_data`, `gcs_url` |
| Constants | UPPER_SNAKE_CASE | `BUCKET_NAME`, `API_KEY` |
| Functions | snake_case | `upload_image()`, `get_client()` |
| File names | snake_case | `main.py`, `utils.py` |

**Error Handling:**
```python
def upload_image(request):
    try:
        # Process request
        return {'success': True, 'data': result}, 200, headers
    except Exception as e:
        return {'error': str(e)}, 500, headers
```

---

## Configuration

### API Keys

| Service | Location | Description |
|---------|----------|-------------|
| Airia | `background.js` - `AIRIA_CONFIG` | AI detection API |
| GCP API Key | `background.js` - `CLOUD_CONFIG` | GCS/BigQuery access |
| Cloud Function | `background.js` - `functionUrl` | Upload endpoint |

### BigQuery Schema

```sql
CREATE TABLE image_metadata (
  image_id STRING,
  gcs_url STRING,
  captured_at TIMESTAMP
);
```

---

## Common Tasks

### Adding a New Platform

1. Add URL pattern to `manifest.json` → `content_scripts[].matches`
2. Add platform detection in popup.js → `detectPlatform()`
3. Test on the platform

### Deploying Cloud Function

```bash
# Update main.py with new logic
# Redeploy
gcloud functions deploy upload_image \
  --runtime python311 \
  --trigger-http \
  --allow-unauthenticated \
  --region us-central1 \
  --project datadog-hackthon \
  --source=./cloud_function
```

### Debugging

```bash
# View service worker console
# chrome://extensions/ > Find extension > Click "Service worker"

# View Cloud Function logs
gcloud functions logs read upload_image --region us-central1 --project datadog-hackthon

# View BigQuery data
# GCP Console > BigQuery > Run SQL query
```

---

## Security Guidelines

- **NEVER commit API keys** - Use environment variables or chrome.storage
- Validate all data from external sources
- Use minimum required permissions in manifest.json
- Sanitize user input before DOM manipulation
- Python: Use parameterized queries for BigQuery insertions
