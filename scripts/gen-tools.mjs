// 工具生成器：用统一的 chrome 模板批量产出新的纯 HTML 工具文件。
// 仅用于本地脚手架，不参与部署。运行：node scripts/gen-tools.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const toolsDir = join(__dirname, "..", "tools");

const CAT_LABEL = { text: "文本处理", dev: "开发者", design: "设计", util: "小工具", calc: "计算", image: "图片" };

const SUN = '<svg class="i-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"></path></svg>';
const MOON = '<svg class="i-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z"></path></svg>';

function page(meta, body, script, style) {
  const catLabel = CAT_LABEL[meta.category] || "工具";
  const metaJSON = JSON.stringify(meta);
  return `<!DOCTYPE html>
<html lang="zh-CN" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${meta.title} - 纯 HTML 工具箱</title>
<meta name="description" content="${meta.desc}">
<meta name="theme-color" content="#f6f5f1">
<link rel="icon" href="../assets/favicon.svg" type="image/svg+xml">
<script type="application/json" id="tool-meta">${metaJSON}</script>
<script>try{var t=localStorage.getItem("pht-theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.setAttribute("data-theme",t)}catch(e){document.documentElement.setAttribute("data-theme","light")}</script>
<style data-inline="assets/tool-base.css"></style>
<style>${style || ""}</style>
</head>
<body>
<header class="toolbar">
  <div class="toolbar-inner">
    <a class="brand" href="../index.html"><img src="../assets/favicon.svg" alt="" width="24" height="24"><span>纯 HTML 工具箱</span></a>
    <span class="spacer"></span>
    <a class="btn ghost" href="../index.html">返回首页</a>
    <button class="icon-btn" type="button" data-theme-toggle aria-label="切换深色主题" aria-pressed="false">${SUN}${MOON}</button>
  </div>
</header>

<main class="shell">
  <div class="page-head">
    <span class="badge">${catLabel} · 本地处理</span>
    <h1>${meta.title}</h1>
    <p>${meta.desc}</p>
  </div>

  <section class="panel">
${body}
  </section>

  <footer class="foot">
    <span>所有处理都在浏览器本地完成，数据不会上传。</span>
    <a href="../index.html">返回全部工具</a>
  </footer>
</main>

<script data-inline="assets/tool-base.js"></script>
<script>
${script}
</script>
</body>
</html>`;
}

const TOOLS = [];

// ---------- 文本处理 ----------
TOOLS.push({
  file: "text-replace.html",
  meta: { title: "查找替换", desc: "在文本中按字面或正则查找并替换，支持全局与忽略大小写，结果可复制。", category: "text", tags: ["查找", "替换", "正则", "文本"], order: 12 },
  body: `<div class="field">
  <label for="find">查找</label>
  <input type="text" id="find" class="code" placeholder="要查找的内容（可为正则）" autocomplete="off">
</div>
<div class="field" style="margin-top:10px">
  <label for="repl">替换为</label>
  <input type="text" id="repl" class="code" placeholder="替换内容（可留空表示删除）" autocomplete="off">
</div>
<div class="row" style="gap:14px;align-items:center;flex-wrap:wrap;margin-top:10px">
  <label class="chk"><input type="checkbox" id="useRe"> 正则模式</label>
  <label class="chk"><input type="checkbox" id="global" checked> 全局</label>
  <label class="chk"><input type="checkbox" id="ignoreCase" checked> 忽略大小写</label>
</div>
<div class="field" style="margin-top:12px"><label for="input">输入文本</label><textarea id="input" class="code" spellcheck="false" placeholder="在此粘贴文本…"></textarea></div>
<div class="field" style="margin-top:12px"><label for="output">结果</label><textarea id="output" class="code" readonly placeholder="替换结果…"></textarea></div>
<div class="actions">
  <button class="btn primary" id="run" type="button">替换</button>
  <button class="btn" id="copy" type="button">复制结果</button>
  <button class="btn ghost danger" id="clear" type="button">清空</button>
</div>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var find=$("#find"), repl=$("#repl"), useRe=$("#useRe"), global=$("#global"), ignoreCase=$("#ignoreCase"), input=$("#input"), output=$("#output"), statusEl=$("#status");
  function run(){
    var text=input.value, f=find.value;
    if(!text){ output.value=""; PHT.status(statusEl,""); return; }
    if(!f){ output.value=text; PHT.status(statusEl,""); return; }
    try{
      var flags=(global.checked?"g":"")+(ignoreCase.checked?"i":"");
      var re;
      if(useRe.checked){ re=new RegExp(f, flags); }
      else { var lit=f.replace(/[\\^$.*+?()|\[\]{}]/g,"\\$&"); re=new RegExp(lit,flags); }
      output.value=text.replace(re, repl.value);
      PHT.status(statusEl,"已替换","ok");
    }catch(e){ PHT.status(statusEl,"表达式错误："+e.message,"error"); }
  }
  [find,repl,input,useRe,global,ignoreCase].forEach(function(el){ el.addEventListener("input",run); el.addEventListener("change",run); });
  $("#run").addEventListener("click",run);
  $("#copy").addEventListener("click",function(){ if(!output.value){PHT.status(statusEl,"没有可复制内容","error");return;} PHT.copy(output.value).then(function(ok){PHT.flash($("#copy"),"已复制");PHT.status(statusEl,ok?"已复制":"复制失败",ok?"ok":"error");}); });
  $("#clear").addEventListener("click",function(){ input.value=""; output.value=""; find.value=""; repl.value=""; PHT.status(statusEl,""); input.focus(); });
  run();
})();`
});

TOOLS.push({
  file: "text-trim.html",
  meta: { title: "空白整理", desc: "按行清理文本：去除首尾空格、删除空行、合并连续空行或压缩多余空格。", category: "text", tags: ["空白", "空行", "整理", "文本"], order: 13 },
  body: `<div class="row" style="gap:14px;flex-wrap:wrap;align-items:center">
  <label class="chk"><input type="checkbox" id="trimLines" checked> 每行首尾去空格</label>
  <label class="chk"><input type="checkbox" id="dropEmpty" checked> 删除空行</label>
  <label class="chk"><input type="checkbox" id="collapse"> 合并连续空行为一</label>
  <label class="chk"><input type="checkbox" id="collapseSpaces"> 压缩多余空格</label>
</div>
<div class="field" style="margin-top:12px"><label for="input">输入文本</label><textarea id="input" class="code" spellcheck="false" placeholder="在此粘贴文本…"></textarea></div>
<div class="field" style="margin-top:12px"><label for="output">结果（行数 <span id="lines">0</span>）</label><textarea id="output" class="code" readonly placeholder="整理结果…"></textarea></div>
<div class="actions">
  <button class="btn primary" id="run" type="button">整理</button>
  <button class="btn" id="copy" type="button">复制结果</button>
  <button class="btn ghost danger" id="clear" type="button">清空</button>
</div>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var input=$("#input"), output=$("#output"), linesEl=$("#lines"), statusEl=$("#status");
  var opts={trimLines:$("#trimLines"),dropEmpty:$("#dropEmpty"),collapse:$("#collapse"),collapseSpaces:$("#collapseSpaces")};
  function run(){
    var text=input.value;
    var out=text.split(/\\r?\\n/).map(function(l){ return opts.trimLines.checked?l.trim():l; });
    if(opts.collapseSpaces.checked){ out=out.map(function(l){ return l.replace(/[ \\t]+/g," "); }); }
    if(opts.dropEmpty.checked){ out=out.filter(function(l){ return l.length>0; }); }
    else if(opts.collapse.checked){ var res=[],prevEmpty=false; out.forEach(function(l){ var empty=l.length===0; if(empty&&prevEmpty) return; res.push(l); prevEmpty=empty; }); out=res; }
    output.value=out.join("\\n");
    linesEl.textContent=String(out.length);
    PHT.status(statusEl,"已整理","ok");
  }
  Object.keys(opts).forEach(function(k){ opts[k].addEventListener("change",run); });
  input.addEventListener("input",run);
  $("#run").addEventListener("click",run);
  $("#copy").addEventListener("click",function(){ if(!output.value){PHT.status(statusEl,"没有可复制内容","error");return;} PHT.copy(output.value).then(function(ok){PHT.flash($("#copy"),"已复制");PHT.status(statusEl,ok?"已复制":"复制失败",ok?"ok":"error");}); });
  $("#clear").addEventListener("click",function(){ input.value=""; output.value=""; PHT.status(statusEl,""); input.focus(); });
  run();
})();`
});

TOOLS.push({
  file: "text-reverse.html",
  meta: { title: "文本反转", desc: "按字符、单词或行反向排列文本，常用于调试与趣味玩法。", category: "text", tags: ["反转", "字符", "单词", "行"], order: 14 },
  body: `<div class="segmented" id="mode" role="group" aria-label="模式">
  <label><input type="radio" name="rmode" value="chars" checked><span>反转字符</span></label>
  <label><input type="radio" name="rmode" value="words"><span>反转单词</span></label>
  <label><input type="radio" name="rmode" value="lines"><span>反转行</span></label>
</div>
<div class="field" style="margin-top:12px"><label for="input">输入文本</label><textarea id="input" class="code" spellcheck="false" placeholder="在此粘贴文本…"></textarea></div>
<div class="field" style="margin-top:12px"><label for="output">结果</label><textarea id="output" class="code" readonly placeholder="反转结果…"></textarea></div>
<div class="actions">
  <button class="btn primary" id="copy" type="button">复制结果</button>
  <button class="btn ghost danger" id="clear" type="button">清空</button>
</div>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var input=$("#input"), output=$("#output"), mode=$("#mode"), statusEl=$("#status");
  function run(){
    var text=input.value; if(!text){ output.value=""; PHT.status(statusEl,""); return; }
    var m=mode.querySelector("input:checked").value, res;
    if(m==="chars"){ res=text.split("").reverse().join(""); }
    else if(m==="words"){ res=text.split(/\\s+/).reverse().join(" "); }
    else { res=text.split(/\\r?\\n/).reverse().join("\\n"); }
    output.value=res;
    PHT.status(statusEl,"已反转","ok");
  }
  mode.addEventListener("change",run);
  input.addEventListener("input",run);
  $("#copy").addEventListener("click",function(){ if(!output.value){PHT.status(statusEl,"没有可复制内容","error");return;} PHT.copy(output.value).then(function(ok){PHT.flash($("#copy"),"已复制");PHT.status(statusEl,ok?"已复制":"复制失败",ok?"ok":"error");}); });
  $("#clear").addEventListener("click",function(){ input.value=""; output.value=""; PHT.status(statusEl,""); input.focus(); });
  run();
})();`
});

TOOLS.push({
  file: "text-title-case.html",
  meta: { title: "标题大小写", desc: "将文本转为标题大小写（首字母大写），可跳过常见虚词并保留已有大写。", category: "text", tags: ["title", "大小写", "标题", "命名"], order: 15 },
  body: `<div class="row" style="gap:14px;flex-wrap:wrap;align-items:center">
  <label class="chk"><input type="checkbox" id="skipSmall" checked> 忽略常见虚词（a/an/the…）</label>
  <label class="chk"><input type="checkbox" id="keepUpper" checked> 保留已有大写</label>
</div>
<div class="field" style="margin-top:12px"><label for="input">输入文本</label><input type="text" id="input" class="code" placeholder="例如 the quick brown fox" autocomplete="off"></div>
<div class="field" style="margin-top:12px"><label for="output">结果</label><input type="text" id="output" class="code" readonly></div>
<div class="actions">
  <button class="btn primary" id="copy" type="button">复制结果</button>
  <button class="btn ghost danger" id="clear" type="button">清空</button>
</div>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var input=$("#input"), output=$("#output"), skipSmall=$("#skipSmall"), keepUpper=$("#keepUpper"), statusEl=$("#status");
  var SMALL=["a","an","the","and","or","but","for","nor","on","in","at","to","by","of","with","as"];
  function cap(w){ if(keepUpper.checked && /[A-Z]/.test(w)) return w; return w.charAt(0).toUpperCase()+w.slice(1); }
  function run(){
    var text=input.value; if(!text){ output.value=""; PHT.status(statusEl,""); return; }
    var words=text.split(/(\\s+)/);
    var first=true, res=words.map(function(w){
      if(/^\\s+$/.test(w)||w==="") return w;
      if(skipSmall.checked && !first && SMALL.indexOf(w.toLowerCase())>=0) return w.toLowerCase();
      first=false; return cap(w);
    });
    output.value=res.join("");
    PHT.status(statusEl,"已转换","ok");
  }
  [input,skipSmall,keepUpper].forEach(function(el){ el.addEventListener("input",run); el.addEventListener("change",run); });
  $("#copy").addEventListener("click",function(){ if(!output.value){PHT.status(statusEl,"没有可复制内容","error");return;} PHT.copy(output.value).then(function(ok){PHT.flash($("#copy"),"已复制");PHT.status(statusEl,ok?"已复制":"复制失败",ok?"ok":"error");}); });
  $("#clear").addEventListener("click",function(){ input.value=""; output.value=""; PHT.status(statusEl,""); input.focus(); });
  run();
})();`
});

TOOLS.push({
  file: "text-tts.html",
  meta: { title: "文本转语音", desc: "调用浏览器内置语音合成朗读文本，可调语速与音调、选择语音，全程本地。", category: "text", tags: ["tts", "语音", "朗读", "speech"], order: 16 },
  body: `<div class="field"><label for="input">要朗读的文本</label><textarea id="input" class="code" spellcheck="false" placeholder="输入要朗读的中文或英文…"></textarea></div>
<div class="row" style="gap:14px;flex-wrap:wrap;align-items:flex-end;margin-top:12px">
  <div class="field" style="max-width:280px"><label for="voice">语音</label><select id="voice"></select></div>
  <div class="field" style="max-width:160px"><label for="rate">语速 <span id="rateV">1</span></label><input type="range" id="rate" min="0.5" max="2" step="0.1" value="1"></div>
  <div class="field" style="max-width:160px"><label for="pitch">音调 <span id="pitchV">1</span></label><input type="range" id="pitch" min="0" max="2" step="0.1" value="1"></div>
</div>
<div class="actions" style="margin-top:12px">
  <button class="btn primary" id="play" type="button">朗读</button>
  <button class="btn" id="stop" type="button">停止</button>
</div>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var input=$("#input"), voice=$("#voice"), rate=$("#rate"), pitch=$("#pitch"), rateV=$("#rateV"), pitchV=$("#pitchV"), statusEl=$("#status");
  var synth=null, voices=[];
  if("speechSynthesis" in window){ synth=window.speechSynthesis; }
  function populate(){
    if(!synth) return;
    voices=synth.getVoices(); voice.innerHTML="";
    voices.forEach(function(v,i){ var o=document.createElement("option"); o.value=String(i); o.textContent=v.name+" ("+v.lang+")"; voice.appendChild(o); });
  }
  if(synth){ populate(); if(typeof synth.onvoiceschanged!=="undefined"){ synth.onvoiceschanged=populate; } }
  else { voice.innerHTML="<option>当前环境不支持语音合成</option>"; voice.disabled=true; }
  rate.addEventListener("input",function(){ rateV.textContent=rate.value; });
  pitch.addEventListener("input",function(){ pitchV.textContent=pitch.value; });
  $("#play").addEventListener("click",function(){
    if(!synth){ PHT.status(statusEl,"当前环境不支持语音合成","error"); return; }
    var txt=input.value.trim(); if(!txt){ PHT.status(statusEl,"请输入要朗读的文本","error"); return; }
    synth.cancel();
    var u=new SpeechSynthesisUtterance(txt);
    if(voices[+voice.value]) u.voice=voices[+voice.value];
    u.rate=parseFloat(rate.value); u.pitch=parseFloat(pitch.value);
    u.onend=function(){ PHT.status(statusEl,"朗读结束","ok"); };
    synth.speak(u);
    PHT.status(statusEl,"正在朗读…","ok");
  });
  $("#stop").addEventListener("click",function(){ if(synth) synth.cancel(); PHT.status(statusEl,"已停止"); });
})();`
});

TOOLS.push({
  file: "unicode-inspector.html",
  meta: { title: "Unicode 查看器", desc: "逐字符显示码点（U+XXXX）、UTF-16 与 JavaScript 转义，排查乱码与不可见字符。", category: "text", tags: ["unicode", "码点", "utf16", "乱码"], order: 17 },
  body: `<div class="field"><label for="input">输入文本</label><input type="text" id="input" class="code" placeholder="例如 A中★" autocomplete="off"></div>
<div class="field" style="margin-top:12px"><label for="output">字符明细（字符 / 码点 / 转义）</label><textarea id="output" class="code" readonly placeholder="每个字符的码点、UTF-16 与转义…"></textarea></div>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var input=$("#input"), output=$("#output"), statusEl=$("#status");
  function hex(n){ return "U+"+("0000"+n.toString(16).toUpperCase()).slice(-4); }
  function esc(cp){
    if(cp<=0xFFFF){ return "\\\\u"+("0000"+cp.toString(16).toUpperCase()).slice(-4); }
    var hi=Math.floor((cp-0x10000)/0x400)+0xD800, lo=(cp-0x10000)%0x400+0xDC00;
    return "\\\\u"+("0000"+hi.toString(16).toUpperCase()).slice(-4)+"\\\\u"+("0000"+lo.toString(16).toUpperCase()).slice(-4);
  }
  function run(){
    var text=input.value; if(!text){ output.value=""; PHT.status(statusEl,""); return; }
    var lines=[];
    for(var i=0;i<text.length;i++){
      var cp=text.codePointAt(i), ch=text[i];
      if(cp>0xFFFF){ ch=text.substr(i,2); }
      lines.push(ch+"  "+hex(cp)+"  "+esc(cp));
      if(cp>0xFFFF) i++;
    }
    output.value=lines.join("\\n");
    PHT.status(statusEl,"共 "+lines.length+" 个字符","ok");
  }
  input.addEventListener("input",run);
  run();
})();`
});

TOOLS.push({
  file: "morse-code.html",
  meta: { title: "摩斯电码", desc: "在文本与摩斯电码之间互转，支持字母、数字与单词分隔，离线可用。", category: "text", tags: ["morse", "摩斯", "编码", "电报"], order: 18 },
  body: `<div class="segmented" id="mode" role="group" aria-label="模式">
  <label><input type="radio" name="mmode" value="encode" checked><span>编码</span></label>
  <label><input type="radio" name="mmode" value="decode"><span>解码</span></label>
</div>
<div class="field" style="margin-top:12px"><label for="input">输入文本</label><textarea id="input" class="code" spellcheck="false" placeholder="编码：HELLO；解码：- .... . .-.. .-.. ---"></textarea></div>
<div class="field" style="margin-top:12px"><label for="output">结果</label><textarea id="output" class="code" readonly placeholder="结果…"></textarea></div>
<div class="actions">
  <button class="btn primary" id="copy" type="button">复制结果</button>
  <button class="btn ghost danger" id="clear" type="button">清空</button>
</div>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var input=$("#input"), output=$("#output"), mode=$("#mode"), statusEl=$("#status");
  var M={A:".-",B:"-...",C:"-.-.",D:"-..",E:".",F:"..-.",G:"--.",H:"....",I:"..",J:".---",K:"-.-",L:".-..",M:"--",N:"-.",O:"---",P:".--.",Q:"--.-",R:".-.",S:"...",T:"-",U:"..-",V:"...-",W:".--",X:"-..-",Y:"-.--",Z:"--..",0:"-----",1:".----",2:"..---",3:"...--",4:"....-",5:".....",6:"-....",7:"--...",8:"---..",9:"----."};
  var RM={}; Object.keys(M).forEach(function(k){ RM[M[k]]=k; });
  function run(){
    var text=input.value; if(!text){ output.value=""; PHT.status(statusEl,""); return; }
    var m=mode.querySelector("input:checked").value;
    if(m==="encode"){
      output.value=text.toUpperCase().split("").map(function(c){ if(c===" ") return "/"; return M[c]?M[c]:c; }).join(" ");
    } else {
      output.value=text.trim().split(" / ").map(function(w){ return w.trim().split(/\\s+/).map(function(code){ return RM[code]||code; }).join(""); }).join(" ");
    }
    PHT.status(statusEl,"已"+(m==="encode"?"编码":"解码"),"ok");
  }
  mode.addEventListener("change",run);
  input.addEventListener("input",run);
  $("#copy").addEventListener("click",function(){ if(!output.value){PHT.status(statusEl,"没有可复制内容","error");return;} PHT.copy(output.value).then(function(ok){PHT.flash($("#copy"),"已复制");PHT.status(statusEl,ok?"已复制":"复制失败",ok?"ok":"error");}); });
  $("#clear").addEventListener("click",function(){ input.value=""; output.value=""; PHT.status(statusEl,""); input.focus(); });
  run();
})();`
});

TOOLS.push({
  file: "word-frequency.html",
  meta: { title: "词频统计", desc: "统计文本中词语出现次数并降序排列，支持忽略大小写、中文逐字与最短长度过滤。", category: "text", tags: ["词频", "统计", "分词", "文本"], order: 19 },
  body: `<div class="field"><label for="input">输入文本</label><textarea id="input" class="code" spellcheck="false" placeholder="粘贴一段文字…"></textarea></div>
<div class="row" style="gap:14px;flex-wrap:wrap;align-items:center;margin-top:10px">
  <label class="chk"><input type="checkbox" id="ignoreCase" checked> 忽略大小写</label>
  <label class="chk"><input type="checkbox" id="zhMode"> 按中文逐字</label>
  <label class="chk"><input type="checkbox" id="minLen"> 仅 ≥2 字符</label>
</div>
<div class="field" style="margin-top:12px"><label for="output">词频（前 50，按出现次数降序）</label><textarea id="output" class="code" readonly placeholder="结果…"></textarea></div>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var input=$("#input"), output=$("#output"), ignoreCase=$("#ignoreCase"), zhMode=$("#zhMode"), minLen=$("#minLen"), statusEl=$("#status");
  function run(){
    var text=input.value; if(!text){ output.value=""; PHT.status(statusEl,""); return; }
    var tokens = zhMode.checked ? text.split("") : text.split(/[^一-龥A-Za-z0-9]+/);
    var map={};
    tokens.forEach(function(t){
      if(!t) return;
      if(ignoreCase.checked) t=t.toLowerCase();
      if(minLen.checked && t.length<2) return;
      map[t]=(map[t]||0)+1;
    });
    var arr=Object.keys(map).map(function(k){ return [k,map[k]]; });
    arr.sort(function(a,b){ return b[1]-a[1]; });
    output.value=arr.slice(0,50).map(function(p){ return p[0]+": "+p[1]; }).join("\\n");
    PHT.status(statusEl,"共 "+arr.length+" 个不同词条","ok");
  }
  [input,ignoreCase,zhMode,minLen].forEach(function(el){ el.addEventListener("input",run); el.addEventListener("change",run); });
  run();
})();`
});

// ---------- 文本处理（续） ----------
TOOLS.push({
  file: "text-pad.html",
  meta: { title: "行首尾填充", desc: "给每行文本添加前缀/后缀，并可补齐到固定宽度（左/右/居中）。", category: "text", tags: ["填充", "前缀", "后缀", "对齐"], order: 20 },
  body: `<div class="row" style="gap:12px;flex-wrap:wrap;align-items:flex-end">
  <div class="field" style="max-width:200px"><label for="prefix">行前缀</label><input type="text" id="prefix" class="code" placeholder="如 - " autocomplete="off"></div>
  <div class="field" style="max-width:200px"><label for="suffix">行后缀</label><input type="text" id="suffix" class="code" placeholder="如 ," autocomplete="off"></div>
  <div class="field" style="max-width:140px"><label for="pad">补齐到宽度</label><input type="number" id="pad" value="0" min="0"></div>
  <div class="field" style="max-width:160px"><label for="align">对齐</label><select id="align"><option value="none">不补齐</option><option value="left">左对齐</option><option value="right">右对齐</option><option value="center">居中</option></select></div>
</div>
<div class="field" style="margin-top:12px"><label for="input">输入文本</label><textarea id="input" class="code" spellcheck="false" placeholder="每行一条…"></textarea></div>
<div class="field" style="margin-top:12px"><label for="output">结果</label><textarea id="output" class="code" readonly></textarea></div>
<div class="actions">
  <button class="btn primary" id="copy" type="button">复制结果</button>
  <button class="btn ghost danger" id="clear" type="button">清空</button>
</div>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var input=$("#input"), output=$("#output"), prefix=$("#prefix"), suffix=$("#suffix"), pad=$("#pad"), align=$("#align"), statusEl=$("#status");
  function padStr(s, n, a){
    if(n<=0||s.length>=n) return s;
    var d=n-s.length;
    if(a==="right"){ return " ".repeat(d)+s; }
    if(a==="center"){ var l=Math.floor(d/2); return " ".repeat(l)+s+" ".repeat(d-l); }
    return s+" ".repeat(d);
  }
  function run(){
    var text=input.value; if(!text){ output.value=""; PHT.status(statusEl,""); return; }
    var pre=prefix.value, suf=suffix.value, n=parseInt(pad.value,10)||0, a=align.value;
    output.value=text.split(/\\r?\\n/).map(function(line){ return padStr(pre+line+suf,n,a); }).join("\\n");
    PHT.status(statusEl,"已处理","ok");
  }
  [input,prefix,suffix,pad,align].forEach(function(el){ el.addEventListener("input",run); el.addEventListener("change",run); });
  $("#copy").addEventListener("click",function(){ if(!output.value){PHT.status(statusEl,"没有可复制内容","error");return;} PHT.copy(output.value).then(function(ok){PHT.flash($("#copy"),"已复制");PHT.status(statusEl,ok?"已复制":"复制失败",ok?"ok":"error");}); });
  $("#clear").addEventListener("click",function(){ input.value=""; output.value=""; PHT.status(statusEl,""); input.focus(); });
  run();
})();`
});

TOOLS.push({
  file: "text-wrap.html",
  meta: { title: "智能换行", desc: "按指定宽度对文本自动换行，可选长单词强制断行，适合整理代码注释与邮件。", category: "text", tags: ["换行", "宽度", "排版", "文本"], order: 21 },
  body: `<div class="row" style="gap:12px;flex-wrap:wrap;align-items:flex-end">
  <div class="field" style="max-width:160px"><label for="width">每行宽度</label><input type="number" id="width" value="60" min="1"></div>
  <label class="chk" style="align-self:flex-end;padding-bottom:8px"><input type="checkbox" id="breakWord"> 长单词强制断行</label>
</div>
<div class="field" style="margin-top:12px"><label for="input">输入文本</label><textarea id="input" class="code" spellcheck="false" placeholder="粘贴一段需要换行的文本…"></textarea></div>
<div class="field" style="margin-top:12px"><label for="output">结果</label><textarea id="output" class="code" readonly></textarea></div>
<div class="actions">
  <button class="btn primary" id="copy" type="button">复制结果</button>
  <button class="btn ghost danger" id="clear" type="button">清空</button>
</div>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var input=$("#input"), output=$("#output"), width=$("#width"), breakWord=$("#breakWord"), statusEl=$("#status");
  function run(){
    var text=input.value; if(!text){ output.value=""; PHT.status(statusEl,""); return; }
    var w=parseInt(width.value,10)||60, bw=breakWord.checked, lines=[];
    text.split(/\\r?\\n/).forEach(function(para){
      if(para===""){ lines.push(""); return; }
      var words=para.split(/(\\s+)/), cur="";
      words.forEach(function(tok){
        if(/^\\s+$/.test(tok)){ if(cur!==""){ cur+=tok; } return; }
        if(cur.length+tok.length>w && cur!==""){ lines.push(cur); cur=tok; }
        else { cur+=tok; }
      });
      if(cur!=="") lines.push(cur);
    });
    output.value=lines.join("\\n");
    PHT.status(statusEl,"已换行","ok");
  }
  [input,width,breakWord].forEach(function(el){ el.addEventListener("input",run); el.addEventListener("change",run); });
  $("#copy").addEventListener("click",function(){ if(!output.value){PHT.status(statusEl,"没有可复制内容","error");return;} PHT.copy(output.value).then(function(ok){PHT.flash($("#copy"),"已复制");PHT.status(statusEl,ok?"已复制":"复制失败",ok?"ok":"error");}); });
  $("#clear").addEventListener("click",function(){ input.value=""; output.value=""; PHT.status(statusEl,""); input.focus(); });
  run();
})();`
});

// ---------- 开发者 ----------
TOOLS.push({
  file: "slug-generator.html",
  meta: { title: "Slug 生成器", desc: "把标题、文章名转成 URL 友好的 Slug，支持分隔符与保留中文，常用于博客与文件命名。", category: "dev", tags: ["slug", "url", "命名", "链接"], order: 24 },
  body: `<div class="row" style="gap:12px;flex-wrap:wrap;align-items:flex-end">
  <div class="field" style="max-width:140px"><label for="sep">分隔符</label><select id="sep"><option value="-" selected>-</option><option value="_">_</option></select></div>
  <label class="chk" style="align-self:flex-end;padding-bottom:8px"><input type="checkbox" id="lower" checked> 转小写</label>
</div>
<div class="field" style="margin-top:12px"><label for="input">标题文本</label><textarea id="input" class="code" spellcheck="false" placeholder="例如 Hello World! 你好，世界"></textarea></div>
<div class="field" style="margin-top:12px"><label for="output">Slug</label><textarea id="output" class="code" readonly></textarea></div>
<div class="actions">
  <button class="btn primary" id="copy" type="button">复制结果</button>
  <button class="btn ghost danger" id="clear" type="button">清空</button>
</div>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var input=$("#input"), output=$("#output"), sep=$("#sep"), lower=$("#lower"), statusEl=$("#status");
  function run(){
    var text=input.value; if(!text){ output.value=""; PHT.status(statusEl,""); return; }
    var s=lower.checked?text.trim().toLowerCase():text.trim();
    s=s.replace(/[^一-龥a-zA-Z0-9]+/g, sep.value);
    s=s.replace(new RegExp("^"+sep.value+"+|"+sep.value+"+$","g"),"");
    output.value=s;
    PHT.status(statusEl,"已生成","ok");
  }
  [input,sep,lower].forEach(function(el){ el.addEventListener("input",run); el.addEventListener("change",run); });
  $("#copy").addEventListener("click",function(){ if(!output.value){PHT.status(statusEl,"没有可复制内容","error");return;} PHT.copy(output.value).then(function(ok){PHT.flash($("#copy"),"已复制");PHT.status(statusEl,ok?"已复制":"复制失败",ok?"ok":"error");}); });
  $("#clear").addEventListener("click",function(){ input.value=""; output.value=""; PHT.status(statusEl,""); input.focus(); });
  run();
})();`
});

TOOLS.push({
  file: "mime-lookup.html",
  meta: { title: "MIME 类型查询", desc: "根据文件扩展名查 MIME，或根据 MIME 反查扩展名，内置常见类型对照表。", category: "dev", tags: ["mime", "类型", "扩展名", "对照"], order: 25 },
  body: `<div class="field"><label for="input">扩展名（如 .json）或 MIME（如 image/png）</label><input type="text" id="input" class="code" placeholder=".json 或 application/json" autocomplete="off"></div>
<div class="field" style="margin-top:12px"><label for="output">查询结果</label><input type="text" id="output" class="code" readonly></div>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var input=$("#input"), output=$("#output"), statusEl=$("#status");
  var MAP={"json":"application/json","xml":"application/xml","html":"text/html","htm":"text/html","css":"text/css","js":"text/javascript","mjs":"text/javascript","csv":"text/csv","png":"image/png","jpg":"image/jpeg","jpeg":"image/jpeg","gif":"image/gif","webp":"image/webp","svg":"image/svg+xml","pdf":"application/pdf","zip":"application/zip","txt":"text/plain","md":"text/markdown","mp3":"audio/mpeg","mp4":"video/mp4","webm":"video/webm","woff":"font/woff","woff2":"font/woff2","ttf":"font/ttf","otf":"font/otf","ico":"image/x-icon","yaml":"application/yaml","yml":"application/yaml","jsonld":"application/ld+json","form":"application/x-www-form-urlencoded","bin":"application/octet-stream","wav":"audio/wav","ogg":"audio/ogg","avi":"video/x-msvideo","doc":"application/msword","docx":"application/vnd.openxmlformats-officedocument.wordprocessingml.document","xls":"application/vnd.ms-excel","xlsx":"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","ppt":"application/vnd.ms-powerpoint","pptx":"application/vnd.openxmlformats-officedocument.presentationml.presentation","gzip":"application/gzip","rar":"application/x-rar-compressed","epub":"application/epub+zip"};
  var REV={}; Object.keys(MAP).forEach(function(k){ if(!REV[MAP[k]]) REV[MAP[k]]=k; });
  function run(){
    var q=input.value.trim().toLowerCase(); if(!q){ output.value=""; PHT.status(statusEl,""); return; }
    if(q.charAt(0)==="."){ var ext=q.slice(1); output.value=MAP[ext]?MAP[ext]:"未找到对应的 MIME 类型"; }
    else { output.value=REV[q]?("."+REV[q]):"未找到对应的扩展名"; }
    PHT.status(statusEl,"已查询","ok");
  }
  input.addEventListener("input",run);
  run();
})();`
});

