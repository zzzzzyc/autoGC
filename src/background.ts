import type { InternalMessage } from './types';

console.log('autoGC Service Worker Initialized');

chrome.runtime.onMessage.addListener((message: InternalMessage, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  if (message.action === 'FETCH_CHECKER') {
    // Handle cross-origin fetch for checker websites
    console.log('Received fetch request for', message.payload?.url);
    // TODO: implement fetch logic
    sendResponse({ success: true, data: 'mock' });
    return true; // keep channel open for async
  }
});
