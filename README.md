# autoGC (GC-ATO)

autoGC (Geocaching Automation Tool & Optimizer) 是一款专为 Geocaching.com 设计的 Chrome 浏览器扩展插件。它旨在帮助 Geocaching 玩家与解谜爱好者实现页面信息的一键提取、自动解密、以及坐标与备注的高效管理。

---

## 核心功能

### 1. 页面数据一键解析 (GCInfo Extraction)
自动提取当前 Geocaching 缓存页面的所有核心元数据：
*   **基础元数据**：GC Code、D/T 难度/地形级别、所有者（Owner）及主页链接、隐藏日期（Hidden Date）。
*   **个人备注（Personal Note）**：智能提取保存在藏宝页面上的个人备注。
*   **属性图标（Attributes）**：自动提取属性特征，并**智能过滤**无意义的 `blank` 空白占位符。
*   **收藏点（Favorite Points）**：提取该藏宝获得的红心收藏数量。
*   **网页描述（Description）**：自动**合并提取**短描述（Short Description）与长描述（Long Description），保证解谜线索不遗漏。
*   **旅行虫（Trackables）**：提取当前藏宝中持有的所有 Travel Bug 列表。
*   **书签列表（Bookmarks）**：抓取公开书签以及用户自己的私有书签。
*   **近期日志（Logs）**：提取最近的 5 条玩家日志内容。
*   **提示信息自动解密（Hint Decryption）**：自动对 Hint 进行 **ROT13 解密**，同时**保留**中括号 `[...]` 内原本无需解密的说明文字，直接呈现明文。

### 2. 自动化 DOM 交互工作流 (Automation Workflows)
*   **修改 Corrected Coordinates（纠正坐标）**：一键调用自动化脚本打开坐标修改面板，自动填入新坐标并提交。**支持 Geocaching 官方最新的 `data-testid` Popover 弹窗交互**，具备自动检测关闭和优雅降级逻辑。
*   **修改 Personal Note（个人备注）**：一键保存用户输入的新备注内容到 Geocaching 服务器。
*   **Checker 自动识别**：智能检测页面上的第三方 Geochecker 链接（如 Certitude、Geocheck 等），为后续自动化验证打下基础。

### 3. 开发调试面板 (Debug UI)
*   基于 **Vue 3 + TypeScript + Vite + TailwindCSS** 构建的侧边/浮动开发面板。
*   支持查看解析后的实时 JSON 数据、触发坐标更新动作、查看 Checker 解析状态以及快速进行各项自动化测试。

---

## 项目目录结构

```text
GC-ATO/
├── src/
│   ├── content/          # Chrome Content Scripts（直接注入页面的脚本）
│   │   ├── geocaching.ts # 核心信息提取与自动化工作流逻辑
│   │   └── checker.ts    # Checker 链接提取与分析
│   ├── utils/
│   │   └── selectors.ts  # 统一的 CSS 选择器配置文件（便于适配官网改版）
│   ├── types/
│   │   └── index.ts      # TypeScript 接口与类型定义
│   ├── App.vue           # 调试面板前端页面
│   ├── main.ts           # 前端挂载入口
│   └── background.ts     # Chrome Extension Background Service Worker
├── tests/                # 自动化测试用例（包含对抗性测试与压力测试）
├── dist/                 # 编译后的扩展打包目录（加载至浏览器）
├── vite.config.ts        # Vite 配置文件
└── package.json          # 依赖及构建脚本
```

---

## 快速开始

### 1. 开发与构建
请确保本地已安装 [Node.js](https://nodejs.org/)。

```bash
# 安装依赖
npm install

# 运行本地开发服务器
npm run dev

# 编译打包 Chrome 插件
npm run build
```

### 2. 安装至 Chrome 浏览器
1. 打开 Chrome 浏览器，访问 `chrome://extensions/`。
2. 在右上角开启 **开发者模式** (Developer mode)。
3. 点击左上角的 **加载已解压的扩展程序** (Load unpacked)。
4. 选择本项目打包生成的 `dist` 文件夹即可加载插件。
5. 打开任意 [Geocaching Cache 详情页](https://www.geocaching.com/play/geocache/...)，即可看到自动加载的 debug 调试面板。

### 3. 运行测试
项目集成了 `Vitest` 用于进行 DOM 解析的单元测试：
```bash
# 运行单元测试
npm run test
```

---

## 许可证
[MIT License](LICENSE)
