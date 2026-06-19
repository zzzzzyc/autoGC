export const geocachingSelectors = {
  gcCode: '#ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode',
  cacheType: 'a[href*="/about/cache_types.aspx"]',
  difficulty: '#ctl00_ContentBody_uxLegendScale img',
  terrain: '#ctl00_ContentBody_Localize12 img',
  owner: '#ctl00_ContentBody_mcd1 a',
  hiddenDate: '#ctl00_ContentBody_mcd2',
  personalNote: '#cacheNoteText',
  checkerLinks: 'a[href*="certitudes.org"], a[href*="certitude.org"], a[href*="geocheck.org"]',
  attributes: '.CacheDetailNavigationWidget .WidgetBody img',
  favoritePoints: '.favorite-value, #ctl00_ContentBody_FavoritePointData_lblFavoritePoints, [data-testid="favorite-points"]',
  description: '#ctl00_ContentBody_LongDescription, #ctl00_ContentBody_ShortDescription, .UserSuppliedContent',
  tbInventory: '#ctl00_ContentBody_uxTravelBugList a, .tb-list a',
  bookmarks: '#ctl00_ContentBody_BookmarkList_dlBookmarks a, .BookmarkList a',
  myBookmarks: '#ctl00_ContentBody_BookmarkList_dlMyBookmarks a',
  hint: '#div_hint',
  logs: '.LogsTable tr, #cache_logs_table tr, .log-container',
  
  // Action: Corrected Coordinates
  actionCorrectedCoords: {
    trigger: '#uxLatLonLink, .edit-cache-coordinates',
    popover: '[data-testid="corrected-coords-popover"], .ccu-update',
    input: '[data-testid="corrected-coords-input"], input.cc-parse-text',
    submit: '[data-testid="corrected-coords-submit"], button.btn-cc-parse',
    accept: '[data-testid="corrected-coords-accept"], button.btn-cc-accept',
    cancel: '[data-testid="corrected-coords-cancel"], button.btn-cc-cancel'
  },
  
  // Action: Personal Note
  actionPersonalNote: {
    trigger: '#viewCacheNote, button[aria-controls="editCacheNote"]',
    editContainer: '#editCacheNote',
    textarea: 'textarea#cacheNoteText',
    submit: 'button.js-pcn-submit',
    cancel: 'button.js-pcn-cancel',
    viewContainer: '#srOnlyCacheNote'
  }
};

export const certitudeSelectors = {
  solutionInput: 'input#solution, input[name="coordinates"]',
  submitButton: 'input#submitButton, input[type="submit"]',
  successElement: '.success',
  failureElement: '.error, .error-detail'
};

export const geocheckSelectors = {
  oneFieldInput: 'input[name="coordOneField"]',
  multiFieldInputs: {
    latRadio: 'input[name="lat"]',
    latDeg: 'input[name="latdeg"]',
    latMin: 'input[name="latmin"]',
    latDec: 'input[name="latdec"]',
    lonRadio: 'input[name="lon"]',
    lonDeg: 'input[name="londeg"]',
    lonMin: 'input[name="lonmin"]',
    lonDec: 'input[name="londec"]',
  },
  captchaImage: 'img[src="/dimages/captcha.php"]',
  captchaInput: 'input[name="usercaptcha"]',
  submitButton: 'input[type="submit"][value="Check"]',
  successElement: 'input[name="ref"][value="/chkcorrect.php"]',
  failureElement: 'td.alert'
};

export const listSelectors = {
  row: 'tr.list-geocache-row',
  gcCode: '.geocache-meta span:last-child',
  cacheName: 'a[href*="/geocache/"]',
  cacheUrl: 'a[href*="/geocache/"]',
  dtRating: 'td.list-geocache-dt'
};
