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

// ---------- 写出 ----------
mkdirSync(toolsDir, { recursive: true });
let count = 0;
for (const t of TOOLS) {
  writeFileSync(join(toolsDir, t.file), page(t.meta, t.body, t.script, t.style));
  count++;
}
console.log("生成工具文件：" + count);