TOOLS.push({
  file: "ua-parser.html",
  meta: { title: "User-Agent 解析", desc: "从浏览器的 User-Agent 字符串中识别浏览器、操作系统与设备类型，便于排查兼容问题。", category: "dev", tags: ["ua", "user-agent", "浏览器", "解析"], order: 26 },
  body: `<div class="field"><label for="input">User-Agent 字符串</label><textarea id="input" class="code" spellcheck="false" placeholder="粘贴一段 User-Agent…"></textarea></div>
<dl class="stat-row" style="margin-top:12px">
  <div class="stat"><dt>浏览器</dt><dd id="browser">-</dd></div>
  <div class="stat"><dt>操作系统</dt><dd id="os">-</dd></div>
  <div class="stat"><dt>设备</dt><dd id="device">-</dd></div>
</dl>
<div class="actions">
  <button class="btn ghost danger" id="clear" type="button">清空</button>
</div>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var input=$("#input"), statusEl=$("#status");
  function parseUA(ua){
    var r={browser:"未知",os:"未知",device:"未知"};
    if(/Edg\\//.test(ua)) r.browser="Edge";
    else if(/OPR\\/|Opera/.test(ua)) r.browser="Opera";
    else if(/Firefox\\//.test(ua)) r.browser="Firefox";
    else if(/Chrome\\//.test(ua)) r.browser="Chrome";
    else if(/Safari\\//.test(ua)) r.browser="Safari";
    if(/Windows NT 10/.test(ua)) r.os="Windows 10/11";
    else if(/Windows NT/.test(ua)) r.os="Windows";
    else if(/Mac OS X/.test(ua)) r.os="macOS";
    else if(/Android/.test(ua)) r.os="Android";
    else if(/iPhone|iPad|iPod/.test(ua)) r.os="iOS";
    else if(/Linux/.test(ua)) r.os="Linux";
    if(/Mobile/.test(ua)) r.device="手机";
    else if(/iPad|Tablet/.test(ua)) r.device="平板";
    else r.device="桌面";
    return r;
  }
  function run(){
    var ua=input.value.trim();
    var r=ua?parseUA(ua):{browser:"-",os:"-",device:"-"};
    $("#browser").textContent=r.browser; $("#os").textContent=r.os; $("#device").textContent=r.device;
    PHT.status(statusEl, ua?"已解析":"","ok");
  }
  input.addEventListener("input",run);
  $("#clear").addEventListener("click",function(){ input.value=""; run(); input.focus(); });
  run();
})();`
});

TOOLS.push({
  file: "cron-parser.html",
  meta: { title: "Cron 表达式解析", desc: "解析标准 5 字段 Cron 表达式，展开各字段取值并推算接下来数次执行时间。", category: "dev", tags: ["cron", "定时", "调度", "解析"], order: 27 },
  body: `<div class="field"><label for="input">Cron 表达式（分 时 日 月 周）</label><input type="text" id="input" class="code" value="*/15 9-17 * * 1-5" autocomplete="off"></div>
<div class="field" style="margin-top:12px"><label for="output">解析结果</label><textarea id="output" class="code" readonly></textarea></div>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var input=$("#input"), output=$("#output"), statusEl=$("#status");
  function parseField(s,min,max){
    var set=[];
    s.split(",").forEach(function(part){
      var step=1,p=part;
      if(p.indexOf("/")>=0){ var pp=p.split("/"); p=pp[0]; step=parseInt(pp[1],10)||1; }
      if(p==="*"){ for(var i=min;i<=max;i+=step) set.push(i); }
      else if(p.indexOf("-")>=0){ var ab=p.split("-"); var a=+ab[0],b=+ab[1]; for(var i=a;i<=b;i+=step) set.push(i); }
      else { set.push(+p); }
    });
    return set;
  }
  function nextRuns(expr,count){
    var f=expr.trim().split(/\\s+/);
    if(f.length<5) return "表达式需要 5 个字段（分 时 日 月 周）";
    var M=parseField(f[0],0,59),H=parseField(f[1],0,23),D=parseField(f[2],1,31),Mon=parseField(f[3],1,12),W=parseField(f[4],0,7).map(function(x){return x%7;});
    var now=new Date(); now.setSeconds(0,0); now.setMinutes(now.getMinutes()+1);
    var res=[],limit=0;
    while(res.length<count && limit<2000000){
      limit++;
      if(Mon.indexOf(now.getMonth()+1)<0){ now.setDate(1); now.setMonth(now.getMonth()+1); now.setHours(0,0,0,0); continue; }
      if(D.indexOf(now.getDate())<0 || W.indexOf(now.getDay())<0){ now.setMinutes(now.getMinutes()+1); continue; }
      if(H.indexOf(now.getHours())<0 || M.indexOf(now.getMinutes())<0){ now.setMinutes(now.getMinutes()+1); continue; }
      res.push(now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate()+" "+("0"+now.getHours()).slice(-2)+":"+("0"+now.getMinutes()).slice(-2));
      now.setMinutes(now.getMinutes()+1);
    }
    return res.length?res.join("\\n"):"未在两年内找到执行时间";
  }
  function run(){
    var v=input.value.trim(); if(!v){ output.value=""; PHT.status(statusEl,""); return; }
    output.value=nextRuns(v,5);
    PHT.status(statusEl,"已解析","ok");
  }
  input.addEventListener("input",run);
  run();
})();`
});

TOOLS.push({
  file: "sql-formatter.html",
  meta: { title: "SQL 格式化", desc: "为常用 SQL 关键字换行并转为大写，快速整理挤在一行的查询语句。", category: "dev", tags: ["sql", "格式化", "查询", "数据库"], order: 28 },
  body: `<div class="field"><label for="input">SQL 语句</label><textarea id="input" class="code" spellcheck="false" placeholder="select id,name from users where age>18 order by id"></textarea></div>
<div class="field" style="margin-top:12px"><label for="output">格式化结果</label><textarea id="output" class="code" readonly></textarea></div>
<div class="actions">
  <button class="btn primary" id="copy" type="button">复制结果</button>
  <button class="btn ghost danger" id="clear" type="button">清空</button>
</div>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var input=$("#input"), output=$("#output"), statusEl=$("#status");
  var KW=["select","from","where","and","or","group by","order by","having","limit","insert into","values","update","set","delete from","left join","right join","inner join","outer join","cross join","on","as","union","union all"];
  function run(){
    var sql=input.value; if(!sql){ output.value=""; PHT.status(statusEl,""); return; }
    var s=sql;
    KW.forEach(function(k){ var re=new RegExp("\\b"+k.replace(/ /g,"\\\\s+")+"\\b","gi"); s=s.replace(re,function(m){ return "\\n"+k.toUpperCase(); }); });
    s=s.replace(/\\n\\s*\\n/g,"\\n");
    output.value=s.trim();
    PHT.status(statusEl,"已格式化","ok");
  }
  input.addEventListener("input",run);
  $("#copy").addEventListener("click",function(){ if(!output.value){PHT.status(statusEl,"没有可复制内容","error");return;} PHT.copy(output.value).then(function(ok){PHT.flash($("#copy"),"已复制");PHT.status(statusEl,ok?"已复制":"复制失败",ok?"ok":"error");}); });
  $("#clear").addEventListener("click",function(){ input.value=""; output.value=""; PHT.status(statusEl,""); input.focus(); });
  run();
})();`
});

TOOLS.push({
  file: "html-formatter.html",
  meta: { title: "HTML 格式化", desc: "按标签层级缩进美化 HTML，自动跳过 script/style/pre 内部内容。", category: "dev", tags: ["html", "格式化", "缩进", "美化"], order: 29 },
  body: `<div class="field"><label for="input">HTML 源码</label><textarea id="input" class="code" spellcheck="false" placeholder="<div><p>hello</p></div>"></textarea></div>
<div class="field" style="margin-top:12px"><label for="output">格式化结果</label><textarea id="output" class="code" readonly></textarea></div>
<div class="actions">
  <button class="btn primary" id="copy" type="button">复制结果</button>
  <button class="btn ghost danger" id="clear" type="button">清空</button>
</div>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var input=$("#input"), output=$("#output"), statusEl=$("#status");
  var VOID=["area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"];
  function run(){
    var src=input.value; if(!src){ output.value=""; PHT.status(statusEl,""); return; }
    var tokens=src.match(/<\\/?[^>]+>|[^<]+/g)||[src];
    var indent=0,out=[],raw=0;
    tokens.forEach(function(tok){
      if(/^<script|^<style|^<pre/i.test(tok) && !/\\/>$/.test(tok)){ raw++; }
      if(raw>0){ out.push("  ".repeat(indent)+tok); if(/<\\/script>|<\\/style>|<\\/pre/i.test(tok)) raw--; return; }
      if(/^<\\//.test(tok)){ indent=Math.max(0,indent-1); out.push("  ".repeat(indent)+tok); }
      else if(/^<[^\\/]+[^>]*[^\\/]>$/.test(tok) && !/^<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)\\b/i.test(tok)){ out.push("  ".repeat(indent)+tok); indent++; }
      else if(/^<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)\\b/i.test(tok) || /\\/>$/.test(tok)){ out.push("  ".repeat(indent)+tok); }
      else { out.push("  ".repeat(indent)+tok.trim()); }
    });
    output.value=out.filter(function(l){return l.trim()!=="";}).join("\\n");
    PHT.status(statusEl,"已格式化","ok");
  }
  input.addEventListener("input",run);
  $("#copy").addEventListener("click",function(){ if(!output.value){PHT.status(statusEl,"没有可复制内容","error");return;} PHT.copy(output.value).then(function(ok){PHT.flash($("#copy"),"已复制");PHT.status(statusEl,ok?"已复制":"复制失败",ok?"ok":"error");}); });
  $("#clear").addEventListener("click",function(){ input.value=""; output.value=""; PHT.status(statusEl,""); input.focus(); });
  run();
})();`
});

TOOLS.push({
  file: "css-formatter.html",
  meta: { title: "CSS 格式化", desc: "为压缩的 CSS 重新换行与缩进，规则与声明各占一行，方便阅读修改。", category: "dev", tags: ["css", "格式化", "缩进", "美化"], order: 30 },
  body: `<div class="field"><label for="input">CSS 源码</label><textarea id="input" class="code" spellcheck="false" placeholder="a{color:red;padding:0}"></textarea></div>
<div class="field" style="margin-top:12px"><label for="output">格式化结果</label><textarea id="output" class="code" readonly></textarea></div>
<div class="actions">
  <button class="btn primary" id="copy" type="button">复制结果</button>
  <button class="btn ghost danger" id="clear" type="button">清空</button>
</div>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var input=$("#input"), output=$("#output"), statusEl=$("#status");
  function run(){
    var css=input.value; if(!css){ output.value=""; PHT.status(statusEl,""); return; }
    css=css.replace(/\\/\\*[^\\*]*\\*\\//g,"").replace(/\\s*([{};])\\s*/g,"$1\\n").replace(/\\s*:\\s*/g,": ");
    var indent=0,out=[];
    css.split("\\n").forEach(function(line){
      line=line.trim(); if(!line) return;
      if(line.charAt(0)==="}"){ indent=Math.max(0,indent-1); out.push("  ".repeat(indent)+line); }
      else if(line.charAt(line.length-1)==="{"){ out.push("  ".repeat(indent)+line); indent++; }
      else { out.push("  ".repeat(indent)+line); }
    });
    output.value=out.join("\\n");
    PHT.status(statusEl,"已格式化","ok");
  }
  input.addEventListener("input",run);
  $("#copy").addEventListener("click",function(){ if(!output.value){PHT.status(statusEl,"没有可复制内容","error");return;} PHT.copy(output.value).then(function(ok){PHT.flash($("#copy"),"已复制");PHT.status(statusEl,ok?"已复制":"复制失败",ok?"ok":"error");}); });
  $("#clear").addEventListener("click",function(){ input.value=""; output.value=""; PHT.status(statusEl,""); input.focus(); });
  run();
})();`
});

TOOLS.push({
  file: "regex-extract.html",
  meta: { title: "正则提取", desc: "用正则表达式在文本中提取所有匹配与分组，支持全局、忽略大小写与多行。", category: "dev", tags: ["regex", "提取", "匹配", "分组"], order: 31 },
  body: `<div class="field"><label for="pattern">正则表达式</label><input type="text" id="pattern" class="code" placeholder="例如 (\\d{4})-(\\d{2})-(\\d{2})" autocomplete="off"></div>
<div class="row" style="gap:14px;flex-wrap:wrap;align-items:center;margin-top:10px">
  <label class="chk"><input type="checkbox" id="global" checked> 全局</label>
  <label class="chk"><input type="checkbox" id="ignoreCase"> 忽略大小写</label>
  <label class="chk"><input type="checkbox" id="multiline"> 多行</label>
</div>
<div class="field" style="margin-top:12px"><label for="input">待匹配文本</label><textarea id="input" class="code" spellcheck="false" placeholder="在此粘贴文本…"></textarea></div>
<div class="field" style="margin-top:12px"><label for="output">提取结果（每行一次匹配，→ 后为分组）</label><textarea id="output" class="code" readonly></textarea></div>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var pattern=$("#pattern"), input=$("#input"), output=$("#output"), global=$("#global"), ignoreCase=$("#ignoreCase"), multiline=$("#multiline"), statusEl=$("#status");
  function run(){
    var text=input.value, pat=pattern.value;
    if(!text){ output.value=""; PHT.status(statusEl,""); return; }
    if(!pat){ output.value=""; PHT.status(statusEl,""); return; }
    try{
      var flags=(global.checked?"g":"")+(ignoreCase.checked?"i":"")+(multiline.checked?"m":"");
      var re=new RegExp(pat,flags), m, out=[], guard=0;
      if(re.global){
        while((m=re.exec(text))!==null){ out.push(m[0]+(m.length>1?"  →  "+m.slice(1).join(" | "):"")); if(m.index===re.lastIndex) re.lastIndex++; if(++guard>100000) break; }
      } else { m=re.exec(text); if(m) out.push(m[0]+(m.length>1?"  →  "+m.slice(1).join(" | "):"")); }
      output.value=out.join("\\n");
      PHT.status(statusEl, out.length+" 个匹配","ok");
    }catch(e){ PHT.status(statusEl,"正则错误："+e.message,"error"); }
  }
  [pattern,input,global,ignoreCase,multiline].forEach(function(el){ el.addEventListener("input",run); el.addEventListener("change",run); });
  run();
})();`
});

TOOLS.push({
  file: "hash-compare.html",
  meta: { title: "哈希比对", desc: "比较两个哈希值是否一致（忽略大小写与空格），并据长度提示可能使用的算法。", category: "dev", tags: ["hash", "比对", "校验", "md5"], order: 32 },
  body: `<div class="field"><label for="a">哈希 A</label><input type="text" id="a" class="code" placeholder="如 5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8" autocomplete="off"></div>
<div class="field" style="margin-top:12px"><label for="b">哈希 B</label><input type="text" id="b" class="code" placeholder="再粘贴一份哈希" autocomplete="off"></div>
<dl class="stat-row" style="margin-top:12px">
  <div class="stat"><dt>结果</dt><dd id="result">-</dd></div>
  <div class="stat"><dt>推测算法</dt><dd id="algo">-</dd></div>
</dl>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var a=$("#a"), b=$("#b"), statusEl=$("#status");
  function guess(h){ var n=h.replace(/\\s/g,"").length; if(n===32) return "MD5"; if(n===40) return "SHA-1"; if(n===56) return "SHA-224"; if(n===64) return "SHA-256"; if(n===96) return "SHA-384"; if(n===128) return "SHA-512"; return "未知"; }
  function run(){
    var x=a.value.trim(), y=b.value.trim();
    if(!x||!y){ $("#result").textContent="-"; $("#algo").textContent="-"; PHT.status(statusEl,""); return; }
    var eq=x.toLowerCase()===y.toLowerCase();
    $("#result").textContent=eq?"一致":"不一致";
    $("#algo").textContent=guess(x);
    PHT.status(statusEl, eq?"一致":"不一致", eq?"ok":"error");
  }
  [a,b].forEach(function(el){ el.addEventListener("input",run); });
  run();
})();`
});

TOOLS.push({
  file: "aes-encrypt.html",
  meta: { title: "AES 加密", desc: "使用 AES-GCM 与口令（PBKDF2）加解密文本，结果以 Base64 输出，全程本地。", category: "dev", tags: ["aes", "加密", "gcm", "密码"], order: 33 },
  body: `<div class="field"><label for="pass">口令</label><input type="text" id="pass" class="code" placeholder="用于派生的口令" autocomplete="off"></div>
<div class="field" style="margin-top:12px"><label for="input">明文 / 密文</label><textarea id="input" class="code" spellcheck="false" placeholder="要加密的文本，或粘贴 密文 进行解密"></textarea></div>
<div class="field" style="margin-top:12px"><label for="output">结果</label><textarea id="output" class="code" readonly></textarea></div>
<div class="actions">
  <button class="btn primary" id="enc" type="button">加密</button>
  <button class="btn" id="dec" type="button">解密</button>
  <button class="btn" id="copy" type="button">复制结果</button>
</div>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var pass=$("#pass"), input=$("#input"), output=$("#output"), statusEl=$("#status");
  function b64(buf){ var s=""; var bytes=new Uint8Array(buf); for(var i=0;i<bytes.length;i++) s+=String.fromCharCode(bytes[i]); return btoa(s); }
  function unb64(s){ var bin=atob(s), arr=new Uint8Array(bin.length); for(var i=0;i<bin.length;i++) arr[i]=bin.charCodeAt(i); return arr; }
  function hasCrypto(){ return typeof crypto!=="undefined" && crypto.subtle; }
  async function keyFrom(password){
    var base=await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey({name:"PBKDF2",salt:new TextEncoder().encode("pht-salt"),iterations:100000,hash:"SHA-256"}, base, {name:"AES-GCM",length:256}, false, ["encrypt","decrypt"]);
  }
  async function encrypt(){
    if(!hasCrypto()){ PHT.status(statusEl,"当前环境不支持 WebCrypto","error"); return; }
    try{
      var k=await keyFrom(pass.value);
      var iv=crypto.getRandomValues(new Uint8Array(12));
      var ct=await crypto.subtle.encrypt({name:"AES-GCM",iv:iv}, k, new TextEncoder().encode(input.value));
      output.value=b64(iv)+":"+b64(ct);
      PHT.status(statusEl,"已加密","ok");
    }catch(e){ PHT.status(statusEl,"加密失败："+e.message,"error"); }
  }
  async function decrypt(){
    if(!hasCrypto()){ PHT.status(statusEl,"当前环境不支持 WebCrypto","error"); return; }
    try{
      var parts=input.value.trim().split(":"); if(parts.length<2){ PHT.status(statusEl,"密文格式不正确","error"); return; }
      var k=await keyFrom(pass.value);
      var iv=unb64(parts[0]), data=unb64(parts[1]);
      var pt=await crypto.subtle.decrypt({name:"AES-GCM",iv:iv}, k, data);
      output.value=new TextDecoder().decode(pt);
      PHT.status(statusEl,"已解密","ok");
    }catch(e){ PHT.status(statusEl,"解密失败（口令或密文错误）","error"); }
  }
  $("#enc").addEventListener("click",encrypt);
  $("#dec").addEventListener("click",decrypt);
  $("#copy").addEventListener("click",function(){ if(!output.value){PHT.status(statusEl,"没有可复制内容","error");return;} PHT.copy(output.value).then(function(ok){PHT.flash($("#copy"),"已复制");PHT.status(statusEl,ok?"已复制":"复制失败",ok?"ok":"error");}); });
})();`
});

TOOLS.push({
  file: "rot13.html",
  meta: { title: "ROT13 编码", desc: "对字母进行 ROT13 替换（加密与解密相同），常用于论坛隐藏剧透。", category: "dev", tags: ["rot13", "替换", "编码", "密码"], order: 34 },
  body: `<div class="field"><label for="input">输入文本</label><textarea id="input" class="code" spellcheck="false" placeholder="Hello World"></textarea></div>
<div class="field" style="margin-top:12px"><label for="output">结果</label><textarea id="output" class="code" readonly></textarea></div>
<div class="actions">
  <button class="btn primary" id="copy" type="button">复制结果</button>
  <button class="btn ghost danger" id="clear" type="button">清空</button>
</div>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var input=$("#input"), output=$("#output"), statusEl=$("#status");
  function rot(s){ return s.replace(/[a-z]/gi,function(c){ var b=c<="Z"?65:97; return String.fromCharCode((c.charCodeAt(0)-b+13)%26+b); }); }
  function run(){ var t=input.value; if(!t){ output.value=""; PHT.status(statusEl,""); return; } output.value=rot(t); PHT.status(statusEl,"已转换","ok"); }
  input.addEventListener("input",run);
  $("#copy").addEventListener("click",function(){ if(!output.value){PHT.status(statusEl,"没有可复制内容","error");return;} PHT.copy(output.value).then(function(ok){PHT.flash($("#copy"),"已复制");PHT.status(statusEl,ok?"已复制":"复制失败",ok?"ok":"error");}); });
  $("#clear").addEventListener("click",function(){ input.value=""; output.value=""; PHT.status(statusEl,""); input.focus(); });
  run();
})();`
});

TOOLS.push({
  file: "json-query.html",
  meta: { title: "JSON 路径提取", desc: "用 a.b.c 或 a.b[0].c 这样的路径从 JSON 中提取子节点并格式化输出。", category: "dev", tags: ["json", "path", "提取", "查询"], order: 35 },
  body: `<div class="field"><label for="json">JSON</label><textarea id="json" class="code" spellcheck="false" placeholder="{&quot;user&quot;:{&quot;name&quot;:&quot;Ada&quot;,&quot;tags&quot;:[&quot;x&quot;,&quot;y&quot;]}}"></textarea></div>
<div class="field" style="margin-top:12px"><label for="path">路径（如 user.tags[1]）</label><input type="text" id="path" class="code" value="user.name" autocomplete="off"></div>
<div class="field" style="margin-top:12px"><label for="output">结果</label><textarea id="output" class="code" readonly></textarea></div>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var json=$("#json"), path=$("#path"), output=$("#output"), statusEl=$("#status");
  function getPath(obj, p){
    var parts=p.replace(/\\[(\\d+)\\]/g,".$1").split(".").filter(Boolean);
    var cur=obj;
    for(var i=0;i<parts.length;i++){ if(cur==null) return undefined; cur=cur[parts[i]]; }
    return cur;
  }
  function run(){
    var txt=json.value.trim(), p=path.value.trim();
    if(!txt){ output.value=""; PHT.status(statusEl,""); return; }
    try{
      var obj=JSON.parse(txt), val=getPath(obj,p);
      if(val===undefined){ output.value="（路径不存在）"; PHT.status(statusEl,"路径不存在","error"); return; }
      output.value=(typeof val==="object"&&val!==null)?JSON.stringify(val,null,2):String(val);
      PHT.status(statusEl,"已提取","ok");
    }catch(e){ PHT.status(statusEl,"JSON 错误："+e.message,"error"); }
  }
  [json,path].forEach(function(el){ el.addEventListener("input",run); });
  run();
})();`
});

TOOLS.push({
  file: "num-to-chinese.html",
  meta: { title: "数字转中文", desc: "把整数转换为中文数字，支持简体与人民币大写（壹贰叁），最高到兆级。", category: "dev", tags: ["中文数字", "大写", "转换", "人民币"], order: 36 },
  body: `<div class="row" style="gap:14px;flex-wrap:wrap;align-items:flex-end">
  <div class="field" style="flex:1;min-width:200px"><label for="input">整数</label><input type="text" id="input" class="code" value="123456789" autocomplete="off"></div>
  <label class="chk" style="align-self:flex-end;padding-bottom:8px"><input type="checkbox" id="upper"> 人民币大写</label>
</div>
<dl class="stat-row" style="margin-top:12px">
  <div class="stat"><dt>结果</dt><dd id="result">-</dd></div>
</dl>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var input=$("#input"), upper=$("#upper"), statusEl=$("#status");
  function groupToCN(n,u,w){
    var s="",zero=false;
    for(var i=3;i>=0;i--){
      var d=Math.floor(n/Math.pow(10,i))%10;
      if(d===0){ if(s!==""&&!zero){ s+=u[0]; zero=true; } }
      else { s+=u[d]+w[i]; zero=false; }
    }
    return s;
  }
  function toChinese(num,up){
    var d=["零","一","二","三","四","五","六","七","八","九"],dw=["","十","百","千"];
    var db=["零","壹","贰","叁","肆","伍","陆","柒","捌","玖"],dwb=["","拾","佰","仟"];
    var u=up?db:d,w=up?dwb:dw,big=["","万","亿","兆"];
    if(num===0) return u[0];
    var neg=num<0; if(neg) num=-num;
    var parts=[]; while(num>0){ parts.unshift(num%10000); num=Math.floor(num/10000); }
    var out="";
    for(var i=0;i<parts.length;i++){
      var g=groupToCN(parts[i],u,w), idx=parts.length-1-i;
      if(parts[i]===0){ if(out!=="") out+=u[0]; continue; }
      out+=g+big[idx];
    }
    return (neg?"负":"")+out;
  }
  function run(){
    var v=input.value.trim(); if(!v){ $("#result").textContent="-"; PHT.status(statusEl,""); return; }
    var n=parseInt(v,10);
    if(isNaN(n)){ PHT.status(statusEl,"请输入整数","error"); return; }
    if(Math.abs(n)>1e16){ PHT.status(statusEl,"数值过大","error"); return; }
    $("#result").textContent=toChinese(n,upper.checked);
    PHT.status(statusEl,"已转换","ok");
  }
  [input,upper].forEach(function(el){ el.addEventListener("input",run); el.addEventListener("change",run); });
  run();
})();`
});

TOOLS.push({
  file: "http-status-lookup.html",
  meta: { title: "HTTP 状态码查询", desc: "输入 HTTP 状态码，返回原因短语、所属类别与常见说明。", category: "dev", tags: ["http", "status", "状态码", "对照"], order: 37 },
  body: `<div class="field"><label for="input">状态码（如 404）</label><input type="text" id="input" class="code" value="404" autocomplete="off"></div>
<dl class="stat-row" style="margin-top:12px">
  <div class="stat"><dt>类别</dt><dd id="cls">-</dd></div>
  <div class="stat"><dt>含义</dt><dd id="mean">-</dd></div>
</dl>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var input=$("#input"), statusEl=$("#status");
  var MAP={200:["2xx 成功","OK，请求已成功处理"],201:["2xx 成功","Created，已创建资源"],204:["2xx 成功","No Content，无返回内容"],301:["3xx 重定向","Moved Permanently，永久重定向"],302:["3xx 重定向","Found，临时重定向"],304:["3xx 重定向","Not Modified，命中缓存"],400:["4xx 客户端错误","Bad Request，请求格式错误"],401:["4xx 客户端错误","Unauthorized，未认证"],403:["4xx 客户端错误","Forbidden，禁止访问"],404:["4xx 客户端错误","Not Found，资源不存在"],405:["4xx 客户端错误","Method Not Allowed，方法不被允许"],408:["4xx 客户端错误","Request Timeout，请求超时"],429:["4xx 客户端错误","Too Many Requests，请求过于频繁"],500:["5xx 服务端错误","Internal Server Error，服务器内部错误"],502:["5xx 服务端错误","Bad Gateway，网关错误"],503:["5xx 服务端错误","Service Unavailable，服务不可用"],504:["5xx 服务端错误","Gateway Timeout，网关超时"]};
  function run(){
    var v=input.value.trim(); if(!v){ $("#cls").textContent="-"; $("#mean").textContent="-"; PHT.status(statusEl,""); return; }
    var info=MAP[v];
    if(info){ $("#cls").textContent=info[0]; $("#mean").textContent=info[1]; PHT.status(statusEl,"已查询","ok"); }
    else { $("#cls").textContent="-"; $("#mean").textContent="未收录该状态码"; PHT.status(statusEl,"未收录","error"); }
  }
  input.addEventListener("input",run);
  run();
})();`
});

TOOLS.push({
  file: "semver-compare.html",
  meta: { title: "版本号比较", desc: "比较两个语义化版本号（SemVer）的大小，支持预发布标识。", category: "dev", tags: ["semver", "版本", "比较", "npm"], order: 38 },
  body: `<div class="row" style="gap:12px;flex-wrap:wrap">
  <div class="field" style="flex:1;min-width:180px"><label for="v1">版本 A</label><input type="text" id="v1" class="code" value="1.2.3" autocomplete="off"></div>
  <div class="field" style="flex:1;min-width:180px"><label for="v2">版本 B</label><input type="text" id="v2" class="code" value="1.10.0" autocomplete="off"></div>
</div>
<div class="field" style="margin-top:12px"><label for="output">比较结果</label><input type="text" id="output" class="code" readonly></div>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var v1=$("#v1"), v2=$("#v2"), output=$("#output"), statusEl=$("#status");
  function parse(v){
    var m=/^(\\d+)\\.(\\d+)\\.(\\d+)(?:-([0-9A-Za-z.-]+))?/.exec(v.trim());
    if(!m) return null;
    return {major:+m[1],minor:+m[2],patch:+m[3],pre:m[4]||""};
  }
  function cmp(a,b){
    if(a.major!==b.major) return a.major-b.major;
    if(a.minor!==b.minor) return a.minor-b.minor;
    if(a.patch!==b.patch) return a.patch-b.patch;
    if(a.pre===""&&b.pre==="") return 0;
    if(a.pre==="") return 1;
    if(b.pre==="") return -1;
    return a.pre<b.pre?-1:(a.pre>b.pre?1:0);
  }
  function run(){
    var a=parse(v1.value), b=parse(v2.value);
    if(!a||!b){ output.value=""; PHT.status(statusEl,"版本号格式应为 x.y.z","error"); return; }
    var r=cmp(a,b);
    output.value = r===0?"A = B":(r<0?"A < B":"A > B");
    PHT.status(statusEl,"已比较","ok");
  }
  [v1,v2].forEach(function(el){ el.addEventListener("input",run); });
  run();
})();`
});

TOOLS.push({
  file: "json-diff.html",
  meta: { title: "JSON 差异", desc: "递归比较两个 JSON 对象，列出新增、删除与变更的字段路径。", category: "dev", tags: ["json", "diff", "对比", "变更"], order: 39 },
  body: `<div class="field"><label for="a">JSON A</label><textarea id="a" class="code" spellcheck="false" placeholder="{}"></textarea></div>
<div class="field" style="margin-top:12px"><label for="b">JSON B</label><textarea id="b" class="code" spellcheck="false" placeholder="{}"></textarea></div>
<div class="field" style="margin-top:12px"><label for="output">差异（路径 + 变化）</label><textarea id="output" class="code" readonly></textarea></div>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var a=$("#a"), b=$("#b"), output=$("#output"), statusEl=$("#status");
  function diff(x,y,path,res){
    if(typeof x!==typeof y){ res.push(path+"：类型变化 "+typeof x+" → "+typeof y); return; }
    if(Array.isArray(x)&&Array.isArray(y)){
      var n=Math.max(x.length,y.length);
      for(var i=0;i<n;i++){ if(i>=x.length) res.push(path+"["+i+"]：新增 "+JSON.stringify(y[i])); else if(i>=y.length) res.push(path+"["+i+"]：删除 "+JSON.stringify(x[i])); else diff(x[i],y[i],path+"["+i+"]",res); }
      return;
    }
    if(x&&typeof x==="object"&&y&&typeof y==="object"){
      var keys={}; Object.keys(x).forEach(function(k){keys[k]=1;}); Object.keys(y).forEach(function(k){keys[k]=1;});
      Object.keys(keys).forEach(function(k){
        if(!(k in x)) res.push(path+"."+k+"：新增 "+JSON.stringify(y[k]));
        else if(!(k in y)) res.push(path+"."+k+"：删除 "+JSON.stringify(x[k]));
        else diff(x[k],y[k],path+"."+k,res);
      });
      return;
    }
    if(x!==y) res.push(path+"： "+JSON.stringify(x)+" → "+JSON.stringify(y));
  }
  function run(){
    var ta=a.value.trim(), tb=b.value.trim();
    if(!ta||!tb){ output.value=""; PHT.status(statusEl,""); return; }
    try{
      var res=[]; diff(JSON.parse(ta),JSON.parse(tb),"root",res);
      output.value=res.length?res.join("\\n"):"无差异";
      PHT.status(statusEl, res.length?res.length+" 处差异":"无差异","ok");
    }catch(e){ PHT.status(statusEl,"JSON 错误："+e.message,"error"); }
  }
  [a,b].forEach(function(el){ el.addEventListener("input",run); });
  run();
})();`
});

// ---------- 设计 ----------
const COLOR_STYLE = ".panel input[type=color]{width:60px;height:60px;padding:4px;border:1px solid var(--border);border-radius:10px;background:var(--surface-2);cursor:pointer}";

TOOLS.push({
  file: "contrast-checker.html",
  meta: { title: "对比度检查", desc: "计算前景与背景色的 WCAG 对比度，判断普通/大文本是否达到 AA、AAA 标准。", category: "design", tags: ["对比度", "wcag", "无障碍", "颜色"], order: 21 },
  style: COLOR_STYLE,
  body: `<div class="row" style="gap:18px;align-items:flex-start;flex-wrap:wrap">
  <div><label>背景色</label><input type="color" id="c1" value="#ffffff"></div>
  <div><label>前景色</label><input type="color" id="c2" value="#222222"></div>
</div>
<dl class="stat-row" style="margin-top:12px">
  <div class="stat"><dt>对比度</dt><dd id="ratio">-</dd></div>
  <div class="stat"><dt>普通文本 AA/AAA</dt><dd id="normal">-</dd></div>
  <div class="stat"><dt>大文本 AA/AAA</dt><dd id="large">-</dd></div>
</dl>
<div class="field" style="margin-top:12px"><label for="css">建议用法</label><input type="text" id="css" class="code" readonly></div>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var c1=$("#c1"), c2=$("#c2"), statusEl=$("#status");
  function hexToRgb(h){ h=h.replace(/^#/,""); if(h.length===3) h=h.split("").map(function(x){return x+x;}).join(""); return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]; }
  function f(c){ c/=255; return c<=0.03928? c/12.92: Math.pow((c+0.055)/1.055,2.4); }
  function lum(r,g,b){ return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b); }
  function run(){
    var a=hexToRgb(c1.value), b=hexToRgb(c2.value);
    var l1=lum(a[0],a[1],a[2]), l2=lum(b[0],b[1],b[2]);
    var hi=Math.max(l1,l2), lo=Math.min(l1,l2), r=(hi+0.05)/(lo+0.05);
    $("#ratio").textContent=r.toFixed(2)+":1";
    $("#normal").textContent=(r>=7?"AAA 通过":r>=4.5?"AA 通过":"未通过");
    $("#large").textContent=(r>=4.5?"AAA 通过":(r>=3?"AA 通过":"未通过"));
    $("#css").value="color: "+c2.value+"; background: "+c1.value+";";
    PHT.status(statusEl,"已计算","ok");
  }
  [c1,c2].forEach(function(el){ el.addEventListener("input",run); });
  run();
})();`
});

