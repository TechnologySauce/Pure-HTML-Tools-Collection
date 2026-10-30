#!/usr/bin/env node
/**
 * 无浏览器自动化测试：用 jsdom 载入每个工具页，跑通用检查与针对性交互测试。
 * 用法：NODE_PATH=$(npm root -g) node scripts/test.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import nodeCrypto from "node:crypto";

function loadDependency(name) {
  // 优先使用项目内安装的依赖，其次回退到全局安装（NODE_PATH / npm root -g）
  try {
    return createRequire(import.meta.url)(name);
  } catch (e) {
    /* 继续尝试全局 */
  }
  const root = (process.env.NODE_PATH || execSync("npm root -g").toString()).split(path.delimiter)[0];
  return createRequire(root + path.sep)(name);
}

const { JSDOM, VirtualConsole } = loadDependency("jsdom");

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TOOLS = path.join(ROOT, "tools");

let passed = 0;
const failures = [];

function ok(cond, label) {
  if (cond) {
    passed++;
  } else {
    failures.push(label);
  }
}

function eq(actual, expected, label) {
  if (actual === expected) {
    passed++;
  } else {
    failures.push(`${label}\n      期望: ${JSON.stringify(expected)}\n      实际: ${JSON.stringify(actual)}`);
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function load(file, opts = {}) {
  const html = fs.readFileSync(file, "utf8");
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("jsdomError", (e) => errors.push("jsdomError: " + e.message));
  virtualConsole.on("error", (...args) => errors.push("console.error: " + args.join(" ")));

  const dom = new JSDOM(html, {
    runScripts: "dangerously",
    url: opts.url || pathToFileURL(file).href,
    pretendToBeVisual: true,
    resources: opts.resources ? "usable" : undefined,
    virtualConsole,
    beforeParse(window) {
      window.TextEncoder = TextEncoder;
      window.TextDecoder = TextDecoder;
      if (opts.crypto) {
        Object.defineProperty(window, "crypto", { value: nodeCrypto.webcrypto, configurable: true });
      }
      window.matchMedia =
        window.matchMedia ||
        function (query) {
          return {
            matches: false,
            media: query,
            addEventListener() {},
            removeEventListener() {},
            addListener() {},
            removeListener() {}
          };
        };
      window.addEventListener("error", (e) => errors.push("window.error: " + (e.message || e.error)));
    }
  });

  await new Promise((resolve) => {
    if (dom.window.document.readyState === "complete") resolve();
    else dom.window.addEventListener("load", resolve);
  });
  await sleep(30);
  return { dom, window: dom.window, doc: dom.window.document, errors };
}

function checkCommon(name, ctx) {
  const { doc, window, errors } = ctx;
  ok(doc.documentElement.lang === "zh-CN", `${name}: html lang 应为 zh-CN`);
  ok(!!doc.querySelector("h1"), `${name}: 缺少 h1`);
  ok(!!doc.querySelector('meta[name="description"]'), `${name}: 缺少 meta description`);
  ok(!!doc.querySelector('meta[name="viewport"]'), `${name}: 缺少 viewport`);
  eq(errors.length, 0, `${name}: 页面脚本报错 -> ${errors.join(" | ")}`);

  const ids = Array.from(doc.querySelectorAll("[id]")).map((el) => el.id);
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  eq(dup.length, 0, `${name}: 存在重复 id ${dup.join(",")}`);

  const external = Array.from(doc.querySelectorAll("script[src], link[rel=stylesheet]"));
  eq(external.length, 0, `${name}: 不允许外链脚本或样式`);

  // 主题切换
  const btn = doc.querySelector("[data-theme-toggle]");
  ok(!!btn, `${name}: 缺少主题切换按钮`);
  if (btn) {
    const before = doc.documentElement.getAttribute("data-theme");
    btn.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    const after = doc.documentElement.getAttribute("data-theme");
    ok(before !== after, `${name}: 主题切换未生效`);
    ok(after === "dark" || after === "light", `${name}: 主题值异常 ${after}`);
  }
}

const tests = {
  "json-formatter.html": async (name, ctx) => {
    const { doc, window } = ctx;
    const input = doc.querySelector("#jsonInput");
    const out = doc.querySelector("#jsonOutput");
    const errBox = doc.querySelector("#errorBox");

    input.value = '{"b":2,"a":[1,true,null]}';
    input.dispatchEvent(new window.Event("input", { bubbles: true }));
    await sleep(450);
    eq(out.textContent, JSON.stringify({ b: 2, a: [1, true, null] }, null, 2), `${name}: 自动格式化结果不正确`);

    const sort = doc.querySelector("#sortKeys");
    sort.checked = true;
    sort.dispatchEvent(new window.Event("change", { bubbles: true }));
    eq(out.textContent, JSON.stringify({ a: [1, true, null], b: 2 }, null, 2), `${name}: 键排序结果不正确`);

    doc.querySelector("#compactBtn").click();
    eq(out.textContent, '{"a":[1,true,null],"b":2}', `${name}: 压缩结果不正确`);

    input.value = '{"a":1,}';
    input.dispatchEvent(new window.Event("input", { bubbles: true }));
    await sleep(450);
    ok(errBox.classList.contains("show"), `${name}: 非法 JSON 未显示错误提示`);
    ok(/行/.test(errBox.textContent), `${name}: 错误提示未包含行列信息`);

    input.value = "";
    input.dispatchEvent(new window.Event("input", { bubbles: true }));
    await sleep(450);
    eq(out.textContent, "", `${name}: 清空输入后输出未清空`);
  },

  "text-counter.html": async (name, ctx) => {
    const { doc, window } = ctx;
    const ta = doc.querySelector("#text");
    ta.value = "你好，world! 123\n\n第二行。";
    ta.dispatchEvent(new window.Event("input", { bubbles: true }));
    const get = (id) => doc.getElementById(id).textContent;
    eq(get("chars"), "19", `${name}: 字符数`);
    eq(get("han"), "5", `${name}: 汉字数`);
    eq(get("words"), "1", `${name}: 英文单词数`);
    eq(get("numbers"), "1", `${name}: 数字串`);
    eq(get("lines"), "3", `${name}: 行数`);
    eq(get("paragraphs"), "2", `${name}: 段落数`);
    eq(get("bytes"), "33 B", `${name}: 字节数`);

    const limit = doc.querySelector("#limit");
    limit.value = "10";
    limit.dispatchEvent(new window.Event("input", { bubbles: true }));
    ok(/超出/.test(doc.querySelector("#limitNote").textContent), `${name}: 超出字数上限未提示`);
  },

  "text-case.html": async (name, ctx) => {
    const { doc, window } = ctx;
    const input = doc.querySelector("#caseIn");
    const out = doc.querySelector("#caseOut");
    const clickMode = (mode) => {
      doc.querySelector(`[data-mode="${mode}"]`).click();
    };
    input.value = "hello world";
    input.dispatchEvent(new window.Event("input", { bubbles: true }));

    clickMode("upper");
    eq(out.value, "HELLO WORLD", `${name}: upper`);
    clickMode("camel");
    eq(out.value, "helloWorld", `${name}: camel`);
    clickMode("pascal");
    eq(out.value, "HelloWorld", `${name}: pascal`);
    clickMode("snake");
    eq(out.value, "hello_world", `${name}: snake`);
    clickMode("kebab");
    eq(out.value, "hello-world", `${name}: kebab`);
    clickMode("constant");
    eq(out.value, "HELLO_WORLD", `${name}: constant`);
    clickMode("dot");
    eq(out.value, "hello.world", `${name}: dot`);
    clickMode("title");
    eq(out.value, "Hello World", `${name}: title`);
    clickMode("reverse");
    eq(out.value, "dlrow olleh", `${name}: reverse`);

    input.value = "helloWorld";
    input.dispatchEvent(new window.Event("input", { bubbles: true }));
    clickMode("snake");
    eq(out.value, "hello_world", `${name}: camel 输入转 snake`);
  },


  "url-codec.html": async (name, ctx) => {
    const { doc, window } = ctx;
    const input = doc.querySelector("#urlInput");
    const out = doc.querySelector("#urlOutput");
    const status = doc.querySelector("#status");

    input.value = "a b&c=d";
    doc.querySelector("#encodeComp").click();
    eq(out.value, "a%20b%26c%3Dd", `${name}: encodeURIComponent`);
    doc.querySelector("#encodeUri").click();
    eq(out.value, "a%20b&c=d", `${name}: encodeURI`);

    input.value = "%E4%BD%A0%E5%A5%BD";
    doc.querySelector("#decodeBtn").click();
    eq(out.value, "你好", `${name}: 解码中文`);

    input.value = "%E4";
    doc.querySelector("#decodeBtn").click();
    ok(status.classList.contains("error"), `${name}: 非法百分号编码未报错`);

    doc.querySelector("#parseBtn").click();
    const rows = doc.querySelectorAll("#paramBody tr");
    eq(rows.length, 3, `${name}: 查询参数行数`);
    eq(doc.querySelector("#pProtocol").textContent, "https:", `${name}: 协议解析`);
    eq(doc.querySelector("#pHost").textContent, "example.com", `${name}: 主机解析`);
    eq(rows[0].querySelectorAll("td")[0].textContent, "keyword", `${name}: 参数名解析`);
    eq(rows[0].querySelectorAll("td")[1].textContent, "纯 HTML", `${name}: 参数值解码`);

    doc.querySelector("#parseInput").value = "http://[";
    doc.querySelector("#parseBtn").click();
    ok(doc.querySelector("#parseStatus").classList.contains("error"), `${name}: 非法 URL 未报错`);
  },

  "hash.html": async (name, ctx) => {
    const { doc, window } = ctx;
    const input = doc.querySelector("#hashInput");
    const rows = Array.from(doc.querySelectorAll(".hash-row"));
    const valueOf = (label) => rows.find((r) => r.querySelector(".algo").textContent === label).querySelector(".value").textContent;

    input.value = "abc";
    input.dispatchEvent(new window.Event("input", { bubbles: true }));
    await sleep(300);
    eq(valueOf("MD5"), "900150983cd24fb0d6963f7d28e17f72", `${name}: MD5("abc")`);
    eq(valueOf("CRC32"), "352441c2", `${name}: CRC32("abc")`);

    input.value = "你好，世界";
    input.dispatchEvent(new window.Event("input", { bubbles: true }));
    await sleep(300);
    eq(valueOf("MD5"), nodeCrypto.createHash("md5").update("你好，世界", "utf8").digest("hex"), `${name}: 中文 MD5`);

    input.value = "123456789";
    input.dispatchEvent(new window.Event("input", { bubbles: true }));
    await sleep(300);
    eq(valueOf("CRC32"), "cbf43926", `${name}: CRC32 标准校验值`);

    const long = "工具箱".repeat(400);
    input.value = long;
    input.dispatchEvent(new window.Event("input", { bubbles: true }));
    await sleep(300);
    eq(valueOf("MD5"), nodeCrypto.createHash("md5").update(long, "utf8").digest("hex"), `${name}: 长文本 MD5（多分块）`);
    eq(valueOf("CRC32").length, 8, `${name}: 长文本 CRC32 格式`);

    eq(valueOf("SHA-256"), nodeCrypto.createHash("sha256").update(long, "utf8").digest("hex"), `${name}: SHA-256 长文本`);
    eq(valueOf("SHA-512"), nodeCrypto.createHash("sha512").update(long, "utf8").digest("hex"), `${name}: SHA-512 长文本`);

    doc.querySelector("#useHmac").checked = true;
    doc.querySelector("#useHmac").dispatchEvent(new window.Event("change", { bubbles: true }));
    doc.querySelector("#hmacKey").value = "pht-secret";
    doc.querySelector("#hmacKey").dispatchEvent(new window.Event("input", { bubbles: true }));
    await sleep(300);
    eq(valueOf("SHA-256"), nodeCrypto.createHmac("sha256", "pht-secret").update(long, "utf8").digest("hex"), `${name}: HMAC-SHA256`);
    doc.querySelector("#useHmac").checked = false;
    doc.querySelector("#useHmac").dispatchEvent(new window.Event("change", { bubbles: true }));
    await sleep(50);

    doc.querySelector("#upperCase").checked = true;
    doc.querySelector("#upperCase").dispatchEvent(new window.Event("change", { bubbles: true }));
    ok(/^[0-9A-F]+$/.test(valueOf("MD5")), `${name}: 大写输出未生效`);
  },

  "regex-tester.html": async (name, ctx) => {
    const { doc, window } = ctx;
    const pattern = doc.querySelector("#pattern");
    const text = doc.querySelector("#regexText");
    const countEl = doc.querySelector("#matchCount");
    const preview = doc.querySelector("#preview");

    pattern.value = "\\d+";
    text.value = "a1 b22 c333";
    text.dispatchEvent(new window.Event("input", { bubbles: true }));
    await sleep(260);
    eq(countEl.textContent, "3 处匹配", `${name}: 匹配数量`);
    eq(preview.querySelectorAll("mark").length, 3, `${name}: 高亮数量`);
    eq(doc.querySelectorAll("#matchBody tr").length, 3, `${name}: 详情行数`);

    doc.querySelector("#replacement").value = "[$&]";
    doc.querySelector("#replacement").dispatchEvent(new window.Event("input", { bubbles: true }));
    await sleep(260);
    eq(doc.querySelector("#replaceOut").textContent, "a[1] b[22] c[333]", `${name}: 替换结果`);

    pattern.value = "(";
    pattern.dispatchEvent(new window.Event("input", { bubbles: true }));
    await sleep(260);
    ok(doc.querySelector("#status").classList.contains("error"), `${name}: 非法表达式未报错`);

    pattern.value = "x*";
    text.value = "abc";
    text.dispatchEvent(new window.Event("input", { bubbles: true }));
    await sleep(260);
    ok(doc.querySelectorAll("#matchBody tr").length > 0, `${name}: 零宽匹配未产生结果`);

    pattern.value = "^(?<key>[\\w-]+)=(?<value>.*)$";
    doc.querySelector('#presets button[data-pattern*="?<key>"]').click();
    eq(pattern.value, "^(?<key>[\\w-]+)=(?<value>.*)$", `${name}: 预设未写入表达式`);
    ok(doc.querySelector("#flags input[value=g]").checked && doc.querySelector("#flags input[value=m]").checked, `${name}: 预设标志位错误`);
  },

  "uuid.html": async (name, ctx) => {
    const { doc, window } = ctx;
    const out = doc.querySelector("#uuidOut");
    const count = doc.querySelector("#count");
    const status = doc.querySelector("#status");

    count.value = "40";
    count.dispatchEvent(new window.Event("change", { bubbles: true }));
    const v4 = out.value.split("\n").filter(Boolean);
    eq(v4.length, 40, `${name}: v4 数量`);
    const re4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
    ok(v4.every((u) => re4.test(u)), `${name}: v4 格式或版本位不正确`);
    eq(new Set(v4).size, 40, `${name}: v4 出现重复`);

    doc.querySelector("#version").value = "v7";
    doc.querySelector("#version").dispatchEvent(new window.Event("change", { bubbles: true }));
    const v7 = out.value.split("\n").filter(Boolean);
    const re7 = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
    ok(v7.every((u) => re7.test(u)), `${name}: v7 格式或版本位不正确`);
    const sorted = v7.slice().sort();
    eq(sorted.join(","), v7.join(","), `${name}: v7 未按时间递增`);
    const ts = parseInt(v7[0].replace(/-/g, "").slice(0, 12), 16);
    ok(Math.abs(ts - Date.now()) < 5000, `${name}: v7 时间戳不正确`);

    doc.querySelector("#uppercase").checked = true;
    doc.querySelector("#uppercase").dispatchEvent(new window.Event("change", { bubbles: true }));
    ok(/^[0-9A-F-]+$/.test(out.value.split("\n")[0]), `${name}: 大写未生效`);

    doc.querySelector("#noHyphen").checked = true;
    doc.querySelector("#noHyphen").dispatchEvent(new window.Event("change", { bubbles: true }));
    ok(!out.value.includes("-"), `${name}: 去连字符未生效`);
    eq(out.value.split("\n")[0].length, 32, `${name}: 去连字符后长度`);

    doc.querySelector("#withPrefix").checked = true;
    doc.querySelector("#withPrefix").dispatchEvent(new window.Event("change", { bubbles: true }));
    ok(out.value.split("\n")[0].startsWith("urn:uuid:"), `${name}: urn 前缀未生效`);

    count.value = "0";
    count.dispatchEvent(new window.Event("change", { bubbles: true }));
    eq(out.value.split("\n").filter(Boolean).length, 1, `${name}: 数量下限未生效`);
    ok(status.textContent.length > 0, `${name}: 缺少状态提示`);
  },


  "html-entities.html": async (name, ctx) => {
    const { doc, window } = ctx;
    const input = doc.querySelector("#entityIn");
    const out = doc.querySelector("#entityOut");
    const status = doc.querySelector("#status");

    input.value = '<p class="a">你好 & welcome</p>';
    doc.querySelector("#escapeBtn").click();
    eq(out.value, "&lt;p class=&quot;a&quot;&gt;你好 &amp; welcome&lt;/p&gt;", `${name}: 转义`);

    doc.querySelector("#swapBtn").click();
    doc.querySelector("#unescapeBtn").click();
    eq(out.value, '<p class="a">你好 & welcome</p>', `${name}: 反转义`);

    doc.querySelector("#swapBtn").click();
    doc.querySelector("#hexMode").checked = true;
    doc.querySelector("#nonAsciiBtn").click();
    eq(out.value, '<p class="a">&#x4F60;&#x597D; & welcome</p>', `${name}: 非 ASCII 十六进制实体`);

    doc.querySelector("#hexMode").checked = false;
    doc.querySelector("#allBtn").click();
    ok(out.value.startsWith("&#60;&#112;"), `${name}: 全部转十进制实体`);

    input.value = "";
    doc.querySelector("#escapeBtn").click();
    ok(status.classList.contains("error"), `${name}: 空输入未提示`);
  },

  "text-diff.html": async (name, ctx) => {
    const { doc, window } = ctx;
    const a = doc.querySelector("#textA");
    const b = doc.querySelector("#textB");

    a.value = "a\nb\nc";
    b.value = "a\nx\nc";
    doc.querySelector("#diffBtn").click();
    eq(doc.querySelectorAll("#diffView .dl").length, 4, `${name}: 差异行数`);
    eq(doc.querySelectorAll("#diffView .dl.add").length, 1, `${name}: 新增行数`);
    eq(doc.querySelectorAll("#diffView .dl.del").length, 1, `${name}: 删除行数`);
    eq(doc.querySelector("#statAdd").textContent, "+1 新增", `${name}: 新增统计`);
    eq(doc.querySelector("#statDel").textContent, "-1 删除", `${name}: 删除统计`);

    b.value = "a\nb\nc";
    doc.querySelector("#diffBtn").click();
    eq(doc.querySelectorAll("#diffView .dl").length, 3, `${name}: 相同文本行数`);
    ok(doc.querySelector("#status").textContent.includes("完全一致"), `${name}: 相同文本未提示`);

    a.value = "";
    b.value = "";
    doc.querySelector("#diffBtn").click();
    ok(doc.querySelector("#diffView .diff-empty"), `${name}: 空输入未显示提示`);
    ok(doc.querySelector("#diffStats").hidden, `${name}: 空输入仍显示统计`);
  },

  "text-lines.html": async (name, ctx) => {
    const { doc, window } = ctx;
    const input = doc.querySelector("#linesIn");
    const out = doc.querySelector("#linesOut");
    const set = (id, checked) => {
      const el = doc.querySelector(id);
      el.checked = checked;
      el.dispatchEvent(new window.Event("change", { bubbles: true }));
    };

    input.value = "  b  \n\n a \na\n  b  \n";
    input.dispatchEvent(new window.Event("input", { bubbles: true }));
    await sleep(200);
    eq(out.value.split("\n").length, 5, `${name}: 原始行数`);

    set("#trim", true);
    set("#removeEmpty", true);
    set("#dedupe", true);
    eq(out.value, "b\na", `${name}: 去空行 + 去重 + trim`);

    set("#reverse", true);
    eq(out.value, "a\nb", `${name}: 反转行序`);
    set("#reverse", false);

    doc.querySelector("#sortMode").value = "asc";
    doc.querySelector("#sortMode").dispatchEvent(new window.Event("change", { bubbles: true }));
    eq(out.value, "a\nb", `${name}: 升序`);

    set("#numbering", true);
    doc.querySelector("#prefix").value = "- ";
    doc.querySelector("#prefix").dispatchEvent(new window.Event("input", { bubbles: true }));
    await sleep(200);
    eq(out.value, "1. - a\n2. - b", `${name}: 行号与前缀`);

    doc.querySelector("#filterMode").value = "keep";
    doc.querySelector("#keyword").value = "b";
    doc.querySelector("#keyword").dispatchEvent(new window.Event("input", { bubbles: true }));
    await sleep(200);
    eq(out.value, "1. - b", `${name}: 关键词筛选`);
  },

  "timestamp.html": async (name, ctx) => {
    const { doc, window } = ctx;
    const input = doc.querySelector("#tsInput");
    const status = doc.querySelector("#status");
    const convert = () => doc.querySelector("#toDateBtn").click();

    input.value = "1700000000";
    convert();
    eq(doc.querySelector("#rIso").textContent, "2023-11-14T22:13:20.000Z", `${name}: ISO 转换`);
    eq(doc.querySelector("#rSec").textContent, "1700000000", `${name}: 秒时间戳`);
    eq(doc.querySelector("#rMs").textContent, "1700000000000", `${name}: 毫秒时间戳`);
    ok(/^2023-11-1[45] \d{2}:\d{2}:\d{2} 周/.test(doc.querySelector("#rLocal").textContent), `${name}: 本地时间格式`);

    input.value = "1700000000000";
    convert();
    eq(doc.querySelector("#rIso").textContent, "2023-11-14T22:13:20.000Z", `${name}: 自动识别毫秒`);

    input.value = "-1";
    convert();
    eq(doc.querySelector("#rIso").textContent, "1969-12-31T23:59:59.000Z", `${name}: 负时间戳`);

    input.value = "abc";
    convert();
    ok(status.classList.contains("error"), `${name}: 非法输入未报错`);

    const dateInput = doc.querySelector("#dateInput");
    dateInput.value = "2024-01-01T00:00:00";
    doc.querySelector("#toTsBtn").click();
    const expected = Math.floor(new Date("2024-01-01T00:00:00").getTime() / 1000);
    ok(doc.querySelector("#dateStatus").textContent.includes("秒：" + expected), `${name}: 日期转时间戳`);
  },

  "jwt-decoder.html": async (name, ctx) => {
    const { doc, window } = ctx;
    doc.querySelector("#sampleBtn").click();
    await sleep(30);

    const payload = JSON.parse(doc.querySelector("#payloadOut").textContent);
    eq(payload.sub, "demo-user", `${name}: payload 解析`);
    ok(doc.querySelector("#claimsPanel").hidden === false, `${name}: 声明表格未显示`);
    ok(doc.querySelectorAll("#claimsBody tr").length >= 5, `${name}: 声明行数不足`);
    ok(doc.querySelector("#claimsBody").textContent.includes("未过期"), `${name}: exp 状态不正确`);

    doc.querySelector("#verifyBtn").click();
    await sleep(300);
    ok(doc.querySelector("#verifyStatus").textContent.includes("签名有效"), `${name}: 正确密钥验签失败 -> ${doc.querySelector("#verifyStatus").textContent}`);

    doc.querySelector("#secret").value = "wrong-secret";
    doc.querySelector("#verifyBtn").click();
    await sleep(300);
    ok(doc.querySelector("#verifyStatus").textContent.includes("签名无效"), `${name}: 错误密钥未被识别`);

    const input = doc.querySelector("#tokenInput");
    input.value = "only.two";
    input.dispatchEvent(new window.Event("input", { bubbles: true }));
    await sleep(320);
    ok(doc.querySelector("#status").classList.contains("error"), `${name}: 非法 JWT 未报错`);
  },

  "color-converter.html": async (name, ctx) => {
    const { doc, window } = ctx;
    const input = doc.querySelector("#colorInput");
    const type = (value) => {
      input.value = value;
      input.dispatchEvent(new window.Event("input", { bubbles: true }));
    };

    type("#ff0000");
    eq(doc.querySelector("#vHex").textContent, "#ff0000", `${name}: HEX`);
    eq(doc.querySelector("#vRgb").textContent, "rgb(255, 0, 0)", `${name}: RGB`);
    eq(doc.querySelector("#vHsl").textContent, "hsl(0, 100%, 50%)", `${name}: HSL`);

    type("rgb(0, 128, 255)");
    eq(doc.querySelector("#vHex").textContent, "#0080ff", `${name}: RGB 转 HEX`);

    type("hsl(120, 100%, 25%)");
    eq(doc.querySelector("#vHex").textContent, "#008000", `${name}: HSL 转 HEX`);

    type("not-a-color");
    ok(doc.querySelector("#status").classList.contains("error"), `${name}: 非法颜色未报错`);

    const fg = doc.querySelector("#fgInput");
    const bg = doc.querySelector("#bgInput");
    fg.value = "#ffffff";
    fg.dispatchEvent(new window.Event("input", { bubbles: true }));
    bg.value = "#000000";
    bg.dispatchEvent(new window.Event("input", { bubbles: true }));
    eq(doc.querySelector("#ratioA").textContent, "21.00 : 1", `${name}: 黑白对比度`);
    ok(doc.querySelector("#gradeA").textContent.includes("AAA"), `${name}: 黑白对比度等级`);
  },

  "base64.html": async (name, ctx) => {
    const { doc, window } = ctx;
    const input = doc.querySelector("#b64Input");
    const out = doc.querySelector("#b64Output");
    const status = doc.querySelector("#status");

    input.value = "你好";
    doc.querySelector("#encodeBtn").click();
    eq(out.value, "5L2g5aW9", `${name}: 中文编码`);

    doc.querySelector("#swapBtn").click();
    doc.querySelector("#decodeBtn").click();
    eq(out.value, "你好", `${name}: 解码回中文`);

    doc.querySelector("#urlSafe").checked = true;
    input.value = "???>>>";
    doc.querySelector("#encodeBtn").click();
    ok(!/[+/=]/.test(out.value), `${name}: URL 安全格式含非法字符 ${out.value}`);

    input.value = "not valid base64!";
    doc.querySelector("#decodeBtn").click();
    ok(status.classList.contains("error"), `${name}: 非法 Base64 未报错`);

    input.value = "5L2g5aW9";
    doc.querySelector("#decodeBtn").click();
    eq(out.value, "你好", `${name}: 忽略 padding 解码`);
  },

  "color-palette.html": async (name, ctx) => {
    const { doc, window } = ctx;
    const baseHex = doc.querySelector("#baseHex");
    const picker = doc.querySelector("#picker");
    const tones = () => Array.from(doc.querySelectorAll("#toneStrip .tone"));
    const labels = () => Array.from(doc.querySelectorAll("#toneStrip .tone-label")).map((el) => el.textContent);
    const type = (value) => {
      baseHex.value = value;
      baseHex.dispatchEvent(new window.Event("input", { bubbles: true }));
    };

    eq(tones().length, 11, `${name}: 明暗梯度应有 11 级`);
    eq(labels()[5], "#0f766e", `${name}: 第 6 级应为主色`);
    eq(picker.value, "#0f766e", `${name}: 取色器未同步主色`);
    ok(doc.querySelector("#cssOut").value.includes("--color-6: #0f766e;"), `${name}: CSS 变量未包含主色`);

    const rows = Array.from(doc.querySelectorAll(".harmony-row"));
    eq(rows.length, 4, `${name}: 应有 4 组和谐配色`);
    eq(rows.map((r) => r.querySelectorAll(".chip-color").length).join(","), "2,3,3,3", `${name}: 各组色块数量不正确`);

    type("#ff0000");
    eq(picker.value, "#ff0000", `${name}: 输入 HEX 后取色器未同步`);
    const freshRow = doc.querySelectorAll(".harmony-row")[0];
    const complement = freshRow.querySelectorAll(".chip-color")[1].textContent.trim();
    eq(complement, "#00ffff", `${name}: 红色互补色应为青色，实际 ${complement}`);
    ok(doc.querySelector("#cssOut").value.includes("--color-complement: #00ffff;"), `${name}: 互补色未写入 CSS`);

    doc.querySelector("#randomBtn").click();
    {
      const hex = picker.value;
      ok(/^#[0-9a-f]{6}$/.test(hex), `${name}: 随机主色格式异常 ${hex}`);
      eq(labels()[5], hex, `${name}: 随机后第 6 级未跟随主色`);
    }

    const before = baseHex.value;
    type("#xyz");
    baseHex.dispatchEvent(new window.Event("blur", { bubbles: true }));
    eq(baseHex.value, before, `${name}: 非法色值后未恢复原值`);
    ok(doc.querySelector("#status").classList.contains("error"), `${name}: 非法色值未提示错误`);
  },

  "gradient.html": async (name, ctx) => {
    const { doc, window } = ctx;
    const cssCode = doc.querySelector("#cssCode");
    const stops = () => Array.from(doc.querySelectorAll("#stops .stop-row"));

    eq(cssCode.value, "background: linear-gradient(135deg, #0f766e 0%, #2dd4bf 100%);", `${name}: 默认渐变值不正确`);
    eq(stops().length, 2, `${name}: 默认应有 2 个颜色节点`);
    ok(doc.querySelector("#removeStop").disabled, `${name}: 只有 2 个节点时删除按钮应禁用`);

    doc.querySelector('[data-colors="#f97316,#db2777"]').click();
    eq(cssCode.value, "background: linear-gradient(120deg, #f97316 0%, #db2777 100%);", `${name}: 预设未生效`);

    doc.querySelector("#addStop").click();
    doc.querySelector("#addStop").click();
    eq(stops().length, 4, `${name}: 添加节点后数量不正确`);
    const pickers = Array.from(doc.querySelectorAll("#stops input[type=color]")).map((el) => el.value);
    ok(pickers.every((v) => /^#[0-9a-f]{6}$/.test(v)), `${name}: 随机节点色值不是 #rrggbb -> ${pickers.join(",")}`);
    const pcts = Array.from(doc.querySelectorAll("#stops .percent")).map((el) => el.textContent);
    eq(pcts.join(","), "0%,33%,67%,100%", `${name}: 节点百分比不均匀`);

    doc.querySelector("#removeStop").click();
    eq(stops().length, 3, `${name}: 删除节点后数量不正确`);

    const range = doc.querySelector("#angleRange");
    range.value = "200";
    range.dispatchEvent(new window.Event("input", { bubbles: true }));
    eq(doc.querySelector("#angleNum").value, "200", `${name}: 角度数值未同步`);
    ok(cssCode.value.includes("linear-gradient(200deg"), `${name}: 角度变更未反映到 CSS`);

    const radial = doc.querySelector('input[name="gtype"][value="radial"]');
    radial.checked = true;
    radial.dispatchEvent(new window.Event("change", { bubbles: true }));
    ok(cssCode.value.startsWith("background: radial-gradient(circle at 50% 50%"), `${name}: 径向渐变未生效`);

    doc.querySelector("#addStop").click();
    doc.querySelector("#addStop").click();
    eq(stops().length, 5, `${name}: 应能添加至 5 个节点`);
    ok(doc.querySelector("#addStop").disabled, `${name}: 达到 5 个节点后添加按钮应禁用`);
    ok(!doc.querySelector("#removeStop").disabled, `${name}: 5 个节点时删除按钮应可用`);
  },

  "box-shadow.html": async (name, ctx) => {
    const { doc, window } = ctx;
    const out = doc.querySelector("#cssOut");
    const box = doc.querySelector("#previewBox");
    const setRange = (key, value) => {
      const el = doc.querySelector(`[data-key="${key}"]`);
      el.value = String(value);
      el.dispatchEvent(new window.Event("input", { bubbles: true }));
    };

    eq(out.value, "box-shadow: 0px 12px 32px 0px rgba(15, 23, 42, 0.22);\nborder-radius: 18px;", `${name}: 默认阴影代码不正确`);
    ok(box.style.boxShadow.includes("rgba(15, 23, 42, 0.22)"), `${name}: 预览未应用阴影`);
    eq(doc.querySelector("#opacityOut").textContent, "22%", `${name}: 透明度读数不正确`);

    setRange("x", -20);
    setRange("blur", 0);
    eq(doc.querySelector("#xOut").textContent, "-20px", `${name}: 水平偏移读数不正确`);
    ok(out.value.includes("-20px 12px 0px"), `${name}: 滑块值未应用`);

    doc.querySelector('[data-preset="硬边投影"]').click();
    eq(out.value, "box-shadow: 10px 10px 0px 0px rgba(17, 24, 39, 1);\nborder-radius: 4px;", `${name}: 预设阴影不正确`);
    eq(doc.querySelector("#colorHex").value, "#111827", `${name}: 预设未同步色值`);

    doc.querySelector('[data-preset="内凹输入框"]').click();
    ok(out.value.startsWith("box-shadow: inset 0px 2px 6px 0px"), `${name}: 内阴影预设不正确`);

    const hex = doc.querySelector("#colorHex");
    const prev = hex.value;
    hex.value = "nope";
    hex.dispatchEvent(new window.Event("input", { bubbles: true }));
    ok(doc.querySelector("#status").classList.contains("error"), `${name}: 非法色值未提示`);
    hex.dispatchEvent(new window.Event("blur", { bubbles: true }));
    eq(hex.value, prev, `${name}: 失焦后未恢复有效色值`);

    hex.value = "#00ff00";
    hex.dispatchEvent(new window.Event("input", { bubbles: true }));
    eq(doc.querySelector("#color").value, "#00ff00", `${name}: 色值输入未同步取色器`);
    ok(out.value.includes("rgba(0, 255, 0, 0.16)"), `${name}: 色值变更未反映到阴影`);

    doc.querySelector("#resetBtn").click();
    eq(out.value, "box-shadow: 0px 12px 32px 0px rgba(15, 23, 42, 0.22);\nborder-radius: 18px;", `${name}: 恢复默认失败`);

    doc.querySelector('[data-stage-btn="dark"]').click();
    eq(doc.querySelector("#stage").getAttribute("data-stage"), "dark", `${name}: 预览背景切换失败`);
  },

  "image-compress.html": async (name, ctx) => {
    const { doc, window } = ctx;
    const quality = doc.querySelector("#quality");
    quality.value = "55";
    quality.dispatchEvent(new window.Event("input", { bubbles: true }));
    eq(doc.querySelector("#qualityOut").textContent, "55%", `${name}: 质量读数未更新`);

    ok(doc.querySelector("#downloadBtn").disabled, `${name}: 未选择图片时下载按钮应禁用`);

    const input = doc.querySelector("#fileInput");
    const bad = new window.File(["not an image"], "notes.txt", { type: "text/plain" });
    Object.defineProperty(input, "files", { value: [bad], configurable: true });
    input.dispatchEvent(new window.Event("change", { bubbles: true }));
    await sleep(60);
    ok(doc.querySelector("#status").classList.contains("error"), `${name}: 非图片文件未报错`);

    const big = new window.File([new Uint8Array(10)], "huge.png", { type: "image/png" });
    Object.defineProperty(big, "size", { value: 61 * 1024 * 1024 });
    Object.defineProperty(input, "files", { value: [big], configurable: true });
    input.dispatchEvent(new window.Event("change", { bubbles: true }));
    await sleep(60);
    ok(doc.querySelector("#status").textContent.includes("60 MB"), `${name}: 超过体积上限未提示`);
  },

  "percentage-calculator.html": async (name, ctx) => {
    const { doc, window } = ctx;
    const set = (sel, value) => {
      const el = doc.querySelector(sel);
      el.value = String(value);
      el.dispatchEvent(new window.Event("input", { bubbles: true }));
    };
    const text = (sel) => doc.querySelector(sel).textContent;

    eq(text("#p1Out"), "30", `${name}: 200 的 15% 应为 30`);
    eq(text("#p2Out"), "75%", `${name}: 45 占 60 应为 75%`);
    eq(text("#p3Out"), "+25%", `${name}: 80 到 100 应为 +25%`);
    eq(text("#p3Label"), "增长", `${name}: 增长方向标签不正确`);
    eq(text("#p4Out"), "324", `${name}: 300 增加 8% 应为 324`);

    set("#p1Num", 0);
    set("#p1Pct", 12.5);
    eq(text("#p1Out"), "0", `${name}: 基数 0 结果应为 0`);

    set("#p2Part", 1);
    set("#p2Whole", 3);
    ok(text("#p2Out").startsWith("33.333"), `${name}: 1/3 占比保留精度不足 -> ${text("#p2Out")}`);

    set("#p2Whole", 0);
    eq(text("#p2Out"), "无法计算", `${name}: 总量为 0 应提示无法计算`);

    set("#p3From", 100);
    set("#p3To", 75);
    eq(text("#p3Out"), "-25%", `${name}: 下降变化率不正确`);
    eq(text("#p3Label"), "下降", `${name}: 下降方向标签不正确`);

    set("#p3From", 0);
    eq(text("#p3Out"), "无法计算", `${name}: 原值为 0 应提示无法计算`);

    doc.querySelector('[data-dir="dec"]').click();
    eq(doc.querySelector('[data-dir="dec"]').getAttribute("aria-pressed"), "true", `${name}: 减少按钮未激活`);
    eq(text("#p4Out"), "276", `${name}: 300 减少 8% 应为 276`);
    ok(text("#p4Formula").includes("−"), `${name}: 减少模式公式不正确`);

    set("#p4Pct", 150);
    eq(text("#p4Out"), "-150", `${name}: 减少 150% 应得到负值`);

    doc.querySelector('[data-dir="inc"]').click();
    eq(text("#p4Out"), "750", `${name}: 增加 150% 应为 750`);

    const empty = doc.querySelector("#p4Num");
    empty.value = "";
    empty.dispatchEvent(new window.Event("input", { bubbles: true }));
    eq(text("#p4Out"), "-", `${name}: 空输入应显示占位符`);
  },

  "unit-converter.html": async (name, ctx) => {
    const { doc, window } = ctx;
    const set = (sel, value, type) => {
      const el = doc.querySelector(sel);
      el.value = String(value);
      el.dispatchEvent(new window.Event(type || "input", { bubbles: true }));
    };
    const main = () => doc.querySelector("#resultMain").textContent;

    eq(main(), "0.001 千米 (km)", `${name}: 1 米应等于 0.001 千米`);
    eq(doc.querySelector("#toValue").value, "0.001", `${name}: 结果输入框数值不正确`);
    eq(doc.querySelectorAll("#unitBody tr").length, 9, `${name}: 长度换算表应有 9 项`);
    eq(doc.querySelectorAll("#unitBody tr.is-source").length, 1, `${name}: 应高亮来源单位`);

    set("#category", "mass", "change");
    eq(main(), "2 斤", `${name}: 1 千克应等于 2 斤`);

    set("#category", "temperature", "change");
    set("#fromValue", 100);
    eq(main(), "212 华氏度 (°F)", `${name}: 100°C 应为 212°F`);

    set("#fromValue", -300);
    ok(doc.querySelector("#status").classList.contains("error"), `${name}: 低于绝对零度未提示`);

    set("#fromValue", 100);
    eq(doc.querySelector("#status").textContent, "", `${name}: 恢复合法温度后错误提示未清除`);

    doc.querySelector("#swapBtn").click();
    eq(doc.querySelector("#fromUnit").value, "f", `${name}: 交换后原单位应为华氏度`);
    eq(doc.querySelector("#toUnit").value, "c", `${name}: 交换后目标单位应为摄氏度`);
    eq(doc.querySelector("#toValue").value, "100", `${name}: 交换后换算结果不正确`);

    set("#category", "data", "change");
    set("#fromValue", 1);
    eq(main(), "1,024 兆字节 (MB)", `${name}: 1 GB 应为 1024 MB`);

    set("#fromValue", 0);
    eq(doc.querySelector("#toValue").value, "0", `${name}: 0 的换算结果不正确`);

    set("#fromValue", "");
    eq(main(), "-", `${name}: 空输入应显示占位符`);
    eq(doc.querySelectorAll("#unitBody tr").length, 0, `${name}: 空输入时换算表应为空`);
  },

  "password-generator.html": async (name, ctx) => {
    const { doc, window } = ctx;
    const output = doc.querySelector("#passwords");
    const lines = () => output.value.split("\n");
    const setLen = (v) => {
      const el = doc.querySelector("#length");
      el.value = String(v);
      el.dispatchEvent(new window.Event("input", { bubbles: true }));
    };

    eq(lines().length, 5, `${name}: 默认应生成 5 条密码`);
    ok(lines().every((l) => l.length === 16), `${name}: 默认长度应为 16`);
    ok(/[a-z]/.test(output.value) && /[A-Z]/.test(output.value) && /[0-9]/.test(output.value), `${name}: 默认字符集未覆盖大小写与数字`);
    ok(/^[\x21-\x7e]+$/.test(output.value.replace(/\n/g, "")), `${name}: 生成了非 ASCII 可见字符`);

    setLen(32);
    eq(doc.querySelector("#lengthOut").textContent, "32", `${name}: 长度读数未更新`);
    doc.querySelector("#generateBtn").click();
    ok(lines().every((l) => l.length === 32), `${name}: 调整长度后未生效`);

    // 关闭全部字符集
    ["lower", "upper", "digits", "symbols"].forEach((id) => {
      const box = doc.querySelector("#" + id);
      box.checked = false;
      box.dispatchEvent(new window.Event("change", { bubbles: true }));
    });
    doc.querySelector("#generateBtn").click();
    eq(output.value, "", `${name}: 未选字符集时不应生成密码`);
    ok(doc.querySelector("#status").classList.contains("error"), `${name}: 未选字符集未提示`);

    // 仅小写 + 排除易混淆 + 每类至少一个
    const lower = doc.querySelector("#lower");
    lower.checked = true;
    lower.dispatchEvent(new window.Event("change", { bubbles: true }));
    doc.querySelector("#noAmbiguous").checked = true;
    doc.querySelector("#noAmbiguous").dispatchEvent(new window.Event("change", { bubbles: true }));
    setLen(10);
    doc.querySelector("#generateBtn").click();
    ok(/^[a-km-np-z]+$/.test(output.value.replace(/\n/g, "")), `${name}: 排除易混淆字符未生效 -> ${output.value}`);
    ok(doc.querySelector("#strengthMeta").textContent.includes("24 个字符"), `${name}: 排除后字符集数量不正确 -> ${doc.querySelector("#strengthMeta").textContent}`);

    doc.querySelector("#digits").checked = true;
    doc.querySelector("#generateBtn").click();
    ok(lines().every((l) => /[0-9]/.test(l) && /[a-z]/.test(l)), `${name}: 数字优先规则未生效`);

    const count = doc.querySelector("#count");
    count.value = "99";
    count.dispatchEvent(new window.Event("change", { bubbles: true }));
    eq(count.value, "20", `${name}: 生成条数未限制为 20`);

    doc.querySelector("#clearBtn").click();
    eq(output.value, "", `${name}: 清空未生效`);
  },

  "image-base64.html": async (name, ctx) => {
    const { doc, window } = ctx;
    const input = doc.querySelector("#fileInput");
    const out = doc.querySelector("#dataOut");
    const png = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
    const file = new window.File([png], "dot.png", { type: "image/png" });
    Object.defineProperty(input, "files", { value: [file], configurable: true });
    input.dispatchEvent(new window.Event("change", { bubbles: true }));
    await sleep(150);

    eq(out.value, "data:image/png;base64,iVBORw0KGgo=", `${name}: 文件转 Data URL 不正确`);
    ok(doc.querySelector("#previewWrap img"), `${name}: 未显示图片预览`);
    eq(doc.querySelector("#metaSize").textContent, "8 B", `${name}: 原始大小不正确`);
    ok(!doc.querySelector("#copyBtn").disabled, `${name}: 转换后复制按钮应可用`);

    const raw = doc.querySelector("#rawOnly");
    raw.checked = true;
    raw.dispatchEvent(new window.Event("change", { bubbles: true }));
    eq(out.value, "iVBORw0KGgo=", `${name}: 纯 Base64 输出不正确`);

    const onePixel = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
    const area = doc.querySelector("#b64In");
    area.value = "data:image/png;base64," + onePixel;
    doc.querySelector("#parseBtn").click();
    eq(doc.querySelector("#outMime").textContent, "image/png", `${name}: 解析 MIME 不正确`);
    ok(!doc.querySelector("#downloadImg").disabled, `${name}: 解析成功后下载按钮应可用`);
    ok(doc.querySelector("#outWrap img").getAttribute("src").startsWith("data:image/png;base64,"), `${name}: 还原预览失败`);
    ok(doc.querySelector("#parseStatus").textContent.includes("字节"), `${name}: 未显示解析字节数`);

    area.value = "iVBORw0KGgo=";
    doc.querySelector("#parseBtn").click();
    eq(doc.querySelector("#outMime").textContent, "image/png", `${name}: 无前缀时未按魔数识别类型`);

    area.value = "!!!!";
    doc.querySelector("#parseBtn").click();
    ok(doc.querySelector("#parseStatus").classList.contains("error"), `${name}: 非法 Base64 未报错`);

    doc.querySelector("#clearBtn").click();
    ok(doc.querySelector("#downloadImg").disabled, `${name}: 清空后下载按钮应禁用`);
    eq(area.value, "", `${name}: 清空未生效`);
  },

  "base-converter.html": async (name, ctx) => {
    const { doc, window } = ctx;
    const num = doc.querySelector("#numInput");
    const from = doc.querySelector("#fromBase");
    const to = doc.querySelector("#toBase");
    const result = doc.querySelector("#result");
    const setSel = (el, v) => { el.value = v; el.dispatchEvent(new window.Event("change", { bubbles: true })); };
    num.value = "255";
    num.dispatchEvent(new window.Event("input", { bubbles: true }));
    eq(result.value, "ff", `${name}: 255 dec->hex`);
    setSel(to, "2");
    eq(result.value, "11111111", `${name}: 255 dec->bin`);
    setSel(from, "2"); setSel(to, "10");
    num.value = "11111111";
    num.dispatchEvent(new window.Event("input", { bubbles: true }));
    eq(result.value, "255", `${name}: bin->dec`);
    setSel(from, "16"); setSel(to, "10");
    num.value = "ff";
    num.dispatchEvent(new window.Event("input", { bubbles: true }));
    eq(result.value, "255", `${name}: hex->dec`);
    setSel(from, "36"); setSel(to, "10");
    num.value = "z";
    num.dispatchEvent(new window.Event("input", { bubbles: true }));
    eq(result.value, "35", `${name}: base36->dec`);
    setSel(from, "2"); setSel(to, "10");
    num.value = "2";
    num.dispatchEvent(new window.Event("input", { bubbles: true }));
    ok(doc.querySelector("#status").classList.contains("error"), `${name}: 非法字符未提示`);
    setSel(from, "10"); setSel(to, "16");
    doc.querySelector("#upper").checked = true;
    doc.querySelector("#upper").dispatchEvent(new window.Event("change", { bubbles: true }));
    num.value = "255";
    num.dispatchEvent(new window.Event("input", { bubbles: true }));
    eq(result.value, "FF", `${name}: 大写输出`);
  },

  "roman-numeral.html": async (name, ctx) => {
    const { doc, window } = ctx;
    const input = doc.querySelector("#valueIn");
    const output = doc.querySelector("#valueOut");
    const setDir = (v) => { const el = doc.querySelector('input[name="dir"][value="' + v + '"]'); el.checked = true; el.dispatchEvent(new window.Event("change", { bubbles: true })); };
    input.value = "1984";
    input.dispatchEvent(new window.Event("input", { bubbles: true }));
    eq(output.value, "MCMLXXXIV", `${name}: 1984->roman`);
    setDir("toArabic");
    input.value = "MCMLXXXIV";
    input.dispatchEvent(new window.Event("input", { bubbles: true }));
    eq(output.value, "1984", `${name}: roman->1984`);
    input.value = "MCQ";
    input.dispatchEvent(new window.Event("input", { bubbles: true }));
    ok(doc.querySelector("#status").classList.contains("error"), `${name}: 非法字符未提示`);
    setDir("toRoman");
    input.value = "4000";
    input.dispatchEvent(new window.Event("input", { bubbles: true }));
    ok(doc.querySelector("#status").classList.contains("error"), `${name}: 超出范围未提示`);
    input.value = "";
    input.dispatchEvent(new window.Event("input", { bubbles: true }));
    eq(output.value, "", `${name}: 清空`);
    setDir("toArabic");
    input.value = "IX";
    input.dispatchEvent(new window.Event("input", { bubbles: true }));
    eq(output.value, "9", `${name}: IX->9`);
  },

  "csv-json.html": async (name, ctx) => {
    const { doc, window } = ctx;
    const source = doc.querySelector("#source");
    const output = doc.querySelector("#output");
    const setDir = (v) => { const el = doc.querySelector('input[name="dir"][value="' + v + '"]'); el.checked = true; el.dispatchEvent(new window.Event("change", { bubbles: true })); };
    source.value = "name,age\nAlice,30\nBob,25";
    source.dispatchEvent(new window.Event("input", { bubbles: true }));
    let arr = JSON.parse(output.value);
    eq(JSON.stringify(arr), JSON.stringify([{ name: "Alice", age: "30" }, { name: "Bob", age: "25" }]), `${name}: csv->json`);
    source.value = 'name,note\nAlice,"hello, world"';
    source.dispatchEvent(new window.Event("input", { bubbles: true }));
    arr = JSON.parse(output.value);
    eq(arr[0].note, "hello, world", `${name}: 带逗号引号字段`);
    setDir("toCsv");
    source.value = JSON.stringify([{ a: "1", b: "2" }, { a: "3", b: "4" }]);
    source.dispatchEvent(new window.Event("input", { bubbles: true }));
    eq(output.value, "a,b\n1,2\n3,4", `${name}: json->csv`);
    source.value = "{not json";
    source.dispatchEvent(new window.Event("input", { bubbles: true }));
    ok(doc.querySelector("#status").classList.contains("error"), `${name}: 非法 JSON 未提示`);
  },

  "lorem-ipsum.html": async (name, ctx) => {
    const { doc, window } = ctx;
    const count = doc.querySelector("#count");
    const words = doc.querySelector("#words");
    const output = doc.querySelector("#output");
    const setN = (el, v) => { el.value = String(v); el.dispatchEvent(new window.Event("input", { bubbles: true })); };
    setN(count, 3); setN(words, 20);
    const paras = output.value.split("\n\n").filter(Boolean);
    eq(paras.length, 3, `${name}: 段落数`);
    const total = output.value.trim().split(/\s+/).filter(Boolean).length;
    eq(total, 60, `${name}: 总词数`);
    ok(output.value.startsWith("Lorem ipsum dolor sit amet"), `${name}: 经典开头`);
    setN(count, 2); setN(words, 10);
    eq(output.value.split("\n\n").filter(Boolean).length, 2, `${name}: 2 段`);
  },

  "emoji-picker.html": async (name, ctx) => {
    const { doc, window } = ctx;
    const grid = doc.querySelector("#grid");
    ok(grid.querySelectorAll("button").length > 0, `${name}: 初始有表情`);
    const first = grid.querySelector("button");
    const ch = first.getAttribute("data-ch");
    first.click();
    eq(doc.querySelector("#selected").value, ch, `${name}: 点击选中`);
    const search = doc.querySelector("#emojiSearch");
    search.value = "zzz";
    search.dispatchEvent(new window.Event("input", { bubbles: true }));
    eq(grid.querySelectorAll("button").length, 0, `${name}: 无匹配`);
    search.value = "";
    search.dispatchEvent(new window.Event("input", { bubbles: true }));
    ok(grid.querySelectorAll("button").length > 0, `${name}: 清空后恢复`);
    const catBtn = doc.querySelector('[data-cat="animal"]');
    catBtn.click();
    const allAnimal = Array.from(grid.querySelectorAll("button")).every((b) => b.getAttribute("data-cat") === "animal");
    ok(allAnimal, `${name}: 分类筛选`);
  },

  "math-calc.html": async (name, ctx) => {
    const { doc, window } = ctx;
    const expr = doc.querySelector("#expr");
    const result = doc.querySelector("#result");
    const setE = (v) => { expr.value = v; expr.dispatchEvent(new window.Event("input", { bubbles: true })); };
    setE("2+3*4"); eq(result.value, "14", `${name}: 优先级`);
    setE("(2+3)*4"); eq(result.value, "20", `${name}: 括号`);
    setE("2^10"); eq(result.value, "1024", `${name}: 幂`);
    setE("sqrt(16)"); eq(result.value, "4", `${name}: sqrt`);
    setE("max(1,2,3)"); eq(result.value, "3", `${name}: max`);
    setE("10%3"); eq(result.value, "1", `${name}: 取模`);
    setE("pi"); ok(Math.abs(parseFloat(result.value) - Math.PI) < 1e-9, `${name}: pi`);
    setE("2+"); ok(doc.querySelector("#status").classList.contains("error"), `${name}: 不完整未提示`);
    setE("1/0"); ok(doc.querySelector("#status").classList.contains("error"), `${name}: 除以零未提示`);
    setE("2*(3+4)"); eq(result.value, "14", `${name}: 嵌套`);
    setE("-5+8"); eq(result.value, "3", `${name}: 一元负号`);
  }
};

const files = fs.readdirSync(TOOLS).filter((f) => f.endsWith(".html"));
const needsCrypto = new Set(["hash.html", "jwt-decoder.html", "uuid.html"]);
for (const file of files) {
  const name = file;
  const ctx = await load(path.join(TOOLS, file), { crypto: needsCrypto.has(file) });
  try {
    checkCommon(name, ctx);
    if (tests[file]) await tests[file](name, ctx);
  } catch (e) {
    failures.push(`${name}: 测试异常 ${e && e.stack ? e.stack.split("\n")[0] : e}`);
  } finally {
    ctx.dom.window.close();
  }
}

// 首页测试：卡片数量、搜索、分类筛选、本地资源链接
{
  const ctx = await load(path.join(ROOT, "index.html"), { resources: true });
  const { doc, window } = ctx;
  const cards = Array.from(doc.querySelectorAll(".card"));
  eq(cards.length, files.length, "index: 卡片数量与工具数量不一致");
  eq(doc.documentElement.lang, "zh-CN", "index: lang");
  ok(doc.body.textContent.includes(String(files.length)), "index: 页面未显示工具总数");
  eq(ctx.errors.length, 0, "index: 页面脚本报错 -> " + ctx.errors.join(" | "));

  const search = doc.querySelector("#toolSearch");
  search.value = "json";
  search.dispatchEvent(new window.Event("input", { bubbles: true }));
  const visible = cards.filter((c) => !c.classList.contains("is-hidden"));
  ok(visible.length >= 1, "index: 搜索 json 无结果");
  ok(visible.every((c) => /json/i.test(c.getAttribute("data-search"))), "index: 搜索命中了不相关卡片");

  search.value = "zzzz-not-exist";
  search.dispatchEvent(new window.Event("input", { bubbles: true }));
  ok(doc.querySelector("#emptyState").classList.contains("is-visible"), "index: 无结果时未显示空状态");

  search.value = "";
  search.dispatchEvent(new window.Event("input", { bubbles: true }));
  doc.querySelector('[data-cat="dev"]').click();
  const devVisible = cards.filter((c) => !c.classList.contains("is-hidden"));
  ok(devVisible.length > 0 && devVisible.every((c) => c.getAttribute("data-cat") === "dev"), "index: 分类筛选不正确");

  ctx.dom.window.close();
}

// 404 页面：路径前缀与资源自包含
{
  const html = fs.readFileSync(path.join(ROOT, "404.html"), "utf8");
  ok(html.includes('<base href="/Pure-HTML-Tools-Collection/">'), "404: 未注入部署前缀 base");
  ok(!/<link[^>]+rel="stylesheet"/i.test(html), "404: 不应外链样式表");
  ok(/\.nf/.test(html), "404: 缺少页面样式");
}

// 本地链接检查
{
  const pages = [path.join(ROOT, "index.html"), path.join(ROOT, "404.html"), ...files.map((f) => path.join(TOOLS, f))];
  for (const page of pages) {
    const html = fs.readFileSync(page, "utf8");
    const base = path.dirname(page);
    const attrRe = /(?:href|src)="([^"]+)"/g;
    let m;
    while ((m = attrRe.exec(html)) !== null) {
      const raw = m[1];
      if (/^(https?:|mailto:|tel:|data:|#|\/)/.test(raw)) continue;
      const target = decodeURIComponent(raw.split("#")[0].split("?")[0]);
      if (!target) continue;
      const abs = path.resolve(base, target);
      if (!fs.existsSync(abs)) failures.push(`链接检查: ${path.relative(ROOT, page)} -> ${raw} 不存在`);
    }
  }
}

if (failures.length) {
  console.error(`\n失败 ${failures.length} 项，通过 ${passed} 项：`);
  for (const f of failures) console.error(" - " + f);
  process.exit(1);
}
console.log(`全部通过：${passed} 项断言，覆盖 ${files.length} 个工具`);
