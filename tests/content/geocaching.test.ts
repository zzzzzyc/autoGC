import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { extractGCInfo, executeUpdateCoordinates } from '../../src/content/geocaching';
import * as fs from 'fs';
import * as path from 'path';

function loadDOMFromCache(filename: string) {
  const filePath = path.join(__dirname, '../../dom_cache', filename);
  const html = fs.readFileSync(filePath, 'utf8');
  document.documentElement.innerHTML = html;
}

describe('Feature 1: hiddenDate parsing', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  // --- Tier 1: Feature Coverage (5 tests) ---
  it('should parse standard Hidden date with spaces and newlines', () => {
    document.body.innerHTML = `
      <span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode">GC12345</span>
      <div id="ctl00_ContentBody_mcd2">
        Hidden
        :
        6/10/2026
      </div>
    `;
    const info = extractGCInfo();
    expect(info?.hiddenDate).toBe('6/10/2026');
  });

  it('should parse standard Event Date with spaces and newlines', () => {
    document.body.innerHTML = `
      <span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode">GC12345</span>
      <div id="ctl00_ContentBody_mcd2">
        Event Date
        :
        4/20/2026
      </div>
    `;
    const info = extractGCInfo();
    expect(info?.hiddenDate).toBe('4/20/2026');
  });

  it('should parse Hidden date with padded digits', () => {
    document.body.innerHTML = `
      <span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode">GC12345</span>
      <div id="ctl00_ContentBody_mcd2">
        Hidden
        :
        01/02/2025
      </div>
    `;
    const info = extractGCInfo();
    expect(info?.hiddenDate).toBe('01/02/2025');
  });

  it('should parse Event Date with padded digits', () => {
    document.body.innerHTML = `
      <span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode">GC12345</span>
      <div id="ctl00_ContentBody_mcd2">
        Event Date
        :
        12/31/2024
      </div>
    `;
    const info = extractGCInfo();
    expect(info?.hiddenDate).toBe('12/31/2024');
  });

  it('should parse Hidden date with single digit month and day', () => {
    document.body.innerHTML = `
      <span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode">GC12345</span>
      <div id="ctl00_ContentBody_mcd2">
        Hidden
        :
        7/7/2020
      </div>
    `;
    const info = extractGCInfo();
    expect(info?.hiddenDate).toBe('7/7/2020');
  });

  // --- Tier 2: Boundary & Corner Cases (7 tests) ---
  it('should return empty string if Hidden element is missing entirely', () => {
    document.body.innerHTML = `
      <span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode">GC12345</span>
    `;
    const info = extractGCInfo();
    expect(info?.hiddenDate).toBe('');
  });

  it('should return empty string if Hidden element has no content', () => {
    document.body.innerHTML = `
      <span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode">GC12345</span>
      <div id="ctl00_ContentBody_mcd2"></div>
    `;
    const info = extractGCInfo();
    expect(info?.hiddenDate).toBe('');
  });

  it('should handle only whitespace in Hidden element', () => {
    document.body.innerHTML = `
      <span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode">GC12345</span>
      <div id="ctl00_ContentBody_mcd2">   \n   \t   </div>
    `;
    const info = extractGCInfo();
    expect(info?.hiddenDate).toBe('');
  });

  it('should parse Hidden date format without colons', () => {
    document.body.innerHTML = `
      <span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode">GC12345</span>
      <div id="ctl00_ContentBody_mcd2">
        Hidden 6/10/2026
      </div>
    `;
    const info = extractGCInfo();
    expect(info?.hiddenDate).toBe('6/10/2026');
  });

  it('should parse Event Date format without colons', () => {
    document.body.innerHTML = `
      <span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode">GC12345</span>
      <div id="ctl00_ContentBody_mcd2">
        Event Date 4/20/2026
      </div>
    `;
    const info = extractGCInfo();
    expect(info?.hiddenDate).toBe('4/20/2026');
  });

  it('should handle multiple colons in Hidden label', () => {
    document.body.innerHTML = `
      <span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode">GC12345</span>
      <div id="ctl00_ContentBody_mcd2">
        Hidden: Date: 6/10/2026
      </div>
    `;
    const info = extractGCInfo();
    expect(info?.hiddenDate).toBe('6/10/2026');
  });

  it('should parse future date formats', () => {
    document.body.innerHTML = `
      <span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode">GC12345</span>
      <div id="ctl00_ContentBody_mcd2">
        Hidden: 12/31/2099
      </div>
    `;
    const info = extractGCInfo();
    expect(info?.hiddenDate).toBe('12/31/2099');
  });

  it('should parse date containing a time with a colon', () => {
    document.body.innerHTML = `
      <span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode">GC12345</span>
      <div id="ctl00_ContentBody_mcd2">
        Event Date: 06/10/2026 12:00
      </div>
    `;
    const info = extractGCInfo();
    expect(info?.hiddenDate).toBe('06/10/2026 12:00');
  });
});

