import type { GCInfo, CheckerData, CheckerType } from '../types';
import { geocachingSelectors } from '../utils/selectors';

console.log('autoGC Content Script injected into Geocaching.com');

const decodeRot13 = (text: string): string => {
  let inBracket = false;
  return text.split('').map(c => {
    if (c === '[') { inBracket = true; return c; }
    if (c === ']') { inBracket = false; return c; }
    if (inBracket) return c;
    return c.replace(/[a-zA-Z]/, char => {
      const charCode = char.charCodeAt(0);
      const limit = char <= 'Z' ? 90 : 122;
      const shifted = charCode + 13;
      return String.fromCharCode(limit >= shifted ? shifted : shifted - 26);
    });
  }).join('');
};

export function extractGCInfo(): GCInfo | null {
  console.log('Extracting GC info...');
  
  const gcCodeEl = document.querySelector(geocachingSelectors.gcCode);
  if (!gcCodeEl) return null; // Not on a cache details page

  const gcCode = gcCodeEl.textContent?.trim() || '';
  
  const typeEl = document.querySelector(geocachingSelectors.cacheType);
  
  const dImg = document.querySelector(geocachingSelectors.difficulty) as HTMLImageElement;
  const tImg = document.querySelector(geocachingSelectors.terrain) as HTMLImageElement;
  const dMatch = dImg?.alt?.match(/([\d\.]+)/);
  const tMatch = tImg?.alt?.match(/([\d\.]+)/);
  const difficulty = dMatch ? parseFloat(dMatch[1]) : null;
  const terrain = tMatch ? parseFloat(tMatch[1]) : null;
  
  const ownerEl = document.querySelector(geocachingSelectors.owner) as HTMLAnchorElement;
  const hiddenDateEl = document.querySelector(geocachingSelectors.hiddenDate);
  const noteEl = document.querySelector(geocachingSelectors.personalNote) as HTMLTextAreaElement;
  
  const attrEls = document.querySelectorAll(geocachingSelectors.attributes);
  const attributes: string[] = [];
  attrEls.forEach(el => {
    const img = el as HTMLImageElement;
    const name = img.alt || img.title || img.src.split('/').pop()?.replace('.png', '') || 'unknown_attr';
    if (name && name.toLowerCase() !== 'blank') {
      attributes.push(name.trim());
    }
  });

  const fpEl = document.querySelector(geocachingSelectors.favoritePoints);
  const descEls = document.querySelectorAll(geocachingSelectors.description);
  let descriptionHtml = '';
  descEls.forEach(el => {
    if (el.innerHTML.trim()) descriptionHtml += el.innerHTML.trim() + '<br/>';
  });
  const hintEl = document.querySelector(geocachingSelectors.hint);

  const tbInventory = Array.from(document.querySelectorAll(geocachingSelectors.tbInventory)).map(a => ({
    name: (a as HTMLAnchorElement).textContent?.trim() || '',
    link: (a as HTMLAnchorElement).href
  }));

  const bookmarks = Array.from(document.querySelectorAll(geocachingSelectors.bookmarks)).map(a => ({
    name: (a as HTMLAnchorElement).textContent?.trim() || '',
    link: (a as HTMLAnchorElement).href,
    user: (a as HTMLAnchorElement).title || 'Unknown' 
  }));

  const myBookmarks = Array.from(document.querySelectorAll(geocachingSelectors.myBookmarks)).map(a => ({
    name: (a as HTMLAnchorElement).textContent?.trim() || '',
    link: (a as HTMLAnchorElement).href
  }));

  const logs = Array.from(document.querySelectorAll(geocachingSelectors.logs)).slice(0, 5).map(row => ({
    user: row.textContent?.slice(0, 50).trim() || 'Unknown', // Simplistic extraction
    date: '', 
    type: '', 
    text: row.textContent?.trim() || ''
  }));

  return {
    gcCode,
    cacheType: typeEl?.getAttribute('title') || 'Unknown',
    difficulty,
    terrain,
    owner: ownerEl?.textContent?.trim() || '',
    ownerLink: ownerEl?.href || '',
    hiddenDate: (() => {
      if (!hiddenDateEl || !hiddenDateEl.textContent) return '';
      const normalized = hiddenDateEl.textContent.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();
      // Check if a colon exists before the first digit
      const firstDigitIndex = normalized.search(/\d/);
      const colonIndex = firstDigitIndex !== -1 ? normalized.lastIndexOf(':', firstDigitIndex) : normalized.indexOf(':');
      const hasLabelColon = colonIndex !== -1 && (firstDigitIndex === -1 || colonIndex < firstDigitIndex);
      const base = hasLabelColon ? normalized.substring(colonIndex + 1).trim() : normalized;
      // Strip common prefixes (case insensitive) followed by optional spaces
      return base.replace(/^(Hidden|Event Date|Release Date)\b\s*/i, '').trim();
    })(),
    note: noteEl?.value || document.querySelector(geocachingSelectors.actionPersonalNote.viewContainer)?.textContent?.trim() || '',
    attributes,
    favoritePoints: parseInt(fpEl?.textContent?.replace(/[^\d]/g, '') || '0', 10) || 0,
    description: descriptionHtml,
    tbInventory,
    bookmarks,
    myBookmarks,
    hint: decodeRot13(hintEl?.textContent?.trim() || ''),
    logs
  };
}

