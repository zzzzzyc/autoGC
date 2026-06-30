# autoGC 扩展 Base API 文档

本文档为 autoGC Geocaching 浏览器扩展中新增/扩展的 Base API 提供了详尽的参考指南。内容涵盖了在内容脚本（content scripts）中实现的 9 个新增 `GCInfo` 字段，2 个自动化 DOM 交互工作流，以及针对列表页面和解密校验网站（Certitude / GeoCheck）的选择器与交互逻辑。

---

## 1. 9 个新增 `GCInfo` 字段

在 `src/types/index.ts` 中定义的 `GCInfo` 接口已被扩展，新增了 9 个字段。这些字段由 `src/content/geocaching.ts` 中的 `extractGCInfo()` 函数从当前打开的 Geocaching.com 页面中提取。

### 字段目录

| 字段名称 | 类型 | 选择器 (Selector) | 描述 |
| :--- | :--- | :--- | :--- |
| `attributes` | `{ id: number; name: string; isOn: boolean }[]` | `geocachingSelectors.attributes` <br> (`.CacheDetailNavigationWidget .WidgetBody img`) | 宝藏关联的属性列表，现已数字化包含官方 ID、名称，以及是否被启用 (`isOn`) 标志。 |
| `images` | `{ url: string; title: string }[]` | `geocachingSelectors.images` <br> (`ul.CachePageImages.NoPrint li a`) | 宝藏主上传并附加在页面下方的图片列表。 |
| `favoritePoints` | `number` | `geocachingSelectors.favoritePoints` <br> (`.favorite-value, #ctl00_ContentBody_FavoritePointData_lblFavoritePoints, [data-testid="favorite-points"]`) | 该宝藏获得的绿点（Favorite Points，最爱积分）总数。 |
| `cacheType` | `number` | `geocachingSelectors.cacheType` <br> (`a[href*="/about/cache_types.aspx"]`) | 宝藏的类型 ID（对应 1-20 的整数，详情见下文映射表；未知返回 0）。 |
| `description` | `string` | `geocachingSelectors.description` <br> (`#ctl00_ContentBody_LongDescription, #ctl00_ContentBody_ShortDescription, .UserSuppliedContent`) | 宝藏描述的完整 HTML 内容。 |
| `tbInventory` | `Array<{ name: string; link: string }>` | `geocachingSelectors.tbInventory` <br> (`#ctl00_ContentBody_uxTravelBugList a, .tb-list a`) | 当前存放在该宝藏内的 Travel Bug（旅行虫/可追踪物）清单。 |
| `bookmarks` | `Array<{ name: string; link: string; user: string }>` | `geocachingSelectors.bookmarks` <br> (`#ctl00_ContentBody_BookmarkList_dlBookmarks a, .BookmarkList a`) | 包含该宝藏的公开书签列表（由其他用户创建）。 |
| `myBookmarks` | `Array<{ name: string; link: string }>` | `geocachingSelectors.myBookmarks` <br> (`#ctl00_ContentBody_BookmarkList_dlMyBookmarks a`) | 当前登录用户创建的、包含该宝藏的书签列表。 |
| `hint` | `string` | `geocachingSelectors.hint` <br> (`#div_hint`) | 宝主提供的提示文本（已解码/未编码），用于辅助玩家寻找。 |
| `logs` | `Array<{ user: string; date: string; type: number; text: string; images: { link: string; text: string }[] }>` | `geocachingSelectors.logs` <br> (`.LogsTable tr, #cache_logs_table tr, .log-container`) | 玩家发布的最新日志列表（最多保留 5 条）。 |

---

### 详细提取与解析逻辑

#### 1. `attributes`
*   **提取方法**：选取所有匹配属性选择器的图片元素。
*   **解析逻辑**：提取其属性名称（优先 `alt` 或 `title`，其次 `src` 文件名），然后通过内置映射表将其转为官方数字 ID，并判断是否包含 `-no` 图片后缀或 `No ` 前缀以判定 `isOn` 状态。最终返回结构化的 `{ id, name, isOn }` 数组。

#### 2. `favoritePoints`
*   **提取方法**：选取包含最爱积分数值的元素。
*   **解析逻辑**：获取所匹配元素的文本内容（并进行 trim）。如果元素不存在或没有文本，则默认返回 `'0'`。