describe('Feature 6: Hint decryption and extraction', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should return empty string if hint element is missing', () => {
    document.body.innerHTML = `
      <span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode">GC12345</span>
    `;
    const info = extractGCInfo();
    expect(info?.hint).toBe('');
  });

  it('should decrypt hint when decrypt link is missing (default behavior)', () => {
    document.body.innerHTML = `
      <span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode">GC12345</span>
      <div id="div_hint">Uryyb Jbeyq!</div>
    `;
    const info = extractGCInfo();
    expect(info?.hint).toBe('Hello World!');
  });

  it('should decrypt hint when decrypt link is in "Decrypt" state (not decrypted yet)', () => {
    document.body.innerHTML = `
      <span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode">GC12345</span>
      <div id="div_hint">Uryyb Jbeyq!</div>
      <a id="ctl00_ContentBody_lnkDH" title="Decrypt">Decrypt</a>
    `;
    const info = extractGCInfo();
    expect(info?.hint).toBe('Hello World!');
  });

  it('should NOT decrypt hint when decrypt link has title "Encrypt" (already decrypted)', () => {
    document.body.innerHTML = `
      <span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode">GC12345</span>
      <div id="div_hint">Hello World!</div>
      <a id="ctl00_ContentBody_lnkDH" title="Encrypt">Encrypt</a>
    `;
    const info = extractGCInfo();
    expect(info?.hint).toBe('Hello World!');
  });

  it('should NOT decrypt hint when decrypt link has textContent "Encrypt" (already decrypted)', () => {
    document.body.innerHTML = `
      <span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode">GC12345</span>
      <div id="div_hint">Hello World!</div>
      <a id="ctl00_ContentBody_lnkDH">Encrypt</a>
    `;
    const info = extractGCInfo();
    expect(info?.hint).toBe('Hello World!');
  });
});

