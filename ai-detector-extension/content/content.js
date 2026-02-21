(function() {
  'use strict';

  const MEDIA_TYPES = {
    IMAGES: 'images',
    VIDEOS: 'videos',
    AUDIO: 'audio'
  };

  let capturedMedia = {
    images: [],
    videos: [],
    audio: [],
    pageUrl: window.location.href,
    pageTitle: document.title,
    timestamp: new Date().toISOString()
  };

  function captureImages() {
    const images = document.querySelectorAll('img');
    const canvases = document.querySelectorAll('canvas');
    const imageElements = [...images, ...canvases];

    imageElements.forEach((img, index) => {
      const src = img.src || img.toDataURL();
      if (src && !src.startsWith('data:') && src.startsWith('http')) {
        capturedMedia.images.push({
          id: `img_${index}`,
          type: img.tagName.toLowerCase() === 'canvas' ? 'canvas' : 'img',
          src: src,
          alt: img.alt || '',
          width: img.width,
          height: img.height
        });
      }
    });

    return capturedMedia.images.length;
  }

  function captureVideos() {
    const videos = document.querySelectorAll('video');

    videos.forEach((video, index) => {
      const videoData = {
        id: `video_${index}`,
        src: video.src || video.currentSrc || '',
        poster: video.poster || '',
        width: video.videoWidth,
        height: video.videoHeight,
        duration: video.duration,
        hasAudio: video.mozHasAudio || video.webkitHasAudio || video.audioTracks?.length > 0
      };

      if (videoData.src || videoData.poster) {
        capturedMedia.videos.push(videoData);
      }
    });

    const videoElements = document.querySelectorAll('[data-video-src], [data-video-url]');
    videoElements.forEach((el, index) => {
      const src = el.dataset.videoSrc || el.dataset.videoUrl;
      if (src) {
        capturedMedia.videos.push({
          id: `video_data_${index}`,
          type: 'data_attribute',
          src: src
        });
      }
    });

    return capturedMedia.videos.length;
  }

  function captureAudioElements() {
    const audioElements = document.querySelectorAll('audio');
    const videoWithAudio = document.querySelectorAll('video[audio]');

    audioElements.forEach((audio, index) => {
      capturedMedia.audio.push({
        id: `audio_${index}`,
        src: audio.src || '',
        type: 'audio_element'
      });
    });

    videoWithAudio.forEach((video, index) => {
      capturedMedia.audio.push({
        id: `video_audio_${index}`,
        src: video.src || video.currentSrc || '',
        type: 'video_with_audio'
      });
    });

    return capturedMedia.audio.length;
  }

  function captureAllMedia() {
    capturedMedia.images = [];
    capturedMedia.videos = [];
    capturedMedia.audio = [];
    capturedMedia.pageUrl = window.location.href;
    capturedMedia.pageTitle = document.title;
    capturedMedia.timestamp = new Date().toISOString();

    const imageCount = captureImages();
    const videoCount = captureVideos();
    const audioCount = captureAudioElements();

    return {
      success: true,
      mediaCount: {
        images: imageCount,
        videos: videoCount,
        audio: audioCount,
        total: imageCount + videoCount + audioCount
      },
      media: capturedMedia
    };
  }

  function getPageMetadata() {
    const metaTags = document.querySelectorAll('meta[property*="og:"], meta[name*="twitter"]');
    const metadata = {};

    metaTags.forEach(tag => {
      const key = tag.getAttribute('property') || tag.getAttribute('name');
      const value = tag.getAttribute('content');
      if (key && value) {
        metadata[key] = value;
      }
    });

    return {
      url: window.location.href,
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.content || '',
      ogTags: metadata,
      platform: detectPlatform()
    };
  }

  function detectPlatform() {
    const hostname = window.location.hostname;
    if (hostname.includes('twitter') || hostname.includes('x.com')) return 'twitter';
    if (hostname.includes('facebook')) return 'facebook';
    if (hostname.includes('instagram')) return 'instagram';
    if (hostname.includes('tiktok')) return 'tiktok';
    if (hostname.includes('youtube')) return 'youtube';
    if (hostname.includes('reddit')) return 'reddit';
    if (hostname.includes('linkedin')) return 'linkedin';
    return 'unknown';
  }

  chrome.runtime?.onMessage?.addListener((request, sender, sendResponse) => {
    if (request.action === 'captureMedia') {
      const result = captureAllMedia();
      const metadata = getPageMetadata();
      sendResponse({
        ...result,
        metadata: metadata
      });
    } else if (request.action === 'getPageInfo') {
      sendResponse(getPageMetadata());
    }
    return true;
  });

  window.aiDetectorContent = {
    captureAllMedia,
    getPageMetadata,
    getCapturedMedia: () => capturedMedia
  };
})();
