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
// @ts-ignore
if (typeof chrome !== 'undefined' && chrome.runtime) {
  // @ts-ignore
  chrome.runtime.onMessage.addListener((message: any, sender, sendResponse) => {
    if (message.action === 'GET_PAGE_STATE') {
      let type = 'Unknown Checker';
      if (currentUrl.includes('certitude.org')) type = 'Certitude';
      if (currentUrl.includes('geocheck.org')) type = 'GeoCheck';
      
      sendResponse({ 
        success: true, 
        type: type + ' Page', 
        data: { url: currentUrl }, 
        actions: ['DEBUG_FILL_CHECKER'] 
      });
    } else if (message.action === 'DEBUG_FILL_CHECKER') {
      if (currentUrl.includes('certitude.org')) {
        const input = document.querySelector(certitudeSelectors.solutionInput) as HTMLInputElement;
        if (input) {
          input.value = message.payload.solution;
          sendResponse({ success: true, message: 'Certitude filled' });
          return true;
        }
      } else if (currentUrl.includes('geocheck.org')) {
        const input = document.querySelector(geocheckSelectors.oneFieldInput) as HTMLInputElement;
        if (input) {
          input.value = message.payload.solution;
          sendResponse({ success: true, message: 'GeoCheck filled' });
          return true;
        }
      }
      sendResponse({ success: false, error: 'Input field not found on this Checker page' });
    }
    return true;
  });
}

