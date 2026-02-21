document.addEventListener('DOMContentLoaded', async () => {
  const resultDiv = document.getElementById('result');
  const pageInfoDiv = document.getElementById('pageInfo');

  let currentTab = null;

  async function getActiveTab() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    return tabs[0];
  }

  async function capturePageMedia(tab) {
    const captureFunction = function() {
      const capturedMedia = {
        images: [],
        pageUrl: window.location.href,
        pageTitle: document.title,
        timestamp: new Date().toISOString()
      };

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

      function isLikelyUIElement(img) {
        const className = (img.className || '').toString().toLowerCase();
        const id = (img.id || '').toLowerCase();
        const alt = (img.alt || '').toLowerCase();
        const src = (img.src || '').toLowerCase();

        const uiPatterns = ['icon', 'logo', 'avatar', 'thumbnail', 'emoji', 'button', 'nav', 'sidebar', 'footer', 'header', 'banner', 'sprite', 'tracking', 'pixel', 'ad', 'sponsor', 'promo'];

        if (uiPatterns.some(p => className.includes(p) || id.includes(p) || alt.includes(p))) {
          return true;
        }

        if (img.width < 100 || img.height < 100) {
          return true;
        }

        if (src.includes('static') || src.includes('emoji') || src.includes('icon') || src.includes('logo')) {
          return true;
        }

        return false;
      }

      function getModalImage() {
        const modalSelectors = [
          '[data-testid="image-container"] img',
          '[data-testid="modal"] img',
          '[role="dialog"] img',
          '.gallery-modal img',
          '.lightbox img',
          '.modal img',
          '.image-preview img',
          '[data-lightbox="true"] img',
          'faceplate-tab-panel img',
          '[data-reddit-viewer] img',
          'reddit-image-viewer img'
        ];

        for (const selector of modalSelectors) {
          const modalImg = document.querySelector(selector);
          if (modalImg && modalImg.src && modalImg.src.startsWith('http') && !isLikelyUIElement(modalImg)) {
            return modalImg;
          }
        }

        const allImages = document.querySelectorAll('img');
        let largestModalImg = null;
        let largestModalArea = 0;

        allImages.forEach(img => {
          if (img.src && img.src.startsWith('http') && !isLikelyUIElement(img)) {
            const rect = img.getBoundingClientRect();
            const area = rect.width * rect.height;
            const inView = rect.top < window.innerHeight && rect.bottom > 0;

            if (inView && area > largestModalArea) {
              let isInModal = false;
              let el = img;
              for (let i = 0; i < 8 && el; i++) {
                const style = window.getComputedStyle(el);
                if (style.position === 'fixed' || style.position === 'absolute') {
                  isInModal = true;
                  break;
                }
                el = el.parentElement;
              }

              if (isInModal) {
                largestModalImg = img;
                largestModalArea = area;
              }
            }
          }
        });

        return largestModalImg;
      }

      function getLargestVisibleImage() {
        const allImages = document.querySelectorAll('img');
        let largestImg = null;
        let largestArea = 0;

        allImages.forEach(img => {
          if (img.src && img.src.startsWith('http') && !isLikelyUIElement(img)) {
            const rect = img.getBoundingClientRect();
            const area = rect.width * rect.height;
            const inView = rect.top < window.innerHeight && rect.bottom > 0;

            if (inView && area > largestArea) {
              largestArea = area;
              largestImg = img;
            }
          }
        });
        
        return largestImg;
      }

      const modalImage = getModalImage();

      if (modalImage) {
        capturedMedia.images.push({
          id: 'modal_image',
          src: modalImage.src,
          alt: modalImage.alt || '',
          width: modalImage.naturalWidth || modalImage.width,
          height: modalImage.naturalHeight || modalImage.height,
          isModal: true
        });
      } else {
        const heroImage = getLargestVisibleImage();
        if (heroImage) {
          capturedMedia.images.push({
            id: 'hero_image',
            src: heroImage.src,
            alt: heroImage.alt || '',
            width: heroImage.naturalWidth || heroImage.width,
            height: heroImage.naturalHeight || heroImage.height,
            isHero: true
          });
        }
      }

      return {
        success: true,
        mediaCount: {
          images: capturedMedia.images.length
        },
        media: capturedMedia,
        metadata: getPageMetadata()
      };
    };

    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: captureFunction
      });

      return results[0]?.result || null;
    } catch (error) {
      console.error('Failed to capture media:', error);
      return null;
    }
  }

  async function updateUI(mediaData, metadata) {
    if (!mediaData || !mediaData.media) return;

    const counts = mediaData.mediaCount;
    document.getElementById('imageCount').textContent = counts.images;

    const platform = metadata.platform || 'unknown';
    const platformDisplay = platform.charAt(0).toUpperCase() + platform.slice(1);

    pageInfoDiv.innerHTML = `
      <p style="font-size: 12px; color: #333; word-break: break-all;">
        ${metadata.title || 'Unknown Page'}
      </p>
      <span class="platform-badge">${platformDisplay}</span>
    `;

    const gallerySection = document.getElementById('gallerySection');
    const imageGallery = document.getElementById('imageGallery');
    const viewMore = document.getElementById('viewMore');

    if (mediaData.media.images && mediaData.media.images.length > 0) {
      gallerySection.style.display = 'block';
      imageGallery.innerHTML = '';

      if (mediaData.media.images.length === 1) {
        imageGallery.classList.add('single-image');
      } else {
        imageGallery.classList.remove('single-image');
      }

      const maxDisplay = 9;
      const imagesToShow = mediaData.media.images.slice(0, maxDisplay);

      imagesToShow.forEach((img, index) => {
        if (img.src) {
          const imgEl = document.createElement('img');
          imgEl.src = img.src;
          imgEl.alt = img.alt || 'Image ' + (index + 1);
          imgEl.title = (img.isModal ? 'Preview Image' : 'Image') + ' - ' + img.width + 'x' + img.height;
          imageGallery.appendChild(imgEl);
        }
      });

      const remaining = mediaData.media.images.length - maxDisplay;
      if (remaining > 0) {
        viewMore.textContent = '+' + remaining + ' more images';
        viewMore.style.display = 'block';
      } else {
        viewMore.style.display = 'none';
      }

      if (mediaData.media.images.length === 1) {
        const img = mediaData.media.images[0];
        if (img.isModal) {
          viewMore.textContent = 'Preview Image';
        } else if (img.isHero) {
          viewMore.textContent = 'Main Image';
        }
        viewMore.style.display = 'block';
      }
    } else {
      gallerySection.style.display = 'none';
    }
  }

  async function init() {
    currentTab = await getActiveTab();

    if (currentTab?.id) {
      try {
        const captureResult = await capturePageMedia(currentTab);
        if (captureResult?.success) {
          await updateUI(captureResult, captureResult.metadata);
        }
      } catch (error) {
        console.log('Could not capture initial media:', error.message);
      }
    }
  }

  init();
});
