# autoGC Test Infrastructure Documentation

## Philosophy
The testing infrastructure for autoGC is designed to provide high-fidelity, reproducible, and fast testing of browser extension content script behaviors without requiring a live browser or extension context. All tests are built on the **Dual Track** philosophy:
- **Feature Coverage & Specification Compliance**: Verify the logic under standard and boundary scenarios.
- **Real-World Integration (DOM Cache)**: Execute tests against actual HTML snapshots saved from geocaching.com (`dom_cache/`), guaranteeing that changes are compatible with live layouts.

We strictly adhere to the **Integrity Mandate**: no test inputs or outputs are hardcoded in the source code; the implementation maintains real state and parses real DOM inputs.

---

## Architecture
- **Framework**: [Vitest](https://vitest.dev/) is used as the test runner for its speed, native TypeScript support, and seamless integration with Vite.
- **DOM Simulation**: [jsdom](https://github.com/jsdom/jsdom) is configured as the test environment, simulating a browser DOM in Node.js.
- **Asynchronous Flow Control**: Since `executeUpdateCoordinates` uses polling intervals (`setInterval`), we use Vitest's Fake Timers (`vi.useFakeTimers()`) to run tests synchronously and instantly without waiting for actual real-world timeouts.
- **Real-World Snapshots**: `fs` is used to load raw HTML files directly from the `dom_cache/` folder during the test execution, populating `document.documentElement.innerHTML`.

---

## Feature Coverage & Tiers

### Feature 1: `hiddenDate` Parsing
- **Tier 1 (Feature Coverage)**: Basic date formats including newlines, indentation, standard "Hidden: 6/10/2026", and "Event Date: 4/20/2026".
- **Tier 2 (Boundary & Corner Cases)**: Empty input, missing element, only white space, no colons, multiple colons, and future dates.

### Feature 2: `executeUpdateCoordinates` Workflow
- **Tier 1 (Feature Coverage)**: Success paths for old UI (clicks accept, resolves with refresh message) and new UI (popover closes, resolves with success message), plus trigger not found and timeout failures.
- **Tier 2 (Boundary & Corner Cases)**: Timeout when input field never appears, missing submit button, missing input field, double-resolve conditions at the tick boundary, and exactly 20 failed attempts before timing out.

### Cross-Feature & Real-World Integration
- **Tier 3 (Cross-Feature & Interaction/Concurrency)**: Concurrent extraction while update is pending, concurrent coordinate update calls.
- **Tier 4 (Real-World DOM Cache)**: Full extraction and update simulation using cached files `cache_dom_1.txt`, `cache_dom_2.txt`, and `cache_dom_3.txt`.