TOOLS.push({
  file: "font-stack.html",
  meta: { title: "字体栈生成", desc: "一键生成各平台与场景的 font-family 字体栈，含中文与等宽字体，复制即用。", category: "design", tags: ["字体", "font-family", "字体栈", "css"], order: 22 },
  body: `<div class="field"><label for="preset">预设</label><select id="preset">
  <option value="system">系统默认（推荐）</option>
  <option value="mac">macOS</option>
  <option value="win">Windows</option>
  <option value="safe">Web 安全</option>
  <option value="code">等宽代码</option>
</select></div>
<div class="field" style="margin-top:12px"><label style="display:block;margin-bottom:6px">预览</label><div id="preview" style="font-size:20px;padding:10px 12px;border:1px solid var(--border);border-radius:10px;background:var(--surface-2)">永和九年岁在癸丑暮春之初会于会稽山阴之兰亭</div></div>
<div class="field" style="margin-top:12px"><label for="output">CSS</label><textarea id="output" class="code" readonly></textarea></div>
<div class="actions">
  <button class="btn primary" id="copy" type="button">复制 CSS</button>
  <button class="btn ghost danger" id="clear" type="button">清空</button>
</div>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var sel=$("#preset"), output=$("#output"), statusEl=$("#status");
  var STACK={
    system:'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Microsoft YaHei", sans-serif',
    mac:'-apple-system, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", sans-serif',
    win:'"Segoe UI", Tahoma, Geneva, Verdana, "Microsoft YaHei", sans-serif',
    safe:'Arial, "Helvetica Neue", Helvetica, "PingFang SC", "Microsoft YaHei", sans-serif',
    code:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace'
  };
  function run(){ var css="font-family: "+STACK[sel.value]+";"; output.value=css; $("#preview").style.fontFamily=STACK[sel.value]; PHT.status(statusEl,"已生成","ok"); }
  sel.addEventListener("change",run);
  $("#copy").addEventListener("click",function(){ if(!output.value){PHT.status(statusEl,"无内容","error");return;} PHT.copy(output.value).then(function(ok){PHT.flash($("#copy"),"已复制");PHT.status(statusEl,ok?"已复制":"复制失败",ok?"ok":"error");}); });
  $("#clear").addEventListener("click",function(){ output.value=""; PHT.status(statusEl,""); });
  run();
})();`
});

TOOLS.push({
  file: "border-radius.html",
  meta: { title: "圆角生成器", desc: "分别调节四个角的圆角半径，实时预览并复制 CSS，适合卡片与头像。", category: "design", tags: ["border-radius", "圆角", "css", "卡片"], order: 23 },
  body: `<div class="row" style="gap:12px;flex-wrap:wrap">
  <div class="field" style="max-width:130px"><label>左上 <span id="vtl">12</span></label><input type="range" id="tl" min="0" max="100" value="12"></div>
  <div class="field" style="max-width:130px"><label>右上 <span id="vtr">12</span></label><input type="range" id="tr" min="0" max="100" value="12"></div>
  <div class="field" style="max-width:130px"><label>右下 <span id="vbr">12</span></label><input type="range" id="br" min="0" max="100" value="12"></div>
  <div class="field" style="max-width:130px"><label>左下 <span id="vbl">12</span></label><input type="range" id="bl" min="0" max="100" value="12"></div>
</div>
<div id="preview" style="width:120px;height:120px;margin:14px 0;background:var(--accent)"></div>
<div class="field"><label for="output">CSS</label><textarea id="output" class="code" readonly></textarea></div>
<div class="actions">
  <button class="btn primary" id="copy" type="button">复制 CSS</button>
  <button class="btn ghost danger" id="clear" type="button">清空</button>
</div>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$; var ids=["tl","tr","br","bl"]; var statusEl=$("#status");
  function run(){
    var v=ids.map(function(k){ return +$("#"+k).value; });
    ids.forEach(function(k,i){ $("#v"+k).textContent=v[i]; });
    var css="border-radius: "+v[0]+"px "+v[1]+"px "+v[2]+"px "+v[3]+"px;";
    $("#preview").style.borderRadius=v[0]+"px "+v[1]+"px "+v[2]+"px "+v[3]+"px";
    $("#output").value=css; PHT.status(statusEl,"已生成","ok");
  }
  ids.forEach(function(k){ $("#"+k).addEventListener("input",run); });
  $("#copy").addEventListener("click",function(){ if(!$("#output").value){PHT.status(statusEl,"无内容","error");return;} PHT.copy($("#output").value).then(function(ok){PHT.flash($("#copy"),"已复制");PHT.status(statusEl,ok?"已复制":"复制失败",ok?"ok":"error");}); });
  $("#clear").addEventListener("click",function(){ $("#output").value=""; PHT.status(statusEl,""); });
  run();
})();`
});

TOOLS.push({
  file: "text-shadow.html",
  meta: { title: "文字阴影生成", desc: "调节偏移、模糊与颜色，实时预览文字阴影并复制 CSS。", category: "design", tags: ["text-shadow", "阴影", "文字", "css"], order: 24 },
  body: `<div class="row" style="gap:12px;flex-wrap:wrap">
  <div class="field" style="max-width:150px"><label>X 偏移 <span id="vx">2</span>px</label><input type="range" id="x" min="-30" max="30" value="2"></div>
  <div class="field" style="max-width:150px"><label>Y 偏移 <span id="vy">2</span>px</label><input type="range" id="y" min="-30" max="30" value="2"></div>
  <div class="field" style="max-width:150px"><label>模糊 <span id="vb">4</span>px</label><input type="range" id="b" min="0" max="40" value="4"></div>
  <div class="field" style="max-width:120px"><label>颜色</label><input type="color" id="col" value="#000000"></div>
</div>
<div id="preview" style="font-size:34px;font-weight:700;margin:14px 0;color:#333">文字阴影示例</div>
<div class="field"><label for="output">CSS</label><textarea id="output" class="code" readonly></textarea></div>
<div class="actions">
  <button class="btn primary" id="copy" type="button">复制 CSS</button>
  <button class="btn ghost danger" id="clear" type="button">清空</button>
</div>
<p class="status" id="status" aria-live="polite"></p>`,
  style: COLOR_STYLE,
  script: `(function(){
  var $ = PHT.$; var statusEl=$("#status");
  function run(){
    var x=+$("#x").value, y=+$("#y").value, b=+$("#b").value, c=$("#col").value;
    $("#vx").textContent=x; $("#vy").textContent=y; $("#vb").textContent=b;
    var css="text-shadow: "+x+"px "+y+"px "+b+"px "+c+";";
    $("#preview").style.textShadow=x+"px "+y+"px "+b+"px "+c;
    $("#output").value=css; PHT.status(statusEl,"已生成","ok");
  }
  ["x","y","b","col"].forEach(function(k){ $("#"+k).addEventListener("input",run); });
  $("#copy").addEventListener("click",function(){ if(!$("#output").value){PHT.status(statusEl,"无内容","error");return;} PHT.copy($("#output").value).then(function(ok){PHT.flash($("#copy"),"已复制");PHT.status(statusEl,ok?"已复制":"复制失败",ok?"ok":"error");}); });
  $("#clear").addEventListener("click",function(){ $("#output").value=""; PHT.status(statusEl,""); });
  run();
})();`
});

TOOLS.push({
  file: "css-filter.html",
  meta: { title: "CSS 滤镜生成", desc: "调节模糊、亮度、对比度、灰度、褐色与色相，实时预览并复制 filter CSS。", category: "design", tags: ["filter", "滤镜", "css", "图片"], order: 25 },
  body: `<div class="row" style="gap:12px;flex-wrap:wrap">
  <div class="field" style="max-width:150px"><label>模糊 <span id="vb">0</span>px</label><input type="range" id="blur" min="0" max="20" value="0"></div>
  <div class="field" style="max-width:150px"><label>亮度 <span id="vbr">100</span>%</label><input type="range" id="bright" min="0" max="200" value="100"></div>
  <div class="field" style="max-width:150px"><label>对比度 <span id="vc">100</span>%</label><input type="range" id="contrast" min="0" max="200" value="100"></div>
  <div class="field" style="max-width:150px"><label>灰度 <span id="vg">0</span>%</label><input type="range" id="gray" min="0" max="100" value="0"></div>
  <div class="field" style="max-width:150px"><label>褐色 <span id="vs">0</span>%</label><input type="range" id="sepia" min="0" max="100" value="0"></div>
  <div class="field" style="max-width:150px"><label>色相 <span id="vh">0</span>deg</label><input type="range" id="hue" min="0" max="360" value="0"></div>
</div>
<div id="preview" style="height:120px;margin:14px 0;border-radius:10px;background:linear-gradient(135deg,#ff6e9c,#e0114b 60%,#3a7bd5)"></div>
<div class="field"><label for="output">CSS</label><textarea id="output" class="code" readonly></textarea></div>
<div class="actions">
  <button class="btn primary" id="copy" type="button">复制 CSS</button>
  <button class="btn ghost danger" id="clear" type="button">清空</button>
</div>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$; var statusEl=$("#status");
  function run(){
    var blur=+$("#blur").value, bright=+$("#bright").value, contrast=+$("#contrast").value, gray=+$("#gray").value, sepia=+$("#sepia").value, hue=+$("#hue").value;
    $("#vb").textContent=blur; $("#vbr").textContent=bright; $("#vc").textContent=contrast; $("#vg").textContent=gray; $("#vs").textContent=sepia; $("#vh").textContent=hue;
    var css="filter: blur("+blur+"px) brightness("+bright+"%) contrast("+contrast+"%) grayscale("+gray+"%) sepia("+sepia+"%) hue-rotate("+hue+"deg);";
    $("#preview").style.filter="blur("+blur+"px) brightness("+bright+"%) contrast("+contrast+"%) grayscale("+gray+"%) sepia("+sepia+"%) hue-rotate("+hue+"deg)";
    $("#output").value=css; PHT.status(statusEl,"已生成","ok");
  }
  ["blur","bright","contrast","gray","sepia","hue"].forEach(function(k){ $("#"+k).addEventListener("input",run); });
  $("#copy").addEventListener("click",function(){ if(!$("#output").value){PHT.status(statusEl,"无内容","error");return;} PHT.copy($("#output").value).then(function(ok){PHT.flash($("#copy"),"已复制");PHT.status(statusEl,ok?"已复制":"复制失败",ok?"ok":"error");}); });
  $("#clear").addEventListener("click",function(){ $("#output").value=""; PHT.status(statusEl,""); });
  run();
})();`
});

TOOLS.push({
  file: "button-generator.html",
  meta: { title: "按钮样式生成", desc: "调节背景、文字、圆角与内边距，实时预览按钮并复制可复用 CSS。", category: "design", tags: ["button", "按钮", "css", "样式"], order: 26 },
  body: `<div class="row" style="gap:12px;flex-wrap:wrap;align-items:flex-end">
  <div class="field" style="max-width:120px"><label>背景色</label><input type="color" id="bg" value="#3a7bd5"></div>
  <div class="field" style="max-width:120px"><label>文字色</label><input type="color" id="fg" value="#ffffff"></div>
  <div class="field" style="max-width:120px"><label>圆角 <span id="vr">8</span></label><input type="range" id="radius" min="0" max="30" value="8"></div>
  <div class="field" style="max-width:120px"><label>纵向内边距 <span id="vpy">10</span></label><input type="range" id="py" min="2" max="30" value="10"></div>
  <div class="field" style="max-width:120px"><label>横向内边距 <span id="vpx">20</span></label><input type="range" id="px" min="2" max="50" value="20"></div>
</div>
<div id="preview" style="margin:14px 0"><button id="demo" type="button" style="border:none;font-size:14px;cursor:pointer">示例按钮</button></div>
<div class="field"><label for="output">CSS</label><textarea id="output" class="code" readonly></textarea></div>
<div class="actions">
  <button class="btn primary" id="copy" type="button">复制 CSS</button>
  <button class="btn ghost danger" id="clear" type="button">清空</button>
</div>
<p class="status" id="status" aria-live="polite"></p>`,
  style: COLOR_STYLE,
  script: `(function(){
  var $ = PHT.$; var statusEl=$("#status");
  function run(){
    var bg=$("#bg").value, fg=$("#fg").value, r=+$("#radius").value, py=+$("#py").value, px=+$("#px").value;
    $("#vr").textContent=r; $("#vpy").textContent=py; $("#vpx").textContent=px;
    var d=$("#demo");
    d.style.background=bg; d.style.color=fg; d.style.borderRadius=r+"px"; d.style.padding=py+"px "+px+"px";
    $("#output").value=".my-btn{ background:"+bg+"; color:"+fg+"; border:none; border-radius:"+r+"px; padding:"+py+"px "+px+"px; font-size:14px; cursor:pointer; }";
    PHT.status(statusEl,"已生成","ok");
  }
  ["bg","fg","radius","py","px"].forEach(function(k){ $("#"+k).addEventListener("input",run); });
  $("#copy").addEventListener("click",function(){ if(!$("#output").value){PHT.status(statusEl,"无内容","error");return;} PHT.copy($("#output").value).then(function(ok){PHT.flash($("#copy"),"已复制");PHT.status(statusEl,ok?"已复制":"复制失败",ok?"ok":"error");}); });
  $("#clear").addEventListener("click",function(){ $("#output").value=""; PHT.status(statusEl,""); });
  run();
})();`
});

TOOLS.push({
  file: "glassmorphism.html",
  meta: { title: "毛玻璃效果", desc: "调节模糊、透明度、描边与圆角，生成玻璃拟态（Glassmorphism）卡片 CSS。", category: "design", tags: ["glassmorphism", "毛玻璃", "css", "卡片"], order: 27 },
  body: `<div class="row" style="gap:12px;flex-wrap:wrap">
  <div class="field" style="max-width:140px"><label>模糊 <span id="vb">10</span>px</label><input type="range" id="blur" min="0" max="40" value="10"></div>
  <div class="field" style="max-width:140px"><label>透明度 <span id="va">0.15</span></label><input type="range" id="alpha" min="0" max="1" step="0.05" value="0.15"></div>
  <div class="field" style="max-width:140px"><label>描边 <span id="vb2">1</span>px</label><input type="range" id="border" min="0" max="4" step="0.5" value="1"></div>
  <div class="field" style="max-width:140px"><label>圆角 <span id="vr">16</span>px</label><input type="range" id="radius" min="0" max="40" value="16"></div>
</div>
<div style="height:160px;margin:14px 0;border-radius:10px;background:linear-gradient(135deg,#3a7bd5,#e0114b);display:flex;align-items:center;justify-content:center"><div id="preview" style="width:200px;height:90px;color:#fff;display:flex;align-items:center;justify-content:center">Glass</div></div>
<div class="field"><label for="output">CSS</label><textarea id="output" class="code" readonly></textarea></div>
<div class="actions">
  <button class="btn primary" id="copy" type="button">复制 CSS</button>
  <button class="btn ghost danger" id="clear" type="button">清空</button>
</div>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$; var statusEl=$("#status");
  function run(){
    var b=+$("#blur").value, a=+$("#alpha").value, bd=+$("#border").value, r=+$("#radius").value;
    $("#vb").textContent=b; $("#va").textContent=a; $("#vb2").textContent=bd; $("#vr").textContent=r;
    var p=$("#preview");
    p.style.background="rgba(255,255,255,"+a+")"; p.style.backdropFilter="blur("+b+"px)"; p.style.webkitBackdropFilter="blur("+b+"px)"; p.style.border="1px solid rgba(255,255,255,"+(bd>0?0.4:0)+")"; p.style.borderRadius=r+"px";
    $("#output").value="background: rgba(255,255,255,"+a+"); backdrop-filter: blur("+b+"px); -webkit-backdrop-filter: blur("+b+"px); border: 1px solid rgba(255,255,255,0.4); border-radius: "+r+"px;";
    PHT.status(statusEl,"已生成","ok");
  }
  ["blur","alpha","border","radius"].forEach(function(k){ $("#"+k).addEventListener("input",run); });
  $("#copy").addEventListener("click",function(){ if(!$("#output").value){PHT.status(statusEl,"无内容","error");return;} PHT.copy($("#output").value).then(function(ok){PHT.flash($("#copy"),"已复制");PHT.status(statusEl,ok?"已复制":"复制失败",ok?"ok":"error");}); });
  $("#clear").addEventListener("click",function(){ $("#output").value=""; PHT.status(statusEl,""); });
  run();
})();`
});

TOOLS.push({
  file: "flexbox-generator.html",
  meta: { title: "Flexbox 生成", desc: "可视化选择主轴对齐、交叉轴对齐、方向与换行，实时预览并复制 flex 布局 CSS。", category: "design", tags: ["flexbox", "flex", "布局", "css"], order: 28 },
  body: `<div class="row" style="gap:12px;flex-wrap:wrap">
  <div class="field" style="max-width:180px"><label for="jc">主轴对齐 justify-content</label><select id="jc"><option>flex-start</option><option>center</option><option>flex-end</option><option>space-between</option><option>space-around</option><option>space-evenly</option></select></div>
  <div class="field" style="max-width:180px"><label for="ai">交叉轴对齐 align-items</label><select id="ai"><option>stretch</option><option>flex-start</option><option>center</option><option>flex-end</option></select></div>
  <div class="field" style="max-width:180px"><label for="fd">方向 flex-direction</label><select id="fd"><option>row</option><option>row-reverse</option><option>column</option><option>column-reverse</option></select></div>
  <div class="field" style="max-width:180px"><label for="fw">换行 flex-wrap</label><select id="fw"><option>nowrap</option><option>wrap</option><option>wrap-reverse</option></select></div>
</div>
<div id="preview" style="display:flex;gap:8px;min-height:120px;margin:14px 0;padding:10px;border:1px solid var(--border);border-radius:10px;background:var(--surface-2)"><span style="background:var(--accent);color:#fff;padding:12px 14px;border-radius:8px">1</span><span style="background:var(--accent);color:#fff;padding:12px 14px;border-radius:8px">2</span><span style="background:var(--accent);color:#fff;padding:12px 14px;border-radius:8px">3</span></div>
<div class="field"><label for="output">CSS</label><textarea id="output" class="code" readonly></textarea></div>
<div class="actions">
  <button class="btn primary" id="copy" type="button">复制 CSS</button>
  <button class="btn ghost danger" id="clear" type="button">清空</button>
</div>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$; var statusEl=$("#status");
  function run(){
    var jc=$("#jc").value, ai=$("#ai").value, fd=$("#fd").value, fw=$("#fw").value;
    var p=$("#preview"); p.style.justifyContent=jc; p.style.alignItems=ai; p.style.flexDirection=fd; p.style.flexWrap=fw;
    $("#output").value="display: flex; justify-content: "+jc+"; align-items: "+ai+"; flex-direction: "+fd+"; flex-wrap: "+fw+";";
    PHT.status(statusEl,"已生成","ok");
  }
  ["jc","ai","fd","fw"].forEach(function(k){ $("#"+k).addEventListener("change",run); });
  $("#copy").addEventListener("click",function(){ if(!$("#output").value){PHT.status(statusEl,"无内容","error");return;} PHT.copy($("#output").value).then(function(ok){PHT.flash($("#copy"),"已复制");PHT.status(statusEl,ok?"已复制":"复制失败",ok?"ok":"error");}); });
  $("#clear").addEventListener("click",function(){ $("#output").value=""; PHT.status(statusEl,""); });
  run();
})();`
});

TOOLS.push({
  file: "gradient-text.html",
  meta: { title: "渐变文字", desc: "把线性渐变填充到文字上（背景裁剪），调节颜色与角度并复制 CSS。", category: "design", tags: ["gradient", "渐变", "文字", "css"], order: 29 },
  body: `<div class="row" style="gap:12px;flex-wrap:wrap;align-items:flex-end">
  <div class="field" style="max-width:120px"><label>颜色 1</label><input type="color" id="c1" value="#ff6e9c"></div>
  <div class="field" style="max-width:120px"><label>颜色 2</label><input type="color" id="c2" value="#3a7bd5"></div>
  <div class="field" style="max-width:150px"><label>角度 <span id="va">90</span>°</label><input type="range" id="angle" min="0" max="360" value="90"></div>
</div>
<div id="preview" style="font-size:42px;font-weight:800;margin:14px 0">渐变文字效果</div>
<div class="field"><label for="output">CSS</label><textarea id="output" class="code" readonly></textarea></div>
<div class="actions">
  <button class="btn primary" id="copy" type="button">复制 CSS</button>
  <button class="btn ghost danger" id="clear" type="button">清空</button>
</div>
<p class="status" id="status" aria-live="polite"></p>`,
  style: COLOR_STYLE,
  script: `(function(){
  var $ = PHT.$; var statusEl=$("#status");
  function run(){
    var c1=$("#c1").value, c2=$("#c2").value, a=+$("#angle").value;
    $("#va").textContent=a;
    var css="background: linear-gradient("+a+"deg, "+c1+", "+c2+"); -webkit-background-clip: text; background-clip: text; color: transparent;";
    var p=$("#preview"); p.style.background="linear-gradient("+a+"deg, "+c1+", "+c2+")"; p.style.webkitBackgroundClip="text"; p.style.backgroundClip="text"; p.style.color="transparent";
    $("#output").value=css; PHT.status(statusEl,"已生成","ok");
  }
  ["c1","c2","angle"].forEach(function(k){ $("#"+k).addEventListener("input",run); });
  $("#copy").addEventListener("click",function(){ if(!$("#output").value){PHT.status(statusEl,"无内容","error");return;} PHT.copy($("#output").value).then(function(ok){PHT.flash($("#copy"),"已复制");PHT.status(statusEl,ok?"已复制":"复制失败",ok?"ok":"error");}); });
  $("#clear").addEventListener("click",function(){ $("#output").value=""; PHT.status(statusEl,""); });
  run();
})();`
});

TOOLS.push({
  file: "css-grid-pattern.html",
  meta: { title: "网格背景图案", desc: "生成网格线或圆点平铺背景，可调尺寸、间距与颜色，复制 CSS 背景代码。", category: "design", tags: ["grid", "背景", "图案", "css"], order: 30 },
  body: `<div class="row" style="gap:12px;flex-wrap:wrap;align-items:flex-end">
  <div class="field" style="max-width:140px"><label for="type">类型</label><select id="type"><option value="grid">网格线</option><option value="dots">圆点</option></select></div>
  <div class="field" style="max-width:140px"><label>尺寸 <span id="vs">24</span>px</label><input type="range" id="size" min="6" max="80" value="24"></div>
  <div class="field" style="max-width:120px"><label>颜色</label><input type="color" id="col" value="#cccccc"></div>
</div>
<div id="preview" style="height:140px;margin:14px 0;border-radius:10px;border:1px solid var(--border)"></div>
<div class="field"><label for="output">CSS</label><textarea id="output" class="code" readonly></textarea></div>
<div class="actions">
  <button class="btn primary" id="copy" type="button">复制 CSS</button>
  <button class="btn ghost danger" id="clear" type="button">清空</button>
</div>
<p class="status" id="status" aria-live="polite"></p>`,
  style: COLOR_STYLE,
  script: `(function(){
  var $ = PHT.$; var statusEl=$("#status");
  function run(){
    var type=$("#type").value, s=+$("#size").value, c=$("#col").value;
    $("#vs").textContent=s;
    var css;
    if(type==="grid"){
      css="background-image: linear-gradient("+c+" 1px, transparent 1px), linear-gradient(90deg, "+c+" 1px, transparent 1px); background-size: "+s+"px "+s+"px;";
    } else {
      css="background-image: radial-gradient("+c+" 1.5px, transparent 1.5px); background-size: "+s+"px "+s+"px;";
    }
    var p=$("#preview"); p.style.backgroundImage = type==="grid" ? "linear-gradient("+c+" 1px, transparent 1px), linear-gradient(90deg, "+c+" 1px, transparent 1px)" : "radial-gradient("+c+" 1.5px, transparent 1.5px)";
    p.style.backgroundSize=s+"px "+s+"px";
    $("#output").value=css; PHT.status(statusEl,"已生成","ok");
  }
  ["type","size","col"].forEach(function(k){ $("#"+k).addEventListener("input",run); $("#"+k).addEventListener("change",run); });
  $("#copy").addEventListener("click",function(){ if(!$("#output").value){PHT.status(statusEl,"无内容","error");return;} PHT.copy($("#output").value).then(function(ok){PHT.flash($("#copy"),"已复制");PHT.status(statusEl,ok?"已复制":"复制失败",ok?"ok":"error");}); });
  $("#clear").addEventListener("click",function(){ $("#output").value=""; PHT.status(statusEl,""); });
  run();
})();`
});

// ---------- 小工具 ----------
const SW_STYLE = ".sw{width:100%;height:80px;border-radius:10px;border:1px solid var(--border)}";

TOOLS.push({
  file: "stopwatch.html",
  meta: { title: "秒表", desc: "本地秒表，支持开始、暂停与重置，精确到百分之一秒。", category: "util", tags: ["秒表", "计时", "stopwatch"], order: 21 },
  body: `<div class="row" style="gap:14px;align-items:center">
  <div id="display" style="font-size:42px;font-variant-numeric:tabular-nums;font-family:var(--mono)">00:00.00</div>
</div>
<div class="actions">
  <button class="btn primary" id="start" type="button">开始</button>
  <button class="btn" id="stop" type="button">暂停</button>
  <button class="btn" id="reset" type="button">重置</button>
</div>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var display=$("#display"), statusEl=$("#status");
  var startTs=null, elapsed=0, timer=null, running=false;
  function fmt(ms){ var m=Math.floor(ms/60000), s=Math.floor((ms%60000)/1000), cs=Math.floor((ms%1000)/10); return ("0"+m).slice(-2)+":"+("0"+s).slice(-2)+"."+("0"+cs).slice(-2); }
  function tick(){ display.textContent=fmt(elapsed + (running?Date.now()-startTs:0)); }
  function startT(){ if(running) return; running=true; startTs=Date.now(); timer=setInterval(tick,30); PHT.status(statusEl,"计时中","ok"); }
  function stopT(){ if(!running) return; elapsed+=Date.now()-startTs; running=false; clearInterval(timer); tick(); PHT.status(statusEl,"已暂停"); }
  function resetT(){ running=false; clearInterval(timer); elapsed=0; display.textContent=fmt(0); PHT.status(statusEl,""); }
  $("#start").addEventListener("click",startT);
  $("#stop").addEventListener("click",stopT);
  $("#reset").addEventListener("click",resetT);
})();`
});

TOOLS.push({
  file: "countdown.html",
  meta: { title: "倒计时", desc: "设定一个目标时间，实时显示剩余的天、时、分、秒，到点提示。", category: "util", tags: ["倒计时", "countdown", "提醒"], order: 22 },
  body: `<div class="field"><label for="target">目标时间</label><input type="datetime-local" id="target"></div>
<div class="actions" style="margin-top:10px">
  <button class="btn primary" id="start" type="button">开始</button>
  <button class="btn" id="stop" type="button">停止</button>
</div>
<div id="display" style="font-size:34px;font-variant-numeric:tabular-nums;font-family:var(--mono);margin-top:14px">--:--:--:--</div>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var target=$("#target"), display=$("#display"), statusEl=$("#status"), timer=null;
  function pad(n){ return ("0"+n).slice(-2); }
  function tick(){
    var t=new Date(target.value).getTime(); if(isNaN(t)){ return; }
    var d=t-Date.now();
    if(d<=0){ display.textContent="时间到！"; clearInterval(timer); PHT.status(statusEl,"时间到！","ok"); return; }
    var day=Math.floor(d/86400000), h=Math.floor(d%86400000/3600000), m=Math.floor(d%3600000/60000), s=Math.floor(d%60000/1000);
    display.textContent=pad(day)+":"+pad(h)+":"+pad(m)+":"+pad(s);
  }
  function startT(){ if(!target.value){ PHT.status(statusEl,"请先选择目标时间","error"); return; } clearInterval(timer); tick(); timer=setInterval(tick,1000); PHT.status(statusEl,"倒计时中","ok"); }
  $("#start").addEventListener("click",startT);
  $("#stop").addEventListener("click",function(){ clearInterval(timer); PHT.status(statusEl,"已停止"); });
})();`
});

TOOLS.push({
  file: "world-clock.html",
  meta: { title: "世界时钟", desc: "同时显示多个时区的当前时间，使用本地 Intl 计算，无需联网。", category: "util", tags: ["时钟", "时区", "world", "时间"], order: 23 },
  body: `<dl class="stat-row" id="clocks" style="margin-top:4px"></dl>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var host=$("#clocks"), statusEl=$("#status");
  var ZONES=[["本地",Intl.DateTimeFormat().resolvedOptions().timeZone],["UTC","UTC"],["北京","Asia/Shanghai"],["纽约","America/New_York"],["伦敦","Europe/London"],["东京","Asia/Tokyo"]];
  ZONES.forEach(function(z){ var d=document.createElement("div"); d.className="stat"; d.innerHTML='<dt>'+z[0]+'</dt><dd id="z-'+z[0]+'">-</dd>'; host.appendChild(d); });
  function tick(){
    ZONES.forEach(function(z){
      var el=document.getElementById("z-"+z[0]); if(!el) return;
      try{ el.textContent=new Intl.DateTimeFormat("zh-CN",{timeZone:z[1],hour12:false,weekday:"short",hour:"2-digit",minute:"2-digit",second:"2-digit"}).format(new Date()); }
      catch(e){ el.textContent="不支持"; }
    });
  }
  tick(); setInterval(tick,1000);
})();`
});

TOOLS.push({
  file: "pomodoro.html",
  meta: { title: "番茄钟", desc: "经典的 25 分钟专注 + 5 分钟休息计时，可开始、暂停与重置。", category: "util", tags: ["番茄钟", "pomodoro", "专注", "计时"], order: 24 },
  body: `<div id="display" style="font-size:48px;font-variant-numeric:tabular-nums;font-family:var(--mono);text-align:center">25:00</div>
<div id="phase" style="text-align:center;color:var(--muted);margin:6px 0">专注</div>
<div class="actions" style="justify-content:center">
  <button class="btn primary" id="start" type="button">开始</button>
  <button class="btn" id="pause" type="button">暂停</button>
  <button class="btn" id="reset" type="button">重置</button>
</div>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var display=$("#display"), phase=$("#phase"), statusEl=$("#status");
  var WORK=25*60, BREAK=5*60, left=WORK, mode="work", running=false, timer=null;
  function fmt(s){ return ("0"+Math.floor(s/60)).slice(-2)+":"+("0"+s%60).slice(-2); }
  function show(){ display.textContent=fmt(left); phase.textContent=mode==="work"?"专注":"休息"; }
  function tick(){
    left--; if(left<0){ mode=mode==="work"?"break":"work"; left=mode==="work"?WORK:BREAK; PHT.status(statusEl, mode==="work"?"开始专注":"开始休息","ok"); }
    show();
  }
  function startT(){ if(running) return; running=true; clearInterval(timer); timer=setInterval(tick,1000); PHT.status(statusEl,"进行中","ok"); }
  $("#start").addEventListener("click",startT);
  $("#pause").addEventListener("click",function(){ running=false; clearInterval(timer); PHT.status(statusEl,"已暂停"); });
  $("#reset").addEventListener("click",function(){ running=false; clearInterval(timer); mode="work"; left=WORK; show(); PHT.status(statusEl,""); });
  show();
})();`
});

TOOLS.push({
  file: "notepad.html",
  meta: { title: "草稿本", desc: "简单便签，内容自动保存到浏览器本地（localStorage），刷新不丢失。", category: "util", tags: ["便签", "草稿", "notepad", "本地"], order: 25 },
  body: `<div class="field"><label for="note">内容（自动保存）</label><textarea id="note" class="code" spellcheck="false" placeholder="随手记点什么…" style="min-height:220px"></textarea></div>
<div class="actions">
  <button class="btn" id="clear" type="button">清空</button>
  <button class="btn" id="copy" type="button">复制</button>
</div>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var note=$("#note"), statusEl=$("#status");
  try{ var saved=localStorage.getItem("pht-notepad"); if(saved!=null) note.value=saved; }catch(e){}
  note.addEventListener("input",function(){ try{ localStorage.setItem("pht-notepad",note.value); }catch(e){} PHT.status(statusEl,"已保存","ok"); });
  $("#clear").addEventListener("click",function(){ note.value=""; try{ localStorage.removeItem("pht-notepad"); }catch(e){} PHT.status(statusEl,"已清空"); });
  $("#copy").addEventListener("click",function(){ if(!note.value){PHT.status(statusEl,"没有内容","error");return;} PHT.copy(note.value).then(function(ok){PHT.flash($("#copy"),"已复制");PHT.status(statusEl,ok?"已复制":"复制失败",ok?"ok":"error");}); });
})();`
});

