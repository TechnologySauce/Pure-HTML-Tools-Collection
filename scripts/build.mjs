#!/usr/bin/env node
/**
 * 构建脚本：把公共样式/脚本内联进每个工具，生成首页卡片、分类筛选、tools.json 与 sitemap。
 * 用法：node scripts/build.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TOOLS_DIR = path.join(ROOT, "tools");
const SITE_URL = (process.env.SITE_URL || "https://technologysauce.github.io/Pure-HTML-Tools-Collection").replace(/\/+$/, "");

const CATEGORIES = [
  {
    id: "text",
    name: "文本处理",
    icon: '<path d="M4 6h16M4 11h11M4 16h14M4 21h8"/>'
  },
  {
    id: "dev",
    name: "开发者",
    icon: '<path d="m9 8-4 4 4 4M15 8l4 4-4 4"/>'
  },
  {
    id: "design",
    name: "设计",
    icon: '<path d="M12 3s6 5.6 6 10a6 6 0 0 1-12 0c0-4.4 6-10 6-10Z"/>'
  },
  {
    id: "image",
    name: "图片",
    icon: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="m4 17 5-5 4.5 4.5L17 13l3 3"/>'
  },
  {
    id: "calc",
    name: "计算",
    icon: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 12h2M14 12h2M8 16h2M14 16h2"/>'
  },
  {
    id: "util",
    name: "小工具",
    icon: '<path d="M13 2 5 13h5l-1 9 8-11h-5l1-9Z"/>'
  }
];

const CAT_MAP = new Map(CATEGORIES.map((c) => [c.id, c]));
const problems = [];

function fail(msg) {
  problems.push(msg);
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function readMeta(file, html) {
  const m = html.match(/<script type="application\/json" id="tool-meta">([\s\S]*?)<\/script>/);
  if (!m) {
    fail(`${file}: 缺少 <script type="application/json" id="tool-meta"> 元数据块`);
    return null;
  }
  let meta;
  try {
    meta = JSON.parse(m[1]);
  } catch (e) {
    fail(`${file}: tool-meta 不是合法 JSON（${e.message}）`);
    return null;
  }
  const slug = path.basename(file, ".html");
  if (meta.slug && meta.slug !== slug) fail(`${file}: slug "${meta.slug}" 与文件名不一致`);
  if (!meta.title) fail(`${file}: 缺少 title`);
  if (!meta.desc) fail(`${file}: 缺少 desc`);
  if (!CAT_MAP.has(meta.category)) fail(`${file}: category "${meta.category}" 不在预设分类中`);
  if (meta.tags && !Array.isArray(meta.tags)) fail(`${file}: tags 必须是数组`);
  if (!/<h1[\s>]/.test(html)) fail(`${file}: 缺少 h1 标题`);
  if (!/<meta name="description"/.test(html)) fail(`${file}: 缺少 meta description`);
  if (!/<title>/.test(html)) fail(`${file}: 缺少 title 标签`);
  return {
    ...meta,
    slug,
    category: meta.category || "util",
    tags: Array.isArray(meta.tags) ? meta.tags : [],
    order: Number.isFinite(meta.order) ? meta.order : 999
  };
}

function inlineAssets(file, html) {
  // 资源以内联标记形式存放：/* inline:<相对路径>:start */ ... /* inline:<相对路径>:end */
  // 构建时按标记重新生成，改了公共样式/脚本后重新构建即可同步到所有页面。
  // 同时兼容新页面使用的 <style data-inline="..."> / <script data-inline="..."> 占位写法。
  let out = html.replace(/<style data-inline="([^"]+)">\s*<\/style>/g, (whole, rel) => {
    return `<style>\n/* inline:${rel}:start */\n/* inline:${rel}:end */\n</style>`;
  });
  out = out.replace(/<script data-inline="([^"]+)"><\/script>/g, (whole, rel) => {
    return `<script>\n/* inline:${rel}:start */\n/* inline:${rel}:end */\n</script>`;
  });

  out = out.replace(
    /(\/\* inline:([^*\s]+):start \*\/)[\s\S]*?(\/\* inline:\2:end \*\/)/g,
    (whole, open, rel, close) => {
      const asset = path.join(ROOT, rel);
      if (!fs.existsSync(asset)) {
        fail(`${file}: 找不到内联资源 ${rel}`);
        return whole;
      }
      const body = fs.readFileSync(asset, "utf8").trimEnd();
      return `${open}\n${body}\n${close}`;
    }
  );

  // 工具必须自包含：不允许外链样式或脚本
  if (/<link[^>]+rel="stylesheet"/i.test(out)) fail(`${file}: 工具页不允许外链样式表`);
  const scriptSrc = out.match(/<script[^>]+src=/i);
  if (scriptSrc) fail(`${file}: 工具页不允许外链脚本`);
  if (/data-inline=/.test(out)) fail(`${file}: 内联资源替换未完成`);
  if (/\/\* inline:/.test(out) && out.includes(":start */\n/* inline:")) fail(`${file}: 内联资源内容为空`);
  return out;
}

if (!fs.existsSync(TOOLS_DIR)) {
  console.error("找不到 tools 目录");
  process.exit(1);
}

const files = fs
  .readdirSync(TOOLS_DIR)
  .filter((f) => f.endsWith(".html"))
  .sort();