#### 3. `cacheType`
*   **提取方法**：选取指向宝藏类型介绍页面的锚点标签（anchor tag）。
*   **解析逻辑**：获取其 `title` 属性，并将其映射为对应的整数 ID。如果找不到匹配的宝藏类型，则默认返回 `0`。

    **类型映射表**：
    1. Traditional Cache
    2. Multi-Cache
    3. Mystery Cache
    4. EarthCache
    5. Letterbox Hybrid
    6. Event Cache
    7. Cache In Trash Out Event
    8. Mega-Event Cache
    9. Giga-Event Cache
    10. Wherigo Cache
    11. Geocaching HQ Cache
    12. GPS Adventures Maze Exhibit
    13. Adventure Lab®
    14. Geocaching HQ Celebration
    15. Geocaching HQ Block Party
    16. Community Celebration Event
    17. Virtual Cache
    18. Webcam Cache
    19. Project A.P.E. Cache
    20. Locationless Cache

#### 4. `description`
*   **提取方法**：使用高优先级标识符（如长描述容器或用户提供内容的容器）查询描述区域。
*   **解析逻辑**：返回该元素的原始 `innerHTML`。如果找不到对应元素，则返回 `''`。

#### 5. `tbInventory`
*   **提取方法**：查询 Travel Bug/可追踪物列表容器中的锚点元素。
*   **解析逻辑**：将元素映射为对象数组，每个对象包含 `name`（修剪后的文本内容）和 `link`（解析后的绝对 `href` 链接）。

#### 6. `bookmarks`
*   **提取方法**：查询公开书签列表挂件中的锚点元素。
*   **解析逻辑**：将元素映射为对象数组，每个对象包含 `name`（修剪后的文本内容）、`link`（解析后的绝对 `href` 链接）和 `user`（从元素的 `title` 属性中提取，提取失败则默认为 `'Unknown'`）。

#### 7. `myBookmarks`
*   **提取方法**：查询当前用户私有书签列表挂件中的锚点元素。
*   **解析逻辑**：将元素映射为对象数组，每个对象包含 `name`（修剪后的文本内容）和 `link`（解析后的绝对 `href` 链接）。

#### 8. `hint`
*   **提取方法**：选取提示容器元素（例如 `#div_hint`）。
*   **解析逻辑**：提取并修剪其 `textContent`，若该元素不存在则返回 `''`。

#### 9. `logs`
*   **提取方法**：选取代表日志的表格行或容器。
*   **解析逻辑**：截取前 5 条日志（`slice(0, 5)`）。对于每条日志，提取 `user`、`date`（日志日期）、`text`（日志正文）、`images`（包含日志附图链接和描述的数组），以及 `type`（日志类型的整数 ID）。

    **日志类型 ID 映射表**（通过对日志类型图标的 `title`/`alt` 属性进行关键词匹配转换；若匹配失败，则通过提取图标 URL `/images/logtypes/{id}.png` 中的数字进行保底解析）：
    - 2: Found it / Caches Found
    - 3: Didn't find it
    - 4: Write note
    - 9: Archive
    - 22: Temporarily disable listing
    - 23: Enable listing
    - 24: Publish listing
    - 45: Needs maintenance
    - 46: Owner maintenance
    - 47: Update coordinates
    - 68: Reviewer note

---

### 核心字段更新：`hiddenDate`

`GCInfo` 中的 `hiddenDate` 字段已从 `string` 类型更新为结构化的 `GCDate | null` 类型，以保证在不同语言/区域设置下提取到的日期具有一致且易读的结构。

#### `GCDate` 结构说明
```typescript
export interface GCDate {
  year: number;   // 四位数年份 (例如: 2026)
  month: number;  // 月份，范围 1 - 12
  day: number;    // 日期，范围 1 - 31
}
```

#### 解析与启发式推断逻辑
1. **多格式支持**：内部实现了一个启发式解析器 `parseDate`，支持 Geocaching 个人设置中所有的日期格式类型，例如：
   - 纯数字带不同分隔符：`30. 6. 2026`, `30.6.2026`, `30/6/2026`, `30-6-2026`, `30.6.2026 г.`
   - 补零格式：`30. 06. 2026`, `30/06/2026`, `30.06.2026`
   - 带英文月份简写/全称：`30 Jun 2026`, `Jun/30/2026`
   - 2 位年份：`30-06-26`（解析为 2026 年）
   - 年份在前：`2026. 6. 30.`, `2026. 06. 30.`, `2026/06/30`, `2026-06-30`
   - 本地化多国格式：德国 `10.06.2026`、法国 `10/06/2026`、中国 `2020-04-12`、日本 `2026年6月10日`。