TOOLS.push({
  file: "fake-data.html",
  meta: { title: "假数据生成", desc: "一键生成姓名、用户名、邮箱、电话等示例数据，方便填充表单与演示。", category: "util", tags: ["假数据", "mock", "示例", "生成"], order: 26 },
  body: `<div class="row" style="gap:14px;flex-wrap:wrap;align-items:center">
  <label class="chk"><input type="checkbox" id="optName" checked> 姓名</label>
  <label class="chk"><input type="checkbox" id="optUser" checked> 用户名</label>
  <label class="chk"><input type="checkbox" id="optEmail" checked> 邮箱</label>
  <label class="chk"><input type="checkbox" id="optPhone" checked> 手机</label>
  <label class="chk"><input type="checkbox" id="optId"> 身份证</label>
</div>
<div class="actions" style="margin-top:12px">
  <button class="btn primary" id="gen" type="button">生成</button>
  <button class="btn" id="copy" type="button">复制</button>
</div>
<div class="field" style="margin-top:12px"><label for="output">结果</label><textarea id="output" class="code" readonly></textarea></div>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var statusEl=$("#status");
  var XING=["王","李","张","刘","陈","杨","赵","黄","周","吴"], MING=["伟","芳","娜","秀英","敏","静","丽","强","磊","洋","勇","艳"];
  var ADJ=["happy","cool","little","blue","smart","tiny","lucky","brave"], NOUN=["tiger","river","moon","star","cloud","fox","maple","stone"];
  function pick(a){ return a[Math.floor(Math.random()*a.length)]; }
  function run(){
    var lines=[];
    if($("#optName").checked) lines.push("姓名："+pick(XING)+pick(MING));
    if($("#optUser").checked) lines.push("用户名："+pick(ADJ)+"_"+pick(NOUN)+Math.floor(Math.random()*90+10));
    if($("#optEmail").checked) lines.push("邮箱："+pick(ADJ)+pick(NOUN)+Math.floor(Math.random()*900+100)+"@example.com");
    if($("#optPhone").checked) lines.push("手机：1"+pick(["3","5","7","8","9"])+Math.floor(Math.random()*1e9).toString().padStart(9,"0"));
    if($("#optId").checked){ var y=19+Math.floor(Math.random()*30); lines.push("身份证："+y+("0"+Math.floor(Math.random()*12+1)).slice(-2)+("0"+Math.floor(Math.random()*28+1)).slice(-2)+Math.floor(Math.random()*1e3).toString().padStart(3,"0")+Math.floor(Math.random()*1e4).toString().padStart(4,"0")); }
    $("#output").value=lines.join("\\n");
    PHT.status(statusEl,"已生成","ok");
  }
  $("#gen").addEventListener("click",run);
  [$("#optName"),$("#optUser"),$("#optEmail"),$("#optPhone"),$("#optId")].forEach(function(el){ el.addEventListener("change",run); });
  $("#copy").addEventListener("click",function(){ if(!$("#output").value){PHT.status(statusEl,"没有内容","error");return;} PHT.copy($("#output").value).then(function(ok){PHT.flash($("#copy"),"已复制");PHT.status(statusEl,ok?"已复制":"复制失败",ok?"ok":"error");}); });
  run();
})();`
});

TOOLS.push({
  file: "username-generator.html",
  meta: { title: "用户名生成", desc: "组合形容词、名词与数字生成可用用户名，支持分隔符与大小写。", category: "util", tags: ["用户名", "username", "生成", "昵称"], order: 27 },
  body: `<div class="row" style="gap:12px;flex-wrap:wrap;align-items:flex-end">
  <div class="field" style="max-width:140px"><label for="count">数量</label><input type="number" id="count" value="5" min="1" max="20"></div>
  <div class="field" style="max-width:140px"><label for="sep">分隔符</label><select id="sep"><option value="">无</option><option value="_" selected>_</option><option value=".">.</option><option value="-">-</option></select></div>
  <label class="chk" style="align-self:flex-end;padding-bottom:8px"><input type="checkbox" id="cap" checked> 首字母大写</label>
</div>
<div class="field" style="margin-top:12px"><label for="output">结果</label><textarea id="output" class="code" readonly></textarea></div>
<div class="actions">
  <button class="btn primary" id="gen" type="button">生成</button>
  <button class="btn" id="copy" type="button">复制</button>
</div>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var statusEl=$("#status");
  var ADJ=["happy","cool","little","blue","smart","tiny","lucky","brave","swift","calm","wild","golden"], NOUN=["tiger","river","moon","star","cloud","fox","maple","stone","wolf","ocean","pine","ember"];
  function pick(a){ return a[Math.floor(Math.random()*a.length)]; }
  function cap(s){ return s.charAt(0).toUpperCase()+s.slice(1); }
  function run(){
    var n=parseInt($("#count").value,10)||1; if(n>50) n=50;
    var sep=$("#sep").value, cp=$("#cap").checked, out=[];
    for(var i=0;i<n;i++){ var a=pick(ADJ), b=pick(NOUN), s=cp?cap(a)+sep+cap(b):a+sep+b; s+=Math.floor(Math.random()*90+10); out.push(s); }
    $("#output").value=out.join("\\n");
    PHT.status(statusEl,"已生成","ok");
  }
  ["count","sep","cap"].forEach(function(k){ $("#"+k).addEventListener("input",run); $("#"+k).addEventListener("change",run); });
  $("#gen").addEventListener("click",run);
  $("#copy").addEventListener("click",function(){ if(!$("#output").value){PHT.status(statusEl,"没有内容","error");return;} PHT.copy($("#output").value).then(function(ok){PHT.flash($("#copy"),"已复制");PHT.status(statusEl,ok?"已复制":"复制失败",ok?"ok":"error");}); });
  run();
})();`
});

TOOLS.push({
  file: "decision-wheel.html",
  meta: { title: "决策转盘", desc: "把选项一行一个填进去，转盘随机帮你做决定，适合吃饭、抽签等场景。", category: "util", tags: ["转盘", "决策", "随机", "抽签"], order: 28 },
  body: `<div class="field"><label for="list">选项（每行一个）</label><textarea id="list" class="code" spellcheck="false" placeholder="选项 A&#10;选项 B&#10;选项 C"></textarea></div>
<div class="field" style="margin-top:12px"><label for="result">结果</label><input type="text" id="result" class="code" readonly></div>
<div class="actions">
  <button class="btn primary" id="spin" type="button">转一下</button>
  <button class="btn" id="copy" type="button">复制结果</button>
</div>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var list=$("#list"), result=$("#result"), statusEl=$("#status");
  function items(){ return list.value.split(/\\r?\\n/).map(function(s){return s.trim();}).filter(Boolean); }
  $("#spin").addEventListener("click",function(){
    var arr=items(); if(arr.length===0){ PHT.status(statusEl,"请先填写选项","error"); return; }
    var i=0, steps=20+Math.floor(Math.random()*10), pickIdx=Math.floor(Math.random()*arr.length), ticks=0, timer=setInterval(function(){
      result.value=arr[i%arr.length]; i++; ticks++;
      if(ticks>=steps){ clearInterval(timer); result.value=arr[pickIdx]; PHT.status(statusEl,"选定："+arr[pickIdx],"ok"); }
    },60);
    PHT.status(statusEl,"转动中…","ok");
  });
  $("#copy").addEventListener("click",function(){ if(!result.value){PHT.status(statusEl,"没有结果","error");return;} PHT.copy(result.value).then(function(ok){PHT.flash($("#copy"),"已复制");PHT.status(statusEl,ok?"已复制":"复制失败",ok?"ok":"error");}); });
})();`
});

TOOLS.push({
  file: "list-picker.html",
  meta: { title: "随机挑选", desc: "从一列选项中随机抽取一个，可选抽取后自动移除（不重复）。", category: "util", tags: ["随机", "挑选", "picker", "抽取"], order: 29 },
  body: `<div class="field"><label for="list">候选项（每行一个）</label><textarea id="list" class="code" spellcheck="false" placeholder="Alice&#10;Bob&#10;Carol"></textarea></div>
<div class="row" style="gap:14px;flex-wrap:wrap;align-items:center;margin-top:10px">
  <label class="chk"><input type="checkbox" id="remove"> 抽取后移除</label>
</div>
<div class="field" style="margin-top:12px"><label for="result">结果</label><input type="text" id="result" class="code" readonly></div>
<div class="actions">
  <button class="btn primary" id="pick" type="button">抽取</button>
  <button class="btn" id="copy" type="button">复制结果</button>
</div>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var list=$("#list"), result=$("#result"), statusEl=$("#status");
  $("#pick").addEventListener("click",function(){
    var arr=list.value.split(/\\r?\\n/).map(function(s){return s.trim();}).filter(Boolean);
    if(arr.length===0){ PHT.status(statusEl,"没有候选项","error"); return; }
    var idx=Math.floor(Math.random()*arr.length), chosen=arr[idx];
    if($("#remove").checked){ arr.splice(idx,1); list.value=arr.join("\\n"); }
    result.value=chosen; PHT.status(statusEl,"已抽取","ok");
  });
  $("#copy").addEventListener("click",function(){ if(!result.value){PHT.status(statusEl,"没有结果","error");return;} PHT.copy(result.value).then(function(ok){PHT.flash($("#copy"),"已复制");PHT.status(statusEl,ok?"已复制":"复制失败",ok?"ok":"error");}); });
})();`
});

TOOLS.push({
  file: "timezone-converter.html",
  meta: { title: "时区转换", desc: "将某时区的时间换算到另一时区，基于本地 Intl，支持常见城市时区。", category: "util", tags: ["时区", "timezone", "转换", "时间"], order: 30 },
  body: `<div class="field"><label for="dt">时间</label><input type="datetime-local" id="dt"></div>
<div class="row" style="gap:12px;flex-wrap:wrap;align-items:flex-end;margin-top:10px">
  <div class="field" style="max-width:220px"><label for="from">源时区</label><select id="from"><option value="Asia/Shanghai">北京</option><option value="UTC">UTC</option><option value="America/New_York">纽约</option><option value="Europe/London">伦敦</option><option value="Asia/Tokyo">东京</option></select></div>
  <div class="field" style="max-width:220px"><label for="to">目标时区</label><select id="to"><option value="UTC">UTC</option><option value="Asia/Shanghai">北京</option><option value="America/New_York">纽约</option><option value="Europe/London">伦敦</option><option value="Asia/Tokyo">东京</option></select></div>
</div>
<div class="field" style="margin-top:12px"><label for="output">转换结果</label><input type="text" id="output" class="code" readonly></div>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var dt=$("#dt"), from=$("#from"), to=$("#to"), output=$("#output"), statusEl=$("#status");
  function run(){
    if(!dt.value){ output.value=""; PHT.status(statusEl,""); return; }
    try{
      var d=new Date(dt.value); if(isNaN(d.getTime())){ PHT.status(statusEl,"时间无效","error"); return; }
      var s=new Intl.DateTimeFormat("zh-CN",{timeZone:to.value,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:false}).format(d).replace(/\\//g,"-");
      output.value=s+"（"+to.options[to.selectedIndex].textContent+"）";
      PHT.status(statusEl,"已转换","ok");
    }catch(e){ PHT.status(statusEl,"转换失败："+e.message,"error"); }
  }
  [dt,from,to].forEach(function(el){ el.addEventListener("input",run); el.addEventListener("change",run); });
  run();
})();`
});

TOOLS.push({
  file: "random-color.html",
  meta: { title: "随机颜色", desc: "生成随机 HEX 颜色并预览，可复制 HEX / RGB，方便做配色灵感。", category: "util", tags: ["颜色", "随机", "hex", "配色"], order: 31 },
  style: SW_STYLE,
  body: `<div class="sw" id="sw"></div>
<div class="row" style="gap:12px;flex-wrap:wrap;align-items:flex-end;margin-top:12px">
  <div class="field" style="max-width:160px"><label for="hex">HEX</label><input type="text" id="hex" class="code" readonly></div>
  <div class="field" style="max-width:200px"><label for="rgb">RGB</label><input type="text" id="rgb" class="code" readonly></div>
</div>
<div class="actions">
  <button class="btn primary" id="gen" type="button">生成</button>
  <button class="btn" id="copyHex" type="button">复制 HEX</button>
  <button class="btn" id="copyRgb" type="button">复制 RGB</button>
</div>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var sw=$("#sw"), hex=$("#hex"), rgb=$("#rgb"), statusEl=$("#status");
  function gen(){
    var r=Math.floor(Math.random()*256), g=Math.floor(Math.random()*256), b=Math.floor(Math.random()*256);
    var h="#"+[r,g,b].map(function(x){return ("0"+x.toString(16)).slice(-2);}).join("");
    sw.style.background=h; hex.value=h; rgb.value="rgb("+r+", "+g+", "+b+")";
    PHT.status(statusEl,"已生成","ok");
  }
  $("#gen").addEventListener("click",gen);
  $("#copyHex").addEventListener("click",function(){ PHT.copy(hex.value).then(function(ok){PHT.flash($("#copyHex"),"已复制");PHT.status(statusEl,ok?"已复制":"复制失败",ok?"ok":"error");}); });
  $("#copyRgb").addEventListener("click",function(){ PHT.copy(rgb.value).then(function(ok){PHT.flash($("#copyRgb"),"已复制");PHT.status(statusEl,ok?"已复制":"复制失败",ok?"ok":"error");}); });
  gen();
})();`
});

TOOLS.push({
  file: "passphrase.html",
  meta: { title: "密码短语生成", desc: "用随机单词拼出易记又强壮的密码短语（类 Diceware），可设词数与分隔符。", category: "util", tags: ["密码短语", "passphrase", "diceware", "密码"], order: 32 },
  body: `<div class="row" style="gap:12px;flex-wrap:wrap;align-items:flex-end">
  <div class="field" style="max-width:140px"><label for="words">词数</label><input type="number" id="words" value="4" min="2" max="12"></div>
  <div class="field" style="max-width:140px"><label for="sep">分隔符</label><select id="sep"><option value=" ">空格</option><option value="-">-</option><option value=".">.</option><option value="_">_</option></select></div>
  <label class="chk" style="align-self:flex-end;padding-bottom:8px"><input type="checkbox" id="cap"> 首字母大写</label>
</div>
<div class="field" style="margin-top:12px"><label for="output">结果</label><input type="text" id="output" class="code" readonly></div>
<div class="actions">
  <button class="btn primary" id="gen" type="button">生成</button>
  <button class="btn" id="copy" type="button">复制</button>
</div>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var statusEl=$("#status");
  var WORDS=["apple","river","tiger","ocean","cloud","maple","stone","fox","moon","star","wind","leaf","iron","snow","flame","river","bridge","mountain","shadow","light","river","compass","harbor","meadow","thunder","crystal","raven","willow","ember","frost"];
  function pick(){ return WORDS[Math.floor(Math.random()*WORDS.length)]; }
  function run(){
    var n=parseInt($("#words").value,10)||4; if(n>12) n=12;
    var sep=$("#sep").value, cp=$("#cap").checked, arr=[];
    for(var i=0;i<n;i++){ var w=pick(); arr.push(cp?w.charAt(0).toUpperCase()+w.slice(1):w); }
    $("#output").value=arr.join(sep);
    PHT.status(statusEl,"已生成","ok");
  }
  ["words","sep","cap"].forEach(function(k){ $("#"+k).addEventListener("input",run); $("#"+k).addEventListener("change",run); });
  $("#gen").addEventListener("click",run);
  $("#copy").addEventListener("click",function(){ if(!$("#output").value){PHT.status(statusEl,"没有内容","error");return;} PHT.copy($("#output").value).then(function(ok){PHT.flash($("#copy"),"已复制");PHT.status(statusEl,ok?"已复制":"复制失败",ok?"ok":"error");}); });
  run();
})();`
});

TOOLS.push({
  file: "team-splitter.html",
  meta: { title: "随机分组", desc: "把一份名单随机分成若干组，适合课堂、活动与团建分队。", category: "util", tags: ["分组", "随机", "名单", "团队"], order: 33 },
  body: `<div class="field"><label for="names">名单（每行一人）</label><textarea id="names" class="code" spellcheck="false" placeholder="张三&#10;李四&#10;王五"></textarea></div>
<div class="row" style="gap:12px;flex-wrap:wrap;align-items:flex-end;margin-top:10px">
  <div class="field" style="max-width:140px"><label for="groups">组数</label><input type="number" id="groups" value="2" min="1" max="20"></div>
</div>
<div class="field" style="margin-top:12px"><label for="output">分组结果</label><textarea id="output" class="code" readonly></textarea></div>
<div class="actions">
  <button class="btn primary" id="split" type="button">分组</button>
  <button class="btn" id="copy" type="button">复制</button>
</div>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var statusEl=$("#status");
  function shuffle(a){ for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i]; a[i]=a[j]; a[j]=t; } return a; }
  function run(){
    var arr=names.value.split(/\\r?\\n/).map(function(s){return s.trim();}).filter(Boolean);
    var g=parseInt($("#groups").value,10)||1; if(g>arr.length) g=arr.length;
    var buckets=[]; for(var i=0;i<g;i++) buckets.push([]);
    shuffle(arr).forEach(function(n,i){ buckets[i%g].push(n); });
    $("#output").value=buckets.map(function(b,idx){ return "第"+(idx+1)+"组："+b.join("、"); }).join("\\n");
    PHT.status(statusEl,"已分组为 "+g+" 组","ok");
  }
  var names=$("#names");
  $("#split").addEventListener("click",run);
  ["names","groups"].forEach(function(k){ $("#"+k).addEventListener("input",run); });
  $("#copy").addEventListener("click",function(){ if(!$("#output").value){PHT.status(statusEl,"没有内容","error");return;} PHT.copy($("#output").value).then(function(ok){PHT.flash($("#copy"),"已复制");PHT.status(statusEl,ok?"已复制":"复制失败",ok?"ok":"error");}); });
})();`
});

TOOLS.push({
  file: "lottery-draw.html",
  meta: { title: "抽奖抽签", desc: "从名单中随机抽取若干名中奖者，自动去重不重复，适合活动抽奖。", category: "util", tags: ["抽奖", "抽签", "随机", "中奖"], order: 34 },
  body: `<div class="field"><label for="items">候选名单（每行一个）</label><textarea id="items" class="code" spellcheck="false" placeholder="参与者1&#10;参与者2"></textarea></div>
<div class="row" style="gap:12px;flex-wrap:wrap;align-items:flex-end;margin-top:10px">
  <div class="field" style="max-width:140px"><label for="winners">中奖人数</label><input type="number" id="winners" value="1" min="1" max="50"></div>
</div>
<div class="field" style="margin-top:12px"><label for="output">中奖结果</label><textarea id="output" class="code" readonly></textarea></div>
<div class="actions">
  <button class="btn primary" id="draw" type="button">开奖</button>
  <button class="btn" id="copy" type="button">复制</button>
</div>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var statusEl=$("#status");
  function run(){
    var arr=items.value.split(/\\r?\\n/).map(function(s){return s.trim();}).filter(Boolean);
    var k=parseInt($("#winners").value,10)||1;
    if(k>arr.length) k=arr.length;
    var pool=arr.slice(), out=[];
    for(var i=0;i<k;i++){ var idx=Math.floor(Math.random()*pool.length); out.push(pool.splice(idx,1)[0]); }
    $("#output").value=out.join("\\n");
    PHT.status(statusEl,"已抽出 "+out.length+" 名","ok");
  }
  var items=$("#items");
  $("#draw").addEventListener("click",run);
  ["items","winners"].forEach(function(el){ $("#"+el).addEventListener("input",run); });
  $("#copy").addEventListener("click",function(){ if(!$("#output").value){PHT.status(statusEl,"没有内容","error");return;} PHT.copy($("#output").value).then(function(ok){PHT.flash($("#copy"),"已复制");PHT.status(statusEl,ok?"已复制":"复制失败",ok?"ok":"error");}); });
})();`
});

// ---------- 计算 ----------
TOOLS.push({
  file: "bmi-calculator.html",
  meta: { title: "BMI 计算器", desc: "输入身高与体重，立即算出 BMI 与对应分类（偏瘦 / 正常 / 超重 / 肥胖），帮助你了解体重状况。", category: "calc", tags: ["BMI", "体重", "身高", "健康"], order: 1 },
  body: `<div class="grid-2">
  <div class="field"><label for="height">身高 (cm)</label><input type="number" id="height" value="170" min="1" step="0.1"></div>
  <div class="field"><label for="weight">体重 (kg)</label><input type="number" id="weight" value="60" min="1" step="0.1"></div>
</div>
<dl class="stat-row" style="margin-top:16px">
  <div class="stat"><dt>BMI</dt><dd id="bmiOut">-</dd></div>
  <div class="stat"><dt>分类</dt><dd id="catOut">-</dd></div>
</dl>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var statusEl=$("#status");
  function run(){
    var h=parseFloat($("#height").value), w=parseFloat($("#weight").value);
    if(!(h>0)||!(w>0)){ $("#bmiOut").textContent="-"; $("#catOut").textContent="-"; PHT.status(statusEl,"请输入有效身高与体重"); return; }
    var m=h/100; var bmi=w/(m*m);
    var cat = bmi<18.5?"偏瘦": bmi<24?"正常": bmi<28?"超重":"肥胖";
    $("#bmiOut").textContent=bmi.toFixed(1);
    $("#catOut").textContent=cat;
    PHT.status(statusEl,"计算完成","ok");
  }
  ["height","weight"].forEach(function(k){ $("#"+k).addEventListener("input",run); });
  run();
})();`
});

TOOLS.push({
  file: "loan-calculator.html",
  meta: { title: "贷款计算器", desc: "按等额本息或等额本金估算每月还款、总利息与还款总额，输入年利率与期限即可。", category: "calc", tags: ["贷款", "月供", "利息", "房贷"], order: 2 },
  body: `<div class="grid-2">
  <div class="field"><label for="principal">贷款本金 (元)</label><input type="number" id="principal" value="1000000" min="0" step="any"></div>
  <div class="field"><label for="rate">年利率 (%)</label><input type="number" id="rate" value="4.9" min="0" step="any"></div>
  <div class="field"><label for="years">期限 (年)</label><input type="number" id="years" value="30" min="1" step="any"></div>
  <div class="field"><label for="method">还款方式</label><select id="method"><option value="equal">等额本息</option><option value="principal">等额本金</option></select></div>
</div>
<dl class="stat-row" style="margin-top:16px">
  <div class="stat"><dt id="mLabel">月供</dt><dd id="monthly">-</dd></div>
  <div class="stat"><dt>总利息</dt><dd id="interest">-</dd></div>
  <div class="stat"><dt>总还款</dt><dd id="total">-</dd></div>
</dl>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var statusEl=$("#status");
  function fmt(n){ return Math.round(n).toLocaleString("zh-CN")+" 元"; }
  function run(){
    var P=parseFloat($("#principal").value), r=parseFloat($("#rate").value), y=parseFloat($("#years").value);
    if(!(P>=0)||!(r>=0)||!(y>0)){ PHT.status(statusEl,"请输入有效数值"); return; }
    var rm=r/100/12, n=y*12, monthly, interest, total;
    if($("#method").value==="principal"){
      var mp=P/n, first=mp+P*rm;
      interest=P*rm*(n+1)/2; total=P+interest;
      monthly="首月 "+fmt(first)+"（逐月递减）";
      $("#mLabel").textContent="首月月供";
    } else {
      monthly = rm===0 ? P/n : P*rm*Math.pow(1+rm,n)/(Math.pow(1+rm,n)-1);
      total=monthly*n; interest=total-P;
      monthly=fmt(monthly);
      $("#mLabel").textContent="月供";
    }
    $("#monthly").textContent=monthly;
    $("#interest").textContent=fmt(interest);
    $("#total").textContent=fmt(total);
    PHT.status(statusEl,"计算完成","ok");
  }
  ["principal","rate","years","method"].forEach(function(k){ $("#"+k).addEventListener("input",run); $("#"+k).addEventListener("change",run); });
  run();
})();`
});

TOOLS.push({
  file: "tip-calculator.html",
  meta: { title: "小费计算器", desc: "输入账单金额、小费率与人数，自动拆分每人应付的小费与总额，聚会 AA 不再算错。", category: "calc", tags: ["小费", "分摊", "AA", "聚餐"], order: 3 },
  body: `<div class="grid-2">
  <div class="field"><label for="bill">账单金额 (元)</label><input type="number" id="bill" value="200" min="0" step="any"></div>
  <div class="field"><label for="tipPct">小费率 (%)</label><input type="number" id="tipPct" value="15" min="0" step="any"></div>
  <div class="field"><label for="people">人数</label><input type="number" id="people" value="2" min="1" step="1"></div>
  <div class="field"><label class="chk"><input type="checkbox" id="roundUp"> 总额向上取整到元</label></div>
</div>
<dl class="stat-row" style="margin-top:16px">
  <div class="stat"><dt>小费总额</dt><dd id="tipTotal">-</dd></div>
  <div class="stat"><dt>每人小费</dt><dd id="perTip">-</dd></div>
  <div class="stat"><dt>每人应付</dt><dd id="perPay">-</dd></div>
</dl>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var statusEl=$("#status");
  function fmt(n){ return n.toFixed(2)+" 元"; }
  function run(){
    var bill=parseFloat($("#bill").value), pct=parseFloat($("#tipPct").value), ppl=parseInt($("#people").value,10);
    if(!(bill>=0)||!(pct>=0)||!(ppl>0)){ PHT.status(statusEl,"请输入有效数值"); return; }
    var tip=bill*pct/100, total=bill+tip;
    if($("#roundUp").checked) total=Math.ceil(total);
    $("#tipTotal").textContent=fmt(tip);
    $("#perTip").textContent=fmt(tip/ppl);
    $("#perPay").textContent=fmt(total/ppl);
    PHT.status(statusEl,"计算完成","ok");
  }
  ["bill","tipPct","people","roundUp"].forEach(function(k){ $("#"+k).addEventListener("input",run); $("#"+k).addEventListener("change",run); });
  run();
})();`
});

TOOLS.push({
  file: "discount-calculator.html",
  meta: { title: "折扣计算器", desc: "输入原价与折扣力度，算出折后价、省下的金额，以及相当于打了几折，网购比价好帮手。", category: "calc", tags: ["折扣", "打折", "比价", "省钱"], order: 4 },
  body: `<div class="grid-2">
  <div class="field"><label for="price">原价 (元)</label><input type="number" id="price" value="199" min="0" step="any"></div>
  <div class="field"><label for="off">折扣 (%)</label><input type="number" id="off" value="30" min="0" max="100" step="any"></div>
</div>
<dl class="stat-row" style="margin-top:16px">
  <div class="stat"><dt>折后价</dt><dd id="final">-</dd></div>
  <div class="stat"><dt>省下</dt><dd id="saved">-</dd></div>
  <div class="stat"><dt>相当于</dt><dd id="fold">-</dd></div>
</dl>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var statusEl=$("#status");
  function run(){
    var p=parseFloat($("#price").value), off=parseFloat($("#off").value);
    if(!(p>=0)||!(off>=0)){ PHT.status(statusEl,"请输入有效数值"); return; }
    if(off>100){ PHT.status(statusEl,"折扣不能超过 100%","error"); return; }
    var rate=off/100, final=p*(1-rate), saved=p-final, fold=(1-rate)*10;
    $("#final").textContent=final.toFixed(2)+" 元";
    $("#saved").textContent=saved.toFixed(2)+" 元";
    $("#fold").textContent=(fold%1===0?fold:fold.toFixed(1))+" 折";
    PHT.status(statusEl,"计算完成","ok");
  }
  ["price","off"].forEach(function(k){ $("#"+k).addEventListener("input",run); });
  run();
})();`
});

TOOLS.push({
  file: "compound-interest.html",
  meta: { title: "复利计算器", desc: "输入本金、年利率、年限与复利频率，估算复利终值与累计利息，看清时间带来的增长。", category: "calc", tags: ["复利", "利息", "理财", "投资"], order: 5 },
  body: `<div class="grid-2">
  <div class="field"><label for="principal">本金 (元)</label><input type="number" id="principal" value="10000" min="0" step="any"></div>
  <div class="field"><label for="rate">年利率 (%)</label><input type="number" id="rate" value="5" min="0" step="any"></div>
  <div class="field"><label for="years">年限</label><input type="number" id="years" value="10" min="1" step="any"></div>
  <div class="field"><label for="freq">每年复利次数</label><select id="freq"><option value="1">1 (年)</option><option value="4">4 (季)</option><option value="12" selected>12 (月)</option><option value="365">365 (日)</option></select></div>
</div>
<dl class="stat-row" style="margin-top:16px">
  <div class="stat"><dt>复利终值</dt><dd id="fv">-</dd></div>
  <div class="stat"><dt>累计利息</dt><dd id="ci">-</dd></div>
  <div class="stat"><dt>本金</dt><dd id="pi">-</dd></div>
</dl>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var statusEl=$("#status");
  function fmt(n){ return Math.round(n).toLocaleString("zh-CN")+" 元"; }
  function run(){
    var P=parseFloat($("#principal").value), r=parseFloat($("#rate").value), t=parseFloat($("#years").value), n=parseInt($("#freq").value,10);
    if(!(P>=0)||!(r>=0)||!(t>0)||!(n>0)){ PHT.status(statusEl,"请输入有效数值"); return; }
    var rm=r/100/n, fv = r===0 ? P : P*Math.pow(1+rm, n*t);
    $("#fv").textContent=fmt(fv);
    $("#ci").textContent=fmt(fv-P);
    $("#pi").textContent=fmt(P);
    PHT.status(statusEl,"计算完成","ok");
  }
  ["principal","rate","years","freq"].forEach(function(k){ $("#"+k).addEventListener("input",run); $("#"+k).addEventListener("change",run); });
  run();
})();`
});

TOOLS.push({
  file: "fuel-calculator.html",
  meta: { title: "油耗油费计算", desc: "根据里程、百公里油耗与油价，估算本次出行的用油量与油费，长途自驾提前算账。", category: "calc", tags: ["油耗", "油费", "里程", "自驾"], order: 6 },
  body: `<div class="grid-2">
  <div class="field"><label for="km">里程 (km)</label><input type="number" id="km" value="300" min="0" step="any"></div>
  <div class="field"><label for="l100">百公里油耗 (L)</label><input type="number" id="l100" value="7.5" min="0" step="any"></div>
  <div class="field"><label for="price">油价 (元/L)</label><input type="number" id="price" value="8" min="0" step="any"></div>
  <div class="field"><label class="chk"><input type="checkbox" id="roundTrip"> 往返（里程翻倍）</label></div>
</div>
<dl class="stat-row" style="margin-top:16px">
  <div class="stat"><dt>实际里程</dt><dd id="dist">-</dd></div>
  <div class="stat"><dt>总用油量</dt><dd id="fuel">-</dd></div>
  <div class="stat"><dt>油费</dt><dd id="cost">-</dd></div>
</dl>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var statusEl=$("#status");
  function run(){
    var km=parseFloat($("#km").value), l=parseFloat($("#l100").value), p=parseFloat($("#price").value);
    if(!(km>=0)||!(l>=0)||!(p>=0)){ PHT.status(statusEl,"请输入有效数值"); return; }
    if($("#roundTrip").checked) km=km*2;
    var fuel=km/100*l, cost=fuel*p;
    $("#dist").textContent=km+" km";
    $("#fuel").textContent=fuel.toFixed(2)+" L";
    $("#cost").textContent=cost.toFixed(2)+" 元";
    PHT.status(statusEl,"计算完成","ok");
  }
  ["km","l100","price","roundTrip"].forEach(function(k){ $("#"+k).addEventListener("input",run); $("#"+k).addEventListener("change",run); });
  run();
})();`
});

TOOLS.push({
  file: "age-calculator.html",
  meta: { title: "年龄与日期差", desc: "选择出生日期与目标日期，计算周岁、精确到天的总天数，以及距离目标日期还有多少天。", category: "calc", tags: ["年龄", "生日", "日期差", "倒计时"], order: 7 },
  body: `<div class="grid-2">
  <div class="field"><label for="birth">出生日期</label><input type="date" id="birth" value="2000-01-01"></div>
  <div class="field"><label for="target">目标日期</label><input type="date" id="target"></div>
</div>
<dl class="stat-row" style="margin-top:16px">
  <div class="stat"><dt>周岁</dt><dd id="ageYears">-</dd></div>
  <div class="stat"><dt>已活天数</dt><dd id="days">-</dd></div>
  <div class="stat"><dt>距目标</dt><dd id="toTarget">-</dd></div>
</dl>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var statusEl=$("#status");
  function parse(d){ if(!d) return null; var t=Date.parse(d); return isNaN(t)?null:new Date(t); }
  function diffDays(a,b){ return Math.round((b-a)/86400000); }
  function run(){
    var b=parse($("#birth").value), t=parse($("#target").value);
    if(!b){ PHT.status(statusEl,"请选择出生日期"); return; }
    var now=t||new Date();
    var days=diffDays(b,now);
    var years=now.getFullYear()-b.getFullYear();
    var m=now.getMonth()-b.getMonth();
    if(m<0||(m===0&&now.getDate()<b.getDate())) years--;
    $("#ageYears").textContent=years+" 岁";
    $("#days").textContent=days.toLocaleString("zh-CN")+" 天";
    if(t){
      var dt=diffDays(now,t);
      $("#toTarget").textContent=(dt>=0?"还有 ":"已过 ")+Math.abs(dt).toLocaleString("zh-CN")+" 天";
    } else { $("#toTarget").textContent="-"; }
    PHT.status(statusEl,"计算完成","ok");
  }
  ["birth","target"].forEach(function(k){ $("#"+k).addEventListener("change",run); $("#"+k).addEventListener("input",run); });
  run();
})();`
});

