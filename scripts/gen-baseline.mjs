// 从 git HEAD 的原始 gen-tools.mjs 提取工具文件名，写入 baseline-files.txt 作为基线。
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const out = execSync("git show HEAD:scripts/gen-tools.mjs", { cwd: root, encoding: "utf8" });
const m = out.matchAll(/file:\s*"([^"]+\.html)"/g);
const set = new Set();
for (const x of m) set.add(x[1]);
fs.writeFileSync(path.join(root, "baseline-files.txt"), [...set].sort().join("\n"));
console.log("baseline count:", set.size);
