# AGENTS.md - AI Content Detector

## Project Overview

This is a Chrome Extension for AI-generated content detection on social media with GCP backend:
- **Chrome Extension** (Manifest V3, Vanilla JavaScript)
- **Cloud Function** (Python 3.11, GCP Cloud Functions)
- **Data Pipeline** (GCS + BigQuery)
- **Analytics** (LightDash + BigQuery)

## Project Structure

```
ai-detector-extension/          # Chrome Extension (Manifest V3)
├── manifest.json               # Extension manifest
├── popup/                      # Extension popup UI
│   ├── popup.html             # Popup HTML
│   └── popup.js              # Popup logic (auto-capture + upload)
├── background/                 # Service worker
│   └── background.js         # Cloud upload + messaging
├── content/                    # Content script
│   └── content.js            # (legacy, not used)
└── icons/                     # Extension icons

cloud_function/                # GCP Cloud Function
├── main.py                    # Python function (GCS upload + BigQuery)
└── requirements.txt           # Python dependencies

lightdash/                    # LightDash analytics (YAML)
├── models/                   # dbt models
└── tables/                   # LightDash tables

dbt_project.yml              # dbt project config
```

---

## Build, Lint, and Test Commands

### Chrome Extension

```bash
# Load unpacked extension
# 1. Open chrome://extensions/
# 2. Enable Developer mode
# 3. Click "Load unpacked"
# 4. Select ai-detector-extension/

# Validate manifest.json
npx ajv validate -s node_modules/chrome-extension-manifest-schema/schema.json -d ai-detector-extension/manifest.json

# Run ESLint
npx eslint ai-detector-extension/**/*.js

# Run ESLint with auto-fix
npx eslint ai-detector-extension/**/*.js --fix
```

### Cloud Function (GCP)

```bash
# Deploy
gcloud functions deploy upload_image \
  --runtime python311 \
  --trigger-http \
  --allow-unauthenticated \
  --region us-central1 \
  --project datadog-hackthon \
  --source=./cloud_function

# View logs
gcloud functions logs read upload_image --region us-central1 --project datadog-hackthon --limit=10
```

### BigQuery

```sql
-- View data
SELECT * FROM `datadog-hackthon.image_pipeline.image_metadata` ORDER BY DESC LIMIT 10;
```

---

## Code Style Guidelines

### JavaScript (Chrome Extension)

**General:**
- Use **IIFE** for all extension scripts
- Always use `'use strict';`
- Use **2 spaces** for indentation
- Use **single quotes** for strings
- Max line length: **100 characters**

**Naming:**
| Element | Convention | Example |
|---------|------------|---------|
| Variables | camelCase | `capturedMedia` |
| Constants | UPPER_SNAKE_CASE | `STORAGE_KEYS` |
| Functions | camelCase | `captureImages()` |
| File names | kebab-case | `background.js` |

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

**Message Passing:**
```javascript
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'capture') {
    handleCapture().then(result => sendResponse(result));
    return true;  // Keep channel open
  }
});
```

### Python (Cloud Function)

**General:**
- Follow PEP 8
- Use **4 spaces** for indentation
- Use type hints where appropriate
- Max line length: **100 characters**

**Naming:**
| Element | Convention | Example |
|---------|------------|---------|
| Variables | snake_case | `image_data` |
| Constants | UPPER_SNAKE_CASE | `BUCKET_NAME` |
| Functions | snake_case | `upload_image()` |
| File names | snake_case | `main.py` |

**Error Handling:**
```python
def upload_image(request):
    try:
        return {'success': True}, 200, {'Access-Control-Allow-Origin': '*'}
    except Exception as e:
        return {'error': str(e)}, 500, {'Access-Control-Allow-Origin': '*'}
```

---

## Configuration

### BigQuery Schema

```sql
ALTER TABLE `datadog-hackthon.image_pipeline.image_metadata`
ADD COLUMN platform_name STRING,
ADD COLUMN is_AIgen BOOL;
```

### Environment Variables / Secrets

| Service | Location | Description |
|---------|----------|-------------|
| Airia | `background.js` - `AIRIA_CONFIG` | AI detection API |
| GCP API Key | `background.js` - `CLOUD_CONFIG` | GCS/BigQuery access |
| Cloud Function URL | `background.js` - `functionUrl` | Upload endpoint |

---

## Common Tasks

### Adding a New Platform

1. Add URL pattern to `manifest.json` → `content_scripts[].matches`
2. Add platform detection in `popup.js` → `detectPlatform()`
3. Test on the platform

### Deploying Cloud Function

```bash
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
# Service worker console
# chrome://extensions/ > Find extension > Click "Service worker"

# Cloud Function logs
gcloud functions logs read upload_image --region us-central1 --project datadog-hackthon

# BigQuery
# GCP Console > BigQuery > Run SQL query
```

---

## Security Guidelines

- **NEVER commit API keys** - Use chrome.storage for user keys
- Validate all external data
- Use minimum permissions in manifest.json
- Sanitize DOM input
- Python: Use parameterized queries