TOOLS.push({
  file: "salary-calculator.html",
  meta: { title: "税后工资估算", desc: "按常见五险一金个人比例与个税累进税率，粗略估算每月到手工资，仅供参考。", category: "calc", tags: ["工资", "个税", "五险一金", "到手"], order: 8 },
  body: `<div class="grid-2">
  <div class="field"><label for="gross">税前月薪 (元)</label><input type="number" id="gross" value="15000" min="0" step="any"></div>
  <div class="field"><label for="insRate">五险一金比例 (%)</label><input type="number" id="insRate" value="10.5" min="0" max="100" step="any"></div>
</div>
<dl class="stat-row" style="margin-top:16px">
  <div class="stat"><dt>五险一金</dt><dd id="ins">-</dd></div>
  <div class="stat"><dt>个人所得税</dt><dd id="tax">-</dd></div>
  <div class="stat"><dt>到手工资</dt><dd id="net">-</dd></div>
</dl>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var statusEl=$("#status");
  function fmt(n){ return n.toFixed(2)+" 元"; }
  function taxOf(t){
    var b=[[3000,0.03,0],[12000,0.1,210],[25000,0.2,1410],[35000,0.25,2660],[55000,0.3,4410],[80000,0.35,7160],[Infinity,0.45,15160]];
    var r=0;
    for(var i=0;i<b.length;i++){ if(t<=b[i][0]){ r=t*b[i][1]-b[i][2]; break; } }
    return Math.max(0,r);
  }
  function run(){
    var g=parseFloat($("#gross").value), ir=parseFloat($("#insRate").value);
    if(!(g>=0)||!(ir>=0)){ PHT.status(statusEl,"请输入有效数值"); return; }
    if(ir>100){ PHT.status(statusEl,"比例不能超过 100%","error"); return; }
    var ins=g*ir/100, taxable=Math.max(0,g-ins-5000), tax=taxOf(taxable), net=g-ins-tax;
    $("#ins").textContent=fmt(ins);
    $("#tax").textContent=fmt(tax);
    $("#net").textContent=fmt(net);
    PHT.status(statusEl,"估算结果仅供参考","ok");
  }
  ["gross","insRate"].forEach(function(k){ $("#"+k).addEventListener("input",run); });
  run();
})();`
});

TOOLS.push({
  file: "vat-calculator.html",
  meta: { title: "含税价换算", desc: "在含税金额与不含税金额之间互相换算，输入税率即可得到税额、不含税价与含税价。", category: "calc", tags: ["增值税", "含税价", "不含税价", "税额"], order: 9 },
  body: `<div class="grid-2">
  <div class="field"><label for="mode">换算方向</label><select id="mode"><option value="fromTax">含税 → 不含税</option><option value="toTax">不含税 → 含税</option></select></div>
  <div class="field"><label for="amount">金额 (元)</label><input type="number" id="amount" value="113" min="0" step="any"></div>
  <div class="field"><label for="rate">税率 (%)</label><input type="number" id="rate" value="13" min="0" step="any"></div>
</div>
<dl class="stat-row" style="margin-top:16px">
  <div class="stat"><dt>不含税金额</dt><dd id="net">-</dd></div>
  <div class="stat"><dt>税额</dt><dd id="tax">-</dd></div>
  <div class="stat"><dt>含税金额</dt><dd id="gross">-</dd></div>
</dl>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var statusEl=$("#status");
  function fmt(n){ return n.toFixed(2)+" 元"; }
  function run(){
    var amt=parseFloat($("#amount").value), r=parseFloat($("#rate").value);
    if(!(amt>=0)||!(r>=0)){ PHT.status(statusEl,"请输入有效数值"); return; }
    var net, tax, gross;
    if($("#mode").value==="fromTax"){ gross=amt; net=gross/(1+r/100); tax=gross-net; }
    else { net=amt; gross=net*(1+r/100); tax=gross-net; }
    $("#net").textContent=fmt(net);
    $("#tax").textContent=fmt(tax);
    $("#gross").textContent=fmt(gross);
    PHT.status(statusEl,"计算完成","ok");
  }
  ["mode","amount","rate"].forEach(function(k){ $("#"+k).addEventListener("input",run); $("#"+k).addEventListener("change",run); });
  run();
})();`
});

TOOLS.push({
  file: "grade-calculator.html",
  meta: { title: "加权平均分", desc: "每行填写「分数,权重」，自动计算加权平均分、总权重与科目数，适合成绩与绩效汇总。", category: "calc", tags: ["平均分", "加权", "成绩", "GPA"], order: 10 },
  body: `<div class="field"><label for="rows">成绩（每行：分数,权重）</label><textarea id="rows" class="code" spellcheck="false" placeholder="90,3&#10;85,2&#10;76,4"></textarea></div>
<dl class="stat-row" style="margin-top:16px">
  <div class="stat"><dt>加权平均分</dt><dd id="avg">-</dd></div>
  <div class="stat"><dt>总权重</dt><dd id="tw">-</dd></div>
  <div class="stat"><dt>科目数</dt><dd id="cnt">-</dd></div>
</dl>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var statusEl=$("#status");
  function run(){
    var lines=$("#rows").value.split(/\\r?\\n/).map(function(s){return s.trim();}).filter(Boolean);
    var sum=0, wsum=0, cnt=0;
    for(var i=0;i<lines.length;i++){
      var parts=lines[i].split(/[,，\\s]+/);
      var s=parseFloat(parts[0]), w=parts.length>1?parseFloat(parts[1]):1;
      if(isNaN(s)){ PHT.status(statusEl,"第 "+(i+1)+" 行分数无效","error"); return; }
      if(isNaN(w)||w<0){ PHT.status(statusEl,"第 "+(i+1)+" 行权重无效","error"); return; }
      sum+=s*w; wsum+=w; cnt++;
    }
    if(cnt===0){ $("#avg").textContent="-"; $("#tw").textContent="-"; $("#cnt").textContent="-"; PHT.status(statusEl,"请输入成绩"); return; }
    $("#avg").textContent=(sum/wsum).toFixed(2);
    $("#tw").textContent=wsum.toLocaleString("zh-CN");
    $("#cnt").textContent=cnt;
    PHT.status(statusEl,"计算完成","ok");
  }
  $("#rows").addEventListener("input",run);
  run();
})();`
});

// ---------- 图片 ----------
TOOLS.push({
  file: "image-resize.html",
  meta: { title: "图片尺寸调整", desc: "上传图片后按目标宽度等比缩放（或指定高宽），导出为 PNG/JPEG/WebP，全部在本地完成。", category: "image", tags: ["图片", "缩放", "尺寸", "导出"], order: 1 },
  body: `<label class="drop" id="drop"><input type="file" id="fileInput" accept="image/*"><strong>拖入图片或点击选择</strong><span>选择后可在右侧设置尺寸并预览</span></label>
<div class="grid-2" style="margin-top:14px">
  <div class="field"><label for="width">目标宽度 (px)</label><input type="number" id="width" min="1" step="1"></div>
  <div class="field"><label for="height">目标高度 (px)</label><input type="number" id="height" min="1" step="1"></div>
  <div class="field"><label class="chk"><input type="checkbox" id="keepRatio" checked> 锁定宽高比</label></div>
  <div class="field"><label for="format">导出格式</label><select id="format"><option value="image/png">PNG</option><option value="image/jpeg">JPEG</option><option value="image/webp">WebP</option></select></div>
  <div class="field" id="qField" style="display:none"><label for="quality">质量 (%)</label><input type="number" id="quality" value="92" min="1" max="100" step="1"></div>
</div>
<canvas id="canvas" style="display:none"></canvas>
<div class="preview-box" id="pv" style="margin-top:14px"><span class="empty">预览会显示在这里</span></div>
<div class="actions">
  <button class="btn primary" id="apply" type="button" disabled>生成预览</button>
  <button class="btn" id="download" type="button" disabled>下载图片</button>
</div>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var statusEl=$("#status");
  var canvas=$("#canvas"), img=null;
  var fileInput=$("#fileInput");
  function showQuality(){ $("#qField").style.display = $("#format").value==="image/png" ? "none":"block"; }
  function loadFile(file){
    if(!file||!/^image\\//.test(file.type)){ PHT.status(statusEl,"请选择图片文件","error"); return; }
    var reader=new FileReader();
    reader.onload=function(e){
      var im=new Image();
      im.onload=function(){
        img=im;
        $("#width").value=im.naturalWidth;
        $("#height").value=im.naturalHeight;
        $("#apply").disabled=false;
        PHT.status(statusEl,"已载入，设置尺寸后点击生成","ok");
      };
      im.onerror=function(){ PHT.status(statusEl,"图片解析失败","error"); };
      im.src=e.target.result;
    };
    reader.readAsDataURL(file);
  }
  function render(){
    if(!img) return;
    var w=parseInt($("#width").value,10), h=parseInt($("#height").value,10);
    if(!(w>0)||!(h>0)){ PHT.status(statusEl,"请输入有效尺寸","error"); return; }
    canvas.width=w; canvas.height=h;
    var ctx=canvas.getContext("2d");
    if(!ctx){ PHT.status(statusEl,"当前浏览器不支持画布","error"); return; }
    ctx.drawImage(img,0,0,w,h);
    var fmt=$("#format").value;
    var data = fmt==="image/png" ? canvas.toDataURL(fmt) : canvas.toDataURL(fmt, parseFloat($("#quality").value)/100);
    var pv=$("#pv"); pv.innerHTML="";
    var out=new Image(); out.src=data; pv.appendChild(out);
    $("#download").disabled=false;
    $("#download").onclick=function(){ PHT.download("resized."+(fmt==="image/png"?"png":fmt==="image/jpeg"?"jpg":"webp"), data); };
    PHT.status(statusEl,"已生成预览，可下载","ok");
  }
  fileInput.addEventListener("change",function(){ loadFile(fileInput.files[0]); });
  $("#keepRatio").addEventListener("change",function(){
    if($("#keepRatio").checked && img){ var w=parseInt($("#width").value,10); if(w>0){ $("#height").value=Math.round(w*img.naturalHeight/img.naturalWidth); } }
  });
  $("#width").addEventListener("input",function(){
    if($("#keepRatio").checked && img){ var w=parseInt($("#width").value,10); if(w>0){ $("#height").value=Math.round(w*img.naturalHeight/img.naturalWidth); } }
  });
  ["format","quality"].forEach(function(k){ $("#"+k).addEventListener("change",showQuality); $("#"+k).addEventListener("input",showQuality); });
  $("#apply").addEventListener("click",render);
  showQuality();
})();`
});

TOOLS.push({
  file: "image-metadata.html",
  meta: { title: "图片信息查看", desc: "选择本地图片，读取文件名、类型、体积与像素尺寸，无需上传，所有信息在本地读取。", category: "image", tags: ["图片", "元数据", "尺寸", "体积"], order: 2 },
  body: `<label class="drop" id="drop"><input type="file" id="fileInput" accept="image/*"><strong>拖入图片或点击选择</strong><span>查看文件名、类型、大小与尺寸</span></label>
<dl class="stat-row" style="margin-top:16px">
  <div class="stat"><dt>文件名</dt><dd id="mName">-</dd></div>
  <div class="stat"><dt>类型</dt><dd id="mType">-</dd></div>
  <div class="stat"><dt>大小</dt><dd id="mSize">-</dd></div>
  <div class="stat"><dt>尺寸</dt><dd id="mDims">-</dd></div>
</dl>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var statusEl=$("#status");
  function loadFile(file){
    if(!file||!/^image\\//.test(file.type)){ PHT.status(statusEl,"请选择图片文件","error"); return; }
    $("#mName").textContent=file.name;
    $("#mType").textContent=file.type||"-";
    $("#mSize").textContent=PHT.bytes(file.size);
    var reader=new FileReader();
    reader.onload=function(e){
      var im=new Image();
      im.onload=function(){ $("#mDims").textContent=im.naturalWidth+" x "+im.naturalHeight+" px"; PHT.status(statusEl,"读取完成","ok"); };
      im.onerror=function(){ $("#mDims").textContent="无法读取"; PHT.status(statusEl,"无法解析图片尺寸","error"); };
      im.src=e.target.result;
    };
    reader.readAsDataURL(file);
  }
  var fileInput=$("#fileInput");
  fileInput.addEventListener("change",function(){ loadFile(fileInput.files[0]); });
})();`
});

TOOLS.push({
  file: "image-pixelate.html",
  meta: { title: "像素化马赛克", desc: "上传图片并调节马赛克块大小，实时预览像素化效果，导出为本地图片。", category: "image", tags: ["像素化", "马赛克", "图片", "隐私"], order: 3 },
  body: `<label class="drop" id="drop"><input type="file" id="fileInput" accept="image/*"><strong>拖入图片或点击选择</strong><span>调节块大小生成马赛克效果</span></label>
<div class="row" style="gap:12px;flex-wrap:wrap;align-items:flex-end;margin-top:14px">
  <div class="field" style="max-width:200px"><label for="block">块大小 (px)</label><input type="number" id="block" value="16" min="1" max="64" step="1"></div>
  <div class="field"><label for="format">导出格式</label><select id="format"><option value="image/png">PNG</option><option value="image/jpeg">JPEG</option></select></div>
</div>
<canvas id="canvas" style="display:none"></canvas>
<div class="preview-box" id="pv" style="margin-top:14px"><span class="empty">预览会显示在这里</span></div>
<div class="actions">
  <button class="btn primary" id="apply" type="button" disabled>生成预览</button>
  <button class="btn" id="download" type="button" disabled>下载图片</button>
</div>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var statusEl=$("#status");
  var canvas=$("#canvas"), img=null;
  var fileInput=$("#fileInput");
  function loadFile(file){
    if(!file||!/^image\\//.test(file.type)){ PHT.status(statusEl,"请选择图片文件","error"); return; }
    var reader=new FileReader();
    reader.onload=function(e){
      var im=new Image();
      im.onload=function(){ img=im; $("#apply").disabled=false; PHT.status(statusEl,"已载入，点击生成预览","ok"); };
      im.onerror=function(){ PHT.status(statusEl,"图片解析失败","error"); };
      im.src=e.target.result;
    };
    reader.readAsDataURL(file);
  }
  function render(){
    if(!img) return;
    var b=parseInt($("#block").value,10)||8;
    var w=img.naturalWidth, h=img.naturalHeight;
    canvas.width=w; canvas.height=h;
    var ctx=canvas.getContext("2d");
    if(!ctx){ PHT.status(statusEl,"当前浏览器不支持画布","error"); return; }
    ctx.imageSmoothingEnabled=false;
    var sw=Math.max(1,Math.round(w/b)), sh=Math.max(1,Math.round(h/b));
    var tmp=document.createElement("canvas"); tmp.width=sw; tmp.height=sh;
    var tctx=tmp.getContext("2d");
    tctx.drawImage(img,0,0,sw,sh);
    ctx.drawImage(tmp,0,0,sw,sh,0,0,w,h);
    var fmt=$("#format").value;
    var data=canvas.toDataURL(fmt);
    var pv=$("#pv"); pv.innerHTML="";
    var out=new Image(); out.src=data; pv.appendChild(out);
    $("#download").disabled=false;
    $("#download").onclick=function(){ PHT.download("pixelated."+(fmt==="image/png"?"png":"jpg"), data); };
    PHT.status(statusEl,"已生成预览","ok");
  }
  fileInput.addEventListener("change",function(){ loadFile(fileInput.files[0]); });
  $("#apply").addEventListener("click",render);
})();`
});

TOOLS.push({
  file: "image-flip-rotate.html",
  meta: { title: "图片翻转旋转", desc: "上传图片后水平 / 垂直翻转，或顺时针 / 逆时针旋转 90 度，本地处理并导出。", category: "image", tags: ["图片", "翻转", "旋转", "编辑"], order: 4 },
  body: `<label class="drop" id="drop"><input type="file" id="fileInput" accept="image/*"><strong>拖入图片或点击选择</strong><span>翻转与旋转后导出</span></label>
<div class="actions" style="margin-top:14px">
  <button class="btn" id="flipH" type="button" disabled>水平翻转</button>
  <button class="btn" id="flipV" type="button" disabled>垂直翻转</button>
  <button class="btn" id="rotR" type="button" disabled>顺时针 90°</button>
  <button class="btn" id="rotL" type="button" disabled>逆时针 90°</button>
  <button class="btn primary" id="download" type="button" disabled>下载图片</button>
</div>
<canvas id="canvas" style="display:none"></canvas>
<div class="preview-box" id="pv" style="margin-top:14px"><span class="empty">预览会显示在这里</span></div>
<p class="status" id="status" aria-live="polite"></p>`,
  script: `(function(){
  var $ = PHT.$;
  var statusEl=$("#status");
  var canvas=$("#canvas"), img=null, dataUrl=null;
  var fileInput=$("#fileInput");
  function loadFile(file){
    if(!file||!/^image\\//.test(file.type)){ PHT.status(statusEl,"请选择图片文件","error"); return; }
    var reader=new FileReader();
    reader.onload=function(e){
      var im=new Image();
      im.onload=function(){
        img=im; dataUrl=e.target.result;
        ["flipH","flipV","rotR","rotL","download"].forEach(function(k){ $("#"+k).disabled=false; });
        draw(1,0,false,false);
        PHT.status(statusEl,"已载入","ok");
      };
      im.onerror=function(){ PHT.status(statusEl,"图片解析失败","error"); };
      im.src=e.target.result;
    };
    reader.readAsDataURL(file);
  }
  function draw(scale, angle, flipH, flipV){
    if(!img) return;
    var w=img.naturalWidth, h=img.naturalHeight;
    var cw = angle%180===0 ? w : h, ch = angle%180===0 ? h : w;
    canvas.width=cw; canvas.height=ch;
    var ctx=canvas.getContext("2d");
    if(!ctx){ PHT.status(statusEl,"当前浏览器不支持画布","error"); return; }
    ctx.save();
    ctx.translate(cw/2,ch/2);
    ctx.rotate(angle*Math.PI/180);
    ctx.scale(flipH?-1:1, flipV?-1:1);
    ctx.drawImage(img,-w/2,-h/2);
    ctx.restore();
    dataUrl=canvas.toDataURL("image/png");
    var pv=$("#pv"); pv.innerHTML="";
    var out=new Image(); out.src=dataUrl; pv.appendChild(out);
  }
  var st={angle:0,flipH:false,flipV:false};
  function refresh(){ draw(1, st.angle, st.flipH, st.flipV); }
  fileInput.addEventListener("change",function(){ loadFile(fileInput.files[0]); });
  $("#flipH").addEventListener("click",function(){ st.flipH=!st.flipH; refresh(); });
  $("#flipV").addEventListener("click",function(){ st.flipV=!st.flipV; refresh(); });
  $("#rotR").addEventListener("click",function(){ st.angle=(st.angle+90)%360; refresh(); });
  $("#rotL").addEventListener("click",function(){ st.angle=(st.angle+270)%360; refresh(); });
  $("#download").addEventListener("click",function(){ if(dataUrl) PHT.download("rotated.png", dataUrl); });
})();`
});

// ====================================================================
// 批量工厂：用紧凑数据生成大量同类工具，避免逐个手写样板
// ====================================================================
function unitConvTool(spec) {
  var opts = spec.units.map(function (u, i) { return '<option value="' + i + '">' + u.name + '</option>'; }).join("");
  var body = '<div class="grid-2">\n'
    + '  <div class="field"><label for="value">数值</label><input type="number" id="value" value="1" step="any"></div>\n'
    + '  <div class="field"><label for="from">从单位</label><select id="from">' + opts + '</select></div>\n'
    + '  <div class="field"><label for="to">到单位</label><select id="to">' + opts + '</select></div>\n'
    + '  <div class="field"><button class="btn" type="button" id="swap">交换单位</button></div>\n'
    + '</div>\n'
    + '<dl class="stat-row" style="margin-top:16px"><div class="stat"><dt>换算结果</dt><dd id="out">—</dd></div></dl>\n'
    + '<p class="status" id="status" aria-live="polite"></p>';
  var script;
  if (spec.conv) {
    var convBody = spec.conv.toString().replace(/^function\s*\w*\s*\([^)]*\)\s*\{/, "").replace(/\}\s*$/, "");
    var names = JSON.stringify(spec.units.map(function (u) { return u.name; }));
    script = '(function(){ var $=PHT.$; var statusEl=$("#status"); var N=' + names + ';\n'
      + '  function conv(v,a,b){ ' + convBody + ' }\n'
      + '  function run(){ var v=parseFloat($("#value").value); var fi=parseInt($("#from").value,10), ti=parseInt($("#to").value,10); if(!(v>=0)){ PHT.status(statusEl,"请输入有效数值"); return; } var res=conv(v,N[fi],N[ti]); $("#out").textContent=(Math.round(res*1e6)/1e6).toLocaleString("zh-CN",{maximumFractionDigits:6})+" "+N[ti]; PHT.status(statusEl,"换算完成","ok"); }\n'
      + '  $("#swap").addEventListener("click",function(){ var f=$("#from").value; $("#from").value=$("#to").value; $("#to").value=f; run(); });\n'
      + '  ["value","from","to"].forEach(function(k){ $("#"+k).addEventListener("input",run); $("#"+k).addEventListener("change",run); }); run();\n})();';
  } else {
    var factors = JSON.stringify(spec.units.map(function (u) { return u.factor; }));
    var names2 = JSON.stringify(spec.units.map(function (u) { return u.name; }));
    script = '(function(){ var $=PHT.$; var statusEl=$("#status"); var F=' + factors + '; var N=' + names2 + ';\n'
      + '  function run(){ var v=parseFloat($("#value").value); var fi=parseInt($("#from").value,10), ti=parseInt($("#to").value,10); if(!(v>=0)){ PHT.status(statusEl,"请输入有效数值"); return; } var res=v*F[fi]/F[ti]; $("#out").textContent=(Math.round(res*1e6)/1e6).toLocaleString("zh-CN",{maximumFractionDigits:6})+" "+N[ti]; PHT.status(statusEl,"换算完成","ok"); }\n'
      + '  $("#swap").addEventListener("click",function(){ var f=$("#from").value; $("#from").value=$("#to").value; $("#to").value=f; run(); });\n'
      + '  ["value","from","to"].forEach(function(k){ $("#"+k).addEventListener("input",run); $("#"+k).addEventListener("change",run); }); run();\n})();';
  }
  TOOLS.push({ file: spec.file, meta: { title: spec.title, desc: spec.desc, category: "calc", tags: spec.tags, order: spec.order }, body: body, script: script });
}

function calcTool(spec) {
  var fields = spec.fields.map(function (f) {
    if (f.type === "select") {
      var o = f.options.map(function (x) { return '<option value="' + x.value + '">' + x.label + '</option>'; }).join("");
      return '  <div class="field"><label for="' + f.id + '">' + f.label + '</label><select id="' + f.id + '">' + o + '</select></div>';
    }
    if (f.type === "checkbox") {
      return '  <label class="chk"><input type="checkbox" id="' + f.id + '"' + (f.checked ? " checked" : "") + '> ' + f.label + '</label>';
    }
    var extra = (f.value !== undefined ? ' value="' + f.value + '"' : "") + (f.step !== undefined ? ' step="' + f.step + '"' : "") + (f.min !== undefined ? ' min="' + f.min + '"' : "") + (f.max !== undefined ? ' max="' + f.max + '"' : "");
    return '  <div class="field"><label for="' + f.id + '">' + f.label + '</label><input type="' + (f.type || "number") + '" id="' + f.id + '"' + extra + '></div>';
  }).join("\n");
  var outs = spec.outputs.map(function (o) { return '  <div class="stat"><dt>' + o.label + '</dt><dd id="' + o.id + '">—</dd></div>'; }).join("\n");
  var reads = spec.fields.map(function (f) {
    if (f.type === "checkbox") return '    args["' + f.id + '"]=$("#' + f.id + '").checked;';
    if (f.type === "select" || f.type === "date" || f.type === "text") return '    args["' + f.id + '"]=$("#' + f.id + '").value;';
    return '    args["' + f.id + '"]=parseFloat($("#' + f.id + '").value);';
  }).join("\n");
  var writes = spec.outputs.map(function (o) { return '    if(r&&r["' + o.id + '"]!==undefined){ var v=r["' + o.id + '"]; $("#' + o.id + '").textContent=(typeof v==="number")?fnum(v):v; }'; }).join("\n");
  var ids = spec.fields.map(function (f) { return f.id; }).join('","');
  var body = '<div class="grid-2">\n' + fields + '\n</div>\n<dl class="stat-row" style="margin-top:16px">\n' + outs + '\n</dl>\n<p class="status" id="status" aria-live="polite"></p>';
  var computeSrc;
  if (spec.formulas) {
    var ret = spec.formulas.map(function (f) { return '"' + f.id + '":(' + f.expr + ')'; }).join(",");
    computeSrc = "function(args){ return { " + ret + " }; }";
  } else {
    var cb = spec.compute.toString().replace(/^function\s*\w*\s*\([^)]*\)\s*\{/, "").replace(/\}\s*$/, "");
    computeSrc = "function compute(args){ " + cb + " }";
  }
  var script = '(function(){\n  var $=PHT.$; var statusEl=$("#status");\n'
    + '  function fnum(n){ if(n===null||n===undefined||!isFinite(n)) return "—"; var a=Math.round(n*1e6)/1e6; return a.toLocaleString("zh-CN",{maximumFractionDigits:6}); }\n'
    + '  var compute = ' + computeSrc + ';\n'
    + '  function run(){ var args={};\n' + reads + '\n    try { var r=compute(args);\n' + writes + '\n      PHT.status(statusEl,(r&&r.__msg)||"计算完成",(r&&r.__type)||"ok"); } catch(e){ PHT.status(statusEl,"出错了："+e.message,"error"); }\n  }\n'
    + '  ["' + ids + '"].forEach(function(k){ $("#"+k).addEventListener("input",run); $("#"+k).addEventListener("change",run); });\n  run();\n})();';
  TOOLS.push({ file: spec.file, meta: { title: spec.title, desc: spec.desc, category: "calc", tags: spec.tags, order: spec.order }, body: body, script: script });
}

// ---------- 单位换算（18 个）----------
unitConvTool({ file: "length-converter.html", title: "长度换算", desc: "在毫米、厘米、米、千米、英寸、英尺、码、英里、海里之间即时换算。", tags: ["长度", "换算", "单位"], order: 201,
  units: [{ name: "毫米 mm", factor: 0.001 }, { name: "厘米 cm", factor: 0.01 }, { name: "米 m", factor: 1 }, { name: "千米 km", factor: 1000 }, { name: "英寸 in", factor: 0.0254 }, { name: "英尺 ft", factor: 0.3048 }, { name: "码 yd", factor: 0.9144 }, { name: "英里 mi", factor: 1609.344 }, { name: "海里 nmi", factor: 1852 }] });
unitConvTool({ file: "mass-converter.html", title: "质量换算", desc: "在毫克、克、千克、吨、盎司、磅、英石之间即时换算。", tags: ["质量", "换算", "单位"], order: 202,
  units: [{ name: "毫克 mg", factor: 1e-6 }, { name: "克 g", factor: 0.001 }, { name: "千克 kg", factor: 1 }, { name: "吨 t", factor: 1000 }, { name: "盎司 oz", factor: 0.028349523125 }, { name: "磅 lb", factor: 0.45359237 }, { name: "英石 st", factor: 6.35029318 }] });
unitConvTool({ file: "area-converter.html", title: "面积换算", desc: "在平方毫米、平方厘米、平方米、公顷、平方公里、平方英寸、平方英尺、英亩、平方英里之间换算。", tags: ["面积", "换算", "单位"], order: 203,
  units: [{ name: "平方毫米 mm²", factor: 1e-6 }, { name: "平方厘米 cm²", factor: 1e-4 }, { name: "平方米 m²", factor: 1 }, { name: "公顷 ha", factor: 10000 }, { name: "平方千米 km²", factor: 1e6 }, { name: "平方英寸 in²", factor: 0.00064516 }, { name: "平方英尺 ft²", factor: 0.09290304 }, { name: "英亩 ac", factor: 4046.8564224 }, { name: "平方英里 mi²", factor: 2589988.110336 }] });
unitConvTool({ file: "volume-converter.html", title: "体积换算", desc: "在毫升、升、立方米、加仑、夸脱、品脱、杯、液量盎司、立方英寸、立方英尺之间换算。", tags: ["体积", "换算", "单位"], order: 204,
  units: [{ name: "毫升 mL", factor: 0.001 }, { name: "升 L", factor: 1 }, { name: "立方米 m³", factor: 1000 }, { name: "加仑(美) gal", factor: 3.785411784 }, { name: "夸脱(美) qt", factor: 0.946352946 }, { name: "品脱(美) pt", factor: 0.473176473 }, { name: "杯(美) cup", factor: 0.2365882365 }, { name: "液量盎司 fl oz", factor: 0.0295735295625 }, { name: "立方英寸 in³", factor: 0.016387064 }, { name: "立方英尺 ft³", factor: 28.316846592 }] });
unitConvTool({ file: "speed-converter.html", title: "速度换算", desc: "在米/秒、千米/时、英里/时、节、英尺/秒之间即时换算。", tags: ["速度", "换算", "单位"], order: 205,
  units: [{ name: "米/秒 m/s", factor: 1 }, { name: "千米/时 km/h", factor: 0.27777777778 }, { name: "英里/时 mph", factor: 0.44704 }, { name: "节 knot", factor: 0.51444444444 }, { name: "英尺/秒 ft/s", factor: 0.3048 }] });
unitConvTool({ file: "time-converter.html", title: "时间换算", desc: "在毫秒、秒、分、时、天、周、年之间换算。", tags: ["时间", "换算", "单位"], order: 206,
  units: [{ name: "毫秒 ms", factor: 0.001 }, { name: "秒 s", factor: 1 }, { name: "分 min", factor: 60 }, { name: "时 h", factor: 3600 }, { name: "天 day", factor: 86400 }, { name: "周 week", factor: 604800 }, { name: "年 year", factor: 31536000 }] });
unitConvTool({ file: "data-converter.html", title: "数据存储换算", desc: "在字节、KB、MB、GB、TB、PB 与 KiB、MiB、GiB、TiB 之间换算。", tags: ["数据", "存储", "换算"], order: 207,
  units: [{ name: "字节 B", factor: 1 }, { name: "KB", factor: 1e3 }, { name: "MB", factor: 1e6 }, { name: "GB", factor: 1e9 }, { name: "TB", factor: 1e12 }, { name: "PB", factor: 1e15 }, { name: "KiB", factor: 1024 }, { name: "MiB", factor: 1048576 }, { name: "GiB", factor: 1073741824 }, { name: "TiB", factor: 1099511627776 }] });
unitConvTool({ file: "angle-converter.html", title: "角度换算", desc: "在度、弧度、梯度、角分、角秒、圈之间换算。", tags: ["角度", "弧度", "换算"], order: 208,
  units: [{ name: "度 °", factor: 1 }, { name: "弧度 rad", factor: 57.2957795131 }, { name: "梯度 grad", factor: 0.9 }, { name: "角分 ′", factor: 0.01666666667 }, { name: "角秒 ″", factor: 0.00027777778 }, { name: "圈 turn", factor: 360 }] });
unitConvTool({ file: "pressure-converter.html", title: "压强换算", desc: "在帕、千帕、兆帕、巴、标准大气压、磅力/平方英寸、毫米汞柱之间换算。", tags: ["压强", "压力", "换算"], order: 209,
  units: [{ name: "帕 Pa", factor: 1 }, { name: "千帕 kPa", factor: 1000 }, { name: "兆帕 MPa", factor: 1e6 }, { name: "巴 bar", factor: 100000 }, { name: "标准大气压 atm", factor: 101325 }, { name: "磅/英寸² psi", factor: 6894.7572932 }, { name: "毫米汞柱 mmHg", factor: 133.322368 }] });
unitConvTool({ file: "energy-converter.html", title: "能量换算", desc: "在焦耳、千焦、卡、千卡、瓦时、千瓦时、电子伏特之间换算。", tags: ["能量", "换算", "单位"], order: 210,
  units: [{ name: "焦耳 J", factor: 1 }, { name: "千焦 kJ", factor: 1000 }, { name: "卡 cal", factor: 4.184 }, { name: "千卡 kcal", factor: 4184 }, { name: "瓦时 Wh", factor: 3600 }, { name: "千瓦时 kWh", factor: 3600000 }, { name: "电子伏 eV", factor: 1.602176634e-19 }] });
unitConvTool({ file: "power-converter.html", title: "功率换算", desc: "在瓦、千瓦、兆瓦、马力、英尺·磅/秒之间换算。", tags: ["功率", "换算", "单位"], order: 211,
  units: [{ name: "瓦 W", factor: 1 }, { name: "千瓦 kW", factor: 1000 }, { name: "兆瓦 MW", factor: 1e6 }, { name: "马力 hp", factor: 745.69987158 }, { name: "英尺·磅/秒 ft·lb/s", factor: 1.3558179483 }] });
unitConvTool({ file: "frequency-converter.html", title: "频率换算", desc: "在赫兹、千赫、兆赫、吉赫、转/分之间换算。", tags: ["频率", "换算", "单位"], order: 212,
  units: [{ name: "赫兹 Hz", factor: 1 }, { name: "千赫 kHz", factor: 1000 }, { name: "兆赫 MHz", factor: 1e6 }, { name: "吉赫 GHz", factor: 1e9 }, { name: "转/分 rpm", factor: 1 / 60 }] });
unitConvTool({ file: "force-converter.html", title: "力换算", desc: "在牛、千牛、达因、磅力、千克力之间换算。", tags: ["力", "换算", "单位"], order: 213,
  units: [{ name: "牛 N", factor: 1 }, { name: "千牛 kN", factor: 1000 }, { name: "达因 dyn", factor: 1e-5 }, { name: "磅力 lbf", factor: 4.4482216153 }, { name: "千克力 kgf", factor: 9.80665 }] });
