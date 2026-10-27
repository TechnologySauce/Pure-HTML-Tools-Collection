# 纯 HTML 工具箱

单文件、零依赖、离线可用的浏览器工具合集。

每个工具都是一个独立的 HTML 文件，样式与脚本在构建时内联，因此可以单独下载、断网使用，也可以直接放进任何静态站点托管。所有数据只在浏览器本地处理，不会上传到服务器。

在线访问：<https://technologysauce.github.io/Pure-HTML-Tools-Collection/>

## 工具列表

### 文本处理

| 工具 | 说明 |
| --- | --- |
| [字数统计](tools/text-counter.html) | 实时统计字符、汉字、单词、行数、段落和阅读时长 |
| [文本格式转换](tools/text-case.html) | 大小写、驼峰、下划线、中划线等命名风格互转 |
| [HTML 实体转义](tools/html-entities.html) | 转义特殊字符、中文转数字实体、实体还原 |
| [文本对比 Diff](tools/text-diff.html) | 逐行比较差异，支持忽略空白与大小写 |
| [文本行处理](tools/text-lines.html) | 去重、排序、去空行、加行号、关键词筛选 |

### 开发者

| 工具 | 说明 |
| --- | --- |
| [JSON 格式化](tools/json-formatter.html) | 格式化、压缩、校验 JSON，错误定位到行列 |
| [Base64 编码解码](tools/base64.html) | 文本与文件互转，支持 URL 安全字符集 |
| [URL 编码解码](tools/url-codec.html) | 百分号编码解码与 URL 结构拆解 |
| [哈希计算](tools/hash.html) | MD5、SHA-1、SHA-256、SHA-512、CRC32、HMAC |
| [正则测试](tools/regex-tester.html) | 实时高亮、分组查看、替换预览 |
| [UUID 生成器](tools/uuid.html) | 批量生成 UUID v4 与时间有序的 v7 |
| [时间戳转换](tools/timestamp.html) | 秒/毫秒自动识别，本地时间与 UTC 对照 |
| [JWT 解析](tools/jwt-decoder.html) | 解析 Header/Payload、检查过期、HMAC 验签 |

### 设计

| 工具 | 说明 |
| --- | --- |
| [颜色格式转换](tools/color-converter.html) | HEX/RGB/HSL/HSV/CMYK 互转与 WCAG 对比度 |
| [调色板生成器](tools/color-palette.html) | 主色生成 11 级梯度与 4 组和谐配色 |
| [CSS 渐变生成器](tools/gradient.html) | 线性/径向/圆锥渐变可视化调节与复制 |
| [阴影生成器](tools/box-shadow.html) | box-shadow 可视化调节、预设与代码复制 |

### 图片

| 工具 | 说明 |
| --- | --- |
| [图片压缩](tools/image-compress.html) | 本地压缩图片，可调质量与最大边长 |
| [图片 Base64](tools/image-base64.html) | 图片与 Base64 Data URL 双向转换 |

### 计算

| 工具 | 说明 |
| --- | --- |
| [百分比计算器](tools/percentage-calculator.html) | 求百分之几、求占比、增长率、按比例增减 |
| [单位换算](tools/unit-converter.html) | 长度、质量、面积、体积、速度、存储、时间、温度 |

## 本地使用

不需要构建。克隆仓库后直接用浏览器打开 `index.html` 即可，也可以用任意静态服务器预览：

```bash
python3 -m http.server 8080
```

## 开发

```bash
# 安装开发依赖（仅构建与测试需要，站点本身零依赖）
npm install

# 构建：内联资源、生成首页卡片、tools.json、sitemap.xml、404 页面
npm run build

# HTML 规范校验
npm run validate

# 无浏览器自动化测试（jsdom）
npm test

# 一次性执行构建 + 校验 + 测试
npm run check
```

### 新增一个工具

1. 复制任意现有工具页作为模板，放到 `tools/<slug>.html`。
2. 修改 `<script type="application/json" id="tool-meta">` 中的 `title`、`desc`、`category`、`tags`、`order`。
   `category` 取值：`text`、`dev`、`design`、`image`、`calc`、`util`。
3. 页面样式与脚本直接写在文件内；公共皮肤通过 `<style data-inline="assets/tool-base.css">` 和
   `<script data-inline="assets/tool-base.js"></script>` 引入，构建时会被替换成内联内容。
4. 在 `scripts/test.mjs` 的 `tests` 对象中补充该工具的关键交互断言。
5. 运行 `npm run check`，确认构建、校验、测试全部通过。

## 目录结构

```text
.
├── index.html               # 首页（搜索、分类筛选、主题切换）
├── 404.html                 # GitHub Pages 404 页
├── assets/
│   ├── site.css             # 首页样式
│   ├── app.js               # 首页交互
│   ├── tool-base.css        # 工具页公共皮肤（构建时内联）
│   ├── tool-base.js         # 工具页公共函数 PHT（构建时内联）
│   └── favicon.svg
├── tools/                   # 每个工具一个独立 HTML
│   └── ...
├── scripts/
│   ├── build.mjs            # 构建与元数据生成
│   └── test.mjs             # jsdom 自动化测试
├── .github/workflows/pages.yml
├── tools.json               # 构建产物：工具清单
└── sitemap.xml              # 构建产物：站点地图
```

构建脚本会把改动直接写回 `tools/*.html`、`index.html`、`404.html`，这些文件同时是构建产物和源码，提交前请确保已运行 `npm run build`。

## 部署

推送到 `main` 分支后，GitHub Actions 会自动构建并发布到 GitHub Pages（见 `.github/workflows/pages.yml`）。
部署到自定义域名时，可通过环境变量覆盖站点地址：

```bash
SITE_URL=https://tools.example.com node scripts/build.mjs
```

## 许可

[MIT](LICENSE)