describe('Feature 2: executeUpdateCoordinates workflow', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // --- Tier 1: Feature Coverage (5 tests) ---
  it('should successfully complete update on old UI flow (accept button clicked)', async () => {
    document.body.innerHTML = `
      <button id="uxLatLonLink">Edit</button>
    `;

    const trigger = document.getElementById('uxLatLonLink')!;
    trigger.addEventListener('click', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <input class="cc-parse-text" />
        <button class="btn-cc-parse">Submit</button>
      `;
      document.body.appendChild(container);

      const submit = container.querySelector('button.btn-cc-parse')!;
      submit.addEventListener('click', () => {
        const acceptBtn = document.createElement('button');
        acceptBtn.className = 'btn-cc-accept';
        document.body.appendChild(acceptBtn);
      });
    });

    const promise = executeUpdateCoordinates('N 30° 15.000 E 120° 15.000');

    await vi.advanceTimersByTimeAsync(200);
    await vi.advanceTimersByTimeAsync(200);

    const result = await promise;
    expect(result).toBe('Coordinates accepted. Page will now refresh.');
  });

  it('should successfully complete update on new UI flow (popover closed)', async () => {
    document.body.innerHTML = `
      <button class="edit-cache-coordinates">Edit</button>
    `;

    const trigger = document.querySelector('.edit-cache-coordinates')!;
    trigger.addEventListener('click', () => {
      const popover = document.createElement('div');
      popover.setAttribute('data-testid', 'corrected-coords-popover');
      popover.className = 'ccu-update';
      popover.innerHTML = `
        <input data-testid="corrected-coords-input" />
        <button data-testid="corrected-coords-submit">Submit</button>
      `;
      document.body.appendChild(popover);

      const submit = popover.querySelector('[data-testid="corrected-coords-submit"]')!;
      submit.addEventListener('click', () => {
        popover.remove();
      });
    });

    const promise = executeUpdateCoordinates('N 30° 15.000 E 120° 15.000');

    await vi.advanceTimersByTimeAsync(200);
    await vi.advanceTimersByTimeAsync(4200); // Allow old flow timeout to execute under current code

    const result = await promise;
    expect(result).toBe('Coordinates updated successfully.');
  });

  it('should fail if trigger button is not found', async () => {
    document.body.innerHTML = `<div>No trigger here</div>`;
    const result = await executeUpdateCoordinates('N 30° 15.000 E 120° 15.000');
    expect(result).toBe('Error: Coordinate edit button not found.');
  });

  it('should fail if accept button does not appear on old UI flow', async () => {
    document.body.innerHTML = `
      <button id="uxLatLonLink">Edit</button>
    `;

    const trigger = document.getElementById('uxLatLonLink')!;
    trigger.addEventListener('click', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <input class="cc-parse-text" />
        <button class="btn-cc-parse">Submit</button>
      `;
      document.body.appendChild(container);
    });

    const promise = executeUpdateCoordinates('N 30° 15.000 E 120° 15.000');

    await vi.advanceTimersByTimeAsync(200);
    await vi.advanceTimersByTimeAsync(4200);

    const result = await promise;
    expect(result).toBe('Error: Accept button did not appear and popover did not close.');
  });

  it('should fail if popover does not close and accept button does not appear on new UI flow', async () => {
    document.body.innerHTML = `
      <button class="edit-cache-coordinates">Edit</button>
    `;

    const trigger = document.querySelector('.edit-cache-coordinates')!;
    trigger.addEventListener('click', () => {
      const popover = document.createElement('div');
      popover.setAttribute('data-testid', 'corrected-coords-popover');
      popover.className = 'ccu-update';
      popover.innerHTML = `
        <input data-testid="corrected-coords-input" />
        <button data-testid="corrected-coords-submit">Submit</button>
      `;
      document.body.appendChild(popover);
    });

    const promise = executeUpdateCoordinates('N 30° 15.000 E 120° 15.000');

    await vi.advanceTimersByTimeAsync(200);
    await vi.advanceTimersByTimeAsync(4200);

    const result = await promise;
    expect(result).toContain('Error:');
  });

  // --- Tier 2: Boundary & Corner Cases (5 tests) ---
  it('should fail if input popover/field never appears', async () => {
    document.body.innerHTML = `
      <button id="uxLatLonLink">Edit</button>
    `;
    const promise = executeUpdateCoordinates('N 30° 15.000 E 120° 15.000');
    await vi.advanceTimersByTimeAsync(4200);
    const result = await promise;
    expect(result).toBe('Error: Corrected coords input popover did not appear.');
  });

  it('should fail if submit button is missing in the popover', async () => {
    document.body.innerHTML = `
      <button id="uxLatLonLink">Edit</button>
    `;

    const trigger = document.getElementById('uxLatLonLink')!;
    trigger.addEventListener('click', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <input class="cc-parse-text" />
      `;
      document.body.appendChild(container);
    });

    const promise = executeUpdateCoordinates('N 30° 15.000 E 120° 15.000');

    await vi.advanceTimersByTimeAsync(200);
    const result = await promise;
    expect(result).toBe('Error: Submit button not found in popover.');
  });

  it('should fail if input field is missing when popover appears', async () => {
    document.body.innerHTML = `
      <button id="uxLatLonLink">Edit</button>
    `;

    const trigger = document.getElementById('uxLatLonLink')!;
    trigger.addEventListener('click', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <button class="btn-cc-parse">Submit</button>
      `;
      document.body.appendChild(container);
    });

    const promise = executeUpdateCoordinates('N 30° 15.000 E 120° 15.000');

    await vi.advanceTimersByTimeAsync(4200);
    const result = await promise;
    expect(result).toBe('Error: Corrected coords input popover did not appear.');
  });

  it('should handle double-resolve or race conditions when accept button appears at the limit', async () => {
    document.body.innerHTML = `
      <button id="uxLatLonLink">Edit</button>
    `;

    const trigger = document.getElementById('uxLatLonLink')!;
    trigger.addEventListener('click', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <input class="cc-parse-text" />
        <button class="btn-cc-parse">Submit</button>
      `;
      document.body.appendChild(container);
    });

    const promise = executeUpdateCoordinates('N 30° 15.000 E 120° 15.000');

    await vi.advanceTimersByTimeAsync(200);
    await vi.advanceTimersByTimeAsync(3800);

    const acceptBtn = document.createElement('button');
    acceptBtn.className = 'btn-cc-accept';
    document.body.appendChild(acceptBtn);

    await vi.advanceTimersByTimeAsync(200);
    const result = await promise;
    expect(result).toBe('Coordinates accepted. Page will now refresh.');
  });

  it('should handle exactly 20 failed attempts before timing out', async () => {
    document.body.innerHTML = `
      <button id="uxLatLonLink">Edit</button>
    `;
    const promise = executeUpdateCoordinates('N 30° 15.000 E 120° 15.000');

    await vi.advanceTimersByTime(4000);
    let resolved = false;
    promise.then(() => { resolved = true; });
    await Promise.resolve();
    expect(resolved).toBe(false);

    await vi.advanceTimersByTime(200);
    await Promise.resolve();
    const result = await promise;
    expect(result).toBe('Error: Corrected coords input popover did not appear.');
  });
});

describe('Cross-Feature & Real-World Integration', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // --- Tier 3: Cross-Feature / Concurrency (2 tests) ---
  it('should allow extracting info concurrently while coordinate update is in progress', async () => {
    document.body.innerHTML = `
      <span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode">GCBQE5C</span>
      <div id="ctl00_ContentBody_mcd2">Hidden: 6/10/2026</div>
      <button id="uxLatLonLink">Edit</button>
    `;

    const promise = executeUpdateCoordinates('N 30° 15.000 E 120° 15.000');
    const info = extractGCInfo();
    expect(info).not.toBeNull();
    expect(info?.gcCode).toBe('GCBQE5C');
    expect(info?.hiddenDate).toBe('6/10/2026');

    await vi.advanceTimersByTimeAsync(4200);
    await promise;
  });

  it('should handle concurrent calls to executeUpdateCoordinates', async () => {
    document.body.innerHTML = `
      <button id="uxLatLonLink">Edit</button>
    `;

    const trigger = document.getElementById('uxLatLonLink')!;
    trigger.addEventListener('click', () => {
      if (document.querySelector('input.cc-parse-text')) return;

      const container = document.createElement('div');
      container.innerHTML = `
        <input class="cc-parse-text" />
        <button class="btn-cc-parse">Submit</button>
      `;
      document.body.appendChild(container);

      const submit = container.querySelector('button.btn-cc-parse')!;
      submit.addEventListener('click', () => {
        if (document.querySelector('button.btn-cc-accept')) return;
        const acceptBtn = document.createElement('button');
        acceptBtn.className = 'btn-cc-accept';
        document.body.appendChild(acceptBtn);
      });
    });

    const promise1 = executeUpdateCoordinates('N 30° 15.000 E 120° 15.000');
    const promise2 = executeUpdateCoordinates('N 30° 15.000 E 120° 15.000');

    await vi.advanceTimersByTimeAsync(200);
    await vi.advanceTimersByTimeAsync(200);

    const result1 = await promise1;
    const result2 = await promise2;

    expect(result1).toBe('Coordinates accepted. Page will now refresh.');
    expect(result2).toBe('Coordinates accepted. Page will now refresh.');
  });

  // --- Tier 4: Real-World DOM Cache (5 tests) ---
  it('should extract correct GC info from cache_dom_1.txt', () => {
    loadDOMFromCache('cache_dom_1.txt');
    const info = extractGCInfo();
    expect(info).not.toBeNull();
    expect(info?.gcCode).toBe('GCBQE5C');
    expect(info?.cacheType).toBe(3);
    expect(info?.difficulty).toBe(3);
    expect(info?.terrain).toBe(1);
    expect(info?.hiddenDate).toBe('6/10/2026');
    expect(info?.owner).toBe('octoxox');
  });

  it('should extract correct GC info from cache_dom_2.txt', () => {
    loadDOMFromCache('cache_dom_2.txt');
    const info = extractGCInfo();
    expect(info).not.toBeNull();
    expect(info?.gcCode).toBe('GCBNMY9');
    expect(info?.cacheType).toBe(3);
    expect(info?.difficulty).toBe(1.5);
    expect(info?.terrain).toBe(1.5);
    expect(info?.hiddenDate).toBe('4/22/2026');
    expect(info?.owner).toBe('magic_snake');
  });

  it('should extract correct GC info from cache_dom_3.txt', () => {
    loadDOMFromCache('cache_dom_3.txt');
    const info = extractGCInfo();
    expect(info).not.toBeNull();
    expect(info?.gcCode).toBe('GC5X049');
    expect(info?.cacheType).toBe(3);
    expect(info?.difficulty).toBe(2);
    expect(info?.terrain).toBe(1.5);
    expect(info?.hiddenDate).toBe('6/5/2015');
    expect(info?.owner).toBe('magic_snake');
  });

  it('should extract correct log types and images from cache_dom_3.txt', () => {
    loadDOMFromCache('cache_dom_3.txt');
    const info = extractGCInfo();
    expect(info?.logs).toHaveLength(5);
    
    // First 5 logs in cache_dom_3.txt are all "Found it" (type 2)
    info?.logs.forEach(log => {
      expect(log.type).toBe(2);
    });

    // Manually check rows 8 (DNF) and 9 (Write Note) to ensure our extraction selector is correct
    const rows = document.querySelectorAll('.LogsTable tr, #cache_logs_table tr, .log-container');
    
    const dnfRow = rows[7]; // Log 8
    const dnfIcon = (
      dnfRow.querySelector('.LogDisplayRight img[src*="/images/logtypes/"], .LogType img[src*="/images/logtypes/"]') ||
      dnfRow.querySelector('img[src*="/images/logtypes/"]:not(.LogDisplayLeft img)')
    ) as HTMLImageElement;
    expect(dnfIcon).not.toBeNull();
    const dnfMatch = dnfIcon.src.match(/\/images\/logtypes\/(\d+)\.png/);
    expect(dnfMatch?.[1]).toBe('3');

    const noteRow = rows[8]; // Log 9
    const noteIcon = (
      noteRow.querySelector('.LogDisplayRight img[src*="/images/logtypes/"], .LogType img[src*="/images/logtypes/"]') ||
      noteRow.querySelector('img[src*="/images/logtypes/"]:not(.LogDisplayLeft img)')
    ) as HTMLImageElement;
    expect(noteIcon).not.toBeNull();
    const noteMatch = noteIcon.src.match(/\/images\/logtypes\/(\d+)\.png/);
    expect(noteMatch?.[1]).toBe('4');
  });

  it('should execute coordinate update workflow on cache_dom_1.txt DOM', async () => {
    loadDOMFromCache('cache_dom_1.txt');

    const trigger = document.getElementById('uxLatLonLink')!;
    trigger.addEventListener('click', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <input class="cc-parse-text" />
        <button class="btn-cc-parse">Submit</button>
      `;
      document.body.appendChild(container);

      const submit = container.querySelector('button.btn-cc-parse')!;
      submit.addEventListener('click', () => {
        const acceptBtn = document.createElement('button');
        acceptBtn.className = 'btn-cc-accept';
        document.body.appendChild(acceptBtn);
      });
    });

    const promise = executeUpdateCoordinates('N 30° 15.000 E 120° 15.000');

    await vi.advanceTimersByTimeAsync(200);
    await vi.advanceTimersByTimeAsync(200);

    const result = await promise;
    expect(result).toBe('Coordinates accepted. Page will now refresh.');
  });

  it('should execute coordinate update workflow on cache_dom_2.txt DOM', async () => {
    loadDOMFromCache('cache_dom_2.txt');

    const trigger = document.querySelector('.edit-cache-coordinates')!;
    trigger.addEventListener('click', () => {
      const popover = document.createElement('div');
      popover.setAttribute('data-testid', 'corrected-coords-popover');
      popover.className = 'ccu-update';
      popover.innerHTML = `
        <input data-testid="corrected-coords-input" />
        <button data-testid="corrected-coords-submit">Submit</button>
      `;
      document.body.appendChild(popover);

      const submit = popover.querySelector('[data-testid="corrected-coords-submit"]')!;
      submit.addEventListener('click', () => {
        popover.remove();
      });
    });

    const promise = executeUpdateCoordinates('N 30° 15.000 E 120° 15.000');

    await vi.advanceTimersByTimeAsync(200);
    await vi.advanceTimersByTimeAsync(4200);

    const result = await promise;
    expect(result).toBe('Coordinates updated successfully.');
  });
});