unitConvTool({ file: "current-converter.html", title: "电流换算", desc: "在毫安、安、千安之间换算。", tags: ["电流", "换算", "单位"], order: 214,
  units: [{ name: "毫安 mA", factor: 0.001 }, { name: "安 A", factor: 1 }, { name: "千安 kA", factor: 1000 }] });
unitConvTool({ file: "voltage-converter.html", title: "电压换算", desc: "在毫伏、伏、千伏之间换算。", tags: ["电压", "换算", "单位"], order: 215,
  units: [{ name: "毫伏 mV", factor: 0.001 }, { name: "伏 V", factor: 1 }, { name: "千伏 kV", factor: 1000 }] });
unitConvTool({ file: "resistance-converter.html", title: "电阻换算", desc: "在毫欧、欧、千欧、兆欧之间换算。", tags: ["电阻", "换算", "单位"], order: 216,
  units: [{ name: "毫欧 mΩ", factor: 0.001 }, { name: "欧 Ω", factor: 1 }, { name: "千欧 kΩ", factor: 1000 }, { name: "兆欧 MΩ", factor: 1e6 }] });
unitConvTool({ file: "fuel-economy-converter.html", title: "油耗换算", desc: "在升/百公里、公里/升、英里/加仑(美/英)之间换算燃油经济性。", tags: ["油耗", "换算", "汽车"], order: 217,
  units: [{ name: "升/百公里 L/100km" }, { name: "公里/升 km/L" }, { name: "英里/加仑(美) mpg" }, { name: "英里/加仑(英) mpg" }],
  conv: function (v, a, b) {
    var x;
    if (a === "升/百公里 L/100km") x = v;
    else if (a === "公里/升 km/L") x = 100 / v;
    else if (a === "英里/加仑(美) mpg") x = 235.214583 / v;
    else x = 282.480936 / v;
    if (b === "升/百公里 L/100km") return x;
    if (b === "公里/升 km/L") return 100 / x;
    if (b === "英里/加仑(美) mpg") return 235.214583 / x;
    return 282.480936 / x;
  } });
unitConvTool({ file: "temperature-converter.html", title: "温度换算", desc: "在摄氏度、华氏度、开尔文之间即时换算。", tags: ["温度", "换算", "单位"], order: 218,
  units: [{ name: "°C" }, { name: "°F" }, { name: "K" }],
  conv: function (v, a, b) {
    var c = a === "°C" ? v : a === "°F" ? (v - 32) * 5 / 9 : v - 273.15;
    if (b === "°C") return c;
    if (b === "°F") return c * 9 / 5 + 32;
    return c + 273.15;
  } });

// ---------- 计算器（抽样验证工厂）----------
calcTool({ file: "bmi-calc.html", title: "BMI 体重指数", desc: "输入体重与身高，计算 BMI 并给出偏瘦 / 正常 / 超重 / 肥胖分类。", tags: ["BMI", "健康", "体重"], order: 301,
  fields: [{ id: "weight", label: "体重 (kg)", value: 60 }, { id: "height", label: "身高 (cm)", value: 170 }],
  outputs: [{ id: "bmi", label: "BMI" }, { id: "cat", label: "分类" }],
  compute: function (args) { var h = args.height / 100; var b = args.weight / (h * h); return { bmi: fnum(b), cat: (b < 18.5 ? "偏瘦" : b < 24 ? "正常" : b < 28 ? "超重" : "肥胖") }; } });
calcTool({ file: "body-fat-calc.html", title: "体脂率估算", desc: "用 BMI、年龄与性别粗略估算体脂率，仅供参考。", tags: ["体脂", "健康", "健身"], order: 302,
  fields: [{ id: "sex", label: "性别", type: "select", options: [{ value: "男", label: "男" }, { value: "女", label: "女" }] }, { id: "weight", label: "体重 (kg)", value: 65 }, { id: "height", label: "身高 (cm)", value: 170 }, { id: "age", label: "年龄", value: 30 }],
  outputs: [{ id: "bf", label: "体脂率" }],
  compute: function (args) { var h = args.height / 100; var bmi = args.weight / (h * h); var sex = args.sex === "男" ? 1 : 0; var bf = 1.20 * bmi + 0.23 * args.age - 10.8 * sex - 5.4; return { bf: fnum(bf) + "%" }; } });
calcTool({ file: "ideal-weight-calc.html", title: "理想体重", desc: "按 Devine 公式根据身高与性别估算理想体重。", tags: ["理想体重", "健康"], order: 303,
  fields: [{ id: "sex", label: "性别", type: "select", options: [{ value: "男", label: "男" }, { value: "女", label: "女" }] }, { id: "height", label: "身高 (cm)", value: 170 }],
  outputs: [{ id: "iw", label: "理想体重" }],
  compute: function (args) { var m = (args.height - 152.4) / 2.54; var base = args.sex === "男" ? 50 : 45.5; return { iw: fnum(base + 2.3 * m) + " kg" }; } });
calcTool({ file: "bmr-calc.html", title: "基础代谢率", desc: "按 Mifflin-St Jeor 公式估算每日基础代谢（BMR）。", tags: ["BMR", "代谢", "健康"], order: 304,
  fields: [{ id: "sex", label: "性别", type: "select", options: [{ value: "男", label: "男" }, { value: "女", label: "女" }] }, { id: "weight", label: "体重 (kg)", value: 65 }, { id: "height", label: "身高 (cm)", value: 170 }, { id: "age", label: "年龄", value: 30 }],
  outputs: [{ id: "bmr", label: "BMR" }],
  compute: function (args) { var s = args.sex === "男" ? 5 : -161; return { bmr: fnum(10 * args.weight + 6.25 * args.height - 5 * args.age + s) + " kcal" }; } });
calcTool({ file: "tdee-calc.html", title: "每日消耗估算", desc: "在 BMR 基础上按活动量估算每日总能量消耗（TDEE）。", tags: ["TDEE", "消耗", "健身"], order: 305,
  fields: [{ id: "sex", label: "性别", type: "select", options: [{ value: "男", label: "男" }, { value: "女", label: "女" }] }, { id: "weight", label: "体重 (kg)", value: 65 }, { id: "height", label: "身高 (cm)", value: 170 }, { id: "age", label: "年龄", value: 30 }, { id: "activity", label: "活动量", type: "select", options: [{ value: "久坐", label: "久坐" }, { value: "轻度", label: "轻度活动" }, { value: "中度", label: "中度活动" }, { value: "高强度", label: "高强度" }, { value: "极高", label: "极高强度" }] }],
  outputs: [{ id: "bmr", label: "BMR" }, { id: "tdee", label: "TDEE" }],
  compute: function (args) { var s = args.sex === "男" ? 5 : -161; var bmr = 10 * args.weight + 6.25 * args.height - 5 * args.age + s; var f = { "久坐": 1.2, "轻度": 1.375, "中度": 1.55, "高强度": 1.725, "极高": 1.9 }[args.activity] || 1.2; return { bmr: fnum(bmr) + " kcal", tdee: fnum(bmr * f) + " kcal" }; } });
calcTool({ file: "water-calc.html", title: "每日饮水量", desc: "按体重粗略估算每日建议饮水量。", tags: ["饮水", "健康"], order: 306,
  fields: [{ id: "weight", label: "体重 (kg)", value: 65 }],
  outputs: [{ id: "l", label: "建议饮水" }],
  compute: function (args) { return { l: fnum(args.weight * 0.033) + " L" }; } });
calcTool({ file: "margin-calc.html", title: "利润与利润率", desc: "输入成本与售价，计算利润、利润率与加价率。", tags: ["利润", "利润率", "商业"], order: 307,
  fields: [{ id: "cost", label: "成本 (元)", value: 60 }, { id: "price", label: "售价 (元)", value: 100 }],
  outputs: [{ id: "profit", label: "利润" }, { id: "margin", label: "利润率" }, { id: "markup", label: "加价率" }],
  compute: function (args) { if (args.cost <= 0) return { __msg: "成本需大于 0", __type: "error" }; var p = args.price - args.cost; return { profit: fnum(p) + " 元", margin: fnum(p / args.price * 100) + "%", markup: fnum(p / args.cost * 100) + "%" }; } });
calcTool({ file: "roi-calc.html", title: "投资回报率", desc: "输入收益与成本，计算投资回报率 ROI。", tags: ["ROI", "投资", "回报"], order: 308,
  fields: [{ id: "gain", label: "总收益 (元)", value: 1200 }, { id: "cost", label: "成本 (元)", value: 1000 }],
  outputs: [{ id: "roi", label: "ROI" }],
  compute: function (args) { if (args.cost <= 0) return { __msg: "成本需大于 0", __type: "error" }; return { roi: fnum((args.gain - args.cost) / args.cost * 100) + "%" }; } });
calcTool({ file: "cagr-calc.html", title: "复合年增长率", desc: "输入期初、期末值与年数，计算复合年均增长率 CAGR。", tags: ["CAGR", "增长率", "投资"], order: 309,
  fields: [{ id: "begin", label: "期初值", value: 1000 }, { id: "end", label: "期末值", value: 2000 }, { id: "years", label: "年数", value: 5 }],
  outputs: [{ id: "cagr", label: "CAGR" }],
  compute: function (args) { if (args.begin <= 0 || args.years <= 0) return { __msg: "请输入有效数值", __type: "error" }; return { cagr: fnum((Math.pow(args.end / args.begin, 1 / args.years) - 1) * 100) + "%" }; } });
calcTool({ file: "pythagoras-calc.html", title: "勾股定理", desc: "输入直角边 a、b，求斜边 c。", tags: ["勾股", "几何", "数学"], order: 310,
  fields: [{ id: "a", label: "边 a", value: 3 }, { id: "b", label: "边 b", value: 4 }],
  outputs: [{ id: "c", label: "斜边 c" }],
  compute: function (args) { if (args.a < 0 || args.b < 0) return { __msg: "边长需非负", __type: "error" }; return { c: fnum(Math.sqrt(args.a * args.a + args.b * args.b)) }; } });
calcTool({ file: "kinetic-energy-calc.html", title: "动能计算", desc: "输入质量与速度，计算动能 E = ½mv²。", tags: ["动能", "物理", "能量"], order: 311,
  fields: [{ id: "m", label: "质量 (kg)", value: 2 }, { id: "v", label: "速度 (m/s)", value: 10 }],
  outputs: [{ id: "ke", label: "动能" }],
  compute: function (args) { if (args.m < 0 || args.v < 0) return { __msg: "请输入非负数值", __type: "error" }; return { ke: fnum(0.5 * args.m * args.v * args.v) + " J" }; } });
calcTool({ file: "factorial-calc.html", title: "阶乘计算", desc: "计算非负整数 n 的阶乘 n!。", tags: ["阶乘", "数学"], order: 312,
  fields: [{ id: "n", label: "n", value: 10, min: 0 }],
  outputs: [{ id: "fact", label: "n!" }],
  compute: function (args) { var n = Math.floor(args.n); if (n < 0) return { __msg: "请输入非负整数", __type: "error" }; if (n > 170) return { __msg: "数值过大", __type: "error" }; var r = 1; for (var i = 2; i <= n; i++) r *= i; return { fact: String(r) }; } });

// ---------- 计算器（批量，formula 规格，78 个）----------
calcTool({ file: "calorie-burn.html", title: "运动消耗", desc: "按体重、时长与运动强度（MET）估算热量消耗。", tags: ["卡路里", "运动", "健康"], order: 313, fields: [{ id: "weight", label: "体重 (kg)", value: 65 }, { id: "duration", label: "时长 (分钟)", value: 30 }, { id: "met", label: "强度 MET", type: "select", options: [{ value: "3.5", label: "散步 3.5" }, { value: "7", label: "快走 7" }, { value: "8", label: "慢跑 8" }, { value: "10", label: "跑步 10" }] }], outputs: [{ id: "kcal", label: "消耗 (kcal)" }], formulas: [{ id: "kcal", expr: "parseFloat(args.met)*3.5*args.weight/200*args.duration" }] });
calcTool({ file: "whr.html", title: "腰臀比", desc: "输入腰围与臀围，计算腰臀比 WHR。", tags: ["腰臀比", "健康"], order: 314, fields: [{ id: "waist", label: "腰围 (cm)", value: 80 }, { id: "hip", label: "臀围 (cm)", value: 95 }], outputs: [{ id: "r", label: "WHR" }], formulas: [{ id: "r", expr: "args.waist/args.hip" }] });
calcTool({ file: "bac.html", title: "血液酒精估算", desc: "按饮酒量、体重、时间与性别粗略估算血液酒精浓度 BAC。", tags: ["BAC", "酒精", "估算"], order: 315, fields: [{ id: "drinks", label: "饮酒量 (标准杯)", value: 2 }, { id: "weight", label: "体重 (kg)", value: 70 }, { id: "hours", label: "经过小时", value: 1 }, { id: "sex", label: "性别", type: "select", options: [{ value: "男", label: "男" }, { value: "女", label: "女" }] }], outputs: [{ id: "bac", label: "BAC (%)" }], formulas: [{ id: "bac", expr: "((args.drinks*14*0.789)/(args.weight*(args.sex==='男'?0.68:0.55))-0.015*args.hours)" }] });
calcTool({ file: "sleep-needed.html", title: "推荐睡眠", desc: "按年龄粗略给出每日推荐睡眠时长。", tags: ["睡眠", "健康"], order: 316, fields: [{ id: "age", label: "年龄", value: 30 }], outputs: [{ id: "h", label: "推荐 (小时)" }], formulas: [{ id: "h", expr: "args.age<=1?16:args.age<=2?14:args.age<=5?11:args.age<=13?10:args.age<=17?9:args.age<=64?8:7" }] });
calcTool({ file: "step-distance.html", title: "步数换算距离", desc: "按步数与步幅估算行走距离。", tags: ["步数", "距离", "健身"], order: 317, fields: [{ id: "steps", label: "步数", value: 6000 }, { id: "stride", label: "步幅 (cm)", value: 70 }], outputs: [{ id: "km", label: "距离 (km)" }], formulas: [{ id: "km", expr: "args.steps*args.stride/100000" }] });
calcTool({ file: "macro-split.html", title: "三大营养素", desc: "按每日热量与目标比例拆分蛋白质、脂肪与碳水的克数。", tags: ["营养", "健身", "饮食"], order: 318, fields: [{ id: "calories", label: "热量 (kcal)", value: 2000 }, { id: "proteinPct", label: "蛋白质 (%)", value: 30 }, { id: "fatPct", label: "脂肪 (%)", value: 25 }], outputs: [{ id: "pg", label: "蛋白质 (g)" }, { id: "fg", label: "脂肪 (g)" }, { id: "cg", label: "碳水 (g)" }], formulas: [{ id: "pg", expr: "args.calories*args.proteinPct/100/4" }, { id: "fg", expr: "args.calories*args.fatPct/100/9" }, { id: "cg", expr: "args.calories*(1-args.proteinPct/100-args.fatPct/100)/4" }] });
calcTool({ file: "heart-rate-zones.html", title: "心率区间", desc: "按年龄估算最大心率与常见训练区间。", tags: ["心率", "健身", "运动"], order: 319, fields: [{ id: "age", label: "年龄", value: 30 }], outputs: [{ id: "max", label: "最大心率" }, { id: "z1", label: "60%" }, { id: "z2", label: "70%" }, { id: "z3", label: "85%" }], formulas: [{ id: "max", expr: "220-args.age" }, { id: "z1", expr: "(220-args.age)*0.6" }, { id: "z2", expr: "(220-args.age)*0.7" }, { id: "z3", expr: "(220-args.age)*0.85" }] });
calcTool({ file: "waist-height.html", title: "腰高比", desc: "计算腰围与身高之比，评估中心性肥胖风险。", tags: ["腰高比", "健康"], order: 320, fields: [{ id: "waist", label: "腰围 (cm)", value: 80 }, { id: "height", label: "身高 (cm)", value: 170 }], outputs: [{ id: "r", label: "腰高比" }], formulas: [{ id: "r", expr: "args.waist/args.height" }] });
calcTool({ file: "simple-interest.html", title: "单利计算", desc: "输入本金、年利率与年限，计算单利与到期总额。", tags: ["单利", "利息", "理财"], order: 321, fields: [{ id: "principal", label: "本金 (元)", value: 10000 }, { id: "rate", label: "年利率 (%)", value: 5 }, { id: "years", label: "年限", value: 3 }], outputs: [{ id: "interest", label: "利息" }, { id: "total", label: "总额" }], formulas: [{ id: "interest", expr: "args.principal*args.rate/100*args.years" }, { id: "total", expr: "args.principal+args.principal*args.rate/100*args.years" }] });
calcTool({ file: "fv-annuity.html", title: "年金终值", desc: "按每期供款、利率与期限计算年金复利终值。", tags: ["年金", "终值", "理财"], order: 322, fields: [{ id: "pmt", label: "每期供款 (元)", value: 1000 }, { id: "rate", label: "年利率 (%)", value: 5 }, { id: "years", label: "年限", value: 10 }, { id: "freq", label: "每年期数", value: 12 }], outputs: [{ id: "fv", label: "终值" }], formulas: [{ id: "fv", expr: "(function(){var r=args.rate/100/args.freq; return args.pmt*((Math.pow(1+r,args.freq*args.years)-1)/r);})()" }] });
calcTool({ file: "pv.html", title: "现值计算", desc: "按未来金额、贴现率与年限计算现值 PV。", tags: ["现值", "贴现", "理财"], order: 323, fields: [{ id: "future", label: "未来金额 (元)", value: 20000 }, { id: "rate", label: "贴现率 (%)", value: 5 }, { id: "years", label: "年限", value: 5 }], outputs: [{ id: "pv", label: "现值" }], formulas: [{ id: "pv", expr: "args.future/Math.pow(1+args.rate/100,args.years)" }] });
calcTool({ file: "savings-goal.html", title: "储蓄目标", desc: "按当前余额、每月存入与利率估算达成目标所需月数。", tags: ["储蓄", "目标", "理财"], order: 324, fields: [{ id: "target", label: "目标金额 (元)", value: 100000 }, { id: "current", label: "当前余额 (元)", value: 10000 }, { id: "monthly", label: "每月存入 (元)", value: 2000 }, { id: "rate", label: "年利率 (%)", value: 3 }], outputs: [{ id: "months", label: "所需月数" }], formulas: [{ id: "months", expr: "(function(){var r=args.rate/100/12; var bal=args.current; var m=0; if(r<=0){return (args.target-args.current)/args.monthly;} while(bal<args.target&&m<1200){bal=bal*(1+r)+args.monthly;m++;} return m;})()" }] });
calcTool({ file: "net-worth.html", title: "净资产", desc: "输入总资产与总负债，计算净资产。", tags: ["净资产", "资产", "负债"], order: 325, fields: [{ id: "assets", label: "总资产 (元)", value: 500000 }, { id: "liabilities", label: "总负债 (元)", value: 200000 }], outputs: [{ id: "net", label: "净资产" }], formulas: [{ id: "net", expr: "args.assets-args.liabilities" }] });
calcTool({ file: "split-bill.html", title: "账单分摊", desc: "含税含小费后将账单按人数分摊。", tags: ["分摊", "聚餐", "AA"], order: 326, fields: [{ id: "total", label: "账单总额 (元)", value: 300 }, { id: "people", label: "人数", value: 3 }, { id: "taxPct", label: "税率 (%)", value: 6 }, { id: "tipPct", label: "小费 (%)", value: 10 }], outputs: [{ id: "per", label: "每人应付" }], formulas: [{ id: "per", expr: "args.total*(1+args.taxPct/100)*(1+args.tipPct/100)/args.people" }] });
calcTool({ file: "commission.html", title: "佣金计算", desc: "按销售额与佣金比例计算佣金。", tags: ["佣金", "销售", "提成"], order: 327, fields: [{ id: "sales", label: "销售额 (元)", value: 50000 }, { id: "ratePct", label: "佣金率 (%)", value: 5 }], outputs: [{ id: "c", label: "佣金" }], formulas: [{ id: "c", expr: "args.sales*args.ratePct/100" }] });
calcTool({ file: "hourly-to-salary.html", title: "时薪转月薪", desc: "按时薪与每周工时估算年收入和月收入。", tags: ["时薪", "月薪", "工资"], order: 328, fields: [{ id: "wage", label: "时薪 (元)", value: 50 }, { id: "hours", label: "每周工时", value: 40 }], outputs: [{ id: "yearly", label: "年收入" }, { id: "monthly", label: "月收入" }], formulas: [{ id: "yearly", expr: "args.wage*args.hours*52" }, { id: "monthly", expr: "args.wage*args.hours*52/12" }] });
calcTool({ file: "inflation.html", title: "通胀折算", desc: "按通胀率估算未来 equivalent 金额。", tags: ["通胀", "理财"], order: 329, fields: [{ id: "amount", label: "当前金额 (元)", value: 100 }, { id: "rate", label: "年通胀率 (%)", value: 3 }, { id: "years", label: "年限", value: 10 }], outputs: [{ id: "future", label: "未来等值" }], formulas: [{ id: "future", expr: "args.amount*Math.pow(1+args.rate/100,args.years)" }] });
calcTool({ file: "rule-of-72.html", title: "72 法则", desc: "估算本金翻倍所需年数：72 ÷ 年利率。", tags: ["72法则", "理财", "翻倍"], order: 330, fields: [{ id: "rate", label: "年利率 (%)", value: 6 }], outputs: [{ id: "y", label: "翻倍年数" }], formulas: [{ id: "y", expr: "72/args.rate" }] });
calcTool({ file: "dividend-yield.html", title: "股息率", desc: "按每股股息与股价计算股息率。", tags: ["股息", "股票", "理财"], order: 331, fields: [{ id: "dividend", label: "每股股息 (元)", value: 2 }, { id: "price", label: "股价 (元)", value: 40 }], outputs: [{ id: "y", label: "股息率 (%)" }], formulas: [{ id: "y", expr: "args.dividend/args.price*100" }] });
calcTool({ file: "profit-margin.html", title: "利润率", desc: "按利润与营收计算利润率。", tags: ["利润率", "商业"], order: 332, fields: [{ id: "profit", label: "利润 (元)", value: 200 }, { id: "revenue", label: "营收 (元)", value: 1000 }], outputs: [{ id: "m", label: "利润率 (%)" }], formulas: [{ id: "m", expr: "args.profit/args.revenue*100" }] });
calcTool({ file: "interest-only.html", title: "仅息月供", desc: "按本金与年利率估算仅还息的每月利息。", tags: ["贷款", "利息"], order: 333, fields: [{ id: "principal", label: "本金 (元)", value: 1000000 }, { id: "rate", label: "年利率 (%)", value: 4.9 }], outputs: [{ id: "m", label: "月利息" }], formulas: [{ id: "m", expr: "args.principal*args.rate/100/12" }] });
calcTool({ file: "break-even.html", title: "盈亏平衡", desc: "按固定成本、单价与单位变动成本计算盈亏平衡销量与营收。", tags: ["盈亏平衡", "商业"], order: 334, fields: [{ id: "fixed", label: "固定成本 (元)", value: 50000 }, { id: "price", label: "单价 (元)", value: 100 }, { id: "variable", label: "单位变动成本 (元)", value: 60 }], outputs: [{ id: "units", label: "平衡销量" }, { id: "revenue", label: "平衡营收" }], formulas: [{ id: "units", expr: "args.fixed/(args.price-args.variable)" }, { id: "revenue", expr: "args.fixed/(args.price-args.variable)*args.price" }] });
calcTool({ file: "salary-to-hourly.html", title: "月薪转时薪", desc: "按月薪与每周工时反推时薪。", tags: ["月薪", "时薪", "工资"], order: 335, fields: [{ id: "monthly", label: "月薪 (元)", value: 10000 }, { id: "hours", label: "每周工时", value: 40 }], outputs: [{ id: "h", label: "时薪" }], formulas: [{ id: "h", expr: "args.monthly*12/(52*args.hours)" }] });
calcTool({ file: "tax-estimate.html", title: "税额估算", desc: "按收入与税率估算税额与税后金额。", tags: ["税", "估算", "工资"], order: 336, fields: [{ id: "income", label: "收入 (元)", value: 20000 }, { id: "ratePct", label: "税率 (%)", value: 10 }], outputs: [{ id: "tax", label: "税额" }, { id: "net", label: "税后" }], formulas: [{ id: "tax", expr: "args.income*args.ratePct/100" }, { id: "net", expr: "args.income-args.income*args.ratePct/100" }] });
calcTool({ file: "area-rectangle.html", title: "矩形面积", desc: "计算矩形的面积与周长。", tags: ["面积", "矩形", "几何"], order: 337, fields: [{ id: "w", label: "宽", value: 4 }, { id: "h", label: "高", value: 3 }], outputs: [{ id: "area", label: "面积" }, { id: "perim", label: "周长" }], formulas: [{ id: "area", expr: "args.w*args.h" }, { id: "perim", expr: "2*(args.w+args.h)" }] });
calcTool({ file: "area-triangle.html", title: "三角形面积", desc: "按底与高计算三角形面积。", tags: ["面积", "三角形", "几何"], order: 338, fields: [{ id: "b", label: "底", value: 10 }, { id: "h", label: "高", value: 5 }], outputs: [{ id: "area", label: "面积" }], formulas: [{ id: "area", expr: "args.b*args.h/2" }] });
calcTool({ file: "volume-cylinder.html", title: "圆柱体积", desc: "按半径与高计算圆柱体积与表面积。", tags: ["圆柱", "体积", "几何"], order: 339, fields: [{ id: "r", label: "半径", value: 3 }, { id: "h", label: "高", value: 10 }], outputs: [{ id: "vol", label: "体积" }, { id: "surf", label: "表面积" }], formulas: [{ id: "vol", expr: "Math.PI*args.r*args.r*args.h" }, { id: "surf", expr: "2*Math.PI*args.r*(args.r+args.h)" }] });
calcTool({ file: "volume-sphere.html", title: "球体体积", desc: "按半径计算球体体积与表面积。", tags: ["球", "体积", "几何"], order: 340, fields: [{ id: "r", label: "半径", value: 5 }], outputs: [{ id: "vol", label: "体积" }, { id: "surf", label: "表面积" }], formulas: [{ id: "vol", expr: "4/3*Math.PI*Math.pow(args.r,3)" }, { id: "surf", expr: "4*Math.PI*args.r*args.r" }] });
calcTool({ file: "volume-cube.html", title: "正方体体积", desc: "按边长计算正方体体积与表面积。", tags: ["正方体", "体积", "几何"], order: 341, fields: [{ id: "a", label: "边长", value: 4 }], outputs: [{ id: "vol", label: "体积" }, { id: "surf", label: "表面积" }], formulas: [{ id: "vol", expr: "Math.pow(args.a,3)" }, { id: "surf", expr: "6*args.a*args.a" }] });
calcTool({ file: "volume-cone.html", title: "圆锥体积", desc: "按半径与高计算圆锥体积。", tags: ["圆锥", "体积", "几何"], order: 342, fields: [{ id: "r", label: "半径", value: 3 }, { id: "h", label: "高", value: 8 }], outputs: [{ id: "vol", label: "体积" }], formulas: [{ id: "vol", expr: "Math.PI*args.r*args.r*args.h/3" }] });
calcTool({ file: "polygon-area.html", title: "正多边形面积", desc: "按边数与边长计算正多边形面积。", tags: ["多边形", "面积", "几何"], order: 343, fields: [{ id: "n", label: "边数", value: 6, min: 3 }, { id: "s", label: "边长", value: 4 }], outputs: [{ id: "area", label: "面积" }], formulas: [{ id: "area", expr: "args.n*args.s*args.s/(4*Math.tan(Math.PI/args.n))" }] });
calcTool({ file: "slope.html", title: "斜率与距离", desc: "按两点坐标计算直线斜率与两点间距离。", tags: ["斜率", "坐标", "几何"], order: 344, fields: [{ id: "x1", label: "x1", value: 0 }, { id: "y1", label: "y1", value: 0 }, { id: "x2", label: "x2", value: 4 }, { id: "y2", label: "y2", value: 3 }], outputs: [{ id: "slope", label: "斜率" }, { id: "dist", label: "距离" }], formulas: [{ id: "slope", expr: "(args.y2-args.y1)/(args.x2-args.x1)" }, { id: "dist", expr: "Math.sqrt(Math.pow(args.x2-args.x1,2)+Math.pow(args.y2-args.y1,2))" }] });
calcTool({ file: "circle-diameter.html", title: "圆（按直径）", desc: "按直径计算圆面积与周长。", tags: ["圆", "面积", "几何"], order: 345, fields: [{ id: "d", label: "直径", value: 10 }], outputs: [{ id: "area", label: "面积" }, { id: "circ", label: "周长" }], formulas: [{ id: "area", expr: "Math.PI*args.d*args.d/4" }, { id: "circ", expr: "Math.PI*args.d" }] });
calcTool({ file: "triangle-angle.html", title: "三角形第三角", desc: "已知两角求第三个内角。", tags: ["三角形", "角度", "几何"], order: 346, fields: [{ id: "a", label: "角 A (°)", value: 60 }, { id: "b", label: "角 B (°)", value: 60 }], outputs: [{ id: "c", label: "角 C (°)" }], formulas: [{ id: "c", expr: "180-args.a-args.b" }] });
calcTool({ file: "ellipse-area.html", title: "椭圆面积", desc: "按长半轴与短半轴计算椭圆面积。", tags: ["椭圆", "面积", "几何"], order: 347, fields: [{ id: "a", label: "长半轴", value: 5 }, { id: "b", label: "短半轴", value: 3 }], outputs: [{ id: "area", label: "面积" }], formulas: [{ id: "area", expr: "Math.PI*args.a*args.b" }] });
calcTool({ file: "trapezoid-area.html", title: "梯形面积", desc: "按上底、下底与高计算梯形面积。", tags: ["梯形", "面积", "几何"], order: 348, fields: [{ id: "a", label: "上底", value: 4 }, { id: "b", label: "下底", value: 8 }, { id: "h", label: "高", value: 5 }], outputs: [{ id: "area", label: "面积" }], formulas: [{ id: "area", expr: "(args.a+args.b)*args.h/2" }] });
calcTool({ file: "speed.html", title: "速度计算", desc: "按距离与时间计算速度。", tags: ["速度", "物理"], order: 349, fields: [{ id: "distance", label: "距离", value: 100 }, { id: "time", label: "时间", value: 10 }], outputs: [{ id: "v", label: "速度" }], formulas: [{ id: "v", expr: "args.distance/args.time" }] });
calcTool({ file: "density.html", title: "密度计算", desc: "按质量与体积计算密度。", tags: ["密度", "物理"], order: 350, fields: [{ id: "mass", label: "质量", value: 10 }, { id: "volume", label: "体积", value: 2 }], outputs: [{ id: "d", label: "密度" }], formulas: [{ id: "d", expr: "args.mass/args.volume" }] });
calcTool({ file: "ohm.html", title: "欧姆定律", desc: "按电压与电流计算电阻与功率。", tags: ["欧姆", "电学", "物理"], order: 351, fields: [{ id: "V", label: "电压 (V)", value: 12 }, { id: "I", label: "电流 (A)", value: 2 }], outputs: [{ id: "R", label: "电阻 (Ω)" }, { id: "P", label: "功率 (W)" }], formulas: [{ id: "R", expr: "args.V/args.I" }, { id: "P", expr: "args.V*args.I" }] });
calcTool({ file: "potential-energy.html", title: "重力势能", desc: "按质量与高度计算重力势能。", tags: ["势能", "物理"], order: 352, fields: [{ id: "m", label: "质量 (kg)", value: 10 }, { id: "h", label: "高度 (m)", value: 5 }], outputs: [{ id: "pe", label: "势能 (J)" }], formulas: [{ id: "pe", expr: "args.m*9.8*args.h" }] });
calcTool({ file: "force-newton.html", title: "牛顿第二定律", desc: "按质量与加速度计算合力 F = ma。", tags: ["力", "物理"], order: 353, fields: [{ id: "m", label: "质量 (kg)", value: 10 }, { id: "a", label: "加速度 (m/s²)", value: 2 }], outputs: [{ id: "f", label: "力 (N)" }], formulas: [{ id: "f", expr: "args.m*args.a" }] });
calcTool({ file: "work-energy.html", title: "功计算", desc: "按力与位移计算做功 W = Fd。", tags: ["功", "物理"], order: 354, fields: [{ id: "F", label: "力 (N)", value: 50 }, { id: "d", label: "位移 (m)", value: 4 }], outputs: [{ id: "w", label: "功 (J)" }], formulas: [{ id: "w", expr: "args.F*args.d" }] });
calcTool({ file: "wavelength.html", title: "波长计算", desc: "按频率与波速计算波长 λ = v / f。", tags: ["波长", "物理"], order: 355, fields: [{ id: "freq", label: "频率 (Hz)", value: 100 }, { id: "speed", label: "波速 (m/s)", value: 299792458 }], outputs: [{ id: "lam", label: "波长 (m)" }], formulas: [{ id: "lam", expr: "args.speed/args.freq" }] });
calcTool({ file: "decibel.html", title: "分贝换算", desc: "按功率比计算分贝值 dB = 10·log10(比值)。", tags: ["分贝", "声学", "物理"], order: 356, fields: [{ id: "ratio", label: "功率比", value: 10 }], outputs: [{ id: "db", label: "分贝 (dB)" }], formulas: [{ id: "db", expr: "10*Math.log10(args.ratio)" }] });
calcTool({ file: "heat-energy.html", title: "热量计算", desc: "按质量、比热容与温差计算热量 Q = mcΔT。", tags: ["热量", "物理"], order: 357, fields: [{ id: "m", label: "质量 (kg)", value: 1 }, { id: "c", label: "比热 (J/kg·K)", value: 4186 }, { id: "dT", label: "温差 (K)", value: 80 }], outputs: [{ id: "q", label: "热量 (J)" }], formulas: [{ id: "q", expr: "args.m*args.c*args.dT" }] });
calcTool({ file: "pressure-from-force.html", title: "压强计算", desc: "按力与面积计算压强 P = F / A。", tags: ["压强", "物理"], order: 358, fields: [{ id: "F", label: "力 (N)", value: 100 }, { id: "A", label: "面积 (m²)", value: 2 }], outputs: [{ id: "p", label: "压强 (Pa)" }], formulas: [{ id: "p", expr: "args.F/args.A" }] });
calcTool({ file: "gravity.html", title: "万有引力", desc: "按两物体质量与距离计算引力。", tags: ["引力", "物理"], order: 359, fields: [{ id: "m1", label: "质量 1 (kg)", value: 1000 }, { id: "m2", label: "质量 2 (kg)", value: 1000 }, { id: "r", label: "距离 (m)", value: 5 }], outputs: [{ id: "f", label: "引力 (N)" }], formulas: [{ id: "f", expr: "6.674e-11*args.m1*args.m2/(args.r*args.r)" }] });
calcTool({ file: "projectile-range.html", title: "抛射射程", desc: "按初速度与仰角计算水平射程。", tags: ["抛体", "物理"], order: 360, fields: [{ id: "v", label: "初速度 (m/s)", value: 20 }, { id: "angle", label: "仰角 (°)", value: 45 }], outputs: [{ id: "r", label: "射程 (m)" }], formulas: [{ id: "r", expr: "Math.pow(args.v,2)*Math.sin(2*args.angle*Math.PI/180)/9.8" }] });
calcTool({ file: "pendulum.html", title: "单摆周期", desc: "按摆长计算单摆周期 T = 2π√(L/g)。", tags: ["单摆", "物理"], order: 361, fields: [{ id: "L", label: "摆长 (m)", value: 1 }], outputs: [{ id: "t", label: "周期 (s)" }], formulas: [{ id: "t", expr: "2*Math.PI*Math.sqrt(args.L/9.8)" }] });
calcTool({ file: "spring-force.html", title: "胡克定律", desc: "按劲度系数与形变量计算弹力 F = kx。", tags: ["弹簧", "物理"], order: 362, fields: [{ id: "k", label: "劲度 (N/m)", value: 100 }, { id: "x", label: "形变量 (m)", value: 0.2 }], outputs: [{ id: "f", label: "弹力 (N)" }], formulas: [{ id: "f", expr: "args.k*args.x" }] });
calcTool({ file: "power-physics.html", title: "功率计算", desc: "按力与速度计算功率 P = Fv。", tags: ["功率", "物理"], order: 363, fields: [{ id: "F", label: "力 (N)", value: 50 }, { id: "v", label: "速度 (m/s)", value: 3 }], outputs: [{ id: "p", label: "功率 (W)" }], formulas: [{ id: "p", expr: "args.F*args.v" }] });
calcTool({ file: "momentum.html", title: "动量计算", desc: "按质量与速度计算动量 p = mv。", tags: ["动量", "物理"], order: 364, fields: [{ id: "m", label: "质量 (kg)", value: 10 }, { id: "v", label: "速度 (m/s)", value: 5 }], outputs: [{ id: "p", label: "动量 (kg·m/s)" }], formulas: [{ id: "p", expr: "args.m*args.v" }] });
calcTool({ file: "torque.html", title: "力矩计算", desc: "按力与力臂计算力矩 τ = Fr。", tags: ["力矩", "物理"], order: 365, fields: [{ id: "F", label: "力 (N)", value: 50 }, { id: "r", label: "力臂 (m)", value: 0.5 }], outputs: [{ id: "t", label: "力矩 (N·m)" }], formulas: [{ id: "t", expr: "args.F*args.r" }] });
calcTool({ file: "centripetal.html", title: "向心力", desc: "按质量、速度与半径计算向心力。", tags: ["向心力", "物理"], order: 366, fields: [{ id: "m", label: "质量 (kg)", value: 2 }, { id: "v", label: "速度 (m/s)", value: 10 }, { id: "r", label: "半径 (m)", value: 5 }], outputs: [{ id: "f", label: "向心力 (N)" }], formulas: [{ id: "f", expr: "args.m*args.v*args.v/args.r" }] });
calcTool({ file: "percent-change.html", title: "百分比变化", desc: "计算从旧值到新值的百分比增减。", tags: ["百分比", "变化", "数学"], order: 367, fields: [{ id: "old", label: "原值", value: 80 }, { id: "nnew", label: "新值", value: 100 }], outputs: [{ id: "p", label: "变化 (%)" }], formulas: [{ id: "p", expr: "(args.nnew-args.old)/args.old*100" }] });
calcTool({ file: "log-calc.html", title: "对数计算", desc: "按底数与真数计算对数值。", tags: ["对数", "数学"], order: 368, fields: [{ id: "value", label: "真数", value: 100 }, { id: "base", label: "底数", value: 10 }], outputs: [{ id: "r", label: "结果" }], formulas: [{ id: "r", expr: "Math.log(args.value)/Math.log(args.base)" }] });
calcTool({ file: "power-calc.html", title: "幂运算", desc: "计算底数的指定次幂。", tags: ["幂", "指数", "数学"], order: 369, fields: [{ id: "base", label: "底数", value: 2 }, { id: "exp", label: "指数", value: 10 }], outputs: [{ id: "r", label: "结果" }], formulas: [{ id: "r", expr: "Math.pow(args.base,args.exp)" }] });
calcTool({ file: "modulo.html", title: "取模运算", desc: "计算两数相除的余数。", tags: ["取模", "余数", "数学"], order: 370, fields: [{ id: "a", label: "被除数", value: 17 }, { id: "b", label: "除数", value: 5 }], outputs: [{ id: "r", label: "余数" }], formulas: [{ id: "r", expr: "args.a % args.b" }] });
calcTool({ file: "round-to.html", title: "保留小数", desc: "将数值四舍五入保留指定小数位。", tags: ["四舍五入", "数学"], order: 371, fields: [{ id: "value", label: "数值", value: 3.14159 }, { id: "decimals", label: "小数位", value: 2, min: 0 }], outputs: [{ id: "r", label: "结果" }], formulas: [{ id: "r", expr: "(function(){var f=Math.pow(10,args.decimals); return Math.round(args.value*f)/f;})()" }] });
calcTool({ file: "scientific-notation.html", title: "科学计数法", desc: "将数值转换为科学计数法表示。", tags: ["科学计数法", "数学"], order: 372, fields: [{ id: "value", label: "数值", value: 123456789 }], outputs: [{ id: "r", label: "结果" }], formulas: [{ id: "r", expr: "args.value.toExponential(3)" }] });
calcTool({ file: "paint-needed.html", title: "涂料用量", desc: "按面积与单位覆盖率估算涂料升数。", tags: ["涂料", "装修", "家居"], order: 373, fields: [{ id: "area", label: "面积 (m²)", value: 30 }, { id: "coverage", label: "覆盖率 (m²/L)", value: 10 }], outputs: [{ id: "l", label: "用量 (L)" }], formulas: [{ id: "l", expr: "args.area/args.coverage" }] });
calcTool({ file: "tile-needed.html", title: "瓷砖数量", desc: "按房间面积与瓷砖边长估算所需瓷砖数（含 10% 损耗）。", tags: ["瓷砖", "装修", "家居"], order: 374, fields: [{ id: "area", label: "面积 (m²)", value: 20 }, { id: "tileSize", label: "瓷砖边长 (cm)", value: 60 }], outputs: [{ id: "n", label: "数量 (块)" }], formulas: [{ id: "n", expr: "args.area/(args.tileSize*args.tileSize/10000)*1.1" }] });
calcTool({ file: "flooring-cost.html", title: "地板费用", desc: "按面积与单价估算地板费用。", tags: ["地板", "装修", "家居"], order: 375, fields: [{ id: "area", label: "面积 (m²)", value: 25 }, { id: "price", label: "单价 (元/m²)", value: 120 }], outputs: [{ id: "c", label: "费用 (元)" }], formulas: [{ id: "c", expr: "args.area*args.price" }] });
calcTool({ file: "concrete-slab.html", title: "混凝土用量", desc: "按长、宽、厚估算混凝土体积（米制）。", tags: ["混凝土", "装修", "家居"], order: 376, fields: [{ id: "l", label: "长 (m)", value: 4 }, { id: "w", label: "宽 (m)", value: 3 }, { id: "t", label: "厚 (m)", value: 0.1 }], outputs: [{ id: "v", label: "体积 (m³)" }], formulas: [{ id: "v", expr: "args.l*args.w*args.t" }] });
calcTool({ file: "wallpaper.html", title: "壁纸卷数", desc: "按面积与单卷覆盖率估算所需壁纸卷数。", tags: ["壁纸", "装修", "家居"], order: 377, fields: [{ id: "area", label: "面积 (m²)", value: 40 }, { id: "roll", label: "单卷覆盖 (m²)", value: 5 }], outputs: [{ id: "n", label: "卷数" }], formulas: [{ id: "n", expr: "Math.ceil(args.area/args.roll)" }] });
calcTool({ file: "cooking-scale.html", title: "配方缩放", desc: "按目标份数缩放食材用量。", tags: ["食谱", "缩放", "厨房"], order: 378, fields: [{ id: "originalServings", label: "原份数", value: 4 }, { id: "targetServings", label: "目标份数", value: 6 }, { id: "amount", label: "原用量", value: 200 }], outputs: [{ id: "r", label: "新用量" }], formulas: [{ id: "r", expr: "args.amount*args.targetServings/args.originalServings" }] });
calcTool({ file: "unit-price.html", title: "单价计算", desc: "按总价与数量计算单位价格。", tags: ["单价", "比价", "购物"], order: 379, fields: [{ id: "price", label: "总价 (元)", value: 50 }, { id: "quantity", label: "数量", value: 5 }], outputs: [{ id: "up", label: "单价" }], formulas: [{ id: "up", expr: "args.price/args.quantity" }] });
calcTool({ file: "grade-needed.html", title: "目标均分", desc: "按当前平均分与期末权重，计算期末需拿到的分数。", tags: ["成绩", "均分", "教育"], order: 380, fields: [{ id: "currentAvg", label: "当前平均", value: 80 }, { id: "weightPct", label: "期末权重 (%)", value: 40 }, { id: "desired", label: "目标平均", value: 85 }], outputs: [{ id: "need", label: "期末需得" }], formulas: [{ id: "need", expr: "(args.desired-args.currentAvg*(1-args.weightPct/100))/(args.weightPct/100)" }] });
calcTool({ file: "exam-score.html", title: "得分率", desc: "按答对题数与总题数计算得分百分比。", tags: ["得分", "考试", "教育"], order: 381, fields: [{ id: "correct", label: "答对", value: 45 }, { id: "total", label: "总题数", value: 50 }], outputs: [{ id: "p", label: "得分率 (%)" }], formulas: [{ id: "p", expr: "args.correct/args.total*100" }] });
calcTool({ file: "time-to-read.html", title: "阅读时长", desc: "按字数与阅读速度估算阅读所需时间（分钟）。", tags: ["阅读", "时间", "效率"], order: 382, fields: [{ id: "words", label: "字数", value: 2000 }, { id: "wpm", label: "阅读速度 (字/分)", value: 300 }], outputs: [{ id: "m", label: "分钟" }], formulas: [{ id: "m", expr: "args.words/args.wpm" }] });
calcTool({ file: "discount-amount.html", title: "折扣金额", desc: "按原价与折扣力度计算省下金额与折后价。", tags: ["折扣", "省钱", "购物"], order: 383, fields: [{ id: "price", label: "原价 (元)", value: 199 }, { id: "discountPct", label: "折扣 (%)", value: 30 }], outputs: [{ id: "saved", label: "省下" }, { id: "final", label: "折后价" }], formulas: [{ id: "saved", expr: "args.price*args.discountPct/100" }, { id: "final", expr: "args.price*(1-args.discountPct/100)" }] });
calcTool({ file: "sales-tax.html", title: "消费税", desc: "按价格与税率计算税额与含税价。", tags: ["税", "购物"], order: 384, fields: [{ id: "price", label: "价格 (元)", value: 100 }, { id: "taxPct", label: "税率 (%)", value: 13 }], outputs: [{ id: "tax", label: "税额" }, { id: "withTax", label: "含税价" }], formulas: [{ id: "tax", expr: "args.price*args.taxPct/100" }, { id: "withTax", expr: "args.price*(1+args.taxPct/100)" }] });
calcTool({ file: "increase-amount.html", title: "增幅计算", desc: "按数值与增幅百分比计算增加量与结果。", tags: ["增幅", "数学"], order: 385, fields: [{ id: "value", label: "数值", value: 100 }, { id: "percent", label: "增幅 (%)", value: 20 }], outputs: [{ id: "add", label: "增加量" }, { id: "result", label: "结果" }], formulas: [{ id: "add", expr: "args.value*args.percent/100" }, { id: "result", expr: "args.value*(1+args.percent/100)" }] });
calcTool({ file: "parallelogram-area.html", title: "平行四边形面积", desc: "按底与高计算平行四边形面积。", tags: ["平行四边形", "面积", "几何"], order: 386, fields: [{ id: "base", label: "底", value: 8 }, { id: "h", label: "高", value: 5 }], outputs: [{ id: "area", label: "面积" }], formulas: [{ id: "area", expr: "args.base*args.h" }] });
calcTool({ file: "circle-radius.html", title: "圆（按半径）", desc: "按半径计算圆面积与周长。", tags: ["圆", "面积", "几何"], order: 387, fields: [{ id: "r", label: "半径", value: 5 }], outputs: [{ id: "area", label: "面积" }, { id: "circ", label: "周长" }], formulas: [{ id: "area", expr: "Math.PI*args.r*args.r" }, { id: "circ", expr: "2*Math.PI*args.r" }] });
calcTool({ file: "right-triangle-hypotenuse.html", title: "斜边比例", desc: "按两直角边计算斜边及其与直角边 a 的比值。", tags: ["勾股", "几何"], order: 388, fields: [{ id: "a", label: "边 a", value: 3 }, { id: "b", label: "边 b", value: 4 }], outputs: [{ id: "c", label: "斜边" }, { id: "ratio", label: "c / a" }], formulas: [{ id: "c", expr: "Math.sqrt(args.a*args.a+args.b*args.b)" }, { id: "ratio", expr: "Math.sqrt(args.a*args.a+args.b*args.b)/args.a" }] });
calcTool({ file: "average-speed.html", title: "平均速度", desc: "按总路程与总时间计算平均速度。", tags: ["速度", "物理"], order: 389, fields: [{ id: "dist", label: "总路程", value: 300 }, { id: "time", label: "总时间", value: 5 }], outputs: [{ id: "v", label: "平均速度" }], formulas: [{ id: "v", expr: "args.dist/args.time" }] });
calcTool({ file: "fuel-cost-trip.html", title: "行程油费", desc: "按里程、油耗与油价估算单程油费。", tags: ["油费", "自驾", "出行"], order: 390, fields: [{ id: "km", label: "里程 (km)", value: 200 }, { id: "l100", label: "百公里油耗 (L)", value: 7.5 }, { id: "price", label: "油价 (元/L)", value: 8 }], outputs: [{ id: "cost", label: "油费 (元)" }], formulas: [{ id: "cost", expr: "args.km/100*args.l100*args.price" }] });

