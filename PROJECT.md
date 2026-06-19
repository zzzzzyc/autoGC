# Project: autoGC Geocaching DOM Adaptations

## Architecture
autoGC is a Geocaching browser extension.
- **Content Scripts (`src/content/geocaching.ts`)**: Injected into Geocaching.com pages. Extracts metadata (using selectors in `src/utils/selectors.ts`) and performs automated DOM workflows (e.g. updating coordinates or saving notes).
- **Selectors (`src/utils/selectors.ts`)**: Houses DOM selectors for extracting information from Geocaching.com.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Test Infra Setup | Create E2E/unit test suite, write TEST_INFRA.md and TEST_READY.md. | none | PLANNED |
| 2 | R1: hiddenDate Parse Fix | Refactor extractGCInfo in src/content/geocaching.ts to cleanly parse hiddenDate. | M1 | PLANNED |
| 3 | R2: Coordinates Adapt | Update executeUpdateCoordinates in src/content/geocaching.ts and selectors in src/utils/selectors.ts to support new Popover coordinate change UI. | M1 | PLANNED |
| 4 | E2E Testing & Hardening | Run all E2E tests, add adversarial testing, perform forensic audit. | M2, M3 | PLANNED |

## Interface Contracts
- **`extractGCInfo()`**:
  - Returns `GCInfo | null`.
  - `hiddenDate` property must be a clean date string (e.g. `"4/20/2026"`), not containing "Hidden", `:`, newlines, or extra whitespace.
- **`executeUpdateCoordinates(coords: string)`**:
  - Returns `Promise<string>`.
  - Triggers popover edit UI (`[data-testid="corrected-coords-popover"]` or `.ccu-update`), fills in coords (`[data-testid="corrected-coords-input"]`), clicks submit (`[data-testid="corrected-coords-submit"]`), handles accept, or confirms coordinate update.
