const AIRIA_CONFIG = {
  agentId: 'YOUR_AIRIA_AGENT_ID',
  apiKey: 'YOUR_AIRIA_API_KEY',
  endpoint: 'https://api.airia.ai/v1/agents/{agentId}/execute'
};

const STORAGE_KEYS = {
  API_CONFIG: 'airia_config',
  LAST_RESULT: 'last_detection_result'
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeContent') {
    (async () => {
      try {
        const { mediaData, metadata } = request;

        const airiaResult = {
          success: true,
          message: 'Image captured for analysis',
          capturedAt: new Date().toISOString(),
          mediaSummary: {
            images: mediaData.media?.images?.length || 0
          }
        };

        await chrome.storage.local.set({
          [STORAGE_KEYS.LAST_RESULT]: {
            ...airiaResult,
            pageUrl: metadata.url,
            platform: metadata.platform
          }
        });

        sendResponse(airiaResult);
      } catch (error) {
        sendResponse({
          success: false,
          error: error.message
        });
      }
    })();
    return true;
  }

  if (request.action === 'getLastResult') {
    (async () => {
      const result = await chrome.storage.local.get(STORAGE_KEYS.LAST_RESULT);
      sendResponse(result[STORAGE_KEYS.LAST_RESULT] || null);
    })();
    return true;
  }

  if (request.action === 'updateConfig') {
    (async () => {
      Object.assign(AIRIA_CONFIG, request.config);
      await chrome.storage.local.set({
        [STORAGE_KEYS.API_CONFIG]: request.config
      });
      sendResponse({ success: true });
    })();
    return true;
  }

  return false;
});

chrome.runtime.onInstalled.addListener(async () => {
  const storedConfig = await chrome.storage.local.get(STORAGE_KEYS.API_CONFIG);
  if (storedConfig[STORAGE_KEYS.API_CONFIG]) {
    Object.assign(AIRIA_CONFIG, storedConfig[STORAGE_KEYS.API_CONFIG]);
  }

  console.log('[AI Detector] Extension installed and ready');
});