// ====================================================================
// 生成器工厂：随机生成、文本变换、CSS 生成
// ====================================================================
function genTool(spec) {
  var isItems = !spec.gen && spec.items;
  var fields = (spec.fields || []).slice();
  if (isItems) fields = [{ id: "count", label: "数量", value: (spec.count || 5), min: 1, max: 500, step: 1 }].concat(fields);
  var fieldsHtml = fields.map(function (f) {
    if (f.type === "select") { var o = f.options.map(function (x) { return '<option value="' + x.value + '">' + x.label + '</option>'; }).join(""); return '  <div class="field"><label for="' + f.id + '">' + f.label + '</label><select id="' + f.id + '">' + o + '</select></div>'; }
    if (f.type === "checkbox") return '  <label class="chk"><input type="checkbox" id="' + f.id + '"' + (f.checked ? " checked" : "") + '> ' + f.label + '</label>';
    if (f.type === "textarea") return '  <div class="field"><label for="' + f.id + '">' + f.label + '</label><textarea id="' + f.id + '" class="code" spellcheck="false" rows="' + (f.rows || 6) + '"' + (f.placeholder ? ' placeholder="' + f.placeholder + '"' : "") + '>' + (f.value || "") + '</textarea></div>';
    return '  <div class="field"><label for="' + f.id + '">' + f.label + '</label><input type="' + (f.type || "number") + '" id="' + f.id + '"' + (f.value !== undefined ? ' value="' + f.value + '"' : "") + (f.min !== undefined ? ' min="' + f.min + '"' : "") + (f.max !== undefined ? ' max="' + f.max + '"' : "") + (f.step !== undefined ? ' step="' + f.step + '"' : "") + '></div>';
  }).join("\n");
  var body = (fieldsHtml ? '<div class="grid-2">\n' + fieldsHtml + '\n</div>\n' : "") + '<div class="field" style="margin-top:14px"><label for="out">生成结果</label><textarea id="out" class="code" readonly spellcheck="false" placeholder="点击生成"></textarea></div>\n<div class="actions">\n  <button class="btn primary" id="gen" type="button">生成</button>\n  <button class="btn" id="copy" type="button">复制</button>\n</div>\n<p class="status" id="status" aria-live="polite"></p>';
  var reads = fields.map(function (f) {
    if (f.type === "checkbox") return '    args["' + f.id + '"]=$("#' + f.id + '").checked;';
    if (f.type === "select" || f.type === "text") return '    args["' + f.id + '"]=$("#' + f.id + '").value;';
    return '    args["' + f.id + '"]=parseFloat($("#' + f.id + '").value);';
  }).join("\n");
  var ids = fields.map(function (f) { return f.id; }).join('","');
  var genPart;
  if (isItems) {
    var ITEMS = JSON.stringify(spec.items);
    var SEP = JSON.stringify(spec.sep || "\n");
    genPart = '  var ITEMS=' + ITEMS + '; var SEP=' + SEP + ';\n  function gen(args){ var n=Math.max(1,Math.floor(args.count)||1); var a=[]; for(var i=0;i<n;i++){ a.push(ITEMS[Math.floor(Math.random()*ITEMS.length)]); } return a.join(SEP); }';
  } else {
    var gsrc = spec.gen.toString().replace(/^function\s*\w*\s*\([^)]*\)\s*\{/, "").replace(/\}\s*$/, "");
    genPart = '  function gen(args){\n' + gsrc + '\n  }';
  }
  var script = '(function(){\n  var $=PHT.$; var statusEl=$("#status"); var out=$("#out");\n' + genPart + '\n  function run(){ var args={};\n' + reads + '\n    try { var r=gen(args); out.value=(typeof r==="string")?r:String(r); PHT.status(statusEl,"已生成","ok"); } catch(e){ PHT.status(statusEl,"出错了："+e.message,"error"); }\n  }\n'
    + (ids ? '  ["' + ids + '"].forEach(function(k){ $("#"+k).addEventListener("input",run); $("#"+k).addEventListener("change",run); });\n' : "")
    + '  $("#gen").addEventListener("click",run);\n  $("#copy").addEventListener("click",function(){ if(!out.value){ PHT.status(statusEl,"没有内容","error"); return; } PHT.copy(out.value).then(function(ok){ PHT.flash($("#copy"),"已复制"); PHT.status(statusEl,ok?"已复制":"复制失败",ok?"ok":"error"); }); });\n  run();\n})();';
  TOOLS.push({ file: spec.file, meta: { title: spec.title, desc: spec.desc, category: spec.category || "util", tags: spec.tags, order: spec.order }, body: body, script: script });
}

function textTool(spec) {
  var fieldsHtml = spec.fields.map(function (f) {
    if (f.type === "select") { var o = f.options.map(function (x) { return '<option value="' + x.value + '">' + x.label + '</option>'; }).join(""); return '  <div class="field"><label for="' + f.id + '">' + f.label + '</label><select id="' + f.id + '">' + o + '</select></div>'; }
    if (f.type === "checkbox") return '  <label class="chk"><input type="checkbox" id="' + f.id + '"' + (f.checked ? " checked" : "") + '> ' + f.label + '</label>';
    if (f.type === "textarea") return '  <div class="field"><label for="' + f.id + '">' + f.label + '</label><textarea id="' + f.id + '" class="code" spellcheck="false" rows="' + (f.rows || 8) + '"' + (f.placeholder ? ' placeholder="' + f.placeholder + '"' : "") + '>' + (f.value || "") + '</textarea></div>';
    return '  <div class="field"><label for="' + f.id + '">' + f.label + '</label><input type="' + (f.type || "text") + '" id="' + f.id + '"' + (f.value !== undefined ? ' value="' + f.value + '"' : "") + (f.placeholder ? ' placeholder="' + f.placeholder + '"' : "") + '></div>';
  }).join("\n");
  var body = fieldsHtml + '\n<div class="field" style="margin-top:14px"><label for="out">输出</label><textarea id="out" class="code" readonly spellcheck="false" placeholder="处理结果"></textarea></div>\n<div class="actions">\n  <button class="btn primary" id="copy" type="button">复制</button>\n</div>\n<p class="status" id="status" aria-live="polite"></p>';
  var reads = spec.fields.map(function (f) {
    if (f.type === "checkbox") return '    args["' + f.id + '"]=$("#' + f.id + '").checked;';
    return '    args["' + f.id + '"]=$("#' + f.id + '").value;';
  }).join("\n");
  var ids = spec.fields.map(function (f) { return f.id; }).join('","');
  var tsrc = spec.transform.toString().replace(/^function\s*\w*\s*\([^)]*\)\s*\{/, "").replace(/\}\s*$/, "");
  var script = '(function(){\n  var $=PHT.$; var statusEl=$("#status"); var out=$("#out");\n  function transform(args){\n' + tsrc + '\n  }\n  function run(){ var args={};\n' + reads + '\n    try { out.value=transform(args); PHT.status(statusEl,"已处理","ok"); } catch(e){ PHT.status(statusEl,"出错了："+e.message,"error"); }\n  }\n'
    + '  ["' + ids + '"].forEach(function(k){ $("#"+k).addEventListener("input",run); $("#"+k).addEventListener("change",run); });\n'
    + '  $("#copy").addEventListener("click",function(){ if(!out.value){ PHT.status(statusEl,"没有内容","error"); return; } PHT.copy(out.value).then(function(ok){ PHT.flash($("#copy"),"已复制"); PHT.status(statusEl,ok?"已复制":"复制失败",ok?"ok":"error"); }); });\n  run();\n})();';
  TOOLS.push({ file: spec.file, meta: { title: spec.title, desc: spec.desc, category: "text", tags: spec.tags, order: spec.order }, body: body, script: script });
}

function cssTool(spec) {
  var fieldsHtml = spec.fields.map(function (f) {
    if (f.type === "select") { var o = f.options.map(function (x) { return '<option value="' + x.value + '">' + x.label + '</option>'; }).join(""); return '  <div class="field"><label for="' + f.id + '">' + f.label + '</label><select id="' + f.id + '">' + o + '</select></div>'; }
    if (f.type === "checkbox") return '  <label class="chk"><input type="checkbox" id="' + f.id + '"' + (f.checked ? " checked" : "") + '> ' + f.label + '</label>';
    return '  <div class="field"><label for="' + f.id + '">' + f.label + '</label><input type="' + (f.type || "number") + '" id="' + f.id + '"' + (f.value !== undefined ? ' value="' + f.value + '"' : "") + (f.step !== undefined ? ' step="' + f.step + '"' : "") + '></div>';
  }).join("\n");
  var body = (fieldsHtml ? '<div class="grid-2">\n' + fieldsHtml + '\n</div>\n' : "") + '<div class="field" style="margin-top:14px"><label for="css">生成的 CSS</label><textarea id="css" class="code" readonly spellcheck="false" placeholder="CSS"></textarea></div>\n'
    + (spec.preview ? '<div class="preview-box" style="margin-top:12px"><div id="pv" style="padding:24px;text-align:center">预览效果</div></div>\n' : "")
    + '<div class="actions">\n  <button class="btn primary" id="copy" type="button">复制 CSS</button>\n</div>\n<p class="status" id="status" aria-live="polite"></p>';
  var reads = spec.fields.map(function (f) {
    if (f.type === "checkbox") return '    args["' + f.id + '"]=$("#' + f.id + '").checked;';
    if (f.type === "select" || f.type === "text") return '    args["' + f.id + '"]=$("#' + f.id + '").value;';
    return '    args["' + f.id + '"]=parseFloat($("#' + f.id + '").value);';
  }).join("\n");
  var ids = spec.fields.map(function (f) { return f.id; }).join('","');
  var csrc = spec.css.toString().replace(/^function\s*\w*\s*\([^)]*\)\s*\{/, "").replace(/\}\s*$/, "");
  var script = '(function(){\n  var $=PHT.$; var statusEl=$("#status"); var cssBox=$("#css");\n  function build(args){ ' + csrc + ' }\n  function run(){ var args={};\n' + reads + '\n    try { var c=build(args); cssBox.value=c; ' + (spec.preview ? 'var pv=$("#pv"); if(pv) pv.style.cssText=c; ' : "") + 'PHT.status(statusEl,"已生成","ok"); } catch(e){ PHT.status(statusEl,"出错了："+e.message,"error"); }\n  }\n'
    + '  ["' + ids + '"].forEach(function(k){ $("#"+k).addEventListener("input",run); $("#"+k).addEventListener("change",run); });\n'
    + '  $("#copy").addEventListener("click",function(){ if(!cssBox.value){ PHT.status(statusEl,"没有内容","error"); return; } PHT.copy(cssBox.value).then(function(ok){ PHT.flash($("#copy"),"已复制"); PHT.status(statusEl,ok?"已复制":"复制失败",ok?"ok":"error"); }); });\n  run();\n})();';
  TOOLS.push({ file: spec.file, meta: { title: spec.title, desc: spec.desc, category: "design", tags: spec.tags, order: spec.order }, body: body, script: script });
}

// 抽样验证工厂
genTool({ file: "coin-flip.html", title: "抛硬币", desc: "随机给出正面或反面，用于快速决策。", category: "util", tags: ["硬币", "随机", "决策"], order: 401,
  gen: function (args) { return Math.random() < 0.5 ? "正面" : "反面"; } });
textTool({ file: "prefix-lines.html", title: "行前加前缀", desc: "为每一行文本添加指定前缀。", tags: ["前缀", "行处理", "文本"], order: 501,
  fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "每行一条" }, { id: "prefix", label: "前缀", type: "text", value: "- " }],
  transform: function (args) { return args.text.split("\n").map(function (l) { return args.prefix + l; }).join("\n"); } });
genTool({ file: "random-fact.html", title: "随机冷知识", desc: "随机展示一条冷知识。", category: "util", tags: ["冷知识", "随机", "趣味"], order: 402,
  items: ["蜂蜜永远不会变质。", "蜗牛可以睡上三年。", "章鱼有三颗心脏。", "香蕉是浆果，草莓不是。", "闪电比太阳表面还热。", "人类和香蕉共享约 60% 的基因。", "金星上的一天比一年还长。", "水母没有大脑。"] });
genTool({ file: "random-quote.html", title: "随机名言", desc: "随机展示一句名言。", category: "util", tags: ["名言", "随机", "励志"], order: 403,
  items: ["千里之行，始于足下。", "学而不思则罔，思而不学则殆。", "机会总是留给有准备的人。", "坚持就是胜利。", "细节决定成败。", "时间就是金钱。"] });
cssTool({ file: "gradient-border.html", title: "渐变边框", desc: "生成渐变边框 CSS，可实时预览。", tags: ["边框", "渐变", "CSS"], order: 601, preview: true,
  fields: [{ id: "w", label: "边框宽 (px)", value: 4 }, { id: "dir", label: "方向", type: "select", options: [{ value: "90deg", label: "水平" }, { value: "0deg", label: "垂直" }] }, { id: "c1", label: "颜色 1", type: "text", value: "#0f766e" }, { id: "c2", label: "颜色 2", type: "text", value: "#fb923c" }],
  css: function (args) { return "border: " + args.w + "px solid; border-image: linear-gradient(" + args.dir + ", " + args.c1 + ", " + args.c2 + ") 1; padding:16px;"; } });

// ---------- 文本工具（21 个）----------
textTool({ file: "suffix-lines.html", title: "行尾加后缀", desc: "为每一行文本添加指定后缀。", tags: ["后缀", "行处理", "文本"], order: 501, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "每行一条" }, { id: "suffix", label: "后缀", type: "text", value: " #" }], transform: function (args) { return args.text.split("\n").map(function (l) { return l + args.suffix; }).join("\n"); } });
textTool({ file: "number-lines.html", title: "行号前缀", desc: "为每行添加递增序号前缀。", tags: ["行号", "编号", "文本"], order: 502, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "每行一条" }], transform: function (args) { return args.text.split("\n").map(function (l, i) { return (i + 1) + ". " + l; }).join("\n"); } });
textTool({ file: "sort-lines.html", title: "行排序（升序）", desc: "按字母顺序对各行升序排序。", tags: ["排序", "行处理", "文本"], order: 503, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "每行一条" }], transform: function (args) { return args.text.split("\n").sort().join("\n"); } });
textTool({ file: "sort-lines-desc.html", title: "行排序（降序）", desc: "按字母顺序对各行降序排序。", tags: ["排序", "行处理", "文本"], order: 504, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "每行一条" }], transform: function (args) { return args.text.split("\n").sort().reverse().join("\n"); } });
textTool({ file: "unique-lines.html", title: "去重行", desc: "保留首次出现的顺序去除重复行。", tags: ["去重", "行处理", "文本"], order: 505, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "每行一条" }], transform: function (args) { var a = args.text.split("\n"), seen = {}, out = []; for (var i = 0; i < a.length; i++) { if (!seen[a[i]]) { seen[a[i]] = 1; out.push(a[i]); } } return out.join("\n"); } });
textTool({ file: "shuffle-lines.html", title: "乱序行", desc: "随机打乱各行顺序。", tags: ["乱序", "随机", "文本"], order: 506, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "每行一条" }], transform: function (args) { var a = args.text.split("\n"); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a.join("\n"); } });
textTool({ file: "join-lines.html", title: "合并为单行", desc: "用指定分隔符把多行合并成一行。", tags: ["合并", "行处理", "文本"], order: 507, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "每行一条" }, { id: "sep", label: "分隔符", type: "text", value: ", " }], transform: function (args) { return args.text.split("\n").join(args.sep); } });
textTool({ file: "split-lines.html", title: "拆分为多行", desc: "按分隔符把一行文本拆成多行。", tags: ["拆分", "行处理", "文本"], order: 508, fields: [{ id: "text", label: "文本", type: "textarea", rows: 4, placeholder: "用分隔符连接的内容" }, { id: "sep", label: "分隔符", type: "text", value: ", " }], transform: function (args) { return args.text.split(args.sep).join("\n"); } });
textTool({ file: "remove-empty-lines.html", title: "删除空行", desc: "移除文本中的空白行。", tags: ["空行", "清洗", "文本"], order: 509, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "每行一条" }], transform: function (args) { return args.text.split("\n").filter(function (l) { return l.trim() !== ""; }).join("\n"); } });
textTool({ file: "extract-emails.html", title: "提取邮箱", desc: "从文本中提取所有邮箱地址。", tags: ["邮箱", "提取", "文本"], order: 510, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "粘贴文本" }], transform: function (args) { var m = args.text.match(/[^\s@]+@[^\s@]+\.[^\s@]+/g); return m ? m.join("\n") : "（未找到）"; } });
textTool({ file: "extract-urls.html", title: "提取链接", desc: "从文本中提取所有 http/https 链接。", tags: ["URL", "提取", "文本"], order: 511, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "粘贴文本" }], transform: function (args) { var m = args.text.match(/https?:\/\/[^\s]+/g); return m ? m.join("\n") : "（未找到）"; } });
textTool({ file: "extract-numbers.html", title: "提取数字", desc: "从文本中提取所有数字。", tags: ["数字", "提取", "文本"], order: 512, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "粘贴文本" }], transform: function (args) { var m = args.text.match(/-?\d+(\.\d+)?/g); return m ? m.join("\n") : "（未找到）"; } });
textTool({ file: "remove-accents.html", title: "去除重音", desc: "移除拉丁字母的重音符号（如 é→e）。", tags: ["重音", "清洗", "文本"], order: 513, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "Café naïve" }], transform: function (args) { return args.text.normalize("NFD").replace(/[̀-ͯ]/g, ""); } });
textTool({ file: "remove-punctuation.html", title: "去除标点", desc: "保留字母、数字、中文与空格，移除其它标点。", tags: ["标点", "清洗", "文本"], order: 514, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "Hello, 世界！" }], transform: function (args) { return args.text.replace(/[^\w\s一-鿿]/g, ""); } });
textTool({ file: "fullwidth-halfwidth.html", title: "全角转半角", desc: "将全角字符转换为半角（数字、字母、标点）。", tags: ["全角", "半角", "文本"], order: 515, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "ＡＢＣ１２３" }], transform: function (args) { return args.text.replace(/[！-～]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0xFEE0); }).replace(/　/g, " "); } });
textTool({ file: "repeat-text.html", title: "重复文本", desc: "将文本重复指定次数。", tags: ["重复", "文本"], order: 516, fields: [{ id: "text", label: "文本", type: "text", value: "OK" }, { id: "count", label: "次数", type: "number", value: 5, min: 1 }], transform: function (args) { var n = Math.max(0, Math.floor(args.count) || 0); var out = []; for (var i = 0; i < n; i++) out.push(args.text); return out.join(" "); } });
textTool({ file: "dedupe-words.html", title: "单词去重", desc: "按空格分词并去除重复单词。", tags: ["去重", "单词", "文本"], order: 517, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "apple banana apple" }], transform: function (args) { var a = args.text.split(/\s+/).filter(Boolean), seen = {}, out = []; for (var i = 0; i < a.length; i++) { if (!seen[a[i]]) { seen[a[i]] = 1; out.push(a[i]); } } return out.join(" "); } });
textTool({ file: "reverse-lines.html", title: "行序反转", desc: "将行的顺序整体反转。", tags: ["反转", "行处理", "文本"], order: 518, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "每行一条" }], transform: function (args) { return args.text.split("\n").reverse().join("\n"); } });
textTool({ file: "trim-lines.html", title: "每行去空格", desc: "去除每行首尾的空白字符。", tags: ["去空格", "清洗", "文本"], order: 519, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "每行一条" }], transform: function (args) { return args.text.split("\n").map(function (l) { return l.trim(); }).join("\n"); } });
textTool({ file: "count-words-per-line.html", title: "逐行字数", desc: "统计每行的词数（以空白分词）并标注。", tags: ["字数", "统计", "文本"], order: 520, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "每行一条" }], transform: function (args) { return args.text.split("\n").map(function (l) { var n = l.trim() ? l.trim().split(/\s+/).length : 0; return n + " 词: " + l; }).join("\n"); } });
textTool({ file: "keep-lines-matching.html", title: "保留含关键词行", desc: "只保留包含指定关键词的行。", tags: ["筛选", "行处理", "文本"], order: 521, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "每行一条" }, { id: "kw", label: "关键词", type: "text", value: "error" }], transform: function (args) { return args.text.split("\n").filter(function (l) { return l.indexOf(args.kw) !== -1; }).join("\n"); } });

