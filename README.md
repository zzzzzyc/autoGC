# autoGC (GC-ATO)

autoGC (Geocaching Automation Tool & Optimizer) 是一款专为 Geocaching.com 深度用户与解谜宝爱好者设计的 Chrome 浏览器扩展。它通过高效的数据解析与自动化工作流，显著提升玩家管理缓存坐标、备注与第三方 Geochecker 的效率。

---

## 核心功能

*   **数据自动提取**：一键提取并整合宝藏基础元数据、个人备注、属性图标、旅行虫、公开/私有书签、近期日志，并自动对提示（Hint）进行 ROT13 解密（保留括注文字）。
*   **自动化工作流**：支持一键向 Geocaching 服务器提交纠正坐标（已适配官方最新 Popover UI 面板）与修改个人备注。
*   **开发调试面板**：内置基于 Vue 3 + TypeScript 的侧边控制台，方便实时查看解析 JSON 数据与交互测试。

---

## 快速开始

### 1. 本地构建
确保您的系统已安装 [Node.js](https://nodejs.org/)。

```bash
# 安装依赖
npm install

# 编译打包 Chrome 插件
npm run build

# 运行本地开发服务器
npm run dev
```

### 2. 载入 Chrome 浏览器
1. 打开 Chrome 浏览器，访问 `chrome://extensions/`。
2. 开启右上角的 **开发者模式** (Developer mode)。
3. 点击左上角 **加载已解压的扩展程序** (Load unpacked)。
4. 选择项目构建生成的 `dist/` 文件夹。

### 3. 运行测试
项目采用 Vitest 进行 DOM 单元测试、对抗性测试与压力测试：
```bash
npm run test
```

---

## 项目文档

详细的技术说明、API 接口和测试指南已移至对应文档中：

*   **API 接口与设计说明**：请参阅 [docs/api_docs.md](file:///c:/Users/zzzzz/Documents/antigravity/GC-ATO/docs/api_docs.md)。
*   **测试框架与环境配置**：请参阅 [docs/TEST_INFRA.md](file:///c:/Users/zzzzz/Documents/antigravity/GC-ATO/docs/TEST_INFRA.md)。

---

## 许可证

本项目基于 [WTFPL](file:///c:/Users/zzzzz/Documents/antigravity/GC-ATO/LICENSE) (Do What The Fuck You Want To Public License) 协议开源。