2. **歧义推断（Handling Ambiguity）**：当遇到如 `06/10/2026` 这样没有数值大于 12 的纯数字模糊日期格式时，解析器将根据页面 `document.documentElement.lang` 进行猜测：
   - 若 `lang === 'en-US'`，推断为 `MM/DD/YYYY`（即 6 月 10 日）。
   - 否则，统一推断为国际常见的 `DD/MM/YYYY`（即 10 月 6 日）。
3. **空值与保底**：若标签元素缺失、内容为空或格式不可识别（如 `TBD`），`hiddenDate` 将被赋予 `null` 值。

---

## 2. 宝藏详情页交互工作流 (Action Workflows)

这些异步工作流会在 Geocaching 宝藏详情页上执行直接的 DOM 交互。它们在 `src/content/geocaching.ts` 中定义，并由扩展程序的弹窗 UI（popup UI）发送的消息触发。

### 工作流 A：`executeUpdateCoordinates`

*   **函数签名**：
    ```typescript
    export async function executeUpdateCoordinates(coords: string): Promise<string>
    ```
*   **参数**：
    *   `coords` (`string`): 要写入表单的修改后坐标字符串（例如：`"N 12° 34.567 E 089° 12.345"`）。
*   **返回值**：
    *   `Promise<string>`: 解析为状态消息，指示操作成功或失败的详细原因。
*   **逻辑流程**：
    1.  **定位编辑触发器**：使用 `geocachingSelectors.actionCorrectedCoords.trigger` (`#uxLatLonLink, .edit-cache-coordinates`) 寻找坐标编辑按钮。
    2.  **触发打开**：点击编辑按钮以打开修改坐标的弹出层（popover）。如果找不到触发器，则返回 `'Error: Coordinate edit button not found.'`。
    3.  **轮询输入框**：设置一个轮询定时器，每 `200ms` 检查一次（最多尝试 `20` 次，即最长 `4` 秒），等待坐标输入框选择器 `geocachingSelectors.actionCorrectedCoords.input` (`[data-testid="corrected-coords-input"], input.cc-parse-text`) 出现。
        *   如果输入框在 `4` 秒内未出现，则清除定时器并返回 `'Error: Corrected coords input popover did not appear.'`。
    4.  **插入坐标**：将 `coords` 字符串写入输入框中，并分发（dispatch）一个冒泡的 `input` 事件以通知可能存在的原生事件监听器。
    5.  **提交坐标**：通过 `geocachingSelectors.actionCorrectedCoords.submit` (`[data-testid="corrected-coords-submit"], button.btn-cc-parse`) 定位提交按钮。
        *   若未找到提交按钮，返回 `'Error: Submit button not found in popover.'`。
        *   否则，点击提交按钮。
    6.  **轮询确认按钮**：设置第二个轮询定时器，每 `200ms` 检查一次（最多尝试 `20` 次，最长 `4` 秒），等待最终的确认按钮选择器 `geocachingSelectors.actionCorrectedCoords.accept` (`[data-testid="corrected-coords-accept"], button.btn-cc-accept`) 出现。
        *   如果确认按钮未出现，清除定时器并返回 `'Error: Accept button did not appear after submit.'`。
        *   否则，点击确认按钮（该操作会提交坐标并触发**页面的原生重载**），并返回 `'Coordinates accepted. Page will now refresh.'`。

---

### 工作流 B：`executeSavePersonalNote`

*   **函数签名**：
    ```typescript
    export async function executeSavePersonalNote(text: string): Promise<string>
    ```
*   **参数**：
    *   `text` (`string`): 要为当前宝藏保存的个人备注（Personal Note）文本。
*   **返回值**：
    *   `Promise<string>`: 解析为状态消息，指示操作成功或失败的详细原因。
*   **逻辑流程**：
    1.  **切换状态检查**：通过 `geocachingSelectors.actionPersonalNote.editContainer` (`#editCacheNote`) 查询备注编辑器容器。如果它存在且其 display 属性为 `'none'`，则点击备注编辑触发器 `geocachingSelectors.actionPersonalNote.trigger` (`#viewCacheNote, button[aria-controls="editCacheNote"]`) 以显示编辑器。
    2.  **轮询文本域**：设置轮询定时器，每 `200ms` 检查一次（最多尝试 `10` 次，最长 `2` 秒），等待文本输入框元素 `geocachingSelectors.actionPersonalNote.textarea` (`textarea#cacheNoteText`) 变得可见（通过 `offsetParent !== null` 判断）。
        *   如果无法变得可见，清除定时器并返回 `'Error: Note text area did not become visible.'`。
    3.  **插入文本**：一旦文本输入框可见，将其 `value` 属性设置为 `text`，并分发（dispatch）一个冒泡的 `input` 事件。
    4.  **保存备注**：通过 `geocachingSelectors.actionPersonalNote.submit` (`button.js-pcn-submit`) 定位保存/提交按钮。
        *   若未找到保存按钮，返回 `'Error: Save button not found.'`。
        *   否则，点击保存按钮，并返回 `'Personal Note saved successfully.'`。

