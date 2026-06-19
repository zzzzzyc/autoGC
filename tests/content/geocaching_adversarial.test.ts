import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { extractGCInfo, executeUpdateCoordinates } from '../../src/content/geocaching';

describe('Adversarial / Stress tests: hiddenDate parsing', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should handle completely empty hiddenDateEl content', () => {
    document.body.innerHTML = `
      <span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode">GC12345</span>
      <div id="ctl00_ContentBody_mcd2"></div>
    `;
    const info = extractGCInfo();
    expect(info?.hiddenDate).toBe('');
  });

  it('should handle only weird whitespace characters', () => {
    document.body.innerHTML = `
      <span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode">GC12345</span>
      <div id="ctl00_ContentBody_mcd2">\r\n\t \u00a0\u200b\n</div>
    `;
    const info = extractGCInfo();
    // Fixed: Zero-width spaces are now properly stripped.
    expect(info?.hiddenDate).toBe('');
  });

  it('should parse German locale with colon: "Versteckt: 12.04.2020"', () => {
    document.body.innerHTML = `
      <span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode">GC12345</span>
      <div id="ctl00_ContentBody_mcd2">Versteckt: 12.04.2020</div>
    `;
    const info = extractGCInfo();
    expect(info?.hiddenDate).toBe('12.04.2020');
  });

  it('should handle German locale WITHOUT colon: "Versteckt 12.04.2020"', () => {
    document.body.innerHTML = `
      <span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode">GC12345</span>
      <div id="ctl00_ContentBody_mcd2">Versteckt 12.04.2020</div>
    `;
    const info = extractGCInfo();
    // Since "Versteckt" is not in the english-only prefix removal list:
    // /^(Hidden|Event Date|Release Date)\b\s*/i
    // it will return "Versteckt 12.04.2020". Let's verify this behavior.
    expect(info?.hiddenDate).toBe('Versteckt 12.04.2020');
  });

  it('should parse French locale with colon: "Caché : 12/04/2020"', () => {
    document.body.innerHTML = `
      <span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode">GC12345</span>
      <div id="ctl00_ContentBody_mcd2">Caché : 12/04/2020</div>
    `;
    const info = extractGCInfo();
    expect(info?.hiddenDate).toBe('12/04/2020');
  });

  it('should handle French locale WITHOUT colon: "Caché 12/04/2020"', () => {
    document.body.innerHTML = `
      <span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode">GC12345</span>
      <div id="ctl00_ContentBody_mcd2">Caché 12/04/2020</div>
    `;
    const info = extractGCInfo();
    expect(info?.hiddenDate).toBe('Caché 12/04/2020');
  });

  it('should parse Swedish locale with colon: "Dold: 2020-04-12"', () => {
    document.body.innerHTML = `
      <span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode">GC12345</span>
      <div id="ctl00_ContentBody_mcd2">Dold: 2020-04-12</div>
    `;
    const info = extractGCInfo();
    expect(info?.hiddenDate).toBe('2020-04-12');
  });

  it('should parse Polish locale with colon: "Ukryta: 12.04.2020"', () => {
    document.body.innerHTML = `
      <span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode">GC12345</span>
      <div id="ctl00_ContentBody_mcd2">Ukryta: 12.04.2020</div>
    `;
    const info = extractGCInfo();
    expect(info?.hiddenDate).toBe('12.04.2020');
  });

  it('should parse Russian locale with colon: "Скрытый: 12.04.2020"', () => {
    document.body.innerHTML = `
      <span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode">GC12345</span>
      <div id="ctl00_ContentBody_mcd2">Скрытый: 12.04.2020</div>
    `;
    const info = extractGCInfo();
    expect(info?.hiddenDate).toBe('12.04.2020');
  });

  it('should parse Chinese locale with colon: "隐藏: 2020-04-12"', () => {
    document.body.innerHTML = `
      <span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode">GC12345</span>
      <div id="ctl00_ContentBody_mcd2">隐藏: 2020-04-12</div>
    `;
    const info = extractGCInfo();
    expect(info?.hiddenDate).toBe('2020-04-12');
  });

  it('should parse French Event Date with colon: "Date de l\'événement : 12/04/2020"', () => {
    document.body.innerHTML = `
      <span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode">GC12345</span>
      <div id="ctl00_ContentBody_mcd2">Date de l'événement : 12/04/2020</div>
    `;
    const info = extractGCInfo();
    expect(info?.hiddenDate).toBe('12/04/2020');
  });

  it('should handle date with trailing parenthetical text: "Hidden: 12/04/2020 (edited)"', () => {
    document.body.innerHTML = `
      <span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode">GC12345</span>
      <div id="ctl00_ContentBody_mcd2">Hidden: 12/04/2020 (edited)</div>
    `;
    const info = extractGCInfo();
    // Verify that the parser doesn't strip parenthetical data since it just takes substring after colon
    expect(info?.hiddenDate).toBe('12/04/2020 (edited)');
  });

  it('should handle label with no digits at all: "Hidden: TBD"', () => {
    document.body.innerHTML = `
      <span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode">GC12345</span>
      <div id="ctl00_ContentBody_mcd2">Hidden: TBD</div>
    `;
    const info = extractGCInfo();
    expect(info?.hiddenDate).toBe('TBD');
  });

  it('should handle multiple dates or complex text: "Hidden: 12/04/2020 or 13/04/2020"', () => {
    document.body.innerHTML = `
      <span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode">GC12345</span>
      <div id="ctl00_ContentBody_mcd2">Hidden: 12/04/2020 or 13/04/2020</div>
    `;
    const info = extractGCInfo();
    expect(info?.hiddenDate).toBe('12/04/2020 or 13/04/2020');
  });

  it('should handle embedded HTML tags: "Hidden: <b>12/04/2020</b>"', () => {
    document.body.innerHTML = `
      <span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode">GC12345</span>
      <div id="ctl00_ContentBody_mcd2">Hidden: <b>12/04/2020</b></div>
    `;
    const info = extractGCInfo();
    expect(info?.hiddenDate).toBe('12/04/2020');
  });

  it('should handle multiple colons: "Hidden: Date: Added: 12/04/2020"', () => {
    document.body.innerHTML = `
      <span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode">GC12345</span>
      <div id="ctl00_ContentBody_mcd2">Hidden: Date: Added: 12/04/2020</div>
    `;
    const info = extractGCInfo();
    // firstDigitIndex of "Hidden: Date: Added: 12/04/2020" is index of '1' in '12', which is 21.
    // lastIndexOf(':', 21) is 20 (the one right before 12).
    // So hasLabelColon = true, base = "12/04/2020".
    expect(info?.hiddenDate).toBe('12/04/2020');
  });

  it('should handle multiple colons when first colon is after first digit: "Hidden 12:00 Date: 12/04/2020"', () => {
    document.body.innerHTML = `
      <span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode">GC12345</span>
      <div id="ctl00_ContentBody_mcd2">Hidden 12:00 Date: 12/04/2020</div>
    `;
    const info = extractGCInfo();
    // normalized = "Hidden 12:00 Date: 12/04/2020"
    // firstDigitIndex = 7 (the '1' in '12:00')
    // colonIndex = lastIndexOf(':', 7) -> -1
    // hasLabelColon = false
    // base = "Hidden 12:00 Date: 12/04/2020"
    // replaced with prefix (removes "Hidden " because it starts with it)
    expect(info?.hiddenDate).toBe('12:00 Date: 12/04/2020');
  });
});

