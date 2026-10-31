// 校验 gen-tools.mjs 中"新增"的工具文件名是否：
//  1) 与磁盘上已有的任意工具（existing-tools.txt，含 git HEAD 时不在 gen-tools 的遗留文件）冲突；
//  2) 在新增工具内部重复。
// 原有工具定义（出现在 baseline 中）属于正常情况，不报错。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const src = fs.readFileSync(path.join(root, "scripts", "gen-tools.mjs"), "utf8");

const baseline = new Set(
  fs.readFileSync(path.join(root, "baseline-files.txt"), "utf8").split("\n").map(s => s.trim()).filter(Boolean)
);
const disk = new Set(
  fs.readFileSync(path.join(root, "existing-tools.txt"), "utf8").split("\n").map(s => s.trim()).filter(Boolean)
);

const all = [];
for (const x of src.matchAll(/file:\s*"([^"]+\.html)"/g)) all.push(x[1]);

const seen = new Set();
let problems = 0;
all.forEach((f, i) => {
  if (baseline.has(f)) return;            // 原有工具，跳过
  if (disk.has(f)) { console.error("冲突(已存在于磁盘):", f); problems++; }
  if (seen.has(f)) { console.error("内部重复:", f, "首次出现行", i); problems++; }
  seen.add(f);
});
console.log(`定义总数: ${all.length}, 新增(基线外): ${seen.size}, 问题: ${problems}`);
process.exit(problems ? 1 : 0);