---

## 3. 宝藏列表页面解析选择器 (`listSelectors`)

用于在列表页（List Page）提取宝藏行及各字段信息的选择器，定义在 `src/utils/selectors.ts` 的 `listSelectors` 对象中：

| 字段/功能 | 选择器 (Selector) | 描述 |
| :--- | :--- | :--- |
| `row` | `tr.list-geocache-row` | 代表列表中的单个宝藏行元素。 |
| `gcCode` | `.geocache-meta span:last-child` | 列表行内用于提取宝藏 GC Code 的元素。 |
| `cacheName` | `a[href*="/geocache/"]` | 列表行内获取宝藏名称的链接元素。 |
| `cacheUrl` | `a[href*="/geocache/"]` | 列表行内用于提取宝藏详细页 URL 的元素。 |
| `dtRating` | `td.list-geocache-dt` | 列表行内提取 D/T 评分（Difficulty / Terrain）的单元格。 |

---

## 4. 解题验证网站（Certitude & GeoCheck）选择器与交互

该扩展还会在支持的第三方坐标验证网站（Certitude / GeoCheck）上注入内容脚本 `src/content/checker.ts`，以接收扩展程序的控制命令自动填充解密答案。

### A. 网页特征探测与消息监听
内容脚本通过检查 `window.location.href` 来识别当前的校验网站，并使用 `chrome.runtime.onMessage.addListener` 监听外部命令：
*   **`GET_PAGE_STATE` 消息**：
    *   **作用**：获取当前网页的解密器类型。
    *   **返回值**：`{ success: true, type: 'Certitude Page' | 'GeoCheck Page', data: { url: string }, actions: ['DEBUG_FILL_CHECKER'] }`。
*   **`DEBUG_FILL_CHECKER` 消息**：
    *   **参数**：`message.payload.solution` （解答出的坐标字符串）。
    *   **作用**：将解答自动填入对应的输入框中。

---

### B. Certitude 选择器 (`certitudeSelectors`)

Certitude 校验器对应的选择器定义在 `certitudeSelectors` 中：

| 项 | 选择器 (Selector) | 描述 |
| :--- | :--- | :--- |
| `solutionInput` | `input#solution, input[name="coordinates"]` | 解答/坐标输入框。 |
| `submitButton` | `input#submitButton, input[type="submit"]` | 提交按钮。 |
| `successElement` | `.success` | 指示坐标校验正确的提示元素。 |
| `failureElement` | `.error, .error-detail` | 指示校验失败的错误提示元素。 |

---

### C. GeoCheck 选择器 (`geocheckSelectors`)

GeoCheck 校验器支持单文本框与六文本框输入模式，并包含人机验证，其选择器定义在 `geocheckSelectors` 中：

| 项 | 选择器 (Selector) | 描述 |
| :--- | :--- | :--- |
| `oneFieldInput` | `input[name="coordOneField"]` | 单个输入框模式下的坐标输入框。 |
| `sixFieldInputs.latRadio` | `input[name="lat"]` | 纬度单选按钮（N / S）。 |
| `sixFieldInputs.latDeg` | `input[name="latdeg"]` | 纬度：度。 |
| `sixFieldInputs.latMin` | `input[name="latmin"]` | 纬度：分。 |
| `sixFieldInputs.latDec` | `input[name="latdec"]` | 纬度：小数分。 |
| `sixFieldInputs.lonRadio` | `input[name="lon"]` | 经度单选按钮（E / W）。 |
| `sixFieldInputs.lonDeg` | `input[name="londeg"]` | 经度：度。 |
| `sixFieldInputs.lonMin` | `input[name="lonmin"]` | 经度：分。 |
| `sixFieldInputs.lonDec` | `input[name="londec"]` | 经度：小数分。 |
| `captchaImage` | `img[src="/dimages/captcha.php"]` | GeoCheck 页面上的人机验证图片。 |
| `captchaInput` | `input[name="usercaptcha"]` | 人机验证输入框。 |
| `submitButton` | `input[type="submit"][value="Check"]` | 提交验证按钮。 |
| `successElement` | `input[name="ref"][value="/chkcorrect.php"]` | 指示校验正确的标志元素。 |
| `failureElement` | `td.alert` | 指示校验失败的提示单元格。 |