if (files.length === 0) {
  console.error("tools 目录下没有工具文件");
  process.exit(1);
}

const tools = [];
for (const name of files) {
  const abs = path.join(TOOLS_DIR, name);
  const original = fs.readFileSync(abs, "utf8");
  const meta = readMeta(name, original);
  if (!meta) continue;
  const built = inlineAssets(name, original);
  if (built !== original) fs.writeFileSync(abs, built, "utf8");
  tools.push(meta);
}

const seen = new Set();
for (const t of tools) {
  const key = t.slug.toLowerCase();
  if (seen.has(key)) fail(`重复的工具 slug: ${t.slug}`);
  seen.add(key);
}

const ordered = tools.slice().sort((a, b) => {
  const ca = CATEGORIES.findIndex((c) => c.id === a.category);
  const cb = CATEGORIES.findIndex((c) => c.id === b.category);
  if (ca !== cb) return ca - cb;
  if (a.order !== b.order) return a.order - b.order;
  return a.title.localeCompare(b.title, "zh-Hans-CN");
});

function iconSvg(cat) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${cat.icon}</svg>`;
}

const counts = new Map();
for (const t of tools) counts.set(t.category, (counts.get(t.category) || 0) + 1);

const chips = [
  `    <button class="chip" type="button" data-cat="all" aria-pressed="true">全部 <span>${tools.length}</span></button>`
]
  .concat(
    CATEGORIES.filter((c) => counts.get(c.id)).map(
      (c) =>
        `    <button class="chip" type="button" data-cat="${c.id}" aria-pressed="false">${c.name} <span>${counts.get(c.id)}</span></button>`
    )
  )
  .join("\n");

const cards = ordered
  .map((t) => {
    const cat = CAT_MAP.get(t.category);
    const haystack = [t.title, t.desc, cat.name, t.slug, ...t.tags].join(" ").toLowerCase();
    const tags = t.tags
      .slice(0, 4)
      .map((tag) => `<i>${escapeHtml(tag)}</i>`)
      .join("");
    return `    <a class="card" href="tools/${t.slug}.html" data-cat="${t.category}" data-search="${escapeHtml(haystack)}">
      <span class="card-head">
        <span class="card-icon">${iconSvg(cat)}</span>
        <span class="card-title">${escapeHtml(t.title)}</span>
      </span>
      <span class="card-arrow" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
      <span class="card-desc">${escapeHtml(t.desc)}</span>
      <span class="card-tags">${tags}</span>
    </a>`;
  })
  .join("\n");

const indexPath = path.join(ROOT, "index.html");
let index = fs.readFileSync(indexPath, "utf8");

function replaceBlock(source, name, content) {
  const re = new RegExp(`(<!-- build:${name}:start -->)[\\s\\S]*?(<!-- build:${name}:end -->)`);
  if (!re.test(source)) {
    fail(`index.html: 找不到 ${name} 构建区块`);
    return source;
  }
  return source.replace(re, `$1\n${content}\n    $2`);
}

index = replaceBlock(index, "chips", chips);
index = replaceBlock(index, "tools", cards);
index = index.replace(/(<!-- build:count:start -->)[\s\S]*?(<!-- build:count:end -->)/g, `$1${tools.length}$2`);
fs.writeFileSync(indexPath, index, "utf8");

if (index.includes("{{")) fail("index.html: 仍有未替换的模板占位符");

// 404 页：内联样式并按部署路径写入 base，保证任意深度的缺失路径都能找到资源
const notFoundPath = path.join(ROOT, "404.html");
if (fs.existsSync(notFoundPath)) {
  const basePath = (() => {
    try {
      return new URL(SITE_URL).pathname.replace(/\/?$/, "/");
    } catch (e) {
      return "/";
    }
  })();
  let notFound = inlineAssets("404.html", fs.readFileSync(notFoundPath, "utf8"));
  notFound = notFound.split("{{BASE_URL}}").join(basePath);
  if (notFound.includes("{{")) fail("404.html: 仍有未替换的模板占位符");
  fs.writeFileSync(notFoundPath, notFound, "utf8");
}

// tools.json：给外部脚本或第三方使用的清单
const manifest = {
  name: "纯 HTML 工具箱",
  url: SITE_URL + "/",
  count: tools.length,

  categories: CATEGORIES.filter((c) => counts.get(c.id)).map((c) => ({ id: c.id, name: c.name, count: counts.get(c.id) })),
  tools: ordered.map((t) => ({
    slug: t.slug,
    title: t.title,
    desc: t.desc,
    category: t.category,
    tags: t.tags,
    url: `${SITE_URL}/tools/${t.slug}.html`
  }))
};
fs.writeFileSync(path.join(ROOT, "tools.json"), JSON.stringify(manifest, null, 2) + "\n", "utf8");

// sitemap.xml（不写 lastmod，避免每次构建都产生无意义的时间戳 diff）
const urls = [`${SITE_URL}/`, ...ordered.map((t) => `${SITE_URL}/tools/${t.slug}.html`)];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>\n    <loc>${u}</loc>\n  </url>`).join("\n")}
</urlset>
`;
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), sitemap, "utf8");

if (problems.length) {
  console.error(`构建失败，发现 ${problems.length} 个问题：`);
  for (const p of problems) console.error(" - " + p);
  process.exit(1);
}

console.log(`构建完成：${tools.length} 个工具，${counts.size} 个分类`);