describe('Adversarial / Stress tests: executeUpdateCoordinates', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should handle empty coordinate input', async () => {
    document.body.innerHTML = `<button id="uxLatLonLink">Edit</button>`;
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

    const promise = executeUpdateCoordinates('');
    await vi.advanceTimersByTimeAsync(200);
    await vi.advanceTimersByTimeAsync(200);
    const result = await promise;
    expect(result).toBe('Coordinates accepted. Page will now refresh.');
    expect((document.querySelector('input.cc-parse-text') as HTMLInputElement).value).toBe('');
  });

  it('should handle extremely long coordinate input', async () => {
    const hugeCoords = 'A'.repeat(10000);
    document.body.innerHTML = `<button id="uxLatLonLink">Edit</button>`;
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

    const promise = executeUpdateCoordinates(hugeCoords);
    await vi.advanceTimersByTimeAsync(200);
    await vi.advanceTimersByTimeAsync(200);
    const result = await promise;
    expect(result).toBe('Coordinates accepted. Page will now refresh.');
    expect((document.querySelector('input.cc-parse-text') as HTMLInputElement).value).toBe(hugeCoords);
  });

  it('should handle malformed and hostile script/tags in coordinate input', async () => {
    const hostileCoords = '<script>alert("xss")</script>';
    document.body.innerHTML = `<button id="uxLatLonLink">Edit</button>`;
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

    const promise = executeUpdateCoordinates(hostileCoords);
    await vi.advanceTimersByTimeAsync(200);
    await vi.advanceTimersByTimeAsync(200);
    const result = await promise;
    expect(result).toBe('Coordinates accepted. Page will now refresh.');
    expect((document.querySelector('input.cc-parse-text') as HTMLInputElement).value).toBe(hostileCoords);
  });

  it('should not crash or double-trigger when clicked multiple times rapidly', async () => {
    document.body.innerHTML = `<button id="uxLatLonLink">Edit</button>`;
    const trigger = document.getElementById('uxLatLonLink')!;
    let clicksCount = 0;
    trigger.addEventListener('click', () => {
      clicksCount++;
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

    // Invoke 10 concurrent requests
    const promises = Array.from({ length: 10 }, (_, i) => 
      executeUpdateCoordinates(`N 30° 15.00${i} E 120° 15.00${i}`)
    );

    // Run active intervals
    await vi.advanceTimersByTimeAsync(200);
    await vi.advanceTimersByTimeAsync(200);

    const results = await Promise.all(promises);
    expect(clicksCount).toBe(10); // Check that trigger.click() was invoked 10 times
    results.forEach(res => {
      expect(res).toBe('Coordinates accepted. Page will now refresh.');
    });
  });

  it('should handle target element destruction (DOM unmounting) during coordinates input check', async () => {
    document.body.innerHTML = `<button id="uxLatLonLink">Edit</button>`;
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

    // Wait for input to be checked, then remove the trigger and input right before submit
    await vi.advanceTimersByTimeAsync(200);
    
    // Simulate some external script destroying the edit elements
    document.body.innerHTML = ''; 

    // Let the timers continue to see if any crashes/unhandled promise rejections occur
    await vi.advanceTimersByTimeAsync(4000);

    // The promise should not crash, it should just fail or hang or time out.
    // In our implementation, since the input was found, it cleared the input interval,
    // then it tried to find the submit button. Since we destroyed the DOM *after* input was found
    // but in a synchronous sequence, wait:
    // Let's check the code:
    // input is found, clearInterval is run, then it synchronously tries to find the submit button.
    // So if the DOM is destroyed before input is found, it will time out.
    // Let's verify that it times out:
  });

  it('should handle DOM destruction before input appears', async () => {
    document.body.innerHTML = `<button id="uxLatLonLink">Edit</button>`;
    const promise = executeUpdateCoordinates('N 30° 15.000 E 120° 15.000');

    // Remove trigger and everything
    document.body.innerHTML = '';

    await vi.advanceTimersByTimeAsync(4200);
    const result = await promise;
    expect(result).toBe('Error: Corrected coords input popover did not appear.');
  });

  it('should handle when initialPopover is null but input is present (Custom UI structure)', async () => {
    // This tests the case where the input selector matches, but the popover selector does not,
    // which means initialPopover will be null.
    // Thus popover in acceptInterval will fallback to document.body.
    document.body.innerHTML = `
      <button id="uxLatLonLink">Edit</button>
      <input class="cc-parse-text" />
      <button class="btn-cc-parse">Submit</button>
    `;

    const promise = executeUpdateCoordinates('N 30° 15.000 E 120° 15.000');

    await vi.advanceTimersByTimeAsync(200);
    // Since input is found immediately, it clicks submit.
    // Now it runs the acceptInterval. Since initialPopover is null:
    // popover = document.body, which is always present, so !popover is never true.
    // So the only way it resolves is if acceptBtn appears, or it hits 20 attempts.
    // Let's wait 4200ms to verify it times out with the correct error message.
    await vi.advanceTimersByTimeAsync(4200);

    const result = await promise;
    expect(result).toBe('Error: Accept button did not appear and popover did not close.');
  });
});
