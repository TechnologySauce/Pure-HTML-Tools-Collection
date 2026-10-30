# User Instruction Memory

## Entries

[Project Knowledge Summary]
- Date: 2026-10-30
- Context: Discovered by Agent while building and verifying the tool collection
- Category: Build Methods
- Instructions:
  - 构建：`node scripts/build.mjs`（或 `npm run build`），把公共样式/脚本按 `/* inline:<rel>:start|end */` 标记重新内联进工具页，并生成首页卡片、`tools.json`、`sitemap.xml`、404 页 base 路径；重复执行结果稳定。
  - 校验：`npm run validate`（html-validate 覆盖 index、404、tools/*.html）。
  - 测试：`npm test`（jsdom，无头浏览器即可跑），新增工具需在 `scripts/test.mjs` 的 `tests` 对象补交互断言；一键全查用 `npm run check`。
  - 依赖 jsdom/html-validate 已写入 devDependencies，脚本内有全局依赖回退逻辑，`NODE_PATH=$(npm root -g) node scripts/test.mjs` 也可运行。

[Project Knowledge Summary]
- Date: 2026-10-30
- Context: Discovered by Agent while deploying to GitHub Pages
- Category: Operations & Deployment
- Instructions:
  - 部署走 GitHub Actions（`.github/workflows/pages.yml`），推到 `main` 自动构建 `_site` 并发布；仓库 Settings 中 Pages 的 Source 必须是 "GitHub Actions"，否则 `configure-pages` 步骤会因 "Get Pages site failed" 失败。
  - 站点地址：https://technologysauce.github.io/Pure-HTML-Tools-Collection/ ；自定义域名时用 `SITE_URL=... node scripts/build.mjs` 覆盖。
  - 本环境推送需要凭证助手 `/app/agent/bin/agent git-credential-helper`；助手返回 500 时推送会报 "could not read Username"，此时需等待助手恢复或更换令牌，不要改用其他方式绕过。
