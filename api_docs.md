# autoGC Expanded Base API Documentation

This document provides a comprehensive reference for the expanded base API in the autoGC Geocaching browser extension. It details the 9 new `GCInfo` fields and the 2 new automated DOM action workflows implemented in the content scripts.

---

## 1. The 9 New `GCInfo` Fields

The `GCInfo` interface (defined in `src/types/index.ts`) has been expanded to include 9 new fields. These fields are extracted from the active Geocaching.com page using `extractGCInfo()` in `src/content/geocaching.ts`.

### Field Directory

| Field Name | Type | Selector | Description |
| :--- | :--- | :--- | :--- |
| `attributes` | `string[]` | `geocachingSelectors.attributes` <br> (`.CacheDetailNavigationWidget .WidgetBody img`) | A list of attribute/amenity names (e.g., "Dogs allowed", "Kids friendly") associated with the geocache. |
| `favoritePoints` | `string` | `geocachingSelectors.favoritePoints` <br> (`.favorite-value, #ctl00_ContentBody_FavoritePointData_lblFavoritePoints, [data-testid="favorite-points"]`) | The total count of Favorite Points awarded to the geocache by players. |
| `cacheType` | `string` | `geocachingSelectors.cacheType` <br> (`a[href*="/about/cache_types.aspx"]`) | The type of the geocache (e.g., "Traditional Cache", "Mystery Cache"). |
| `description` | `string` | `geocachingSelectors.description` <br> (`#ctl00_ContentBody_LongDescription, #ctl00_ContentBody_ShortDescription, .UserSuppliedContent`) | The full HTML content representing the description of the cache. |
| `tbInventory` | `Array<{ name: string; link: string }>` | `geocachingSelectors.tbInventory` <br> (`#ctl00_ContentBody_uxTravelBugList a, .tb-list a`) | An inventory of Travel Bugs (Trackables) currently logged inside the geocache. |
| `bookmarks` | `Array<{ name: string; link: string; user: string }>` | `geocachingSelectors.bookmarks` <br> (`#ctl00_ContentBody_BookmarkList_dlBookmarks a, .BookmarkList a`) | Public bookmark lists that include this geocache, created by other users. |
| `myBookmarks` | `Array<{ name: string; link: string }>` | `geocachingSelectors.myBookmarks` <br> (`#ctl00_ContentBody_BookmarkList_dlMyBookmarks a`) | The logged-in user's bookmark lists containing this geocache. |
| `hint` | `string` | `geocachingSelectors.hint` <br> (`#div_hint`) | The encoded/decoded hint text provided by the owner to assist players. |
| `logs` | `Array<{ user: string; date: string; type: string; text: string }>` | `geocachingSelectors.logs` <br> (`.LogsTable tr, #cache_logs_table tr, .log-container`) | A list of the most recent logs (capped at 5) posted by players. |

---

### Detailed Extraction & Parsing Logic

#### 1. `attributes`
*   **Method**: Selects all images matching the attributes selector.
*   **Parsing**: Loops through matching images and extracts their attribute name. It falls back to `alt`, then `title`, and finally extracts the filename from the `src` URL (removing the `.png` extension). It trims the result and filters out any empty or null values.

#### 2. `favoritePoints`
*   **Method**: Selects the element containing the favorite point count.
*   **Parsing**: Retrieves the trimmed `textContent` of the matched element. Defaults to `'0'` if the element is missing or does not contain text.

#### 3. `cacheType`
*   **Method**: Selects the anchor tag referencing the cache types about page.
*   **Parsing**: Retrieves the `title` attribute, defaulting to `'Unknown'` if not present.

#### 4. `description`
*   **Method**: Queries the description section using high-priority identifiers (e.g., long description or user-supplied content containers).
*   **Parsing**: Returns the raw `innerHTML` of the element, or `''` if it cannot be found.

#### 5. `tbInventory`
*   **Method**: Queries anchor elements located within the Travel Bug/trackable list containers.
*   **Parsing**: Maps the elements to an array of objects containing `name` (trimmed text content) and `link` (resolved `href` URL).

