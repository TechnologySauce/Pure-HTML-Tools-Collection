// 对每个工具页中提取的内联 <script>（工具逻辑）做语法解析校验，捕获 SyntaxError。
// 仅解析不执行，因此 PHT 等运行时全局缺失不会误报。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dir = path.join(root, "tools");
const files = fs.readdirSync(dir).filter(f => f.endsWith(".html"));
let errors = 0;
for (const f of files) {
  const html = fs.readFileSync(path.join(dir, f), "utf8");
  // 提取最后一个 <script>...</script>（工具逻辑脚本，无 src、无 data-inline）
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  const code = scripts[scripts.length - 1];
  if (!code || !code.trim()) continue;
  try {
    new Function(code);
  } catch (e) {
    errors++;
    console.error(`语法错误 ${f}: ${e.message}`);
  }
}
console.log(`校验 ${files.length} 个工具页，语法错误: ${errors}`);
process.exit(errors ? 1 : 0);
