# test-ready

## Command to Run Tests
```bash
npm run test
```

## Checklist of Test Tiers

### Feature 1: `hiddenDate` parsing
- [x] **Tier 1 (Feature Coverage)**: At least 5 test cases covering basic formats (Hidden: 6/10/2026, Event Date: 4/20/2026, etc. with newlines and indentation).
- [x] **Tier 2 (Boundary & Corner Cases)**: At least 5 test cases covering empty inputs, no colons, multiple colons, only white space, missing element, or future dates.

### Feature 2: `executeUpdateCoordinates` workflow
- [x] **Tier 1 (Feature Coverage)**: At least 5 test cases for the old UI flow (where the accept button is clicked and resolves with refresh message) and the new UI flow (where the popover closes/disappears and resolves with success message).
- [x] **Tier 2 (Boundary & Corner Cases)**: At least 5 test cases for timeout conditions, missing submit button, missing input field, and double-resolve conditions.

### Cross-Feature & Real-World Integration
- [x] **Tier 3 (Interaction/Concurrency)**: At least 2 test cases testing interaction/concurrency.
- [x] **Tier 4 (Real-World DOM Cache)**: At least 5 test cases executing realistic DOM contents loaded from the cache files in `dom_cache/` (e.g. `cache_dom_1.txt`, `cache_dom_2.txt`, `cache_dom_3.txt`) and validating that calling `extractGCInfo` on those DOM structures retrieves the correct dates, and calling `executeUpdateCoordinates` does not break them.
