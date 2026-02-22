const AIRIA_CONFIG = {
  agentId: 'YOUR_AIRIA_AGENT_ID',
  apiKey: 'YOUR_AIRIA_API_KEY',
  endpoint: 'https://api.airia.ai/v1/agents/{agentId}/execute'
};

const CLOUD_CONFIG = {
  functionUrl: 'https://us-central1-datadog-hackthon.cloudfunctions.net/upload_image',
  apiKey: ''
};

const STORAGE_KEYS = {
  API_CONFIG: 'airia_config',
  LAST_RESULT: 'last_detection_result',
  UPLOAD_STATUS: 'upload_status',
  DEBUG_LOGS: 'debug_logs'
};

function log(message) {
  const timestamp = new Date().toISOString();
  const logEntry = '[' + timestamp + '] ' + message;
  console.log('[AI Detector] ' + message);
  
  chrome.storage.local.get(STORAGE_KEYS.DEBUG_LOGS, (data) => {
    let logs = data[STORAGE_KEYS.DEBUG_LOGS] || [];
    logs.push(logEntry);
    if (logs.length > 100) logs = logs.slice(-100);
    chrome.storage.local.set({ [STORAGE_KEYS.DEBUG_LOGS]: logs });
  });
}

async function uploadToCloud(imageBase64, platform) {
  log('Starting upload for platform: ' + platform);
  
  try {
    const response = await fetch(CLOUD_CONFIG.functionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_data: imageBase64,
        platform: platform,
        api_key: CLOUD_CONFIG.apiKey
      })
    });
    
    const result = await response.json();
    
    log('Upload response: ' + JSON.stringify(result));
    
    await chrome.storage.local.set({
      [STORAGE_KEYS.UPLOAD_STATUS]: {
        success: result.success,
        imageId: result.image_id,
        gcsUrl: result.gcs_url,
        timestamp: new Date().toISOString()
      }
    });
    
    if (result.success) {
      log('Upload successful - Image ID: ' + result.image_id);
    } else {
      log('Upload failed: ' + result.error);
    }
    
    return result;
  } catch (error) {
    log('Upload failed: ' + error.message);
    await chrome.storage.local.set({
      [STORAGE_KEYS.UPLOAD_STATUS]: {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }
    });
    throw error;
  }
}

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

  if (request.action === 'uploadToCloud') {
    (async () => {
      try {
        const { imageBase64, platform } = request;
        const result = await uploadToCloud(imageBase64, platform);
        sendResponse(result);
      } catch (error) {
        sendResponse({ success: false, error: error.message });
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

  if (request.action === 'getUploadStatus') {
    (async () => {
      const result = await chrome.storage.local.get(STORAGE_KEYS.UPLOAD_STATUS);
      sendResponse(result[STORAGE_KEYS.UPLOAD_STATUS] || null);
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

  if (request.action === 'updateCloudConfig') {
    (async () => {
      if (request.config.functionUrl) {
        CLOUD_CONFIG.functionUrl = request.config.functionUrl;
      }
      if (request.config.apiKey) {
        CLOUD_CONFIG.apiKey = request.config.apiKey;
      }
      await chrome.storage.local.set({
        cloud_config: request.config
      });
      sendResponse({ success: true });
    })();
    return true;
  }

  if (request.action === 'getDebugLogs') {
    (async () => {
      const result = await chrome.storage.local.get(STORAGE_KEYS.DEBUG_LOGS);
      sendResponse(result[STORAGE_KEYS.DEBUG_LOGS] || []);
    })();
    return true;
  }

  if (request.action === 'clearDebugLogs') {
    (async () => {
      await chrome.storage.local.set({ [STORAGE_KEYS.DEBUG_LOGS]: [] });
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

  const cloudConfig = await chrome.storage.local.get('cloud_config');
  if (cloudConfig.cloud_config) {
    if (cloudConfig.cloud_config.functionUrl) {
      CLOUD_CONFIG.functionUrl = cloudConfig.cloud_config.functionUrl;
    }
    if (cloudConfig.cloud_config.apiKey) {
      CLOUD_CONFIG.apiKey = cloudConfig.cloud_config.apiKey;
    }
  }

  console.log('[AI Detector] Extension installed and ready');
});
