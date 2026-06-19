# Original User Request

## Initial Request — 2026-06-18T20:24:12Z

# Teamwork Project Prompt — Draft

> Status: Launched

Update the `api_docs.md` to document the newly expanded autoGC Base API (new fields: FP, GPX, TB, logs, bookmarks, hint, description; new workflows: executeUpdateCoordinates, executeSavePersonalNote), and enhance the Debug UI in `App.vue` for better readability and error handling.

Working directory: `C:\Users\zzzzz\Documents\antigravity\GC-ATO`
Integrity mode: development

## Requirements

### R1. Document the Expanded Base API
Update `api_docs.md` to reflect all recent additions to `src/types/index.ts` and `src/content/geocaching.ts`. This includes the new `GCInfo` extraction fields (e.g., `favoritePoints`, `gpxLink`, `tbInventory`, `bookmarks`, `logs`, etc.) and the asynchronous DOM action workflows (`executeUpdateCoordinates`, `executeSavePersonalNote`).

### R2. Enhance the Debug UI
Refactor the "Debug" section in `src/App.vue`. Improve the JSON formatting display (e.g., better syntax highlighting or structural layout using Tailwind CSS) and ensure any error states returned by the content scripts are displayed prominently to the user. Do not break the existing tab/folding logic.

## Acceptance Criteria

### API Documentation
- [ ] `api_docs.md` contains a section detailing all 9 newly added `GCInfo` properties.
- [ ] `api_docs.md` contains documentation for the two new action workflows (`executeUpdateCoordinates`, `executeSavePersonalNote`) explaining their parameters and return values.

### UI Enhancements
- [ ] `npm run build` completes successfully without TypeScript errors in `App.vue`.
- [ ] The `App.vue` code contains explicit UI logic to display error strings or failed states differently from successful responses.
