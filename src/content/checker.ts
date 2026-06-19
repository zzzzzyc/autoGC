// import type { InternalMessage } from '../types';
import { certitudeSelectors, geocheckSelectors } from '../utils/selectors';

console.log('autoGC Content Script injected into Checker Website');

// Detect which checker this is based on URL
const currentUrl = window.location.href;

if (currentUrl.includes('certitude.org')) {
    console.log('Certitude Checker detected');
    // TODO: Certitude logic
} else if (currentUrl.includes('geocheck.org')) {
    console.log('GeoCheck detected');
    // TODO: GeoCheck logic
}

// --- Debug Message Listener ---
if (typeof chrome !== 'undefined' && chrome.runtime) {
  chrome.runtime.onMessage.addListener((message: any, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
    if (message.action === 'GET_PAGE_STATE') {
      let type = 'Unknown Checker';
      let solved = false;
      let failed = false;
      let hasCaptcha = false;
      let captchaBase64: string | null = null;
      let solvedCoords: string | null = null;
      
      const getBase64Image = (img: HTMLImageElement) => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth || img.width || 120;
          canvas.height = img.naturalHeight || img.height || 40;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            return canvas.toDataURL("image/png");
          }
        } catch (e) {
          console.error("Canvas error:", e);
        }
        return null;
      };
      
      if (currentUrl.includes('certitude.org')) {
        type = 'Certitude';
        solved = !!document.querySelector(certitudeSelectors.successElement);
        failed = !!document.querySelector(certitudeSelectors.failureElement);
        
        if (solved) {
          const solutionEl = document.querySelector('#solution');
          if (solutionEl) {
            solvedCoords = solutionEl.textContent?.trim() || null;
          }
        }
      } else if (currentUrl.includes('geocheck.org')) {
        type = 'GeoCheck';
        solved = !!document.querySelector(geocheckSelectors.successElement);
        failed = !!document.querySelector(geocheckSelectors.failureElement);
        const captchaImg = document.querySelector(geocheckSelectors.captchaImage) as HTMLImageElement;
        if (captchaImg) {
          hasCaptcha = true;
          captchaBase64 = getBase64Image(captchaImg);
        }
        
        if (solved) {
          const tds = Array.from(document.querySelectorAll('td'));
          const coordTd = tds.find(td => td.textContent?.includes('Coordinate:'));
          if (coordTd && coordTd.nextElementSibling) {
            const cacheData = coordTd.nextElementSibling.querySelector('.cachedata');
            if (cacheData) {
              // Replace non-breaking spaces with regular spaces
              solvedCoords = cacheData.textContent?.replace(/\u00A0/g, ' ').trim() || null;
            }
          }
        }
      }
      
      // Attempt to extract GC Code from title or body text
      const titleMatch = document.title.match(/\b(GC[A-Z0-9]{3,7})\b/i);
      let gcCode = titleMatch ? titleMatch[1].toUpperCase() : null;
      if (!gcCode) {
        const bodyText = document.body?.innerText || '';
        const bodyMatch = bodyText.match(/\b(GC[A-Z0-9]{3,7})\b/i);
        if (bodyMatch) {
          gcCode = bodyMatch[1].toUpperCase();
        }
      }
      
      sendResponse({ 
        success: true, 
        type: type + ' Page', 
        data: { 
          url: currentUrl,
          checkerType: type.toLowerCase(),
          title: document.title,
          solved,
          failed,
          hasCaptcha,
          captchaBase64,
          solvedCoords,
          gcCode
        }, 
        actions: ['DEBUG_FILL_CHECKER', 'DEBUG_SUBMIT_CHECKER'] 
      });
    } else if (message.action === 'DEBUG_FILL_CHECKER') {
      if (currentUrl.includes('certitude.org')) {
        const input = document.querySelector(certitudeSelectors.solutionInput) as HTMLInputElement;
        if (input) {
          input.value = message.payload.solution;
          sendResponse({ success: true, message: 'Certitude filled' });
          return;
        }
      } else if (currentUrl.includes('geocheck.org')) {
        const input = document.querySelector(geocheckSelectors.oneFieldInput) as HTMLInputElement;
        const captchaInput = document.querySelector(geocheckSelectors.captchaInput) as HTMLInputElement;
        
        if (input) {
          input.value = message.payload.solution;
          if (captchaInput && message.payload.captcha) {
            captchaInput.value = message.payload.captcha;
          }
          sendResponse({ success: true, message: 'GeoCheck filled' });
          return;
        }
      }
      sendResponse({ success: false, error: 'Input field not found on this Checker page' });
    } else if (message.action === 'DEBUG_SUBMIT_CHECKER') {
      if (currentUrl.includes('certitude.org')) {
        const submitBtn = document.querySelector(certitudeSelectors.submitButton) as HTMLInputElement;
        if (submitBtn) {
          submitBtn.click();
          sendResponse({ success: true, message: 'Certitude submitted' });
          return;
        }
      } else if (currentUrl.includes('geocheck.org')) {
        const submitBtn = document.querySelector(geocheckSelectors.submitButton) as HTMLInputElement;
        if (submitBtn) {
          submitBtn.click();
          sendResponse({ success: true, message: 'GeoCheck submitted' });
          return;
        }
      }
      sendResponse({ success: false, error: 'Submit button not found on this Checker page' });
    }
  });
}