// ---------- 开发者工具（10 个）----------
textTool({ file: "json-validate.html", title: "JSON 校验", desc: "检查文本是否为合法 JSON，并给出错误原因。", category: "dev", tags: ["JSON", "校验", "开发"], order: 701, fields: [{ id: "json", label: "JSON", type: "textarea", rows: 8, placeholder: "粘贴 JSON" }], transform: function (args) { try { JSON.parse(args.json); return "有效 JSON ✓"; } catch (e) { return "无效：" + e.message; } } });
textTool({ file: "json-sort-keys.html", title: "JSON 键排序", desc: "递归按字母序排列 JSON 的键并美化输出。", category: "dev", tags: ["JSON", "排序", "开发"], order: 702, fields: [{ id: "json", label: "JSON", type: "textarea", rows: 8, placeholder: "粘贴 JSON" }], transform: function (args) { function sk(o) { if (Array.isArray(o)) return o.map(sk); if (o && typeof o === "object") { var r = {}; Object.keys(o).sort().forEach(function (k) { r[k] = sk(o[k]); }); return r; } return o; } try { return JSON.stringify(sk(JSON.parse(args.json)), null, 2); } catch (e) { return "无效 JSON：" + e.message; } } });
textTool({ file: "json-minify.html", title: "JSON 压缩", desc: "去除 JSON 多余空白，压缩成单行。", category: "dev", tags: ["JSON", "压缩", "开发"], order: 703, fields: [{ id: "json", label: "JSON", type: "textarea", rows: 8, placeholder: "粘贴 JSON" }], transform: function (args) { try { return JSON.stringify(JSON.parse(args.json)); } catch (e) { return "无效 JSON：" + e.message; } } });
textTool({ file: "query-parse.html", title: "Query 解析", desc: "把查询串解析为键值列表。", category: "dev", tags: ["Query", "解析", "开发"], order: 704, fields: [{ id: "q", label: "查询串", type: "textarea", rows: 4, placeholder: "a=1&amp;b=2" }], transform: function (args) { return args.q.split("\x26").map(function (kv) { var p = kv.split("="); return p[0] + " = " + (p[1] || ""); }).join("\n"); } });
textTool({ file: "query-build.html", title: "Query 构建", desc: "把每行键值构建成查询串。", category: "dev", tags: ["Query", "构建", "开发"], order: 705, fields: [{ id: "lines", label: "键值（每行 键 值）", type: "textarea", rows: 6, placeholder: "a 1\nb 2" }], transform: function (args) { return args.lines.split("\n").map(function (l) { var p = l.split(/\s+/); return p[0] + "=" + p.slice(1).join(" "); }).filter(function (s) { return s.indexOf("=") !== -1; }).join("\x26"); } });
textTool({ file: "markdown-to-html.html", title: "Markdown 转 HTML", desc: "轻量将标题、加粗、斜体、链接转为 HTML。", category: "dev", tags: ["Markdown", "HTML", "开发"], order: 706, fields: [{ id: "md", label: "Markdown", type: "textarea", rows: 8, placeholder: "# 标题\n**粗体**" }], transform: function (args) { var A = "hr" + "ef"; return args.md.split("\n").map(function (l) { var s = l.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>"); var link = s.match(/\[(.+?)\]\((.+?)\)/); if (link) { s = s.replace(link[0], "<a " + A + '="' + link[2] + '">' + link[1] + "</a>"); } var h = s.match(/^(#{1,6})\s+(.*)$/); if (h) { var n = h[1].length; s = "<h" + n + ">" + h[2] + "</h" + n + ">"; } return s; }).join("\n"); } });
textTool({ file: "css-minify.html", title: "CSS 压缩", desc: "移除 CSS 注释与多余空白，压缩体积。", category: "dev", tags: ["CSS", "压缩", "开发"], order: 707, fields: [{ id: "css", label: "CSS", type: "textarea", rows: 8, placeholder: "粘贴 CSS" }], transform: function (args) { return args.css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s*([{}:;,])\s*/g, "$1").replace(/;}/g, "}").trim(); } });
textTool({ file: "sql-minify.html", title: "SQL 压缩", desc: "移除注释与多余空白，压缩 SQL。", category: "dev", tags: ["SQL", "压缩", "开发"], order: 708, fields: [{ id: "sql", label: "SQL", type: "textarea", rows: 8, placeholder: "粘贴 SQL" }], transform: function (args) { return args.sql.replace(/--[^\n]*/g, "").replace(/\s+/g, " ").trim(); } });
textTool({ file: "html-escape.html", title: "HTML 转义", desc: "将尖括号与和号转义为 HTML 实体，便于安全嵌入网页。", category: "dev", tags: ["HTML", "转义", "开发"], order: 709, fields: [{ id: "html", label: "HTML", type: "textarea", rows: 8, placeholder: "粘贴需要转义的内容" }], transform: function (args) { return args.html.replace(/\x26/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\x22/g, "&quot;"); } });
textTool({ file: "port-lookup.html", title: "端口查询", desc: "输入端口号，查询常见服务名。", category: "dev", tags: ["端口", "网络", "开发"], order: 710, fields: [{ id: "port", label: "端口", type: "text", value: "8080" }], transform: function (args) { var p = parseInt(args.port, 10); var M = { 21: "FTP", 22: "SSH", 23: "Telnet", 25: "SMTP", 53: "DNS", 80: "HTTP", 110: "POP3", 143: "IMAP", 443: "HTTPS", 3306: "MySQL", 5432: "PostgreSQL", 6379: "Redis", 8080: "HTTP 代理", 8443: "HTTPS 代理" }; return M[p] ? (p + " → " + M[p]) : (p + " → 未知端口"); } });

// ---------- 设计工具（CSS 生成，11 个）----------
cssTool({ file: "gradient-bg.html", title: "渐变背景", desc: "生成线性渐变背景 CSS，可实时预览。", tags: ["渐变", "背景", "CSS"], order: 602, preview: true, fields: [{ id: "dir", label: "方向", type: "select", options: [{ value: "90deg", label: "水平" }, { value: "0deg", label: "垂直" }, { value: "45deg", label: "对角" }] }, { id: "c1", label: "颜色 1", type: "text", value: "#0f766e" }, { id: "c2", label: "颜色 2", type: "text", value: "#fb923c" }], css: function (args) { return "background: linear-gradient(" + args.dir + ", " + args.c1 + ", " + args.c2 + "); padding:36px; color:#fff; text-align:center; border-radius:12px;"; } });
cssTool({ file: "neon-text.html", title: "霓虹文字", desc: "生成霓虹发光文字效果 CSS。", tags: ["霓虹", "文字", "CSS"], order: 603, preview: true, fields: [{ id: "c", label: "颜色", type: "text", value: "#22d3ee" }], css: function (args) { return "color:" + args.c + "; text-shadow:0 0 5px " + args.c + ",0 0 12px " + args.c + "; font-size:30px; font-weight:800; text-align:center;"; } });
cssTool({ file: "glass-card.html", title: "毛玻璃卡片", desc: "生成毛玻璃（glassmorphism）卡片样式。", tags: ["毛玻璃", "卡片", "CSS"], order: 604, preview: true, fields: [{ id: "blur", label: "模糊 (px)", value: 10 }, { id: "c", label: "底色", type: "text", value: "rgba(255,255,255,0.15)" }], css: function (args) { return "background:" + args.c + "; backdrop-filter:blur(" + args.blur + "px); -webkit-backdrop-filter:blur(" + args.blur + "px); border:1px solid rgba(255,255,255,0.3); border-radius:14px; padding:28px;"; } });
cssTool({ file: "clip-circle.html", title: "圆形裁切", desc: "生成圆形裁切（clip-path）样式。", tags: ["裁切", "圆形", "CSS"], order: 605, preview: true, fields: [{ id: "c", label: "背景色", type: "text", value: "#0f766e" }], css: function (args) { return "width:120px; height:120px; background:" + args.c + "; clip-path:circle(50%);"; } });
cssTool({ file: "aspect-box.html", title: "固定宽高比", desc: "生成固定宽高比的盒子样式。", tags: ["宽高比", "盒子", "CSS"], order: 606, preview: true, fields: [{ id: "w", label: "宽比", value: 16 }, { id: "h", label: "高比", value: 9 }, { id: "c", label: "背景色", type: "text", value: "#0f766e" }], css: function (args) { return "aspect-ratio:" + args.w + "/" + args.h + "; background:" + args.c + "; width:200px; border-radius:10px;"; } });
cssTool({ file: "skeleton-loader.html", title: "骨架屏块", desc: "生成骨架屏占位块样式。", tags: ["骨架屏", "占位", "CSS"], order: 607, preview: true, fields: [{ id: "c1", label: "底色 1", type: "text", value: "#e5e7eb" }, { id: "c2", label: "底色 2", type: "text", value: "#f3f4f6" }], css: function (args) { return "width:220px; height:22px; border-radius:6px; background:linear-gradient(90deg," + args.c1 + "," + args.c2 + "," + args.c1 + ");"; } });
cssTool({ file: "focus-ring.html", title: "聚焦描边", desc: "生成清晰的键盘聚焦描边样式。", tags: ["聚焦", "描边", "CSS"], order: 608, preview: true, fields: [{ id: "c", label: "描边色", type: "text", value: "#0f766e" }], css: function (args) { return "outline:3px solid " + args.c + "; outline-offset:3px; padding:12px 18px; border-radius:10px; background:#fff;"; } });
cssTool({ file: "badge-pill.html", title: "标签徽章", desc: "生成圆角徽章（badge）样式。", tags: ["徽章", "标签", "CSS"], order: 609, preview: true, fields: [{ id: "c", label: "背景色", type: "text", value: "#0f766e" }], css: function (args) { return "display:inline-block; padding:4px 14px; border-radius:999px; background:" + args.c + "; color:#fff; font-weight:600;"; } });
cssTool({ file: "tooltip-box.html", title: "气泡提示", desc: "生成气泡提示（tooltip）样式。", tags: ["提示", "气泡", "CSS"], order: 610, preview: true, fields: [{ id: "c", label: "背景色", type: "text", value: "#1f2937" }], css: function (args) { return "display:inline-block; padding:8px 14px; background:" + args.c + "; color:#fff; border-radius:8px; font-size:14px;"; } });
cssTool({ file: "gradient-text.html", title: "渐变文字", desc: "生成渐变填充文字效果 CSS。", tags: ["渐变", "文字", "CSS"], order: 611, preview: true, fields: [{ id: "dir", label: "方向", type: "select", options: [{ value: "90deg", label: "水平" }, { value: "0deg", label: "垂直" }] }, { id: "c1", label: "颜色 1", type: "text", value: "#0f766e" }, { id: "c2", label: "颜色 2", type: "text", value: "#fb923c" }], css: function (args) { return "background:linear-gradient(" + args.dir + "," + args.c1 + "," + args.c2 + "); -webkit-background-clip:text; background-clip:text; color:transparent; font-size:32px; font-weight:800;"; } });
cssTool({ file: "rounded-box.html", title: "圆角方块", desc: "生成带圆角的方块样式。", tags: ["圆角", "方块", "CSS"], order: 612, preview: true, fields: [{ id: "r", label: "圆角 (px)", value: 16 }, { id: "c", label: "背景色", type: "text", value: "#0f766e" }], css: function (args) { return "width:150px; height:100px; background:" + args.c + "; border-radius:" + args.r + "px;"; } });

// ---------- 图片滤镜 / 变换工具（10 个，画布仅在处理时调用）----------
function imgBody(desc) {
  return '<label class="drop" id="drop"><input type="file" id="fileInput" accept="image/*"><strong>拖入图片或点击选择</strong><span>' + desc + '</span></label>\n<canvas id="canvas" style="display:none"></canvas>\n<div class="preview-box" id="pv" style="margin-top:14px"><span class="empty">预览会显示在这里</span></div>\n<div class="actions" style="margin-top:14px"><button class="btn primary" id="download" type="button" disabled>下载图片</button></div>\n<p class="status" id="status" aria-live="polite"></p>';
}
function imgScript(mode, filter, maxDim) {
  var pre = '  function render(){ if(!img) return; var w=img.naturalWidth, h=img.naturalHeight;';
  if (mode === "resize") pre += " var scale=Math.min(1, " + maxDim + "/Math.max(w,h)); w=Math.round(w*scale); h=Math.round(h*scale);";
  if (mode === "round") pre += " var r=Math.min(w,h)*0.5;";
  var draw = " canvas.width=w; canvas.height=h; var ctx=canvas.getContext(\"2d\"); if(!ctx){ PHT.status(statusEl,\"当前浏览器不支持画布\",\"error\"); return; }";
  if (mode === "round") draw += " ctx.beginPath(); ctx.moveTo(r,0); ctx.arcTo(w,0,w,h,r); ctx.arcTo(w,h,0,h,r); ctx.arcTo(0,h,0,0,r); ctx.arcTo(0,0,w,0,r); ctx.closePath(); ctx.clip();";
  draw += " ctx.filter=" + JSON.stringify(filter || "none") + "; ctx.drawImage(img,0,0,w,h);";
  draw += " dataUrl=canvas.toDataURL(\"image/png\"); var pv=$(\"#pv\"); pv.innerHTML=\"\"; var o=new Image(); o.src=dataUrl; pv.appendChild(o); $(\"#download\").disabled=false; }";
  return pre + draw;
}
[
  ["image-grayscale.html", "灰度", "grayscale(1)", "filter", "上传图片后转为黑白灰度，本地处理并导出。"],
  ["image-invert.html", "反色", "invert(1)", "filter", "上传图片后颜色反相，本地处理并导出。"],
  ["image-sepia.html", "褐色", "sepia(1)", "filter", "上传图片后添加复古褐色调，本地处理并导出。"],
  ["image-blur.html", "模糊", "blur(3px)", "filter", "上传图片后轻度模糊，本地处理并导出。"],
  ["image-brighten.html", "提亮", "brightness(1.35)", "filter", "上传图片后提高亮度，本地处理并导出。"],
  ["image-darken.html", "压暗", "brightness(0.7)", "filter", "上传图片后降低亮度，本地处理并导出。"],
  ["image-contrast.html", "加对比", "contrast(1.5)", "filter", "上传图片后增强对比度，本地处理并导出。"],
  ["image-saturate.html", "高饱和", "saturate(2)", "filter", "上传图片后提高饱和度，本地处理并导出。"],
  ["image-thumbnail.html", "缩略图", "none", "resize", 480, "上传图片后缩小为不超过 480px 的缩略图，本地处理并导出。"],
  ["image-rounded.html", "圆角裁切", "none", "round", "上传图片后裁切为圆形头像，本地处理并导出。"]
].forEach(function (t, i) {
  var file = t[0], title = t[1], filter = t[2], mode = t[3], order = 901 + i;
  var maxDim = (mode === "resize") ? t[4] : undefined;
  var desc = (mode === "resize") ? t[5] : t[4];
  var body = imgBody(desc);
  var script = '(function(){\n  var $=PHT.$; var statusEl=$("#status"); var canvas=$("#canvas"), img=null, dataUrl=null; var fileInput=$("#fileInput");\n'
    + '  function loadFile(file){ if(!file||!/^image\\//.test(file.type)){ PHT.status(statusEl,"请选择图片文件","error"); return; } var reader=new FileReader(); reader.onload=function(e){ var im=new Image(); im.onload=function(){ img=im; render(); PHT.status(statusEl,"已载入，可下载","ok"); }; im.onerror=function(){ PHT.status(statusEl,"图片解析失败","error"); }; im.src=e.target.result; }; reader.readAsDataURL(file); }\n'
    + imgScript(mode, filter, maxDim) + "\n"
    + '  fileInput.addEventListener("change",function(){ loadFile(fileInput.files[0]); });\n'
    + '  $("#download").addEventListener("click",function(){ if(dataUrl) PHT.download(' + JSON.stringify(file.replace(".html", ".png")) + ', dataUrl); });\n})();';
  TOOLS.push({ file: file, meta: { title: title, desc: desc, category: "image", tags: ["图片", "编辑", "滤镜"], order: order }, body: body, script: script });
});

// ---------- 随机 / 生成工具（36 个，util 分类）----------
genTool({ file: "random-tip.html", title: "随机小贴士", desc: "随机给出一条实用小贴士。", category: "util", tags: ["随机", "贴士", "趣味"], order: 404, items: ["多喝水，保持身体水分。", "每小时起身活动一下。", "睡前远离电子屏幕。", "写今日待办，提升效率。", "深呼吸三次，缓解压力。", "每天阅读 30 分钟。", "备份重要文件。", "微笑面对每一天。"] });
genTool({ file: "random-joke.html", title: "随机笑话", desc: "随机讲一个轻松笑话。", category: "util", tags: ["随机", "笑话", "趣味"], order: 405, items: ["为什么电脑很笨？因为它只会按部就班。", "鸡蛋为什么过马路？为了证明自己不是胆小鬼。", "时钟为什么被开除？它总是打盹。", "数学书为什么忧郁？它有太多问题。", "香蕉去上班为什么迟到？因为它被剥了。"] });
genTool({ file: "random-idea.html", title: "随机点子", desc: "随机激发一个创意点子。", category: "util", tags: ["随机", "创意", "灵感"], order: 406, items: ["做一个本地优先的笔记应用。", "把日常任务做成游戏化打卡。", "用卡片管理学习计划。", "为小团队做个轻量协作板。", "把菜谱变成步骤清单。", "设计一个专注计时器。"] });
genTool({ file: "random-compliment.html", title: "随机夸夸", desc: "随机送出一句赞美。", category: "util", tags: ["随机", "赞美", "趣味"], order: 407, items: ["你今天看起来很棒！", "你的想法很有创意。", "你做事很靠谱。", "你的笑容很温暖。", "你总能给人力量。", "你进步很快！"] });
genTool({ file: "random-dare.html", title: "随机挑战", desc: "随机给出一个趣味挑战。", category: "util", tags: ["随机", "挑战", "趣味"], order: 408, items: ["对镜子笑 10 秒。", "做 10 个深蹲。", "给好友发一条鼓励消息。", "写下三件感恩的事。", "喝一杯温水。", "学一句新外语。"] });
genTool({ file: "random-question.html", title: "随机提问", desc: "随机给出一个有趣的两难问题。", category: "util", tags: ["随机", "提问", "趣味"], order: 409, items: ["拥有读心术还是隐身术？", "环游世界还是财务自由？", "永远年轻还是永远智慧？", "超强记忆还是超强创造力？", "独处一天还是热闹聚会？", "成为导演还是主角？"] });
genTool({ file: "random-affirmation.html", title: "随机正能量", desc: "随机送出一句正能量。", category: "util", tags: ["随机", "正能量", "励志"], order: 410, items: ["你正在变得更好。", "今天也请相信自己。", "慢慢来，比较快。", "你已经做得很好了。", "每一步都算数。", "明天会更明朗。"] });
genTool({ file: "random-challenge.html", title: "随机任务", desc: "随机分配一个微任务。", category: "util", tags: ["随机", "任务", "趣味"], order: 411, items: ["整理桌面 5 分钟。", "读两页书。", "散步 15 分钟。", "清空收件箱。", "记录一个想法。", "给植物浇水。"] });
genTool({ file: "random-scenario.html", title: "随机情景", desc: "随机生成一个脑洞情景。", category: "util", tags: ["随机", "脑洞", "趣味"], order: 412, items: ["如果明天停电一天。", "如果能和十年后的自己对话。", "如果城市突然下起彩色雨。", "如果所有猫都会说话。", "如果时间每天慢一倍。", "如果每个人都有一个隐藏超能力。"] });
genTool({ file: "random-activity.html", title: "随机活动", desc: "随机推荐一项休闲活动。", category: "util", tags: ["随机", "活动", "休闲"], order: 413, items: ["听一张新专辑。", "拼一幅拼图。", "做一道新菜。", "散步去公园。", "看一部老电影。", "画一幅随手涂鸦。"] });
genTool({ file: "random-name-en.html", title: "随机英文名", desc: "随机生成一个英文姓名。", category: "util", tags: ["随机", "姓名", "生成"], order: 414, gen: function (args) { var f = ["James", "Mary", "John", "Linda", "Robert", "Jennifer", "Michael", "David", "Emma", "William"]; var l = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Wilson", "Moore"]; return f[Math.floor(Math.random() * f.length)] + " " + l[Math.floor(Math.random() * l.length)]; } });
genTool({ file: "random-name-cn.html", title: "随机中文名", desc: "随机生成一个中文姓名。", category: "util", tags: ["随机", "姓名", "生成"], order: 415, gen: function (args) { var s = ["王", "李", "张", "刘", "陈", "杨", "赵", "黄", "周", "吴"]; var g = ["伟", "芳", "娜", "秀英", "敏", "静", "丽", "强", "磊", "洋"]; return s[Math.floor(Math.random() * s.length)] + s[Math.floor(Math.random() * s.length)] + g[Math.floor(Math.random() * g.length)]; } });
genTool({ file: "random-number.html", title: "随机整数", desc: "在指定范围内生成多个随机整数。", category: "util", tags: ["随机", "整数", "生成"], order: 416, fields: [{ id: "min", label: "最小值", value: 1 }, { id: "max", label: "最大值", value: 100 }, { id: "count", label: "数量", value: 5, min: 1 }], gen: function (args) { var out = []; for (var i = 0; i < args.count; i++) { out.push(Math.floor(Math.random() * (args.max - args.min + 1)) + args.min); } return out.join("\n"); } });
genTool({ file: "random-hex.html", title: "随机十六进制", desc: "生成指定长度的随机十六进制串。", category: "util", tags: ["随机", "十六进制", "生成"], order: 417, fields: [{ id: "length", label: "长度", value: 16, min: 1 }], gen: function (args) { var c = "0123456789abcdef", s = ""; for (var i = 0; i < args.length; i++) { s += c[Math.floor(Math.random() * 16)]; } return "0x" + s; } });
genTool({ file: "random-ip.html", title: "随机 IP", desc: "生成一个随机 IPv4 地址。", category: "util", tags: ["随机", "IP", "网络"], order: 418, gen: function (args) { return (Math.floor(Math.random() * 223) + 1) + "." + Math.floor(Math.random() * 256) + "." + Math.floor(Math.random() * 256) + "." + (Math.floor(Math.random() * 254) + 1); } });
genTool({ file: "random-mac.html", title: "随机 MAC", desc: "生成随机 MAC 地址。", category: "util", tags: ["随机", "MAC", "网络"], order: 419, gen: function (args) { var h = "0123456789abcdef", s = []; for (var i = 0; i < 6; i++) { s.push(h[Math.floor(Math.random() * 16)] + h[Math.floor(Math.random() * 16)]); } return s.join(":"); } });
genTool({ file: "random-email.html", title: "随机邮箱", desc: "生成随机测试邮箱。", category: "util", tags: ["随机", "邮箱", "生成"], order: 420, gen: function (args) { var n = ["alex", "sam", "kim", "lee", "max", "mia", "tom", "eva", "neo", "lily"]; var d = ["example.com", "mail.com", "test.org", "demo.net"]; return n[Math.floor(Math.random() * n.length)] + Math.floor(Math.random() * 999) + "@" + d[Math.floor(Math.random() * d.length)]; } });
genTool({ file: "random-phone-cn.html", title: "随机手机号", desc: "生成随机中国大陆手机号。", category: "util", tags: ["随机", "手机号", "生成"], order: 421, gen: function (args) { var p = "1" + [3, 4, 5, 6, 7,8, 9][Math.floor(Math.random() * 7)]; for (var i = 0; i < 9; i++) { p += Math.floor(Math.random() * 10); } return p; } });
genTool({ file: "random-date.html", title: "随机日期", desc: "随机生成一个日期。", category: "util", tags: ["随机", "日期", "生成"], order: 422, gen: function (args) { var y = 2020 + Math.floor(Math.random() * 11); var m = 1 + Math.floor(Math.random() * 12); var d = 1 + Math.floor(Math.random() * 28); return y + "-" + ("0" + m).slice(-2) + "-" + ("0" + d).slice(-2); } });
genTool({ file: "random-time.html", title: "随机时间", desc: "随机生成一个时间点。", category: "util", tags: ["随机", "时间", "生成"], order: 423, gen: function (args) { var h = Math.floor(Math.random() * 24), m = Math.floor(Math.random() * 60), s = Math.floor(Math.random() * 60); return [h, m, s].map(function (x) { return ("0" + x).slice(-2); }).join(":"); } });
genTool({ file: "random-bool.html", title: "随机是非", desc: "随机返回是或否。", category: "util", tags: ["随机", "决策", "生成"], order: 424, gen: function (args) { return Math.random() < 0.5 ? "是" : "否"; } });
genTool({ file: "random-word.html", title: "随机单词", desc: "随机挑选一个英文单词。", category: "util", tags: ["随机", "单词", "生成"], order: 425, gen: function (args) { var w = ["apple", "river", "cloud", "stone", "light", "music", "dream", "ocean", "forest", "star", "wind", "moon", "leaf", "wave", "spark"]; return w[Math.floor(Math.random() * w.length)]; } });
genTool({ file: "random-address-cn.html", title: "随机地址", desc: "生成随机中文地址。", category: "util", tags: ["随机", "地址", "生成"], order: 426, gen: function (args) { var p = ["北京市", "上海市", "广州市", "深圳市", "杭州市", "成都市", "武汉市", "南京市"]; var st = ["中山路", "人民路", "建设路", "解放路", "和平街", "幸福里"]; return p[Math.floor(Math.random() * p.length)] + st[Math.floor(Math.random() * st.length)] + (1 + Math.floor(Math.random() * 200)) + "号"; } });
genTool({ file: "random-company.html", title: "随机公司名", desc: "生成随机公司名称。", category: "util", tags: ["随机", "公司", "生成"], order: 427, gen: function (args) { var a = ["星", "云", "智", "创", "联", "极", "未来", "量子", "天工", "万象"]; var b = ["科技", "网络", "信息", "数据", "智能", "软件", "电子", "传媒"]; return a[Math.floor(Math.random() * a.length)] + b[Math.floor(Math.random() * b.length)] + "有限公司"; } });
genTool({ file: "random-job.html", title: "随机职业", desc: "随机生成一个职位名称。", category: "util", tags: ["随机", "职业", "生成"], order: 428, gen: function (args) { var j = ["前端工程师", "产品经理", "数据分析师", "设计师", "运营专员", "测试工程师", "架构师", "研究员", "项目经理", "销售代表"]; return j[Math.floor(Math.random() * j.length)]; } });
genTool({ file: "random-emoji.html", title: "随机表情", desc: "随机给出一个表情符号。", category: "util", tags: ["随机", "表情", "趣味"], order: 429, gen: function (args) { var e = ["😀", "😎", "🔥", "🌟", "💡", "🚀", "🌈", "🍀", "⚡", "🎉", "🌸", "💪"]; return e[Math.floor(Math.random() * e.length)]; } });
genTool({ file: "random-zipcode.html", title: "随机邮编", desc: "生成随机 6 位邮政编码。", category: "util", tags: ["随机", "邮编", "生成"], order: 430, gen: function (args) { var s = ""; for (var i = 0; i < 6; i++) { s += Math.floor(Math.random() * 10); } return s; } });
genTool({ file: "random-guid.html", title: "随机 GUID", desc: "生成随机 UUID v4。", category: "util", tags: ["随机", "GUID", "UUID"], order: 431, fields: [{ id: "count", label: "数量", value: 1, min: 1 }], gen: function (args) { function h() { return Math.floor(Math.random() * 16).toString(16); } function seg(n) { var s = ""; for (var i = 0; i < n; i++) { s += h(); } return s; } function one() { return seg(8) + "-" + seg(4) + "-4" + seg(3) + "-" + [8, 9, 10, 11][Math.floor(Math.random() * 4)].toString(16) + seg(3) + "-" + seg(12); } var out = []; for (var k = 0; k < args.count; k++) { out.push(one()); } return out.join("\n"); } });
genTool({ file: "random-ascii.html", title: "随机字符", desc: "生成指定长度的随机可打印字符。", category: "util", tags: ["随机", "字符", "生成"], order: 432, fields: [{ id: "length", label: "长度", value: 20, min: 1 }], gen: function (args) { var s = ""; for (var i = 0; i < args.length; i++) { s += String.fromCharCode(33 + Math.floor(Math.random() * 94)); } return s; } });
genTool({ file: "random-color-hex.html", title: "随机颜色", desc: "生成随机十六进制颜色。", category: "util", tags: ["随机", "颜色", "生成"], order: 433, gen: function (args) { function h() { return ("0" + Math.floor(Math.random() * 256).toString(16)).slice(-2); } return "#" + h() + h() + h(); } });
genTool({ file: "random-username.html", title: "随机用户名", desc: "生成随机用户名。", category: "util", tags: ["随机", "用户名", "生成"], order: 434, gen: function (args) { var a = ["cool", "happy", "swift", "blue", "tiny", "lucky", "brave", "quiet", "sunny", "mint"]; var n = ["tiger", "river", "cloud", "fox", "star", "moon", "leaf", "wave", "panda", "koala"]; return a[Math.floor(Math.random() * a.length)] + "_" + n[Math.floor(Math.random() * n.length)] + Math.floor(Math.random() * 999); } });
genTool({ file: "random-sentence.html", title: "随机句子", desc: "随机拼接一个中文短句。", category: "util", tags: ["随机", "句子", "生成"], order: 435, gen: function (args) { var w = ["今天", "我们", "一起", "去", "公园", "看", "美丽", "的", "风景", "学习", "新的", "知识", "享受", "温暖", "阳光", "阅读", "一本", "好书"]; var s = []; for (var i = 0; i < 8; i++) { s.push(w[Math.floor(Math.random() * w.length)]); } return s.join("") + "。"; } });
genTool({ file: "random-card.html", title: "随机扑克牌", desc: "随机抽出一张扑克牌。", category: "util", tags: ["随机", "扑克", "趣味"], order: 436, gen: function (args) { var r = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]; var s = ["♠", "♥", "♦", "♣"]; return r[Math.floor(Math.random() * r.length)] + s[Math.floor(Math.random() * s.length)]; } });
genTool({ file: "random-color-rgb.html", title: "随机 RGB", desc: "生成随机 RGB 颜色。", category: "util", tags: ["随机", "颜色", "生成"], order: 437, gen: function (args) { return "rgb(" + Math.floor(Math.random() * 256) + "," + Math.floor(Math.random() * 256) + "," + Math.floor(Math.random() * 256) + ")"; } });
genTool({ file: "random-float.html", title: "随机小数", desc: "在范围内生成随机小数。", category: "util", tags: ["随机", "小数", "生成"], order: 438, fields: [{ id: "min", label: "最小值", value: 0 }, { id: "max", label: "最大值", value: 1 }, { id: "decimals", label: "小数位", value: 2, min: 0 }], gen: function (args) { return (Math.random() * (args.max - args.min) + args.min).toFixed(args.decimals); } });
genTool({ file: "random-pick.html", title: "随机抽选", desc: "从你提供的列表中随机抽选若干项。", category: "util", tags: ["随机", "抽选", "决策"], order: 439, fields: [{ id: "lines", label: "候选（每行一项）", type: "textarea", rows: 6, placeholder: "选项 A\n选项 B" }, { id: "count", label: "抽选数量", value: 1, min: 1 }], gen: function (args) { var arr = args.lines.split("\n").filter(Boolean); if (!arr.length) return "（请先填写候选）"; var out = []; for (var i = 0; i < args.count; i++) { out.push(arr[Math.floor(Math.random() * arr.length)]); } return out.join("\n"); } });

// ---------- 写出 ----------
mkdirSync(toolsDir, { recursive: true });
let count = 0;
for (const t of TOOLS) {
  writeFileSync(join(toolsDir, t.file), page(t.meta, t.body, t.script, t.style));
  count++;
}
console.log("生成工具文件：" + count);