export function extractCheckerLinks(): CheckerData[] {
  console.log('Extracting Checker Links...');
  const links = document.querySelectorAll(geocachingSelectors.checkerLinks);
  const result: CheckerData[] = [];
  
  links.forEach(el => {
    const href = (el as HTMLAnchorElement).href;
    let type: CheckerType = 'unknown';
    if (href.includes('certitude.org') || href.includes('certitudes.org')) type = 'certitude';
    if (href.includes('geocheck.org')) type = 'geocheck';
    
    result.push({ type, link: href });
  });
  
  return result;
}

// --- Automated DOM Workflows ---

export async function executeUpdateCoordinates(coords: string): Promise<string> {
  const trigger = document.querySelector(geocachingSelectors.actionCorrectedCoords.trigger) as HTMLElement;
  if (!trigger) return 'Error: Coordinate edit button not found.';
  
  trigger.click(); // Open popover

  // Wait for popover and input
  return new Promise((resolve) => {
    let attempts = 0;
    const interval = setInterval(() => {
      const input = document.querySelector(geocachingSelectors.actionCorrectedCoords.input) as HTMLInputElement;
      if (input) {
        clearInterval(interval);
        input.value = coords;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        
        const initialPopover = document.querySelector(geocachingSelectors.actionCorrectedCoords.popover);
        const submit = document.querySelector(geocachingSelectors.actionCorrectedCoords.submit) as HTMLButtonElement;
        if (submit) {
          submit.click();
          
          // Wait for accept step or check if popover closed/unmounted
          let acceptAttempts = 0;
          const acceptInterval = setInterval(() => {
            const acceptBtn = document.querySelector(geocachingSelectors.actionCorrectedCoords.accept) as HTMLButtonElement;
            if (acceptBtn) {
              clearInterval(acceptInterval);
              acceptBtn.click();
              resolve('Coordinates accepted. Page will now refresh.');
              return; // Crucial early return to prevent double resolve
            }
            
            // Check if the popover is gone or unmounted (direct submission completed)
            const popover = initialPopover ? document.querySelector(geocachingSelectors.actionCorrectedCoords.popover) : document.body;
            if (!popover) {
              clearInterval(acceptInterval);
              resolve('Coordinates updated successfully.');
              return; // Crucial early return
            }

            if (++acceptAttempts > 20) {
              clearInterval(acceptInterval);
              resolve('Error: Accept button did not appear and popover did not close.');
            }
          }, 200);
        } else {
          resolve('Error: Submit button not found in popover.');
        }
        return;
      }
      if (++attempts > 20) {
        clearInterval(interval);
        resolve('Error: Corrected coords input popover did not appear.');
      }
    }, 200);
  });
}

export async function executeSavePersonalNote(text: string): Promise<string> {
  // If we are not in edit mode, trigger edit mode
  let editContainer = document.querySelector(geocachingSelectors.actionPersonalNote.editContainer) as HTMLElement;
  if (editContainer && editContainer.style.display === 'none') {
    const trigger = document.querySelector(geocachingSelectors.actionPersonalNote.trigger) as HTMLElement;
    if (trigger) trigger.click();
  }

  return new Promise((resolve) => {
    let attempts = 0;
    const interval = setInterval(() => {
      const textarea = document.querySelector(geocachingSelectors.actionPersonalNote.textarea) as HTMLTextAreaElement;
      if (textarea && textarea.offsetParent !== null) {
        clearInterval(interval);
        textarea.value = text;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        
        const saveBtn = document.querySelector(geocachingSelectors.actionPersonalNote.submit) as HTMLButtonElement;
        if (saveBtn) {
          saveBtn.click();
          resolve('Personal Note saved successfully.');
        } else {
          resolve('Error: Save button not found.');
        }
        return;
      }
      if (++attempts > 10) {
        clearInterval(interval);
        resolve('Error: Note text area did not become visible.');
      }
    }, 200);
  });
}

// --- Debug Message Listener ---
// @ts-ignore
if (typeof chrome !== 'undefined' && chrome.runtime) {
  // @ts-ignore
  chrome.runtime.onMessage.addListener((message: any, sender, sendResponse) => {
    if (message.action === 'GET_PAGE_STATE') {
      const data = extractGCInfo();
      const checkers = extractCheckerLinks();
      sendResponse({ 
        success: true, 
        type: 'Geocache Detail Page', 
        data: { info: data, checkers }, 
        actions: ['DEBUG_WRITE_NOTE', 'UPDATE_COORDS'] 
      });
      return true;
    } else if (message.action === 'DEBUG_READ_CACHE') {
      const data = extractGCInfo();
      const checkers = extractCheckerLinks();
      sendResponse({ success: true, data: { info: data, checkers } });
    } else if (message.action === 'DEBUG_WRITE_NOTE') {
      executeSavePersonalNote(message.payload.text).then(res => {
        sendResponse({ success: true, message: res });
      });
      return true; // Keep channel open for async
    } else if (message.action === 'UPDATE_COORDS') {
      executeUpdateCoordinates(message.payload.coords).then(res => {
        sendResponse({ success: true, message: res });
      });
      return true;
    }
    return true;
  });
}
