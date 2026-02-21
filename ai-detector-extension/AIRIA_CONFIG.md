# AI Content Detector - Airia Orchestrator Configuration

## Phase 1: Document Capture Agent

This document describes the Airia agent configuration for Phase 1 of the AI Content Detector project.

### Agent Purpose
- Receive captured content metadata from Chrome extension
- Log the document capture event
- Return "Doc captured" response

### API Configuration

**Endpoint:**
```
POST https://api.airia.ai/v1/agents/{agentId}/execute
```

**Headers:**
```
X-API-Key: YOUR_API_KEY
Content-Type: application/json
```

**Request Body:**
```json
{
  "input": {
    "event": "content_captured",
    "pageUrl": "https://twitter.com/user/status/123",
    "platform": "twitter",
    "mediaSummary": {
      "images": 3,
      "videos": 1,
      "audio": 0
    },
    "timestamp": "2026-02-21T10:30:00Z"
  }
}
```

**Response (Phase 1):**
```json
{
  "success": true,
  "message": "Doc captured",
  "capturedAt": "2026-02-21T10:30:00.123Z",
  "mediaSummary": {
    "images": 3,
    "videos": 1,
    "audio": 0
  }
}
```

### Setup Instructions

1. **Create Agent in Airia Studio:**
   - Go to Airia Platform → Create New Agent
   - Name: "AI Content Detector - Capture"
   - Description: "Captures content metadata from Chrome extension"

2. **Configure Agent Logic:**
   - Add a "Capture Event" trigger
   - Add logging action
   - Add "Return Response" with "Doc captured" message

3. **Deploy Agent:**
   - Deploy as API Interface
   - Copy Agent ID and API Key
   - Update `background.js` with credentials

### Environment Variables

Update `background/background.js` with your Airia credentials:

```javascript
const AIRIA_CONFIG = {
  agentId: 'YOUR_AIRIA_AGENT_ID',
  apiKey: 'YOUR_AIRIA_API_KEY',
  endpoint: 'https://api.airia.ai/v1/agents/{agentId}/execute'
};
```

---

## Phase 2: Full Detection Agent (Template)

For Phase 2, the agent will:

1. Receive captured content
2. Route to parallel detection models:
   - Gemini 3.1 Pro (image analysis)
   - Modulate Velma (audio deepfake)
   - OpenSource Deepfake APIs
3. Aggregate results
4. Return prediction with confidence

### Phase 2 Agent Flow

```
[Input: Content] → [Router] → [Parallel Execution]
                                      ↓
                    ┌─────────────────┼─────────────────┐
                    ↓                 ↓                 ↓
              [Gemini]          [Velma]        [Deepfake API]
                    ↓                 ↓                 ↓
                    └─────────────────┼─────────────────┘
                                      ↓
                              [Aggregator]
                                      ↓
                            [Return Results]
```

---

## Phase 3: Contextual Verification (Template)

Add data source lookups:
- Reverse image search (Google Lens)
- Fact-checking APIs
- News verification

---

## Phase 4: Analytics Integration

Add BigQuery logging:
- Store detection results
- Track user feedback
- Enable LightDash dashboards
