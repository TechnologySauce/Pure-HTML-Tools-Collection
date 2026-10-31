// 修复 4 个既有工具：其 script 字符串中的 \n / \r 在生成时被写成真实换行符，
// 导致 HTML 内 <script> 字符串跨行而语法错误。将源中的 \n / \r 改为 \\n / \\r，
// 使生成的 HTML 含合法转义。仅作用于指定的 4 个工具行。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const file = path.join(root, "scripts", "gen-tools.mjs");
let s = fs.readFileSync(file, "utf8");
const targets = ["dev-csv-to-json.html", "dev-jwt-decode.html", "dev-jwt-validate.html", "dev-regex-tester.html"];
const lines = s.split("\n").map((line) => {
  if (targets.some((t) => line.includes('file: "' + t + '"'))) {
    line = line.replace(/\\n/g, "\\\\n").replace(/\\r/g, "\\\\r");
  }
  return line;
});
fs.writeFileSync(file, lines.join("\n"));
console.log("已修复 4 个既有工具的转义问题。");