#### 6. `bookmarks`
*   **Method**: Queries anchor elements inside public bookmark list widgets.
*   **Parsing**: Maps elements to an array of objects containing `name` (trimmed text content), `link` (resolved `href` URL), and `user` (extracted from the element's `title` attribute, defaulting to `'Unknown'`).

#### 7. `myBookmarks`
*   **Method**: Queries anchor elements inside the user's private bookmark list widgets.
*   **Parsing**: Maps elements to an array of objects containing `name` (trimmed text content) and `link` (resolved `href` URL).

#### 8. `hint`
*   **Method**: Selects the hint container element (e.g., `#div_hint`).
*   **Parsing**: Extracts the trimmed `textContent`, returning `''` if the element does not exist.

#### 9. `logs`
*   **Method**: Selects rows/containers representing logs.
*   **Parsing**: Truncates the list to the first 5 logs (`slice(0, 5)`). For each log, extracts `user` (the first 50 characters of trimmed text content) and `text` (the full trimmed text content). The `date` and `type` fields are currently returned as empty strings (`''`).

---

## 2. Action Workflows

These asynchronous workflows execute direct DOM interactions on the Geocaching details page. They are defined in `src/content/geocaching.ts` and triggered by messages sent from the extension's popup UI.

### Workflow A: `executeUpdateCoordinates`

*   **Signature**:
    ```typescript
    export async function executeUpdateCoordinates(coords: string): Promise<string>
    ```
*   **Parameters**:
    *   `coords` (`string`): The corrected coordinate string to write into the form (e.g., `"N 12° 34.567 E 089° 12.345"`).
*   **Return Value**:
    *   `Promise<string>`: Resolves to a status message indicating success or details about a failure.
*   **Logic Flow**:
    1.  **Locate Edit Trigger**: Finds the coordinate edit button using `geocachingSelectors.actionCorrectedCoords.trigger` (`#uxLatLonLink, .edit-cache-coordinates`).
    2.  **Trigger Open**: Clicks the edit button to open the corrected coordinates popover. Returns `'Error: Coordinate edit button not found.'` if the trigger is missing.
    3.  **Poll for Input**: Sets up a polling interval checking every `200ms` (up to `20` attempts, max `4` seconds) for the coordinate input selector `geocachingSelectors.actionCorrectedCoords.input` (`[data-testid="corrected-coords-input"], input.cc-parse-text`).
        *   If the input does not appear within `4` seconds, clears the interval and returns `'Error: Corrected coords input popover did not appear.'`.
    4.  **Insert Coordinates**: Inserts the `coords` string into the input field and dispatches a bubbling `input` event to notify any native event listeners.
    5.  **Submit Coordinates**: Locates the submit button via `geocachingSelectors.actionCorrectedCoords.submit` (`[data-testid="corrected-coords-submit"], button.btn-cc-parse`).
        *   If missing, returns `'Error: Submit button not found in popover.'`.
        *   Otherwise, clicks the submit button.
    6.  **Poll for Accept**: Sets up a second polling interval checking every `200ms` (up to `20` attempts, max `4` seconds) for the final confirmation button selector `geocachingSelectors.actionCorrectedCoords.accept` (`[data-testid="corrected-coords-accept"], button.btn-cc-accept`).
        *   If the accept button fails to appear, clears the interval and returns `'Error: Accept button did not appear after submit.'`.
        *   Otherwise, clicks the accept button (which commits coordinates and triggers a **native page reload**) and returns `'Coordinates accepted. Page will now refresh.'`.
*   **Error Scenarios**:
    *   Coordinate edit trigger not found on the page.
    *   Corrected coordinates popover fails to load/render within 4 seconds.
    *   Submit button not found inside the coordinate popover.
    *   Accept dialog/button fails to render after clicking submit.

---

### Workflow B: `executeSavePersonalNote`

*   **Signature**:
    ```typescript
    export async function executeSavePersonalNote(text: string): Promise<string>
    ```
*   **Parameters**:
    *   `text` (`string`): The personal note text to save for the current geocache.
*   **Return Value**:
    *   `Promise<string>`: Resolves to a status message indicating success or details about a failure.
*   **Logic Flow**:
    1.  **Toggle Check**: Queries the note editor container via `geocachingSelectors.actionPersonalNote.editContainer` (`#editCacheNote`). If it exists and its display property is `'none'`, clicks the note edit trigger `geocachingSelectors.actionPersonalNote.trigger` (`#viewCacheNote, button[aria-controls="editCacheNote"]`) to show the editor.
    2.  **Poll for Textarea**: Sets up a polling interval checking every `200ms` (up to `10` attempts, max `2` seconds) for the textarea element `geocachingSelectors.actionPersonalNote.textarea` (`textarea#cacheNoteText`) to become visible (checks `offsetParent !== null`).
        *   If it fails to become visible, clears the interval and returns `'Error: Note text area did not become visible.'`.
    3.  **Insert Text**: Once the textarea is visible, assigns `text` to its `value` property and dispatches a bubbling `input` event.
    4.  **Save Note**: Locates the save/submit button via `geocachingSelectors.actionPersonalNote.submit` (`button.js-pcn-submit`).
        *   If missing, returns `'Error: Save button not found.'`.
        *   Otherwise, clicks the save button and returns `'Personal Note saved successfully.'`.
*   **Error Scenarios**:
    *   Note editing section fails to become visible or trigger fails.
    *   Save/Submit button missing within the editing section.
