import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { extractGCInfo, executeUpdateCoordinates } from '../../src/content/geocaching';

describe('Adversarial/Stress testing: hiddenDate parsing', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should handle dates with foreign characters and accents (French, German, Japanese) with colons', () => {
    // French: Cachée : 10/06/2026
    document.body.innerHTML = `
      <span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode">GC12345</span>
      <div id="ctl00_ContentBody_mcd2">Cachée : 10/06/2026</div>
    `;
    expect(extractGCInfo()?.hiddenDate).toBe('10/06/2026');

    // German: Versteckt : 10.06.2026
    document.body.innerHTML = `
      <span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode">GC12345</span>
      <div id="ctl00_ContentBody_mcd2">Versteckt : 10.06.2026</div>
    `;
    expect(extractGCInfo()?.hiddenDate).toBe('10.06.2026');

    // Japanese: 隠された : 2026年6月10日
    document.body.innerHTML = `
      <span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode">GC12345</span>
      <div id="ctl00_ContentBody_mcd2">隠された : 2026年6月10日</div>
    `;
    expect(extractGCInfo()?.hiddenDate).toBe('2026年6月10日');
  });

  it('should reveal limitations in multi-lingual dates without colons', () => {
    // Without colons, English is stripped correctly because of hardcoded regex
    document.body.innerHTML = `
      <span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode">GC12345</span>
      <div id="ctl00_ContentBody_mcd2">Hidden 10/06/2026</div>
    `;
    expect(extractGCInfo()?.hiddenDate).toBe('10/06/2026');

    // Without colons, German "Versteckt 10.06.2026" fails to strip prefix
    document.body.innerHTML = `
      <span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode">GC12345</span>
      <div id="ctl00_ContentBody_mcd2">Versteckt 10.06.2026</div>
    `;
    expect(extractGCInfo()?.hiddenDate).toBe('Versteckt 10.06.2026');
  });

  it('should parse dates wrapped in inner HTML tags gracefully', () => {
    document.body.innerHTML = `
      <span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode">GC12345</span>
      <div id="ctl00_ContentBody_mcd2">
        <strong>Hidden:</strong> <span>10/06/2026</span>
      </div>
    `;
    expect(extractGCInfo()?.hiddenDate).toBe('10/06/2026');
  });

  it('should handle dates with multiple colons and times', () => {
    document.body.innerHTML = `
      <span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode">GC12345</span>
      <div id="ctl00_ContentBody_mcd2">
        Event Date: 10/06/2026 at 15:30:00
      </div>
    `;
    expect(extractGCInfo()?.hiddenDate).toBe('10/06/2026 at 15:30:00');
  });

  it('should handle completely malformed/unexpected labels', () => {
    document.body.innerHTML = `
      <span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode">GC12345</span>
      <div id="ctl00_ContentBody_mcd2">
        Some random prefix: 10/06/2026
      </div>
    `;
    expect(extractGCInfo()?.hiddenDate).toBe('10/06/2026');
  });

  it('should parse correctly if there is no label at all (only date)', () => {
    document.body.innerHTML = `
      <span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode">GC12345</span>
      <div id="ctl00_ContentBody_mcd2">10/06/2026</div>
    `;
    expect(extractGCInfo()?.hiddenDate).toBe('10/06/2026');
  });
});

describe('Adversarial/Stress testing: executeUpdateCoordinates', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should handle malformed/extremely long coordinate structures', async () => {
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

    const malformedCoords = 'A'.repeat(1000) + '★♣♦';
    const promise = executeUpdateCoordinates(malformedCoords);

    await vi.advanceTimersByTimeAsync(200);
    const input = document.querySelector('input.cc-parse-text') as HTMLInputElement;
    expect(input.value).toBe(malformedCoords);

    await vi.advanceTimersByTimeAsync(200);
    const result = await promise;
    expect(result).toBe('Coordinates accepted. Page will now refresh.');
  });

  it('should verify behavior under rapid multiple concurrent invocations', async () => {
    document.body.innerHTML = `
      <button id="uxLatLonLink">Edit</button>
    `;

    let clickCount = 0;
    const trigger = document.getElementById('uxLatLonLink')!;
    trigger.addEventListener('click', () => {
      clickCount++;
      if (!document.querySelector('.cc-parse-text')) {
        const container = document.createElement('div');
        container.innerHTML = `
          <input class="cc-parse-text" />
          <button class="btn-cc-parse">Submit</button>
        `;
        document.body.appendChild(container);

        const submit = container.querySelector('button.btn-cc-parse')!;
        submit.addEventListener('click', () => {
          if (!document.querySelector('button.btn-cc-accept')) {
            const acceptBtn = document.createElement('button');
            acceptBtn.className = 'btn-cc-accept';
            document.body.appendChild(acceptBtn);
          }
        });
      }
    });

    const promises = [
      executeUpdateCoordinates('Coords 1'),
      executeUpdateCoordinates('Coords 2'),
      executeUpdateCoordinates('Coords 3'),
      executeUpdateCoordinates('Coords 4'),
      executeUpdateCoordinates('Coords 5'),
    ];

    expect(clickCount).toBe(5);

    // Advance to let the input interval check run, which assigns the values, clicks submit, and registers the accept checks
    await vi.advanceTimersByTimeAsync(200);

    // Then advance to let the accept check interval run and see the accept buttons
    await vi.advanceTimersByTimeAsync(200);

    const results = await Promise.all(promises);
    expect(results).toEqual([
      'Coordinates accepted. Page will now refresh.',
      'Coordinates accepted. Page will now refresh.',
      'Coordinates accepted. Page will now refresh.',
      'Coordinates accepted. Page will now refresh.',
      'Coordinates accepted. Page will now refresh.',
    ]);
  });

  it('should test robustness against exceptions thrown in DOM event handlers', async () => {
    const errorHandler = (event: ErrorEvent) => {
      if (event.message && event.message.includes('Simulated DOM Click Exception')) {
        event.preventDefault();
      }
    };
    window.addEventListener('error', errorHandler);

    try {
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
          // Throwing error inside click handler of submit button!
          throw new Error('Simulated DOM Click Exception');
        });
      });

      const promise = executeUpdateCoordinates('Coords');

      await vi.advanceTimersByTimeAsync(200); // finds input, clicks submit (which throws inside event handler, but does not propagate out of click() to interrupt the caller)
      await vi.advanceTimersByTimeAsync(4200); // let accept interval run to completion/timeout

      const result = await promise;
      // It should resolve with a timeout error rather than hanging or throwing synchronously
      expect(result).toBe('Error: Accept button did not appear and popover did not close.');
    } finally {
      window.removeEventListener('error', errorHandler);
    }
  });
});
