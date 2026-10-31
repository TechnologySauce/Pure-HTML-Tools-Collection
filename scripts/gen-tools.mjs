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
function escAttr(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function unitConvTool(spec) {
  var opts = spec.units.map(function (u, i) { return '<option value="' + i + '">' + escAttr(u.name) + '</option>'; }).join("");
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
      var o = f.options.map(function (x) { return '<option value="' + escAttr(x.value) + '">' + escAttr(x.label) + '</option>'; }).join("");
      return '  <div class="field"><label for="' + f.id + '">' + f.label + '</label><select id="' + f.id + '">' + o + '</select></div>';
    }
    if (f.type === "checkbox") {
      return '  <label class="chk"><input type="checkbox" id="' + f.id + '"' + (f.checked ? " checked" : "") + '> ' + f.label + '</label>';
    }
    var extra = (f.value !== undefined ? ' value="' + escAttr(f.value) + '"' : "") + (f.step !== undefined ? ' step="' + f.step + '"' : "") + (f.min !== undefined ? ' min="' + f.min + '"' : "") + (f.max !== undefined ? ' max="' + f.max + '"' : "");
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
    + (ids ? '  ["' + ids + '"].forEach(function(k){ $("#"+k).addEventListener("input",run); $("#"+k).addEventListener("change",run); });\n' : "") + '  run();\n})();';
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
    if (f.type === "select") { var o = f.options.map(function (x) { return '<option value="' + escAttr(x.value) + '">' + escAttr(x.label) + '</option>'; }).join(""); return '  <div class="field"><label for="' + f.id + '">' + f.label + '</label><select id="' + f.id + '">' + o + '</select></div>'; }
    if (f.type === "checkbox") return '  <label class="chk"><input type="checkbox" id="' + f.id + '"' + (f.checked ? " checked" : "") + '> ' + f.label + '</label>';
    if (f.type === "textarea") return '  <div class="field"><label for="' + f.id + '">' + f.label + '</label><textarea id="' + f.id + '" class="code" spellcheck="false" rows="' + (f.rows || 6) + '"' + (f.placeholder ? ' placeholder="' + escAttr(f.placeholder) + '"' : "") + '>' + (f.value || "") + '</textarea></div>';
    return '  <div class="field"><label for="' + f.id + '">' + f.label + '</label><input type="' + (f.type || "number") + '" id="' + f.id + '"' + (f.value !== undefined ? ' value="' + escAttr(f.value) + '"' : "") + (f.min !== undefined ? ' min="' + f.min + '"' : "") + (f.max !== undefined ? ' max="' + f.max + '"' : "") + (f.step !== undefined ? ' step="' + f.step + '"' : "") + '></div>';
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
    if (f.type === "select") { var o = f.options.map(function (x) { return '<option value="' + escAttr(x.value) + '">' + escAttr(x.label) + '</option>'; }).join(""); return '  <div class="field"><label for="' + f.id + '">' + f.label + '</label><select id="' + f.id + '">' + o + '</select></div>'; }
    if (f.type === "checkbox") return '  <label class="chk"><input type="checkbox" id="' + f.id + '"' + (f.checked ? " checked" : "") + '> ' + f.label + '</label>';
    if (f.type === "textarea") return '  <div class="field"><label for="' + f.id + '">' + f.label + '</label><textarea id="' + f.id + '" class="code" spellcheck="false" rows="' + (f.rows || 8) + '"' + (f.placeholder ? ' placeholder="' + escAttr(f.placeholder) + '"' : "") + '>' + (f.value || "") + '</textarea></div>';
    return '  <div class="field"><label for="' + f.id + '">' + f.label + '</label><input type="' + (f.type || "text") + '" id="' + f.id + '"' + (f.value !== undefined ? ' value="' + escAttr(f.value) + '"' : "") + (f.placeholder ? ' placeholder="' + escAttr(f.placeholder) + '"' : "") + '></div>';
  }).join("\n");
  var body = fieldsHtml + '\n<div class="field" style="margin-top:14px"><label for="out">输出</label><textarea id="out" class="code" readonly spellcheck="false" placeholder="处理结果"></textarea></div>\n<div class="actions">\n  <button class="btn primary" id="copy" type="button">复制</button>\n</div>\n<p class="status" id="status" aria-live="polite"></p>';
  var reads = spec.fields.map(function (f) {
    if (f.type === "checkbox") return '    args["' + f.id + '"]=$("#' + f.id + '").checked;';
    return '    args["' + f.id + '"]=$("#' + f.id + '").value;';
  }).join("\n");
  var ids = spec.fields.map(function (f) { return f.id; }).join('","');
  var tsrc = spec.transform.toString().replace(/^function\s*\w*\s*\([^)]*\)\s*\{/, "").replace(/\}\s*$/, "");
  var script = '(function(){\n  var $=PHT.$; var statusEl=$("#status"); var out=$("#out");\n  function transform(args){\n' + tsrc + '\n  }\n  function run(){ var args={};\n' + reads + '\n    try { out.value=transform(args); PHT.status(statusEl,"已处理","ok"); } catch(e){ PHT.status(statusEl,"出错了："+e.message,"error"); }\n  }\n'
    + (ids ? '  ["' + ids + '"].forEach(function(k){ $("#"+k).addEventListener("input",run); $("#"+k).addEventListener("change",run); });\n' : "")
    + '  $("#copy").addEventListener("click",function(){ if(!out.value){ PHT.status(statusEl,"没有内容","error"); return; } PHT.copy(out.value).then(function(ok){ PHT.flash($("#copy"),"已复制"); PHT.status(statusEl,ok?"已复制":"复制失败",ok?"ok":"error"); }); });\n  run();\n})();';
  TOOLS.push({ file: spec.file, meta: { title: spec.title, desc: spec.desc, category: spec.category || "text", tags: spec.tags, order: spec.order }, body: body, script: script });
}

function cssTool(spec) {
  var fieldsHtml = spec.fields.map(function (f) {
    if (f.type === "select") { var o = f.options.map(function (x) { return '<option value="' + escAttr(x.value) + '">' + escAttr(x.label) + '</option>'; }).join(""); return '  <div class="field"><label for="' + f.id + '">' + f.label + '</label><select id="' + f.id + '">' + o + '</select></div>'; }
    if (f.type === "checkbox") return '  <label class="chk"><input type="checkbox" id="' + f.id + '"' + (f.checked ? " checked" : "") + '> ' + f.label + '</label>';
    return '  <div class="field"><label for="' + f.id + '">' + f.label + '</label><input type="' + (f.type || "number") + '" id="' + f.id + '"' + (f.value !== undefined ? ' value="' + escAttr(f.value) + '"' : "") + (f.step !== undefined ? ' step="' + f.step + '"' : "") + '></div>';
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
    + (ids ? '  ["' + ids + '"].forEach(function(k){ $("#"+k).addEventListener("input",run); $("#"+k).addEventListener("change",run); });\n' : "")
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

// ====================================================================
// 新增辅助工厂：统计列表计算、图片像素/滤镜/绘制
// ====================================================================
function listCalcTool(spec) {
  var outs = spec.outputs.map(function (o) { return '  <div class="stat"><dt>' + o.label + '</dt><dd id="' + o.id + '">—</dd></div>'; }).join("\n");
  var body = '<div class="field"><label for="nums">输入数据（每行或逗号 / 空格分隔一个数字）</label><textarea id="nums" class="code" spellcheck="false" rows="6" placeholder="1\n2\n3\n4\n5"></textarea></div>\n<dl class="stat-row" style="margin-top:16px">\n' + outs + '\n</dl>\n<p class="status" id="status" aria-live="polite"></p>';
  var cb = spec.compute.toString().replace(/^function\s*\w*\s*\([^)]*\)\s*\{/, "").replace(/\}\s*$/, "");
  var script = '(function(){ var $=PHT.$; var statusEl=$("#status");\n'
    + '  function fnum(n){ if(n===null||n===undefined) return "—"; if(typeof n!=="number") return String(n); if(!isFinite(n)) return "—"; var a=Math.round(n*1e6)/1e6; return a.toLocaleString("zh-CN",{maximumFractionDigits:6}); }\n'
    + '  function parse(){ var t=$("#nums").value; var a=[]; t.split(/[\\s,;]+/).forEach(function(s){ s=s.trim(); if(s==="")return; var v=parseFloat(s); if(!isNaN(v)) a.push(v); }); return a; }\n'
    + '  var compute=function(arr){ ' + cb + ' };\n'
    + '  function run(){ try{ var arr=parse(); if(!arr.length){ PHT.status(statusEl,"请输入至少一个数字"); return; } var r=compute(arr);\n'
    + spec.outputs.map(function (o) { return '    if(r&&r["' + o.id + '"]!==undefined){ var v=r["' + o.id + '"]; $("#' + o.id + '").textContent=(typeof v==="number")?fnum(v):v; }'; }).join("\n")
    + '\n    PHT.status(statusEl,(r&&r.__msg)||"计算完成","ok"); }catch(e){ PHT.status(statusEl,"出错了："+e.message,"error"); } }\n'
    + '  $("#nums").addEventListener("input",run); run();\n})();';
  TOOLS.push({ file: spec.file, meta: { title: spec.title, desc: spec.desc, category: "calc", tags: spec.tags, order: spec.order }, body: body, script: script });
}

function imgEffectTool(spec) {
  var fieldHtml = (spec.fields || []).map(function (f) {
    return '  <div class="field"><label for="' + f.id + '">' + f.label + '</label><input type="' + (f.type || "number") + '" id="' + f.id + '"' + (f.value !== undefined ? ' value="' + escAttr(f.value) + '"' : "") + (f.min !== undefined ? ' min="' + f.min + '"' : "") + (f.max !== undefined ? ' max="' + f.max + '"' : "") + (f.step !== undefined ? ' step="' + f.step + '"' : "") + '></div>';
  }).join("\n");
  var body = '<label class="drop" id="drop"><input type="file" id="fileInput" accept="image/*"><strong>拖入图片或点击选择</strong><span>' + spec.desc + '</span></label>\n'
    + (fieldHtml ? '<div class="grid-2" style="margin-top:14px">\n' + fieldHtml + '\n</div>\n' : '')
    + '<canvas id="canvas" style="display:none"></canvas>\n<div class="preview-box" id="pv" style="margin-top:14px"><span class="empty">预览会显示在这里</span></div>\n<div class="actions" style="margin-top:14px"><button class="btn primary" id="download" type="button" disabled>下载图片</button></div>\n<p class="status" id="status" aria-live="polite"></p>';
  var ids = (spec.fields || []).map(function (f) { return f.id; });
  var reads = ids.map(function (id) {
    var f = spec.fields.filter(function (x) { return x.id === id; })[0];
    var val = (f.type === "text") ? '($("#' + id + '").value)' : 'parseFloat($("#' + id + '").value)';
    return '    var ' + id + '=' + val + ';';
  }).join("\n");
  var argsObj = ids.map(function (id) { return id + ':' + id; }).join(",");
  var core;
  if (spec.mode === "filter") {
    core = '    ctx.filter=' + JSON.stringify(spec.filter || "none") + '; ctx.drawImage(img,0,0,w,h); ctx.filter="none";';
  } else if (spec.mode === "draw") {
    core = '    (function(ctx,w,h,img,args){ ' + (spec.draw || "") + ' })(ctx,w,h,img,{' + argsObj + '});';
  } else {
    core = '    var idt=ctx.getImageData(0,0,w,h); (function(d,w,h,args){ ' + (spec.apply || "") + ' })(idt.data,w,h,{' + argsObj + '}); ctx.putImageData(idt,0,0);';
  }
  var script = '(function(){\n  var $=PHT.$; var statusEl=$("#status"); var canvas=$("#canvas"), img=null, dataUrl=null; var fileInput=$("#fileInput");\n'
    + '  function loadFile(file){ if(!file||!/^image\\//.test(file.type)){ PHT.status(statusEl,"请选择图片文件","error"); return; } var reader=new FileReader(); reader.onload=function(e){ var im=new Image(); im.onload=function(){ img=im; render(); PHT.status(statusEl,"已载入，可下载","ok"); }; im.onerror=function(){ PHT.status(statusEl,"图片解析失败","error"); }; im.src=e.target.result; }; reader.readAsDataURL(file); }\n'
    + '  function render(){\n    if(!img) return;\n    var w=img.naturalWidth, h=img.naturalHeight;\n    canvas.width=w; canvas.height=h;\n    var ctx=canvas.getContext("2d");\n    if(!ctx){ PHT.status(statusEl,"当前浏览器不支持画布","error"); return; }\n'
    + (reads ? reads + "\n" : "")
    + '    try{\n      ' + core + '\n      dataUrl=canvas.toDataURL("image/png");\n      var pv=$("#pv"); pv.innerHTML=""; var o=new Image(); o.src=dataUrl; pv.appendChild(o); $("#download").disabled=false;\n      PHT.status(statusEl,"已处理，可下载","ok");\n    }catch(e){ PHT.status(statusEl,"处理失败："+e.message,"error"); }\n  }\n'
    + '  fileInput.addEventListener("change",function(){ loadFile(fileInput.files[0]); });\n'
    + (ids.length ? '  ["' + ids.join('","') + '"].forEach(function(k){ $("#"+k).addEventListener("input",render); $("#"+k).addEventListener("change",render); });\n' : '')
    + '  $("#download").addEventListener("click",function(){ if(dataUrl) PHT.download("' + spec.file.replace(".html", ".png") + '", dataUrl); });\n})();';
  TOOLS.push({ file: spec.file, meta: { title: spec.title, desc: spec.desc, category: "image", tags: ["图片", "编辑", "特效"].concat(spec.tags || []), order: spec.order }, body: body, script: script });
}

// ---------- 文本工具（新增 45 个）----------
textTool({ file: "text-uppercase.html", title: "转大写", desc: "把文本全部转换为大写字母。", tags: ["大写", "文本", "转换"], order: 1101, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "Hello World" }], transform: function (args) { return args.text.toUpperCase(); } });
textTool({ file: "text-lowercase.html", title: "转小写", desc: "把文本全部转换为小写字母。", tags: ["小写", "文本", "转换"], order: 1102, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "Hello World" }], transform: function (args) { return args.text.toLowerCase(); } });
textTool({ file: "text-sentence-case.html", title: "句首大写", desc: "将每个句子的首字母大写，适合规整英文段落。", tags: ["句首", "大小写", "英文"], order: 1103, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "hello. world! how are you?" }], transform: function (args) { return args.text.replace(/(^\s*|[.?!。！？]+\s*)([a-z])/g, function (m, p, c) { return p + c.toUpperCase(); }); } });
textTool({ file: "text-camel-case.html", title: "转驼峰 camelCase", desc: "把空格、连字符、下划线分隔的词转为驼峰命名。", tags: ["驼峰", "命名", "转换"], order: 1104, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "user name list" }], transform: function (args) { var w = args.text.trim().split(/[\s\-_]+/).filter(Boolean); if (!w.length) return ""; return w[0].toLowerCase() + w.slice(1).map(function (x) { return x.charAt(0).toUpperCase() + x.slice(1).toLowerCase(); }).join(""); } });
textTool({ file: "text-snake-case.html", title: "转蛇形 snake_case", desc: "把文本转为下划线分隔的小写命名。", tags: ["蛇形", "命名", "转换"], order: 1105, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "userNameList" }], transform: function (args) { return args.text.trim().split(/[\s\-_]+/).filter(Boolean).map(function (x) { return x.toLowerCase(); }).join("_"); } });
textTool({ file: "text-kebab-case.html", title: "转短横 kebab-case", desc: "把文本转为连字符分隔的小写命名，常用于 CSS 类名。", tags: ["短横", "命名", "CSS"], order: 1106, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "userNameList" }], transform: function (args) { return args.text.trim().split(/[\s\-_]+/).filter(Boolean).map(function (x) { return x.toLowerCase(); }).join("-"); } });
textTool({ file: "text-pascal-case.html", title: "转帕斯卡 PascalCase", desc: "把文本转为每个词首字母大写的命名。", tags: ["帕斯卡", "命名", "转换"], order: 1107, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "user name list" }], transform: function (args) { return args.text.trim().split(/[\s\-_]+/).filter(Boolean).map(function (x) { return x.charAt(0).toUpperCase() + x.slice(1).toLowerCase(); }).join(""); } });
textTool({ file: "text-toggle-case.html", title: "大小写互换", desc: "把每个字母的大小写反转。", tags: ["大小写", "互换", "文本"], order: 1108, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "Hello" }], transform: function (args) { return args.text.replace(/[a-zA-Z]/g, function (c) { return c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase(); }); } });
textTool({ file: "text-remove-dup-chars.html", title: "去除重复字符", desc: "把连续重复的字符压缩成单个。", tags: ["去重", "字符", "文本"], order: 1109, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "aaabbbcc" }], transform: function (args) { return args.text.replace(/(.)\1+/g, "$1"); } });
textTool({ file: "text-delete-lines-matching.html", title: "删除含关键词行", desc: "移除所有包含指定关键词的行。", tags: ["删除", "筛选", "行"], order: 1110, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8 }, { id: "kw", label: "关键词", type: "text", value: "test" }], transform: function (args) { return args.text.split("\n").filter(function (l) { return l.indexOf(args.kw) === -1; }).join("\n"); } });
textTool({ file: "text-extract-domains.html", title: "提取域名", desc: "从文本中的网址提取主机域名。", tags: ["域名", "提取", "URL"], order: 1111, fields: [{ id: "text", label: "文本（含链接）", type: "textarea", rows: 8, placeholder: "访问 https://www.example.com 查看" }], transform: function (args) { var m = args.text.match(/https?:\/\/([^\/\s?#]+)/g); return m ? m.map(function (u) { return u.replace(/^https?:\/\//, ""); }).join("\n") : "（未找到）"; } });
textTool({ file: "text-sort-numeric.html", title: "按数值排序行", desc: "把每一行按数值大小升序排序。", tags: ["排序", "数值", "行"], order: 1112, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "10\n2\n33" }], transform: function (args) { return args.text.split("\n").map(function (l) { return l.trim(); }).filter(function (l) { return l !== ""; }).sort(function (a, b) { return parseFloat(a) - parseFloat(b); }).join("\n"); } });
textTool({ file: "text-remove-duplicate-adjacent.html", title: "合并相邻重复行", desc: "把连续相同的行压缩成一行。", tags: ["去重", "相邻", "行"], order: 1113, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "a\na\nb" }], transform: function (args) { var a = args.text.split("\n"), out = [], prev = null; a.forEach(function (l) { if (l !== prev) out.push(l); prev = l; }); return out.join("\n"); } });
textTool({ file: "text-strip-html.html", title: "去除 HTML 标签", desc: "移除文本中的 HTML 标签，保留纯文本。", tags: ["HTML", "去标签", "清洗"], order: 1114, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "<p>你好 <b>世界</b></p>" }], transform: function (args) { return args.text.replace(/<[^>]*>/g, ""); } });
textTool({ file: "text-add-quotes.html", title: "行加引号", desc: "给每一行首尾加上双引号。", tags: ["引号", "行处理", "文本"], order: 1115, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "每行一条" }], transform: function (args) { return args.text.split("\n").map(function (l) { return '"' + l + '"'; }).join("\n"); } });
textTool({ file: "text-remove-quotes.html", title: "去除行引号", desc: "移除每行首尾的引号。", tags: ["引号", "清洗", "文本"], order: 1116, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: '"每行一条"' }], transform: function (args) { return args.text.split("\n").map(function (l) { return l.replace(/^["']+|["']+$/g, ""); }).join("\n"); } });
textTool({ file: "text-indent-lines.html", title: "行首缩进", desc: "为每行添加指定数量的空格缩进。", tags: ["缩进", "行处理", "文本"], order: 1117, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8 }, { id: "indent", label: "缩进空格数", type: "number", value: 2, min: 0 }], transform: function (args) { var pad = Array(args.indent + 1).join(" "); return args.text.split("\n").map(function (l) { return pad + l; }).join("\n"); } });
textTool({ file: "text-sort-by-length.html", title: "按长度排序行", desc: "按每行字符长度升序排列。", tags: ["排序", "长度", "行"], order: 1118, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "apple\nbanana\npear" }], transform: function (args) { return args.text.split("\n").sort(function (a, b) { return a.length - b.length; }).join("\n"); } });
textTool({ file: "text-reverse-words-per-line.html", title: "行内单词反转", desc: "将每行内单词的顺序整体反转。", tags: ["反转", "单词", "行"], order: 1119, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "the quick fox" }], transform: function (args) { return args.text.split("\n").map(function (l) { return l.split(/\s+/).reverse().join(" "); }).join("\n"); } });
textTool({ file: "text-repeat-lines.html", title: "每行重复", desc: "把每一行重复指定次数。", tags: ["重复", "行处理", "文本"], order: 1120, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8 }, { id: "times", label: "重复次数", type: "number", value: 2, min: 1 }], transform: function (args) { return args.text.split("\n").map(function (l) { var o = []; for (var i = 0; i < args.times; i++) o.push(l); return o.join("\n"); }).join("\n"); } });
textTool({ file: "text-pad-left.html", title: "左补齐", desc: "把每行补齐到指定宽度（左侧补字符）。", tags: ["补齐", "对齐", "文本"], order: 1121, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8 }, { id: "width", label: "目标宽度", type: "number", value: 20, min: 1 }, { id: "char", label: "填充字符", type: "text", value: " " }], transform: function (args) { var c = args.char.charAt(0) || " "; return args.text.split("\n").map(function (l) { return (Array(args.width + 1).join(c) + l).slice(-args.width); }).join("\n"); } });
textTool({ file: "text-pad-right.html", title: "右补齐", desc: "把每行补齐到指定宽度（右侧补字符）。", tags: ["补齐", "对齐", "文本"], order: 1122, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8 }, { id: "width", label: "目标宽度", type: "number", value: 20, min: 1 }, { id: "char", label: "填充字符", type: "text", value: " " }], transform: function (args) { var c = args.char.charAt(0) || " "; return args.text.split("\n").map(function (l) { return (l + Array(args.width + 1).join(c)).slice(0, args.width); }).join("\n"); } });
textTool({ file: "text-escape-regex.html", title: "正则转义", desc: "把文本中的正则特殊字符转义，便于作为字面量。", tags: ["正则", "转义", "文本"], order: 1123, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "a.b*c" }], transform: function (args) { return args.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); } });
textTool({ file: "text-unescape-regex.html", title: "去除正则转义", desc: "把转义后的正则字符还原。", tags: ["正则", "反转义", "文本"], order: 1124, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "a\\.b\\*c" }], transform: function (args) { return args.text.replace(/\\([.*+?^${}()|[\]\\])/g, "$1"); } });
textTool({ file: "text-remove-non-ascii.html", title: "仅保留 ASCII", desc: "删除所有非 ASCII 字符（保留英文与符号）。", tags: ["ASCII", "清洗", "文本"], order: 1125, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "héllo 世界" }], transform: function (args) { return args.text.replace(/[^\x00-\x7F]/g, ""); } });
textTool({ file: "text-keep-only-chinese.html", title: "仅保留中文", desc: "提取文本中的中文字符，移除其它内容。", tags: ["中文", "提取", "文本"], order: 1126, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "Hello 世界 123" }], transform: function (args) { return args.text.replace(/[^\u4e00-\u9fff]/g, ""); } });
textTool({ file: "text-keep-only-alnum.html", title: "仅保留字母数字", desc: "保留英文字母与数字，移除标点与空格。", tags: ["字母", "数字", "清洗"], order: 1127, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "a1!b2@c3" }], transform: function (args) { return args.text.replace(/[^a-zA-Z0-9]/g, ""); } });
textTool({ file: "text-normalize-whitespace.html", title: "规范空白", desc: "把多余空格合并为一个，连续空行合并为一行。", tags: ["空白", "规范", "文本"], order: 1128, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "太多   空格\n\n\n分段" }], transform: function (args) { return args.text.replace(/[ \t]+/g, " ").replace(/\n{2,}/g, "\n").trim(); } });
textTool({ file: "text-extract-ips.html", title: "提取 IP 地址", desc: "从文本中提取所有 IPv4 地址。", tags: ["IP", "提取", "网络"], order: 1129, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "服务器 192.168.1.1 正常" }], transform: function (args) { var m = args.text.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g); return m ? m.join("\n") : "（未找到）"; } });
textTool({ file: "text-extract-phones.html", title: "提取手机号", desc: "从文本中提取中国大陆手机号。", tags: ["手机号", "提取", "文本"], order: 1130, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "联系 13812345678" }], transform: function (args) { var m = args.text.match(/1[3-9]\d{9}/g); return m ? m.join("\n") : "（未找到）"; } });
textTool({ file: "text-mask-email.html", title: "邮箱打码", desc: "隐藏邮箱本地名中间部分，保护隐私。", tags: ["邮箱", "打码", "隐私"], order: 1131, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "alice@example.com" }], transform: function (args) { return args.text.replace(/([\w.+-]+)@/g, function (m, u) { return u.slice(0, Math.min(3, u.length)) + "***@"; }); } });
textTool({ file: "text-mask-phone.html", title: "手机号打码", desc: "隐藏手机号中间四位，保护隐私。", tags: ["手机号", "打码", "隐私"], order: 1132, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "13812345678" }], transform: function (args) { return args.text.replace(/(1\d{2})\d{4}(\d{4})/g, "$1****$2"); } });
textTool({ file: "text-truncate.html", title: "截断文本", desc: "把文本截断到指定长度并加省略号。", tags: ["截断", "省略号", "文本"], order: 1133, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6 }, { id: "len", label: "最大长度", type: "number", value: 100, min: 1 }], transform: function (args) { return args.text.length > args.len ? args.text.slice(0, args.len) + "…" : args.text; } });
textTool({ file: "text-split-into-chunks.html", title: "按长度切块", desc: "把文本按指定字符数切成多块。", tags: ["切块", "分段", "文本"], order: 1134, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6 }, { id: "size", label: "每块字符数", type: "number", value: 80, min: 1 }], transform: function (args) { var s = args.text, out = []; for (var i = 0; i < s.length; i += args.size) out.push(s.slice(i, i + args.size)); return out.join("\n"); } });
textTool({ file: "text-extract-hashtags.html", title: "提取话题标签", desc: "从文本中提取所有 # 话题标签。", tags: ["话题", "提取", "文本"], order: 1135, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "周末去 #爬山 #露营" }], transform: function (args) { var m = args.text.match(/#[\w\u4e00-\u9fff]+/g); return m ? m.join("\n") : "（未找到）"; } });
textTool({ file: "text-extract-mentions.html", title: "提取 @提及", desc: "从文本中提取所有 @ 提及。", tags: ["提及", "提取", "文本"], order: 1136, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "找 @alice 和 @bob" }], transform: function (args) { var m = args.text.match(/@[\w\u4e00-\u9fff]+/g); return m ? m.join("\n") : "（未找到）"; } });
textTool({ file: "text-censor.html", title: "敏感词打码", desc: "把指定敏感词替换为同等长度的星号。", tags: ["敏感词", "打码", "文本"], order: 1137, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6 }, { id: "words", label: "敏感词（逗号分隔）", type: "text", value: "广告,推广" }], transform: function (args) { var ws = args.words.split(/[,，]/).map(function (w) { return w.trim(); }).filter(Boolean); var t = args.text; ws.forEach(function (w) { if (w) t = t.split(w).join("*".repeat(w.length)); }); return t; } });
textTool({ file: "text-align-columns.html", title: "列对齐", desc: "按分隔符把文本对齐成整齐的多列。", tags: ["对齐", "列", "文本"], order: 1138, fields: [{ id: "text", label: "文本（多列，用空格 / 制表符分隔）", type: "textarea", rows: 8, placeholder: "a 1\nbb 22" }, { id: "delim", label: "分隔符", type: "text", value: " " }], transform: function (args) { var rows = args.text.split("\n").map(function (l) { return l.split(args.delim); }); var n = rows.reduce(function (m, r) { return Math.max(m, r.length); }, 0); var w = []; for (var c = 0; c < n; c++) { w[c] = 0; rows.forEach(function (r) { if (r[c] && r[c].length > w[c]) w[c] = r[c].length; }); } return rows.map(function (r) { return r.map(function (cell, i) { var s = cell || ""; return s + Array(w[i] + 1 - s.length).join(" "); }).join("  "); }).join("\n"); } });
textTool({ file: "text-count-char.html", title: "统计字符次数", desc: "统计某个字符在文本中出现的次数。", tags: ["统计", "字符", "文本"], order: 1139, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6 }, { id: "char", label: "要统计的字符", type: "text", value: "a" }], transform: function (args) { var c = args.char.charAt(0) || ""; if (!c) return "请填写字符"; var n = args.text.split("").filter(function (x) { return x === c; }).length; return '字符 “' + c + '” 出现 ' + n + ' 次'; } });
textTool({ file: "text-find-and-delete.html", title: "删除子串", desc: "从文本中删除所有指定的子串。", tags: ["删除", "子串", "文本"], order: 1140, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6 }, { id: "sub", label: "要删除的内容", type: "text", value: "TODO" }], transform: function (args) { return args.text.split(args.sub).join(""); } });
textTool({ file: "text-remove-control-chars.html", title: "去除控制字符", desc: "移除文本中的不可见控制字符。", tags: ["控制字符", "清洗", "文本"], order: 1141, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "含\u0007控制符的文本" }], transform: function (args) { return args.text.replace(/[\x00-\x1F\x7F]/g, ""); } });
textTool({ file: "text-to-unicode-escapes.html", title: "转 Unicode 转义", desc: "把每个字符转为 \\uXXXX 形式，便于在代码中嵌入。", tags: ["Unicode", "转义", "文本"], order: 1142, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "A中" }], transform: function (args) { return args.text.split("").map(function (ch) { var cp = ch.charCodeAt(0); return "\\u" + ("0000" + cp.toString(16)).slice(-4); }).join(""); } });
textTool({ file: "text-from-unicode-escapes.html", title: "还原 Unicode 转义", desc: "把 \\uXXXX 形式的转义还原为普通文本。", tags: ["Unicode", "还原", "文本"], order: 1143, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "\\u0041\\u4e2d" }], transform: function (args) { return args.text.replace(/\\u([0-9a-fA-F]{4})/g, function (m, h) { return String.fromCharCode(parseInt(h, 16)); }); } });
textTool({ file: "text-remove-bom.html", title: "去除 BOM", desc: "移除文本开头的 UTF-8 BOM 标记。", tags: ["BOM", "清洗", "文本"], order: 1144, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "含 BOM 的文本" }], transform: function (args) { return args.text.replace(/^\uFEFF/, ""); } });
textTool({ file: "text-number-lines-reverse.html", title: "倒序编号", desc: "为每一行添加从末尾往前递减的序号。", tags: ["编号", "倒序", "行"], order: 1145, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "每行一条" }], transform: function (args) { var lines = args.text.split("\n"); return lines.map(function (l, i) { return (lines.length - i) + ". " + l; }).join("\n"); } });

// ---------- 开发者工具（新增 45 个）----------
textTool({ file: "dev-json-to-query.html", title: "JSON 转查询串", desc: "把 JSON 对象转换为 URL 查询字符串。", category: "dev", tags: ["JSON", "Query", "开发"], order: 1201, fields: [{ id: "json", label: "JSON", type: "textarea", rows: 6, placeholder: '{"a":1,"b":"x"}' }], transform: function (args) { try { var o = JSON.parse(args.json); var p = []; for (var k in o) { if (Object.prototype.hasOwnProperty.call(o, k)) p.push(encodeURIComponent(k) + "=" + encodeURIComponent(o[k])); } return p.join("&"); } catch (e) { return "无效 JSON：" + e.message; } } });
textTool({ file: "dev-query-to-json.html", title: "查询串转 JSON", desc: "把 URL 查询字符串解析为 JSON 对象。", category: "dev", tags: ["Query", "JSON", "开发"], order: 1202, fields: [{ id: "q", label: "查询串", type: "textarea", rows: 4, placeholder: "a=1&b=x" }], transform: function (args) { var o = {}; args.q.split("&").forEach(function (kv) { if (!kv) return; var i = kv.indexOf("="); var k = kv.slice(0, i); var v = kv.slice(i + 1); o[decodeURIComponent(k)] = decodeURIComponent(v); }); return JSON.stringify(o, null, 2); } });
textTool({ file: "dev-html-to-markdown.html", title: "HTML 转 Markdown", desc: "把常见 HTML 标签转换为 Markdown 语法（基础版）。", category: "dev", tags: ["HTML", "Markdown", "开发"], order: 1203, fields: [{ id: "html", label: "HTML", type: "textarea", rows: 8, placeholder: "<h1>标题</h1><p>正文 <b>加粗</b></p>" }], transform: function (args) { return args.html.replace(/<h([1-6])>(.*?)<\/h\1>/gi, function (m, n, t) { return Array(+n + 1).join("#") + " " + t.trim() + "\n"; }).replace(/<strong>(.*?)<\/strong>/gi, "**$1**").replace(/<em>(.*?)<\/em>/gi, "*$1*").replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)").replace(/<li>(.*?)<\/li>/gi, "- $1").replace(/<[^>]+>/g, "").trim(); } });
textTool({ file: "dev-minify-js.html", title: "JS 压缩", desc: "移除 JavaScript 中的注释与多余空白（基础版）。", category: "dev", tags: ["JS", "压缩", "开发"], order: 1204, fields: [{ id: "js", label: "JavaScript", type: "textarea", rows: 8, placeholder: "function add(a, b) { return a + b; }" }], transform: function (args) { return args.js.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "").replace(/\n/g, " ").replace(/\s*([{};:,=+\-*/<>])\s*/g, "$1").replace(/;}/g, "}").replace(/\s+/g, " ").trim(); } });
textTool({ file: "dev-beautify-js.html", title: "JS 美化", desc: "对 JavaScript 做基础缩进格式化。", category: "dev", tags: ["JS", "格式化", "开发"], order: 1205, fields: [{ id: "js", label: "JavaScript", type: "textarea", rows: 8, placeholder: "function add(a,b){return a+b;}" }], transform: function (args) { var s = args.js, out = "", indent = 0; for (var i = 0; i < s.length; i++) { var c = s[i]; if (c === "{" || c === "[") { out += c + "\n" + Array(indent + 2).join(" "); indent += 2; } else if (c === "}" || c === "]") { indent -= 2; out += "\n" + Array(indent + 1).join(" ") + c; } else if (c === ";") { out += ";\n" + Array(indent + 1).join(" "); } else if (c === ",") { out += ", "; } else { out += c; } } return out; } });
textTool({ file: "dev-html-minify.html", title: "HTML 压缩", desc: "移除 HTML 注释并压缩空白。", category: "dev", tags: ["HTML", "压缩", "开发"], order: 1206, fields: [{ id: "html", label: "HTML", type: "textarea", rows: 8, placeholder: "<div>  <p>hi</p>  </div>" }], transform: function (args) { return args.html.replace(/<!--[\s\S]*?-->/g, "").replace(/\s+/g, " ").replace(/>\s+</g, "><").trim(); } });
textTool({ file: "dev-escape-js.html", title: "JS 字符串转义", desc: "把文本转义为可嵌入 JS 字符串的形式。", category: "dev", tags: ["JS", "转义", "开发"], order: 1207, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "He said \"hi\"\nend" }], transform: function (args) { return args.text.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/'/g, "\\'").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t"); } });
textTool({ file: "dev-unescape-js.html", title: "JS 字符串反转义", desc: "把转义过的 JS 字符串还原为普通文本。", category: "dev", tags: ["JS", "反转义", "开发"], order: 1208, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "He said \\\"hi\\\"\\nend" }], transform: function (args) { return args.text.replace(/\\n/g, "\n").replace(/\\r/g, "\r").replace(/\\t/g, "\t").replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\\\/g, "\\"); } });
textTool({ file: "dev-hex-to-rgb.html", title: "十六进制转 RGB", desc: "把十六进制颜色转换为 RGB 分量。", category: "dev", tags: ["颜色", "转换", "开发"], order: 1209, fields: [{ id: "hex", label: "十六进制颜色", type: "text", value: "#3366cc" }], transform: function (args) { var h = args.hex.replace("#", ""); if (h.length === 3) h = h.split("").map(function (x) { return x + x; }).join(""); if (h.length !== 6) return "请输入 6 位十六进制颜色"; var r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16); return "R: " + r + "\nG: " + g + "\nB: " + b + "\nRGB: rgb(" + r + ", " + g + ", " + b + ")"; } });
textTool({ file: "dev-rgb-to-hex.html", title: "RGB 转十六进制", desc: "把 RGB 分量转换为十六进制颜色。", category: "dev", tags: ["颜色", "转换", "开发"], order: 1210, fields: [{ id: "r", label: "R", type: "number", value: 51 }, { id: "g", label: "G", type: "number", value: 102 }, { id: "b", label: "B", type: "number", value: 204 }], transform: function (args) { function h(n) { var s = Math.max(0, Math.min(255, Math.round(n))).toString(16); return s.length < 2 ? "0" + s : s; } return "#" + h(args.r) + h(args.g) + h(args.b); } });
textTool({ file: "dev-hsl-to-hex.html", title: "HSL 转十六进制", desc: "把 HSL 颜色转换为十六进制。", category: "dev", tags: ["颜色", "转换", "开发"], order: 1211, fields: [{ id: "h", label: "H (0-360)", type: "number", value: 210 }, { id: "s", label: "S (%)", type: "number", value: 60 }, { id: "l", label: "L (%)", type: "number", value: 50 }], transform: function (args) { var h = args.h / 360, s = args.s / 100, l = args.l / 100, r, g, b; if (s === 0) { r = g = b = l; } else { function f(p, q, t) { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; } var q = l < 0.5 ? l * (1 + s) : l + s - l * s; var p = 2 * l - q; r = f(p, q, h + 1 / 3); g = f(p, q, h); b = f(p, q, h - 1 / 3); } function H(n) { var s = Math.round(n * 255).toString(16); return s.length < 2 ? "0" + s : s; } return "#" + H(r) + H(g) + H(b); } });
textTool({ file: "dev-ulid.html", title: "生成 ULID", desc: "生成基于时间排序的 ULID 标识符。", category: "dev", tags: ["ULID", "标识", "生成"], order: 1212, fields: [], transform: function (args) { var enc = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; var t = Date.now(); var s = ""; for (var i = 0; i < 10; i++) { s = enc[t % 32] + s; t = Math.floor(t / 32); } for (var j = 0; j < 16; j++) { s += enc[Math.floor(Math.random() * 32)]; } return s; } });
textTool({ file: "dev-nanoid.html", title: "生成 NanoID", desc: "生成可定长的安全随机 NanoID。", category: "dev", tags: ["NanoID", "标识", "生成"], order: 1213, fields: [{ id: "len", label: "长度", type: "number", value: 21, min: 1 }], transform: function (args) { var abc = "_~0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"; var s = ""; for (var i = 0; i < args.len; i++) s += abc[Math.floor(Math.random() * abc.length)]; return s; } });
textTool({ file: "dev-ipv4-to-int.html", title: "IPv4 转整数", desc: "把点分十进制 IP 转为 32 位整数。", category: "dev", tags: ["IPv4", "网络", "转换"], order: 1214, fields: [{ id: "ip", label: "IPv4 地址", type: "text", value: "192.168.1.1" }], transform: function (args) { var p = args.ip.split(".").map(Number); if (p.length !== 4 || p.some(function (x) { return isNaN(x) || x < 0 || x > 255; })) return "格式错误"; return (p[0] << 24) + (p[1] << 16) + (p[2] << 8) + p[3]; } });
textTool({ file: "dev-int-to-ipv4.html", title: "整数转 IPv4", desc: "把 32 位整数还原为点分十进制 IP。", category: "dev", tags: ["IPv4", "网络", "转换"], order: 1215, fields: [{ id: "num", label: "整数", type: "number", value: 3232235777 }], transform: function (args) { var n = args.num >>> 0; return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join("."); } });
textTool({ file: "dev-mask-api-key.html", title: "密钥打码", desc: "隐藏 API Key 中间部分，仅保留首尾。", category: "dev", tags: ["密钥", "打码", "安全"], order: 1216, fields: [{ id: "key", label: "API Key", type: "text", value: "sk_live_abcdef1234567890" }], transform: function (args) { var k = args.key; if (k.length <= 6) return "***"; return k.slice(0, 3) + "****" + k.slice(-4); } });
textTool({ file: "dev-json-flatten.html", title: "JSON 扁平化", desc: "把嵌套 JSON 展开为点号路径的扁平结构。", category: "dev", tags: ["JSON", "扁平", "开发"], order: 1217, fields: [{ id: "json", label: "JSON", type: "textarea", rows: 8, placeholder: '{"a":{"b":1}}' }], transform: function (args) { try { var o = JSON.parse(args.json); var res = {}; (function f(p, o) { if (Array.isArray(o)) { o.forEach(function (v, i) { f(p + "[" + i + "]", v); }); } else if (o && typeof o === "object") { Object.keys(o).forEach(function (k) { f(p ? p + "." + k : k, o[k]); }); } else { res[p] = o; } })("", o); return JSON.stringify(res, null, 2); } catch (e) { return "无效 JSON：" + e.message; } } });
textTool({ file: "dev-json-unflatten.html", title: "JSON 反扁平化", desc: "把点号路径的扁平结构还原为嵌套 JSON。", category: "dev", tags: ["JSON", "嵌套", "开发"], order: 1218, fields: [{ id: "json", label: "JSON", type: "textarea", rows: 8, placeholder: '{"a.b":1}' }], transform: function (args) { try { var flat = JSON.parse(args.json); var out = {}; Object.keys(flat).forEach(function (path) { var parts = path.replace(/\[(\d+)\]/g, ".$1").split("."); var cur = out; parts.forEach(function (k, i) { if (i === parts.length - 1) cur[k] = flat[path]; else { if (!cur[k]) cur[k] = /^\d+$/.test(parts[i + 1]) ? [] : {}; cur = cur[k]; } }); }); return JSON.stringify(out, null, 2); } catch (e) { return "无效 JSON：" + e.message; } } });
textTool({ file: "dev-roman-to-arabic.html", title: "罗马数字转阿拉伯", desc: "把罗马数字转换为阿拉伯数字。", category: "dev", tags: ["罗马数字", "转换", "开发"], order: 1219, fields: [{ id: "text", label: "罗马数字", type: "text", value: "MMXXIV" }], transform: function (args) { var map = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 }; var s = args.text.toUpperCase().trim(); var total = 0, prev = 0; for (var i = s.length - 1; i >= 0; i--) { var v = map[s[i]]; if (!v) return "非法罗马数字"; if (v < prev) total -= v; else { total += v; prev = v; } } return String(total); } });
textTool({ file: "dev-arabic-to-roman.html", title: "阿拉伯转罗马数字", desc: "把阿拉伯数字（1-3999）转换为罗马数字。", category: "dev", tags: ["罗马数字", "转换", "开发"], order: 1220, fields: [{ id: "num", label: "数字", type: "number", value: 1994 }], transform: function (args) { var n = Math.floor(args.num); if (n <= 0 || n > 3999) return "支持 1-3999"; var vals = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]]; var out = ""; vals.forEach(function (v) { while (n >= v[0]) { out += v[1]; n -= v[0]; } }); return out; } });
textTool({ file: "dev-binary-to-text.html", title: "二进制转文本", desc: "把 8 位一组的二进制串还原为文本。", category: "dev", tags: ["二进制", "转换", "开发"], order: 1221, fields: [{ id: "text", label: "二进制（空格分隔 8 位组）", type: "textarea", rows: 4, placeholder: "01001000 01101001" }], transform: function (args) { var bins = args.text.trim().split(/\s+/).filter(Boolean); try { return bins.map(function (b) { return String.fromCharCode(parseInt(b, 2)); }).join(""); } catch (e) { return "格式错误"; } } });
textTool({ file: "dev-text-to-binary.html", title: "文本转二进制", desc: "把文本的每个字符转为 8 位二进制。", category: "dev", tags: ["二进制", "转换", "开发"], order: 1222, fields: [{ id: "text", label: "文本", type: "textarea", rows: 4, placeholder: "Hi" }], transform: function (args) { return args.text.split("").map(function (c) { var b = c.charCodeAt(0).toString(2); return "0".repeat(8 - b.length) + b; }).join(" "); } });
textTool({ file: "dev-hex-to-text.html", title: "十六进制转文本", desc: "把十六进制字节串还原为文本。", category: "dev", tags: ["十六进制", "转换", "开发"], order: 1223, fields: [{ id: "text", label: "十六进制（偶数长度）", type: "textarea", rows: 4, placeholder: "4869" }], transform: function (args) { var h = args.text.replace(/\s+/g, ""); if (h.length % 2) return "十六进制长度应为偶数"; try { var out = ""; for (var i = 0; i < h.length; i += 2) out += String.fromCharCode(parseInt(h.substr(i, 2), 16)); return out; } catch (e) { return "格式错误"; } } });
textTool({ file: "dev-text-to-hex.html", title: "文本转十六进制", desc: "把文本转换为十六进制字节串。", category: "dev", tags: ["十六进制", "转换", "开发"], order: 1224, fields: [{ id: "text", label: "文本", type: "textarea", rows: 4, placeholder: "Hi" }], transform: function (args) { return args.text.split("").map(function (c) { var s = c.charCodeAt(0).toString(16); return s.length < 2 ? "0" + s : s; }).join(" "); } });
textTool({ file: "dev-morse-decode.html", title: "摩斯电码解码", desc: "把摩斯电码（空格分隔）解码为文本。", category: "dev", tags: ["摩斯", "解码", "开发"], order: 1225, fields: [{ id: "text", label: "摩斯电码", type: "textarea", rows: 4, placeholder: ".... .." }], transform: function (args) { var M = { ".-": "A", "-...": "B", "-.-.": "C", "-..": "D", ".": "E", "..-.": "F", "--.": "G", "....": "H", "..": "I", ".---": "J", "-.-": "K", ".-..": "L", "--": "M", "-.": "N", "---": "O", ".--.": "P", "--.-": "Q", ".-.": "R", "...": "S", "-": "T", "..-": "U", "...-": "V", ".--": "W", "-..-": "X", "-.--": "Y", "--..": "Z", "-----": "0", ".----": "1", "..---": "2", "...--": "3", "....-": "4", ".....": "5", "-....": "6", "--...": "7", "---..": "8", "----.": "9" }; return args.text.trim().split(/\s+/).map(function (w) { return M[w] || w; }).join(""); } });
textTool({ file: "dev-html-unescape.html", title: "HTML 实体解码", desc: "把常见 HTML 实体还原为字符。", category: "dev", tags: ["HTML", "实体", "解码"], order: 1226, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "&lt;div&gt;&amp;&lt;/div&gt;" }], transform: function (args) { return args.text.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&").replace(/&#(\d+);/g, function (m, n) { return String.fromCharCode(+n); }); } });
textTool({ file: "dev-csv-to-markdown-table.html", title: "CSV 转 Markdown 表", desc: "把 CSV 文本转换为 Markdown 表格。", category: "dev", tags: ["CSV", "Markdown", "开发"], order: 1227, fields: [{ id: "csv", label: "CSV", type: "textarea", rows: 8, placeholder: "name,age\nAlice,30" }], transform: function (args) { var rows = args.csv.split("\n").filter(function (l) { return l.trim() !== ""; }); if (!rows.length) return ""; var cells = rows.map(function (r) { return r.split(","); }); var head = "| " + cells[0].join(" | ") + " |"; var sep = "| " + cells[0].map(function () { return "---"; }).join(" | ") + " |"; var body = cells.slice(1).map(function (r) { return "| " + r.join(" | ") + " |"; }); return [head, sep].concat(body).join("\n"); } });
textTool({ file: "dev-markdown-table-to-json.html", title: "Markdown 表转 JSON", desc: "把 Markdown 表格解析为 JSON 数组。", category: "dev", tags: ["Markdown", "JSON", "开发"], order: 1228, fields: [{ id: "md", label: "Markdown 表格", type: "textarea", rows: 8, placeholder: "| name | age |\n| --- | --- |\n| Alice | 30 |" }], transform: function (args) { var lines = args.md.split("\n").filter(function (l) { return l.trim() !== "" && l.indexOf("|") >= 0; }); if (lines.length < 2) return "（无表格）"; var head = lines[0].split("|").filter(function (s) { return s.trim() !== ""; }).map(function (s) { return s.trim(); }); var out = []; for (var i = 2; i < lines.length; i++) { var cells = lines[i].split("|").filter(function (s) { return s.trim() !== ""; }).map(function (s) { return s.trim(); }); if (cells.length !== head.length) continue; var o = {}; head.forEach(function (h, idx) { o[h] = cells[idx]; }); out.push(o); } return JSON.stringify(out, null, 2); } });
textTool({ file: "dev-json-to-markdown-table.html", title: "JSON 转 Markdown 表", desc: "把对象数组 JSON 转换为 Markdown 表格。", category: "dev", tags: ["JSON", "Markdown", "开发"], order: 1229, fields: [{ id: "json", label: "JSON 数组", type: "textarea", rows: 8, placeholder: '[{"name":"Alice","age":30}]' }], transform: function (args) { try { var arr = JSON.parse(args.json); if (!Array.isArray(arr)) return "请提供对象数组 JSON"; var head = Object.keys(arr[0] || {}); var h = "| " + head.join(" | ") + " |"; var sep = "| " + head.map(function () { return "---"; }).join(" | ") + " |"; var body = arr.map(function (o) { return "| " + head.map(function (k) { return String(o[k]); }).join(" | ") + " |"; }); return [h, sep].concat(body).join("\n"); } catch (e) { return "无效 JSON：" + e.message; } } });
textTool({ file: "dev-tsv-to-json.html", title: "TSV 转 JSON", desc: "把制表符分隔的文本转为 JSON 数组。", category: "dev", tags: ["TSV", "JSON", "开发"], order: 1230, fields: [{ id: "tsv", label: "TSV", type: "textarea", rows: 8, placeholder: "name\tage\nAlice\t30" }], transform: function (args) { var rows = args.tsv.split("\n").filter(function (l) { return l.trim() !== ""; }); var head = rows[0].split("\t"); var out = rows.slice(1).map(function (r) { var c = r.split("\t"); var o = {}; head.forEach(function (h, i) { o[h] = c[i]; }); return o; }); return JSON.stringify(out, null, 2); } });
textTool({ file: "dev-json-to-tsv.html", title: "JSON 转 TSV", desc: "把对象数组 JSON 转为制表符分隔文本。", category: "dev", tags: ["JSON", "TSV", "开发"], order: 1231, fields: [{ id: "json", label: "JSON 数组", type: "textarea", rows: 8, placeholder: '[{"name":"Alice","age":30}]' }], transform: function (args) { try { var arr = JSON.parse(args.json); if (!Array.isArray(arr)) return "请提供对象数组 JSON"; var head = Object.keys(arr[0] || {}); var lines = [head.join("\t")].concat(arr.map(function (o) { return head.map(function (k) { return String(o[k]); }).join("\t"); })); return lines.join("\n"); } catch (e) { return "无效 JSON：" + e.message; } } });
textTool({ file: "dev-levenshtein.html", title: "编辑距离", desc: "计算两段文本之间的莱文斯坦编辑距离。", category: "dev", tags: ["编辑距离", "相似度", "开发"], order: 1232, fields: [{ id: "a", label: "文本 A", type: "textarea", rows: 3, placeholder: "kitten" }, { id: "b", label: "文本 B", type: "textarea", rows: 3, placeholder: "sitting" }], transform: function (args) { var a = args.a, b = args.b, m = a.length, n = b.length, d = []; for (var i = 0; i <= m; i++) d[i] = [i]; for (var j = 0; j <= n; j++) d[0][j] = j; for (i = 1; i <= m; i++) for (j = 1; j <= n; j++) { var c = a[i - 1] === b[j - 1] ? 0 : 1; d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c); } return "编辑距离：" + d[m][n]; } });
textTool({ file: "dev-hamming-distance.html", title: "汉明距离", desc: "计算等长两串之间的汉明距离。", category: "dev", tags: ["汉明距离", "相似度", "开发"], order: 1233, fields: [{ id: "a", label: "串 A", type: "text", value: "1011101" }, { id: "b", label: "串 B", type: "text", value: "1001001" }], transform: function (args) { var a = args.a, b = args.b; if (a.length !== b.length) return "两串长度需相同（当前 " + a.length + " 与 " + b.length + "）"; var n = 0; for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) n++; return "汉明距离：" + n; } });
textTool({ file: "dev-color-mix.html", title: "颜色混合", desc: "按占比混合两种十六进制颜色。", category: "dev", tags: ["颜色", "混合", "开发"], order: 1234, fields: [{ id: "c1", label: "颜色 1", type: "text", value: "#ff0000" }, { id: "c2", label: "颜色 2", type: "text", value: "#0000ff" }, { id: "ratio", label: "颜色1占比 (%)", type: "number", value: 50, min: 0, max: 100 }], transform: function (args) { function ph(x) { x = x.replace("#", ""); if (x.length === 3) x = x.split("").map(function (y) { return y + y; }).join(""); return [parseInt(x.slice(0, 2), 16), parseInt(x.slice(2, 4), 16), parseInt(x.slice(4, 6), 16)]; } var a = ph(args.c1), b = ph(args.c2), t = args.ratio / 100; function H(n) { var s = Math.max(0, Math.min(255, Math.round(n))).toString(16); return s.length < 2 ? "0" + s : s; } return "#" + H(a[0] + (b[0] - a[0]) * t) + H(a[1] + (b[1] - a[1]) * t) + H(a[2] + (b[2] - a[2]) * t); } });
textTool({ file: "dev-color-shades.html", title: "颜色阶调", desc: "基于一个颜色生成由深到浅的色阶。", category: "dev", tags: ["颜色", "色阶", "开发"], order: 1235, fields: [{ id: "hex", label: "基础颜色", type: "text", value: "#3366cc" }, { id: "count", label: "阶数", type: "number", value: 5, min: 1, max: 12 }], transform: function (args) { function ph(x) { x = x.replace("#", ""); if (x.length === 3) x = x.split("").map(function (y) { return y + y; }).join(""); return [parseInt(x.slice(0, 2), 16), parseInt(x.slice(2, 4), 16), parseInt(x.slice(4, 6), 16)]; } var c = ph(args.hex); function H(n) { var s = Math.max(0, Math.min(255, Math.round(n))).toString(16); return s.length < 2 ? "0" + s : s; } var out = []; for (var i = 0; i < args.count; i++) { var f = 0.3 + 0.7 * i / (args.count - 1 || 1); out.push("#" + H(c[0] * f) + H(c[1] * f) + H(c[2] * f)); } return out.join("\n"); } });
textTool({ file: "dev-json-key-count.html", title: "JSON 键统计", desc: "统计 JSON 的键总数与最大嵌套深度。", category: "dev", tags: ["JSON", "统计", "开发"], order: 1236, fields: [{ id: "json", label: "JSON", type: "textarea", rows: 8, placeholder: '{"a":{"b":1}}' }], transform: function (args) { try { var o = JSON.parse(args.json); var keys = 0, maxDepth = 0; (function walk(o, d) { if (Array.isArray(o)) { o.forEach(function (v) { walk(v, d + 1); }); } else if (o && typeof o === "object") { var k = Object.keys(o).length; keys += k; if (d + 1 > maxDepth) maxDepth = d + 1; Object.keys(o).forEach(function (key) { walk(o[key], d + 1); }); } })(o, 1); return "键总数：" + keys + "\n最大嵌套深度：" + maxDepth; } catch (e) { return "无效 JSON：" + e.message; } } });
textTool({ file: "dev-html-tag-count.html", title: "HTML 标签计数", desc: "统计一段 HTML 中标签的总数。", category: "dev", tags: ["HTML", "统计", "开发"], order: 1237, fields: [{ id: "html", label: "HTML", type: "textarea", rows: 8, placeholder: "<div><p>hi</p></div>" }], transform: function (args) { var o = args.html.match(/<[a-zA-Z][^>]*>/g); return "标签总数：" + (o ? o.length : 0); } });
textTool({ file: "dev-snowflake-id.html", title: "生成分布式 ID", desc: "生成带时间戳的分布式风格 ID。", category: "dev", tags: ["ID", "分布式", "生成"], order: 1238, fields: [], transform: function (args) { var ts = Date.now(); var rand = Math.floor(Math.random() * 1024); return ts.toString(36) + "-" + rand.toString(36) + "-" + Math.floor(Math.random() * 36).toString(36); } });
textTool({ file: "dev-strip-ansi.html", title: "去除 ANSI 转义", desc: "清除日志中的 ANSI 颜色转义序列。", category: "dev", tags: ["ANSI", "日志", "清洗"], order: 1239, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "带颜色的日志" }], transform: function (args) { return args.text.replace(/\x1b\[[0-9;]*[A-Za-z]/g, ""); } });
textTool({ file: "dev-emoji-strip.html", title: "去除表情符号", desc: "从文本中移除 emoji 等符号字符。", category: "dev", tags: ["emoji", "清洗", "文本"], order: 1240, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "你好 🌟 世界" }], transform: function (args) { return args.text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F1FF}\u{1F200}-\u{1F2FF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}]/gu, ""); } });
textTool({ file: "dev-parse-args.html", title: "命令行参数解析", desc: "解析 --key value 或 -k value 形式的参数。", category: "dev", tags: ["参数", "解析", "开发"], order: 1241, fields: [{ id: "text", label: "参数", type: "textarea", rows: 4, placeholder: "--name Alice -v --port 8080" }], transform: function (args) { var o = {}; var toks = args.text.trim().split(/\s+/); for (var i = 0; i < toks.length; i++) { var t = toks[i]; if (/^--/.test(t)) { var k = t.slice(2); if (toks[i + 1] && !/^-/.test(toks[i + 1])) { o[k] = toks[++i]; } else { o[k] = true; } } else if (/^-[a-zA-Z]$/.test(t)) { var k2 = t.slice(1); if (toks[i + 1] && !/^-/.test(toks[i + 1])) { o[k2] = toks[++i]; } else { o[k2] = true; } } } return JSON.stringify(o, null, 2); } });
textTool({ file: "dev-query-params-sort.html", title: "查询参数排序", desc: "把查询串的键值对按字母排序。", category: "dev", tags: ["Query", "排序", "开发"], order: 1242, fields: [{ id: "text", label: "查询串", type: "textarea", rows: 4, placeholder: "b=2&a=1&c=3" }], transform: function (args) { var q = args.text.replace(/^\?/, ""); var p = q.split("&").filter(Boolean).map(function (s) { return s.split("="); }); p.sort(function (a, b) { return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0; }); return p.map(function (a) { return a.join("="); }).join("&"); } });
textTool({ file: "dev-env-to-json.html", title: "环境变量转 JSON", desc: "把 KEY=VALUE 形式的环境变量转为 JSON。", category: "dev", tags: ["环境变量", "JSON", "开发"], order: 1243, fields: [{ id: "text", label: "环境变量", type: "textarea", rows: 8, placeholder: "API_KEY=abc\nPORT=8080" }], transform: function (args) { var o = {}; args.text.split("\n").forEach(function (l) { var i = l.indexOf("="); if (i > 0) o[l.slice(0, i).trim()] = l.slice(i + 1).trim(); }); return JSON.stringify(o, null, 2); } });
textTool({ file: "dev-json-to-env.html", title: "JSON 转环境变量", desc: "把扁平 JSON 转为 KEY=VALUE 形式。", category: "dev", tags: ["JSON", "环境变量", "开发"], order: 1244, fields: [{ id: "json", label: "JSON", type: "textarea", rows: 8, placeholder: '{"API_KEY":"abc","PORT":8080}' }], transform: function (args) { try { var o = JSON.parse(args.json); return Object.keys(o).map(function (k) { return k + "=" + o[k]; }).join("\n"); } catch (e) { return "无效 JSON：" + e.message; } } });
textTool({ file: "dev-ipv6-generate.html", title: "生成随机 IPv6", desc: "生成一个随机的 IPv6 地址。", category: "dev", tags: ["IPv6", "网络", "生成"], order: 1245, fields: [], transform: function (args) { var h = "0123456789abcdef"; function g(n) { var s = ""; for (var i = 0; i < n; i++) s += h[Math.floor(Math.random() * 16)]; return s; } var out = []; for (var i = 0; i < 8; i++) out.push(g(4)); return out.join(":"); } });

// ---------- 设计 / CSS 工具（新增 38 个）----------
cssTool({ file: "design-box-shadow.html", title: "盒子阴影生成器", desc: "生成可调模糊、偏移与扩展的 box-shadow。", tags: ["阴影", "CSS", "设计"], order: 1301, fields: [{ id: "color", label: "阴影颜色", type: "text", value: "#000000" }, { id: "blur", label: "模糊 px", type: "number", value: 20 }, { id: "oy", label: "Y 偏移 px", type: "number", value: 10 }, { id: "spread", label: "扩展 px", type: "number", value: 0 }], css: function (args) { return "width:220px;height:130px;border-radius:12px;background:#fff;box-shadow:" + args.oy + "px " + args.oy + "px " + args.blur + "px " + args.spread + "px " + args.color + ";"; } });
cssTool({ file: "design-neumorphism.html", title: "新拟物风格", desc: "生成新拟态（Neumorphism）凹凸阴影效果。", tags: ["新拟物", "阴影", "CSS"], order: 1302, fields: [{ id: "base", label: "基础色", type: "text", value: "#e0e5ec" }, { id: "r", label: "圆角 px", type: "number", value: 20 }, { id: "d", label: "距离 px", type: "number", value: 10 }], css: function (args) { return "width:220px;height:130px;border-radius:" + args.r + "px;background:" + args.base + ";box-shadow:" + args.d + "px " + args.d + "px " + (args.d * 2) + "px rgba(0,0,0,.2),-" + args.d + "px -" + args.d + "px " + (args.d * 2) + "px rgba(255,255,255,.75);"; } });
cssTool({ file: "design-gradient-button.html", title: "渐变按钮", desc: "生成带渐变背景的按钮样式。", tags: ["按钮", "渐变", "CSS"], order: 1303, fields: [{ id: "c1", label: "颜色 1", type: "text", value: "#667eea" }, { id: "c2", label: "颜色 2", type: "text", value: "#764ba2" }, { id: "r", label: "圆角 px", type: "number", value: 12 }], css: function (args) { return "display:inline-block;padding:12px 28px;border-radius:" + args.r + "px;background:linear-gradient(135deg," + args.c1 + "," + args.c2 + ");color:#fff;font-weight:600;font-size:16px;"; } });
cssTool({ file: "design-ghost-button.html", title: "幽灵按钮", desc: "生成透明背景、带描边的幽灵按钮样式。", tags: ["按钮", "描边", "CSS"], order: 1304, fields: [{ id: "color", label: "主色", type: "text", value: "#667eea" }, { id: "r", label: "圆角 px", type: "number", value: 12 }], css: function (args) { return "display:inline-block;padding:12px 28px;border-radius:" + args.r + "px;border:2px solid " + args.color + ";color:" + args.color + ";background:transparent;font-weight:600;"; } });
cssTool({ file: "design-outline-button.html", title: "实心描边按钮", desc: "生成粗描边实心文字的按钮样式。", tags: ["按钮", "CSS", "设计"], order: 1305, fields: [{ id: "color", label: "描边色", type: "text", value: "#764ba2" }, { id: "r", label: "圆角 px", type: "number", value: 10 }], css: function (args) { return "display:inline-block;padding:12px 28px;border-radius:" + args.r + "px;border:3px solid " + args.color + ";color:" + args.color + ";background:transparent;font-weight:700;"; } });
cssTool({ file: "design-loading-spinner.html", title: "加载转圈动画", desc: "生成圆形加载动画的 CSS（含 keyframes）。", tags: ["加载", "动画", "CSS"], order: 1306, fields: [{ id: "size", label: "尺寸 px", type: "number", value: 48 }, { id: "color", label: "颜色", type: "text", value: "#667eea" }], css: function (args) { return "width:" + args.size + "px;height:" + args.size + "px;border:4px solid " + args.color + "33;border-top-color:" + args.color + ";border-radius:50%;animation:spin 1s linear infinite;@keyframes spin{to{transform:rotate(360deg)}}"; } });
cssTool({ file: "design-progress-bar.html", title: "进度条", desc: "生成带渐变填充的进度条样式。", tags: ["进度条", "CSS", "设计"], order: 1307, fields: [{ id: "value", label: "进度 %", type: "number", value: 65 }, { id: "c1", label: "颜色 1", type: "text", value: "#43e97b" }, { id: "c2", label: "颜色 2", type: "text", value: "#38f9d7" }], css: function (args) { return "width:" + args.value + "%;height:16px;border-radius:999px;background:linear-gradient(90deg," + args.c1 + "," + args.c2 + ");"; } });
cssTool({ file: "design-toggle-switch.html", title: "开关样式", desc: "生成 iOS 风格的开关（药丸）样式。", tags: ["开关", "CSS", "组件"], order: 1308, fields: [{ id: "size", label: "高度 px", type: "number", value: 32 }, { id: "color", label: "开启色", type: "text", value: "#34c759" }], css: function (args) { return "width:" + (args.size * 2) + "px;height:" + args.size + "px;border-radius:" + args.size + "px;background:" + args.color + ";box-shadow:inset 0 0 0 1px rgba(0,0,0,.05);"; } });
cssTool({ file: "design-checkbox-style.html", title: "复选框样式", desc: "生成自定义复选框方块样式。", tags: ["复选框", "CSS", "组件"], order: 1309, fields: [{ id: "size", label: "尺寸 px", type: "number", value: 22 }, { id: "color", label: "主色", type: "text", value: "#667eea" }], css: function (args) { return "width:" + args.size + "px;height:" + args.size + "px;border:2px solid " + args.color + ";border-radius:6px;background:#fff;"; } });
cssTool({ file: "design-radio-style.html", title: "单选框样式", desc: "生成自定义圆形单选框样式。", tags: ["单选框", "CSS", "组件"], order: 1310, fields: [{ id: "size", label: "尺寸 px", type: "number", value: 22 }, { id: "color", label: "主色", type: "text", value: "#667eea" }], css: function (args) { return "width:" + args.size + "px;height:" + args.size + "px;border:2px solid " + args.color + ";border-radius:50%;background:#fff;"; } });
cssTool({ file: "design-input-field.html", title: "输入框样式", desc: "生成带聚焦光晕的输入框样式。", tags: ["输入框", "CSS", "组件"], order: 1311, fields: [{ id: "color", label: "主色", type: "text", value: "#667eea" }, { id: "r", label: "圆角 px", type: "number", value: 10 }], css: function (args) { return "padding:10px 14px;border:1px solid " + args.color + ";border-radius:" + args.r + "px;font-size:14px;width:260px;box-shadow:0 0 0 3px " + args.color + "22;"; } });
cssTool({ file: "design-divider-line.html", title: "分隔线", desc: "生成自定义颜色与高度的分隔线。", tags: ["分隔线", "CSS", "设计"], order: 1312, fields: [{ id: "color", label: "颜色", type: "text", value: "#cccccc" }, { id: "h", label: "高度 px", type: "number", value: 2 }], css: function (args) { return "height:" + args.h + "px;background:" + args.color + ";border:0;border-radius:2px;width:100%;"; } });
cssTool({ file: "design-card-shadow.html", title: "卡片阴影", desc: "生成带柔和阴影的卡片容器样式。", tags: ["卡片", "阴影", "CSS"], order: 1313, fields: [{ id: "r", label: "圆角 px", type: "number", value: 16 }, { id: "blur", label: "阴影模糊 px", type: "number", value: 30 }, { id: "color", label: "阴影色", type: "text", value: "rgba(0,0,0,.12)" }], css: function (args) { return "width:260px;padding:22px;border-radius:" + args.r + "px;background:#fff;box-shadow:0 12px " + args.blur + "px " + args.color + ";"; } });
cssTool({ file: "design-avatar-circle.html", title: "圆形头像", desc: "生成带首字母的圆形头像样式。", tags: ["头像", "CSS", "组件"], order: 1314, fields: [{ id: "size", label: "尺寸 px", type: "number", value: 80 }, { id: "color", label: "背景色", type: "text", value: "#667eea" }], css: function (args) { return "width:" + args.size + "px;height:" + args.size + "px;border-radius:50%;background:" + args.color + ";color:#fff;display:flex;align-items:center;justify-content:center;font-size:" + (args.size / 2) + "px;font-weight:700;"; } });
cssTool({ file: "design-avatar-square.html", title: "方形头像", desc: "生成带首字母的方形头像样式。", tags: ["头像", "CSS", "组件"], order: 1315, fields: [{ id: "size", label: "尺寸 px", type: "number", value: 80 }, { id: "color", label: "背景色", type: "text", value: "#764ba2" }, { id: "r", label: "圆角 px", type: "number", value: 12 }], css: function (args) { return "width:" + args.size + "px;height:" + args.size + "px;border-radius:" + args.r + "px;background:" + args.color + ";color:#fff;display:flex;align-items:center;justify-content:center;font-size:" + (args.size / 2) + "px;font-weight:700;"; } });
cssTool({ file: "design-tag-chip.html", title: "标签胶囊", desc: "生成浅色背景的标签胶囊样式。", tags: ["标签", "CSS", "组件"], order: 1316, fields: [{ id: "color", label: "主色", type: "text", value: "#667eea" }], css: function (args) { return "display:inline-block;padding:4px 12px;border-radius:999px;background:" + args.color + "22;color:" + args.color + ";font-size:13px;font-weight:600;"; } });
cssTool({ file: "design-alert-box.html", title: "提示框", desc: "生成带左侧色条的提示框样式。", tags: ["提示", "CSS", "组件"], order: 1317, fields: [{ id: "color", label: "主色", type: "text", value: "#f59e0b" }], css: function (args) { return "padding:12px 16px;border-left:4px solid " + args.color + ";background:" + args.color + "14;border-radius:6px;color:#333;"; } });
cssTool({ file: "design-popover.html", title: "气泡卡片", desc: "生成带阴影的气泡卡片样式。", tags: ["气泡", "CSS", "组件"], order: 1318, fields: [{ id: "r", label: "圆角 px", type: "number", value: 12 }, { id: "color", label: "边框色", type: "text", value: "#eeeeee" }], css: function (args) { return "width:220px;padding:14px;border-radius:" + args.r + "px;background:#fff;box-shadow:0 8px 24px rgba(0,0,0,.15);border:1px solid " + args.color + ";"; } });
cssTool({ file: "design-modal-card.html", title: "模态卡片", desc: "生成居中模态对话框卡片样式。", tags: ["模态", "CSS", "组件"], order: 1319, fields: [{ id: "r", label: "圆角 px", type: "number", value: 16 }, { id: "color", label: "阴影色", type: "text", value: "rgba(0,0,0,.2)" }], css: function (args) { return "width:340px;padding:24px;border-radius:" + args.r + "px;background:#fff;box-shadow:0 20px 60px " + args.color + ";"; } });
cssTool({ file: "design-pagination.html", title: "分页按钮", desc: "生成分页页码按钮样式。", tags: ["分页", "CSS", "组件"], order: 1320, fields: [{ id: "color", label: "主色", type: "text", value: "#667eea" }, { id: "r", label: "圆角 px", type: "number", value: 8 }], css: function (args) { return "display:inline-block;min-width:32px;height:32px;line-height:32px;text-align:center;padding:0 8px;border-radius:" + args.r + "px;background:" + args.color + ";color:#fff;font-weight:600;"; } });
cssTool({ file: "design-breadcrumb.html", title: "面包屑", desc: "生成面包屑导航文本样式。", tags: ["面包屑", "CSS", "导航"], order: 1321, fields: [{ id: "color", label: "主色", type: "text", value: "#667eea" }], css: function (args) { return "color:" + args.color + ";font-size:14px;padding-bottom:6px;border-bottom:1px solid #ddd;"; } });
cssTool({ file: "design-code-block.html", title: "代码块", desc: "生成深色背景等宽字体代码块样式。", tags: ["代码", "CSS", "设计"], order: 1322, fields: [{ id: "bg", label: "背景色", type: "text", value: "#1e1e2e" }, { id: "fg", label: "文字色", type: "text", value: "#cdd6f4" }], css: function (args) { return "font-family:ui-monospace,Menlo,Consolas,monospace;padding:14px 16px;background:" + args.bg + ";color:" + args.fg + ";border-radius:8px;font-size:13px;"; } });
cssTool({ file: "design-list-style.html", title: "列表项样式", desc: "生成带左侧色条的高亮列表项。", tags: ["列表", "CSS", "设计"], order: 1323, fields: [{ id: "color", label: "主色", type: "text", value: "#667eea" }], css: function (args) { return "padding:10px 14px;border-left:3px solid " + args.color + ";background:#fafafa;border-radius:0 6px 6px 0;"; } });
cssTool({ file: "design-timeline.html", title: "时间轴", desc: "生成左侧竖线的时间轴样式。", tags: ["时间轴", "CSS", "设计"], order: 1324, fields: [{ id: "color", label: "主色", type: "text", value: "#667eea" }], css: function (args) { return "border-left:3px solid " + args.color + ";padding-left:16px;margin-left:8px;"; } });
cssTool({ file: "design-steps.html", title: "步骤节点", desc: "生成圆形步骤序号节点样式。", tags: ["步骤", "CSS", "组件"], order: 1325, fields: [{ id: "size", label: "尺寸 px", type: "number", value: 36 }, { id: "color", label: "主色", type: "text", value: "#667eea" }], css: function (args) { return "width:" + args.size + "px;height:" + args.size + "px;border-radius:50%;background:" + args.color + ";color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;"; } });
cssTool({ file: "design-double-border.html", title: "双线边框", desc: "生成双线（double）边框容器样式。", tags: ["边框", "CSS", "设计"], order: 1326, fields: [{ id: "color", label: "颜色", type: "text", value: "#764ba2" }], css: function (args) { return "width:220px;height:130px;border:3px double " + args.color + ";border-radius:10px;"; } });
cssTool({ file: "design-blur-overlay.html", title: "毛玻璃遮罩", desc: "生成 backdrop-filter 毛玻璃遮罩样式。", tags: ["毛玻璃", "CSS", "设计"], order: 1327, fields: [{ id: "color", label: "底色", type: "text", value: "#ffffff" }], css: function (args) { return "width:260px;height:150px;border-radius:12px;background:" + args.color + "33;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.4);"; } });
cssTool({ file: "design-gradient-text-multi.html", title: "多彩渐变文字", desc: "生成三色渐变裁剪文字样式。", tags: ["渐变文字", "CSS", "设计"], order: 1328, fields: [{ id: "c1", label: "颜色 1", type: "text", value: "#ff6ec4" }, { id: "c2", label: "颜色 2", type: "text", value: "#7873f5" }, { id: "c3", label: "颜色 3", type: "text", value: "#21d4fd" }, { id: "size", label: "字号 px", type: "number", value: 40 }], css: function (args) { return "font-size:" + args.size + "px;font-weight:800;background:linear-gradient(90deg," + args.c1 + "," + args.c2 + "," + args.c3 + ");-webkit-background-clip:text;background-clip:text;color:transparent;"; } });
cssTool({ file: "design-text-stroke.html", title: "描边文字", desc: "生成带描边的镂空文字样式。", tags: ["描边文字", "CSS", "设计"], order: 1329, fields: [{ id: "color", label: "描边色", type: "text", value: "#764ba2" }, { id: "w", label: "描边宽度 px", type: "number", value: 2 }, { id: "size", label: "字号 px", type: "number", value: 48 }], css: function (args) { return "font-size:" + args.size + "px;font-weight:800;color:#fff;-webkit-text-stroke:" + args.w + "px " + args.color + ";"; } });
cssTool({ file: "design-glow-effect.html", title: "发光效果", desc: "生成带光晕阴影的发光块样式。", tags: ["发光", "CSS", "设计"], order: 1330, fields: [{ id: "color", label: "发光色", type: "text", value: "#21d4fd" }, { id: "blur", label: "光晕 px", type: "number", value: 30 }], css: function (args) { return "width:160px;height:90px;border-radius:12px;background:" + args.color + ";box-shadow:0 0 " + args.blur + "px " + args.color + ";"; } });
cssTool({ file: "design-3d-text.html", title: "3D 立体文字", desc: "生成带层叠阴影的 3D 立体文字。", tags: ["3D文字", "CSS", "设计"], order: 1331, fields: [{ id: "color", label: "主色", type: "text", value: "#ff5252" }, { id: "size", label: "字号 px", type: "number", value: 44 }], css: function (args) { return "font-size:" + args.size + "px;font-weight:900;color:" + args.color + ";text-shadow:1px 1px 0 #b71c1c,2px 2px 0 #9c1414,3px 3px 0 #7f1010,4px 4px 8px rgba(0,0,0,.4);"; } });
cssTool({ file: "design-sticky-note.html", title: "便签纸", desc: "生成带轻微旋转与阴影的便签样式。", tags: ["便签", "CSS", "设计"], order: 1332, fields: [{ id: "color", label: "背景色", type: "text", value: "#fff7a8" }], css: function (args) { return "width:170px;height:170px;background:" + args.color + ";box-shadow:0 10px 20px rgba(0,0,0,.15);transform:rotate(-2deg);padding:14px;color:#5b4a00;"; } });
cssTool({ file: "design-underline-animated.html", title: "动态下划线", desc: "生成加粗下划线文字样式（含动画）。", tags: ["下划线", "CSS", "设计"], order: 1333, fields: [{ id: "color", label: "颜色", type: "text", value: "#667eea" }], css: function (args) { return "display:inline-block;padding-bottom:4px;border-bottom:3px solid " + args.color + ";font-weight:600;font-size:18px;"; } });
cssTool({ file: "design-dotted-bg.html", title: "圆点背景", desc: "生成圆点纹理背景样式。", tags: ["背景", "纹理", "CSS"], order: 1334, fields: [{ id: "color", label: "点色", type: "text", value: "#cccccc" }, { id: "size", label: "间距 px", type: "number", value: 16 }], css: function (args) { return "width:260px;height:150px;border-radius:10px;background-color:#fff;background-image:radial-gradient(" + args.color + " 1px, transparent 1px);background-size:" + args.size + "px " + args.size + "px;"; } });
cssTool({ file: "design-grid-bg.html", title: "网格背景", desc: "生成网格线纹理背景样式。", tags: ["背景", "网格", "CSS"], order: 1335, fields: [{ id: "color", label: "线色", type: "text", value: "#dddddd" }, { id: "size", label: "间距 px", type: "number", value: 20 }], css: function (args) { return "width:260px;height:150px;border-radius:10px;background-color:#fff;background-image:linear-gradient(" + args.color + " 1px,transparent 1px),linear-gradient(90deg," + args.color + " 1px,transparent 1px);background-size:" + args.size + "px " + args.size + "px;"; } });
cssTool({ file: "design-checkerboard-bg.html", title: "棋盘格背景", desc: "生成棋盘格纹理背景样式。", tags: ["背景", "棋盘", "CSS"], order: 1336, fields: [{ id: "c1", label: "颜色 1", type: "text", value: "#eeeeee" }, { id: "c2", label: "颜色 2", type: "text", value: "#ffffff" }, { id: "size", label: "格子 px", type: "number", value: 20 }], css: function (args) { return "width:220px;height:140px;background-image:conic-gradient(" + args.c1 + " 90deg," + args.c2 + " 90deg 180deg," + args.c1 + " 180deg 270deg," + args.c2 + " 270deg);background-size:" + (args.size * 2) + "px " + (args.size * 2) + "px;"; } });
cssTool({ file: "design-noise-bg.html", title: "噪点纹理背景", desc: "生成 SVG 噪点纹理背景样式。", tags: ["背景", "噪点", "CSS"], order: 1337, fields: [{ id: "color", label: "底色", type: "text", value: "#3a3a5a" }, { id: "opacity", label: "噪点不透明度", type: "number", value: 0.4 }], css: function (args) { return "width:260px;height:150px;border-radius:10px;background-color:" + args.color + ";background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='" + args.opacity + "'/%3E%3C/svg%3E\");"; } });
cssTool({ file: "design-hover-lift.html", title: "悬浮上浮卡片", desc: "生成带悬浮上浮过渡的卡片样式。", tags: ["卡片", "悬浮", "CSS"], order: 1338, fields: [{ id: "color", label: "主色", type: "text", value: "#667eea" }, { id: "dist", label: "上浮 px", type: "number", value: 6 }], css: function (args) { return "width:220px;padding:18px;border-radius:12px;background:" + args.color + ";color:#fff;box-shadow:0 4px 10px rgba(0,0,0,.15);transition:transform .2s, box-shadow .2s;"; } });

// ---------- 图片工具（新增 25 个）----------
imgEffectTool({ file: "image-hue-rotate.html", title: "色相旋转", desc: "整体旋转图片色相，得到不同色调。", tags: ["色相", "滤镜"], order: 1401, mode: "filter", filter: "hue-rotate(120deg)" });
imgEffectTool({ file: "image-opacity.html", title: "透明度", desc: "调整图片整体不透明度。", tags: ["透明度", "滤镜"], order: 1402, mode: "filter", filter: "opacity(0.6)" });
imgEffectTool({ file: "image-noir.html", title: "黑白高反差", desc: "生成高对比度的黑白胶片效果。", tags: ["黑白", "滤镜"], order: 1403, mode: "filter", filter: "grayscale(1) contrast(1.4)" });
imgEffectTool({ file: "image-vintage.html", title: "复古风", desc: "叠加棕褐与暖调，营造复古质感。", tags: ["复古", "滤镜"], order: 1404, mode: "filter", filter: "sepia(0.5) contrast(1.2) brightness(1.1) saturate(1.2)" });
imgEffectTool({ file: "image-warm-tone.html", title: "暖色调", desc: "为图片增加温暖的棕黄色调。", tags: ["暖色", "滤镜"], order: 1405, mode: "filter", filter: "sepia(0.4) saturate(1.3) brightness(1.05)" });
imgEffectTool({ file: "image-cool-tone.html", title: "冷色调", desc: "为图片增加冷蓝的色调偏移。", tags: ["冷色", "滤镜"], order: 1406, mode: "filter", filter: "hue-rotate(180deg) saturate(0.8)" });
imgEffectTool({ file: "image-solarize.html", title: "曝光反转", desc: "部分反转亮部，制造炫光效果。", tags: ["炫光", "滤镜"], order: 1407, mode: "filter", filter: "invert(0.8) sepia(0.4)" });
imgEffectTool({ file: "image-posterize.html", title: "色调分层", desc: "减少每通道色阶，得到海报化效果。", tags: ["分层", "特效"], order: 1408, mode: "pixels", fields: [{ id: "levels", label: "色阶数", type: "number", value: 4, min: 2, max: 16 }], apply: 'var ls=args.levels||4; var step=255/(ls-1); for(var i=0;i<d.length;i+=4){ d[i]=Math.round(d[i]/step)*step; d[i+1]=Math.round(d[i+1]/step)*step; d[i+2]=Math.round(d[i+2]/step)*step; }' });
imgEffectTool({ file: "image-threshold.html", title: "黑白阈值", desc: "按亮度阈值把图片转为纯黑白。", tags: ["阈值", "黑白"], order: 1409, mode: "pixels", fields: [{ id: "threshold", label: "阈值 (0-255)", type: "number", value: 128, min: 0, max: 255 }], apply: 'var t=args.threshold||128; for(var i=0;i<d.length;i+=4){ var l=0.299*d[i]+0.587*d[i+1]+0.114*d[i+2]; var v=l>t?255:0; d[i]=d[i+1]=d[i+2]=v; }' });
imgEffectTool({ file: "image-colorize.html", title: "单色着色", desc: "保留亮度，将图片着为指定颜色。", tags: ["着色", "特效"], order: 1410, mode: "pixels", fields: [{ id: "color", label: "着色颜色", type: "text", value: "#3399ff" }], apply: 'var c=args.color||"#3399ff"; c=c.replace("#",""); if(c.length===3)c=c.split("").map(function(x){return x+x;}).join(""); var cr=parseInt(c.slice(0,2),16),cg=parseInt(c.slice(2,4),16),cb=parseInt(c.slice(4,6),16); for(var i=0;i<d.length;i+=4){ var l=(0.299*d[i]+0.587*d[i+1]+0.114*d[i+2])/255; d[i]=Math.round(cr*l); d[i+1]=Math.round(cg*l); d[i+2]=Math.round(cb*l); }' });
imgEffectTool({ file: "image-vignette.html", title: "暗角", desc: "让图片四周变暗，突出中心。", tags: ["暗角", "特效"], order: 1411, mode: "pixels", fields: [{ id: "strength", label: "强度 (0-1)", type: "number", value: 0.6, min: 0, max: 1, step: 0.1 }], apply: 'var cx=w/2, cy=h/2, maxd=Math.sqrt(cx*cx+cy*cy), st=args.strength||0.6; for(var y=0;y<h;y++){ for(var x=0;x<w;x++){ var idx=(y*w+x)*4; var dist=Math.sqrt((x-cx)*(x-cx)+(y-cy)*(y-cy)); var f=1-(dist/maxd)*st; if(f<0.2)f=0.2; d[idx]*=f; d[idx+1]*=f; d[idx+2]*=f; } }' });
imgEffectTool({ file: "image-duotone.html", title: "双色调", desc: "把暗部与亮部分别映射到两种颜色。", tags: ["双色", "特效"], order: 1412, mode: "pixels", fields: [{ id: "c1", label: "暗部色", type: "text", value: "#001f3f" }, { id: "c2", label: "亮部色", type: "text", value: "#ffdc00" }], apply: 'function px(s){s=s.replace("#","");if(s.length===3)s=s.split("").map(function(x){return x+x;}).join("");return [parseInt(s.slice(0,2),16),parseInt(s.slice(2,4),16),parseInt(s.slice(4,6),16)];} var c1=args.c1||"#001f3f", c2=args.c2||"#ffdc00"; var a=px(c1),b=px(c2); for(var i=0;i<d.length;i+=4){ var l=(0.299*d[i]+0.587*d[i+1]+0.114*d[i+2])/255; d[i]=Math.round(a[0]+(b[0]-a[0])*l); d[i+1]=Math.round(a[1]+(b[1]-a[1])*l); d[i+2]=Math.round(a[2]+(b[2]-a[2])*l); }' });
imgEffectTool({ file: "image-saturation-boost.html", title: "提升饱和度", desc: "增强图片色彩饱和度。", tags: ["饱和", "特效"], order: 1413, mode: "pixels", fields: [{ id: "amount", label: "倍数", type: "number", value: 1.5, min: 0, max: 3, step: 0.1 }], apply: 'var amt=args.amount||1.5; for(var i=0;i<d.length;i+=4){ var r=d[i],g=d[i+1],b=d[i+2]; var gray=0.299*r+0.587*g+0.114*b; d[i]=Math.min(255,Math.round(gray+(r-gray)*amt)); d[i+1]=Math.min(255,Math.round(gray+(g-gray)*amt)); d[i+2]=Math.min(255,Math.round(gray+(b-gray)*amt)); }' });
imgEffectTool({ file: "image-exposure.html", title: "曝光调整", desc: "整体提亮或压暗图片。", tags: ["曝光", "特效"], order: 1414, mode: "pixels", fields: [{ id: "exposure", label: "曝光倍数", type: "number", value: 1.2, min: 0.1, max: 3, step: 0.1 }], apply: 'var f=args.exposure||1.2; for(var i=0;i<d.length;i+=4){ d[i]=Math.min(255,Math.round(d[i]*f)); d[i+1]=Math.min(255,Math.round(d[i+1]*f)); d[i+2]=Math.min(255,Math.round(d[i+2]*f)); }' });
imgEffectTool({ file: "image-noise-grain.html", title: "胶片颗粒", desc: "为图片叠加随机噪点颗粒。", tags: ["噪点", "特效"], order: 1415, mode: "pixels", fields: [{ id: "amount", label: "强度", type: "number", value: 20, min: 0, max: 100 }], apply: 'var amt=args.amount||20; for(var i=0;i<d.length;i+=4){ var n=(Math.random()-0.5)*amt*2; d[i]=Math.min(255,Math.max(0,Math.round(d[i]+n))); d[i+1]=Math.min(255,Math.max(0,Math.round(d[i+1]+n))); d[i+2]=Math.min(255,Math.max(0,Math.round(d[i+2]+n))); }' });
imgEffectTool({ file: "image-color-overlay.html", title: "颜色叠加", desc: "用半透明颜色叠加到图片上。", tags: ["叠加", "特效"], order: 1416, mode: "pixels", fields: [{ id: "color", label: "叠加色", type: "text", value: "#ff0000" }, { id: "alpha", label: "不透明度 (0-1)", type: "number", value: 0.3, min: 0, max: 1, step: 0.05 }], apply: 'var c=args.color||"#ff0000"; c=c.replace("#",""); if(c.length===3)c=c.split("").map(function(x){return x+x;}).join(""); var cr=parseInt(c.slice(0,2),16),cg=parseInt(c.slice(2,4),16),cb=parseInt(c.slice(4,6),16); var a=(args.alpha||0.3); for(var i=0;i<d.length;i+=4){ d[i]=Math.round(d[i]*(1-a)+cr*a); d[i+1]=Math.round(d[i+1]*(1-a)+cg*a); d[i+2]=Math.round(d[i+2]*(1-a)+cb*a); }' });
imgEffectTool({ file: "image-gamma.html", title: "伽马校正", desc: "按伽马值调整图片明暗曲线。", tags: ["伽马", "特效"], order: 1417, mode: "pixels", fields: [{ id: "gamma", label: "伽马值", type: "number", value: 1.0, min: 0.2, max: 3, step: 0.1 }], apply: 'var g=args.gamma||1.0; for(var i=0;i<d.length;i+=4){ d[i]=Math.round(255*Math.pow(d[i]/255,g)); d[i+1]=Math.round(255*Math.pow(d[i+1]/255,g)); d[i+2]=Math.round(255*Math.pow(d[i+2]/255,g)); }' });
imgEffectTool({ file: "image-sharpen.html", title: "锐化", desc: "通过卷积核增强图片边缘细节。", tags: ["锐化", "特效"], order: 1418, mode: "pixels", apply: 'var src=ctx.getImageData(0,0,w,h).data; var out=new Uint8ClampedArray(src.length); var k=[-1,-1,-1,-1,9,-1,-1,-1,-1]; for(var y=1;y<h-1;y++){ for(var x=1;x<w-1;x++){ for(var c=0;c<3;c++){ var sum=0,ki=0; for(var dy=-1;dy<=1;dy++){ for(var dx=-1;dx<=1;dx++){ sum+=src[((y+dy)*w+(x+dx))*4+c]*k[ki++]; } } out[(y*w+x)*4+c]=Math.min(255,Math.max(0,sum)); } out[(y*w+x)*4+3]=255; } } for(var i=0;i<d.length;i++) d[i]=out[i];' });
imgEffectTool({ file: "image-edge-detect.html", title: "边缘检测", desc: "提取图片的轮廓边缘。", tags: ["边缘", "特效"], order: 1419, mode: "pixels", apply: 'var src=ctx.getImageData(0,0,w,h).data; var out=new Uint8ClampedArray(src.length); var k=[0,1,0,1,-4,1,0,1,0]; for(var y=1;y<h-1;y++){ for(var x=1;x<w-1;x++){ for(var c=0;c<3;c++){ var sum=0,ki=0; for(var dy=-1;dy<=1;dy++){ for(var dx=-1;dx<=1;dx++){ sum+=src[((y+dy)*w+(x+dx))*4+c]*k[ki++]; } } out[(y*w+x)*4+c]=Math.min(255,Math.abs(sum)); } out[(y*w+x)*4+3]=255; } } for(var i=0;i<d.length;i++) d[i]=out[i];' });
imgEffectTool({ file: "image-emboss.html", title: "浮雕", desc: "生成带方向感的浮雕立体效果。", tags: ["浮雕", "特效"], order: 1420, mode: "pixels", apply: 'var src=ctx.getImageData(0,0,w,h).data; var out=new Uint8ClampedArray(src.length); var k=[-2,-1,0,-1,1,1,0,1,2]; for(var y=1;y<h-1;y++){ for(var x=1;x<w-1;x++){ for(var c=0;c<3;c++){ var sum=0,ki=0; for(var dy=-1;dy<=1;dy++){ for(var dx=-1;dx<=1;dx++){ sum+=src[((y+dy)*w+(x+dx))*4+c]*k[ki++]; } } out[(y*w+x)*4+c]=Math.min(255,Math.max(0,sum+128)); } out[(y*w+x)*4+3]=255; } } for(var i=0;i<d.length;i++) d[i]=out[i];' });
imgEffectTool({ file: "image-crop-square.html", title: "裁切正方形", desc: "从中心裁切出正方形区域。", tags: ["裁切", "编辑"], order: 1421, mode: "draw", draw: 'var s=Math.min(w,h); canvas.width=s; canvas.height=s; ctx.drawImage(img,(w-s)/2,(h-s)/2,s,s,0,0,s,s);' });
imgEffectTool({ file: "image-rounded-square.html", title: "圆角裁切", desc: "把图片裁切成带圆角的矩形。", tags: ["圆角", "编辑"], order: 1422, mode: "draw", fields: [{ id: "r", label: "圆角半径 px", type: "number", value: 30, min: 0 }], draw: 'var r=Math.min(args.r||30,Math.min(w,h)/2); canvas.width=w; canvas.height=h; ctx.beginPath(); ctx.moveTo(r,0); ctx.arcTo(w,0,w,h,r); ctx.arcTo(w,h,0,h,r); ctx.arcTo(0,h,0,0,r); ctx.arcTo(0,0,w,0,r); ctx.closePath(); ctx.clip(); ctx.drawImage(img,0,0,w,h);' });
imgEffectTool({ file: "image-border.html", title: "加边框", desc: "为图片添加纯色边框留白。", tags: ["边框", "编辑"], order: 1423, mode: "draw", fields: [{ id: "pad", label: "边框宽度 px", type: "number", value: 10, min: 0 }, { id: "color", label: "边框颜色", type: "text", value: "#000000" }], draw: 'var p=args.pad||10; canvas.width=w+2*p; canvas.height=h+2*p; ctx.fillStyle=args.color||"#000"; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.drawImage(img,p,p,w,h);' });
imgEffectTool({ file: "image-watermark.html", title: "添加水印", desc: "在图片右下角叠加文字水印。", tags: ["水印", "编辑"], order: 1424, mode: "draw", fields: [{ id: "text", label: "水印文字", type: "text", value: "watermark" }, { id: "size", label: "字号 px", type: "number", value: 24, min: 8 }, { id: "color", label: "文字颜色", type: "text", value: "#ffffff" }], draw: 'ctx.drawImage(img,0,0,w,h); ctx.font=(args.size||24)+"px sans-serif"; ctx.fillStyle=args.color||"#ffffff"; ctx.textBaseline="bottom"; var txt=args.text||"watermark"; var m=ctx.measureText(txt); ctx.fillText(txt, w-m.width-10, h-10);' });
imgEffectTool({ file: "image-mirror.html", title: "左右镜像", desc: "以中线为轴生成左右对称的镜像图。", tags: ["镜像", "编辑"], order: 1425, mode: "draw", draw: 'var hw=Math.floor(w/2); ctx.drawImage(img,0,0,hw,h,0,0,hw,h); ctx.save(); ctx.translate(w,0); ctx.scale(-1,1); ctx.drawImage(img,0,0,hw,h,0,0,hw,h); ctx.restore();' });

// ---------- 计算工具（新增 100 个，第 1 批：统计 / 数学 / 几何 / 物理）----------
listCalcTool({ file: "calc-mean.html", title: "平均数", desc: "求一组数字的平均值。", tags: ["统计", "平均", "计算"], order: 1501, outputs: [{ id: "mean", label: "平均数" }], compute: function (arr) { var s = 0; for (var i = 0; i < arr.length; i++) s += arr[i]; return { mean: s / arr.length }; } });
listCalcTool({ file: "calc-median.html", title: "中位数", desc: "求一组数字的中位数。", tags: ["统计", "中位数", "计算"], order: 1502, outputs: [{ id: "median", label: "中位数" }], compute: function (arr) { var a = arr.slice().sort(function (x, y) { return x - y; }); var m = Math.floor(a.length / 2); return { median: a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2 }; } });
listCalcTool({ file: "calc-mode.html", title: "众数", desc: "求一组数字中出现最多的数值。", tags: ["统计", "众数", "计算"], order: 1503, outputs: [{ id: "mode", label: "众数" }], compute: function (arr) { var f = {}, best = 0, bv = null; arr.forEach(function (x) { f[x] = (f[x] || 0) + 1; if (f[x] > best) { best = f[x]; bv = x; } }); return { mode: bv + "（出现 " + best + " 次）" }; } });
listCalcTool({ file: "calc-stddev.html", title: "样本标准差", desc: "计算一组样本数据的标准差。", tags: ["统计", "标准差", "计算"], order: 1504, outputs: [{ id: "sd", label: "样本标准差" }], compute: function (arr) { var s = 0; arr.forEach(function (x) { s += x; }); var m = s / arr.length; var v = 0; arr.forEach(function (x) { v += (x - m) * (x - m); }); return { sd: Math.sqrt(v / (arr.length - 1 || 1)) }; } });
listCalcTool({ file: "calc-variance.html", title: "样本方差", desc: "计算一组样本数据的方差。", tags: ["统计", "方差", "计算"], order: 1505, outputs: [{ id: "var", label: "样本方差" }], compute: function (arr) { var s = 0; arr.forEach(function (x) { s += x; }); var m = s / arr.length; var v = 0; arr.forEach(function (x) { v += (x - m) * (x - m); }); return { var: v / (arr.length - 1 || 1) }; } });
listCalcTool({ file: "calc-range.html", title: "最值极差", desc: "返回最小值、最大值与极差。", tags: ["统计", "极差", "计算"], order: 1506, outputs: [{ id: "min", label: "最小值" }, { id: "max", label: "最大值" }, { id: "range", label: "极差" }], compute: function (arr) { var mn = Math.min.apply(null, arr), mx = Math.max.apply(null, arr); return { min: mn, max: mx, range: mx - mn }; } });
listCalcTool({ file: "calc-sum.html", title: "求和与计数", desc: "对一组数字求和并统计个数。", tags: ["统计", "求和", "计算"], order: 1507, outputs: [{ id: "sum", label: "总和" }, { id: "count", label: "数据个数" }], compute: function (arr) { var s = 0; arr.forEach(function (x) { s += x; }); return { sum: s, count: arr.length }; } });
listCalcTool({ file: "calc-quartiles.html", title: "四分位数", desc: "计算第一、第二、第三四分位数。", tags: ["统计", "四分位", "计算"], order: 1508, outputs: [{ id: "q1", label: "Q1" }, { id: "q2", label: "中位数 Q2" }, { id: "q3", label: "Q3" }], compute: function (arr) { function q(p) { var a = arr.slice().sort(function (x, y) { return x - y; }); var idx = (a.length - 1) * p; var lo = Math.floor(idx), hi = Math.ceil(idx); if (lo === hi) return a[lo]; return a[lo] + (a[hi] - a[lo]) * (idx - lo); } return { q1: q(0.25), q2: q(0.5), q3: q(0.75) }; } });
listCalcTool({ file: "calc-geo-mean.html", title: "几何平均", desc: "计算一组正数的几何平均数。", tags: ["统计", "几何平均", "计算"], order: 1509, outputs: [{ id: "gm", label: "几何平均" }], compute: function (arr) { var p = 1; arr.forEach(function (x) { if (x > 0) p *= x; }); return { gm: Math.pow(p, 1 / arr.length) }; } });
listCalcTool({ file: "calc-harmonic-mean.html", title: "调和平均", desc: "计算一组正数的调和平均数。", tags: ["统计", "调和平均", "计算"], order: 1510, outputs: [{ id: "hm", label: "调和平均" }], compute: function (arr) { var s = 0; arr.forEach(function (x) { if (x !== 0) s += 1 / x; }); return { hm: arr.length / s }; } });
listCalcTool({ file: "calc-zscore.html", title: "Z 分数", desc: "把每个数值标准化为 Z 分数（均值 0 标准差 1）。", tags: ["统计", "标准化", "计算"], order: 1511, outputs: [{ id: "out", label: "结果" }], compute: function (arr) { var s = 0; arr.forEach(function (x) { s += x; }); var m = s / arr.length; var v = 0; arr.forEach(function (x) { v += (x - m) * (x - m); }); var sd = Math.sqrt(v / (arr.length - 1 || 1)); return { out: arr.map(function (x) { return ((x - m) / (sd || 1)).toFixed(3); }).join(", ") }; } });
calcTool({ file: "calc-gcd.html", title: "最大公约数", desc: "计算两个整数的最大公约数。", tags: ["数论", "GCD", "计算"], order: 1512, fields: [{ id: "a", label: "整数 A", type: "number", value: 56 }, { id: "b", label: "整数 B", type: "number", value: 98 }], outputs: [{ id: "gcd", label: "最大公约数" }], compute: function (args) { function g(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a || 0; } return { gcd: g(args.a, args.b) }; } });
calcTool({ file: "calc-lcm.html", title: "最小公倍数", desc: "计算两个整数的最小公倍数。", tags: ["数论", "LCM", "计算"], order: 1513, fields: [{ id: "a", label: "整数 A", type: "number", value: 12 }, { id: "b", label: "整数 B", type: "number", value: 18 }], outputs: [{ id: "lcm", label: "最小公倍数" }], compute: function (args) { function g(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a || 1; } return { lcm: Math.abs(args.a * args.b) / g(args.a, args.b) }; } });
calcTool({ file: "calc-prime-check.html", title: "质数判定", desc: "判断一个整数是否为质数。", tags: ["数论", "质数", "计算"], order: 1514, fields: [{ id: "n", label: "整数", type: "number", value: 97 }], outputs: [{ id: "res", label: "是否质数" }], compute: function (args) { var n = Math.floor(Math.abs(args.n)); if (n < 2) return { res: "否" }; for (var i = 2; i * i <= n; i++) if (n % i === 0) return { res: "否" }; return { res: "是" }; } });
calcTool({ file: "calc-prime-factor.html", title: "质因数分解", desc: "把一个整数分解为质因子乘积。", tags: ["数论", "质因数", "计算"], order: 1515, fields: [{ id: "n", label: "整数", type: "number", value: 360 }], outputs: [{ id: "res", label: "分解结果" }], compute: function (args) { var n = Math.floor(Math.abs(args.n)); if (n < 2) return { res: String(n) }; var f = [], d = 2; while (d * d <= n) { while (n % d === 0) { f.push(d); n /= d; } d++; } if (n > 1) f.push(n); return { res: f.join(" × ") }; } });
calcTool({ file: "calc-permutation.html", title: "排列数", desc: "计算从 n 个元素取 k 的排列数 P(n,k)。", tags: ["组合数学", "排列", "计算"], order: 1516, fields: [{ id: "n", label: "n", type: "number", value: 10 }, { id: "k", label: "k", type: "number", value: 3 }], outputs: [{ id: "p", label: "P(n,k)" }], compute: function (args) { var r = 1; for (var i = 0; i < args.k; i++) r *= (args.n - i); return { p: r }; } });
calcTool({ file: "calc-combination.html", title: "组合数", desc: "计算从 n 个元素取 k 的组合数 C(n,k)。", tags: ["组合数学", "组合", "计算"], order: 1517, fields: [{ id: "n", label: "n", type: "number", value: 10 }, { id: "k", label: "k", type: "number", value: 3 }], outputs: [{ id: "c", label: "C(n,k)" }], compute: function (args) { var r = 1; for (var i = 0; i < args.k; i++) r = r * (args.n - i) / (i + 1); return { c: r }; } });
calcTool({ file: "calc-fibonacci.html", title: "斐波那契数", desc: "计算斐波那契数列第 n 项。", tags: ["数列", "斐波那契", "计算"], order: 1518, fields: [{ id: "n", label: "n (0-78)", type: "number", value: 20, min: 0, max: 78 }], outputs: [{ id: "f", label: "第 n 项" }], compute: function (args) { var n = Math.floor(args.n); if (n === 0) return { f: 0 }; if (n === 1) return { f: 1 }; var a = 0, b = 1; for (var i = 2; i <= n; i++) { var t = a + b; a = b; b = t; } return { f: b }; } });
calcTool({ file: "calc-quadratic.html", title: "一元二次方程", desc: "求解 ax² + bx + c = 0 的根。", tags: ["方程", "代数", "计算"], order: 1519, fields: [{ id: "aa", label: "a", type: "number", value: 1 }, { id: "bb", label: "b", type: "number", value: -3 }, { id: "cc", label: "c", type: "number", value: 2 }], outputs: [{ id: "x1", label: "根 1" }, { id: "x2", label: "根 2" }], compute: function (args) { var a = args.aa, b = args.bb, c = args.cc; if (a === 0) return { __msg: "a 不能为 0" }; var disc = b * b - 4 * a * c; if (disc < 0) { var sr = Math.sqrt(-disc) / (2 * a); return { x1: "实部 " + (-b / (2 * a)).toFixed(3) + " 虚部 " + sr.toFixed(3) + "i", x2: "" }; } var r1 = (-b + Math.sqrt(disc)) / (2 * a), r2 = (-b - Math.sqrt(disc)) / (2 * a); return { x1: r1, x2: r2 }; } });
calcTool({ file: "calc-arith-seq.html", title: "等差数列", desc: "求等差数列的第 n 项与前 n 项和。", tags: ["数列", "等差", "计算"], order: 1520, fields: [{ id: "a1", label: "首项", type: "number", value: 2 }, { id: "d", label: "公差", type: "number", value: 3 }, { id: "n", label: "项数 n", type: "number", value: 10 }], outputs: [{ id: "an", label: "第 n 项" }, { id: "sum", label: "前 n 项和" }], compute: function (args) { var an = args.a1 + (args.n - 1) * args.d; return { an: an, sum: args.n * (args.a1 + an) / 2 }; } });
calcTool({ file: "calc-geo-seq.html", title: "等比数列", desc: "求等比数列的第 n 项与前 n 项和。", tags: ["数列", "等比", "计算"], order: 1521, fields: [{ id: "a1", label: "首项", type: "number", value: 2 }, { id: "r", label: "公比", type: "number", value: 2 }, { id: "n", label: "项数 n", type: "number", value: 10 }], outputs: [{ id: "an", label: "第 n 项" }, { id: "sum", label: "前 n 项和" }], compute: function (args) { var an = args.a1 * Math.pow(args.r, args.n - 1); var sum = args.r === 1 ? args.a1 * args.n : args.a1 * (1 - Math.pow(args.r, args.n)) / (1 - args.r); return { an: an, sum: sum }; } });
calcTool({ file: "calc-triangle-number.html", title: "三角形数", desc: "计算第 n 个三角形数 n(n+1)/2。", tags: ["数列", "三角数", "计算"], order: 1522, fields: [{ id: "n", label: "n", type: "number", value: 10 }], outputs: [{ id: "t", label: "三角形数" }], compute: function (args) { return { t: args.n * (args.n + 1) / 2 }; } });
calcTool({ file: "calc-perfect-check.html", title: "完全数判定", desc: "判断一个整数是否为完全数。", tags: ["数论", "完全数", "计算"], order: 1523, fields: [{ id: "n", label: "整数", type: "number", value: 28 }], outputs: [{ id: "res", label: "是否完全数" }], compute: function (args) { var n = Math.floor(Math.abs(args.n)); if (n < 2) return { res: "否" }; var s = 1; for (var i = 2; i * i <= n; i++) if (n % i === 0) { s += i; if (i !== n / i) s += n / i; } return { res: s === n ? "是" : "否" }; } });
calcTool({ file: "calc-volume-pyramid.html", title: "棱锥体积", desc: "底面积乘高除以三。", tags: ["几何", "体积", "计算"], order: 1524, fields: [{ id: "baseArea", label: "底面积", type: "number", value: 100 }, { id: "height", label: "高", type: "number", value: 30 }], outputs: [{ id: "vol", label: "体积" }], compute: function (args) { return { vol: args.baseArea * args.height / 3 }; } });
calcTool({ file: "calc-surface-cone.html", title: "圆锥表面积", desc: "计算圆锥的侧面积与表面积。", tags: ["几何", "圆锥", "计算"], order: 1525, fields: [{ id: "r", label: "底面半径", type: "number", value: 5 }, { id: "h", label: "高", type: "number", value: 12 }], outputs: [{ id: "area", label: "表面积" }], compute: function (args) { var slant = Math.sqrt(args.r * args.r + args.h * args.h); return { area: Math.PI * args.r * (args.r + slant) }; } });
calcTool({ file: "calc-annulus-area.html", title: "圆环面积", desc: "计算内外圆半径之间的圆环面积。", tags: ["几何", "圆环", "计算"], order: 1526, fields: [{ id: "R", label: "外半径", type: "number", value: 10 }, { id: "r", label: "内半径", type: "number", value: 6 }], outputs: [{ id: "area", label: "圆环面积" }], compute: function (args) { return { area: Math.PI * (args.R * args.R - args.r * args.r) }; } });
calcTool({ file: "calc-torus-volume.html", title: "环体体积", desc: "计算圆环（甜甜圈）的体积。", tags: ["几何", "环体", "计算"], order: 1527, fields: [{ id: "R", label: "主半径", type: "number", value: 10 }, { id: "r", label: "管半径", type: "number", value: 3 }], outputs: [{ id: "vol", label: "体积" }], compute: function (args) { return { vol: 2 * Math.PI * Math.PI * args.R * args.r * args.r }; } });
calcTool({ file: "calc-torus-surface.html", title: "环体表面积", desc: "计算圆环（甜甜圈）的表面积。", tags: ["几何", "环体", "计算"], order: 1528, fields: [{ id: "R", label: "主半径", type: "number", value: 10 }, { id: "r", label: "管半径", type: "number", value: 3 }], outputs: [{ id: "surf", label: "表面积" }], compute: function (args) { return { surf: 4 * Math.PI * Math.PI * args.R * args.r }; } });
calcTool({ file: "calc-spherical-cap.html", title: "球缺体积", desc: "计算球冠（球缺）的体积。", tags: ["几何", "球缺", "计算"], order: 1529, fields: [{ id: "R", label: "球半径", type: "number", value: 10 }, { id: "h", label: "球缺高", type: "number", value: 4 }], outputs: [{ id: "vol", label: "体积" }], compute: function (args) { return { vol: Math.PI * args.h * args.h * (3 * args.R - args.h) / 3 }; } });
calcTool({ file: "calc-ellipsoid-volume.html", title: "椭球体积", desc: "计算三轴椭球的体积。", tags: ["几何", "椭球", "计算"], order: 1530, fields: [{ id: "a", label: "半轴 a", type: "number", value: 5 }, { id: "b", label: "半轴 b", type: "number", value: 4 }, { id: "c", label: "半轴 c", type: "number", value: 3 }], outputs: [{ id: "vol", label: "体积" }], compute: function (args) { return { vol: 4 / 3 * Math.PI * args.a * args.b * args.c }; } });
calcTool({ file: "calc-prism-volume.html", title: "棱柱体积", desc: "底面积乘高。", tags: ["几何", "体积", "计算"], order: 1531, fields: [{ id: "baseArea", label: "底面积", type: "number", value: 50 }, { id: "height", label: "高", type: "number", value: 20 }], outputs: [{ id: "vol", label: "体积" }], compute: function (args) { return { vol: args.baseArea * args.height }; } });
calcTool({ file: "calc-rhombus-area.html", title: "菱形面积", desc: "两对角线乘积的一半。", tags: ["几何", "菱形", "计算"], order: 1532, fields: [{ id: "d1", label: "对角线 1", type: "number", value: 10 }, { id: "d2", label: "对角线 2", type: "number", value: 8 }], outputs: [{ id: "area", label: "面积" }], compute: function (args) { return { area: args.d1 * args.d2 / 2 }; } });
calcTool({ file: "calc-kite-area.html", title: "风筝形面积", desc: "两对角线乘积的一半。", tags: ["几何", "风筝形", "计算"], order: 1533, fields: [{ id: "d1", label: "对角线 1", type: "number", value: 10 }, { id: "d2", label: "对角线 2", type: "number", value: 8 }], outputs: [{ id: "area", label: "面积" }], compute: function (args) { return { area: args.d1 * args.d2 / 2 }; } });
calcTool({ file: "calc-polygon-perimeter.html", title: "正多边形周长", desc: "边长乘以边数。", tags: ["几何", "周长", "计算"], order: 1534, fields: [{ id: "side", label: "边长", type: "number", value: 6 }, { id: "n", label: "边数", type: "number", value: 6 }], outputs: [{ id: "peri", label: "周长" }], compute: function (args) { return { peri: args.side * args.n }; } });
calcTool({ file: "calc-sector-area.html", title: "扇形面积", desc: "按半径与圆心角计算扇形面积。", tags: ["几何", "扇形", "计算"], order: 1535, fields: [{ id: "radius", label: "半径", type: "number", value: 10 }, { id: "angle", label: "圆心角 (度)", type: "number", value: 60 }], outputs: [{ id: "area", label: "扇形面积" }], compute: function (args) { return { area: 0.5 * args.radius * args.radius * args.angle * Math.PI / 180 }; } });
calcTool({ file: "calc-arc-length.html", title: "弧长", desc: "按半径与圆心角计算弧长。", tags: ["几何", "弧长", "计算"], order: 1536, fields: [{ id: "radius", label: "半径", type: "number", value: 10 }, { id: "angle", label: "圆心角 (度)", type: "number", value: 60 }], outputs: [{ id: "len", label: "弧长" }], compute: function (args) { return { len: args.radius * args.angle * Math.PI / 180 }; } });
calcTool({ file: "calc-chord-length.html", title: "弦长", desc: "按半径与圆心角计算弦长。", tags: ["几何", "弦长", "计算"], order: 1537, fields: [{ id: "radius", label: "半径", type: "number", value: 10 }, { id: "angle", label: "圆心角 (度)", type: "number", value: 60 }], outputs: [{ id: "chord", label: "弦长" }], compute: function (args) { return { chord: 2 * args.radius * Math.sin(args.angle * Math.PI / 360) }; } });
calcTool({ file: "calc-cube-diagonal.html", title: "立方体对角线", desc: "计算立方体空间对角线。", tags: ["几何", "对角线", "计算"], order: 1538, fields: [{ id: "a", label: "棱长", type: "number", value: 5 }], outputs: [{ id: "diag", label: "体对角线" }], compute: function (args) { return { diag: args.a * Math.sqrt(3) }; } });
calcTool({ file: "calc-frustum-volume.html", title: "圆台体积", desc: "计算圆台（截头圆锥）体积。", tags: ["几何", "圆台", "计算"], order: 1539, fields: [{ id: "R", label: "上底半径", type: "number", value: 6 }, { id: "r", label: "下底半径", type: "number", value: 3 }, { id: "h", label: "高", type: "number", value: 8 }], outputs: [{ id: "vol", label: "体积" }], compute: function (args) { return { vol: Math.PI * args.h / 3 * (args.R * args.R + args.R * args.r + args.r * args.r) }; } });
calcTool({ file: "calc-cylinder-lateral.html", title: "圆柱侧面积", desc: "计算圆柱侧面积。", tags: ["几何", "圆柱", "计算"], order: 1540, fields: [{ id: "r", label: "底面半径", type: "number", value: 5 }, { id: "h", label: "高", type: "number", value: 10 }], outputs: [{ id: "lat", label: "侧面积" }], compute: function (args) { return { lat: 2 * Math.PI * args.r * args.h }; } });
calcTool({ file: "calc-resistance-parallel.html", title: "并联电阻", desc: "计算两电阻并联等效电阻。", tags: ["物理", "电阻", "电学"], order: 1541, fields: [{ id: "r1", label: "电阻 1", type: "number", value: 100 }, { id: "r2", label: "电阻 2", type: "number", value: 200 }], outputs: [{ id: "res", label: "并联电阻" }], compute: function (args) { return { res: (args.r1 * args.r2) / (args.r1 + args.r2) }; } });
calcTool({ file: "calc-resistance-series.html", title: "串联电阻", desc: "计算两电阻串联等效电阻。", tags: ["物理", "电阻", "电学"], order: 1542, fields: [{ id: "r1", label: "电阻 1", type: "number", value: 100 }, { id: "r2", label: "电阻 2", type: "number", value: 200 }], outputs: [{ id: "res", label: "串联电阻" }], compute: function (args) { return { res: args.r1 + args.r2 }; } });
calcTool({ file: "calc-capacitance-series.html", title: "串联电容", desc: "计算两电容串联等效电容。", tags: ["物理", "电容", "电学"], order: 1543, fields: [{ id: "c1", label: "电容 1", type: "number", value: 10 }, { id: "c2", label: "电容 2", type: "number", value: 20 }], outputs: [{ id: "cap", label: "串联电容" }], compute: function (args) { return { cap: (args.c1 * args.c2) / (args.c1 + args.c2) }; } });
calcTool({ file: "calc-capacitance-parallel.html", title: "并联电容", desc: "计算两电容并联等效电容。", tags: ["物理", "电容", "电学"], order: 1544, fields: [{ id: "c1", label: "电容 1", type: "number", value: 10 }, { id: "c2", label: "电容 2", type: "number", value: 20 }], outputs: [{ id: "cap", label: "并联电容" }], compute: function (args) { return { cap: args.c1 + args.c2 }; } });
calcTool({ file: "calc-lens-maker.html", title: "透镜焦距", desc: "用透镜制造者公式计算焦距。", tags: ["物理", "光学", "透镜"], order: 1545, fields: [{ id: "n", label: "折射率 n", type: "number", value: 1.5 }, { id: "R1", label: "曲率半径 R1", type: "number", value: 20 }, { id: "R2", label: "曲率半径 R2", type: "number", value: -20 }], outputs: [{ id: "f", label: "焦距" }], compute: function (args) { var inv = (args.n - 1) * (1 / args.R1 - 1 / args.R2); return { f: inv !== 0 ? 1 / inv : Infinity }; } });
calcTool({ file: "calc-snell-law.html", title: "折射定律", desc: "按斯涅尔定律计算折射角。", tags: ["物理", "光学", "折射"], order: 1546, fields: [{ id: "n1", label: "介质1折射率", type: "number", value: 1 }, { id: "n2", label: "介质2折射率", type: "number", value: 1.33 }, { id: "theta1", label: "入射角 (度)", type: "number", value: 30 }], outputs: [{ id: "theta2", label: "折射角 (度)" }], compute: function (args) { var s = args.n1 * Math.sin(args.theta1 * Math.PI / 180) / args.n2; if (s > 1) return { theta2: "全反射" }; return { theta2: Math.asin(s) * 180 / Math.PI }; } });
calcTool({ file: "calc-doppler.html", title: "多普勒频移", desc: "计算波源运动时的观测频率。", tags: ["物理", "波", "多普勒"], order: 1547, fields: [{ id: "f0", label: "原始频率", type: "number", value: 1000 }, { id: "vs", label: "波源速度", type: "number", value: 30 }, { id: "c", label: "波速", type: "number", value: 340 }], outputs: [{ id: "f", label: "观测频率" }], compute: function (args) { return { f: args.f0 * args.c / (args.c - args.vs) }; } });
calcTool({ file: "calc-efficiency.html", title: "效率", desc: "输出除以输入得到效率百分比。", tags: ["物理", "效率", "计算"], order: 1548, fields: [{ id: "output", label: "输出", type: "number", value: 80 }, { id: "input", label: "输入", type: "number", value: 100 }], outputs: [{ id: "eff", label: "效率 %" }], compute: function (args) { return { eff: args.input ? args.output / args.input * 100 : 0 }; } });
calcTool({ file: "calc-thermal-expansion.html", title: "热膨胀", desc: "按线膨胀系数计算长度变化。", tags: ["物理", "热学", "膨胀"], order: 1549, fields: [{ id: "alpha", label: "膨胀系数", type: "number", value: 0.000012 }, { id: "L0", label: "原长", type: "number", value: 1000 }, { id: "dT", label: "温差", type: "number", value: 50 }], outputs: [{ id: "dL", label: "长度变化" }], compute: function (args) { return { dL: args.alpha * args.L0 * args.dT }; } });
calcTool({ file: "calc-snr.html", title: "信噪比", desc: "计算信号与噪声的比值（分贝）。", tags: ["物理", "信号", "信噪比"], order: 1550, fields: [{ id: "signal", label: "信号功率", type: "number", value: 100 }, { id: "noise", label: "噪声功率", type: "number", value: 1 }], outputs: [{ id: "snr", label: "信噪比 dB" }], compute: function (args) { return { snr: 10 * Math.log10(args.signal / args.noise) }; } });
calcTool({ file: "calc-escape-velocity.html", title: "逃逸速度", desc: "按表面重力加速度与半径计算逃逸速度。", tags: ["物理", "引力", "速度"], order: 1551, fields: [{ id: "g", label: "表面重力加速度", type: "number", value: 9.8 }, { id: "R", label: "半径", type: "number", value: 6371000 }], outputs: [{ id: "v", label: "逃逸速度" }], compute: function (args) { return { v: Math.sqrt(2 * args.g * args.R) }; } });
calcTool({ file: "calc-rotational-kinetic.html", title: "转动动能", desc: "按转动惯量与角速度计算转动动能。", tags: ["物理", "转动", "能量"], order: 1552, fields: [{ id: "I", label: "转动惯量", type: "number", value: 2 }, { id: "omega", label: "角速度 rad/s", type: "number", value: 5 }], outputs: [{ id: "e", label: "转动动能" }], compute: function (args) { return { e: 0.5 * args.I * args.omega * args.omega }; } });
calcTool({ file: "calc-angular-velocity.html", title: "角速度换算", desc: "把转速 RPM 换算为角速度 rad/s。", tags: ["物理", "角速度", "换算"], order: 1553, fields: [{ id: "rpm", label: "转速 RPM", type: "number", value: 3000 }], outputs: [{ id: "w", label: "角速度 rad/s" }], compute: function (args) { return { w: args.rpm * 2 * Math.PI / 60 }; } });
calcTool({ file: "calc-de-broglie.html", title: "德布罗意波长", desc: "按动量计算物质波波长。", tags: ["物理", "量子", "波长"], order: 1554, fields: [{ id: "m", label: "质量", type: "number", value: 9.11e-31 }, { id: "v", label: "速度", type: "number", value: 1e6 }], outputs: [{ id: "lambda", label: "波长" }], compute: function (args) { return { lambda: 6.626e-34 / (args.m * args.v) }; } });
calcTool({ file: "calc-ideal-gas.html", title: "理想气体体积", desc: "按理想气体状态方程求体积 V = nRT/P。", tags: ["物理", "气体", "计算"], order: 1555, fields: [{ id: "P", label: "压强 P", type: "number", value: 101325 }, { id: "n", label: "物质的量 n (mol)", type: "number", value: 1 }, { id: "T", label: "温度 K", type: "number", value: 273.15 }, { id: "R", label: "气体常数 R", type: "number", value: 8.314 }], outputs: [{ id: "v", label: "体积 V" }], compute: function (args) { return { v: args.n * args.R * args.T / args.P }; } });

// ---------- 计算工具（第 2 批：财务 / 健康 / 日期 / 单位换算）----------
calcTool({ file: "calc-emi.html", title: "等额本息月供", desc: "计算贷款等额本息每月还款额。", tags: ["贷款", "月供", "财务"], order: 1556, fields: [{ id: "principal", label: "贷款本金", type: "number", value: 1000000 }, { id: "rate", label: "年利率 %", type: "number", value: 4.9 }, { id: "years", label: "期限（年）", type: "number", value: 30 }], outputs: [{ id: "emi", label: "月供" }], compute: function (args) { var P = args.principal, r = args.rate / 1200, n = args.years * 12; if (r === 0) return { emi: P / n }; var f = Math.pow(1 + r, n); return { emi: P * r * f / (f - 1) }; } });
calcTool({ file: "calc-loan-interest.html", title: "贷款总利息", desc: "计算等额本息贷款的总利息支出。", tags: ["贷款", "利息", "财务"], order: 1557, fields: [{ id: "principal", label: "贷款本金", type: "number", value: 1000000 }, { id: "rate", label: "年利率 %", type: "number", value: 4.9 }, { id: "years", label: "期限（年）", type: "number", value: 30 }], outputs: [{ id: "interest", label: "总利息" }], compute: function (args) { var P = args.principal, r = args.rate / 1200, n = args.years * 12; var emi = r === 0 ? P / n : P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1); return { interest: emi * n - P }; } });
calcTool({ file: "calc-credit-card-payoff.html", title: "信用卡还清", desc: "估算按固定月还款还清卡债所需时间与利息。", tags: ["信用卡", "还款", "财务"], order: 1558, fields: [{ id: "balance", label: "欠款余额", type: "number", value: 20000 }, { id: "apr", label: "年化利率 %", type: "number", value: 18 }, { id: "monthly", label: "每月还款", type: "number", value: 1000 }], outputs: [{ id: "months", label: "还清月数" }, { id: "total", label: "总利息" }], compute: function (args) { var bal = args.balance, m = args.monthly, r = args.apr / 1200, months = 0, totInt = 0; if (m <= bal * r) return { __msg: "月还款低于月息，无法还清" }; while (bal > 0.001 && months < 2400) { var int = bal * r; bal = bal + int - m; if (bal < 0) bal = 0; totInt += int; months++; } return { months: months, total: totInt }; } });
calcTool({ file: "calc-fv-annuity-due.html", title: "年金终值（期初）", desc: "计算期初年金在期末的本息和。", tags: ["年金", "终值", "财务"], order: 1559, fields: [{ id: "pmt", label: "每期付款", type: "number", value: 1000 }, { id: "rate", label: "年利率 %", type: "number", value: 5 }, { id: "years", label: "年数", type: "number", value: 10 }, { id: "freq", label: "年付款次数", type: "number", value: 12 }], outputs: [{ id: "fv", label: "期末终值" }], compute: function (args) { var r = args.rate / 100 / args.freq, n = args.years * args.freq; var fv = args.pmt * ((Math.pow(1 + r, n) - 1) / r) * (1 + r); return { fv: fv }; } });
calcTool({ file: "calc-pv-annuity.html", title: "年金现值", desc: "计算一系列年金付款的当前价值。", tags: ["年金", "现值", "财务"], order: 1560, fields: [{ id: "pmt", label: "每期付款", type: "number", value: 1000 }, { id: "rate", label: "年利率 %", type: "number", value: 5 }, { id: "years", label: "年数", type: "number", value: 10 }, { id: "freq", label: "年付款次数", type: "number", value: 12 }], outputs: [{ id: "pv", label: "现值" }], compute: function (args) { var r = args.rate / 100 / args.freq, n = args.years * args.freq; var pv = args.pmt * (1 - Math.pow(1 + r, -n)) / r; return { pv: pv }; } });
calcTool({ file: "calc-compound-frequency.html", title: "复利频率对比", desc: "对比年、月、日复利下的终值差异。", tags: ["复利", "对比", "财务"], order: 1561, fields: [{ id: "principal", label: "本金", type: "number", value: 10000 }, { id: "rate", label: "年利率 %", type: "number", value: 5 }, { id: "years", label: "年数", type: "number", value: 20 }], outputs: [{ id: "annual", label: "年复利" }, { id: "monthly", label: "月复利" }, { id: "daily", label: "日复利" }], compute: function (args) { var P = args.principal, x = args.rate / 100, y = args.years; return { annual: P * Math.pow(1 + x, y), monthly: P * Math.pow(1 + x / 12, 12 * y), daily: P * Math.pow(1 + x / 365, 365 * y) }; } });
calcTool({ file: "calc-payback.html", title: "投资回收期", desc: "按初始投入与年现金流估算回收期。", tags: ["回收期", "投资", "财务"], order: 1562, fields: [{ id: "initial", label: "初始投入", type: "number", value: 100000 }, { id: "cashflow", label: "年现金流", type: "number", value: 25000 }], outputs: [{ id: "pb", label: "回收期（年）" }], compute: function (args) { return { pb: args.cashflow ? args.initial / args.cashflow : 0 }; } });
calcTool({ file: "calc-effective-rate.html", title: "有效年利率", desc: "把名义年利率换算为按期复利的有效年利率。", tags: ["利率", "有效", "财务"], order: 1563, fields: [{ id: "nominal", label: "名义年利率 %", type: "number", value: 6 }, { id: "periods", label: "每年复利次数", type: "number", value: 12 }], outputs: [{ id: "er", label: "有效年利率 %" }], compute: function (args) { return { er: (Math.pow(1 + args.nominal / 100 / args.periods, args.periods) - 1) * 100 }; } });
calcTool({ file: "calc-real-rate.html", title: "实际利率", desc: "扣除通胀后的实际利率。", tags: ["利率", "通胀", "财务"], order: 1564, fields: [{ id: "nominal", label: "名义利率 %", type: "number", value: 5 }, { id: "inflation", label: "通胀率 %", type: "number", value: 2 }], outputs: [{ id: "rr", label: "实际利率 %" }], compute: function (args) { return { rr: ((1 + args.nominal / 100) / (1 + args.inflation / 100) - 1) * 100 }; } });
calcTool({ file: "calc-quantity-discount.html", title: "批量折扣价", desc: "按数量与折扣率计算应付金额。", tags: ["折扣", "批价", "财务"], order: 1565, fields: [{ id: "qty", label: "数量", type: "number", value: 100 }, { id: "unit", label: "单价", type: "number", value: 50 }, { id: "disc", label: "折扣 %", type: "number", value: 10 }], outputs: [{ id: "pay", label: "应付金额" }], compute: function (args) { return { pay: args.qty * args.unit * (1 - args.disc / 100) }; } });
calcTool({ file: "calc-compound-vs-simple.html", title: "复利单利对比", desc: "对比同等条件下的复利与单利终值。", tags: ["复利", "单利", "财务"], order: 1566, fields: [{ id: "principal", label: "本金", type: "number", value: 10000 }, { id: "rate", label: "年利率 %", type: "number", value: 5 }, { id: "years", label: "年数", type: "number", value: 20 }], outputs: [{ id: "compound", label: "复利终值" }, { id: "simple", label: "单利终值" }], compute: function (args) { var P = args.principal, x = args.rate / 100, y = args.years; return { compound: P * Math.pow(1 + x, y), simple: P * (1 + x * y) }; } });
textTool({ file: "calc-npv.html", title: "净现值 NPV", desc: "按折现率计算一组现金流的净现值。", category: "calc", tags: ["NPV", "现金流", "财务"], order: 1567, fields: [{ id: "text", label: "现金流（每行一个，首期通常为负投入）", type: "textarea", rows: 6, placeholder: "-1000\n300\n400\n500" }, { id: "rate", label: "折现率 %", type: "number", value: 10 }], transform: function (args) { var r = args.rate / 100; var cfs = args.text.split("\n").map(function (l) { l = l.trim(); return l === "" ? NaN : parseFloat(l); }).filter(function (x) { return !isNaN(x); }); if (!cfs.length) return "请输入现金流"; var npv = 0; for (var t = 0; t < cfs.length; t++) npv += cfs[t] / Math.pow(1 + r, t); return "净现值 NPV = " + npv.toFixed(2); } });
calcTool({ file: "calc-body-water.html", title: "体内水分", desc: "按体重与性别估算体内水分含量。", tags: ["健康", "水分", "计算"], order: 1568, fields: [{ id: "weight", label: "体重 kg", type: "number", value: 65 }, { id: "sex", label: "性别", type: "select", options: ["男", "女"] }], outputs: [{ id: "tbw", label: "体内水分 kg" }], compute: function (args) { return { tbw: (args.sex === "男" ? 0.6 : 0.5) * args.weight }; } });
calcTool({ file: "calc-lean-body-mass.html", title: "瘦体重", desc: "按体重与体脂率估算瘦体重。", tags: ["健康", "体脂", "计算"], order: 1569, fields: [{ id: "weight", label: "体重 kg", type: "number", value: 70 }, { id: "fat", label: "体脂率 %", type: "number", value: 20 }], outputs: [{ id: "lbm", label: "瘦体重 kg" }], compute: function (args) { return { lbm: args.weight * (1 - args.fat / 100) }; } });
calcTool({ file: "calc-protein-intake.html", title: "蛋白质需求", desc: "按体重与活动量估算每日蛋白质摄入。", tags: ["健康", "蛋白", "营养"], order: 1570, fields: [{ id: "weight", label: "体重 kg", type: "number", value: 70 }, { id: "activity", label: "活动量", type: "select", options: ["久坐", "一般", "运动", "高强度"] }], outputs: [{ id: "protein", label: "每日蛋白 g" }], compute: function (args) { var f = { "久坐": 0.8, "一般": 1.2, "运动": 1.6, "高强度": 2.0 }; return { protein: args.weight * (f[args.activity] || 1.2) }; } });
calcTool({ file: "calc-caloric-deficit.html", title: "减脂热量缺口", desc: "按目标减重与周期计算每日热量缺口。", tags: ["健康", "减脂", "热量"], order: 1571, fields: [{ id: "loss", label: "目标减重 kg", type: "number", value: 5 }, { id: "weeks", label: "周期（周）", type: "number", value: 10 }], outputs: [{ id: "deficit", label: "每日缺口 kcal" }], compute: function (args) { return { deficit: args.loss * 7700 / args.weeks / 7 }; } });
calcTool({ file: "calc-pregnancy-due.html", title: "预产期推算", desc: "按末次月经日期推算预产期（加 280 天）。", tags: ["健康", "孕期", "日期"], order: 1572, fields: [{ id: "lmp", label: "末次月经", type: "date", value: "2026-01-01" }], outputs: [{ id: "due", label: "预产期" }], compute: function (args) { var d = new Date(args.lmp); d.setDate(d.getDate() + 280); return { due: d.toISOString().slice(0, 10) }; } });
calcTool({ file: "calc-ovulation.html", title: "排卵日推算", desc: "按末次月经日期推算排卵日（加 14 天）。", tags: ["健康", "孕期", "日期"], order: 1573, fields: [{ id: "lmp", label: "末次月经", type: "date", value: "2026-01-01" }], outputs: [{ id: "ovu", label: "排卵日" }], compute: function (args) { var d = new Date(args.lmp); d.setDate(d.getDate() + 14); return { ovu: d.toISOString().slice(0, 10) }; } });
calcTool({ file: "calc-sleep-cycles.html", title: "睡眠周期数", desc: "按睡眠时长估算约多少个 90 分钟周期。", tags: ["健康", "睡眠", "计算"], order: 1574, fields: [{ id: "hours", label: "睡眠时长（小时）", type: "number", value: 7.5 }], outputs: [{ id: "cycles", label: "周期数" }], compute: function (args) { return { cycles: args.hours / 1.5 }; } });
calcTool({ file: "calc-bmi-imperial.html", title: "BMI（英制）", desc: "按磅与英寸计算身体质量指数。", tags: ["健康", "BMI", "英制"], order: 1575, fields: [{ id: "lbs", label: "体重（磅）", type: "number", value: 154 }, { id: "inches", label: "身高（英寸）", type: "number", value: 67 }], outputs: [{ id: "bmi", label: "BMI" }], compute: function (args) { return { bmi: args.lbs / (args.inches * args.inches) * 703 }; } });
calcTool({ file: "calc-child-dose.html", title: "儿童给药剂量", desc: "按体重与每千克剂量估算给药量。", tags: ["健康", "用药", "计算"], order: 1576, fields: [{ id: "weight", label: "体重 kg", type: "number", value: 20 }, { id: "perkg", label: "每千克剂量 mg", type: "number", value: 10 }], outputs: [{ id: "dose", label: "剂量 mg" }], compute: function (args) { return { dose: args.weight * args.perkg }; } });
calcTool({ file: "calc-calories-to-lose.html", title: "减重热量换算", desc: "把目标减重量换算为需要消耗的总热量。", tags: ["健康", "减脂", "热量"], order: 1577, fields: [{ id: "kg", label: "减重 kg", type: "number", value: 1 }], outputs: [{ id: "kcal", label: "需消耗 kcal" }], compute: function (args) { return { kcal: args.kg * 7700 }; } });
calcTool({ file: "calc-macro-split.html", title: "宏量营养分配", desc: "按总热量与三大营养素比例估算克数。", tags: ["健康", "营养", "计算"], order: 1578, fields: [{ id: "cal", label: "每日热量 kcal", type: "number", value: 2000 }, { id: "p", label: "蛋白 %", type: "number", value: 30 }, { id: "c", label: "碳水 %", type: "number", value: 40 }], outputs: [{ id: "protein", label: "蛋白 g" }, { id: "carb", label: "碳水 g" }, { id: "fat", label: "脂肪 g" }], compute: function (args) { var fat = 100 - args.p - args.c; return { protein: args.cal * args.p / 100 / 4, carb: args.cal * args.c / 100 / 4, fat: args.cal * fat / 100 / 9 }; } });
calcTool({ file: "calc-date-difference.html", title: "日期差值", desc: "计算两个日期之间相差的天数。", tags: ["日期", "差值", "计算"], order: 1579, fields: [{ id: "date1", label: "开始日期", type: "date", value: "2026-01-01" }, { id: "date2", label: "结束日期", type: "date", value: "2026-12-31" }], outputs: [{ id: "days", label: "相差天数" }], compute: function (args) { var a = new Date(args.date1), b = new Date(args.date2); return { days: Math.round((b - a) / 86400000) }; } });
calcTool({ file: "calc-add-days.html", title: "日期加天数", desc: "在给定日期上增加若干天。", tags: ["日期", "推算", "计算"], order: 1580, fields: [{ id: "date1", label: "日期", type: "date", value: "2026-01-01" }, { id: "days", label: "增加天数", type: "number", value: 100 }], outputs: [{ id: "res", label: "结果日期" }], compute: function (args) { var a = new Date(args.date1); a.setDate(a.getDate() + args.days); return { res: a.toISOString().slice(0, 10) }; } });
calcTool({ file: "calc-age-in-days.html", title: "年龄天数", desc: "按生日计算已经历的天数。", tags: ["日期", "年龄", "计算"], order: 1581, fields: [{ id: "birth", label: "出生日期", type: "date", value: "1990-06-15" }], outputs: [{ id: "days", label: "年龄（天）" }], compute: function (args) { var a = new Date(args.birth), b = new Date(); return { days: Math.floor((b - a) / 86400000) }; } });
calcTool({ file: "calc-week-number.html", title: "ISO 周数", desc: "计算日期所在的 ISO 周编号。", tags: ["日期", "周数", "计算"], order: 1582, fields: [{ id: "date1", label: "日期", type: "date", value: "2026-01-01" }], outputs: [{ id: "wk", label: "ISO 周数" }], compute: function (args) { var d = new Date(args.date1); var t = new Date(d.getFullYear(), 0, 1); var day = (t.getDay() + 6) % 7; var wk = Math.floor(((d - t) / 86400000 + day + 6) / 7); return { wk: wk }; } });
calcTool({ file: "calc-day-of-week.html", title: "星期查询", desc: "返回指定日期是星期几。", tags: ["日期", "星期", "计算"], order: 1583, fields: [{ id: "date1", label: "日期", type: "date", value: "2026-10-30" }], outputs: [{ id: "name", label: "星期" }], compute: function (args) { var d = new Date(args.date1); var names = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]; return { name: names[d.getDay()] }; } });
calcTool({ file: "calc-zodiac.html", title: "星座查询", desc: "按出生日期返回星座。", tags: ["日期", "星座", "计算"], order: 1584, fields: [{ id: "date1", label: "出生日期", type: "date", value: "1990-08-15" }], outputs: [{ id: "z", label: "星座" }], compute: function (args) { var d = new Date(args.date1); var m = d.getMonth() + 1, day = d.getDate(); var s = ["摩羯", "水瓶", "双鱼", "白羊", "金牛", "双子", "巨蟹", "狮子", "处女", "天秤", "天蝎", "射手"]; var b = [[1, 20], [2, 19], [3, 21], [4, 20], [5, 21], [6, 22], [7, 23], [8, 23], [9, 23], [10, 24], [11, 23], [12, 22]]; for (var i = 11; i >= 0; i--) { if (m > b[i][0] || (m === b[i][0] && day >= b[i][1])) return { z: s[i] }; } return { z: "摩羯" }; } });
calcTool({ file: "calc-chinese-zodiac.html", title: "生肖查询", desc: "按年份返回中国生肖。", tags: ["日期", "生肖", "计算"], order: 1585, fields: [{ id: "year", label: "年份", type: "number", value: 2024 }], outputs: [{ id: "z", label: "生肖" }], compute: function (args) { var a = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"]; var y = Math.floor(args.year); return { z: a[((y - 4) % 12 + 12) % 12] }; } });
calcTool({ file: "calc-countdown.html", title: "倒计时天数", desc: "计算距离目标日期还有多少天。", tags: ["日期", "倒计时", "计算"], order: 1586, fields: [{ id: "target", label: "目标日期", type: "date", value: "2027-01-01" }], outputs: [{ id: "days", label: "剩余天数" }], compute: function (args) { var t = new Date(args.target), b = new Date(); return { days: Math.ceil((t - b) / 86400000) }; } });
unitConvTool({ file: "calc-torque-converter.html", title: "力矩换算", desc: "牛顿米、磅英尺、千克力米、达因厘米互转。", tags: ["力矩", "单位", "换算"], order: 1587, fromLabel: "从", toLabel: "到", units: [{ name: "N·m", factor: 1 }, { name: "lbf·ft", factor: 1.3558179483314004 }, { name: "kgf·m", factor: 9.80665 }, { name: "dyn·cm", factor: 1e-7 }] });
unitConvTool({ file: "calc-data-rate-converter.html", title: "数据速率换算", desc: "bps、Kbps、Mbps、Gbps、Tbps 互转。", tags: ["速率", "单位", "换算"], order: 1588, fromLabel: "从", toLabel: "到", units: [{ name: "bps", factor: 1 }, { name: "Kbps", factor: 1e3 }, { name: "Mbps", factor: 1e6 }, { name: "Gbps", factor: 1e9 }, { name: "Tbps", factor: 1e12 }] });
unitConvTool({ file: "calc-illuminance-converter.html", title: "照度换算", desc: "lux、foot-candle、phot 互转。", tags: ["照度", "单位", "换算"], order: 1589, fromLabel: "从", toLabel: "到", units: [{ name: "lux", factor: 1 }, { name: "foot-candle", factor: 10.763910416709724 }, { name: "phot", factor: 10000 }] });
unitConvTool({ file: "calc-acceleration-converter.html", title: "加速度换算", desc: "m/s²、g、ft/s² 互转。", tags: ["加速度", "单位", "换算"], order: 1590, fromLabel: "从", toLabel: "到", units: [{ name: "m/s²", factor: 1 }, { name: "g", factor: 9.80665 }, { name: "ft/s²", factor: 0.3048 }] });
unitConvTool({ file: "calc-volume-flow-converter.html", title: "体积流量换算", desc: "m³/s、L/s、L/min、m³/h、gpm 互转。", tags: ["流量", "单位", "换算"], order: 1591, fromLabel: "从", toLabel: "到", units: [{ name: "m³/s", factor: 1 }, { name: "L/s", factor: 0.001 }, { name: "L/min", factor: 1.6666666666666667e-5 }, { name: "m³/h", factor: 2.777777777777778e-4 }, { name: "gpm", factor: 6.309019640512051e-5 }] });
unitConvTool({ file: "calc-typography-converter.html", title: "字号换算", desc: "px、pt、em、rem、% 互转（基准 16px）。", tags: ["字号", "单位", "换算"], order: 1592, fromLabel: "从", toLabel: "到", units: [{ name: "px", factor: 1 }, { name: "pt", factor: 1.3333333333333333 }, { name: "em", factor: 16 }, { name: "rem", factor: 16 }, { name: "%", factor: 0.16 }] });
calcTool({ file: "calc-megapixel.html", title: "像素转百万像素", desc: "按宽高像素计算百万像素（MP）。", tags: ["像素", "分辨率", "计算"], order: 1593, fields: [{ id: "w", label: "宽度 px", type: "number", value: 1920 }, { id: "h", label: "高度 px", type: "number", value: 1080 }], outputs: [{ id: "mp", label: "百万像素 MP" }], compute: function (args) { return { mp: args.w * args.h / 1e6 }; } });
calcTool({ file: "calc-pixel-to-cm.html", title: "像素转厘米", desc: "按 DPI 把像素长度换算为厘米。", tags: ["像素", "长度", "换算"], order: 1594, fields: [{ id: "px", label: "像素", type: "number", value: 300 }, { id: "dpi", label: "DPI", type: "number", value: 96 }], outputs: [{ id: "cm", label: "厘米" }], compute: function (args) { return { cm: args.px * 2.54 / args.dpi }; } });
calcTool({ file: "calc-bytes-to-mb.html", title: "字节换算", desc: "把字节数换算为 MB 与 GB。", tags: ["字节", "存储", "换算"], order: 1595, fields: [{ id: "bytes", label: "字节数", type: "number", value: 1048576 }], outputs: [{ id: "mb", label: "MB" }, { id: "gb", label: "GB" }], compute: function (args) { return { mb: args.bytes / 1048576, gb: args.bytes / 1073741824 }; } });
calcTool({ file: "calc-time-parse.html", title: "秒数拆解", desc: "把总秒数拆解为时、分、秒。", tags: ["时间", "拆解", "计算"], order: 1596, fields: [{ id: "sec", label: "秒数", type: "number", value: 3661 }], outputs: [{ id: "h", label: "时" }, { id: "m", label: "分" }, { id: "s", label: "秒" }], compute: function (args) { return { h: Math.floor(args.sec / 3600), m: Math.floor((args.sec % 3600) / 60), s: args.sec % 60 }; } });
calcTool({ file: "calc-percent-of.html", title: "求百分比值", desc: "计算某值的百分之多少。", tags: ["百分比", "计算"], order: 1597, fields: [{ id: "value", label: "基数", type: "number", value: 200 }, { id: "percent", label: "百分比 %", type: "number", value: 15 }], outputs: [{ id: "result", label: "结果" }], compute: function (args) { return { result: args.value * args.percent / 100 }; } });
calcTool({ file: "calc-percentage-increase.html", title: "增长率", desc: "计算从旧值到新值的增长百分比。", tags: ["百分比", "增长", "计算"], order: 1598, fields: [{ id: "v1", label: "原值", type: "number", value: 100 }, { id: "v2", label: "新值", type: "number", value: 130 }], outputs: [{ id: "pct", label: "增长率 %" }], compute: function (args) { return { pct: args.v1 ? (args.v2 - args.v1) / args.v1 * 100 : 0 }; } });
calcTool({ file: "calc-ratio-to-percent.html", title: "占比百分比", desc: "计算部分占整体的百分比。", tags: ["百分比", "占比", "计算"], order: 1599, fields: [{ id: "part", label: "部分", type: "number", value: 3 }, { id: "whole", label: "整体", type: "number", value: 4 }], outputs: [{ id: "pct", label: "百分比 %" }], compute: function (args) { return { pct: args.whole ? args.part / args.whole * 100 : 0 }; } });
calcTool({ file: "calc-percentage-difference.html", title: "百分比差异", desc: "计算两数的相对差异百分比。", tags: ["百分比", "差异", "计算"], order: 1600, fields: [{ id: "a", label: "数值 A", type: "number", value: 100 }, { id: "b", label: "数值 B", type: "number", value: 120 }], outputs: [{ id: "diff", label: "差异 %" }], compute: function (args) { return { diff: (args.a + args.b) / 2 ? Math.abs(args.a - args.b) / ((args.a + args.b) / 2) * 100 : 0 }; } });

// ---------- 工具类（新增 50 个）----------
textTool({ file: "util-password-strength.html", title: "密码强度检测", desc: "评估密码强度并给出改进建议。", category: "util", tags: ["密码", "强度", "安全"], order: 1701, fields: [{ id: "text", label: "密码", type: "text", value: "" }], transform: function (args) { var p = args.text; if (!p) return "请输入密码"; var score = 0; if (p.length >= 8) score++; if (p.length >= 12) score++; if (/[a-z]/.test(p)) score++; if (/[A-Z]/.test(p)) score++; if (/\d/.test(p)) score++; if (/[^a-zA-Z0-9]/.test(p)) score++; var labels = ["极弱", "弱", "中", "强", "很强", "极强"]; return "强度：" + labels[Math.min(score, 5)] + "（得分 " + score + "/6）" + (score < 3 ? " 建议加长并混合大小写、数字与符号" : ""); } });
textTool({ file: "util-password-entropy.html", title: "密码熵值", desc: "按字符空间估算密码的信息熵（比特）。", category: "util", tags: ["密码", "熵", "安全"], order: 1702, fields: [{ id: "text", label: "密码", type: "text", value: "" }], transform: function (args) { var p = args.text; if (!p) return "请输入密码"; var pool = 0; if (/[a-z]/.test(p)) pool += 26; if (/[A-Z]/.test(p)) pool += 26; if (/\d/.test(p)) pool += 10; if (/[^a-zA-Z0-9]/.test(p)) pool += 32; var bits = p.length * (Math.log(pool) / Math.log(2)); return "熵值：" + bits.toFixed(1) + " bit" + (bits >= 60 ? "（足够强）" : bits >= 40 ? "（可用）" : "（偏弱）"); } });
textTool({ file: "util-slugify.html", title: "URL  slug 化", desc: "把任意文本转换为适合 URL 的 slug。", category: "util", tags: ["slug", "URL", "文本"], order: 1703, fields: [{ id: "text", label: "文本", type: "textarea", rows: 4, placeholder: "Hello 世界 World!" }], transform: function (args) { var s = args.text.toLowerCase().trim().replace(/[\u4e00-\u9fff]/g, function (m) { return ""; }).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); return s || "（无可转换字符）"; } });
textTool({ file: "util-extract-numbers-sum.html", title: "文本数字求和", desc: "提取文本中所有数字并求和。", category: "util", tags: ["数字", "求和", "文本"], order: 1704, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "收入 1200 支出 350 结余 850" }], transform: function (args) { var m = args.text.match(/-?\d+(\.\d+)?/g); if (!m) return "未发现数字"; var sum = 0; m.forEach(function (x) { sum += parseFloat(x); }); return "共 " + m.length + " 个数字，合计 " + sum; } });
textTool({ file: "util-chinese-to-number.html", title: "中文数字转阿拉伯", desc: "把中文数字（如 一千二百三十四）转为阿拉伯数字。", category: "util", tags: ["中文", "数字", "转换"], order: 1705, fields: [{ id: "text", label: "中文数字", type: "text", value: "一千二百三十四" }], transform: function (args) { var map = { 零: 0, 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10, 百: 100, 千: 1000, 万: 10000, 亿: 100000000 }; var total = 0, section = 0, num = 0; for (var i = 0; i < args.text.length; i++) { var ch = args.text[i]; if (map[ch] === undefined) continue; if (map[ch] < 10) num = map[ch]; else if (map[ch] < 10000) { section += (num || 1) * map[ch]; num = 0; } else { total += (section + num) * map[ch]; section = 0; num = 0; } } return String(total + section + num); } });
textTool({ file: "util-number-to-words-en.html", title: "数字转英文单词", desc: "把整数转换为英文读法。", category: "util", tags: ["数字", "英文", "转换"], order: 1706, fields: [{ id: "text", label: "整数", type: "text", value: "12345" }], transform: function (args) { var n = Math.floor(Math.abs(parseFloat(args.text))); if (isNaN(n)) return "请输入整数"; var ones = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"]; var tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"]; function h2(n) { if (n < 20) return ones[n]; var t = Math.floor(n / 10); var o = n % 10; return tens[t] + (o ? "-" + ones[o] : ""); } function h3(n) { if (n < 100) return h2(n); var h = Math.floor(n / 100); var r = n % 100; return ones[h] + " hundred" + (r ? " " + h2(r) : ""); } function big(n) { if (n < 1000) return h3(n); var groups = [{ v: 1e9, w: "billion" }, { v: 1e6, w: "million" }, { v: 1e3, w: "thousand" }]; for (var i = 0; i < groups.length; i++) { if (n >= groups[i].v) { var q = Math.floor(n / groups[i].v); var rem = n % groups[i].v; return big(q) + " " + groups[i].w + (rem ? " " + big(rem) : ""); } } return h3(n); } return (parseFloat(args.text) < 0 ? "negative " : "") + big(n); } });
textTool({ file: "util-number-to-rmb.html", title: "人民币大写", desc: "把金额转换为人民币大写（如壹仟贰佰叁拾肆元伍角陆分）。", category: "util", tags: ["金额", "大写", "财务"], order: 1707, fields: [{ id: "text", label: "金额", type: "text", value: "1234.56" }], transform: function (args) { var n = parseFloat(args.text); if (isNaN(n)) return "请输入金额"; var dig = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"]; var unit = ["", "拾", "佰", "仟"]; var group = ["", "万", "亿", "兆"]; function intToCN(x) { if (x === 0) return "零"; var s = "", g = 0; while (x > 0) { var part = x % 10000; var p = ""; var zero = false; var pu = 0; while (part > 0) { var d = part % 10; if (d === 0) { zero = true; } else { if (zero) { p = dig[0] + p; zero = false; } p = dig[d] + unit[pu] + p; } part = Math.floor(part / 10); pu++; } if (p === "") p = dig[0]; s = p + group[g] + s; x = Math.floor(x / 10000); g++; } return s; } var intPart = Math.floor(n); var dec = Math.round((n - intPart) * 100); var jiao = Math.floor(dec / 10), fen = dec % 10; var res = intToCN(intPart) + "元"; if (jiao === 0 && fen === 0) res += "整"; else { res += jiao ? dig[jiao] + "角" : (fen ? "零" : ""); res += fen ? dig[fen] + "分" : ""; } return res; } });
textTool({ file: "util-color-rgb-to-hsl.html", title: "RGB 转 HSL", desc: "把 RGB 颜色转换为 HSL。", category: "util", tags: ["颜色", "转换", "开发"], order: 1708, fields: [{ id: "r", label: "R", type: "number", value: 51 }, { id: "g", label: "G", type: "number", value: 102 }, { id: "b", label: "B", type: "number", value: 204 }], transform: function (args) { var r = args.r / 255, g = args.g / 255, b = args.b / 255; var max = Math.max(r, g, b), min = Math.min(r, g, b); var h, s, l = (max + min) / 2; if (max === min) { h = s = 0; } else { var d = max - min; s = l > 0.5 ? d / (2 - max - min) : d / (max + min); switch (max) { case r: h = (g - b) / d + (g < b ? 6 : 0); break; case g: h = (b - r) / d + 2; break; default: h = (r - g) / d + 4; } h /= 6; } return "H: " + Math.round(h * 360) + "  S: " + Math.round(s * 100) + "%  L: " + Math.round(l * 100) + "%"; } });
textTool({ file: "util-color-hsl-to-rgb.html", title: "HSL 转 RGB", desc: "把 HSL 颜色转换为 RGB。", category: "util", tags: ["颜色", "转换", "开发"], order: 1709, fields: [{ id: "h", label: "H (0-360)", type: "number", value: 210 }, { id: "s", label: "S (%)", type: "number", value: 60 }, { id: "l", label: "L (%)", type: "number", value: 50 }], transform: function (args) { var h = args.h / 360, s = args.s / 100, l = args.l / 100, r, g, b; if (s === 0) { r = g = b = l; } else { function f(p, q, t) { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; } var q = l < 0.5 ? l * (1 + s) : l + s - l * s; var p = 2 * l - q; r = f(p, q, h + 1 / 3); g = f(p, q, h); b = f(p, q, h - 1 / 3); } function H(n) { var s = Math.round(n * 255).toString(16); return s.length < 2 ? "0" + s : s; } return "R: " + Math.round(r * 255) + "  G: " + Math.round(g * 255) + "  B: " + Math.round(b * 255) + "  #" + H(r * 255) + H(g * 255) + H(b * 255); } });
textTool({ file: "util-color-complement.html", title: "互补色", desc: "计算给定颜色的互补色（色相 +180）。", category: "util", tags: ["颜色", "配色", "设计"], order: 1710, fields: [{ id: "hex", label: "颜色", type: "text", value: "#3366cc" }], transform: function (args) { function ph(x) { x = x.replace("#", ""); if (x.length === 3) x = x.split("").map(function (y) { return y + y; }).join(""); return [parseInt(x.slice(0, 2), 16), parseInt(x.slice(2, 4), 16), parseInt(x.slice(4, 6), 16)]; } function hsl(c) { var r = c[0] / 255, g = c[1] / 255, b = c[2] / 255; var max = Math.max(r, g, b), min = Math.min(r, g, b); var h, s, l = (max + min) / 2; if (max === min) h = s = 0; else { var d = max - min; s = l > 0.5 ? d / (2 - max - min) : d / (max + min); if (max === r) h = (g - b) / d; else if (max === g) h = (b - r) / d + 2; else h = (r - g) / d + 4; h = (h * 60 + 360) % 360; } return [h, s, l]; } function rgbOf(h, s, l) { h /= 360; if (s === 0) { var v = Math.round(l * 255); return [v, v, v]; } function f(p, q, t) { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; } var q = l < 0.5 ? l * (1 + s) : l + s - l * s; var p = 2 * l - q; return [Math.round(f(p, q, h + 1 / 3) * 255), Math.round(f(p, q, h) * 255), Math.round(f(p, q, h - 1 / 3) * 255)]; } function H(n) { var s = Math.round(n).toString(16); return s.length < 2 ? "0" + s : s; } var c = ph(args.hex); var hslc = hsl(c); var comp = rgbOf((hslc[0] + 180) % 360, hslc[1], hslc[2]); return "#" + H(comp[0]) + H(comp[1]) + H(comp[2]); } });
textTool({ file: "util-color-triadic.html", title: "三角配色", desc: "生成基于色相 ±120 的三角配色方案。", category: "util", tags: ["颜色", "配色", "设计"], order: 1711, fields: [{ id: "hex", label: "基础色", type: "text", value: "#3366cc" }], transform: function (args) { function ph(x) { x = x.replace("#", ""); if (x.length === 3) x = x.split("").map(function (y) { return y + y; }).join(""); return [parseInt(x.slice(0, 2), 16), parseInt(x.slice(2, 4), 16), parseInt(x.slice(4, 6), 16)]; } function hsl(c) { var r = c[0] / 255, g = c[1] / 255, b = c[2] / 255; var max = Math.max(r, g, b), min = Math.min(r, g, b); var h, s, l = (max + min) / 2; if (max === min) h = s = 0; else { var d = max - min; s = l > 0.5 ? d / (2 - max - min) : d / (max + min); if (max === r) h = (g - b) / d; else if (max === g) h = (b - r) / d + 2; else h = (r - g) / d + 4; h = (h * 60 + 360) % 360; } return [h, s, l]; } function rgbOf(h, s, l) { h /= 360; if (s === 0) { var v = Math.round(l * 255); return [v, v, v]; } function f(p, q, t) { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; } var q = l < 0.5 ? l * (1 + s) : l + s - l * s; var p = 2 * l - q; return [Math.round(f(p, q, h + 1 / 3) * 255), Math.round(f(p, q, h) * 255), Math.round(f(p, q, h - 1 / 3) * 255)]; } function H(n) { var s = Math.round(n).toString(16); return s.length < 2 ? "0" + s : s; } var hslc = hsl(ph(args.hex)); var a = rgbOf((hslc[0] + 120) % 360, hslc[1], hslc[2]); var b = rgbOf((hslc[0] + 240) % 360, hslc[1], hslc[2]); return "#" + H(a[0]) + H(a[1]) + H(a[2]) + "\n#" + H(b[0]) + H(b[1]) + H(b[2]); } });
textTool({ file: "util-color-analogous.html", title: "邻近配色", desc: "生成基于色相 ±30 的邻近配色方案。", category: "util", tags: ["颜色", "配色", "设计"], order: 1712, fields: [{ id: "hex", label: "基础色", type: "text", value: "#3366cc" }], transform: function (args) { function ph(x) { x = x.replace("#", ""); if (x.length === 3) x = x.split("").map(function (y) { return y + y; }).join(""); return [parseInt(x.slice(0, 2), 16), parseInt(x.slice(2, 4), 16), parseInt(x.slice(4, 6), 16)]; } function hsl(c) { var r = c[0] / 255, g = c[1] / 255, b = c[2] / 255; var max = Math.max(r, g, b), min = Math.min(r, g, b); var h, s, l = (max + min) / 2; if (max === min) h = s = 0; else { var d = max - min; s = l > 0.5 ? d / (2 - max - min) : d / (max + min); if (max === r) h = (g - b) / d; else if (max === g) h = (b - r) / d + 2; else h = (r - g) / d + 4; h = (h * 60 + 360) % 360; } return [h, s, l]; } function rgbOf(h, s, l) { h /= 360; if (s === 0) { var v = Math.round(l * 255); return [v, v, v]; } function f(p, q, t) { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; } var q = l < 0.5 ? l * (1 + s) : l + s - l * s; var p = 2 * l - q; return [Math.round(f(p, q, h + 1 / 3) * 255), Math.round(f(p, q, h) * 255), Math.round(f(p, q, h - 1 / 3) * 255)]; } function H(n) { var s = Math.round(n).toString(16); return s.length < 2 ? "0" + s : s; } var hslc = hsl(ph(args.hex)); var a = rgbOf((hslc[0] + 30) % 360, hslc[1], hslc[2]); var b = rgbOf((hslc[0] + 330) % 360, hslc[1], hslc[2]); return "#" + H(a[0]) + H(a[1]) + H(a[2]) + "\n#" + H(b[0]) + H(b[1]) + H(b[2]); } });
textTool({ file: "util-color-tint-shade.html", title: "明暗阶调", desc: "生成颜色的一组加白（tint）与加黑（shade）。", category: "util", tags: ["颜色", "阶调", "设计"], order: 1713, fields: [{ id: "hex", label: "基础色", type: "text", value: "#3366cc" }, { id: "n", label: "阶数", type: "number", value: 4, min: 1, max: 8 }], transform: function (args) { function ph(x) { x = x.replace("#", ""); if (x.length === 3) x = x.split("").map(function (y) { return y + y; }).join(""); return [parseInt(x.slice(0, 2), 16), parseInt(x.slice(2, 4), 16), parseInt(x.slice(4, 6), 16)]; } function H(n) { var s = Math.max(0, Math.min(255, Math.round(n))).toString(16); return s.length < 2 ? "0" + s : s; } var c = ph(args.hex); var out = []; for (var i = 0; i < args.n; i++) { var f = i / args.n; out.push("#" + H(c[0] + (255 - c[0]) * f) + H(c[1] + (255 - c[1]) * f) + H(c[2] + (255 - c[2]) * f)); } out.push(args.hex); for (var j = 1; j <= args.n; j++) { var g = j / args.n; out.push("#" + H(c[0] * (1 - g)) + H(c[1] * (1 - g)) + H(c[2] * (1 - g))); } return out.join("\n"); } });
textTool({ file: "util-contrast-ratio.html", title: "对比度计算", desc: "计算两种颜色之间的 WCAG 对比度。", category: "util", tags: ["颜色", "对比度", "无障碍"], order: 1714, fields: [{ id: "c1", label: "颜色 1", type: "text", value: "#ffffff" }, { id: "c2", label: "颜色 2", type: "text", value: "#3366cc" }], transform: function (args) { function L(hex) { hex = hex.replace("#", ""); if (hex.length === 3) hex = hex.split("").map(function (x) { return x + x; }).join(""); var r = parseInt(hex.slice(0, 2), 16) / 255, g = parseInt(hex.slice(2, 4), 16) / 255, b = parseInt(hex.slice(4, 6), 16) / 255; var f = function (x) { return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); } var l1 = L(args.c1), l2 = L(args.c2); var hi = Math.max(l1, l2), lo = Math.min(l1, l2); var ratio = (hi + 0.05) / (lo + 0.05); return "对比度：" + ratio.toFixed(2) + ":1 " + (ratio >= 4.5 ? "（正文达标）" : ratio >= 3 ? "（大字达标）" : "（不达标）"); } });
textTool({ file: "util-date-format.html", title: "日期格式化", desc: "按自定义格式输出日期（支持 YYYY MM DD HH mm ss 星期）。", category: "util", tags: ["日期", "格式化", "工具"], order: 1715, fields: [{ id: "date", label: "日期", type: "date", value: "2026-10-30" }, { id: "fmt", label: "格式（YYYY-MM-DD HH:mm:ss 星期）", type: "text", value: "YYYY-MM-DD HH:mm:ss" }], transform: function (args) { var d = new Date(args.date); if (isNaN(d)) return "日期无效"; var w = ["日", "一", "二", "三", "四", "五", "六"][d.getDay()]; var map = { YYYY: d.getFullYear(), MM: ("0" + (d.getMonth() + 1)).slice(-2), DD: ("0" + d.getDate()).slice(-2), HH: ("0" + d.getHours()).slice(-2), mm: ("0" + d.getMinutes()).slice(-2), ss: ("0" + d.getSeconds()).slice(-2), 星期: "星期" + w }; var s = args.fmt; Object.keys(map).forEach(function (k) { s = s.split(k).join(map[k]); }); return s; } });
genTool({ file: "util-password-generator.html", title: "强密码生成器", desc: "生成可定制长度的强密码，支持大小写、数字与符号。", tags: ["密码", "生成", "安全"], order: 1716, fields: [{ id: "len", label: "长度", type: "number", value: 16, min: 4, max: 64 }, { id: "upper", label: "含大写", type: "checkbox", checked: true }, { id: "lower", label: "含小写", type: "checkbox", checked: true }, { id: "digit", label: "含数字", type: "checkbox", checked: true }, { id: "sym", label: "含符号", type: "checkbox", checked: true }], gen: function (args) { var a = ""; if (args.upper) a += "ABCDEFGHJKLMNPQRSTUVWXYZ"; if (args.lower) a += "abcdefghijkmnpqrstuvwxyz"; if (args.digit) a += "23456789"; if (args.sym) a += "!@#$%^&*()-_=+"; if (!a) a = "abcdefghijklmnopqrstuvwxyz"; var s = ""; for (var i = 0; i < args.len; i++) s += a[Math.floor(Math.random() * a.length)]; return s; } });
genTool({ file: "util-random-mac.html", title: "随机 MAC 地址", desc: "生成随机的 MAC 地址。", tags: ["MAC", "网络", "随机"], order: 1717, gen: function () { var h = "0123456789abcdef"; var s = []; for (var i = 0; i < 6; i++) { var p = h[Math.floor(Math.random() * 16)] + h[Math.floor(Math.random() * 16)]; s.push(p); } return s.join(":"); } });
genTool({ file: "util-random-port.html", title: "随机端口号", desc: "生成 1024-65535 之间的随机端口。", tags: ["端口", "网络", "随机"], order: 1718, gen: function () { return String(1024 + Math.floor(Math.random() * (65535 - 1024))); } });
genTool({ file: "util-random-hsl.html", title: "随机 HSL 颜色", desc: "生成随机的 HSL 颜色。", tags: ["颜色", "随机", "设计"], order: 1719, gen: function () { var h = Math.floor(Math.random() * 360), s = 40 + Math.floor(Math.random() * 50), l = 35 + Math.floor(Math.random() * 35); return "hsl(" + h + ", " + s + "%, " + l + "%)"; } });
genTool({ file: "util-palette-generator.html", title: "调色板生成器", desc: "基于随机基色生成协调的 5 色调色板。", tags: ["调色板", "颜色", "设计"], order: 1720, fields: [{ id: "n", label: "颜色数量", type: "number", value: 5, min: 2, max: 8 }], gen: function (args) { var base = Math.floor(Math.random() * 360); var out = []; for (var i = 0; i < args.n; i++) { var h = (base + i * (360 / args.n)) % 360; var s = 60 + Math.floor(Math.random() * 25); var l = 40 + Math.floor(Math.random() * 30); out.push("hsl(" + Math.round(h) + ", " + s + "%, " + l + "%)"); } return out.join("\n"); } });
genTool({ file: "util-gradient-generator.html", title: "渐变 CSS 生成", desc: "生成随机双色线性渐变 CSS。", tags: ["渐变", "CSS", "设计"], order: 1721, gen: function () { function hex() { var h = "0123456789abcdef"; var s = "#"; for (var i = 0; i < 6; i++) s += h[Math.floor(Math.random() * 16)]; return s; } var a = hex(), b = hex(), ang = Math.floor(Math.random() * 360); return "background: linear-gradient(" + ang + "deg, " + a + ", " + b + ");"; } });
genTool({ file: "util-placeholder-svg.html", title: "占位图 SVG", desc: "生成可自定义的占位图 SVG（含尺寸与文字）。", tags: ["占位图", "SVG", "设计"], order: 1722, fields: [{ id: "w", label: "宽度", type: "number", value: 300 }, { id: "h", label: "高度", type: "number", value: 200 }, { id: "text", label: "文字", type: "text", value: "Placeholder" }], gen: function (args) { var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + args.w + '" height="' + args.h + '"><rect width="100%" height="100%" fill="#e2e8f0"/><text x="50%" y="50%" font-family="sans-serif" font-size="20" fill="#64748b" text-anchor="middle" dominant-baseline="middle">' + args.text + '</text></svg>'; return "data:image/svg+xml;utf8," + encodeURIComponent(svg); } });
genTool({ file: "util-random-avatar.html", title: "随机头像 SVG", desc: "生成带随机首字母与底色的 SVG 头像。", tags: ["头像", "SVG", "随机"], order: 1723, fields: [{ id: "initial", label: "首字母", type: "text", value: "A" }], gen: function (args) { var h = "0123456789abcdef"; var c = "#"; for (var i = 0; i < 6; i++) c += h[Math.floor(Math.random() * 16)]; var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" rx="60" fill="' + c + '"/><text x="50%" y="50%" font-family="sans-serif" font-size="56" fill="#fff" text-anchor="middle" dominant-baseline="central">' + (args.initial || "A") + '</text></svg>'; return "data:image/svg+xml;utf8," + encodeURIComponent(svg); } });
genTool({ file: "util-fake-email.html", title: "随机邮箱", desc: "生成用于测试的随机邮箱地址。", tags: ["邮箱", "随机", "测试"], order: 1724, gen: function () { var n = "abcdefghijklmnopqrstuvwxyz"; var u = ""; for (var i = 0; i < 8; i++) u += n[Math.floor(Math.random() * 26)]; var d = ["example.com", "test.org", "mail.net", "demo.io"][Math.floor(Math.random() * 4)]; return u + "@" + d; } });
genTool({ file: "util-fake-phone.html", title: "随机手机号", desc: "生成中国大陆格式随机手机号。", tags: ["手机号", "随机", "测试"], order: 1725, gen: function () { var pre = ["138", "139", "150", "151", "186", "187", "188", "199"][Math.floor(Math.random() * 8)]; var s = pre; for (var i = 0; i < 8; i++) s += Math.floor(Math.random() * 10); return s; } });
genTool({ file: "util-fake-name-cn.html", title: "随机中文姓名", desc: "生成随机的中文姓名。", tags: ["姓名", "随机", "测试"], order: 1726, gen: function () { var surnames = "王李张刘陈杨黄赵周吴徐孙马朱胡郭何高林"; var given = ["伟", "芳", "娜", "敏", "静", "丽", "强", "磊", "军", "洋", "勇", "艳", "杰", "娟", "涛", "明", "超", "霞", "平", "刚"]; var s = surnames[Math.floor(Math.random() * surnames.length)]; var len = Math.random() < 0.5 ? 1 : 2; for (var i = 0; i < len; i++) s += given[Math.floor(Math.random() * given.length)]; return s; } });
genTool({ file: "util-fake-company.html", title: "随机公司名", desc: "生成随机的公司名称。", tags: ["公司", "随机", "测试"], order: 1727, gen: function () { var pre = ["星辰", "云图", "智联", "环球", "未来", "新元", "海纳", "博远", "天工", "万象"]; var core = ["科技", "信息", "网络", "数据", "智能", "电子", "软件", "传媒"]; var suf = ["有限公司", "股份有限公司", "集团", "工作室"]; return pre[Math.floor(Math.random() * pre.length)] + core[Math.floor(Math.random() * core.length)] + suf[Math.floor(Math.random() * suf.length)]; } });
genTool({ file: "util-fake-city.html", title: "随机城市", desc: "从常见城市中随机选择一个。", tags: ["城市", "随机", "测试"], order: 1728, gen: function () { var cities = ["北京", "上海", "广州", "深圳", "杭州", "成都", "武汉", "南京", "西安", "重庆", "苏州", "天津", "青岛", "厦门", "长沙", "郑州"]; return cities[Math.floor(Math.random() * cities.length)]; } });
genTool({ file: "util-fake-address.html", title: "随机地址", desc: "生成随机的邮寄地址。", tags: ["地址", "随机", "测试"], order: 1729, gen: function () { var cities = ["北京", "上海", "广州", "深圳", "杭州", "成都"]; var roads = ["人民路", "中山路", "建设大街", "科技大道", "和平路", "解放路"]; var city = cities[Math.floor(Math.random() * cities.length)]; var road = roads[Math.floor(Math.random() * roads.length)]; var no = 1 + Math.floor(Math.random() * 999); return city + "市" + road + " " + no + " 号"; } });
genTool({ file: "util-fake-card.html", title: "测试卡号 (Luhn)", desc: "生成通过 Luhn 校验的测试用卡号。", tags: ["卡号", "Luhn", "测试"], order: 1730, gen: function () { var prefix = ["4", "51", "52", "6011", "34"][Math.floor(Math.random() * 5)]; var len = prefix === "34" ? 15 : 16; var digits = prefix.split("").map(Number); while (digits.length < len - 1) digits.push(Math.floor(Math.random() * 10)); var sum = 0; for (var i = digits.length - 1; i >= 0; i--) { var d = digits[i]; if ((digits.length - 1 - i) % 2 === 1) { d *= 2; if (d > 9) d -= 9; } sum += d; } var check = (10 - (sum % 10)) % 10; digits.push(check); return digits.join(""); } });
genTool({ file: "util-fake-url.html", title: "随机网址", desc: "生成随机的示例网址。", tags: ["URL", "随机", "测试"], order: 1731, gen: function () { var sub = ["www", "app", "blog", "api", "go"]; var name = ["demo", "sample", "test", "myapp", "site", "web"]; var tld = ["com", "org", "net", "io", "cn"]; return "https://" + sub[Math.floor(Math.random() * sub.length)] + "." + name[Math.floor(Math.random() * name.length)] + "." + tld[Math.floor(Math.random() * tld.length)]; } });
genTool({ file: "util-random-useragent.html", title: "随机 User-Agent", desc: "从常见 UA 列表中随机选取一个。", tags: ["UA", "随机", "测试"], order: 1732, gen: function () { var uas = ["Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15", "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0", "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1", "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36"]; return uas[Math.floor(Math.random() * uas.length)]; } });
genTool({ file: "util-random-latlon.html", title: "随机经纬度", desc: "生成随机的经纬度坐标。", tags: ["坐标", "随机", "地图"], order: 1733, gen: function () { var lat = (Math.random() * 180 - 90).toFixed(6); var lon = (Math.random() * 360 - 180).toFixed(6); return lat + ", " + lon; } });
genTool({ file: "util-random-bytes.html", title: "随机字节 (Hex)", desc: "生成随机十六进制字节串。", tags: ["字节", "随机", "测试"], order: 1734, fields: [{ id: "n", label: "字节数", type: "number", value: 16, min: 1, max: 256 }], gen: function (args) { var h = "0123456789abcdef"; var s = ""; for (var i = 0; i < args.n * 2; i++) s += h[Math.floor(Math.random() * 16)]; return s; } });
genTool({ file: "util-random-base64.html", title: "随机 Base64", desc: "生成随机的 Base64 字符串。", tags: ["Base64", "随机", "测试"], order: 1735, fields: [{ id: "n", label: "字节数", type: "number", value: 16, min: 1, max: 256 }], gen: function (args) { var bytes = []; for (var i = 0; i < args.n; i++) bytes.push(Math.floor(Math.random() * 256)); var bin = ""; bytes.forEach(function (b) { bin += String.fromCharCode(b); }); return btoa(bin); } });
genTool({ file: "util-random-word.html", title: "随机单词", desc: "从常用词表中随机取词（适合占位）。", tags: ["单词", "随机", "占位"], order: 1736, gen: function () { var words = ["lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "tempor", "magna", "aliqua", "enim", "minim", "veniam", "quis"]; return words[Math.floor(Math.random() * words.length)]; } });
genTool({ file: "util-random-sentence.html", title: "随机句子", desc: "用随机单词拼出一句占位文本。", tags: ["句子", "随机", "占位"], order: 1737, fields: [{ id: "n", label: "单词数", type: "number", value: 8, min: 2, max: 30 }], gen: function (args) { var words = ["lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "tempor", "magna", "aliqua", "enim", "minim", "veniam", "quis", "nostrud", "nulla"]; var s = []; for (var i = 0; i < args.n; i++) s.push(words[Math.floor(Math.random() * words.length)]); return s.join(" ") + "."; } });
genTool({ file: "util-lorem-paragraphs.html", title: "Lorem 段落", desc: "生成若干段 Lorem ipsum 占位段落。", tags: ["Lorem", "占位", "文本"], order: 1738, fields: [{ id: "n", label: "段落数", type: "number", value: 3, min: 1, max: 10 }], gen: function (args) { var base = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."; var out = []; for (var i = 0; i < args.n; i++) out.push(base); return out.join("\n\n"); } });
genTool({ file: "util-dice-roller.html", title: "骰子投掷", desc: "选择面数（d4-d20）并投掷。", tags: ["骰子", "随机", "游戏"], order: 1739, fields: [{ id: "sides", label: "面数", type: "select", options: ["4", "6", "8", "10", "12", "20"] }, { id: "count", label: "数量", type: "number", value: 1, min: 1, max: 10 }], gen: function (args) { var s = []; for (var i = 0; i < args.count; i++) s.push(1 + Math.floor(Math.random() * parseInt(args.sides))); return "结果：" + s.join(", ") + "（合计 " + s.reduce(function (a, b) { return a + b; }, 0) + "）"; } });
genTool({ file: "util-prime-generator.html", title: "质数生成器", desc: "生成前 N 个质数。", tags: ["质数", "数论", "生成"], order: 1740, fields: [{ id: "n", label: "个数", type: "number", value: 20, min: 1, max: 500 }], gen: function (args) { var primes = [], cand = 2; while (primes.length < args.n) { var ok = true; for (var i = 0; i < primes.length && primes[i] * primes[i] <= cand; i++) if (cand % primes[i] === 0) { ok = false; break; } if (ok) primes.push(cand); cand++; } return primes.join(", "); } });
genTool({ file: "util-fibonacci-sequence.html", title: "斐波那契序列", desc: "生成前 N 项斐波那契数。", tags: ["斐波那契", "数列", "生成"], order: 1741, fields: [{ id: "n", label: "项数", type: "number", value: 20, min: 1, max: 80 }], gen: function (args) { var a = 0, b = 1, out = []; for (var i = 0; i < args.n; i++) { out.push(a); var t = a + b; a = b; b = t; } return out.join(", "); } });
genTool({ file: "util-random-prime.html", title: "随机质数", desc: "在指定范围内生成随机质数。", tags: ["质数", "随机", "数论"], order: 1742, fields: [{ id: "max", label: "上限", type: "number", value: 1000, min: 10, max: 100000 }], gen: function (args) { function isPrime(n) { if (n < 2) return false; for (var i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; } var n; do { n = 2 + Math.floor(Math.random() * (args.max - 2)); } while (!isPrime(n)); return String(n); } });
genTool({ file: "util-random-date.html", title: "随机日期", desc: "在起止日期之间生成随机日期。", tags: ["日期", "随机", "生成"], order: 1743, fields: [{ id: "from", label: "起始", type: "date", value: "2020-01-01" }, { id: "to", label: "结束", type: "date", value: "2026-12-31" }], gen: function (args) { var a = new Date(args.from).getTime(), b = new Date(args.to).getTime(); if (b < a) return "日期范围无效"; var t = a + Math.floor(Math.random() * (b - a)); return new Date(t).toISOString().slice(0, 10); } });
genTool({ file: "util-random-time.html", title: "随机时间", desc: "生成随机的时分秒。", tags: ["时间", "随机", "生成"], order: 1744, gen: function () { var p = function (n) { return ("0" + n).slice(-2); }; return p(Math.floor(Math.random() * 24)) + ":" + p(Math.floor(Math.random() * 60)) + ":" + p(Math.floor(Math.random() * 60)); } });
genTool({ file: "util-project-codename.html", title: "项目代号生成", desc: "生成形如 red-falcon 的项目代号。", tags: ["代号", "随机", "项目"], order: 1745, gen: function () { var adj = ["red", "blue", "silent", "swift", "crimson", "golden", "hidden", "nova", "iron", "azure", "bold", "calm"]; var noun = ["falcon", "tiger", "phoenix", "river", "comet", "wolf", "ocean", "storm", "maple", "eagle", "lotus", "summit"]; return adj[Math.floor(Math.random() * adj.length)] + "-" + noun[Math.floor(Math.random() * noun.length)]; } });
genTool({ file: "util-random-otp.html", title: "随机验证码", desc: "生成 6 位随机数字验证码。", tags: ["验证码", "随机", "安全"], order: 1746, gen: function () { var s = ""; for (var i = 0; i < 6; i++) s += Math.floor(Math.random() * 10); return s; } });
genTool({ file: "util-current-timestamp.html", title: "当前时间戳", desc: "一键获取当前 Unix 时间戳与 ISO 时间。", tags: ["时间戳", "时间", "工具"], order: 1747, gen: function () { var n = Date.now(); return "Unix(ms): " + n + "\nUnix(s): " + Math.floor(n / 1000) + "\nISO: " + new Date().toISOString(); } });
genTool({ file: "util-random-hex-colors.html", title: "随机颜色批量", desc: "一次生成多个随机十六进制颜色。", tags: ["颜色", "随机", "批量"], order: 1748, fields: [{ id: "n", label: "数量", type: "number", value: 6, min: 1, max: 20 }], gen: function (args) { var h = "0123456789abcdef"; var out = []; for (var i = 0; i < args.n; i++) { var s = "#"; for (var j = 0; j < 6; j++) s += h[Math.floor(Math.random() * 16)]; out.push(s); } return out.join("\n"); } });
genTool({ file: "util-uuid-batch.html", title: "UUID 批量生成", desc: "一次生成多个随机 UUID v4。", tags: ["UUID", "随机", "批量"], order: 1749, fields: [{ id: "n", label: "数量", type: "number", value: 5, min: 1, max: 50 }], gen: function (args) { function uuid() { var b = []; for (var i = 0; i < 16; i++) b.push(Math.floor(Math.random() * 256)); b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80; var h = function (x) { var s = x.toString(16); return s.length < 2 ? "0" + s : s; }; return h(b[0]) + h(b[1]) + h(b[2]) + h(b[3]) + "-" + h(b[4]) + h(b[5]) + "-" + h(b[6]) + h(b[7]) + "-" + h(b[8]) + h(b[9]) + "-" + h(b[10]) + h(b[11]) + h(b[12]) + h(b[13]) + h(b[14]) + h(b[15]); } var out = []; for (var i = 0; i < args.n; i++) out.push(uuid()); return out.join("\n"); } });
genTool({ file: "util-random-boolean.html", title: "随机布尔", desc: "随机返回是 / 否，适合做决定。", tags: ["布尔", "随机", "决策"], order: 1750, gen: function () { return Math.random() < 0.5 ? "是" : "否"; } });

// ---------- 文本实用工具（扩充）----------
textTool({ file: "text-sort-lines-asc.html", title: "按字母排序行", desc: "把每行文本按 A→Z 排序，支持中文拼音排序。", category: "text", tags: ["排序", "行", "文本"], order: 2001, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "banana\nApple\n樱桃\ncherry" }], transform: function (args) { return args.text.split("\n").sort(function (a, b) { return a.localeCompare(b, "zh"); }).join("\n"); } });
textTool({ file: "text-sort-lines-desc.html", title: "逆字母排序行", desc: "把每行文本按 Z→A 排序。", category: "text", tags: ["排序", "行", "文本"], order: 2002, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "banana\nApple\n樱桃\ncherry" }], transform: function (args) { return args.text.split("\n").sort(function (a, b) { return b.localeCompare(a, "zh"); }).join("\n"); } });
textTool({ file: "text-sort-lines-numeric.html", title: "按数字排序行", desc: "按每行开头的数字大小排序。", category: "text", tags: ["排序", "数字", "行"], order: 2003, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "3. 苹果\n1. 香蕉\n20. 橙子" }], transform: function (args) { return args.text.split("\n").sort(function (a, b) { var na = parseFloat(a), nb = parseFloat(b); if (isNaN(na) && isNaN(nb)) return 0; if (isNaN(na)) return 1; if (isNaN(nb)) return -1; return na - nb; }).join("\n"); } });
textTool({ file: "text-dedup-lines.html", title: "行去重（保留首次）", desc: "删除重复行，仅保留第一次出现的行。", category: "text", tags: ["去重", "行", "文本"], order: 2004, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "apple\nbanana\napple\ncherry" }], transform: function (args) { var lines = args.text.split("\n"), seen = {}, out = []; lines.forEach(function (l) { if (!seen[l]) { seen[l] = 1; out.push(l); } }); return out.join("\n"); } });
textTool({ file: "text-dedup-lines-ci.html", title: "行去重（忽略大小写）", desc: "忽略大小写删除重复行，保留首次出现。", category: "text", tags: ["去重", "大小写", "行"], order: 2005, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "Apple\napple\nBANANA" }], transform: function (args) { var lines = args.text.split("\n"), seen = {}, out = []; lines.forEach(function (l) { var k = l.toLowerCase(); if (!seen[k]) { seen[k] = 1; out.push(l); } }); return out.join("\n"); } });
textTool({ file: "text-shuffle-lines.html", title: "随机打乱行", desc: "把行顺序随机重排，适合随机化列表。", category: "text", tags: ["打乱", "随机", "行"], order: 2006, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "一行\n二行\n三行\n四行" }], transform: function (args) { var lines = args.text.split("\n"); for (var i = lines.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = lines[i]; lines[i] = lines[j]; lines[j] = t; } return lines.join("\n"); } });
textTool({ file: "text-add-line-numbers.html", title: "添加行号", desc: "为每一行添加 1. 2. 3. 形式的行号。", category: "text", tags: ["行号", "编号", "文本"], order: 2007, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "第一行\n第二行" }], transform: function (args) { return args.text.split("\n").map(function (l, i) { return (i + 1) + ". " + l; }).join("\n"); } });
textTool({ file: "text-remove-line-numbers.html", title: "去除行号", desc: "移除每行开头的数字编号（如 1. 或 12)）。", category: "text", tags: ["行号", "清理", "文本"], order: 2008, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "1. 第一项\n2. 第二项" }], transform: function (args) { return args.text.split("\n").map(function (l) { return l.replace(/^\s*\d+[\.\)]\s*/, ""); }).join("\n"); } });
textTool({ file: "text-strip-html.html", title: "去除 HTML 标签", desc: "移除所有 HTML 标签并还原实体，仅保留纯文本。", category: "text", tags: ["HTML", "纯文本", "清洗"], order: 2009, fields: [{ id: "text", label: "HTML", type: "textarea", rows: 8, placeholder: "<p>你好 <b>世界</b></p>" }], transform: function (args) { var d = document.createElement("div"); d.innerHTML = args.text; return d.textContent; } });
textTool({ file: "text-extract-emails.html", title: "提取邮箱", desc: "从文本中提取所有电子邮件地址，每行一个。", category: "text", tags: ["邮箱", "提取", "正则"], order: 2010, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "联系 alice@example.com 或 bob@test.org" }], transform: function (args) { var m = args.text.match(/[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}/g); return m ? m.join("\n") : "（未找到邮箱）"; } });
textTool({ file: "text-extract-urls.html", title: "提取网址", desc: "从文本中提取所有 http/https 链接，每行一个。", category: "text", tags: ["URL", "提取", "链接"], order: 2011, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "访问 https://example.com 与 http://test.org/a" }], transform: function (args) { var m = args.text.match(/https?:\/\/[^\s"'<>]+/g); return m ? m.join("\n") : "（未找到网址）"; } });
textTool({ file: "text-extract-phones.html", title: "提取电话号码", desc: "从文本中提取疑似电话号码的数字串。", category: "text", tags: ["电话", "提取", "正则"], order: 2012, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "手机 13812345678 座机 010-12345678" }], transform: function (args) { var m = args.text.match(/\+?\d[\d\s\-().]{6,}\d/g); return m ? m.join("\n") : "（未找到号码）"; } });
textTool({ file: "text-remove-accents.html", title: "去除重音符号", desc: "移除法语、德语等字母的重音变音符号（é→e）。", category: "text", tags: ["重音", "变音", "清洗"], order: 2013, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "Café déjà vu naïve" }], transform: function (args) { return args.text.normalize("NFD").replace(/[̀-ͯ]/g, ""); } });
textTool({ file: "text-to-fullwidth.html", title: "转全角", desc: "把半角英数符号转为全角（含空格）。", category: "text", tags: ["全角", "半角", "CJK"], order: 2014, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "Hello, World! 123" }], transform: function (args) { return args.text.replace(/[!-~]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) + 0xFEE0); }).replace(/ /g, "　"); } });
textTool({ file: "text-to-halfwidth.html", title: "转半角", desc: "把全角英数符号转回半角（含空格）。", category: "text", tags: ["半角", "全角", "CJK"], order: 2015, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "Ｈｅｌｌｏ，　Ｗｏｒｌｄ！" }], transform: function (args) { return args.text.replace(/[！-～]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0xFEE0); }).replace(/　/g, " "); } });
textTool({ file: "text-tabs-to-spaces.html", title: "制表符转空格", desc: "把文本中的 Tab 替换为指定数量的空格。", category: "text", tags: ["Tab", "空格", "缩进"], order: 2016, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8 }, { id: "w", label: "空格数", type: "number", value: 4, min: 1, max: 8 }], transform: function (args) { var sp = " ".repeat(args.w || 4); return args.text.replace(/\t/g, sp); } });
textTool({ file: "text-spaces-to-tabs.html", title: "空格转制表符", desc: "把行首的连续空格（按宽度）替换为制表符。", category: "text", tags: ["空格", "Tab", "缩进"], order: 2017, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8 }, { id: "w", label: "每 Tab 空格数", type: "number", value: 4, min: 1, max: 8 }], transform: function (args) { var w = args.w || 4, sp = " ".repeat(w); return args.text.split("\n").map(function (l) { return l.replace(new RegExp("^(" + sp + ")+", "g"), function (m) { return "\t".repeat(m.length / w); }); }).join("\n"); } });
textTool({ file: "text-split-delimiter.html", title: "分隔符拆分成行", desc: "按给定分隔符把一段文本拆成多行。", category: "text", tags: ["拆分", "分隔符", "行"], order: 2018, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "苹果, 香蕉, 橙子" }, { id: "d", label: "分隔符", type: "text", value: "," }], transform: function (args) { if (!args.d) return args.text; return args.text.split(args.d).map(function (s) { return s.trim(); }).filter(function (s) { return s.length; }).join("\n"); } });
textTool({ file: "text-join-lines.html", title: "多行合并为一行", desc: "把多行文本用指定连接符合并成一行。", category: "text", tags: ["合并", "连接", "行"], order: 2019, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "第一行\n第二行\n第三行" }, { id: "s", label: "连接符", type: "text", value: ", " }], transform: function (args) { return args.text.split("\n").map(function (l) { return l.trim(); }).filter(function (l) { return l.length; }).join(args.s); } });
textTool({ file: "text-repeat.html", title: "重复文本", desc: "把输入文本重复指定次数，每行一份。", category: "text", tags: ["重复", "文本"], order: 2020, fields: [{ id: "text", label: "文本", type: "textarea", rows: 4, placeholder: "注意安全" }, { id: "n", label: "次数", type: "number", value: 3, min: 1, max: 200 }], transform: function (args) { var n = Math.max(1, Math.min(200, args.n | 0)); var out = []; for (var i = 0; i < n; i++) out.push(args.text); return out.join("\n"); } });
textTool({ file: "text-keep-only-letters.html", title: "仅保留字母", desc: "移除所有非字母字符（保留中英文与空格）。", category: "text", tags: ["清洗", "字母"], order: 2021, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "Hello 世界 123!" }], transform: function (args) { return args.text.replace(/[^a-zA-Z一-鿿\s]/g, ""); } });
textTool({ file: "text-keep-only-digits.html", title: "仅保留数字", desc: "移除所有非数字字符（保留数字、小数点与负号）。", category: "text", tags: ["清洗", "数字"], order: 2022, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "价格 ¥1,299.00" }], transform: function (args) { return args.text.replace(/[^0-9.\-]/g, ""); } });
textTool({ file: "text-keep-only-alnum.html", title: "仅保留字母数字", desc: "移除所有非字母数字字符（保留中英文与数字）。", category: "text", tags: ["清洗", "字母数字"], order: 2023, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "User_2024 名称!" }], transform: function (args) { return args.text.replace(/[^a-zA-Z0-9一-鿿]/g, ""); } });
textTool({ file: "text-remove-whitespace.html", title: "去除所有空白", desc: "删除全部空格、Tab 与换行。", category: "text", tags: ["空白", "压缩", "清洗"], order: 2024, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "a b\nc  d" }], transform: function (args) { return args.text.replace(/\s+/g, ""); } });
textTool({ file: "text-count-substring.html", title: "子串出现次数", desc: "统计某子串在文本中出现的次数（支持正则元字符）。", category: "text", tags: ["计数", "子串", "统计"], order: 2025, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "banana" }, { id: "sub", label: "子串", type: "text", value: "an" }], transform: function (args) { if (!args.sub) return "请输入子串"; var esc = args.sub.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); var m = args.text.match(new RegExp(esc, "g")); return "出现 " + (m ? m.length : 0) + " 次"; } });
textTool({ file: "text-csv-to-markdown.html", title: "CSV 转 Markdown 表格", desc: "把逗号分隔的 CSV 转为 Markdown 表格。", category: "text", tags: ["CSV", "Markdown", "表格"], order: 2026, fields: [{ id: "text", label: "CSV", type: "textarea", rows: 8, placeholder: "name,age\nAlice,30\nBob,25" }], transform: function (args) { var lines = args.text.trim().split("\n"); if (!lines.length) return ""; var rows = lines.map(function (l) { return l.split(",").map(function (c) { return c.trim(); }); }); var out = "| " + rows[0].join(" | ") + " |\n"; out += "| " + rows[0].map(function () { return "---"; }).join(" | ") + " |\n"; for (var i = 1; i < rows.length; i++) out += "| " + rows[i].join(" | ") + " |\n"; return out.trim(); } });
textTool({ file: "text-markdown-to-csv.html", title: "Markdown 表格转 CSV", desc: "把 Markdown 表格还原为逗号分隔的 CSV。", category: "text", tags: ["Markdown", "CSV", "表格"], order: 2027, fields: [{ id: "text", label: "Markdown 表格", type: "textarea", rows: 8, placeholder: "| name | age |\n| --- | --- |\n| Alice | 30 |" }], transform: function (args) { var lines = args.text.trim().split("\n").filter(function (l) { return l.trim().indexOf("|") === 0; }); if (!lines.length) return "（未找到表格行）"; var rows = lines.filter(function (l, i) { return i !== 1; }).map(function (l) { return l.replace(/^\|/, "").replace(/\|$/, "").split("|").map(function (c) { return c.trim(); }); }); return rows.map(function (r) { return r.join(","); }).join("\n"); } });
textTool({ file: "text-wrap-quotes.html", title: "每行加引号", desc: "给每一行非空文本包裹双引号。", category: "text", tags: ["引号", "格式化", "行"], order: 2028, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "apple\nbanana" }], transform: function (args) { return args.text.split("\n").map(function (l) { var t = l.trim(); return t ? '"' + t + '"' : l; }).join("\n"); } });
textTool({ file: "text-levenshtein.html", title: "编辑距离", desc: "计算两段文本的 Levenshtein（最小编辑）距离。", category: "text", tags: ["编辑距离", "相似度", "算法"], order: 2029, fields: [{ id: "a", label: "文本 A", type: "textarea", rows: 4, placeholder: "kitten" }, { id: "b", label: "文本 B", type: "textarea", rows: 4, placeholder: "sitting" }], transform: function (args) { var a = args.a, b = args.b, m = a.length, n = b.length; if (!m) return "距离：" + n; if (!n) return "距离：" + m; var prev = [], cur = []; for (var j = 0; j <= n; j++) prev[j] = j; for (var i = 1; i <= m; i++) { cur[0] = i; for (var k = 1; k <= n; k++) { var cost = a[i - 1] === b[k - 1] ? 0 : 1; cur[k] = Math.min(prev[k] + 1, cur[k - 1] + 1, prev[k - 1] + cost); } var t = prev; prev = cur; cur = t; } return "编辑距离：" + prev[n]; } });
textTool({ file: "text-remove-duplicate-words.html", title: "词语去重", desc: "删除文本中重复的词语，保留首次出现。", category: "text", tags: ["去重", "词语", "文本"], order: 2030, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "apple banana apple cherry banana" }], transform: function (args) { var words = args.text.split(/\s+/).filter(Boolean), seen = {}, out = []; words.forEach(function (w) { var k = w.toLowerCase(); if (!seen[k]) { seen[k] = 1; out.push(w); } }); return out.join(" "); } });
textTool({ file: "text-smart-to-straight.html", title: "弯引号转直引号", desc: "把中文/英文弯引号与省略号、破折号转为直字符。", category: "text", tags: ["引号", "标点", "清洗"], order: 2031, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "她说“你好”，又道‘再见’……" }], transform: function (args) { return args.text.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/…/g, "...").replace(/–/g, "-").replace(/—/g, "--"); } });
textTool({ file: "text-ascii-only.html", title: "仅保留 ASCII", desc: "移除所有非 ASCII 字符，仅保留可打印英文字符。", category: "text", tags: ["ASCII", "清洗", "英文"], order: 2032, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "Hello 世界 123" }], transform: function (args) { return args.text.replace(/[^\x20-\x7e]/g, ""); } });
textTool({ file: "text-words-to-lines.html", title: "词语转行", desc: "把文本中的每个词放在单独一行。", category: "text", tags: ["词", "行", "拆分"], order: 2033, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "one two three" }], transform: function (args) { return args.text.split(/\s+/).filter(Boolean).join("\n"); } });
textTool({ file: "text-lines-to-words.html", title: "行转词语", desc: "把多行文本合并为一行，词以空格分隔。", category: "text", tags: ["行", "词", "合并"], order: 2034, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "one\ntwo\nthree" }], transform: function (args) { return args.text.split(/\s+/).filter(Boolean).join(" "); } });
textTool({ file: "text-random-case.html", title: "随机大小写", desc: "把字母随机转换为大小写，适合生成测试串。", category: "text", tags: ["随机", "大小写", "测试"], order: 2035, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "Hello World" }], transform: function (args) { return args.text.replace(/[a-zA-Z]/g, function (c) { return Math.random() < 0.5 ? c.toLowerCase() : c.toUpperCase(); }); } });
textTool({ file: "text-ucfirst.html", title: "句首字母大写", desc: "把每一行的首字母转为大写。", category: "text", tags: ["首字母", "大写", "行"], order: 2036, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "hello\nworld" }], transform: function (args) { return args.text.split("\n").map(function (l) { return l.charAt(0).toUpperCase() + l.slice(1); }).join("\n"); } });
textTool({ file: "text-sentence-per-line.html", title: "句子分行", desc: "按中英文句末标点把段落拆分为每行一句。", category: "text", tags: ["句子", "分行", "段落"], order: 2037, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "今天天气好。我们去散步！你也来吗？" }], transform: function (args) { return args.text.replace(/([。！？!?\.]+)/g, "$1\n").split("\n").map(function (l) { return l.trim(); }).filter(Boolean).join("\n"); } });
textTool({ file: "text-indent.html", title: "行首缩进", desc: "给每一行前面添加指定数量的空格（用于代码缩进）。", category: "text", tags: ["缩进", "空格", "代码"], order: 2038, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8 }, { id: "n", label: "空格数", type: "number", value: 2, min: 1, max: 8 }], transform: function (args) { var sp = " ".repeat(args.n || 2); return args.text.split("\n").map(function (l) { return sp + l; }).join("\n"); } });
textTool({ file: "text-outdent.html", title: "减少缩进", desc: "移除每行开头的指定数量空格。", category: "text", tags: ["缩进", "反缩进", "代码"], order: 2039, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8 }, { id: "n", label: "移除空格数", type: "number", value: 2, min: 1, max: 8 }], transform: function (args) { var sp = " ".repeat(args.n || 2), re = new RegExp("^" + sp); return args.text.split("\n").map(function (l) { return l.replace(re, ""); }).join("\n"); } });

// ---------- 开发者 / 数据格式与编码（扩充）----------
textTool({ file: "dev-json-to-typescript.html", title: "JSON 转 TS 接口", desc: "根据示例 JSON 生成 TypeScript interface（含嵌套与数组）。", category: "dev", tags: ["JSON", "TypeScript", "接口", "代码生成"], order: 2101, fields: [{ id: "json", label: "JSON", type: "textarea", rows: 8, placeholder: '{"id":1,"name":"Tom","tags":["a","b"],"addr":{"city":"BJ"}}' }], transform: function (args) { var obj; try { obj = JSON.parse(args.json); } catch (e) { return "无效 JSON：" + e.message; } var out = []; function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1).replace(/[^A-Za-z0-9]/g, ""); } function ttype(v, name, d) { if (v === null) return "null | undefined"; if (Array.isArray(v)) return (v.length ? ttype(v[0], name + "Item", d) : "any") + "[]"; if (typeof v === "object") { make(v, name, d); return cap(name); } if (typeof v === "number") return "number"; if (typeof v === "boolean") return "boolean"; return "string"; } function make(val, name, d) { out.push("  ".repeat(d) + "interface " + cap(name) + " {"); Object.keys(val).forEach(function (k) { out.push("  ".repeat(d) + "  " + k + ": " + ttype(val[k], cap(name + k), d + 1) + ";"); }); out.push("  ".repeat(d) + "}"); } ttype(obj, "Root", 0); return out.join("\n"); } });
textTool({ file: "dev-json-to-go.html", title: "JSON 转 Go 结构体", desc: "根据示例 JSON 生成 Go struct（含 json tag）。", category: "dev", tags: ["JSON", "Go", "struct", "代码生成"], order: 2102, fields: [{ id: "json", label: "JSON", type: "textarea", rows: 8, placeholder: '{"id":1,"name":"Tom","tags":["a"],"addr":{"city":"BJ"}}' }], transform: function (args) { var obj; try { obj = JSON.parse(args.json); } catch (e) { return "无效 JSON：" + e.message; } var out = []; function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1).replace(/[^A-Za-z0-9]/g, ""); } function gtype(v, name) { if (v === null) return "interface{}"; if (Array.isArray(v)) return "[]" + (v.length ? gtype(v[0], name + "Item") : "interface{}"); if (typeof v === "object") { gstruct(v, name); return "*" + cap(name); } if (typeof v === "number") return Number.isInteger(v) ? "int" : "float64"; if (typeof v === "boolean") return "bool"; return "string"; } function gstruct(val, name) { out.push("type " + cap(name) + " struct {"); Object.keys(val).forEach(function (k) { out.push("\t" + cap(k) + " " + gtype(val[k], cap(name + k)) + " `json:\"" + k + "\"`"); }); out.push("}"); } gtype(obj, "Root"); return out.join("\n"); } });
textTool({ file: "dev-json-to-python.html", title: "JSON 转 Python 类", desc: "根据示例 JSON 生成 Python dataclass（含嵌套类）。", category: "dev", tags: ["JSON", "Python", "dataclass", "代码生成"], order: 2103, fields: [{ id: "json", label: "JSON", type: "textarea", rows: 8, placeholder: '{"id":1,"name":"Tom","addr":{"city":"BJ"}}' }], transform: function (args) { var obj; try { obj = JSON.parse(args.json); } catch (e) { return "无效 JSON：" + e.message; } var classes = []; function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1).replace(/[^A-Za-z0-9]/g, ""); } function ptype(v, name) { if (v === null) return "Any"; if (Array.isArray(v)) return "List[" + (v.length ? ptype(v[0], name + "Item") : "Any") + "]"; if (typeof v === "object") { pclass(v, name); return cap(name); } if (typeof v === "number") return "float"; if (typeof v === "boolean") return "bool"; return "str"; } function pclass(val, name) { var b = ["@dataclass", "class " + cap(name) + ":"]; Object.keys(val).forEach(function (k) { b.push("    " + k + ": " + ptype(val[k], cap(name + k))); }); classes.push(b.join("\n")); } ptype(obj, "Root"); return "from dataclasses import dataclass\nfrom typing import List, Any\n\n" + classes.join("\n\n"); } });
textTool({ file: "dev-json-to-java.html", title: "JSON 转 Java 类", desc: "根据示例 JSON 生成 Java POJO 类（含嵌套）。", category: "dev", tags: ["JSON", "Java", "POJO", "代码生成"], order: 2104, fields: [{ id: "json", label: "JSON", type: "textarea", rows: 8, placeholder: '{"id":1,"name":"Tom","addr":{"city":"BJ"}}' }], transform: function (args) { var obj; try { obj = JSON.parse(args.json); } catch (e) { return "无效 JSON：" + e.message; } var classes = []; function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1).replace(/[^A-Za-z0-9]/g, ""); } function jtype(v, name) { if (v === null) return "Object"; if (Array.isArray(v)) return "List<" + (v.length ? jtype(v[0], name + "Item") : "Object") + ">"; if (typeof v === "object") { jclass(v, name); return cap(name); } if (typeof v === "number") return Number.isInteger(v) ? "int" : "double"; if (typeof v === "boolean") return "boolean"; return "String"; } function jclass(val, name) { var b = ["public class " + cap(name) + " {"]; Object.keys(val).forEach(function (k) { b.push("    private " + jtype(val[k], cap(name + k)) + " " + k + ";"); }); b.push("}"); classes.push(b.join("\n")); } jtype(obj, "Root"); return classes.join("\n\n"); } });
textTool({ file: "dev-json-to-rust.html", title: "JSON 转 Rust 结构体", desc: "根据示例 JSON 生成 Rust struct（带 serde derive）。", category: "dev", tags: ["JSON", "Rust", "struct", "代码生成"], order: 2105, fields: [{ id: "json", label: "JSON", type: "textarea", rows: 8, placeholder: '{"id":1,"name":"Tom","addr":{"city":"BJ"}}' }], transform: function (args) { var obj; try { obj = JSON.parse(args.json); } catch (e) { return "无效 JSON：" + e.message; } var structs = []; function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1).replace(/[^A-Za-z0-9]/g, ""); } function rtype(v, name) { if (v === null) return "serde_json::Value"; if (Array.isArray(v)) return "Vec<" + (v.length ? rtype(v[0], name + "Item") : "serde_json::Value") + ">"; if (typeof v === "object") { rstruct(v, name); return cap(name); } if (typeof v === "number") return Number.isInteger(v) ? "i64" : "f64"; if (typeof v === "boolean") return "bool"; return "String"; } function rstruct(val, name) { var b = ["#[derive(Debug, Serialize, Deserialize)]", "pub struct " + cap(name) + " {"]; Object.keys(val).forEach(function (k) { b.push("    pub " + k + ": " + rtype(val[k], cap(name + k)) + ","); }); b.push("}"); structs.push(b.join("\n")); } rtype(obj, "Root"); return "use serde::{Serialize, Deserialize};\n\n" + structs.join("\n\n"); } });
textTool({ file: "dev-json-to-csharp.html", title: "JSON 转 C# 类", desc: "根据示例 JSON 生成 C# class（含嵌套）。", category: "dev", tags: ["JSON", "C#", "class", "代码生成"], order: 2106, fields: [{ id: "json", label: "JSON", type: "textarea", rows: 8, placeholder: '{"id":1,"name":"Tom","addr":{"city":"BJ"}}' }], transform: function (args) { var obj; try { obj = JSON.parse(args.json); } catch (e) { return "无效 JSON：" + e.message; } var classes = []; function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1).replace(/[^A-Za-z0-9]/g, ""); } function ctype(v, name) { if (v === null) return "object"; if (Array.isArray(v)) return "List<" + (v.length ? ctype(v[0], name + "Item") : "object") + ">"; if (typeof v === "object") { cclass(v, name); return cap(name); } if (typeof v === "number") return Number.isInteger(v) ? "int" : "double"; if (typeof v === "boolean") return "bool"; return "string"; } function cclass(val, name) { var b = ["public class " + cap(name) + " {"]; Object.keys(val).forEach(function (k) { b.push("    public " + ctype(val[k], cap(name + k)) + " " + cap(k) + " { get; set; }"); }); b.push("}"); classes.push(b.join("\n")); } ctype(obj, "Root"); return classes.join("\n\n"); } });
textTool({ file: "dev-xml-to-json.html", title: "XML 转 JSON", desc: "把 XML 解析为 JSON（含属性与子节点）。", category: "dev", tags: ["XML", "JSON", "转换"], order: 2107, fields: [{ id: "xml", label: "XML", type: "textarea", rows: 8, placeholder: '<note><to>Tom</to><from>Jane</from><body hi="1">Hi</body></note>' }], transform: function (args) { try { var doc = new DOMParser().parseFromString(args.xml, "application/xml"); if (doc.querySelector("parsererror")) return "XML 解析失败：请检查格式"; function toObj(node) { if (node.nodeType === 3) return node.nodeValue; if (node.nodeType !== 1) return null; var obj = {}; if (node.attributes && node.attributes.length) { obj["@attributes"] = {}; for (var i = 0; i < node.attributes.length; i++) obj["@attributes"][node.attributes[i].name] = node.attributes[i].value; } var kids = []; for (var j = 0; j < node.childNodes.length; j++) if (node.childNodes[j].nodeType === 1) kids.push(node.childNodes[j]); kids.forEach(function (c) { var v = toObj(c), key = c.nodeName; if (obj[key] === undefined) obj[key] = v; else if (Array.isArray(obj[key])) obj[key].push(v); else obj[key] = [obj[key], v]; }); if (!kids.length) { var t = ""; for (var k = 0; k < node.childNodes.length; k++) if (node.childNodes[k].nodeType === 3) t += node.childNodes[k].nodeValue; obj["#text"] = t; } return obj; } var r = {}; r[doc.documentElement.nodeName] = toObj(doc.documentElement); return JSON.stringify(r, null, 2); } catch (e) { return "出错：" + e.message; } } });
textTool({ file: "dev-json-to-xml.html", title: "JSON 转 XML", desc: "把 JSON 对象序列化为 XML 字符串。", category: "dev", tags: ["JSON", "XML", "转换"], order: 2108, fields: [{ id: "json", label: "JSON", type: "textarea", rows: 8, placeholder: '{"note":{"to":"Tom","from":"Jane","body":"Hi"}}' }], transform: function (args) { var obj; try { obj = JSON.parse(args.json); } catch (e) { return "无效 JSON：" + e.message; } function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); } function toXml(v, name) { if (v === null || v === undefined) return ""; if (Array.isArray(v)) return v.map(function (it) { return toXml(it, name); }).join(""); if (typeof v === "object") { var s = "<" + name + ">"; Object.keys(v).forEach(function (k) { s += toXml(v[k], k); }); return s + "</" + name + ">"; } return "<" + name + ">" + esc(v) + "</" + name + ">"; } var root = Object.keys(obj)[0]; var out = root !== undefined ? toXml(obj[root], root) : toXml(obj, "root"); return '<?xml version="1.0" encoding="UTF-8"?>\n' + out; } });
textTool({ file: "dev-json-merge.html", title: "JSON 合并", desc: "深度合并两个 JSON 对象（右侧覆盖左侧）。", category: "dev", tags: ["JSON", "合并", "深度"], order: 2109, fields: [{ id: "a", label: "JSON A（被覆盖）", type: "textarea", rows: 6, placeholder: '{"a":1,"b":{"x":1}}' }, { id: "b", label: "JSON B（优先）", type: "textarea", rows: 6, placeholder: '{"b":{"y":2},"c":3}' }], transform: function (args) { var x, y; try { x = JSON.parse(args.a); } catch (e) { return "左侧无效 JSON：" + e.message; } try { y = JSON.parse(args.b); } catch (e) { return "右侧无效 JSON：" + e.message; } function merge(o1, o2) { if (Array.isArray(o2)) return o2.slice(); if (o2 !== null && typeof o2 === "object") { if (o1 === null || typeof o1 !== "object" || Array.isArray(o1)) o1 = {}; Object.keys(o2).forEach(function (k) { o1[k] = merge(o1[k], o2[k]); }); return o1; } return o2; } return JSON.stringify(merge(x, y), null, 2); } });
textTool({ file: "dev-env-to-json.html", title: ".env 转 JSON", desc: "把 KEY=VALUE 形式的环境变量解析为 JSON。", category: "dev", tags: [".env", "JSON", "环境变量"], order: 2110, fields: [{ id: "text", label: ".env 文本", type: "textarea", rows: 8, placeholder: 'API_KEY="abc"\nPORT=8080\nDEBUG=true' }], transform: function (args) { var lines = args.text.split("\n"), o = {}; lines.forEach(function (l) { l = l.trim(); if (!l || l[0] === "#") return; var i = l.indexOf("="); if (i < 0) return; var k = l.slice(0, i).trim(), v = l.slice(i + 1).trim(); if ((v[0] === '"' && v[v.length - 1] === '"') || (v[0] === "'" && v[v.length - 1] === "'")) v = v.slice(1, -1); o[k] = v; }); return JSON.stringify(o, null, 2); } });
textTool({ file: "dev-json-to-env.html", title: "JSON 转 .env", desc: "把扁平或嵌套 JSON 展开为 KEY=VALUE 的环境变量。", category: "dev", tags: ["JSON", ".env", "环境变量"], order: 2111, fields: [{ id: "json", label: "JSON", type: "textarea", rows: 8, placeholder: '{"API_KEY":"abc","db":{"host":"localhost","port":5432}}' }], transform: function (args) { var o; try { o = JSON.parse(args.json); } catch (e) { return "无效 JSON：" + e.message; } var out = []; function walk(p, val) { if (val !== null && typeof val === "object" && !Array.isArray(val)) Object.keys(val).forEach(function (k) { walk(p ? p + "_" + k : k, val[k]); }); else if (Array.isArray(val)) out.push(p + "=" + JSON.stringify(val)); else out.push(p + "=" + val); } walk("", o); return out.join("\n"); } });
textTool({ file: "dev-base32-encode.html", title: "Base32 编码", desc: "把文本按 RFC4648 标准编码为 Base32。", category: "dev", tags: ["Base32", "编码", "RFC4648"], order: 2112, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "Hello" }], transform: function (args) { var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"; var bytes = []; for (var i = 0; i < args.text.length; i++) bytes.push(args.text.charCodeAt(i) & 0xff); var bits = 0, value = 0, out = ""; for (var j = 0; j < bytes.length; j++) { value = (value << 8) | bytes[j]; bits += 8; while (bits >= 5) { out += chars[(value >>> (bits - 5)) & 31]; bits -= 5; } } if (bits > 0) out += chars[(value << (5 - bits)) & 31]; while (out.length % 8) out += "="; return out; } });
textTool({ file: "dev-base32-decode.html", title: "Base32 解码", desc: "把 Base32 字符串解码为文本（RFC4648）。", category: "dev", tags: ["Base32", "解码", "RFC4648"], order: 2113, fields: [{ id: "text", label: "Base32", type: "text", value: "JBSWY3DPEBLW64TMMQ======" }], transform: function (args) { var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"; var s = args.text.toUpperCase().replace(/=+$/, ""), bits = 0, value = 0, out = ""; for (var i = 0; i < s.length; i++) { var idx = chars.indexOf(s[i]); if (idx < 0) return "非法 Base32 字符：" + s[i]; value = (value << 5) | idx; bits += 5; if (bits >= 8) { out += String.fromCharCode((value >>> (bits - 8)) & 0xff); bits -= 8; } } return out; } });
textTool({ file: "dev-hex-encode.html", title: "文本转十六进制", desc: "把文本按字节转为十六进制串（二选一：可加空格）。", category: "dev", tags: ["Hex", "十六进制", "编码"], order: 2114, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "Hello" }, { id: "sp", label: "每字节加空格", type: "checkbox" }], transform: function (args) { var o = ""; for (var i = 0; i < args.text.length; i++) { var h = (args.text.charCodeAt(i) & 0xff).toString(16); h = h.length < 2 ? "0" + h : h; o += h + (args.sp ? " " : ""); } return o.trim(); } });
textTool({ file: "dev-hex-decode.html", title: "十六进制转文本", desc: "把十六进制串还原为文本。", category: "dev", tags: ["Hex", "十六进制", "解码"], order: 2115, fields: [{ id: "text", label: "十六进制", type: "text", value: "48656c6c6f" }], transform: function (args) { var s = args.text.replace(/[^0-9a-fA-F]/g, ""); if (s.length % 2) return "十六进制长度应为偶数"; var o = ""; for (var i = 0; i < s.length; i += 2) o += String.fromCharCode(parseInt(s.substr(i, 2), 16)); return o; } });
textTool({ file: "dev-binary-encode.html", title: "文本转二进制", desc: "把文本按字节转为 0/1 串（每字节 8 位）。", category: "dev", tags: ["二进制", "编码", "位"], order: 2116, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "Hi" }], transform: function (args) { var o = ""; for (var i = 0; i < args.text.length; i++) o += ("00000000" + (args.text.charCodeAt(i) & 0xff).toString(2)).slice(-8) + " "; return o.trim(); } });
textTool({ file: "dev-binary-decode.html", title: "二进制转文本", desc: "把 0/1 串（每 8 位一字节）还原为文本。", category: "dev", tags: ["二进制", "解码", "位"], order: 2117, fields: [{ id: "text", label: "二进制", type: "textarea", rows: 6, placeholder: "01001000 01101001" }], transform: function (args) { var s = args.text.replace(/[^01]/g, ""); if (s.length % 8) return "二进制位数应为 8 的倍数"; var o = ""; for (var i = 0; i < s.length; i += 8) o += String.fromCharCode(parseInt(s.substr(i, 8), 2)); return o; } });
textTool({ file: "dev-ascii-table.html", title: "ASCII 码表", desc: "生成可打印 ASCII（32–126）的十进制 / 十六进制对照表。", category: "dev", tags: ["ASCII", "码表", "字符"], order: 2118, fields: [{ id: "text", label: "（无需输入）点击生成", type: "text", value: "" }], transform: function () { function pad(s, n) { s = String(s); while (s.length < n) s = " " + s; return s; } var out = "Dec  Hex  Char\n"; for (var i = 32; i < 127; i++) { var c = String.fromCharCode(i); if (c === "\t") c = "\\t"; else if (c === " ") c = "␣"; out += pad(i, 3) + "  " + pad(i.toString(16).toUpperCase(), 2) + "   " + c + "\n"; } return out; } });
textTool({ file: "dev-charcodes.html", title: "字符转码点", desc: "列出每个字符的 Unicode 码点（十进制与十六进制）。", category: "dev", tags: ["Unicode", "码点", "字符"], order: 2119, fields: [{ id: "text", label: "文本", type: "textarea", rows: 4, placeholder: "A中★" }], transform: function (args) { return Array.from(args.text).map(function (c) { var cp = c.codePointAt(0); var hex = cp.toString(16).toUpperCase(); while (hex.length < 4) hex = "0" + hex; return c + "  十进制 " + cp + "   U+" + hex; }).join("\n"); } });
textTool({ file: "dev-codes-to-string.html", title: "码点转字符", desc: "把十进制或 0x 十六进制码点（空格/换行分隔）转为文本。", category: "dev", tags: ["Unicode", "码点", "字符"], order: 2120, fields: [{ id: "text", label: "码点", type: "textarea", rows: 4, placeholder: "65 0x4E2D 9733" }], transform: function (args) { var parts = args.text.trim().split(/\s+/), o = ""; parts.forEach(function (p) { if (!p) return; var n = /^0x/i.test(p) ? parseInt(p, 16) : parseInt(p, 10); if (isNaN(n)) return; o += String.fromCodePoint(n); }); return o; } });
textTool({ file: "dev-unicode-escape.html", title: "Unicode 转义", desc: "把文本转为 \\uXXXX（或 \\u{XXXXX}）转义形式。", category: "dev", tags: ["Unicode", "转义", "编码"], order: 2121, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "A中★" }], transform: function (args) { var o = ""; for (var i = 0; i < args.text.length; i++) { var cp = args.text.codePointAt(i); if (cp > 0xFFFF) { o += "\\u{" + cp.toString(16).toUpperCase() + "}"; i++; } else o += "\\u" + ("0000" + cp.toString(16).toUpperCase()).slice(-4); } return o; } });
textTool({ file: "dev-unicode-unescape.html", title: "Unicode 反转义", desc: "把 \\uXXXX 与 \\u{XXXXX} 转义还原为文本。", category: "dev", tags: ["Unicode", "反转义", "解码"], order: 2122, fields: [{ id: "text", label: "转义文本", type: "textarea", rows: 6, placeholder: "\\u0041\\u4E2D" }], transform: function (args) { try { return args.text.replace(/\\u\{([0-9A-Fa-f]+)\}/g, function (m, h) { return String.fromCodePoint(parseInt(h, 16)); }).replace(/\\u([0-9A-Fa-f]{4})/g, function (m, h) { return String.fromCharCode(parseInt(h, 16)); }); } catch (e) { return "出错：" + e.message; } } });
textTool({ file: "dev-xor-cipher.html", title: "XOR 异或加解密", desc: "用密钥对文本逐字节异或（加解密同一操作）。", category: "dev", tags: ["XOR", "异或", "加密"], order: 2123, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "secret message" }, { id: "key", label: "密钥", type: "text", value: "key123" }], transform: function (args) { if (!args.key) return "请输入密钥"; var o = ""; for (var i = 0; i < args.text.length; i++) o += String.fromCharCode((args.text.charCodeAt(i) & 0xff) ^ (args.key.charCodeAt(i % args.key.length) & 0xff)); return o; } });
textTool({ file: "dev-rot47.html", title: "ROT47 编码", desc: "对可打印 ASCII（33–126）循环位移 47 位。", category: "dev", tags: ["ROT47", "编码", "密码"], order: 2124, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "Hello World!" }], transform: function (args) { var o = ""; for (var i = 0; i < args.text.length; i++) { var c = args.text.charCodeAt(i); if (c >= 33 && c <= 126) c = 33 + ((c - 33 + 47) % 94); o += String.fromCharCode(c); } return o; } });
textTool({ file: "dev-atbash.html", title: "Atbash 密码", desc: "经典字母替换密码（A↔Z，a↔z）。", category: "dev", tags: ["Atbash", "密码", "替换"], order: 2125, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "Hello" }], transform: function (args) { return args.text.replace(/[a-zA-Z]/g, function (c) { var b = c <= "Z" ? 65 : 97; return String.fromCharCode(b + 25 - (c.charCodeAt(0) - b)); }); } });
textTool({ file: "dev-vigenere.html", title: "维吉尼亚密码", desc: "用密钥对字母做多表替换加解密。", category: "dev", tags: ["Vigenère", "密码", "替换"], order: 2126, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "HELLO" }, { id: "key", label: "密钥", type: "text", value: "KEY" }, { id: "mode", label: "模式", type: "select", options: [{ value: "enc", label: "加密" }, { value: "dec", label: "解密" }] }], transform: function (args) { if (!args.key) return "请输入密钥"; var k = args.key.toUpperCase().replace(/[^A-Z]/g, ""); if (!k) return "密钥需含字母"; var o = "", ki = 0, dec = args.mode === "dec"; for (var i = 0; i < args.text.length; i++) { var c = args.text[i]; if (/[a-z]/i.test(c)) { var base = c <= "Z" ? 65 : 97; var x = c.charCodeAt(0) - base; var kk = k.charCodeAt(ki % k.length) - 65; x = dec ? (x - kk + 26) % 26 : (x + kk) % 26; o += String.fromCharCode(base + x); ki++; } else o += c; } return o; } });
textTool({ file: "dev-string-similarity.html", title: "字符串相似度", desc: "基于编辑距离计算两段文本的相似度（0–1）。", category: "dev", tags: ["相似度", "编辑距离", "比对"], order: 2127, fields: [{ id: "a", label: "文本 A", type: "textarea", rows: 4, placeholder: "kitten" }, { id: "b", label: "文本 B", type: "textarea", rows: 4, placeholder: "sitting" }], transform: function (args) { var a = args.a, b = args.b, m = a.length, n = b.length; if (!m) return "相似度：0.00"; if (!n) return "相似度：0.00"; var prev = [], cur = []; for (var j = 0; j <= n; j++) prev[j] = j; for (var i = 1; i <= m; i++) { cur[0] = i; for (var k = 1; k <= n; k++) { var cost = a[i - 1] === b[k - 1] ? 0 : 1; cur[k] = Math.min(prev[k] + 1, cur[k - 1] + 1, prev[k - 1] + cost); } var t = prev; prev = cur; cur = t; } var d = prev[n]; var sim = 1 - d / Math.max(1, a.length, b.length); return "编辑距离：" + d + "\n相似度：" + sim.toFixed(2); } });
textTool({ file: "dev-xml-format.html", title: "XML 格式化", desc: "把压缩的 XML 按层级缩进美化。", category: "dev", tags: ["XML", "格式化", "缩进"], order: 2128, fields: [{ id: "xml", label: "XML", type: "textarea", rows: 8, placeholder: "<note><to>Tom</to><from>Jane</from></note>" }], transform: function (args) { try { var doc = new DOMParser().parseFromString(args.xml, "application/xml"); if (doc.querySelector("parsererror")) return "XML 解析失败：请检查格式"; function pretty(node, ind) { if (node.nodeType === 3) { var t = node.nodeValue.trim(); return t ? ind + t + "\n" : ""; } if (node.nodeType !== 1) return ""; var open = "<" + node.nodeName, kids = []; for (var i = 0; i < node.childNodes.length; i++) if (node.childNodes[i].nodeType === 1) kids.push(node.childNodes[i]); if (node.attributes && node.attributes.length) for (var a = 0; a < node.attributes.length; a++) open += " " + node.attributes[a].name + "=\"" + node.attributes[a].value + "\""; open += ">"; var s = ""; if (kids.length) { s += ind + open + "\n"; kids.forEach(function (c) { s += pretty(c, ind + "  "); }); s += ind + "</" + node.nodeName + ">\n"; } else { var txt = ""; for (var k = 0; k < node.childNodes.length; k++) if (node.childNodes[k].nodeType === 3) txt += node.childNodes[k].nodeValue; s += ind + open + txt + "</" + node.nodeName + ">\n"; } return s; } return pretty(doc.documentElement, ""); } catch (e) { return "出错：" + e.message; } } });
textTool({ file: "dev-query-builder.html", title: "键值对转查询串", desc: "把多行 KEY=VALUE（或 KEY: VALUE）拼成 URL 查询串。", category: "dev", tags: ["查询串", "URL", "表单"], order: 2129, fields: [{ id: "text", label: "键值对", type: "textarea", rows: 8, placeholder: "q=hello\npage=2\nlang=zh" }], transform: function (args) { var parts = []; args.text.split("\n").forEach(function (l) { l = l.trim(); if (!l) return; var i = l.indexOf("="); if (i < 0) i = l.indexOf(":"); if (i < 0) return; var k = l.slice(0, i).trim(), v = l.slice(i + 1).trim(); if (!k) return; parts.push(encodeURIComponent(k) + "=" + encodeURIComponent(v)); }); return parts.join("&"); } });
textTool({ file: "dev-ini-to-json.html", title: "INI 转 JSON", desc: "解析 INI 文件（含 [section]）为 JSON。", category: "dev", tags: ["INI", "JSON", "配置"], order: 2130, fields: [{ id: "text", label: "INI", type: "textarea", rows: 8, placeholder: "[db]\nhost=localhost\nport=5432" }], transform: function (args) { var o = {}, cur = ""; args.text.split("\n").forEach(function (l) { l = l.trim(); if (!l || l[0] === ";") return; if (l[0] === "[") { cur = l.slice(1, l.indexOf("]")); o[cur] = o[cur] || {}; return; } var i = l.indexOf("="); if (i < 0) return; var k = l.slice(0, i).trim(), v = l.slice(i + 1).trim(); if (cur) o[cur][k] = v; else o[k] = v; }); return JSON.stringify(o, null, 2); } });
textTool({ file: "dev-json-to-ini.html", title: "JSON 转 INI", desc: "把 JSON（含嵌套对象）展开为 INI 格式。", category: "dev", tags: ["JSON", "INI", "配置"], order: 2131, fields: [{ id: "json", label: "JSON", type: "textarea", rows: 8, placeholder: '{"db":{"host":"localhost","port":5432}}' }], transform: function (args) { var o; try { o = JSON.parse(args.json); } catch (e) { return "无效 JSON：" + e.message; } var out = []; if (o !== null && typeof o === "object" && !Array.isArray(o)) Object.keys(o).forEach(function (k) { var v = o[k]; if (v !== null && typeof v === "object" && !Array.isArray(v)) { out.push("[" + k + "]"); Object.keys(v).forEach(function (k2) { out.push(k2 + "=" + v[k2]); }); } else out.push(k + "=" + v); }); return out.join("\n"); } });
textTool({ file: "dev-svg-to-datauri.html", title: "SVG 转 Data URI", desc: "把 SVG 文本编码为可直接用于 src 的 Data URI。", category: "dev", tags: ["SVG", "DataURI", "编码"], order: 2132, fields: [{ id: "text", label: "SVG", type: "textarea", rows: 8, placeholder: '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><circle cx="5" cy="5" r="5"/></svg>' }], transform: function (args) { var s = args.text.trim(); if (s.indexOf("<svg") !== 0 && s.indexOf("<?xml") !== 0) return "请输入合法的 SVG 文本"; return "data:image/svg+xml," + encodeURIComponent(s); } });
textTool({ file: "dev-datauri-to-text.html", title: "Data URI 解码", desc: "把 Data URI（URL 编码或 Base64）还原为文本。", category: "dev", tags: ["DataURI", "解码", "SVG"], order: 2133, fields: [{ id: "text", label: "Data URI", type: "textarea", rows: 6, placeholder: "data:image/svg+xml,%3Csvg%3E%3C/svg%3E" }], transform: function (args) { var s = args.text.trim(); var m = s.match(/^data:[^,]+,(.*)$/); if (!m) return "不是合法的 Data URI"; var body = m[1]; if (/^data:[^;]*;base64,/.test(s)) { try { return atob(body.replace(/^.*,/, "")); } catch (e) { return "Base64 解码失败"; } } return decodeURIComponent(body.replace(/^.*,/, "")); } });

// ---------- 设计 / CSS 生成器（扩充）----------
cssTool({ file: "design-grid.html", title: "CSS Grid 生成", desc: "生成 grid 容器与子项的实用 CSS（列数 / 行数 / 间距可调）。", tags: ["grid", "布局", "CSS"], order: 2151, fields: [{ id: "cols", label: "列数", type: "number", value: 3, min: 1, max: 12 }, { id: "rows", label: "行数", type: "number", value: 2, min: 1, max: 12 }, { id: "gap", label: "间距 px", type: "number", value: 16, min: 0, max: 64 }], css: function (a) { return ".grid {\n  display: grid;\n  grid-template-columns: repeat(" + a.cols + ", 1fr);\n  grid-template-rows: repeat(" + a.rows + ", auto);\n  gap: " + a.gap + "px;\n}\n.grid > * {\n  background: #e2e8f0;\n  padding: 1rem;\n  border-radius: 8px;\n  text-align: center;\n}"; } });
cssTool({ file: "design-clip-path.html", title: "Clip-path 生成", desc: "生成常用裁剪形状（圆形 / 椭圆 / 多边形）的 CSS。", tags: ["clip-path", "形状", "CSS"], order: 2152, fields: [{ id: "shape", label: "形状", type: "select", options: [{ value: "circle", label: "圆形 circle" }, { value: "ellipse", label: "椭圆 ellipse" }, { value: "triangle", label: "三角 triangle" }, { value: "diamond", label: "菱形 diamond" }, { value: "pentagon", label: "五边形 pentagon" }] }], css: function (a) { var m = { circle: "circle(50% at 50% 50%)", ellipse: "ellipse(40% 50% at 50% 50%)", triangle: "polygon(50% 0%, 0% 100%, 100% 100%)", diamond: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)", pentagon: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)" }; return ".shape {\n  width: 200px;\n  height: 200px;\n  background: linear-gradient(135deg, #0f766e, #2dd4bf);\n  clip-path: " + m[a.shape] + ";\n}"; } });
cssTool({ file: "design-transform.html", title: "Transform 生成", desc: "组合位移、旋转、缩放与倾斜，生成 transform CSS。", tags: ["transform", "变换", "CSS"], order: 2153, fields: [{ id: "tx", label: "位移 X px", type: "number", value: 0, min: -200, max: 200 }, { id: "ty", label: "位移 Y px", type: "number", value: 0, min: -200, max: 200 }, { id: "rotate", label: "旋转 deg", type: "number", value: 0, min: -180, max: 180 }, { id: "scale", label: "缩放", type: "number", value: 1, min: 0, max: 3, step: 0.1 }, { id: "skew", label: "倾斜 deg", type: "number", value: 0, min: -45, max: 45 }], css: function (a) { return ".box {\n  transform: translate(" + a.tx + "px, " + a.ty + "px) rotate(" + a.rotate + "deg) scale(" + a.scale + ") skew(" + a.skew + "deg);\n  transform-origin: center;\n}"; } });
cssTool({ file: "design-transition.html", title: "Transition 生成", desc: "生成 transition 过渡动画 CSS。", tags: ["transition", "动画", "CSS"], order: 2154, fields: [{ id: "prop", label: "属性", type: "select", options: [{ value: "all", label: "all" }, { value: "opacity", label: "opacity" }, { value: "transform", label: "transform" }, { value: "background-color", label: "background-color" }, { value: "color", label: "color" }, { value: "width", label: "width" }] }, { id: "dur", label: "时长 s", type: "number", value: 0.3, min: 0, max: 5, step: 0.1 }, { id: "ease", label: "缓动", type: "select", options: [{ value: "ease", label: "ease" }, { value: "linear", label: "linear" }, { value: "ease-in", label: "ease-in" }, { value: "ease-out", label: "ease-out" }, { value: "ease-in-out", label: "ease-in-out" }] }], css: function (a) { return ".target {\n  transition: " + a.prop + " " + a.dur + "s " + a.ease + ";\n}"; } });
cssTool({ file: "design-keyframes.html", title: "Keyframes 动画生成", desc: "生成常用 @keyframes 动画（淡入 / 滑入 / 弹跳 / 旋转等）。", tags: ["keyframes", "动画", "CSS"], order: 2155, fields: [{ id: "kind", label: "动画类型", type: "select", options: [{ value: "fadeIn", label: "淡入 fadeIn" }, { value: "slideInUp", label: "上滑 slideInUp" }, { value: "bounce", label: "弹跳 bounce" }, { value: "spin", label: "旋转 spin" }, { value: "pulse", label: "脉冲 pulse" }, { value: "shake", label: "抖动 shake" }] }], css: function (a) { var m = { fadeIn: "@keyframes fadeIn {\n  from { opacity: 0; }\n  to { opacity: 1; }\n}\n.target { animation: fadeIn 0.6s ease both; }", slideInUp: "@keyframes slideInUp {\n  from { opacity: 0; transform: translateY(40px); }\n  to { opacity: 1; transform: translateY(0); }\n}\n.target { animation: slideInUp 0.5s ease both; }", bounce: "@keyframes bounce {\n  0%, 100% { transform: translateY(0); }\n  50% { transform: translateY(-20px); }\n}\n.target { animation: bounce 1s ease-in-out infinite; }", spin: "@keyframes spin {\n  to { transform: rotate(360deg); }\n}\n.target { animation: spin 0.8s linear infinite; }", pulse: "@keyframes pulse {\n  0%, 100% { transform: scale(1); }\n  50% { transform: scale(1.08); }\n}\n.target { animation: pulse 1.4s ease-in-out infinite; }", shake: "@keyframes shake {\n  0%, 100% { transform: translateX(0); }\n  25% { transform: translateX(-8px); }\n  75% { transform: translateX(8px); }\n}\n.target { animation: shake 0.4s ease-in-out infinite; }" }; return m[a.kind]; } });
cssTool({ file: "design-media-query.html", title: "媒体查询生成", desc: "生成响应式断点媒体查询骨架。", tags: ["media-query", "响应式", "CSS"], order: 2156, fields: [{ id: "bp", label: "断点 px", type: "number", value: 768, min: 320, max: 1920 }, { id: "type", label: "方向", type: "select", options: [{ value: "min-width", label: "移动优先 min-width" }, { value: "max-width", label: "桌面优先 max-width" }] }], css: function (a) { return "@media (" + a.type + ": " + a.bp + "px) {\n  /* 在此添加 " + a.bp + "px " + a.type + " 下的样式 */\n  .container {\n    \n  }\n}"; } });
cssTool({ file: "design-reset.html", title: "CSS Reset 片段", desc: "生成一份现代 CSS Reset 基线样式。", tags: ["reset", "基线", "CSS"], order: 2157, fields: [], css: function () { return "*, *::before, *::after {\n  box-sizing: border-box;\n}\n* {\n  margin: 0;\n  padding: 0;\n}\nhtml, body {\n  height: 100%;\n}\nbody {\n  line-height: 1.5;\n  -webkit-font-smoothing: antialiased;\n}\nimg, picture, video, canvas, svg {\n  display: block;\n  max-width: 100%;\n}\nbutton, input, select, textarea {\n  font: inherit;\n  color: inherit;\n}"; } });
cssTool({ file: "design-border.html", title: "Border 生成", desc: "生成边框样式 CSS。", tags: ["border", "边框", "CSS"], order: 2158, fields: [{ id: "width", label: "宽度 px", type: "number", value: 2, min: 0, max: 20 }, { id: "style", label: "样式", type: "select", options: [{ value: "solid", label: "实线 solid" }, { value: "dashed", label: "虚线 dashed" }, { value: "dotted", label: "点线 dotted" }, { value: "double", label: "双线 double" }, { value: "groove", label: "凹槽 groove" }, { value: "ridge", label: "脊线 ridge" }] }, { id: "color", label: "颜色", type: "text", value: "#0f766e" }], css: function (a) { return ".box {\n  border: " + a.width + "px " + a.style + " " + a.color + ";\n}"; } });
cssTool({ file: "design-outline.html", title: "Outline 生成", desc: "生成轮廓线（outline）CSS，含偏移量。", tags: ["outline", "轮廓", "CSS"], order: 2159, fields: [{ id: "width", label: "宽度 px", type: "number", value: 2, min: 0, max: 20 }, { id: "style", label: "样式", type: "select", options: [{ value: "solid", label: "实线 solid" }, { value: "dashed", label: "虚线 dashed" }, { value: "dotted", label: "点线 dotted" }, { value: "double", label: "双线 double" }] }, { id: "color", label: "颜色", type: "text", value: "#ef4444" }, { id: "offset", label: "偏移 px", type: "number", value: 2, min: 0, max: 20 }], css: function (a) { return ".box {\n  outline: " + a.width + "px " + a.style + " " + a.color + ";\n  outline-offset: " + a.offset + "px;\n}"; } });
cssTool({ file: "design-aspect-ratio.html", title: "宽高比生成", desc: "生成固定宽高比的容器 CSS（常用比例预设）。", tags: ["aspect-ratio", "比例", "CSS"], order: 2160, fields: [{ id: "ratio", label: "比例", type: "select", options: [{ value: "16 / 9", label: "16:9 视频" }, { value: "4 / 3", label: "4:3" }, { value: "1 / 1", label: "1:1 方形" }, { value: "3 / 2", label: "3:2" }, { value: "21 / 9", label: "21:9 超宽" }, { value: "9 / 16", label: "9:16 竖屏" }] }], css: function (a) { return ".box {\n  aspect-ratio: " + a.ratio + ";\n  width: 100%;\n  background: #e2e8f0;\n}"; } });
cssTool({ file: "design-centering.html", title: "居中方案生成", desc: "生成元素居中的 CSS（Flex / Grid / 绝对定位）。", tags: ["居中", "布局", "CSS"], order: 2161, fields: [{ id: "method", label: "方案", type: "select", options: [{ value: "flex", label: "Flexbox" }, { value: "grid", label: "Grid" }, { value: "absolute", label: "绝对定位" }] }], css: function (a) { if (a.method === "grid") return ".parent {\n  display: grid;\n  place-items: center;\n  height: 100%;\n}"; if (a.method === "absolute") return ".parent { position: relative; height: 100%; }\n.child {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n}"; return ".parent {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  height: 100%;\n}"; } });
cssTool({ file: "design-tooltip.html", title: "Tooltip 提示生成", desc: "基于 data-tip 属性的纯 CSS 悬浮提示。", tags: ["tooltip", "提示", "CSS"], order: 2162, fields: [{ id: "pos", label: "位置", type: "select", options: [{ value: "top", label: "上方" }, { value: "bottom", label: "下方" }, { value: "left", label: "左侧" }, { value: "right", label: "右侧" }] }], css: function (a) { var map = { top: "bottom: 100%; left: 50%; transform: translateX(-50%);", bottom: "top: 100%; left: 50%; transform: translateX(-50%);", left: "right: 100%; top: 50%; transform: translateY(-50%);", right: "left: 100%; top: 50%; transform: translateY(-50%);" }; return ".tooltip {\n  position: relative;\n  cursor: help;\n}\n.tooltip::after {\n  content: attr(data-tip);\n  position: absolute;\n  " + map[a.pos] + "\n  background: #0f172a;\n  color: #fff;\n  padding: 4px 8px;\n  border-radius: 6px;\n  font-size: 12px;\n  white-space: nowrap;\n  opacity: 0;\n  pointer-events: none;\n  transition: opacity 0.2s;\n}\n.tooltip:hover::after {\n  opacity: 1;\n}"; } });
cssTool({ file: "design-badge.html", title: "Badge 徽标生成", desc: "生成胶囊 / 圆角色块徽标 CSS。", tags: ["badge", "徽标", "CSS"], order: 2163, fields: [{ id: "bg", label: "背景色", type: "text", value: "#0f766e" }, { id: "color", label: "文字色", type: "text", value: "#ffffff" }, { id: "radius", label: "圆角 px", type: "number", value: 999, min: 0, max: 999 }], css: function (a) { return ".badge {\n  display: inline-block;\n  padding: 2px 10px;\n  background: " + a.bg + ";\n  color: " + a.color + ";\n  border-radius: " + a.radius + "px;\n  font-size: 12px;\n  font-weight: 600;\n}"; } });
cssTool({ file: "design-card.html", title: "卡片生成", desc: "生成带圆角与阴影的卡片 CSS（多档阴影）。", tags: ["card", "卡片", "CSS"], order: 2164, fields: [{ id: "radius", label: "圆角 px", type: "number", value: 12, min: 0, max: 32 }, { id: "shadow", label: "阴影", type: "select", options: [{ value: "none", label: "无" }, { value: "0 1px 3px rgba(15,23,42,0.1)", label: "小 sm" }, { value: "0 4px 12px rgba(15,23,42,0.12)", label: "中 md" }, { value: "0 12px 32px rgba(15,23,42,0.18)", label: "大 lg" }] }], css: function (a) { return ".card {\n  background: #fff;\n  border-radius: " + a.radius + "px;\n  padding: 1.5rem;\n  box-shadow: " + a.shadow + ";\n}"; } });
cssTool({ file: "design-toggle.html", title: "开关 Switch 生成", desc: "生成纯 CSS 开关（Switch）组件样式。", tags: ["switch", "开关", "CSS"], order: 2165, fields: [], css: function () { return ".switch {\n  position: relative;\n  display: inline-block;\n  width: 44px;\n  height: 24px;\n}\n.switch input { opacity: 0; width: 0; height: 0; }\n.switch .slider {\n  position: absolute;\n  inset: 0;\n  background: #cbd5e1;\n  border-radius: 999px;\n  transition: 0.2s;\n}\n.switch .slider::before {\n  content: \"\";\n  position: absolute;\n  height: 18px;\n  width: 18px;\n  left: 3px;\n  top: 3px;\n  background: #fff;\n  border-radius: 50%;\n  transition: 0.2s;\n}\n.switch input:checked + .slider { background: #0f766e; }\n.switch input:checked + .slider::before { transform: translateX(20px); }"; } });
cssTool({ file: "design-checkbox.html", title: "自定义复选框", desc: "生成美化后的自定义复选框 CSS。", tags: ["checkbox", "表单", "CSS"], order: 2166, fields: [{ id: "color", label: "主题色", type: "text", value: "#0f766e" }], css: function (a) { return ".check {\n  display: inline-flex;\n  align-items: center;\n  gap: 8px;\n  cursor: pointer;\n}\n.check input { position: absolute; opacity: 0; }\n.check .box {\n  width: 20px;\n  height: 20px;\n  border: 2px solid #cbd5e1;\n  border-radius: 6px;\n  transition: 0.15s;\n}\n.check input:checked + .box {\n  background: " + a.color + ";\n  border-color: " + a.color + ";\n}\n.check input:checked + .box::after {\n  content: \"\\2713\";\n  color: #fff;\n  display: block;\n  text-align: center;\n  line-height: 16px;\n}"; } });
cssTool({ file: "design-progress.html", title: "进度条生成", desc: "生成 CSS 进度条（含填充与配色）。", tags: ["progress", "进度条", "CSS"], order: 2167, fields: [{ id: "color", label: "填充色", type: "text", value: "#0f766e" }, { id: "height", label: "高度 px", type: "number", value: 12, min: 4, max: 40 }], css: function (a) { return ".progress {\n  width: 100%;\n  height: " + a.height + "px;\n  background: #e2e8f0;\n  border-radius: " + a.height + "px;\n  overflow: hidden;\n}\n.progress > span {\n  display: block;\n  height: 100%;\n  width: 50%;\n  background: " + a.color + ";\n}"; } });
cssTool({ file: "design-spinner.html", title: "加载动画生成", desc: "生成旋转加载（Spinner）动画 CSS。", tags: ["spinner", "加载", "动画"], order: 2168, fields: [{ id: "size", label: "尺寸 px", type: "number", value: 40, min: 16, max: 120 }, { id: "color", label: "颜色", type: "text", value: "#0f766e" }], css: function (a) { return "@keyframes spin { to { transform: rotate(360deg); } }\n.spinner {\n  width: " + a.size + "px;\n  height: " + a.size + "px;\n  border: 4px solid #e2e8f0;\n  border-top-color: " + a.color + ";\n  border-radius: 50%;\n  animation: spin 0.8s linear infinite;\n}"; } });
cssTool({ file: "design-gradient-text.html", title: "渐变文字生成", desc: "生成渐变填充文字（background-clip: text）CSS。", tags: ["gradient", "文字", "CSS"], order: 2169, fields: [{ id: "c1", label: "起始色", type: "text", value: "#0f766e" }, { id: "c2", label: "结束色", type: "text", value: "#2dd4bf" }], css: function (a) { return ".gradient-text {\n  background: linear-gradient(90deg, " + a.c1 + ", " + a.c2 + ");\n  -webkit-background-clip: text;\n  background-clip: text;\n  color: transparent;\n  font-weight: 700;\n}"; } });
cssTool({ file: "design-backdrop-filter.html", title: "毛玻璃 Backdrop", desc: "生成 backdrop-filter 毛玻璃效果 CSS。", tags: ["backdrop-filter", "毛玻璃", "CSS"], order: 2170, fields: [{ id: "blur", label: "模糊 px", type: "number", value: 8, min: 0, max: 30 }], css: function (a) { return ".glass {\n  background: rgba(255, 255, 255, 0.4);\n  backdrop-filter: blur(" + a.blur + "px);\n  -webkit-backdrop-filter: blur(" + a.blur + "px);\n  border: 1px solid rgba(255, 255, 255, 0.5);\n  border-radius: 12px;\n}"; } });
cssTool({ file: "design-scrollbar.html", title: "滚动条样式生成", desc: "生成跨内核的自定义滚动条 CSS。", tags: ["scrollbar", "滚动条", "CSS"], order: 2171, fields: [{ id: "width", label: "宽度 px", type: "number", value: 10, min: 4, max: 24 }, { id: "thumb", label: "滑块色", type: "text", value: "#94a3b8" }, { id: "track", label: "轨道色", type: "text", value: "#e2e8f0" }], css: function (a) { return "/* WebKit */\n::-webkit-scrollbar { width: " + a.width + "px; height: " + a.width + "px; }\n::-webkit-scrollbar-track { background: " + a.track + "; }\n::-webkit-scrollbar-thumb { background: " + a.thumb + "; border-radius: " + a.width + "px; }\n/* Firefox */\n* { scrollbar-width: thin; scrollbar-color: " + a.thumb + " " + a.track + "; }"; } });
cssTool({ file: "design-ellipsis.html", title: "文本截断生成", desc: "生成单行或多行文本溢出省略号 CSS。", tags: ["ellipsis", "截断", "文字"], order: 2172, fields: [{ id: "lines", label: "行数", type: "select", options: [{ value: "1", label: "单行" }, { value: "2", label: "两行" }, { value: "3", label: "三行" }] }], css: function (a) { if (a.lines === "1") return ".clamp {\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}"; return ".clamp {\n  display: -webkit-box;\n  -webkit-box-orient: vertical;\n  -webkit-line-clamp: " + a.lines + ";\n  overflow: hidden;\n}"; } });
cssTool({ file: "design-sticky.html", title: "吸顶 Sticky 生成", desc: "生成 position: sticky 吸顶导航 CSS。", tags: ["sticky", "吸顶", "CSS"], order: 2173, fields: [], css: function () { return ".header {\n  position: sticky;\n  top: 0;\n  z-index: 10;\n  background: #fff;\n  border-bottom: 1px solid #e2e8f0;\n}"; } });
cssTool({ file: "design-css-vars.html", title: "主题变量生成", desc: "生成浅色 / 深色主题的 CSS 自定义属性（变量）。", tags: ["css-variables", "主题", "CSS"], order: 2174, fields: [{ id: "mode", label: "主题", type: "select", options: [{ value: "light", label: "浅色 light" }, { value: "dark", label: "深色 dark" }] }], css: function (a) { if (a.mode === "dark") return ":root {\n  --bg: #0f172a;\n  --fg: #e2e8f0;\n  --primary: #2dd4bf;\n  --muted: #94a3b8;\n  --surface: #1e293b;\n}"; return ":root {\n  --bg: #ffffff;\n  --fg: #0f172a;\n  --primary: #0f766e;\n  --muted: #64748b;\n  --surface: #f8fafc;\n}"; } });
cssTool({ file: "design-conic-gradient.html", title: "圆锥渐变生成", desc: "生成 conic-gradient 饼图 / 扇形 CSS。", tags: ["conic-gradient", "渐变", "CSS"], order: 2175, fields: [{ id: "c1", label: "起始色", type: "text", value: "#0f766e" }, { id: "c2", label: "结束色", type: "text", value: "#2dd4bf" }], css: function (a) { return ".pie {\n  width: 200px;\n  height: 200px;\n  border-radius: 50%;\n  background: conic-gradient(" + a.c1 + " 0% 50%, " + a.c2 + " 50% 100%);\n}"; } });
cssTool({ file: "design-print.html", title: "打印样式生成", desc: "生成 @media print 打印样式骨架。", tags: ["print", "打印", "CSS"], order: 2176, fields: [], css: function () { return "@media print {\n  body { background: #fff; color: #000; }\n  .no-print { display: none !important; }\n  a[href]::after { content: \" (\" attr(href) \")\"; }\n  @page { margin: 2cm; }\n}"; } });

// ---------- 图片处理（扩充）----------
imgEffectTool({ file: "image-grayscale.html", title: "灰度化", desc: "把图片转为黑白灰度图。", tags: ["灰度", "黑白", "滤镜"], order: 2181, mode: "filter", filter: "grayscale(1)", fields: [] });
imgEffectTool({ file: "image-sepia.html", title: "复古棕调", desc: "给图片添加棕褐色复古滤镜。", tags: ["sepia", "复古", "滤镜"], order: 2182, mode: "filter", filter: "sepia(1)", fields: [] });
imgEffectTool({ file: "image-invert.html", title: "反色", desc: "反转图片颜色（底片效果）。", tags: ["反色", "底片", "滤镜"], order: 2183, mode: "filter", filter: "invert(1)", fields: [] });
imgEffectTool({ file: "image-blur.html", title: "高斯模糊", desc: "按像素半径对图片做模糊处理。", tags: ["模糊", "blur", "滤镜"], order: 2184, mode: "draw", fields: [{ id: "blur", label: "模糊半径 px", type: "number", value: 4, min: 0, max: 30 }], draw: 'ctx.filter="blur("+args.blur+"px)"; ctx.drawImage(img,0,0,w,h);' });
imgEffectTool({ file: "image-brightness.html", title: "亮度调整", desc: "按百分比提升或降低图片亮度。", tags: ["亮度", "brightness", "滤镜"], order: 2185, mode: "draw", fields: [{ id: "v", label: "亮度 %", type: "number", value: 120, min: 0, max: 300 }], draw: 'ctx.filter="brightness("+args.v+"%)"; ctx.drawImage(img,0,0,w,h);' });
imgEffectTool({ file: "image-contrast.html", title: "对比度调整", desc: "按百分比调整图片对比度。", tags: ["对比度", "contrast", "滤镜"], order: 2186, mode: "draw", fields: [{ id: "v", label: "对比度 %", type: "number", value: 130, min: 0, max: 300 }], draw: 'ctx.filter="contrast("+args.v+"%)"; ctx.drawImage(img,0,0,w,h);' });
imgEffectTool({ file: "image-saturate.html", title: "饱和度调整", desc: "按百分比调整图片色彩饱和度。", tags: ["饱和度", "saturate", "滤镜"], order: 2187, mode: "draw", fields: [{ id: "v", label: "饱和度 %", type: "number", value: 150, min: 0, max: 400 }], draw: 'ctx.filter="saturate("+args.v+"%)"; ctx.drawImage(img,0,0,w,h);' });
imgEffectTool({ file: "image-hue-rotate.html", title: "色相旋转", desc: "按角度旋转图片色相。", tags: ["色相", "hue", "滤镜"], order: 2188, mode: "draw", fields: [{ id: "deg", label: "角度 deg", type: "number", value: 90, min: 0, max: 360 }], draw: 'ctx.filter="hue-rotate("+args.deg+"deg)"; ctx.drawImage(img,0,0,w,h);' });
imgEffectTool({ file: "image-posterize.html", title: "色阶量化", desc: "减少颜色层次，做出海报化效果。", tags: ["量化", "posterize", "艺术"], order: 2189, mode: "apply", fields: [{ id: "levels", label: "色阶数", type: "number", value: 4, min: 2, max: 16 }], apply: 'var step=255/(args.levels-1); for(var i=0;i<d.length;i+=4){ d[i]=Math.round(d[i]/step)*step; d[i+1]=Math.round(d[i+1]/step)*step; d[i+2]=Math.round(d[i+2]/step)*step; }' });
imgEffectTool({ file: "image-threshold.html", title: "黑白阈值", desc: "按亮度阈值把图片转换为纯黑白。", tags: ["阈值", "黑白", "二值化"], order: 2190, mode: "apply", fields: [{ id: "t", label: "阈值 0-255", type: "number", value: 128, min: 0, max: 255 }], apply: 'for(var i=0;i<d.length;i+=4){ var v=(d[i]+d[i+1]+d[i+2])/3; var c=v>=args.t?255:0; d[i]=d[i+1]=d[i+2]=c; }' });
imgEffectTool({ file: "image-resize.html", title: "缩放尺寸", desc: "按指定宽度等比缩放图片。", tags: ["缩放", "resize", "尺寸"], order: 2191, mode: "draw", fields: [{ id: "width", label: "目标宽度 px", type: "number", value: 400, min: 16, max: 4000 }], draw: 'var nw=args.width||w; var nh=Math.round(nw*h/w); ctx.canvas.width=nw; ctx.canvas.height=nh; ctx.drawImage(img,0,0,nw,nh);' });
imgEffectTool({ file: "image-rounded-corners.html", title: "圆角裁剪", desc: "把图片裁剪为圆角矩形。", tags: ["圆角", "裁剪", "形状"], order: 2192, mode: "draw", fields: [{ id: "r", label: "圆角半径 px", type: "number", value: 24, min: 0, max: 400 }], draw: 'var rad=args.r; ctx.canvas.width=w; ctx.canvas.height=h; ctx.clearRect(0,0,w,h); ctx.beginPath(); ctx.moveTo(rad,0); ctx.arcTo(w,0,w,h,rad); ctx.arcTo(w,h,0,h,rad); ctx.arcTo(0,h,0,0,rad); ctx.arcTo(0,0,w,0,rad); ctx.closePath(); ctx.clip(); ctx.drawImage(img,0,0,w,h);' });
imgEffectTool({ file: "image-rotate-angle.html", title: "任意角度旋转", desc: "按任意角度旋转图片（自动扩展画布）。", tags: ["旋转", "rotate", "角度"], order: 2193, mode: "draw", fields: [{ id: "angle", label: "角度 deg", type: "number", value: 45, min: -360, max: 360 }], draw: 'var a=args.angle*Math.PI/180, c=Math.abs(Math.cos(a)), s=Math.abs(Math.sin(a)); var nw=Math.round(w*c+h*s), nh=Math.round(w*s+h*c); ctx.canvas.width=nw; ctx.canvas.height=nh; ctx.translate(nw/2,nh/2); ctx.rotate(a); ctx.drawImage(img,-w/2,-h/2);' });
imgEffectTool({ file: "image-watermark.html", title: "添加水印", desc: "在图片右下角叠加半透明文字水印。", tags: ["水印", "watermark", "文字"], order: 2194, mode: "draw", fields: [{ id: "text", label: "水印文字", type: "text", value: "SAMPLE" }, { id: "size", label: "字号 px", type: "number", value: 28, min: 8, max: 120 }], draw: 'ctx.drawImage(img,0,0,w,h); var fs=args.size||28; ctx.font=fs+"px sans-serif"; ctx.fillStyle="rgba(255,255,255,0.55)"; ctx.textAlign="right"; ctx.textBaseline="bottom"; ctx.fillText(args.text||"SAMPLE", w-fs/4, h-fs/4);' });
imgEffectTool({ file: "image-border-padding.html", title: "加边距留白", desc: "给图片四周添加纯色留白边框。", tags: ["边框", "留白", "padding"], order: 2195, mode: "draw", fields: [{ id: "pad", label: "留白 px", type: "number", value: 24, min: 0, max: 200 }, { id: "color", label: "颜色", type: "text", value: "#ffffff" }], draw: 'var p=args.pad||0; ctx.canvas.width=w+2*p; ctx.canvas.height=h+2*p; ctx.fillStyle=args.color||"#fff"; ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height); ctx.drawImage(img,p,p,w,h);' });
imgEffectTool({ file: "image-mirror.html", title: "镜像翻转", desc: "水平或垂直镜像翻转图片。", tags: ["镜像", "翻转", "mirror"], order: 2196, mode: "draw", fields: [{ id: "dir", label: "方向", type: "select", options: [{ value: "h", label: "水平" }, { value: "v", label: "垂直" }] }], draw: 'if(args.dir==="v"){ ctx.translate(0,h); ctx.scale(1,-1); } else { ctx.translate(w,0); ctx.scale(-1,1); } ctx.drawImage(img,0,0,w,h);' });

// ---------- 计算器：数学 / 几何 / 物理 / 金融（扩充）----------
calcTool({ file: "math-prime-factorization.html", title: "质因数分解", desc: "把正整数分解为质因数乘积。", tags: ["质因数", "分解", "数学"], order: 2201, fields: [{ id: "n", label: "正整数 n", type: "number", value: 60, min: 2, max: 1000000 }], outputs: [{ id: "res", label: "分解结果" }], compute: function (a) { var n = Math.floor(Math.abs(a.n)); if (n < 2) return { res: "无质因数" }; var f = [], d = 2; while (d * d <= n) { while (n % d === 0) { f.push(d); n /= d; } d++; } if (n > 1) f.push(n); return { res: f.join(" × ") }; } });
calcTool({ file: "math-factorial.html", title: "阶乘", desc: "计算 n 的阶乘（0–20）。", tags: ["阶乘", "数学"], order: 2202, fields: [{ id: "n", label: "n", type: "number", value: 5, min: 0, max: 20 }], outputs: [{ id: "res", label: "n!" }], compute: function (a) { var n = Math.floor(a.n), r = 1; for (var i = 2; i <= n; i++) r *= i; return { res: r }; } });
calcTool({ file: "math-modulo.html", title: "取模运算", desc: "计算 a 除以 b 的余数。", tags: ["取模", "余数", "数学"], order: 2203, fields: [{ id: "a", label: "a", type: "number", value: 17 }, { id: "b", label: "b", type: "number", value: 5 }], outputs: [{ id: "res", label: "a mod b" }], compute: function (a) { return { res: a.b === 0 ? "除数不能为 0" : a.a % a.b }; } });
calcTool({ file: "math-power.html", title: "幂运算", desc: "计算 base 的 exp 次方。", tags: ["幂", "指数", "数学"], order: 2204, fields: [{ id: "base", label: "底数", type: "number", value: 2 }, { id: "exp", label: "指数", type: "number", value: 10 }], outputs: [{ id: "res", label: "结果" }], formulas: [{ id: "res", expr: "Math.pow(base,exp)" }] });
calcTool({ file: "math-log.html", title: "对数计算", desc: "同时给出常用对数 log₁₀ 与自然对数 ln。", tags: ["对数", "数学"], order: 2205, fields: [{ id: "x", label: "x（正数）", type: "number", value: 100, min: 0.0001 }], outputs: [{ id: "lg", label: "log₁₀(x)" }, { id: "ln", label: "ln(x)" }], formulas: [{ id: "lg", expr: "Math.log10(x)" }, { id: "ln", expr: "Math.log(x)" }] });
calcTool({ file: "math-pythagoras.html", title: "勾股定理", desc: "已知两直角边求斜边 c。", tags: ["勾股", "三角形", "数学"], order: 2206, fields: [{ id: "a", label: "直角边 a", type: "number", value: 3 }, { id: "b", label: "直角边 b", type: "number", value: 4 }], outputs: [{ id: "c", label: "斜边 c" }], formulas: [{ id: "c", expr: "Math.sqrt(a*a+b*b)" }] });
calcTool({ file: "math-percent-change.html", title: "百分比变化", desc: "计算从旧值到新值的增减百分比。", tags: ["百分比", "变化", "数学"], order: 2207, fields: [{ id: "old", label: "原值", type: "number", value: 100 }, { id: "nw", label: "新值", type: "number", value: 120 }], outputs: [{ id: "p", label: "变化 %" }], compute: function (a) { return { p: a.old === 0 ? "原值不能为 0" : ((a.nw - a.old) / a.old * 100) }; } });
calcTool({ file: "math-slope.html", title: "直线斜率", desc: "由两点 (x1,y1)、(x2,y2) 计算斜率。", tags: ["斜率", "坐标", "数学"], order: 2208, fields: [{ id: "x1", label: "x1", type: "number", value: 0 }, { id: "y1", label: "y1", type: "number", value: 0 }, { id: "x2", label: "x2", type: "number", value: 4 }, { id: "y2", label: "y2", type: "number", value: 8 }], outputs: [{ id: "m", label: "斜率 m" }], compute: function (a) { return { m: a.x2 === a.x1 ? "斜率不存在" : (a.y2 - a.y1) / (a.x2 - a.x1) }; } });
calcTool({ file: "math-distance2d.html", title: "两点距离", desc: "计算平面上两点间的直线距离。", tags: ["距离", "坐标", "数学"], order: 2209, fields: [{ id: "x1", label: "x1", type: "number", value: 0 }, { id: "y1", label: "y1", type: "number", value: 0 }, { id: "x2", label: "x2", type: "number", value: 3 }, { id: "y2", label: "y2", type: "number", value: 4 }], outputs: [{ id: "d", label: "距离" }], formulas: [{ id: "d", expr: "Math.hypot(x2-x1,y2-y1)" }] });
calcTool({ file: "geo-triangle-area.html", title: "三角形面积", desc: "由底和高计算三角形面积。", tags: ["三角形", "面积", "几何"], order: 2210, fields: [{ id: "base", label: "底", type: "number", value: 10 }, { id: "h", label: "高", type: "number", value: 6 }], outputs: [{ id: "area", label: "面积" }], formulas: [{ id: "area", expr: "base*h/2" }] });
calcTool({ file: "geo-circle.html", title: "圆面积与周长", desc: "由半径计算圆的面积与周长。", tags: ["圆", "面积", "几何"], order: 2211, fields: [{ id: "r", label: "半径 r", type: "number", value: 5 }], outputs: [{ id: "area", label: "面积" }, { id: "circ", label: "周长" }], formulas: [{ id: "area", expr: "Math.PI*r*r" }, { id: "circ", expr: "2*Math.PI*r" }] });
calcTool({ file: "geo-rectangle.html", title: "矩形面积与周长", desc: "由长和宽计算矩形面积与周长。", tags: ["矩形", "面积", "几何"], order: 2212, fields: [{ id: "w", label: "宽", type: "number", value: 8 }, { id: "h", label: "高", type: "number", value: 5 }], outputs: [{ id: "area", label: "面积" }, { id: "peri", label: "周长" }], formulas: [{ id: "area", expr: "w*h" }, { id: "peri", expr: "2*(w+h)" }] });
calcTool({ file: "geo-trapezoid.html", title: "梯形面积", desc: "由上下底和高计算梯形面积。", tags: ["梯形", "面积", "几何"], order: 2213, fields: [{ id: "a", label: "上底", type: "number", value: 4 }, { id: "b", label: "下底", type: "number", value: 8 }, { id: "h", label: "高", type: "number", value: 5 }], outputs: [{ id: "area", label: "面积" }], formulas: [{ id: "area", expr: "(a+b)*h/2" }] });
calcTool({ file: "geo-parallelogram.html", title: "平行四边形面积", desc: "由底和高计算平行四边形面积。", tags: ["平行四边形", "面积", "几何"], order: 2214, fields: [{ id: "base", label: "底", type: "number", value: 10 }, { id: "h", label: "高", type: "number", value: 6 }], outputs: [{ id: "area", label: "面积" }], formulas: [{ id: "area", expr: "base*h" }] });
calcTool({ file: "geo-rhombus.html", title: "菱形面积", desc: "由两条对角线计算菱形面积。", tags: ["菱形", "面积", "几何"], order: 2215, fields: [{ id: "d1", label: "对角线 1", type: "number", value: 10 }, { id: "d2", label: "对角线 2", type: "number", value: 6 }], outputs: [{ id: "area", label: "面积" }], formulas: [{ id: "area", expr: "d1*d2/2" }] });
calcTool({ file: "geo-ellipse.html", title: "椭圆面积", desc: "由半长轴与半短轴计算椭圆面积。", tags: ["椭圆", "面积", "几何"], order: 2216, fields: [{ id: "a", label: "半长轴 a", type: "number", value: 6 }, { id: "b", label: "半短轴 b", type: "number", value: 4 }], outputs: [{ id: "area", label: "面积" }], formulas: [{ id: "area", expr: "Math.PI*a*b" }] });
calcTool({ file: "geo-regular-polygon.html", title: "正多边形面积", desc: "由边数与边长计算正多边形面积与周长。", tags: ["多边形", "面积", "几何"], order: 2217, fields: [{ id: "n", label: "边数 n", type: "number", value: 6, min: 3, max: 100 }, { id: "s", label: "边长", type: "number", value: 5 }], outputs: [{ id: "area", label: "面积" }, { id: "peri", label: "周长" }], compute: function (a) { var n = Math.max(3, a.n | 0); return { area: n * a.s * a.s / (4 * Math.tan(Math.PI / n)), peri: n * a.s }; } });
calcTool({ file: "geo-sphere.html", title: "球体积与表面积", desc: "由半径计算球的体积与表面积。", tags: ["球", "体积", "几何"], order: 2218, fields: [{ id: "r", label: "半径 r", type: "number", value: 5 }], outputs: [{ id: "vol", label: "体积" }, { id: "surf", label: "表面积" }], formulas: [{ id: "vol", expr: "4/3*Math.PI*r*r*r" }, { id: "surf", expr: "4*Math.PI*r*r" }] });
calcTool({ file: "geo-cylinder.html", title: "圆柱体积与表面积", desc: "由半径与高计算圆柱体积与表面积。", tags: ["圆柱", "体积", "几何"], order: 2219, fields: [{ id: "r", label: "半径 r", type: "number", value: 4 }, { id: "h", label: "高 h", type: "number", value: 10 }], outputs: [{ id: "vol", label: "体积" }, { id: "surf", label: "表面积" }], formulas: [{ id: "vol", expr: "Math.PI*r*r*h" }, { id: "surf", expr: "2*Math.PI*r*(r+h)" }] });
calcTool({ file: "geo-cone.html", title: "圆锥体积与表面积", desc: "由半径与高计算圆锥体积与表面积。", tags: ["圆锥", "体积", "几何"], order: 2220, fields: [{ id: "r", label: "半径 r", type: "number", value: 4 }, { id: "h", label: "高 h", type: "number", value: 10 }], outputs: [{ id: "vol", label: "体积" }, { id: "surf", label: "表面积" }], compute: function (a) { var slant = Math.sqrt(a.r * a.r + a.h * a.h); return { vol: Math.PI * a.r * a.r * a.h / 3, surf: Math.PI * a.r * (a.r + slant) }; } });
calcTool({ file: "geo-pyramid.html", title: "棱锥体积", desc: "由底面积与高计算棱锥体积。", tags: ["棱锥", "体积", "几何"], order: 2221, fields: [{ id: "baseArea", label: "底面积", type: "number", value: 20 }, { id: "h", label: "高", type: "number", value: 9 }], outputs: [{ id: "vol", label: "体积" }], formulas: [{ id: "vol", expr: "baseArea*h/3" }] });
calcTool({ file: "geo-torus.html", title: "环体体积与表面积", desc: "由大半径 R 与管半径 r 计算环体体积与表面积。", tags: ["环体", "体积", "几何"], order: 2222, fields: [{ id: "R", label: "大半径 R", type: "number", value: 8 }, { id: "r", label: "管半径 r", type: "number", value: 3 }], outputs: [{ id: "vol", label: "体积" }, { id: "surf", label: "表面积" }], formulas: [{ id: "vol", expr: "2*Math.PI*Math.PI*R*r*r" }, { id: "surf", expr: "4*Math.PI*Math.PI*R*r" }] });
calcTool({ file: "geo-cube.html", title: "正方体体积与表面积", desc: "由边长计算正方体体积与表面积。", tags: ["正方体", "体积", "几何"], order: 2223, fields: [{ id: "a", label: "边长 a", type: "number", value: 5 }], outputs: [{ id: "vol", label: "体积" }, { id: "surf", label: "表面积" }], formulas: [{ id: "vol", expr: "Math.pow(a,3)" }, { id: "surf", expr: "6*a*a" }] });
calcTool({ file: "geo-diagonal.html", title: "矩形对角线", desc: "由宽高计算矩形对角线长度。", tags: ["对角线", "矩形", "几何"], order: 2224, fields: [{ id: "w", label: "宽", type: "number", value: 8 }, { id: "h", label: "高", type: "number", value: 6 }], outputs: [{ id: "d", label: "对角线" }], formulas: [{ id: "d", expr: "Math.hypot(w,h)" }] });
calcTool({ file: "phys-kinetic.html", title: "动能", desc: "由质量与速度计算动能 E=½mv²。", tags: ["动能", "物理", "能量"], order: 2225, fields: [{ id: "m", label: "质量 m (kg)", type: "number", value: 2 }, { id: "v", label: "速度 v (m/s)", type: "number", value: 10 }], outputs: [{ id: "e", label: "动能 (J)" }], formulas: [{ id: "e", expr: "0.5*m*v*v" }] });
calcTool({ file: "phys-potential.html", title: "重力势能", desc: "由质量与高度计算重力势能 E=mgh。", tags: ["势能", "物理", "能量"], order: 2226, fields: [{ id: "m", label: "质量 m (kg)", type: "number", value: 2 }, { id: "h", label: "高度 h (m)", type: "number", value: 10 }], outputs: [{ id: "e", label: "势能 (J)" }], formulas: [{ id: "e", expr: "m*9.81*h" }] });
calcTool({ file: "phys-work.html", title: "做功", desc: "由力与位移计算做功 W=F·d。", tags: ["功", "物理", "力"], order: 2227, fields: [{ id: "f", label: "力 F (N)", type: "number", value: 10 }, { id: "d", label: "位移 d (m)", type: "number", value: 5 }], outputs: [{ id: "w", label: "功 (J)" }], formulas: [{ id: "w", expr: "f*d" }] });
calcTool({ file: "phys-power-fv.html", title: "机械功率", desc: "由力与速度计算功率 P=F·v。", tags: ["功率", "物理", "力"], order: 2228, fields: [{ id: "f", label: "力 F (N)", type: "number", value: 10 }, { id: "v", label: "速度 v (m/s)", type: "number", value: 3 }], outputs: [{ id: "p", label: "功率 (W)" }], formulas: [{ id: "p", expr: "f*v" }] });
calcTool({ file: "phys-pressure.html", title: "压强", desc: "由压力与面积计算压强 P=F/A。", tags: ["压强", "物理", "力"], order: 2229, fields: [{ id: "f", label: "压力 F (N)", type: "number", value: 100 }, { id: "a", label: "面积 A (m²)", type: "number", value: 2 }], outputs: [{ id: "p", label: "压强 (Pa)" }], formulas: [{ id: "p", expr: "f/a" }] });
calcTool({ file: "phys-density.html", title: "密度", desc: "由质量与体积计算密度 ρ=m/V。", tags: ["密度", "物理", "物质"], order: 2230, fields: [{ id: "m", label: "质量 m (kg)", type: "number", value: 10 }, { id: "v", label: "体积 V (m³)", type: "number", value: 2 }], outputs: [{ id: "rho", label: "密度 (kg/m³)" }], formulas: [{ id: "rho", expr: "m/v" }] });
calcTool({ file: "phys-force.html", title: "牛顿第二定律", desc: "由质量与加速度计算合力 F=ma。", tags: ["力", "物理", "牛顿"], order: 2231, fields: [{ id: "m", label: "质量 m (kg)", type: "number", value: 5 }, { id: "a", label: "加速度 a (m/s²)", type: "number", value: 2 }], outputs: [{ id: "f", label: "力 (N)" }], formulas: [{ id: "f", expr: "m*a" }] });
calcTool({ file: "phys-momentum.html", title: "动量", desc: "由质量与速度计算动量 p=mv。", tags: ["动量", "物理"], order: 2232, fields: [{ id: "m", label: "质量 m (kg)", type: "number", value: 5 }, { id: "v", label: "速度 v (m/s)", type: "number", value: 8 }], outputs: [{ id: "p", label: "动量 (kg·m/s)" }], formulas: [{ id: "p", expr: "m*v" }] });
calcTool({ file: "phys-centripetal.html", title: "向心力", desc: "由质量、速度与半径计算向心力 F=mv²/r。", tags: ["向心力", "物理", "圆周"], order: 2233, fields: [{ id: "m", label: "质量 m (kg)", type: "number", value: 2 }, { id: "v", label: "速度 v (m/s)", type: "number", value: 10 }, { id: "r", label: "半径 r (m)", type: "number", value: 5 }], outputs: [{ id: "f", label: "向心力 (N)" }], formulas: [{ id: "f", expr: "m*v*v/r" }] });
calcTool({ file: "phys-period-pendulum.html", title: "单摆周期", desc: "由摆长计算单摆周期 T=2π√(L/g)。", tags: ["单摆", "周期", "物理"], order: 2234, fields: [{ id: "l", label: "摆长 L (m)", type: "number", value: 1 }], outputs: [{ id: "t", label: "周期 (s)" }], formulas: [{ id: "t", expr: "2*Math.PI*Math.sqrt(l/9.81)" }] });
calcTool({ file: "phys-wave-speed.html", title: "波速", desc: "由频率与波长计算波速 v=f·λ。", tags: ["波速", "物理", "波"], order: 2235, fields: [{ id: "f", label: "频率 f (Hz)", type: "number", value: 440 }, { id: "lambda", label: "波长 λ (m)", type: "number", value: 0.78 }], outputs: [{ id: "v", label: "波速 (m/s)" }], formulas: [{ id: "v", expr: "f*lambda" }] });
calcTool({ file: "phys-ohms.html", title: "欧姆定律", desc: "由电压与电流计算电阻与功率。", tags: ["欧姆", "电", "物理"], order: 2236, fields: [{ id: "v", label: "电压 V (V)", type: "number", value: 12 }, { id: "i", label: "电流 I (A)", type: "number", value: 2 }], outputs: [{ id: "r", label: "电阻 (Ω)" }, { id: "p", label: "功率 (W)" }], compute: function (a) { return { r: a.i === 0 ? "电流不能为 0" : a.v / a.i, p: a.v * a.i }; } });
calcTool({ file: "phys-charge.html", title: "电荷量", desc: "由电流与时间计算电荷量 Q=I·t。", tags: ["电荷", "电", "物理"], order: 2237, fields: [{ id: "i", label: "电流 I (A)", type: "number", value: 2 }, { id: "t", label: "时间 t (s)", type: "number", value: 60 }], outputs: [{ id: "q", label: "电荷量 (C)" }], formulas: [{ id: "q", expr: "i*t" }] });
calcTool({ file: "phys-heat.html", title: "热量 Q=mcΔT", desc: "由质量、比热容与温差计算热量。", tags: ["热量", "物理", "热"], order: 2238, fields: [{ id: "m", label: "质量 m (kg)", type: "number", value: 1 }, { id: "c", label: "比热容 c (J/kg·℃)", type: "number", value: 4186 }, { id: "dt", label: "温差 ΔT (℃)", type: "number", value: 50 }], outputs: [{ id: "q", label: "热量 (J)" }], formulas: [{ id: "q", expr: "m*c*dt" }] });
calcTool({ file: "phys-projectile-range.html", title: "抛射射程", desc: "由初速度与仰角计算水平射程 R=v²sin2θ/g。", tags: ["射程", "抛体", "物理"], order: 2239, fields: [{ id: "v", label: "初速 v (m/s)", type: "number", value: 20 }, { id: "theta", label: "仰角 θ (°)", type: "number", value: 45 }], outputs: [{ id: "r", label: "射程 (m)" }], compute: function (a) { var t = a.theta * Math.PI / 180; return { r: a.v * a.v * Math.sin(2 * t) / 9.81 }; } });
calcTool({ file: "phys-escape-velocity.html", title: "逃逸速度", desc: "由天体质量与半径计算逃逸速度。", tags: ["逃逸速度", "物理", "天体"], order: 2240, fields: [{ id: "M", label: "质量 M (kg)", type: "number", value: 5.972e24 }, { id: "R", label: "半径 R (m)", type: "number", value: 6371000 }], outputs: [{ id: "v", label: "逃逸速度 (m/s)" }], compute: function (a) { return { v: Math.sqrt(2 * 6.674e-11 * a.M / a.R) }; } });
calcTool({ file: "phys-gravitational.html", title: "万有引力", desc: "由两物体质量与距离计算引力 F=Gm₁m₂/r²。", tags: ["引力", "物理", "牛顿"], order: 2241, fields: [{ id: "m1", label: "质量 m₁ (kg)", type: "number", value: 5.972e24 }, { id: "m2", label: "质量 m₂ (kg)", type: "number", value: 7.348e22 }, { id: "r", label: "距离 r (m)", type: "number", value: 384400000 }], outputs: [{ id: "f", label: "引力 (N)" }], compute: function (a) { return { f: 6.674e-11 * a.m1 * a.m2 / (a.r * a.r) }; } });
calcTool({ file: "fin-compound.html", title: "复利计算", desc: "由本金、年利率、年限与复利次数计算到期总额与利息。", tags: ["复利", "金融", "利息"], order: 2242, fields: [{ id: "P", label: "本金", type: "number", value: 10000 }, { id: "r", label: "年利率 %", type: "number", value: 5 }, { id: "t", label: "年限", type: "number", value: 10 }, { id: "n", label: "每年复利次数", type: "number", value: 12, min: 1, max: 365 }], outputs: [{ id: "A", label: "到期总额" }, { id: "I", label: "利息" }], compute: function (a) { var rr = a.r / 100, A = a.P * Math.pow(1 + rr / a.n, a.n * a.t); return { A: A, I: A - a.P }; } });
calcTool({ file: "fin-simple.html", title: "单利计算", desc: "由本金、年利率与年限计算单利到期总额与利息。", tags: ["单利", "金融", "利息"], order: 2243, fields: [{ id: "P", label: "本金", type: "number", value: 10000 }, { id: "r", label: "年利率 %", type: "number", value: 5 }, { id: "t", label: "年限", type: "number", value: 10 }], outputs: [{ id: "A", label: "到期总额" }, { id: "I", label: "利息" }], compute: function (a) { var A = a.P * (1 + a.r / 100 * a.t); return { A: A, I: A - a.P }; } });
calcTool({ file: "fin-roi.html", title: "投资回报率 ROI", desc: "由成本与收益计算利润与投资回报率。", tags: ["ROI", "金融", "回报"], order: 2244, fields: [{ id: "cost", label: "成本", type: "number", value: 1000 }, { id: "gain", label: "收益", type: "number", value: 1500 }], outputs: [{ id: "profit", label: "利润" }, { id: "roi", label: "ROI %" }], compute: function (a) { return { profit: a.gain - a.cost, roi: a.cost === 0 ? "成本不能为 0" : (a.gain - a.cost) / a.cost * 100 }; } });
calcTool({ file: "fin-cagr.html", title: "复合年增长率", desc: "由期初、期末值与年限计算 CAGR。", tags: ["CAGR", "金融", "增长"], order: 2245, fields: [{ id: "begin", label: "期初值", type: "number", value: 1000 }, { id: "end", label: "期末值", type: "number", value: 2000 }, { id: "years", label: "年限", type: "number", value: 5 }], outputs: [{ id: "cagr", label: "CAGR %" }], compute: function (a) { return { cagr: a.begin <= 0 || a.years <= 0 ? "参数无效" : (Math.pow(a.end / a.begin, 1 / a.years) - 1) * 100 }; } });
calcTool({ file: "fin-vat.html", title: "增值税计算", desc: "由金额与税率计算税额与含税价。", tags: ["增值税", "金融", "税"], order: 2246, fields: [{ id: "price", label: "金额", type: "number", value: 100 }, { id: "rate", label: "税率 %", type: "number", value: 13 }], outputs: [{ id: "vat", label: "税额" }, { id: "total", label: "含税价" }], formulas: [{ id: "vat", expr: "price*rate/100" }, { id: "total", expr: "price*(1+rate/100)" }] });
calcTool({ file: "fin-tip.html", title: "小费计算", desc: "由账单金额与比例计算小费与总额。", tags: ["小费", "金融", "消费"], order: 2247, fields: [{ id: "bill", label: "账单", type: "number", value: 200 }, { id: "pct", label: "比例 %", type: "number", value: 10 }], outputs: [{ id: "tip", label: "小费" }, { id: "total", label: "总额" }], formulas: [{ id: "tip", expr: "bill*pct/100" }, { id: "total", expr: "bill*(1+pct/100)" }] });
calcTool({ file: "fin-discount.html", title: "折扣计算", desc: "由原价与折扣比例计算折后价与节省。", tags: ["折扣", "金融", "购物"], order: 2248, fields: [{ id: "price", label: "原价", type: "number", value: 100 }, { id: "pct", label: "折扣 %", type: "number", value: 20 }], outputs: [{ id: "final", label: "折后价" }, { id: "saved", label: "节省" }], formulas: [{ id: "final", expr: "price*(1-pct/100)" }, { id: "saved", expr: "price*pct/100" }] });
calcTool({ file: "fin-rule72.html", title: "72 法则", desc: "估算资金翻倍所需年限：72 ÷ 年化利率。", tags: ["72法则", "金融", "复利"], order: 2249, fields: [{ id: "rate", label: "年化利率 %", type: "number", value: 6 }], outputs: [{ id: "years", label: "翻倍年限" }], compute: function (a) { return { years: a.rate <= 0 ? "利率需为正" : 72 / a.rate }; } });
calcTool({ file: "fin-breakeven.html", title: "盈亏平衡点", desc: "由固定成本、单价与单位变动成本计算保本销量。", tags: ["盈亏平衡", "金融", "商业"], order: 2250, fields: [{ id: "fixed", label: "固定成本", type: "number", value: 10000 }, { id: "price", label: "单价", type: "number", value: 50 }, { id: "variable", label: "单位变动成本", type: "number", value: 30 }], outputs: [{ id: "q", label: "保本销量" }, { id: "rev", label: "保本营收" }], compute: function (a) { var cm = a.price - a.variable; return { q: cm <= 0 ? "单位边际贡献需为正" : a.fixed / cm, rev: cm <= 0 ? "—" : a.fixed / cm * a.price }; } });

// ---------- 单位换算（补充）+ 健康 / 日期 / 统计（扩充）----------
unitConvTool({ file: "unit-density.html", title: "密度换算", desc: "在 kg/m³、g/cm³、lb/ft³、lb/in³ 之间换算。", tags: ["密度", "换算", "单位"], order: 2261, fromLabel: "从", toLabel: "到", units: [{ name: "kg/m³", factor: 1 }, { name: "g/cm³", factor: 1000 }, { name: "lb/ft³", factor: 16.018463373960138 }, { name: "lb/in³", factor: 27679.9047102031 }] });
unitConvTool({ file: "unit-cooking-volume.html", title: "烹饪体积换算", desc: "在 ml、L、杯(cup)、汤匙(tbsp)、茶匙(tsp)、液量盎司(fl oz) 之间换算。", tags: ["烹饪", "体积", "换算"], order: 2262, fromLabel: "从", toLabel: "到", units: [{ name: "毫升 ml", factor: 1 }, { name: "升 L", factor: 1000 }, { name: "杯 cup", factor: 240 }, { name: "汤匙 tbsp", factor: 15 }, { name: "茶匙 tsp", factor: 5 }, { name: "液量盎司 fl oz", factor: 29.5735295625 }] });
unitConvTool({ file: "unit-cooking-weight.html", title: "烹饪重量换算", desc: "在 g、kg、盎司(oz)、磅(lb) 之间换算。", tags: ["烹饪", "重量", "换算"], order: 2263, fromLabel: "从", toLabel: "到", units: [{ name: "克 g", factor: 1 }, { name: "千克 kg", factor: 1000 }, { name: "盎司 oz", factor: 28.349523125 }, { name: "磅 lb", factor: 453.59237 }] });
calcTool({ file: "health-bmr.html", title: "基础代谢率 BMR", desc: "用 Harris-Benedict 公式估算每日基础代谢。", tags: ["BMR", "代谢", "健康"], order: 2264, fields: [{ id: "sex", label: "性别", type: "select", options: [{ value: "M", label: "男" }, { value: "F", label: "女" }] }, { id: "weight", label: "体重 (kg)", type: "number", value: 65 }, { id: "height", label: "身高 (cm)", type: "number", value: 170 }, { id: "age", label: "年龄", type: "number", value: 30 }], outputs: [{ id: "bmr", label: "BMR (kcal/天)" }], compute: function (a) { var bmr = a.sex === "F" ? 447.593 + 9.247 * a.weight + 3.098 * a.height - 4.330 * a.age : 88.362 + 13.397 * a.weight + 4.799 * a.height - 5.677 * a.age; return { bmr: bmr }; } });
calcTool({ file: "health-tdee.html", title: "每日总消耗 TDEE", desc: "在 BMR 基础上按活动量估算每日总热量消耗。", tags: ["TDEE", "热量", "健康"], order: 2265, fields: [{ id: "sex", label: "性别", type: "select", options: [{ value: "M", label: "男" }, { value: "F", label: "女" }] }, { id: "weight", label: "体重 (kg)", type: "number", value: 65 }, { id: "height", label: "身高 (cm)", type: "number", value: 170 }, { id: "age", label: "年龄", type: "number", value: 30 }, { id: "activity", label: "活动量", type: "select", options: [{ value: "1.2", label: "久坐" }, { value: "1.375", label: "轻度" }, { value: "1.55", label: "中度" }, { value: "1.725", label: "高度" }, { value: "1.9", label: "极高" }] }], outputs: [{ id: "bmr", label: "BMR (kcal)" }, { id: "tdee", label: "TDEE (kcal)" }], compute: function (a) { var bmr = a.sex === "F" ? 447.593 + 9.247 * a.weight + 3.098 * a.height - 4.330 * a.age : 88.362 + 13.397 * a.weight + 4.799 * a.height - 5.677 * a.age; return { bmr: bmr, tdee: bmr * parseFloat(a.activity) }; } });
calcTool({ file: "health-ideal-weight.html", title: "理想体重", desc: "按 BMI=22 估算理想体重及健康范围。", tags: ["理想体重", "BMI", "健康"], order: 2266, fields: [{ id: "height", label: "身高 (cm)", type: "number", value: 170 }], outputs: [{ id: "ideal", label: "理想体重 (kg)" }, { id: "min", label: "下限 (kg)" }, { id: "max", label: "上限 (kg)" }], compute: function (a) { var m = a.height / 100; return { ideal: 22 * m * m, min: 18.5 * m * m, max: 24.9 * m * m }; } });
calcTool({ file: "health-body-fat.html", title: "体脂率估算", desc: "用美国海军法由围度估算体脂率（需腰/颈/身高，女性加臀围）。", tags: ["体脂率", "健康", "围度"], order: 2267, fields: [{ id: "sex", label: "性别", type: "select", options: [{ value: "M", label: "男" }, { value: "F", label: "女" }] }, { id: "waist", label: "腰围 (cm)", type: "number", value: 80 }, { id: "neck", label: "颈围 (cm)", type: "number", value: 36 }, { id: "height", label: "身高 (cm)", type: "number", value: 170 }, { id: "hip", label: "臀围 (cm)（女性）", type: "number", value: 95 }], outputs: [{ id: "bf", label: "体脂率 %" }], compute: function (a) { var bmr; if (a.sex === "F") bmr = 495 / (1.29579 - 0.35004 * Math.log10(a.waist + a.hip - a.neck) + 0.22100 * Math.log10(a.height)) - 450; else bmr = 495 / (1.0324 - 0.19077 * Math.log10(a.waist - a.neck) + 0.15456 * Math.log10(a.height)) - 450; return { bf: bmr }; } });
calcTool({ file: "health-heart-zones.html", title: "心率区间", desc: "由年龄估算最大心率与燃脂 / 心肺区间。", tags: ["心率", "运动", "健康"], order: 2268, fields: [{ id: "age", label: "年龄", type: "number", value: 30 }], outputs: [{ id: "max", label: "最大心率" }, { id: "fat", label: "燃脂区间 (~60%)" }, { id: "cardio", label: "心肺区间 (~80%)" }], compute: function (a) { var max = 220 - a.age; return { max: max, fat: Math.round(max * 0.6), cardio: Math.round(max * 0.8) }; } });
calcTool({ file: "health-pregnancy-due.html", title: "预产期推算", desc: "由末次月经日期推算预产期（40 周法）。", tags: ["预产期", "孕期", "健康"], order: 2269, fields: [{ id: "lmp", label: "末次月经", type: "date", value: "2026-01-01" }], outputs: [{ id: "due", label: "预产期" }], compute: function (a) { var d = new Date(a.lmp); if (isNaN(d)) return { due: "日期无效" }; d.setDate(d.getDate() + 280); return { due: d.toISOString().slice(0, 10) }; } });
calcTool({ file: "date-add-days.html", title: "日期加天数", desc: "在给定日期上增加或减少若干天。", tags: ["日期", "加减", "时间"], order: 2270, fields: [{ id: "date", label: "日期", type: "date", value: "2026-01-01" }, { id: "days", label: "天数（可负）", type: "number", value: 30 }], outputs: [{ id: "res", label: "结果日期" }], compute: function (a) { var d = new Date(a.date); if (isNaN(d)) return { res: "日期无效" }; d.setDate(d.getDate() + a.days); return { res: d.toISOString().slice(0, 10) }; } });
calcTool({ file: "date-between.html", title: "两日相差天数", desc: "计算两个日期之间相差的天数。", tags: ["日期", "相差", "时间"], order: 2271, fields: [{ id: "d1", label: "起始日期", type: "date", value: "2026-01-01" }, { id: "d2", label: "结束日期", type: "date", value: "2026-12-31" }], outputs: [{ id: "days", label: "相差天数" }], compute: function (a) { var s = new Date(a.d1), e = new Date(a.d2); if (isNaN(s) || isNaN(e)) return { days: "日期无效" }; return { days: Math.round(Math.abs(e - s) / 86400000) }; } });
calcTool({ file: "date-age.html", title: "年龄计算", desc: "由出生日期计算精确年龄（岁、月、天）。", tags: ["年龄", "日期", "时间"], order: 2272, fields: [{ id: "birth", label: "出生日期", type: "date", value: "1990-06-15" }], outputs: [{ id: "res", label: "年龄" }], compute: function (a) { var b = new Date(a.birth), n = new Date(); if (isNaN(b)) return { res: "日期无效" }; var y = n.getFullYear() - b.getFullYear(), m = n.getMonth() - b.getMonth(), d = n.getDate() - b.getDate(); if (d < 0) { m--; var pm = new Date(n.getFullYear(), n.getMonth(), 0).getDate(); d += pm; } if (m < 0) { y--; m += 12; } return { res: y + " 岁 " + m + " 个月 " + d + " 天" }; } });
calcTool({ file: "date-weekday.html", title: "星期查询", desc: "查询某个日期是星期几。", tags: ["星期", "日期", "时间"], order: 2273, fields: [{ id: "date", label: "日期", type: "date", value: "2026-01-01" }], outputs: [{ id: "res", label: "星期" }], compute: function (a) { var d = new Date(a.date); if (isNaN(d)) return { res: "日期无效" }; var n = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]; return { res: n[d.getDay()] }; } });
calcTool({ file: "date-workdays.html", title: "工作日天数", desc: "计算两个日期之间（含端点）的工作日（周一至周五）天数。", tags: ["工作日", "日期", "时间"], order: 2274, fields: [{ id: "d1", label: "起始日期", type: "date", value: "2026-01-01" }, { id: "d2", label: "结束日期", type: "date", value: "2026-01-31" }], outputs: [{ id: "days", label: "工作日" }], compute: function (a) { var s = new Date(a.d1), e = new Date(a.d2); if (isNaN(s) || isNaN(e)) return { days: "日期无效" }; if (s > e) { var t = s; s = e; e = t; } var c = 0; while (s <= e) { var day = s.getDay(); if (day !== 0 && day !== 6) c++; s.setDate(s.getDate() + 1); } return { days: c }; } });
calcTool({ file: "date-days-in-month.html", title: "当月天数", desc: "查询某年某月有多少天（含闰年判断）。", tags: ["天数", "日历", "时间"], order: 2275, fields: [{ id: "year", label: "年份", type: "number", value: 2026 }, { id: "month", label: "月份 (1-12)", type: "number", value: 2, min: 1, max: 12 }], outputs: [{ id: "days", label: "天数" }], compute: function (a) { return { days: new Date(a.year, a.month, 0).getDate() }; } });
calcTool({ file: "stat-correlation.html", title: "皮尔逊相关系数", desc: "计算两组数据的 Pearson 相关系数 r（范围 -1~1）。", tags: ["相关系数", "统计", "相关"], order: 2276, fields: [{ id: "x", label: "X 数据（逗号/空格分隔）", type: "text", value: "1,2,3,4,5" }, { id: "y", label: "Y 数据", type: "text", value: "2,4,5,4,6" }], outputs: [{ id: "r", label: "r" }], compute: function (a) { function parse(s) { return s.split(/[\s,;]+/).map(Number).filter(function (x) { return !isNaN(x); }); } var x = parse(a.x), y = parse(a.y); if (x.length < 2 || x.length !== y.length) return { r: "需等长且≥2项" }; var mx = x.reduce(function (p, c) { return p + c; }, 0) / x.length, my = y.reduce(function (p, c) { return p + c; }, 0) / y.length, num = 0, dx = 0, dy = 0; for (var i = 0; i < x.length; i++) { num += (x[i] - mx) * (y[i] - my); dx += (x[i] - mx) * (x[i] - mx); dy += (y[i] - my) * (y[i] - my); } return { r: (dx === 0 || dy === 0) ? "无法计算" : num / Math.sqrt(dx * dy) }; } });
calcTool({ file: "stat-linear-regression.html", title: "线性回归", desc: "对两组数据做最小二乘线性回归，给出斜率与截距。", tags: ["回归", "统计", "线性"], order: 2277, fields: [{ id: "x", label: "X 数据", type: "text", value: "1,2,3,4,5" }, { id: "y", label: "Y 数据", type: "text", value: "2,4,5,4,6" }], outputs: [{ id: "slope", label: "斜率" }, { id: "intercept", label: "截距" }], compute: function (a) { function parse(s) { return s.split(/[\s,;]+/).map(Number).filter(function (x) { return !isNaN(x); }); } var x = parse(a.x), y = parse(a.y); if (x.length < 2 || x.length !== y.length) return { slope: "需等长且≥2项", intercept: "—" }; var mx = x.reduce(function (p, c) { return p + c; }, 0) / x.length, my = y.reduce(function (p, c) { return p + c; }, 0) / y.length, num = 0, dx = 0; for (var i = 0; i < x.length; i++) { num += (x[i] - mx) * (y[i] - my); dx += (x[i] - mx) * (x[i] - mx); } if (dx === 0) return { slope: "无法计算", intercept: "—" }; var slope = num / dx; return { slope: slope, intercept: my - slope * mx }; } });
calcTool({ file: "stat-iqr.html", title: "四分位距 IQR", desc: "计算数据的 Q1、Q3 与四分位距 IQR。", tags: ["四分位", "IQR", "统计"], order: 2278, fields: [{ id: "x", label: "数据（逗号/空格分隔）", type: "text", value: "1,2,3,4,5,6,7,8,9" }], outputs: [{ id: "q1", label: "Q1" }, { id: "q3", label: "Q3" }, { id: "iqr", label: "IQR" }], compute: function (a) { function parse(s) { return s.split(/[\s,;]+/).map(Number).filter(function (x) { return !isNaN(x); }); } var d = parse(a.x).sort(function (p, c) { return p - c; }); if (d.length < 4) return { q1: "数据过少", q3: "—", iqr: "—" }; function q(p) { var idx = (d.length - 1) * p, lo = Math.floor(idx), hi = Math.ceil(idx), f = idx - lo; return d[lo] + (d[hi] - d[lo]) * f; } var Q1 = q(0.25), Q3 = q(0.75); return { q1: Q1, q3: Q3, iqr: Q3 - Q1 }; } });
calcTool({ file: "stat-cv.html", title: "变异系数 CV", desc: "计算数据的标准差与变异系数（相对离散程度）。", tags: ["变异系数", "统计", "离散"], order: 2279, fields: [{ id: "x", label: "数据（逗号/空格分隔）", type: "text", value: "10,12,11,13,9,10,12" }], outputs: [{ id: "sd", label: "标准差" }, { id: "cv", label: "CV %" }], compute: function (a) { function parse(s) { return s.split(/[\s,;]+/).map(Number).filter(function (x) { return !isNaN(x); }); } var d = parse(a.x); if (d.length < 2) return { sd: "数据过少", cv: "—" }; var m = d.reduce(function (p, c) { return p + c; }, 0) / d.length, v = 0; d.forEach(function (x) { v += (x - m) * (x - m); }); var sd = Math.sqrt(v / d.length); return { sd: sd, cv: m === 0 ? "—" : sd / m * 100 }; } });

// ---------- 实用工具：校验器 / 代码生成 / 随机生成（扩充）----------
textTool({ file: "util-validate-email.html", title: "邮箱校验", desc: "校验一段文本是否为合法邮箱格式。", category: "util", tags: ["校验", "邮箱", "格式"], order: 2301, fields: [{ id: "text", label: "待校验文本", type: "text", value: "user@example.com" }], transform: function (a) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.text.trim()) ? "✓ 合法邮箱" : "✗ 不是合法邮箱格式"; } });
textTool({ file: "util-validate-url.html", title: "URL 校验", desc: "校验文本是否为合法 http/https 链接。", category: "util", tags: ["校验", "URL", "格式"], order: 2302, fields: [{ id: "text", label: "待校验文本", type: "text", value: "https://example.com" }], transform: function (a) { try { new URL(a.text.trim()); return "✓ 合法 URL"; } catch (e) { return "✗ 非法 URL"; } } });
textTool({ file: "util-validate-ipv4.html", title: "IPv4 校验", desc: "校验 IPv4 地址格式与取值范围。", category: "util", tags: ["校验", "IPv4", "网络"], order: 2303, fields: [{ id: "text", label: "待校验 IP", type: "text", value: "192.168.1.1" }], transform: function (a) { var m = a.text.trim().match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/); if (!m) return "✗ 格式错误"; for (var i = 1; i <= 4; i++) if (+m[i] > 255) return "✗ 第 " + i + " 段超出 0–255"; return "✓ 合法 IPv4"; } });
textTool({ file: "util-validate-uuid.html", title: "UUID 校验", desc: "校验 UUID（含版本与变体位）格式。", category: "util", tags: ["校验", "UUID", "格式"], order: 2304, fields: [{ id: "text", label: "待校验 UUID", type: "text", value: "123e4567-e89b-12d3-a456-426614174000" }], transform: function (a) { return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(a.text.trim()) ? "✓ 合法 UUID" : "✗ 非法 UUID"; } });
textTool({ file: "util-validate-hex-color.html", title: "十六进制颜色校验", desc: "校验 #RGB / #RRGGBB / #RRGGBBAA 颜色格式。", category: "util", tags: ["校验", "颜色", "格式"], order: 2305, fields: [{ id: "text", label: "待校验颜色", type: "text", value: "#0f766e" }], transform: function (a) { return /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(a.text.trim()) ? "✓ 合法十六进制颜色" : "✗ 非法颜色格式"; } });
textTool({ file: "util-validate-phone-cn.html", title: "手机号校验", desc: "校验中国大陆手机号（1[3-9] 开头 11 位）。", category: "util", tags: ["校验", "手机号", "中国"], order: 2306, fields: [{ id: "text", label: "待校验号码", type: "text", value: "13812345678" }], transform: function (a) { return /^1[3-9]\d{9}$/.test(a.text.trim()) ? "✓ 合法手机号" : "✗ 非法手机号"; } });
textTool({ file: "util-validate-postcode-cn.html", title: "邮编校验", desc: "校验中国大陆 6 位邮政编码。", category: "util", tags: ["校验", "邮编", "中国"], order: 2307, fields: [{ id: "text", label: "待校验邮编", type: "text", value: "100000" }], transform: function (a) { return /^\d{6}$/.test(a.text.trim()) ? "✓ 合法邮编" : "✗ 非法邮编"; } });
textTool({ file: "util-validate-credit-card.html", title: "银行卡 Luhn 校验", desc: "用 Luhn 算法校验银行卡/信用卡号。", category: "util", tags: ["校验", "Luhn", "银行卡"], order: 2308, fields: [{ id: "text", label: "待校验卡号", type: "text", value: "4111111111111111" }], transform: function (a) { var s = a.text.replace(/\D/g, ""); if (s.length < 12) return "✗ 位数不足"; var t = 0, alt = false; for (var i = s.length - 1; i >= 0; i--) { var d = +s[i]; if (alt) { d *= 2; if (d > 9) d -= 9; } t += d; alt = !alt; } return t % 10 === 0 ? "✓ 通过 Luhn 校验" : "✗ 未通过 Luhn 校验"; } });
textTool({ file: "util-validate-semver.html", title: "语义化版本校验", desc: "校验 SemVer 版本号格式（如 1.2.3）。", category: "util", tags: ["校验", "SemVer", "版本"], order: 2309, fields: [{ id: "text", label: "待校验版本", type: "text", value: "1.2.3" }], transform: function (a) { return /^\d+\.\d+\.\d+(-[0-9A-Za-z-.]+)?(\+[0-9A-Za-z-.]+)?$/.test(a.text.trim()) ? "✓ 合法语义化版本" : "✗ 非法版本号"; } });
textTool({ file: "util-validate-isbn.html", title: "ISBN 校验", desc: "校验 ISBN-10 与 ISBN-13 校验位。", category: "util", tags: ["校验", "ISBN", "出版"], order: 2310, fields: [{ id: "text", label: "待校验 ISBN", type: "text", value: "9783161484100" }], transform: function (a) { var s = a.text.replace(/[\s-]/g, "").toUpperCase(); if (/^\d{13}$/.test(s)) { var sum = 0; for (var i = 0; i < 13; i++) sum += (+s[i]) * (i % 2 ? 3 : 1); return sum % 10 === 0 ? "✓ 合法 ISBN-13" : "✗ ISBN-13 校验位错误"; } if (/^\d{9}[\dX]$/.test(s)) { var tot = 0; for (var j = 0; j < 10; j++) tot += (s[j] === "X" ? 10 : +s[j]) * (10 - j); return tot % 11 === 0 ? "✓ 合法 ISBN-10" : "✗ ISBN-10 校验位错误"; } return "✗ 不是 10 或 13 位 ISBN"; } });
genTool({ file: "util-gitignore-generator.html", title: ".gitignore 生成", desc: "按语言/框架生成常用 .gitignore 模板。", category: "util", tags: [".gitignore", "模板", "代码生成"], order: 2311, fields: [{ id: "tpl", label: "模板", type: "select", options: [{ value: "node", label: "Node.js" }, { value: "python", label: "Python" }, { value: "java", label: "Java" }, { value: "go", label: "Go" }, { value: "rust", label: "Rust" }, { value: "cpp", label: "C++" }] }], gen: function (a) { var t = { node: "node_modules/\ndist/\nnpm-debug.log*\n.env\n.env.*\ncoverage/\n*.log", python: "__pycache__/\n*.py[cod]\n.venv/\nvenv/\nenv/\n*.egg-info/\n.pytest_cache/\n.mypy_cache/", java: "target/\n*.class\n.idea/\n*.iml\n*.log", go: "*.exe\n*.test\n/vendor/\n*.out\n.env", rust: "/target/\nCargo.lock\n*.rs.bk\n.env", cpp: "build/\n*.o\n*.obj\n*.exe\n*.dll\n*.so\n*.out\n.vs/\nCMakeCache.txt" }; return "# " + a.tpl + " .gitignore\n" + (t[a.tpl] || ""); } });
genTool({ file: "util-license-generator.html", title: "开源协议生成", desc: "生成 MIT / Apache / BSD / GPL 协议文本（含年份与作者）。", category: "util", tags: ["License", "协议", "代码生成"], order: 2312, fields: [{ id: "type", label: "协议", type: "select", options: [{ value: "MIT", label: "MIT" }, { value: "BSD", label: "BSD-3-Clause" }, { value: "Apache", label: "Apache-2.0" }, { value: "GPL", label: "GPL-3.0" }] }, { id: "year", label: "年份", type: "text", value: "2026" }, { id: "author", label: "作者/机构", type: "text", value: "TechnologySauce" }], gen: function (a) { var y = a.year || "2026", au = a.author || "Author"; if (a.type === "MIT") return "MIT License\n\nCopyright (c) " + y + " " + au + "\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the \"Software\"), to deal\nin the Software without restriction... (full MIT text)"; if (a.type === "BSD") return "BSD 3-Clause License\n\nCopyright (c) " + y + " " + au + "\nRedistribution and use in source and binary forms... (full BSD-3 text)"; if (a.type === "Apache") return "Apache License 2.0\n\nCopyright " + y + " " + au + "\n\nLicensed under the Apache License, Version 2.0... (full Apache-2.0 text)"; return "GNU GENERAL PUBLIC LICENSE Version 3\n\nCopyright (C) " + y + " " + au + "\n\nThis program is free software: you can redistribute it and/or modify it under\nthe terms of the GNU GPL v3... (full GPL-3.0 text)"; } });
genTool({ file: "util-readme-generator.html", title: "README 生成", desc: "按项目信息生成 Markdown README 骨架。", category: "util", tags: ["README", "Markdown", "代码生成"], order: 2313, fields: [{ id: "name", label: "项目名称", type: "text", value: "my-project" }, { id: "desc", label: "项目简介", type: "text", value: "一个简洁好用的工具。" }, { id: "install", label: "安装命令", type: "text", value: "npm install my-project" }, { id: "usage", label: "使用示例", type: "textarea", rows: 4, value: "import { foo } from \"my-project\";\nfoo();" }], gen: function (a) { return "# " + a.name + "\n\n" + (a.desc || "") + "\n\n## 安装\n\n```bash\n" + (a.install || "") + "\n```\n\n## 使用\n\n```js\n" + (a.usage || "") + "\n```\n\n## 许可证\n\nMIT\n"; } });
genTool({ file: "util-meta-tags-generator.html", title: "Meta 标签生成", desc: "生成含 Open Graph / Twitter 的 SEO meta 标签。", category: "util", tags: ["meta", "SEO", "OpenGraph"], order: 2314, fields: [{ id: "title", label: "标题", type: "text", value: "我的网站" }, { id: "desc", label: "描述", type: "text", value: "一句话介绍你的站点。" }, { id: "url", label: "站点 URL", type: "text", value: "https://example.com" }, { id: "image", label: "分享图 URL", type: "text", value: "https://example.com/og.png" }, { id: "type", label: "类型", type: "select", options: [{ value: "website", label: "website" }, { value: "article", label: "article" }] }], gen: function (a) { return '<title>' + a.title + '</title>\n<meta name="description" content="' + a.desc + '">\n<meta property="og:type" content="' + a.type + '">\n<meta property="og:title" content="' + a.title + '">\n<meta property="og:description" content="' + a.desc + '">\n<meta property="og:url" content="' + a.url + '">\n<meta property="og:image" content="' + a.image + '">\n<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="' + a.title + '">\n<meta name="twitter:description" content="' + a.desc + '">'; } });
genTool({ file: "util-robots-generator.html", title: "robots.txt 生成", desc: "生成 robots.txt（可配置多个 Allow/Disallow）。", category: "util", tags: ["robots", "SEO", "代码生成"], order: 2315, fields: [{ id: "ua", label: "User-agent", type: "text", value: "*" }, { id: "allow", label: "Allow 路径（每行一条）", type: "textarea", rows: 3, value: "/" }, { id: "disallow", label: "Disallow 路径（每行一条）", type: "textarea", rows: 3, value: "/admin/" }], gen: function (a) { var out = "User-agent: " + (a.ua || "*") + "\n"; (a.allow || "").split("\n").forEach(function (l) { l = l.trim(); if (l) out += "Allow: " + l + "\n"; }); (a.disallow || "").split("\n").forEach(function (l) { l = l.trim(); if (l) out += "Disallow: " + l + "\n"; }); return out; } });
textTool({ file: "util-sitemap-generator.html", title: "Sitemap 生成", desc: "把多行 URL 生成 XML sitemap。", category: "util", tags: ["sitemap", "SEO", "XML"], order: 2316, fields: [{ id: "text", label: "URL 列表（每行一个）", type: "textarea", rows: 8, placeholder: "https://example.com/\nhttps://example.com/about" }], transform: function (a) { var urls = a.text.split("\n").map(function (l) { return l.trim(); }).filter(function (l) { return /^https?:\/\//.test(l); }); if (!urls.length) return "（请输入以 http 开头的 URL）"; var out = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'; urls.forEach(function (u) { out += "  <url><loc>" + u.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</loc></url>\n"; }); out += "</urlset>"; return out; } });
genTool({ file: "util-random-ipv4.html", title: "随机 IPv4", desc: "生成一个随机的公有 IPv4 地址。", category: "util", tags: ["随机", "IPv4", "生成"], order: 2317, fields: [{ id: "n", label: "数量", type: "number", value: 1, min: 1, max: 50 }], gen: function (a) { var n = Math.min(50, Math.max(1, a.n | 0)), out = []; for (var i = 0; i < n; i++) out.push((Math.floor(Math.random() * 223) + 1) + "." + Math.floor(Math.random() * 256) + "." + Math.floor(Math.random() * 256) + "." + Math.floor(Math.random() * 254 + 1)); return out.join("\n"); } });
genTool({ file: "util-random-mac.html", title: "随机 MAC 地址", desc: "生成一个随机 MAC 地址。", category: "util", tags: ["随机", "MAC", "生成"], order: 2318, fields: [{ id: "n", label: "数量", type: "number", value: 1, min: 1, max: 50 }], gen: function (a) { var n = Math.min(50, Math.max(1, a.n | 0)), out = []; function h() { return ("0" + Math.floor(Math.random() * 256).toString(16)).slice(-2); } for (var i = 0; i < n; i++) out.push(h() + ":" + h() + ":" + h() + ":" + h() + ":" + h() + ":" + h()); return out.join("\n"); } });
genTool({ file: "util-random-port.html", title: "随机端口", desc: "生成一个 1024–65535 之间的随机端口。", category: "util", tags: ["随机", "端口", "生成"], order: 2319, fields: [{ id: "n", label: "数量", type: "number", value: 1, min: 1, max: 50 }], gen: function (a) { var n = Math.min(50, Math.max(1, a.n | 0)), out = []; for (var i = 0; i < n; i++) out.push(Math.floor(Math.random() * (65535 - 1024)) + 1024); return out.join("\n"); } });
genTool({ file: "util-random-date.html", title: "随机日期", desc: "在指定年份范围内生成随机日期。", category: "util", tags: ["随机", "日期", "生成"], order: 2320, fields: [{ id: "y1", label: "起始年", type: "number", value: 2020 }, { id: "y2", label: "结束年", type: "number", value: 2026 }, { id: "n", label: "数量", type: "number", value: 5, min: 1, max: 100 }], gen: function (a) { var n = Math.min(100, Math.max(1, a.n | 0)), out = [], s = new Date(a.y1, 0, 1), e = new Date(a.y2 + 1, 0, 1), span = e - s; for (var i = 0; i < n; i++) out.push(new Date(s.getTime() + Math.random() * span).toISOString().slice(0, 10)); return out.join("\n"); } });
genTool({ file: "util-random-emoji.html", title: "随机 Emoji", desc: "从常用 Emoji 中随机挑选。", category: "util", tags: ["随机", "Emoji", "生成"], order: 2321, fields: [{ id: "n", label: "数量", type: "number", value: 10, min: 1, max: 100 }], gen: function (a) { var list = "😀😎🚀🌟🔥💡🌈🍎🐱🌍⚡🎉🌸🍀🌊🎯🧠💡🌟✨🍕☕🐶🐱🦄🌻".split(""), n = Math.min(100, Math.max(1, a.n | 0)), out = []; for (var i = 0; i < n; i++) out.push(list[Math.floor(Math.random() * list.length)]); return out.join(" "); } });
genTool({ file: "util-uuid-batch.html", title: "批量 UUID", desc: "批量生成 v4 UUID（依赖浏览器 crypto）。", category: "util", tags: ["UUID", "批量", "生成"], order: 2322, fields: [{ id: "n", label: "数量", type: "number", value: 10, min: 1, max: 500 }], gen: function (a) { var n = Math.min(500, Math.max(1, a.n | 0)), out = []; for (var i = 0; i < n; i++) out.push((crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) { var r = Math.random() * 16 | 0; return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16); }))); return out.join("\n"); } });
genTool({ file: "util-random-passphrase.html", title: "随机助记词密码", desc: "用常见英文词组合生成易记高强度密码（类 Diceware）。", category: "util", tags: ["密码", "助记词", "随机"], order: 2323, fields: [{ id: "words", label: "词数", type: "number", value: 4, min: 2, max: 12 }, { id: "sep", label: "分隔符", type: "text", value: "-" }], gen: function (a) { var dict = "apple,bread,cloud,dance,eagle,forest,grape,house,iron,jazz,kite,light,moon,node,ocean,paper,quiet,river,sun,tree,umbra,violet,wind,xray,yarn,zero,brick,calm,dawn,echo,flame,gold,hope,ice,jade,key,leaf,mist,nova,peak,quest,rain,star,tide,van,wave,yarn,zone".split(","), n = Math.min(12, Math.max(2, a.words | 0)), sep = a.sep || "-", out = []; for (var i = 0; i < n; i++) out.push(dict[Math.floor(Math.random() * dict.length)]); return out.join(sep); } });
genTool({ file: "util-random-username.html", title: "随机用户名", desc: "生成有趣的随机用户名。", category: "util", tags: ["随机", "用户名", "生成"], order: 2324, fields: [{ id: "n", label: "数量", type: "number", value: 5, min: 1, max: 50 }], gen: function (a) { var adj = "cool,swift,calm,bright,brave,lucky,wild,silent,cosmic,neon,minty,amber".split(","), noun = "tiger,falcon,river,comet,panda,maple,echo,quartz,willow,photon,ember,lotus".split(","); var n = Math.min(50, Math.max(1, a.n | 0)), out = []; for (var i = 0; i < n; i++) out.push(adj[Math.floor(Math.random() * adj.length)] + "_" + noun[Math.floor(Math.random() * noun.length)] + Math.floor(Math.random() * 100)); return out.join("\n"); } });

// ---------- 文本/开发者/颜色排版/计算器 补充（扩充）----------
textTool({ file: "text-strip-zero-width.html", title: "去除零宽字符", desc: "移除文本中的零宽空格等不可见字符（防隐蔽注入）。", category: "text", tags: ["零宽", "清洗", "不可见"], order: 2325, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "看不见的字符" }], transform: function (args) { return Array.from(args.text).filter(function (c) { var cp = c.codePointAt(0); return !((cp >= 0x200b && cp <= 0x200f) || cp === 0x2060 || cp === 0xFEFF); }).join(""); } });
textTool({ file: "text-remove-control-chars.html", title: "去除控制字符", desc: "移除换行/Tab 以外的控制字符（U+0000–U+001F）。", category: "text", tags: ["控制字符", "清洗"], order: 2326, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "含控制符的文本" }], transform: function (args) { return Array.from(args.text).filter(function (c) { var cp = c.codePointAt(0); return cp >= 0x20 || cp === 0x09 || cp === 0x0a || cp === 0x0d; }).join(""); } });
textTool({ file: "text-normalize-newlines.html", title: "换行符统一", desc: "把 CRLF / CR / LF 统一为指定换行符。", category: "text", tags: ["换行", "CRLF", "清洗"], order: 2327, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6 }, { id: "mode", label: "目标换行", type: "select", options: [{ value: "lf", label: "LF" }, { value: "crlf", label: "CRLF" }] }], transform: function (args) { var s = args.text.replace(/\r\n?/g, "\n"); return args.mode === "crlf" ? s.replace(/\n/g, "\r\n") : s; } });
textTool({ file: "text-extract-hashtags.html", title: "提取话题标签", desc: "从文本中提取所有 #话题 标签（去重）。", category: "text", tags: ["hashtag", "提取", "社交"], order: 2328, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "周末去 #爬山 和 #露营" }], transform: function (args) { var m = args.text.match(/#[^\s#]+/g); return m ? Array.from(new Set(m)).join("\n") : "（未找到）"; } });
textTool({ file: "text-extract-mentions.html", title: "提取 @提及", desc: "从文本中提取所有 @用户 提及（去重）。", category: "text", tags: ["mention", "提取", "社交"], order: 2329, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "你好 @alice 和 @bob" }], transform: function (args) { var m = args.text.match(/@[^\s@]+/g); return m ? Array.from(new Set(m)).join("\n") : "（未找到）"; } });
textTool({ file: "text-sort-by-length-asc.html", title: "按长度排序行", desc: "把每行按字符长度由短到长排序。", category: "text", tags: ["排序", "长度", "行"], order: 2330, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "apple\nbanana\nfig\ngrape" }], transform: function (args) { return args.text.split("\n").sort(function (a, b) { return a.length - b.length; }).join("\n"); } });
textTool({ file: "text-sort-by-length-desc.html", title: "按长度逆序行", desc: "把每行按字符长度由长到短排序。", category: "text", tags: ["排序", "长度", "行"], order: 2331, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "apple\nbanana\nfig\ngrape" }], transform: function (args) { return args.text.split("\n").sort(function (a, b) { return b.length - a.length; }).join("\n"); } });
textTool({ file: "text-char-frequency.html", title: "字符频率统计", desc: "统计每个字符出现次数，按频次降序排列。", category: "text", tags: ["频率", "统计", "字符"], order: 2332, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "abracadabra" }], transform: function (args) { var m = {}, out = []; Array.from(args.text).forEach(function (c) { m[c] = (m[c] || 0) + 1; }); Object.keys(m).sort(function (a, b) { return m[b] - m[a]; }).forEach(function (k) { out.push((k === " " ? "空格" : k) + ": " + m[k]); }); return out.join("\n"); } });
textTool({ file: "text-remove-numbers.html", title: "去除数字", desc: "移除文本中所有数字字符。", category: "text", tags: ["数字", "清洗"], order: 2333, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "订单 123 共 456 元" }], transform: function (args) { return args.text.replace(/[0-9]/g, ""); } });
textTool({ file: "text-keep-numbers.html", title: "仅保留数字", desc: "移除除数字外的所有字符。", category: "text", tags: ["数字", "清洗"], order: 2334, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "订单 123 共 456 元" }], transform: function (args) { return args.text.replace(/[^0-9]/g, ""); } });
textTool({ file: "text-keep-lines-matching.html", title: "保留含关键词行", desc: "仅保留包含指定关键词的行（多关键词逗号分隔）。", category: "text", tags: ["行", "过滤", "关键词"], order: 2335, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8 }, { id: "kw", label: "关键词（逗号分隔）", type: "text", value: "error,warn" }], transform: function (args) { var kws = args.kw.split(",").map(function (k) { return k.trim(); }).filter(Boolean); if (!kws.length) return args.text; return args.text.split("\n").filter(function (l) { return kws.some(function (k) { return l.indexOf(k) >= 0; }); }).join("\n"); } });
textTool({ file: "dev-regex-escape.html", title: "正则转义", desc: "把文本中正则元字符转义，便于按字面量匹配。", category: "dev", tags: ["正则", "转义", "编码"], order: 2336, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "a.b*c" }], transform: function (args) { return args.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); } });
textTool({ file: "dev-sql-escape.html", title: "SQL 字符串转义", desc: "转义 SQL 字符串中的单引号与反斜杠。", category: "dev", tags: ["SQL", "转义", "安全"], order: 2337, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "O'Brien" }], transform: function (args) { return args.text.replace(/\\/g, "\\\\").replace(/'/g, "''"); } });
textTool({ file: "dev-xml-escape.html", title: "XML 转义", desc: "转义 XML 中的 & < > \" ' 五个实体字符。", category: "dev", tags: ["XML", "转义", "实体"], order: 2338, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "<a>1 & 2</a>" }], transform: function (args) { return args.text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;"); } });
textTool({ file: "dev-xml-unescape.html", title: "XML 反转义", desc: "把 XML 实体还原为原字符。", category: "dev", tags: ["XML", "反转义", "实体"], order: 2339, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "&lt;a&gt;1 &amp; 2&lt;/a&gt;" }], transform: function (args) { return args.text.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&"); } });
textTool({ file: "dev-csv-transpose.html", title: "CSV 转置", desc: "把 CSV 表格的行列互换。", category: "dev", tags: ["CSV", "转置", "表格"], order: 2340, fields: [{ id: "text", label: "CSV", type: "textarea", rows: 8, placeholder: "a,b,c\n1,2,3" }], transform: function (args) { var rows = args.text.trim().split("\n").map(function (l) { return l.split(","); }); var max = Math.max.apply(null, rows.map(function (r) { return r.length; })); var out = []; for (var c = 0; c < max; c++) { var row = []; for (var r = 0; r < rows.length; r++) row.push(rows[r][c] !== undefined ? rows[r][c] : ""); out.push(row.join(",")); } return out.join("\n"); } });
textTool({ file: "dev-sort-json-keys.html", title: "JSON 键排序", desc: "把 JSON 的键按字母顺序递归排序后美化。", category: "dev", tags: ["JSON", "排序", "美化"], order: 2341, fields: [{ id: "text", label: "JSON", type: "textarea", rows: 8, placeholder: '{"b":1,"a":2}' }], transform: function (args) { function so(o) { if (Array.isArray(o)) return o.map(so); if (o && typeof o === "object") { var r = {}; Object.keys(o).sort().forEach(function (k) { r[k] = so(o[k]); }); return r; } return o; } try { return JSON.stringify(so(JSON.parse(args.text)), null, 2); } catch (e) { return "无效 JSON：" + e.message; } } });
textTool({ file: "dev-remove-json-keys.html", title: "JSON 删除键", desc: "从 JSON 中递归删除指定键（逗号分隔）。", category: "dev", tags: ["JSON", "删除", "清洗"], order: 2342, fields: [{ id: "text", label: "JSON", type: "textarea", rows: 8 }, { id: "keys", label: "要删除的键", type: "text", value: "password,secret" }], transform: function (args) { function del(o, kws) { if (Array.isArray(o)) return o.map(function (x) { return del(x, kws); }); if (o && typeof o === "object") { var r = {}; Object.keys(o).forEach(function (k) { if (kws.indexOf(k) < 0) r[k] = del(o[k], kws); }); return r; } return o; } try { var kws = args.keys.split(",").map(function (k) { return k.trim(); }).filter(Boolean); return JSON.stringify(del(JSON.parse(args.text), kws), null, 2); } catch (e) { return "无效 JSON：" + e.message; } } });
textTool({ file: "dev-utf8-bytelength.html", title: "UTF-8 字节长度", desc: "统计文本按 UTF-8 编码的字节数（中文按 3 字节）。", category: "dev", tags: ["UTF-8", "字节", "编码"], order: 2343, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "你好世界" }], transform: function (args) { return "UTF-8 字节数：" + new TextEncoder().encode(args.text).length; } });
textTool({ file: "dev-semver-compare.html", title: "语义版本比较", desc: "比较两个 SemVer 版本号，指出哪个更新。", category: "dev", tags: ["SemVer", "比较", "版本"], order: 2344, fields: [{ id: "v1", label: "版本 A", type: "text", value: "1.2.3" }, { id: "v2", label: "版本 B", type: "text", value: "1.3.0" }], transform: function (args) { function cmp(a, b) { var A = a.split("."), B = b.split("."); for (var i = 0; i < Math.max(A.length, B.length); i++) { var x = parseInt(A[i] || 0), y = parseInt(B[i] || 0); if (x > y) return 1; if (x < y) return -1; } return 0; } var r = cmp(args.v1.trim(), args.v2.trim()); return r > 0 ? args.v1 + " 较新" : r < 0 ? args.v2 + " 较新" : "两版本相同"; } });
textTool({ file: "dev-escape-js-string.html", title: "JS 字符串转义", desc: "把文本转义为合法的 JavaScript 字符串字面量。", category: "dev", tags: ["JS", "转义", "字符串"], order: 2345, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "他说：\"你好\"" }], transform: function (args) { return args.text.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t"); } });
genTool({ file: "dev-fetch-snippet.html", title: "Fetch 代码生成", desc: "根据方法、URL、请求头与请求体生成 fetch 调用代码。", category: "dev", tags: ["fetch", "代码生成", "前端"], order: 2346, fields: [{ id: "method", label: "方法", type: "select", options: [{ value: "GET", label: "GET" }, { value: "POST", label: "POST" }, { value: "PUT", label: "PUT" }, { value: "DELETE", label: "DELETE" }] }, { id: "url", label: "URL", type: "text", value: "https://api.example.com/data" }, { id: "headers", label: "请求头（每行 key: value）", type: "textarea", rows: 3, value: "Content-Type: application/json" }, { id: "body", label: "请求体 JSON（POST/PUT）", type: "textarea", rows: 3, value: '{ "name": "test" }' }], gen: function (a) { var h = ""; (a.headers || "").split("\n").forEach(function (l) { var i = l.indexOf(":"); if (i > 0) h += '  headers: { "' + l.slice(0, i).trim() + '": "' + l.slice(i + 1).trim() + '" },\n'; }); var b = (a.body && a.method !== "GET") ? '  body: JSON.stringify(' + a.body + '),\n' : ""; return "fetch('" + a.url + "', {\n  method: '" + a.method + "',\n" + h + b + "}).then(r => r.json()).then(d => console.log(d));"; } });
genTool({ file: "dev-sql-create-from-json.html", title: "JSON 转建表语句", desc: "根据 JSON 示例对象生成 MySQL CREATE TABLE 语句。", category: "dev", tags: ["SQL", "建表", "代码生成"], order: 2347, fields: [{ id: "table", label: "表名", type: "text", value: "users" }, { id: "json", label: "JSON 示例", type: "textarea", rows: 6, value: '{"id":1,"name":"Tom","active":true}' }], gen: function (a) { var o; try { o = JSON.parse(a.json); } catch (e) { return "无效 JSON：" + e.message; } function typ(v) { if (typeof v === "number") return Number.isInteger(v) ? "BIGINT" : "DOUBLE"; if (typeof v === "boolean") return "BOOLEAN"; if (v && typeof v === "object") return "JSON"; return "VARCHAR(255)"; } var out = "CREATE TABLE `" + a.table + "` (\n"; var cols = []; Object.keys(o).forEach(function (k) { cols.push("  `" + k + "` " + typ(o[k])); }); out += cols.join(",\n") + "\n);"; return out; } });
genTool({ file: "dev-curl-snippet.html", title: "curl 命令生成", desc: "根据方法、URL、请求头与请求体生成 curl 命令。", category: "dev", tags: ["curl", "命令", "代码生成"], order: 2348, fields: [{ id: "method", label: "方法", type: "select", options: [{ value: "GET", label: "GET" }, { value: "POST", label: "POST" }, { value: "PUT", label: "PUT" }, { value: "DELETE", label: "DELETE" }] }, { id: "url", label: "URL", type: "text", value: "https://api.example.com/data" }, { id: "headers", label: "请求头（每行 key: value）", type: "textarea", rows: 3, value: "Content-Type: application/json" }, { id: "body", label: "请求体 JSON", type: "textarea", rows: 3, value: '{ "name": "test" }' }], gen: function (a) { var cmd = "curl -X " + a.method + " '" + a.url + "'"; (a.headers || "").split("\n").forEach(function (l) { var i = l.indexOf(":"); if (i > 0) cmd += " -H '" + l.slice(0, i).trim() + ": " + l.slice(i + 1).trim() + "'"; }); if (a.body && a.method !== "GET") cmd += " -d '" + a.body.replace(/'/g, "'\\''") + "'"; return cmd + ";"; } });
genTool({ file: "dev-python-requests-snippet.html", title: "Python requests 生成", desc: "生成 Python requests 调用代码。", category: "dev", tags: ["Python", "requests", "代码生成"], order: 2349, fields: [{ id: "method", label: "方法", type: "select", options: [{ value: "GET", label: "GET" }, { value: "POST", label: "POST" }, { value: "PUT", label: "PUT" }, { value: "DELETE", label: "DELETE" }] }, { id: "url", label: "URL", type: "text", value: "https://api.example.com/data" }, { id: "body", label: "请求体 JSON（POST/PUT）", type: "textarea", rows: 3, value: '{ "name": "test" }' }], gen: function (a) { var b = (a.body && a.method !== "GET") ? ", json=" + a.body : ""; return "import requests\n\nr = requests." + a.method.toLowerCase() + "('" + a.url + "'" + b + ")\nprint(r.status_code)\nprint(r.json())"; } });
genTool({ file: "dev-axios-snippet.html", title: "Axios 代码生成", desc: "生成 Axios 调用代码。", category: "dev", tags: ["axios", "代码生成", "前端"], order: 2350, fields: [{ id: "method", label: "方法", type: "select", options: [{ value: "GET", label: "GET" }, { value: "POST", label: "POST" }, { value: "PUT", label: "PUT" }, { value: "DELETE", label: "DELETE" }] }, { id: "url", label: "URL", type: "text", value: "https://api.example.com/data" }, { id: "body", label: "请求体 JSON（POST/PUT）", type: "textarea", rows: 3, value: '{ "name": "test" }' }], gen: function (a) { var b = (a.body && a.method !== "GET") ? ", data: " + a.body : ""; return "axios({\n  method: '" + a.method + "',\n  url: '" + a.url + "'" + b + "\n}).then(r => console.log(r.data)).catch(e => console.error(e));"; } });
genTool({ file: "design-color-shades.html", title: "颜色明暗阶梯", desc: "由基色生成向白（浅）与向黑（深）的颜色阶梯。", category: "design", tags: ["颜色", "阶梯", "明暗"], order: 2351, fields: [{ id: "hex", label: "基色 Hex", type: "text", value: "#0f766e" }, { id: "steps", label: "阶梯数", type: "number", value: 5, min: 1, max: 10 }], gen: function (a) { function hr(h) { h = h.replace("#", ""); if (h.length === 3) h = h.split("").map(function (c) { return c + c; }).join(""); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; } function rh(r) { return "#" + r.map(function (x) { return ("0" + Math.round(Math.max(0, Math.min(255, x))).toString(16)).slice(-2); }).join(""); } function mix(c, t, amt) { return c.map(function (v, i) { return v + (t[i] - v) * amt; }); } var base = hr(a.hex), n = a.steps || 5, out = "基色: " + a.hex + "\n\n浅色（→白）:\n"; for (var i = 1; i <= n; i++) out += "  " + rh(mix(base, [255, 255, 255], i / (n + 1))) + "\n"; out += "\n深色（→黑）:\n"; for (var j = 1; j <= n; j++) out += "  " + rh(mix(base, [0, 0, 0], j / (n + 1))) + "\n"; return out; } });
genTool({ file: "design-color-harmony.html", title: "配色方案", desc: "由基色生成互补 / 类似 / 三角 / 四角配色方案。", category: "design", tags: ["配色", "色相", "设计"], order: 2352, fields: [{ id: "hex", label: "基色 Hex", type: "text", value: "#0f766e" }], gen: function (a) { function hr(h) { h = h.replace("#", ""); if (h.length === 3) h = h.split("").map(function (c) { return c + c; }).join(""); return [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255]; } function hsl(rgb) { var r = rgb[0], g = rgb[1], b = rgb[2], max = Math.max(r, g, b), min = Math.min(r, g, b), dl = max - min, h = 0, s = 0, l = (max + min) / 2; if (dl !== 0) { s = l > 0.5 ? dl / (2 - max - min) : dl / (max + min); if (max === r) h = (g - b) / dl + (g < b ? 6 : 0); else if (max === g) h = (b - r) / dl + 2; else h = (r - g) / dl + 4; h *= 60; } return [h, s * 100, l * 100]; } function rhsl(h, s, l) { h = ((h % 360) + 360) % 360; s /= 100; l /= 100; var c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2, r = 0, g = 0, b = 0; if (h < 60) { r = c; g = x; } else if (h < 120) { r = x; g = c; } else if (h < 180) { g = c; b = x; } else if (h < 240) { g = x; b = c; } else if (h < 300) { r = x; b = c; } else { r = c; b = x; } return "#" + [r, g, b].map(function (v) { return ("0" + Math.round((v + m) * 255).toString(16)).slice(-2); }).join(""); } var H = hsl(hr(a.hex)); return "基色: " + a.hex + "\n互补色: " + rhsl(H[0] + 180, H[1], H[2]) + "\n类似色: " + rhsl(H[0] + 30, H[1], H[2]) + " / " + rhsl(H[0] - 30, H[1], H[2]) + "\n三角色: " + rhsl(H[0] + 120, H[1], H[2]) + " / " + rhsl(H[0] + 240, H[1], H[2]) + "\n四角色: " + rhsl(H[0] + 90, H[1], H[2]) + " / " + rhsl(H[0] + 180, H[1], H[2]) + " / " + rhsl(H[0] + 270, H[1], H[2]); } });
calcTool({ file: "design-contrast-checker.html", title: "对比度检查", desc: "计算前景/背景色的 WCAG 对比度并判断达标情况。", category: "design", tags: ["对比度", "WCAG", "无障碍"], order: 2353, fields: [{ id: "fg", label: "前景色", type: "text", value: "#0f172a" }, { id: "bg", label: "背景色", type: "text", value: "#ffffff" }], outputs: [{ id: "ratio", label: "对比度" }, { id: "aa", label: "AA (≥4.5)" }, { id: "aaa", label: "AAA (≥7)" }], compute: function (a) { function lum(h) { h = h.replace("#", ""); if (h.length === 3) h = h.split("").map(function (c) { return c + c; }).join(""); var r = parseInt(h.slice(0, 2), 16) / 255, g = parseInt(h.slice(2, 4), 16) / 255, b = parseInt(h.slice(4, 6), 16) / 255; function f(c) { return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); } return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); } var l1 = lum(a.fg), l2 = lum(a.bg), hi = Math.max(l1, l2), lo = Math.min(l1, l2), cr = (hi + 0.05) / (lo + 0.05); return { ratio: cr, aa: cr >= 4.5 ? "通过" : "不通过", aaa: cr >= 7 ? "通过" : "不通过" }; } });
genTool({ file: "design-typography-scale.html", title: "字号比例阶梯", desc: "按模块化比例（如 1.25）生成正文与标题字号阶梯。", category: "design", tags: ["字号", "排版", "比例"], order: 2354, fields: [{ id: "base", label: "基准字号 px", type: "number", value: 16 }, { id: "ratio", label: "比例", type: "number", value: 1.25, step: 0.05 }], gen: function (a) { var out = "body: " + a.base + "px\n"; for (var i = 1; i <= 6; i++) out += "h" + (7 - i) + ": " + (a.base * Math.pow(a.ratio, 7 - i)).toFixed(2) + "px\n"; return out; } });
genTool({ file: "design-color-mix.html", title: "颜色混合", desc: "按比例混合两个十六进制颜色（0–100%）。", category: "design", tags: ["颜色", "混合", "设计"], order: 2355, fields: [{ id: "hex1", label: "颜色 A", type: "text", value: "#0f766e" }, { id: "hex2", label: "颜色 B", type: "text", value: "#f43f5e" }, { id: "ratio", label: "A 占比 %", type: "number", value: 50, min: 0, max: 100 }], gen: function (a) { function hr(h) { h = h.replace("#", ""); if (h.length === 3) h = h.split("").map(function (c) { return c + c; }).join(""); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; } function rh(r) { return "#" + r.map(function (x) { return ("0" + Math.round(Math.max(0, Math.min(255, x))).toString(16)).slice(-2); }).join(""); } var c1 = hr(a.hex1), c2 = hr(a.hex2), t = (a.ratio || 50) / 100; var mix = c1.map(function (v, i) { return v * t + c2[i] * (1 - t); }); return "混合结果: " + rh(mix); } });
calcTool({ file: "net-subnet-calc.html", title: "子网计算", desc: "由 CIDR（如 192.168.1.10/24）计算网络/广播地址与可用主机数。", category: "util", tags: ["子网", "CIDR", "网络"], order: 2356, fields: [{ id: "cidr", label: "CIDR 表示", type: "text", value: "192.168.1.10/24" }], outputs: [{ id: "net", label: "网络地址" }, { id: "bcast", label: "广播地址" }, { id: "first", label: "首可用" }, { id: "last", label: "末可用" }, { id: "hosts", label: "可用主机数" }], compute: function (a) { var p = a.cidr.split("/"); var ip = p[0].split(".").map(Number); var bits = parseInt(p[1], 10); if (ip.length !== 4 || isNaN(bits) || bits < 0 || bits > 32) return { net: "格式错误", bcast: "—", first: "—", last: "—", hosts: "—" }; var ipInt = ((ip[0] << 24) | (ip[1] << 16) | (ip[2] << 8) | ip[3]) >>> 0; var mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0; var net = (ipInt & mask) >>> 0; var bcast = (net | (~mask >>> 0)) >>> 0; function ipstr(n) { return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join("."); } var hosts = Math.pow(2, 32 - bits) - (bits >= 31 ? 0 : 2); return { net: ipstr(net), bcast: ipstr(bcast), first: bits >= 31 ? ipstr(net) : ipstr(net + 1), last: bits >= 31 ? ipstr(bcast) : ipstr(bcast - 1), hosts: hosts }; } });
calcTool({ file: "calc-bitwise.html", title: "位运算", desc: "对两个整数做按位 AND / OR / XOR 与取反。", category: "calc", tags: ["位运算", "AND", "OR", "XOR"], order: 2357, fields: [{ id: "a", label: "A", type: "number", value: 12 }, { id: "b", label: "B", type: "number", value: 10 }], outputs: [{ id: "and", label: "A AND B" }, { id: "or", label: "A OR B" }, { id: "xor", label: "A XOR B" }, { id: "nota", label: "NOT A" }], compute: function (a) { var A = a.a | 0, B = a.b | 0; return { and: A & B, or: A | B, xor: A ^ B, nota: (~A) >>> 0 }; } });
calcTool({ file: "trig-sin-cos-tan.html", title: "三角函数", desc: "由角度（度）计算 sin、cos、tan 与 cot。", category: "calc", tags: ["三角函数", "sin", "cos", "tan"], order: 2358, fields: [{ id: "deg", label: "角度 °", type: "number", value: 30 }], outputs: [{ id: "sin", label: "sin" }, { id: "cos", label: "cos" }, { id: "tan", label: "tan" }, { id: "cot", label: "cot" }], compute: function (a) { var r = a.deg * Math.PI / 180; var t = Math.tan(r); return { sin: Math.sin(r), cos: Math.cos(r), tan: t, cot: t === 0 ? "无定义" : 1 / t }; } });
calcTool({ file: "calc-percentage-of.html", title: "求某数的百分比", desc: "计算 x 的 y% 是多少。", category: "calc", tags: ["百分比", "计算"], order: 2359, fields: [{ id: "x", label: "基数 x", type: "number", value: 200 }, { id: "y", label: "百分比 y %", type: "number", value: 15 }], outputs: [{ id: "res", label: "结果" }], formulas: [{ id: "res", expr: "x*y/100" }] });
calcTool({ file: "calc-percentage-what.html", title: "求占比百分比", desc: "计算 x 是 y 的百分之几。", category: "calc", tags: ["百分比", "占比"], order: 2360, fields: [{ id: "x", label: "部分 x", type: "number", value: 30 }, { id: "y", label: "整体 y", type: "number", value: 200 }], outputs: [{ id: "res", label: "占比 %" }], compute: function (a) { return { res: a.y === 0 ? "整体不能为 0" : a.x / a.y * 100 }; } });
calcTool({ file: "calc-ratio-simplify.html", title: "比例化简", desc: "把 a:b 化简为最简整数比。", category: "calc", tags: ["比例", "化简", "数学"], order: 2361, fields: [{ id: "a", label: "a", type: "number", value: 12 }, { id: "b", label: "b", type: "number", value: 18 }], outputs: [{ id: "res", label: "最简比" }], compute: function (a) { function gcd(x, y) { x = Math.abs(x); y = Math.abs(y); while (y) { var t = y; y = x % y; x = t; } return x || 1; } if (a.b === 0) return { res: "b 不能为 0" }; var g = gcd(a.a, a.b); return { res: (a.a / g) + " : " + (a.b / g) }; } });
calcTool({ file: "geometry-ring-area.html", title: "圆环面积", desc: "由外半径 R 与内半径 r 计算圆环（Annulus）面积。", category: "calc", tags: ["圆环", "面积", "几何"], order: 2362, fields: [{ id: "R", label: "外半径 R", type: "number", value: 10 }, { id: "r", label: "内半径 r", type: "number", value: 6 }], outputs: [{ id: "area", label: "面积" }], formulas: [{ id: "area", expr: "Math.PI*(R*R-r*r)" }] });
calcTool({ file: "math-is-prime.html", title: "质数判断", desc: "判断一个正整数是否为质数。", category: "calc", tags: ["质数", "判断", "数学"], order: 2363, fields: [{ id: "n", label: "正整数 n", type: "number", value: 97, min: 1 }], outputs: [{ id: "res", label: "结果" }], compute: function (a) { var n = Math.floor(a.n); if (n < 2) return { res: "不是质数" }; for (var i = 2; i * i <= n; i++) if (n % i === 0) return { res: "不是质数" }; return { res: "是质数" }; } });
genTool({ file: "gen-fibonacci.html", title: "斐波那契数列", desc: "生成前 N 项斐波那契数列。", category: "util", tags: ["斐波那契", "数列", "生成"], order: 2364, fields: [{ id: "n", label: "项数 N", type: "number", value: 10, min: 1, max: 100 }], gen: function (a) { var n = Math.min(100, Math.max(1, a.n | 0)), f = [0, 1], out = []; if (n >= 1) out.push(0); if (n >= 2) out.push(1); for (var i = 2; i < n; i++) { f[i] = f[i - 1] + f[i - 2]; out.push(f[i]); } return out.join(", "); } });
genTool({ file: "gen-primes.html", title: "质数生成", desc: "生成不超过 N 的所有质数（筛法）。", category: "util", tags: ["质数", "生成", "数学"], order: 2365, fields: [{ id: "n", label: "上限 N", type: "number", value: 100, min: 2, max: 100000 }], gen: function (a) { var n = Math.min(100000, Math.max(2, a.n | 0)), s = new Array(n + 1).fill(true), out = []; s[0] = s[1] = false; for (var i = 2; i * i <= n; i++) if (s[i]) for (var j = i * i; j <= n; j += i) s[j] = false; for (var k = 2; k <= n; k++) if (s[k]) out.push(k); return "共 " + out.length + " 个质数：\n" + out.join(", "); } });
calcTool({ file: "stat-percentile.html", title: "百分位数", desc: "计算数据在指定百分位 p（0–100）处的值。", category: "calc", tags: ["百分位", "统计"], order: 2366, fields: [{ id: "x", label: "数据（逗号/空格分隔）", type: "text", value: "1,2,3,4,5,6,7,8,9,10" }, { id: "p", label: "百分位 p (0-100)", type: "number", value: 90 }], outputs: [{ id: "res", label: "P" }], compute: function (a) { function parse(s) { return s.split(/[\s,;]+/).map(Number).filter(function (x) { return !isNaN(x); }); } var d = parse(a.x).sort(function (p, c) { return p - c; }); if (d.length < 1) return { res: "数据不足" }; var pp = Math.max(0, Math.min(100, a.p)) / 100, idx = (d.length - 1) * pp, lo = Math.floor(idx), hi = Math.ceil(idx), f = idx - lo; return { res: hi === lo ? d[lo] : d[lo] + (d[hi] - d[lo]) * f }; } });
calcTool({ file: "calc-fraction-simplify.html", title: "分数化简", desc: "把分数 a/b 化简为最简分数并给出小数值。", category: "calc", tags: ["分数", "化简", "数学"], order: 2367, fields: [{ id: "a", label: "分子 a", type: "number", value: 6 }, { id: "b", label: "分母 b", type: "number", value: 8 }], outputs: [{ id: "frac", label: "最简分数" }, { id: "dec", label: "小数" }], compute: function (a) { function gcd(x, y) { x = Math.abs(x); y = Math.abs(y); while (y) { var t = y; y = x % y; x = t; } return x || 1; } if (a.b === 0) return { frac: "分母不能为 0", dec: "—" }; var g = gcd(a.a, a.b), na = a.a / g, nb = a.b / g; return { frac: (nb < 0 ? "-" : "") + Math.abs(na) + "/" + Math.abs(nb), dec: a.a / a.b }; } });
calcTool({ file: "math-arithmetic-sequence.html", title: "等差数列", desc: "由首项、公差与项数求第 N 项与 N 项和。", category: "calc", tags: ["等差数列", "数列", "数学"], order: 2368, fields: [{ id: "a1", label: "首项 a1", type: "number", value: 2 }, { id: "d", label: "公差 d", type: "number", value: 3 }, { id: "n", label: "项数 n", type: "number", value: 10 }], outputs: [{ id: "an", label: "第 N 项" }, { id: "sum", label: "前 N 项和" }], compute: function (a) { var an = a.a1 + (a.n - 1) * a.d; return { an: an, sum: a.n * (a.a1 + an) / 2 }; } });
calcTool({ file: "math-geometric-sequence.html", title: "等比数列", desc: "由首项、公比与项数求第 N 项与 N 项和。", category: "calc", tags: ["等比数列", "数列", "数学"], order: 2369, fields: [{ id: "a1", label: "首项 a1", type: "number", value: 2 }, { id: "r", label: "公比 r", type: "number", value: 2 }, { id: "n", label: "项数 n", type: "number", value: 10 }], outputs: [{ id: "an", label: "第 N 项" }, { id: "sum", label: "前 N 项和" }], compute: function (a) { var an = a.a1 * Math.pow(a.r, a.n - 1), sum = a.r === 1 ? a.a1 * a.n : a.a1 * (1 - Math.pow(a.r, a.n)) / (1 - a.r); return { an: an, sum: sum }; } });
calcTool({ file: "math-solve-linear-2x2.html", title: "二元一次方程组", desc: "求解 a1x+b1y=c1，a2x+b2y=c2。", category: "calc", tags: ["方程组", "代数", "数学"], order: 2370, fields: [{ id: "a1", label: "a1", type: "number", value: 2 }, { id: "b1", label: "b1", type: "number", value: 1 }, { id: "c1", label: "c1", type: "number", value: 5 }, { id: "a2", label: "a2", type: "number", value: 1 }, { id: "b2", label: "b2", type: "number", value: -1 }, { id: "c2", label: "c2", type: "number", value: 1 }], outputs: [{ id: "x", label: "x" }, { id: "y", label: "y" }], compute: function (a) { var det = a.a1 * a.b2 - a.a2 * a.b1; if (det === 0) return { x: "无解/无穷解", y: "—" }; var x = (a.c1 * a.b2 - a.c2 * a.b1) / det, y = (a.a1 * a.c2 - a.a2 * a.c1) / det; return { x: x, y: y }; } });
genTool({ file: "util-random-rgb.html", title: "随机 RGB 颜色", desc: "生成随机 RGB 颜色。", category: "util", tags: ["随机", "RGB", "颜色"], order: 2371, fields: [{ id: "n", label: "数量", type: "number", value: 5, min: 1, max: 50 }], gen: function (a) { var n = Math.min(50, Math.max(1, a.n | 0)), out = []; function r() { return Math.floor(Math.random() * 256); } for (var i = 0; i < n; i++) out.push("rgb(" + r() + ", " + r() + ", " + r() + ")"); return out.join("\n"); } });
genTool({ file: "util-random-hsl.html", title: "随机 HSL 颜色", desc: "生成随机 HSL 颜色。", category: "util", tags: ["随机", "HSL", "颜色"], order: 2372, fields: [{ id: "n", label: "数量", type: "number", value: 5, min: 1, max: 50 }], gen: function (a) { var n = Math.min(50, Math.max(1, a.n | 0)), out = []; for (var i = 0; i < n; i++) out.push("hsl(" + Math.floor(Math.random() * 360) + ", " + Math.floor(Math.random() * 60 + 40) + "%, " + Math.floor(Math.random() * 40 + 40) + "%)"); return out.join("\n"); } });

// ---------- Batch 9a：数学 / 几何 / 数论 / 物理 补充 ----------
calcTool({ file: "math-square-root.html", title: "开方与幂", desc: "计算数值的平方根、立方根，以及平方与立方。", category: "calc", tags: ["开方", "幂", "数学"], order: 2373, fields: [{ id: "x", label: "数值 x", type: "number", value: 16 }], outputs: [{ id: "sq", label: "平方 x²" }, { id: "cb", label: "立方 x³" }, { id: "r", label: "平方根" }, { id: "cr", label: "立方根" }], formulas: [{ id: "sq", expr: "x*x" }, { id: "cb", expr: "x*x*x" }, { id: "r", expr: "Math.sqrt(x)" }, { id: "cr", expr: "Math.cbrt(x)" }] });
calcTool({ file: "math-sum-powers.html", title: "平方和与立方和", desc: "计算 1 到 n 的平方和与立方和。", category: "calc", tags: ["平方和", "立方和", "数列"], order: 2374, fields: [{ id: "n", label: "n", type: "number", value: 10, min: 0 }], outputs: [{ id: "s2", label: "平方和" }, { id: "s3", label: "立方和" }], compute: function (a) { var n = Math.max(0, Math.floor(a.n)); return { s2: n * (n + 1) * (2 * n + 1) / 6, s3: Math.pow(n * (n + 1) / 2, 2) }; } });
calcTool({ file: "math-modular-inverse.html", title: "模逆元", desc: "求 a 在模 m 下的乘法逆元（扩展欧几里得），不存在时提示。", category: "calc", tags: ["模逆", "数论", "数学"], order: 2375, fields: [{ id: "a", label: "a", type: "number", value: 3 }, { id: "m", label: "模 m", type: "number", value: 11 }], outputs: [{ id: "res", label: "逆元" }], compute: function (a) { var m0 = Math.max(1, Math.floor(a.m)), a0 = ((Math.floor(a.a)) % m0 + m0) % m0, t = 0, nt = 1, r = m0, nr = a0; while (nr !== 0) { var q = Math.floor(r / nr); var tmp = nt; nt = t - q * nt; t = tmp; tmp = nr; nr = r - q * nr; r = tmp; } if (r > 1) return { res: "不存在逆元" }; if (t < 0) t += m0; return { res: t }; } });
calcTool({ file: "math-modular-exp.html", title: "模幂运算", desc: "计算 (base^exp) mod mod，用于密码学运算。", category: "calc", tags: ["模幂", "数论", "密码"], order: 2376, fields: [{ id: "base", label: "底数", type: "number", value: 2 }, { id: "exp", label: "指数", type: "number", value: 10, min: 0 }, { id: "mod", label: "模", type: "number", value: 1000, min: 1 }], outputs: [{ id: "res", label: "结果" }], compute: function (a) { var b = Math.floor(a.base), e = Math.floor(a.exp), m = Math.floor(a.mod); if (m <= 0) return { res: "模需为正整数" }; b = ((b % m) + m) % m; var r = 1; while (e > 0) { if (e & 1) r = (r * b) % m; b = (b * b) % m; e = Math.floor(e / 2); } return { res: r }; } });
calcTool({ file: "math-euler-totient.html", title: "欧拉函数 φ(n)", desc: "计算小于或等于 n 且与 n 互质的正整数个数。", category: "calc", tags: ["欧拉函数", "互质", "数论"], order: 2377, fields: [{ id: "n", label: "n", type: "number", value: 12, min: 1 }], outputs: [{ id: "res", label: "φ(n)" }], compute: function (a) { var n = Math.floor(a.n), r = n, i = 2; while (i * i <= n) { if (n % i === 0) { while (n % i === 0) n /= i; r -= r / i; } i++; } if (n > 1) r -= r / n; return { res: r }; } });
calcTool({ file: "math-hyperbolic.html", title: "双曲函数", desc: "计算双曲正弦、余弦与正切。", category: "calc", tags: ["双曲", "函数", "数学"], order: 2378, fields: [{ id: "x", label: "x", type: "number", value: 1 }], outputs: [{ id: "sh", label: "sinh" }, { id: "ch", label: "cosh" }, { id: "th", label: "tanh" }], formulas: [{ id: "sh", expr: "(Math.exp(x)-Math.exp(-x))/2" }, { id: "ch", expr: "(Math.exp(x)+Math.exp(-x))/2" }, { id: "th", expr: "(Math.exp(2*x)-1)/(Math.exp(2*x)+1)" }] });
calcTool({ file: "math-trig-advanced.html", title: "三角函数全家桶", desc: "计算角的正弦、余弦、正切、余割、正割、余切。", category: "calc", tags: ["三角函数", "数学"], order: 2379, fields: [{ id: "angle", label: "角度", type: "number", value: 30 }, { id: "unit", label: "单位", type: "select", options: [{ value: "deg", label: "度" }, { value: "rad", label: "弧度" }] }], outputs: [{ id: "sin", label: "sin" }, { id: "cos", label: "cos" }, { id: "tan", label: "tan" }, { id: "csc", label: "csc" }, { id: "sec", label: "sec" }, { id: "cot", label: "cot" }], compute: function (a) { var r = a.unit === "rad" ? a.angle : a.angle * Math.PI / 180; var s = Math.sin(r), c = Math.cos(r), t = Math.tan(r); return { sin: s, cos: c, tan: t, csc: s !== 0 ? 1 / s : "∞", sec: c !== 0 ? 1 / c : "∞", cot: t !== 0 ? 1 / t : "∞" }; } });
genTool({ file: "math-pascal-triangle.html", title: "杨辉三角", desc: "生成前 N 行杨辉三角（帕斯卡三角）。", category: "util", tags: ["杨辉三角", "组合", "数学"], order: 2380, fields: [{ id: "n", label: "行数 N", type: "number", value: 8, min: 1, max: 30 }], gen: function (a) { var n = Math.min(30, Math.max(1, a.n | 0)), rows = []; for (var i = 0; i < n; i++) { var row = [], v = 1; for (var k = 0; k <= i; k++) { row.push(v); v = v * (i - k) / (k + 1); } rows.push(row.join(" ")); } return rows.join("\n"); } });
genTool({ file: "math-lucas-sequence.html", title: "卢卡斯数列", desc: "生成前 N 项卢卡斯数列（2, 1, 3, 4, 7 …）。", category: "util", tags: ["卢卡斯", "数列", "数学"], order: 2381, fields: [{ id: "n", label: "项数 N", type: "number", value: 12, min: 1, max: 100 }], gen: function (a) { var n = Math.min(100, Math.max(1, a.n | 0)), out = []; var a0 = 2, b = 1; if (n >= 1) out.push(a0); if (n >= 2) out.push(b); for (var i = 2; i < n; i++) { var t = a0 + b; out.push(t); a0 = b; b = t; } return out.join(", "); } });
genTool({ file: "math-catalan-number.html", title: "卡特兰数", desc: "生成前 N 项卡特兰数。", category: "util", tags: ["卡特兰", "组合", "数学"], order: 2382, fields: [{ id: "n", label: "项数 N", type: "number", value: 10, min: 1, max: 60 }], gen: function (a) { var n = Math.min(60, Math.max(1, a.n | 0)), out = []; var c = 1; for (var k = 0; k < n; k++) { if (k > 0) c = c * 2 * (2 * k + 1) / (k + 2); out.push(Math.round(c)); } return out.join(", "); } });
calcTool({ file: "math-trailing-zeros.html", title: "阶乘尾零个数", desc: "计算 n! 末尾连续零的个数（即因子 5 的个数）。", category: "calc", tags: ["阶乘", "尾零", "数论"], order: 2383, fields: [{ id: "n", label: "n", type: "number", value: 100, min: 0 }], outputs: [{ id: "res", label: "尾零数" }], compute: function (a) { var n = Math.max(0, Math.floor(a.n)), c = 0; while (n >= 5) { n = Math.floor(n / 5); c += n; } return { res: c }; } });
calcTool({ file: "math-weighted-average.html", title: "加权平均值", desc: "按权重计算一组数值的加权平均值。", category: "calc", tags: ["加权平均", "统计", "数学"], order: 2384, fields: [{ id: "vals", label: "数值（逗号分隔）", type: "text", value: "80, 90, 70" }, { id: "weights", label: "权重（逗号分隔）", type: "text", value: "2, 3, 1" }], outputs: [{ id: "res", label: "加权均值" }], compute: function (a) { function p(s) { return s.split(",").map(function (x) { return parseFloat(x); }).filter(function (x) { return !isNaN(x); }); } var v = p(a.vals), w = p(a.weights); if (v.length !== w.length || v.length === 0) return { res: "数值与权重数量需一致" }; var sw = 0, sv = 0; for (var i = 0; i < v.length; i++) { sv += v[i] * w[i]; sw += w[i]; } return { res: sw === 0 ? "权重和为 0" : sv / sw }; } });
calcTool({ file: "math-stat-summary.html", title: "统计汇总", desc: "一次性给出计数、和、均值、中位数、众数、方差、标准差、极差、最小/最大值。", category: "calc", tags: ["统计", "汇总", "描述统计"], order: 2385, fields: [{ id: "x", label: "数据（逗号/空格分隔）", type: "text", value: "3, 7, 2, 9, 5, 8, 1, 6" }], outputs: [{ id: "n", label: "计数" }, { id: "sum", label: "和" }, { id: "mean", label: "均值" }, { id: "median", label: "中位数" }, { id: "mode", label: "众数" }, { id: "vari", label: "方差" }, { id: "sd", label: "标准差" }, { id: "range", label: "极差" }, { id: "min", label: "最小" }, { id: "max", label: "最大" }], compute: function (a) { function p(s) { return s.split(/[\s,;]+/).map(Number).filter(function (x) { return !isNaN(x); }); } var d = p(a.x); if (d.length === 0) return { n: 0, sum: "—", mean: "—", median: "—", mode: "—", vari: "—", sd: "—", range: "—", min: "—", max: "—" }; var n = d.length, sum = d.reduce(function (s, x) { return s + x; }, 0), mean = sum / n; var sd = d.slice().sort(function (p, c) { return p - c; }); var med = n % 2 ? sd[(n - 1) / 2] : (sd[n / 2 - 1] + sd[n / 2]) / 2; var f = {}, mode = d[0], mc = 0; d.forEach(function (x) { f[x] = (f[x] || 0) + 1; if (f[x] > mc) { mc = f[x]; mode = x; } }); var v = d.reduce(function (s, x) { return s + (x - mean) * (x - mean); }, 0) / n; return { n: n, sum: sum, mean: mean, median: med, mode: mode, vari: v, sd: Math.sqrt(v), range: sd[n - 1] - sd[0], min: sd[0], max: sd[n - 1] }; } });
calcTool({ file: "math-skewness.html", title: "偏度", desc: "计算数据分布的三阶偏度（样本）。", category: "calc", tags: ["偏度", "统计", "分布"], order: 2386, fields: [{ id: "x", label: "数据（逗号分隔）", type: "text", value: "1, 2, 2, 3, 5, 8" }], outputs: [{ id: "res", label: "偏度" }], compute: function (a) { function p(s) { return s.split(/[\s,;]+/).map(Number).filter(function (x) { return !isNaN(x); }); } var d = p(a.x); var n = d.length; if (n < 3) return { res: "数据不足" }; var m = d.reduce(function (s, x) { return s + x; }, 0) / n; var v = d.reduce(function (s, x) { return s + (x - m) * (x - m); }, 0) / n; var sdv = Math.sqrt(v); var sk = d.reduce(function (s, x) { return s + Math.pow((x - m) / sdv, 3); }, 0) / n; return { res: sk }; } });
calcTool({ file: "math-kurtosis.html", title: "峰度", desc: "计算数据分布的四阶峰度（超额峰度）。", category: "calc", tags: ["峰度", "统计", "分布"], order: 2387, fields: [{ id: "x", label: "数据（逗号分隔）", type: "text", value: "1, 2, 2, 3, 5, 8" }], outputs: [{ id: "res", label: "峰度" }], compute: function (a) { function p(s) { return s.split(/[\s,;]+/).map(Number).filter(function (x) { return !isNaN(x); }); } var d = p(a.x); var n = d.length; if (n < 4) return { res: "数据不足" }; var m = d.reduce(function (s, x) { return s + x; }, 0) / n; var v = d.reduce(function (s, x) { return s + (x - m) * (x - m); }, 0) / n; var sdv = Math.sqrt(v); var k = d.reduce(function (s, x) { return s + Math.pow((x - m) / sdv, 4); }, 0) / n - 3; return { res: k }; } });
calcTool({ file: "math-standard-error.html", title: "标准误", desc: "由样本标准差与样本容量估计均值的标准误。", category: "calc", tags: ["标准误", "统计"], order: 2388, fields: [{ id: "sd", label: "样本标准差", type: "number", value: 5 }, { id: "n", label: "样本容量 n", type: "number", value: 25, min: 1 }], outputs: [{ id: "res", label: "标准误" }], formulas: [{ id: "res", expr: "sd/Math.sqrt(n)" }] });
calcTool({ file: "math-line-from-points.html", title: "两点求直线方程", desc: "由两点坐标求直线斜率、截距与方程。", category: "calc", tags: ["直线", "斜率", "代数"], order: 2389, fields: [{ id: "x1", label: "x1", type: "number", value: 1 }, { id: "y1", label: "y1", type: "number", value: 2 }, { id: "x2", label: "x2", type: "number", value: 4 }, { id: "y2", label: "y2", type: "number", value: 8 }], outputs: [{ id: "slope", label: "斜率 k" }, { id: "b", label: "截距 b" }, { id: "eq", label: "方程" }], compute: function (a) { if (a.x1 === a.x2) return { slope: "∞", b: "—", eq: "x = " + a.x1 }; var k = (a.y2 - a.y1) / (a.x2 - a.x1); var b = a.y1 - k * a.x1; return { slope: k, b: b, eq: "y = " + (Math.round(k * 1000) / 1000) + "x " + (b >= 0 ? "+ " : "- ") + (Math.round(Math.abs(b) * 1000) / 1000) }; } });
calcTool({ file: "math-point-to-line.html", title: "点到直线距离", desc: "计算点 (x0,y0) 到直线 ax+by+c=0 的距离。", category: "calc", tags: ["距离", "直线", "几何"], order: 2390, fields: [{ id: "x0", label: "x0", type: "number", value: 0 }, { id: "y0", label: "y0", type: "number", value: 0 }, { id: "a", label: "a", type: "number", value: 1 }, { id: "b", label: "b", type: "number", value: 1 }, { id: "c", label: "c", type: "number", value: -2 }], outputs: [{ id: "d", label: "距离" }], compute: function (a) { var den = Math.sqrt(a.a * a.a + a.b * a.b); if (den === 0) return { d: "a、b 不能同时为 0" }; return { d: Math.abs(a.a * a.x0 + a.b * a.y0 + a.c) / den }; } });
calcTool({ file: "math-matrix-2x2.html", title: "2×2 行列式", desc: "计算二阶方阵的行列式。", category: "calc", tags: ["行列式", "矩阵", "线性代数"], order: 2391, fields: [{ id: "a", label: "a (左上)", type: "number", value: 1 }, { id: "b", label: "b (右上)", type: "number", value: 2 }, { id: "c", label: "c (左下)", type: "number", value: 3 }, { id: "d", label: "d (右下)", type: "number", value: 4 }], outputs: [{ id: "det", label: "行列式" }], formulas: [{ id: "det", expr: "a*d-b*c" }] });
calcTool({ file: "math-matrix-3x3.html", title: "3×3 行列式", desc: "按萨吕法则计算三阶方阵的行列式。", category: "calc", tags: ["行列式", "矩阵", "线性代数"], order: 2392, fields: [{ id: "a11", label: "a11", type: "number", value: 1 }, { id: "a12", label: "a12", type: "number", value: 2 }, { id: "a13", label: "a13", type: "number", value: 0 }, { id: "a21", label: "a21", type: "number", value: 0 }, { id: "a22", label: "a22", type: "number", value: 1 }, { id: "a23", label: "a23", type: "number", value: 3 }, { id: "a31", label: "a31", type: "number", value: 2 }, { id: "a32", label: "a32", type: "number", value: 0 }, { id: "a33", label: "a33", type: "number", value: 1 }], outputs: [{ id: "det", label: "行列式" }], compute: function (a) { return { det: a.a11 * (a.a22 * a.a33 - a.a23 * a.a32) - a.a12 * (a.a21 * a.a33 - a.a23 * a.a31) + a.a13 * (a.a21 * a.a32 - a.a22 * a.a31) }; } });
calcTool({ file: "math-vector-3d.html", title: "三维向量运算", desc: "计算两向量的点积、叉积、模长与夹角。", category: "calc", tags: ["向量", "点积", "叉积"], order: 2393, fields: [{ id: "u1", label: "u₁", type: "number", value: 1 }, { id: "u2", label: "u₂", type: "number", value: 0 }, { id: "u3", label: "u₃", type: "number", value: 0 }, { id: "v1", label: "v₁", type: "number", value: 0 }, { id: "v2", label: "v₂", type: "number", value: 1 }, { id: "v3", label: "v₃", type: "number", value: 0 }], outputs: [{ id: "dot", label: "点积" }, { id: "cross", label: "叉积" }, { id: "mu", label: "|u|" }, { id: "mv", label: "|v|" }, { id: "ang", label: "夹角(°)" }], compute: function (a) { var dot = a.u1 * a.v1 + a.u2 * a.v2 + a.u3 * a.v3; var cx = a.u2 * a.v3 - a.u3 * a.v2, cy = a.u3 * a.v1 - a.u1 * a.v3, cz = a.u1 * a.v2 - a.u2 * a.v1; var mu = Math.sqrt(a.u1 * a.u1 + a.u2 * a.u2 + a.u3 * a.u3), mv = Math.sqrt(a.v1 * a.v1 + a.v2 * a.v2 + a.v3 * a.v3); var ang = (mu * mv) === 0 ? "—" : Math.acos(dot / (mu * mv)) * 180 / Math.PI; return { dot: dot, cross: "(" + cx + ", " + cy + ", " + cz + ")", mu: mu, mv: mv, ang: ang }; } });
calcTool({ file: "math-vector-projection.html", title: "向量投影", desc: "计算向量 u 在 v 上的标量投影与向量投影。", category: "calc", tags: ["向量", "投影", "线性代数"], order: 2394, fields: [{ id: "u1", label: "u₁", type: "number", value: 3 }, { id: "u2", label: "u₂", type: "number", value: 4 }, { id: "v1", label: "v₁", type: "number", value: 1 }, { id: "v2", label: "v₂", type: "number", value: 0 }], outputs: [{ id: "scalar", label: "标量投影" }, { id: "vec", label: "向量投影" }], compute: function (a) { var dot = a.u1 * a.v1 + a.u2 * a.v2; var vv = a.v1 * a.v1 + a.v2 * a.v2; if (vv === 0) return { scalar: "v 为零向量", vec: "—" }; var k = dot / vv; return { scalar: dot / Math.sqrt(vv), vec: "(" + (k * a.v1) + ", " + (k * a.v2) + ")" }; } });
calcTool({ file: "math-digit-sum.html", title: "各位数字之和", desc: "计算整数各位数字相加的和与数字根。", category: "calc", tags: ["数位", "数根", "数学"], order: 2395, fields: [{ id: "n", label: "整数 n", type: "text", value: "123456" }], outputs: [{ id: "sum", label: "数位和" }, { id: "root", label: "数字根" }], compute: function (a) { var s = String(a.n).replace(/[^0-9]/g, ""); if (!s) return { sum: "—", root: "—" }; var sum = 0; for (var i = 0; i < s.length; i++) sum += +s[i]; var r = sum; while (r > 9) { var t = 0; while (r) { t += r % 10; r = Math.floor(r / 10); } r = t; } return { sum: sum, root: r }; } });
calcTool({ file: "math-is-palindrome-number.html", title: "回文数判断", desc: "判断一个整数是否为回文数（正读反读相同）。", category: "calc", tags: ["回文数", "数学"], order: 2396, fields: [{ id: "n", label: "整数 n", type: "text", value: "12321" }], outputs: [{ id: "res", label: "结果" }], compute: function (a) { var s = String(a.n).replace(/[^0-9]/g, ""); if (!s) return { res: "请输入数字" }; var r = s.split("").reverse().join(""); return { res: s === r ? "是回文数" : "不是回文数" }; } });
calcTool({ file: "math-prime-gap.html", title: "相邻质数差", desc: "求大于 n 的下一个质数，并给出间隔。", category: "calc", tags: ["质数", "间隔", "数论"], order: 2397, fields: [{ id: "n", label: "整数 n", type: "number", value: 100, min: 0 }], outputs: [{ id: "next", label: "下一个质数" }, { id: "gap", label: "间隔" }], compute: function (a) { function isP(x) { if (x < 2) return false; for (var i = 2; i * i <= x; i++) if (x % i === 0) return false; return true; } var n = Math.max(0, Math.floor(a.n)); var c = n + 1; while (!isP(c)) c++; return { next: c, gap: c - n }; } });
calcTool({ file: "math-fibonacci-nth.html", title: "第 N 个斐波那契数", desc: "直接计算第 N 项斐波那契数（支持较大 N）。", category: "calc", tags: ["斐波那契", "数学"], order: 2398, fields: [{ id: "n", label: "N", type: "number", value: 20, min: 0 }], outputs: [{ id: "res", label: "F(N)" }], compute: function (a) { var n = Math.floor(a.n); if (n > 1476) return { res: "数值过大" }; var p = 0, q = 1; for (var i = 0; i < n; i++) { var t = p + q; p = q; q = t; } return { res: p }; } });
calcTool({ file: "math-cubic-solver.html", title: "一元三次方程", desc: "数值求解 x³ + ax² + bx + c = 0 的实根。", category: "calc", tags: ["三次方程", "代数", "数学"], order: 2399, fields: [{ id: "a", label: "a (x² 系数)", type: "number", value: 0 }, { id: "b", label: "b (x 系数)", type: "number", value: -1 }, { id: "c", label: "c (常数)", type: "number", value: 0 }], outputs: [{ id: "r1", label: "根 1" }, { id: "r2", label: "根 2" }, { id: "r3", label: "根 3" }], compute: function (a) { function f(x) { return x * x * x + a.a * x * x + a.b * x + a.c; } function df(x) { return 3 * x * x + 2 * a.a * x + a.b; } var roots = [], guesses = [-10, -3, 0, 3, 10]; for (var g = 0; g < guesses.length; g++) { var x = guesses[g]; for (var it = 0; it < 60; it++) { var d = df(x); if (Math.abs(d) < 1e-12) break; var nx = x - f(x) / d; if (Math.abs(nx - x) < 1e-12) { x = nx; break; } x = nx; } var found = false; for (var k = 0; k < roots.length; k++) if (Math.abs(roots[k] - x) < 1e-7) found = true; if (!found && isFinite(x)) roots.push(Math.round(x * 1e9) / 1e9); } roots.sort(function (p, c) { return p - c; }); while (roots.length < 3) roots.push("—"); return { r1: roots[0], r2: roots[1], r3: roots[2] }; } });
calcTool({ file: "math-rounding-modes.html", title: "取整方式", desc: "对同一数值分别做向下、向上、四舍五入与截断取整。", category: "calc", tags: ["取整", "四舍五入", "数学"], order: 2400, fields: [{ id: "x", label: "数值 x", type: "number", value: 3.7 }], outputs: [{ id: "floor", label: "向下 floor" }, { id: "ceil", label: "向上 ceil" }, { id: "round", label: "四舍五入" }, { id: "trunc", label: "截断 trunc" }], formulas: [{ id: "floor", expr: "Math.floor(x)" }, { id: "ceil", expr: "Math.ceil(x)" }, { id: "round", expr: "Math.round(x)" }, { id: "trunc", expr: "Math.trunc(x)" }] });
calcTool({ file: "math-map-range.html", title: "数值区间映射", desc: "将数值从 [a,b] 线性映射到 [c,d]。", category: "calc", tags: ["映射", "归一化", "数学"], order: 2401, fields: [{ id: "v", label: "值 v", type: "number", value: 5 }, { id: "a", label: "源区间 a", type: "number", value: 0 }, { id: "b", label: "源区间 b", type: "number", value: 10 }, { id: "c", label: "目标 a", type: "number", value: 0 }, { id: "d", label: "目标 b", type: "number", value: 100 }], outputs: [{ id: "res", label: "映射结果" }], compute: function (a) { if (a.b === a.a) return { res: "源区间不能为点" }; return { res: a.c + (a.v - a.a) * (a.d - a.c) / (a.b - a.a) }; } });
calcTool({ file: "math-clamp.html", title: "数值钳制", desc: "将数值限制在 [min, max] 区间内。", category: "calc", tags: ["钳制", "范围", "数学"], order: 2402, fields: [{ id: "v", label: "值 v", type: "number", value: 15 }, { id: "lo", label: "下限", type: "number", value: 0 }, { id: "hi", label: "上限", type: "number", value: 10 }], outputs: [{ id: "res", label: "结果" }], compute: function (a) { return { res: Math.min(a.hi, Math.max(a.lo, a.v)) }; } });
calcTool({ file: "geo-heron.html", title: "海伦公式求面积", desc: "已知三角形三边长，用海伦公式求面积。", category: "calc", tags: ["海伦公式", "三角形", "几何"], order: 2403, fields: [{ id: "a", label: "边 a", type: "number", value: 3 }, { id: "b", label: "边 b", type: "number", value: 4 }, { id: "c", label: "边 c", type: "number", value: 5 }], outputs: [{ id: "area", label: "面积" }], compute: function (a) { if (a.a + a.b <= a.c || a.a + a.c <= a.b || a.b + a.c <= a.a) return { area: "不能构成三角形" }; var s = (a.a + a.b + a.c) / 2; return { area: Math.sqrt(s * (s - a.a) * (s - a.b) * (s - a.c)) }; } });
calcTool({ file: "geo-law-of-cosines.html", title: "余弦定理求边", desc: "已知两边及其夹角，求第三边。", category: "calc", tags: ["余弦定理", "三角形", "几何"], order: 2404, fields: [{ id: "a", label: "边 a", type: "number", value: 5 }, { id: "b", label: "边 b", type: "number", value: 7 }, { id: "C", label: "夹角 C (°)", type: "number", value: 60 }], outputs: [{ id: "c", label: "边 c" }], formulas: [{ id: "c", expr: "Math.sqrt(a*a+b*b-2*a*b*Math.cos(C*Math.PI/180))" }] });
calcTool({ file: "geo-triangle-angles.html", title: "三角形三角", desc: "已知三边长，求三个内角（度）。", category: "calc", tags: ["三角形", "角度", "几何"], order: 2405, fields: [{ id: "a", label: "边 a", type: "number", value: 3 }, { id: "b", label: "边 b", type: "number", value: 4 }, { id: "c", label: "边 c", type: "number", value: 5 }], outputs: [{ id: "A", label: "角 A" }, { id: "B", label: "角 B" }, { id: "C", label: "角 C" }], compute: function (a) { if (a.a + a.b <= a.c || a.a + a.c <= a.b || a.b + a.c <= a.a) return { A: "—", B: "—", C: "—" }; var A = Math.acos((a.b * a.b + a.c * a.c - a.a * a.a) / (2 * a.b * a.c)) * 180 / Math.PI; var B = Math.acos((a.a * a.a + a.c * a.c - a.b * a.b) / (2 * a.a * a.c)) * 180 / Math.PI; var C = 180 - A - B; return { A: A, B: B, C: C }; } });
calcTool({ file: "geo-distance-3d.html", title: "三维两点距离", desc: "计算三维空间两点间的直线距离。", category: "calc", tags: ["距离", "三维", "几何"], order: 2406, fields: [{ id: "x1", label: "x1", type: "number", value: 0 }, { id: "y1", label: "y1", type: "number", value: 0 }, { id: "z1", label: "z1", type: "number", value: 0 }, { id: "x2", label: "x2", type: "number", value: 3 }, { id: "y2", label: "y2", type: "number", value: 4 }, { id: "z2", label: "z2", type: "number", value: 12 }], outputs: [{ id: "d", label: "距离" }], formulas: [{ id: "d", expr: "Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1)+(z2-z1)*(z2-z1))" }] });
calcTool({ file: "geo-midpoint-3d.html", title: "三维中点", desc: "计算三维空间两点连线的中点坐标。", category: "calc", tags: ["中点", "三维", "几何"], order: 2407, fields: [{ id: "x1", label: "x1", type: "number", value: 0 }, { id: "y1", label: "y1", type: "number", value: 0 }, { id: "z1", label: "z1", type: "number", value: 0 }, { id: "x2", label: "x2", type: "number", value: 2 }, { id: "y2", label: "y2", type: "number", value: 4 }, { id: "z2", label: "z2", type: "number", value: 6 }], outputs: [{ id: "m", label: "中点" }], compute: function (a) { return { m: "(" + ((a.x1 + a.x2) / 2) + ", " + ((a.y1 + a.y2) / 2) + ", " + ((a.z1 + a.z2) / 2) + ")" }; } });
calcTool({ file: "geo-polygon-interior.html", title: "正多边形内角", desc: "计算正 n 边形的内角和与每个内角大小。", category: "calc", tags: ["多边形", "内角", "几何"], order: 2408, fields: [{ id: "n", label: "边数 n", type: "number", value: 6, min: 3 }], outputs: [{ id: "sum", label: "内角和" }, { id: "each", label: "每个内角" }], formulas: [{ id: "sum", expr: "(n-2)*180" }, { id: "each", expr: "(n-2)*180/n" }] });
calcTool({ file: "geo-rectangle-diagonal.html", title: "矩形对角线", desc: "计算矩形的对角线长度。", category: "calc", tags: ["矩形", "对角线", "几何"], order: 2409, fields: [{ id: "w", label: "宽", type: "number", value: 3 }, { id: "h", label: "高", type: "number", value: 4 }], outputs: [{ id: "d", label: "对角线" }], formulas: [{ id: "d", expr: "Math.sqrt(w*w+h*h)" }] });
calcTool({ file: "geo-ellipse-perimeter.html", title: "椭圆周长", desc: "用拉马努金公式近似计算椭圆周长。", category: "calc", tags: ["椭圆", "周长", "几何"], order: 2410, fields: [{ id: "a", label: "长半轴 a", type: "number", value: 5 }, { id: "b", label: "短半轴 b", type: "number", value: 3 }], outputs: [{ id: "p", label: "周长(近似)" }], compute: function (a) { var h = Math.pow((a.a - a.b) / (a.a + a.b), 2); return { p: Math.PI * (a.a + a.b) * (1 + 3 * h / (10 + Math.sqrt(4 - 3 * h))) }; } });
calcTool({ file: "geo-circle-segment.html", title: "圆弓形面积", desc: "已知半径与圆心角，求圆弓形（segment）面积。", category: "calc", tags: ["圆", "弓形", "几何"], order: 2411, fields: [{ id: "r", label: "半径 r", type: "number", value: 5 }, { id: "deg", label: "圆心角 (°)", type: "number", value: 90 }], outputs: [{ id: "area", label: "弓形面积" }], compute: function (a) { var t = a.deg * Math.PI / 180; var sector = 0.5 * a.r * a.r * t; var tri = 0.5 * a.r * a.r * Math.sin(t); return { area: sector - tri }; } });
calcTool({ file: "geo-apothem.html", title: "正多边形边心距", desc: "已知边数与边长，求正多边形的边心距。", category: "calc", tags: ["边心距", "多边形", "几何"], order: 2412, fields: [{ id: "n", label: "边数 n", type: "number", value: 6, min: 3 }, { id: "s", label: "边长 s", type: "number", value: 4 }], outputs: [{ id: "ap", label: "边心距" }], formulas: [{ id: "ap", expr: "s/(2*Math.tan(Math.PI/n))" }] });
calcTool({ file: "geo-haversine.html", title: "两地球面距离", desc: "用 Haversine 公式按经纬度计算地球表面两点距离。", category: "calc", tags: ["经纬度", "距离", "地理"], order: 2413, fields: [{ id: "lat1", label: "纬度1 (°)", type: "number", value: 39.9 }, { id: "lon1", label: "经度1 (°)", type: "number", value: 116.4 }, { id: "lat2", label: "纬度2 (°)", type: "number", value: 31.2 }, { id: "lon2", label: "经度2 (°)", type: "number", value: 121.5 }], outputs: [{ id: "km", label: "距离 (km)" }, { id: "mi", label: "距离 (mi)" }], compute: function (a) { var R = 6371, toR = Math.PI / 180; var dLat = (a.lat2 - a.lat1) * toR, dLon = (a.lon2 - a.lon1) * toR; var s = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a.lat1 * toR) * Math.cos(a.lat2 * toR) * Math.sin(dLon / 2) * Math.sin(dLon / 2); var ang = 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s)); var km = R * ang; return { km: km, mi: km * 0.621371 }; } });
calcTool({ file: "phys-coulomb.html", title: "库仑定律", desc: "计算两点电荷之间的静电力大小。", category: "calc", tags: ["库仑", "静电", "物理"], order: 2414, fields: [{ id: "q1", label: "电荷1 q1 (C)", type: "number", value: 1e-6 }, { id: "q2", label: "电荷2 q2 (C)", type: "number", value: 1e-6 }, { id: "r", label: "距离 r (m)", type: "number", value: 0.1 }], outputs: [{ id: "f", label: "力 F (N)" }], formulas: [{ id: "f", expr: "8.9875517923e9*Math.abs(q1*q2)/(r*r)" }] });
calcTool({ file: "phys-buoyancy.html", title: "浮力计算", desc: "按阿基米德原理计算物体所受浮力 F = ρVg。", category: "calc", tags: ["浮力", "密度", "物理"], order: 2415, fields: [{ id: "rho", label: "液体密度 ρ (kg/m³)", type: "number", value: 1000 }, { id: "V", label: "排开体积 V (m³)", type: "number", value: 0.002 }], outputs: [{ id: "f", label: "浮力 (N)" }], formulas: [{ id: "f", expr: "rho*V*9.8" }] });
calcTool({ file: "phys-reactance.html", title: "感抗与容抗", desc: "计算电感感抗 XL=2πfL 与电容容抗 XC=1/(2πfC)。", category: "calc", tags: ["感抗", "容抗", "电学"], order: 2416, fields: [{ id: "f", label: "频率 f (Hz)", type: "number", value: 50 }, { id: "L", label: "电感 L (H)", type: "number", value: 0.1 }, { id: "C", label: "电容 C (F)", type: "number", value: 1e-5 }], outputs: [{ id: "xl", label: "感抗 XL (Ω)" }, { id: "xc", label: "容抗 XC (Ω)" }], formulas: [{ id: "xl", expr: "2*Math.PI*f*L" }, { id: "xc", expr: "1/(2*Math.PI*f*C)" }] });
calcTool({ file: "phys-rc-time.html", title: "RC 时间常数", desc: "计算 RC 电路的时间常数 τ = RC 与充电到 63.2% 的用时。", category: "calc", tags: ["时间常数", "RC", "电路"], order: 2417, fields: [{ id: "R", label: "电阻 R (Ω)", type: "number", value: 1000 }, { id: "C", label: "电容 C (F)", type: "number", value: 1e-4 }], outputs: [{ id: "tau", label: "τ (s)" }], formulas: [{ id: "tau", expr: "R*C" }] });
calcTool({ file: "phys-rl-time.html", title: "RL 时间常数", desc: "计算 RL 电路的时间常数 τ = L/R。", category: "calc", tags: ["时间常数", "RL", "电路"], order: 2418, fields: [{ id: "L", label: "电感 L (H)", type: "number", value: 0.1 }, { id: "R", label: "电阻 R (Ω)", type: "number", value: 10 }], outputs: [{ id: "tau", label: "τ (s)" }], formulas: [{ id: "tau", expr: "L/R" }] });
calcTool({ file: "phys-planck.html", title: "光子能量", desc: "按普朗克公式 E = hf 计算光子能量（焦耳与电子伏特）。", category: "calc", tags: ["光子", "能量", "物理"], order: 2419, fields: [{ id: "f", label: "频率 f (Hz)", type: "number", value: 5e14 }], outputs: [{ id: "e", label: "能量 E (J)" }, { id: "ev", label: "能量 (eV)" }], formulas: [{ id: "e", expr: "6.62607015e-34*f" }, { id: "ev", expr: "6.62607015e-34*f/1.602176634e-19" }] });

// ---------- Batch 9b：金融 / 健康 计算器补充 ----------
calcTool({ file: "fin-future-value.html", title: "复利终值", desc: "按本金、年利率与年限计算一次性投资的复利终值。", category: "calc", tags: ["复利", "终值", "理财"], order: 2420, fields: [{ id: "pv", label: "本金 (元)", type: "number", value: 10000 }, { id: "r", label: "年利率 (%)", type: "number", value: 5 }, { id: "n", label: "年限", type: "number", value: 10 }], outputs: [{ id: "fv", label: "终值" }], formulas: [{ id: "fv", expr: "pv*Math.pow(1+r/100,n)" }] });
calcTool({ file: "fin-bond-yield.html", title: "债券收益", desc: "按面值、票面利率、价格与剩余年限估算当期收益率与近似到期收益率。", category: "calc", tags: ["债券", "收益率", "理财"], order: 2421, fields: [{ id: "face", label: "面值 (元)", type: "number", value: 100 }, { id: "coupon", label: "票面利率 (%)", type: "number", value: 5 }, { id: "price", label: "市场价格 (元)", type: "number", value: 98 }, { id: "years", label: "剩余年限", type: "number", value: 5 }], outputs: [{ id: "cy", label: "当期收益率" }, { id: "ytm", label: "近似到期收益率" }], compute: function (a) { var coup = a.face * a.coupon / 100; var cy = coup / a.price * 100; var ytm = (coup + (a.face - a.price) / a.years) / ((a.face + a.price) / 2) * 100; return { cy: cy, ytm: ytm }; } });
calcTool({ file: "fin-depreciation.html", title: "直线折旧", desc: "按原值、残值与使用年限计算每年折旧额与折旧率。", category: "calc", tags: ["折旧", "资产", "财务"], order: 2422, fields: [{ id: "cost", label: "原值 (元)", type: "number", value: 50000 }, { id: "salvage", label: "残值 (元)", type: "number", value: 5000 }, { id: "life", label: "使用年限", type: "number", value: 5 }], outputs: [{ id: "annual", label: "年折旧额" }, { id: "rate", label: "折旧率 (%)" }], compute: function (a) { if (a.life <= 0) return { annual: "年限需为正", rate: "—" }; var annual = (a.cost - a.salvage) / a.life; return { annual: annual, rate: (annual / a.cost * 100) }; } });
calcTool({ file: "fin-amortization.html", title: "等额本息月供", desc: "计算贷款的每月还款额、总利息与总还款。", category: "calc", tags: ["贷款", "月供", "还款"], order: 2423, fields: [{ id: "principal", label: "贷款本金 (元)", type: "number", value: 1000000 }, { id: "rate", label: "年利率 (%)", type: "number", value: 4.9 }, { id: "years", label: "期限 (年)", type: "number", value: 30 }], outputs: [{ id: "monthly", label: "月供" }, { id: "interest", label: "总利息" }, { id: "total", label: "总还款" }], compute: function (a) { var n = a.years * 12, rm = a.rate / 100 / 12; var m; if (rm === 0) { m = a.principal / n; } else { var f = Math.pow(1 + rm, n); m = a.principal * rm * f / (f - 1); } var total = m * n; return { monthly: m, interest: total - a.principal, total: total }; } });
calcTool({ file: "fin-retirement.html", title: "退休金估算", desc: "按当前年龄、退休年龄、现有储蓄与月缴存估算退休时总资产。", category: "calc", tags: ["退休", "储蓄", "理财"], order: 2424, fields: [{ id: "age", label: "当前年龄", type: "number", value: 30 }, { id: "retire", label: "退休年龄", type: "number", value: 60 }, { id: "saving", label: "现有储蓄 (元)", type: "number", value: 100000 }, { id: "monthly", label: "月缴存 (元)", type: "number", value: 3000 }, { id: "ret", label: "年收益 (%)", type: "number", value: 6 }], outputs: [{ id: "final", label: "退休时资产" }], compute: function (a) { var months = Math.max(0, (a.retire - a.age) * 12); var rm = a.ret / 100 / 12; var fv = a.saving * Math.pow(1 + rm, months); if (rm === 0) fv += a.monthly * months; else fv += a.monthly * (Math.pow(1 + rm, months) - 1) / rm; return { final: fv }; } });
calcTool({ file: "fin-lease.html", title: "租车/租赁月供", desc: "按车价、残值率、期限与利率估算每月租赁付款。", category: "calc", tags: ["租赁", "月供", "汽车"], order: 2425, fields: [{ id: "price", label: "资产价格 (元)", type: "number", value: 200000 }, { id: "residual", label: "残值率 (%)", type: "number", value: 50 }, { id: "term", label: "期限 (月)", type: "number", value: 36 }, { id: "rate", label: "年利率 (%)", type: "number", value: 5 }], outputs: [{ id: "monthly", label: "月供" }], compute: function (a) { var rv = a.price * a.residual / 100; var rm = a.rate / 100 / 12; var dep = (a.price - rv) / a.term; var finance = rm === 0 ? 0 : (a.price + rv) / 2 * rm; return { monthly: dep + finance }; } });
calcTool({ file: "fin-debt-payoff.html", title: "债务还清时间", desc: "按欠款余额、利率与每月还款额估算还清所需月数与总利息。", category: "calc", tags: ["债务", "还款", "理财"], order: 2426, fields: [{ id: "balance", label: "欠款余额 (元)", type: "number", value: 50000 }, { id: "rate", label: "年利率 (%)", type: "number", value: 18 }, { id: "pay", label: "每月还款 (元)", type: "number", value: 2000 }], outputs: [{ id: "months", label: "所需月数" }, { id: "interest", label: "总利息" }], compute: function (a) { var rm = a.rate / 100 / 12; if (rm === 0) { var m = Math.ceil(a.balance / a.pay); return { months: m, interest: 0 }; } if (a.pay <= a.balance * rm) return { months: "无法还清（月供过低）", interest: "—" }; var months = Math.ceil(Math.log(a.pay / (a.pay - a.balance * rm)) / Math.log(1 + rm)); var total = a.pay * months; return { months: months, interest: total - a.balance }; } });
calcTool({ file: "fin-currency-manual.html", title: "汇率换算(手动)", desc: "按手动输入的汇率换算两种货币金额。", category: "calc", tags: ["汇率", "换算", "货币"], order: 2427, fields: [{ id: "amount", label: "金额", type: "number", value: 100 }, { id: "rate", label: "汇率 (1 单位源币 = ? 目标币)", type: "number", value: 7.2 }], outputs: [{ id: "res", label: "换算结果" }], formulas: [{ id: "res", expr: "amount*rate" }] });
calcTool({ file: "fin-budget-503020.html", title: "50/30/20 预算", desc: "按收入拆分配需/想要/储蓄三部分。", category: "calc", tags: ["预算", "分配", "理财"], order: 2428, fields: [{ id: "income", label: "月收入 (元)", type: "number", value: 10000 }], outputs: [{ id: "needs", label: "必需 (50%)" }, { id: "wants", label: "想要 (30%)" }, { id: "save", label: "储蓄 (20%)" }], formulas: [{ id: "needs", expr: "income*0.5" }, { id: "wants", expr: "income*0.3" }, { id: "save", expr: "income*0.2" }] });
calcTool({ file: "health-one-rep-max.html", title: "单次最大重量", desc: "按完成次数与重量，用 Epley 与 Brzycki 公式估算 1RM。", category: "calc", tags: ["力量", "健身", "1RM"], order: 2429, fields: [{ id: "weight", label: "重量 (kg)", type: "number", value: 80 }, { id: "reps", label: "完成次数", type: "number", value: 5, min: 1 }], outputs: [{ id: "epley", label: "Epley 1RM" }, { id: "brzycki", label: "Brzycki 1RM" }], compute: function (a) { if (a.reps <= 1) return { epley: a.weight, brzycki: a.weight }; var epley = a.weight * (1 + a.reps / 30); var brzycki = a.weight / (1.0278 - 0.0278 * a.reps); return { epley: epley, brzycki: brzycki }; } });
calcTool({ file: "health-karvonen.html", title: "卡沃宁心率", desc: "按年龄、静息心率与强度计算目标心率区间（储备心率法）。", category: "calc", tags: ["心率", "健身", "强度"], order: 2430, fields: [{ id: "age", label: "年龄", type: "number", value: 30 }, { id: "rest", label: "静息心率", type: "number", value: 70 }, { id: "intensity", label: "强度 (%)", type: "number", value: 70 }], outputs: [{ id: "hr", label: "目标心率" }], compute: function (a) { var max = 220 - a.age; var target = ((max - a.rest) * a.intensity / 100) + a.rest; return { hr: target }; } });
calcTool({ file: "health-bsa.html", title: "体表面积 BSA", desc: "按 DuBois 公式由体重与身高估算体表面积。", category: "calc", tags: ["BSA", "体表面积", "医疗"], order: 2431, fields: [{ id: "weight", label: "体重 (kg)", type: "number", value: 65 }, { id: "height", label: "身高 (cm)", type: "number", value: 170 }], outputs: [{ id: "bsa", label: "BSA (m²)" }], formulas: [{ id: "bsa", expr: "0.007184*Math.pow(weight,0.425)*Math.pow(height,0.725)" }] });
calcTool({ file: "health-vo2max.html", title: "最大摄氧量估算", desc: "用最大心率与静息心率的关系粗略估算 VO₂max。", category: "calc", tags: ["VO2max", "有氧", "健身"], order: 2432, fields: [{ id: "maxhr", label: "最大心率", type: "number", value: 190 }, { id: "resthr", label: "静息心率", type: "number", value: 60 }], outputs: [{ id: "vo2", label: "VO₂max (ml/kg/min)" }], formulas: [{ id: "vo2", expr: "15.3*(maxhr/resthr)" }] });
calcTool({ file: "health-target-weight.html", title: "目标体重", desc: "按期望 BMI 与身高反推应达到的体重。", category: "calc", tags: ["目标体重", "BMI", "健康"], order: 2433, fields: [{ id: "bmi", label: "目标 BMI", type: "number", value: 22 }, { id: "height", label: "身高 (cm)", type: "number", value: 170 }], outputs: [{ id: "w", label: "目标体重 (kg)" }], formulas: [{ id: "w", expr: "bmi*(height/100)*(height/100)" }] });
calcTool({ file: "health-protein-per-kg.html", title: "每日蛋白质", desc: "按体重与每公斤目标摄入克数计算每日蛋白质需求。", category: "calc", tags: ["蛋白质", "营养", "健身"], order: 2434, fields: [{ id: "weight", label: "体重 (kg)", type: "number", value: 70 }, { id: "g", label: "每公斤克数 (g/kg)", type: "number", value: 1.6 }], outputs: [{ id: "protein", label: "每日蛋白质 (g)" }], formulas: [{ id: "protein", expr: "weight*g" }] });
calcTool({ file: "health-cholesterol-ratio.html", title: "胆固醇比", desc: "计算总胆固醇与高密度脂蛋白(HDL)之比，评估心血管风险。", category: "calc", tags: ["胆固醇", "HDL", "健康"], order: 2435, fields: [{ id: "total", label: "总胆固醇 (mg/dL)", type: "number", value: 200 }, { id: "hdl", label: "HDL (mg/dL)", type: "number", value: 50 }], outputs: [{ id: "ratio", label: "比值" }, { id: "risk", label: "风险" }], compute: function (a) { var r = a.total / a.hdl; var risk = r < 3.5 ? "理想" : r < 5 ? "适中" : "偏高"; return { ratio: r, risk: risk }; } });
calcTool({ file: "health-caffeine.html", title: "咖啡因代谢", desc: "按半衰期估算体内咖啡因随时间剩余的百分比。", category: "calc", tags: ["咖啡因", "代谢", "健康"], order: 2436, fields: [{ id: "hours", label: "经过小时", type: "number", value: 5 }, { id: "half", label: "半衰期 (小时)", type: "number", value: 5 }], outputs: [{ id: "remain", label: "剩余比例 (%)" }], formulas: [{ id: "remain", expr: "Math.pow(0.5, hours/half)*100" }] });
calcTool({ file: "fin-pe-ratio.html", title: "市盈率 PE", desc: "按股价与每股收益计算市盈率。", category: "calc", tags: ["市盈率", "股票", "理财"], order: 2437, fields: [{ id: "price", label: "股价 (元)", type: "number", value: 40 }, { id: "eps", label: "每股收益 (元)", type: "number", value: 2 }], outputs: [{ id: "pe", label: "市盈率" }], compute: function (a) { if (a.eps <= 0) return { pe: "EPS 需为正" }; return { pe: a.price / a.eps }; } });
calcTool({ file: "fin-market-cap.html", title: "市值", desc: "按股价与总股本计算公司市值。", category: "calc", tags: ["市值", "股票", "理财"], order: 2438, fields: [{ id: "price", label: "股价 (元)", type: "number", value: 100 }, { id: "shares", label: "总股本 (亿股)", type: "number", value: 10 }], outputs: [{ id: "cap", label: "市值 (亿元)" }], formulas: [{ id: "cap", expr: "price*shares" }] });
calcTool({ file: "fin-option-breakeven.html", title: "期权盈亏平衡", desc: "计算看涨/看跌期权的盈亏平衡价格。", category: "calc", tags: ["期权", "盈亏", "理财"], order: 2439, fields: [{ id: "strike", label: "行权价 (元)", type: "number", value: 100 }, { id: "premium", label: "权利金 (元)", type: "number", value: 5 }, { id: "type", label: "类型", type: "select", options: [{ value: "call", label: "看涨 Call" }, { value: "put", label: "看跌 Put" }] }], outputs: [{ id: "be", label: "盈亏平衡价" }], compute: function (a) { return { be: a.type === "call" ? a.strike + a.premium : a.strike - a.premium }; } });

// ---------- Batch 9c：单位换算 / 生活 / 图片 计算 ----------
unitConvTool({ file: "unit-shoe-size.html", title: "鞋码换算", desc: "在美码(男)、英码、欧码与脚长(厘米)之间近似换算。", tags: ["鞋码", "换算", "尺码"], order: 2440,
  units: [{ name: "美码 US" }, { name: "英码 UK" }, { name: "欧码 EU" }, { name: "脚长 cm" }],
  conv: function (v, a, b) {
    function toCm(u, x) { if (u === "美码 US" || u === "英码 UK") return (x + 1.5) * 2.54; if (u === "欧码 EU") return x * 0.667 - 1.0; return x; }
    function fromCm(u, c) { if (u === "美码 US" || u === "英码 UK") return c / 2.54 - 1.5; if (u === "欧码 EU") return (c + 1.0) / 0.667; return c; }
    return fromCm(b, toCm(a, v));
  } });
unitConvTool({ file: "unit-ring-size.html", title: "戒指尺寸换算", desc: "在美码、欧码(周长mm)、周长(mm)与直径(mm)之间近似换算。", tags: ["戒指", "尺码", "换算"], order: 2441,
  units: [{ name: "美码 US" }, { name: "欧码(周长mm)" }, { name: "周长 mm" }, { name: "直径 mm" }],
  conv: function (v, a, b) {
    function toD(u, x) { if (u === "美码 US") return x * 0.8128 + 11.63; if (u === "欧码(周长mm)") return x / Math.PI; if (u === "周长 mm") return x / Math.PI; return x; }
    function fromD(u, d) { if (u === "美码 US") return (d - 11.63) / 0.8128; if (u === "欧码(周长mm)") return d * Math.PI; if (u === "周长 mm") return d * Math.PI; return d; }
    return fromD(b, toD(a, v));
  } });
unitConvTool({ file: "unit-astronomy.html", title: "天文距离换算", desc: "在千米、天文单位、光年、光分、光秒与秒差距之间换算。", tags: ["天文", "距离", "换算"], order: 2442,
  units: [{ name: "千米 km", factor: 1 }, { name: "天文单位 AU", factor: 1.495978707e8 }, { name: "光秒", factor: 2.99792458e5 }, { name: "光分", factor: 1.798754748e7 }, { name: "光年 ly", factor: 9.4607304725808e12 }, { name: "秒差距 pc", factor: 3.085677581e13 }] });
unitConvTool({ file: "unit-oven-temp.html", title: "烤箱温度换算", desc: "在摄氏度、华氏度与英式燃气标记(Gas Mark)之间换算。", tags: ["烤箱", "温度", "换算"], order: 2443,
  units: [{ name: "°C" }, { name: "°F" }, { name: "燃气标记" }],
  conv: function (v, a, b) {
    function toC(u, x) { if (u === "°C") return x; if (u === "°F") return (x - 32) * 5 / 9; return x * 14 + 121; }
    function fromC(u, c) { if (u === "°C") return c; if (u === "°F") return c * 9 / 5 + 32; return (c - 121) / 14; }
    return fromC(b, toC(a, v));
  } });
unitConvTool({ file: "unit-wind-speed.html", title: "风速换算", desc: "在米/秒、千米/时、英里/时、节与蒲福风级之间换算。", tags: ["风速", "蒲福", "换算"], order: 2444,
  units: [{ name: "米/秒" }, { name: "千米/时" }, { name: "英里/时" }, { name: "节" }, { name: "蒲福级" }],
  conv: function (v, a, b) {
    var lo = [0, 0.3, 1.6, 3.4, 5.5, 8.0, 10.8, 13.9, 17.2, 20.8, 24.5, 28.5, 32.7];
    function toMS(u, x) { if (u === "米/秒") return x; if (u === "千米/时") return x / 3.6; if (u === "英里/时") return x * 0.44704; if (u === "节") return x * 0.514444; return lo[Math.max(0, Math.min(12, x))]; }
    function fromMS(u, s) { if (u === "米/秒") return s; if (u === "千米/时") return s * 3.6; if (u === "英里/时") return s / 0.44704; if (u === "节") return s / 0.514444; var bb = 0; for (var i = 1; i < lo.length; i++) { if (s >= lo[i]) bb = i; else break; } return bb; }
    return fromMS(b, toMS(a, v));
  } });
unitConvTool({ file: "unit-pace.html", title: "配速换算", desc: "在分钟/公里与分钟/英里之间换算（跑步配速）。", tags: ["配速", "跑步", "换算"], order: 2445,
  units: [{ name: "分/公里", factor: 1 }, { name: "分/英里", factor: 1.609344 }] });
unitConvTool({ file: "unit-cooking-metric.html", title: "烹饪容量换算", desc: "在毫升、杯、汤匙、茶匙与液量盎司之间换算。", tags: ["烹饪", "容量", "换算"], order: 2446,
  units: [{ name: "毫升 ml", factor: 1 }, { name: "杯 cup", factor: 240 }, { name: "汤匙 tbsp", factor: 15 }, { name: "茶匙 tsp", factor: 5 }, { name: "液盎司 fl oz", factor: 29.5735 }] });
calcTool({ file: "unit-screen-size.html", title: "屏幕尺寸换算", desc: "按对角线英寸与宽高比计算屏幕宽高（英寸与厘米）。", category: "calc", tags: ["屏幕", "尺寸", "换算"], order: 2447, fields: [{ id: "diag", label: "对角线 (英寸)", type: "number", value: 27 }, { id: "ar", label: "宽高比", type: "select", options: [{ value: "1.7778", label: "16:9" }, { value: "1.6", label: "16:10" }, { value: "1.3333", label: "4:3" }, { value: "2.3333", label: "21:9" }, { value: "1.25", label: "5:4" }] }], outputs: [{ id: "win", label: "宽 (英寸)" }, { id: "hin", label: "高 (英寸)" }, { id: "wcm", label: "宽 (cm)" }, { id: "hcm", label: "高 (cm)" }], compute: function (a) { var ar = parseFloat(a.ar); var den = Math.sqrt(ar * ar + 1); var w = a.diag * ar / den, h = a.diag / den; return { win: w, hin: h, wcm: w * 2.54, hcm: h * 2.54 }; } });
calcTool({ file: "unit-map-scale.html", title: "地图比例尺", desc: "按图上距离与比例尺(1:N)估算实际地面距离。", category: "calc", tags: ["地图", "比例尺", "距离"], order: 2448, fields: [{ id: "map", label: "图上距离 (mm)", type: "number", value: 50 }, { id: "scale", label: "比例尺分母 N (1:N)", type: "number", value: 25000 }], outputs: [{ id: "m", label: "实际距离 (m)" }, { id: "km", label: "实际距离 (km)" }], compute: function (a) { var real = a.map / 1000 * a.scale; return { m: real, km: real / 1000 }; } });
calcTool({ file: "util-transfer-time.html", title: "传输耗时", desc: "按文件大小与网速估算传输所需时间。", category: "util", tags: ["传输", "耗时", "网络"], order: 2449, fields: [{ id: "size", label: "文件大小 (MB)", type: "number", value: 500 }, { id: "speed", label: "网速 (Mbps)", type: "number", value: 100 }], outputs: [{ id: "sec", label: "秒" }, { id: "mmss", label: "分:秒" }], compute: function (a) { if (a.speed <= 0) return { sec: "—", mmss: "无效网速" }; var s = a.size * 8 / a.speed; var mm = Math.floor(s / 60), ss = Math.round(s % 60); return { sec: s, mmss: mm + ":" + (ss < 10 ? "0" : "") + ss }; } });
calcTool({ file: "util-electricity-cost.html", title: "电费估算", desc: "按电器功率、使用时长与电价估算用电量及费用。", category: "util", tags: ["电费", "功率", "生活"], order: 2450, fields: [{ id: "power", label: "功率 (W)", type: "number", value: 1000 }, { id: "hours", label: "每天小时", type: "number", value: 3 }, { id: "rate", label: "电价 (元/kWh)", type: "number", value: 0.6 }, { id: "days", label: "天数", type: "number", value: 30 }], outputs: [{ id: "kwh", label: "用电量 (kWh)" }, { id: "cost", label: "费用 (元)" }], compute: function (a) { var kwh = a.power / 1000 * a.hours * a.days; return { kwh: kwh, cost: kwh * a.rate }; } });
calcTool({ file: "util-carbon-footprint-car.html", title: "汽车碳排放", desc: "按行驶里程、油耗与每升二氧化碳排放估算碳排放量。", category: "util", tags: ["碳排放", "汽车", "环保"], order: 2451, fields: [{ id: "dist", label: "周里程 (km)", type: "number", value: 200 }, { id: "eff", label: "油耗 (L/100km)", type: "number", value: 7.5 }, { id: "co2", label: "每升 CO₂ (kg)", type: "number", value: 2.31 }], outputs: [{ id: "week", label: "每周 (kg)" }, { id: "year", label: "每年 (kg)" }], compute: function (a) { var w = a.dist / 100 * a.eff * a.co2; return { week: w, year: w * 52 }; } });
calcTool({ file: "util-trip-cost.html", title: "出行费用估算", desc: "按里程、油耗、油价及住宿餐饮估算一次出行的合计花费。", category: "util", tags: ["出行", "费用", "旅游"], order: 2452, fields: [{ id: "dist", label: "里程 (km)", type: "number", value: 600 }, { id: "eff", label: "油耗 (L/100km)", type: "number", value: 7.5 }, { id: "fuel", label: "油价 (元/L)", type: "number", value: 8 }, { id: "tolls", label: "过路费 (元)", type: "number", value: 100 }, { id: "nights", label: "住宿晚数", type: "number", value: 2 }, { id: "lodging", label: "每晚住宿 (元)", type: "number", value: 300 }, { id: "days", label: "天数", type: "number", value: 3 }, { id: "food", label: "每日餐饮 (元)", type: "number", value: 150 }], outputs: [{ id: "fuelc", label: "油费" }, { id: "lodg", label: "住宿" }, { id: "foodc", label: "餐饮" }, { id: "total", label: "合计" }], compute: function (a) { var f = a.dist / 100 * a.eff * a.fuel; var l = a.nights * a.lodging; var fo = a.days * a.food; return { fuelc: f, lodg: l, foodc: fo, total: f + a.tolls + l + fo }; } });
calcTool({ file: "util-subscription-cost.html", title: "订阅费用", desc: "按月费估算年度与多年订阅总支出。", category: "util", tags: ["订阅", "费用", "生活"], order: 2453, fields: [{ id: "monthly", label: "月费 (元)", type: "number", value: 25 }], outputs: [{ id: "year", label: "年费" }, { id: "five", label: "5 年" }], formulas: [{ id: "year", expr: "monthly*12" }, { id: "five", expr: "monthly*60" }] });
calcTool({ file: "util-coffee-cost.html", title: "咖啡花费", desc: "按每天杯数与单价估算每月与每年的咖啡支出。", category: "util", tags: ["咖啡", "花费", "生活"], order: 2454, fields: [{ id: "cups", label: "每天杯数", type: "number", value: 2 }, { id: "price", label: "单价 (元)", type: "number", value: 30 }], outputs: [{ id: "month", label: "每月" }, { id: "year", label: "每年" }], formulas: [{ id: "month", expr: "cups*price*30" }, { id: "year", expr: "cups*price*365" }] });
calcTool({ file: "util-smoking-cost.html", title: "吸烟花费", desc: "按每日支数与每条(20支)价格估算每月与每年花费。", category: "util", tags: ["吸烟", "花费", "生活"], order: 2455, fields: [{ id: "cig", label: "每天支数", type: "number", value: 10 }, { id: "pack", label: "每条价格 (元, 20支)", type: "number", value: 30 }], outputs: [{ id: "month", label: "每月" }, { id: "year", label: "每年" }], compute: function (a) { var per = a.cig / 20 * a.pack; return { month: per * 30, year: per * 365 }; } });
calcTool({ file: "util-pet-age.html", title: "宠物年龄换算", desc: "将猫狗年龄换算为相当于人类的岁数（近似）。", category: "util", tags: ["宠物", "年龄", "生活"], order: 2456, fields: [{ id: "type", label: "种类", type: "select", options: [{ value: "dog", label: "狗" }, { value: "cat", label: "猫" }] }, { id: "age", label: "宠物年龄 (岁)", type: "number", value: 3, min: 0.1 }], outputs: [{ id: "human", label: "相当于人类 (岁)" }], compute: function (a) { if (a.type === "dog") return { human: 16 * Math.log(Math.max(0.5, a.age)) + 31 }; var h = a.age <= 2 ? a.age * 12 : 24 + (a.age - 2) * 4; return { human: h }; } });
calcTool({ file: "util-gpa.html", title: "GPA 计算", desc: "按多门课程成绩与学分计算平均绩点 GPA。", category: "util", tags: ["GPA", "成绩", "教育"], order: 2457, fields: [{ id: "grades", label: "成绩（逗号分隔）", type: "text", value: "4, 3.5, 3, 4" }, { id: "credits", label: "学分（逗号分隔）", type: "text", value: "3, 4, 2, 3" }], outputs: [{ id: "gpa", label: "GPA" }], compute: function (a) { function p(s) { return s.split(",").map(function (x) { return parseFloat(x); }).filter(function (x) { return !isNaN(x); }); } var g = p(a.grades), c = p(a.credits); if (g.length !== c.length || g.length === 0) return { gpa: "成绩与学分数量需一致" }; var sg = 0, sc = 0; for (var i = 0; i < g.length; i++) { sg += g[i] * c[i]; sc += c[i]; } return { gpa: sc === 0 ? "学分和为 0" : sg / sc }; } });
calcTool({ file: "image-aspect-dimensions.html", title: "图片尺寸分析", desc: "由像素宽高计算宽高比与百万像素。", category: "image", tags: ["图片", "宽高比", "像素"], order: 2458, fields: [{ id: "w", label: "宽 (px)", type: "number", value: 1920 }, { id: "h", label: "高 (px)", type: "number", value: 1080 }], outputs: [{ id: "ratio", label: "宽高比" }, { id: "mp", label: "百万像素" }], compute: function (a) { return { ratio: a.w / a.h, mp: a.w * a.h / 1e6 }; } });
calcTool({ file: "image-dpi.html", title: "像素与打印尺寸", desc: "按像素尺寸与 DPI 计算打印输出的英寸与厘米尺寸。", category: "image", tags: ["DPI", "打印", "图片"], order: 2459, fields: [{ id: "px", label: "像素", type: "number", value: 300 }, { id: "dpi", label: "DPI", type: "number", value: 300 }], outputs: [{ id: "inch", label: "英寸" }, { id: "cm", label: "厘米" }], compute: function (a) { var inch = a.px / a.dpi; return { inch: inch, cm: inch * 2.54 }; } });
genTool({ file: "math-random-sample.html", title: "随机采样", desc: "从列表中随机抽取指定数量的元素（每行一个）。", category: "util", tags: ["随机", "采样", "列表"], order: 2460, fields: [{ id: "count", label: "抽取数量", type: "number", value: 3, min: 1, max: 500 }, { id: "list", label: "列表（每行一个）", type: "textarea", rows: 8, value: "苹果\n香蕉\n橙子\n葡萄\n西瓜\n芒果" }], gen: function (a) { var items = a.list.split("\n").map(function (s) { return s.trim(); }).filter(function (s) { return s; }); var n = Math.min(items.length, Math.max(1, a.count | 0)); var pool = items.slice(), out = []; for (var i = 0; i < n && pool.length; i++) { var j = Math.floor(Math.random() * pool.length); out.push(pool.splice(j, 1)[0]); } return out.join("\n"); } });
textTool({ file: "text-reverse-words.html", title: "词语倒序", desc: "将文本中的词语顺序整体反转（保留词内字母顺序）。", category: "text", tags: ["倒序", "词语", "文本"], order: 2461, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "输入句子" }], transform: function (args) { return args.text.split(/\s+/).filter(function (s) { return s.length; }).reverse().join(" "); } });
textTool({ file: "text-extract-quotes.html", title: "提取引号内容", desc: "提取文本中所有被双引号或单引号包裹的内容。", category: "text", tags: ["引号", "提取", "文本"], order: 2462, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "粘贴文本" }], transform: function (args) { var re = /"([^"]*)"|'([^']*)'/g, out = [], m; while ((m = re.exec(args.text))) { out.push(m[1] !== undefined ? m[1] : m[2]); } return out.length ? out.join("\n") : "（未找到）"; } });
textTool({ file: "text-word-count.html", title: "字数统计", desc: "统计字符数、不含空格字符数、词数、行数、句子数与段落数。", category: "text", tags: ["字数", "统计", "文本"], order: 2463, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "粘贴文本" }], transform: function (args) { var t = args.text; var chars = t.length; var noSpace = t.replace(/\s/g, "").length; var lines = t === "" ? 0 : t.split(/\n/).length; var words = (t.match(/[A-Za-z0-9一-鿿]+/g) || []).length; var sentences = (t.match(/[。！？.!?]+/g) || []).length; var paras = t.split(/\n\s*\n/).filter(function (s) { return s.trim(); }).length; return "字符数: " + chars + "\n不含空格: " + noSpace + "\n词数: " + words + "\n行数: " + lines + "\n句子数: " + sentences + "\n段落数: " + paras; } });
calcTool({ file: "unit-clothing-size.html", title: "服装尺码参考", desc: "按 S/M/L/XL/XXL 与性别给出近似胸围、腰围（厘米）。", category: "util", tags: ["服装", "尺码", "参考"], order: 2464, fields: [{ id: "gender", label: "性别", type: "select", options: [{ value: "男", label: "男装" }, { value: "女", label: "女装" }] }, { id: "size", label: "尺码", type: "select", options: [{ value: "S", label: "S" }, { value: "M", label: "M" }, { value: "L", label: "L" }, { value: "XL", label: "XL" }, { value: "XXL", label: "XXL" }] }], outputs: [{ id: "chest", label: "胸围 (cm)" }, { id: "waist", label: "腰围 (cm)" }], compute: function (a) { var t = { "男": { S: [90, 76], M: [98, 82], L: [106, 88], XL: [114, 94], XXL: [122, 102] }, "女": { S: [82, 64], M: [90, 70], L: [98, 78], XL: [106, 86], XXL: [114, 94] } }; var r = t[a.gender][a.size]; return { chest: r[0], waist: r[1] }; } });

// ---------- Batch 9d-1：开发者编码 / 校验 工具 ----------
textTool({ file: "text-base64-encode.html", title: "Base64 编码", desc: "将文本编码为 Base64（支持中文 UTF-8）。", category: "text", tags: ["base64", "编码", "开发"], order: 2465, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "输入要编码的文本" }], transform: function (args) { try { return btoa(unescape(encodeURIComponent(args.text))); } catch (e) { return "编码失败"; } } });
textTool({ file: "text-base64-decode.html", title: "Base64 解码", desc: "将 Base64 解码为文本（支持中文 UTF-8）。", category: "text", tags: ["base64", "解码", "开发"], order: 2466, fields: [{ id: "text", label: "Base64", type: "textarea", rows: 6, placeholder: "输入 Base64 字符串" }], transform: function (args) { try { return decodeURIComponent(escape(atob(args.text.trim()))); } catch (e) { return "解码失败：无效的 Base64"; } } });
textTool({ file: "text-url-encode.html", title: "URL 编码", desc: "对文本进行 URL 百分号编码（encodeURIComponent）。", category: "text", tags: ["url", "编码", "开发"], order: 2467, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "输入文本" }], transform: function (args) { try { return encodeURIComponent(args.text); } catch (e) { return "编码失败"; } } });
textTool({ file: "text-url-decode.html", title: "URL 解码", desc: "对百分号编码的文本进行 URL 解码。", category: "text", tags: ["url", "解码", "开发"], order: 2468, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "输入编码文本" }], transform: function (args) { try { return decodeURIComponent(args.text.trim()); } catch (e) { return "解码失败"; } } });
textTool({ file: "dev-number-base.html", title: "进制转换", desc: "在 2~36 进制之间转换整数（支持大整数）。", category: "dev", tags: ["进制", "转换", "开发"], order: 2469, fields: [{ id: "value", label: "数值", type: "text", placeholder: "例如 255" }, { id: "from", label: "源进制", type: "select", options: [{ value: "2", label: "2 进制" }, { value: "8", label: "8 进制" }, { value: "10", label: "10 进制" }, { value: "16", label: "16 进制" }, { value: "36", label: "36 进制" }] }, { id: "to", label: "目标进制", type: "select", options: [{ value: "2", label: "2 进制" }, { value: "8", label: "8 进制" }, { value: "10", label: "10 进制" }, { value: "16", label: "16 进制" }, { value: "36", label: "36 进制" }] }], transform: function (args) { try { var n = parseInt(args.value.trim(), parseInt(args.from, 10)); if (isNaN(n)) return "请输入有效整数"; return n.toString(parseInt(args.to, 10)); } catch (e) { return "转换失败"; } } });
textTool({ file: "dev-crc32.html", title: "CRC32 校验", desc: "计算文本的 CRC32 校验值（十六进制）。", category: "dev", tags: ["crc32", "校验", "开发"], order: 2470, fields: [{ id: "text", label: "文本", type: "textarea", rows: 6, placeholder: "输入文本" }], transform: function (args) { var table = (function () { var t = []; for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) { c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); } t[n] = c >>> 0; } return t; })(); var crc = 0xFFFFFFFF; for (var i = 0; i < args.text.length; i++) { crc = (crc >>> 8) ^ table[(crc ^ args.text.charCodeAt(i)) & 0xFF]; } crc = (crc ^ 0xFFFFFFFF) >>> 0; return ("00000000" + crc.toString(16)).slice(-8); } });
TOOLS.push({ file: "dev-hash.html", meta: { title: "SHA 哈希生成", desc: "使用浏览器原生 Web Crypto 计算 SHA-1/256/384/512 哈希值。", category: "dev", tags: ["哈希", "sha", "开发"], order: 2471 }, body: '<div class="field"><label>文本</label><textarea id="inp" rows="6" placeholder="输入要哈希的文本"></textarea></div><div class="field"><label>算法</label><select id="algo"><option value="SHA-1">SHA-1</option><option value="SHA-256" selected>SHA-256</option><option value="SHA-384">SHA-384</option><option value="SHA-512">SHA-512</option></select> <button id="go" class="btn">计算</button> <button id="cp" class="btn ghost">复制</button></div><div class="field"><label>结果</label><pre id="out"></pre></div>', script: '(function(){var $=PHT.$;var inp=$("#inp"),algo=$("#algo"),out=$("#out"),go=$("#go"),cp=$("#cp");function hx(b){return Array.prototype.map.call(new Uint8Array(b),function(x){return ("0"+x.toString(16)).slice(-2);}).join("");}function run(){if(!crypto||!crypto.subtle){out.textContent="当前环境不支持（请用 https 或 localhost 打开）";return;}var t=inp.value,a=algo.value;if(!t){out.textContent="";return;}crypto.subtle.digest(a,new TextEncoder().encode(t)).then(function(h){out.textContent=hx(h);}).catch(function(e){out.textContent="错误: "+e.message;});}go.addEventListener("click",run);inp.addEventListener("input",run);algo.addEventListener("change",run);cp.addEventListener("click",function(){PHT.copy(out.textContent).then(function(){PHT.flash(cp,"已复制");});});run();})();' });
TOOLS.push({ file: "dev-hmac.html", meta: { title: "HMAC 生成", desc: "使用 Web Crypto 计算基于 SHA 的 HMAC 消息认证码。", category: "dev", tags: ["hmac", "哈希", "开发"], order: 2472 }, body: '<div class="field"><label>消息</label><textarea id="msg" rows="5" placeholder="消息文本"></textarea></div><div class="field"><label>密钥</label><input id="key" type="text" placeholder="密钥"></div><div class="field"><label>算法</label><select id="algo"><option value="SHA-256" selected>SHA-256</option><option value="SHA-1">SHA-1</option><option value="SHA-384">SHA-384</option><option value="SHA-512">SHA-512</option></select> <button id="go" class="btn">计算</button> <button id="cp" class="btn ghost">复制</button></div><div class="field"><label>结果</label><pre id="out"></pre></div>', script: '(function(){var $=PHT.$;var msg=$("#msg"),key=$("#key"),algo=$("#algo"),out=$("#out"),go=$("#go"),cp=$("#cp");function hx(b){return Array.prototype.map.call(new Uint8Array(b),function(x){return ("0"+x.toString(16)).slice(-2);}).join("");}function run(){if(!crypto||!crypto.subtle){out.textContent="当前环境不支持（请用 https 或 localhost 打开）";return;}var m=msg.value,k=key.value,a=algo.value;if(!m||!k){out.textContent="";return;}crypto.subtle.importKey("raw",new TextEncoder().encode(k),{name:"HMAC",hash:a},false,["sign"]).then(function(ki){return crypto.subtle.sign("HMAC",ki,new TextEncoder().encode(m));}).then(function(s){out.textContent=hx(s);}).catch(function(e){out.textContent="错误: "+e.message;});}go.addEventListener("click",run);msg.addEventListener("input",run);key.addEventListener("input",run);algo.addEventListener("change",run);cp.addEventListener("click",function(){PHT.copy(out.textContent).then(function(){PHT.flash(cp,"已复制");});});run();})();' });
TOOLS.push({ file: "dev-jwt-decode.html", meta: { title: "JWT 解码", desc: "解析并解码 JWT（JSON Web Token）的头部、载荷与签名。", category: "dev", tags: ["jwt", "token", "开发"], order: 2473 }, body: '<div class="field"><label>JWT</label><textarea id="inp" rows="6" placeholder="粘贴 JWT 字符串"></textarea></div><div class="field"><label>结果</label><pre id="out"></pre></div>', script: '(function(){var $=PHT.$;var inp=$("#inp"),out=$("#out");function b64url(s){s=s.replace(/-/g,"+").replace(/_/g,"/");while(s.length%4)s+="=";try{return decodeURIComponent(escape(atob(s)));}catch(e){try{return atob(s);}catch(e2){return "(无法解码)";}}}function run(){var v=inp.value.trim();if(!v){out.textContent="";return;}var ps=v.split(".");if(ps.length!==3){out.textContent="JWT 应由 3 段以 . 分隔组成，当前为 "+ps.length+" 段";return;}var h,p;try{h=JSON.parse(b64url(ps[0]));}catch(e){h="(头部解析失败)";}try{p=JSON.parse(b64url(ps[1]));}catch(e){p="(载荷解析失败)";}out.textContent="头部 Header:\n"+JSON.stringify(h,null,2)+"\n\n载荷 Payload:\n"+JSON.stringify(p,null,2)+"\n\n签名 Signature:\n"+ps[2];}inp.addEventListener("input",run);run();})();' });
TOOLS.push({ file: "dev-jwt-validate.html", meta: { title: "JWT 校验", desc: "检查 JWT 结构是否合法，并校验收发时间、过期时间等声明。", category: "dev", tags: ["jwt", "校验", "token"], order: 2474 }, body: '<div class="field"><label>JWT</label><textarea id="inp" rows="6" placeholder="粘贴 JWT 字符串"></textarea></div><div class="field"><label>结果</label><pre id="out"></pre></div>', script: '(function(){var $=PHT.$;var inp=$("#inp"),out=$("#out");function b64url(s){s=s.replace(/-/g,"+").replace(/_/g,"/");while(s.length%4)s+="=";try{return decodeURIComponent(escape(atob(s)));}catch(e){return null;}}function run(){var v=inp.value.trim();if(!v){out.textContent="";return;}var ps=v.split("."),msgs=[];if(ps.length!==3){out.textContent="结构无效：应为 3 段";return;}var h,p;try{h=JSON.parse(b64url(ps[0]));msgs.push("头部可解析");}catch(e){msgs.push("头部解析失败");}try{p=JSON.parse(b64url(ps[1]));msgs.push("载荷可解析");}catch(e){msgs.push("载荷解析失败");}if(h&&h.alg)msgs.push("算法 alg: "+h.alg);if(p){var now=Math.floor(Date.now()/1000);if(p.exp!==undefined)msgs.push((now<p.exp?"未过期":"已过期")+" | 过期时间 exp: "+new Date(p.exp*1000).toISOString());if(p.nbf!==undefined)msgs.push((now>=p.nbf?"已生效":"未生效")+" | 生效时间 nbf: "+new Date(p.nbf*1000).toISOString());if(p.iat!==undefined)msgs.push("签发时间 iat: "+new Date(p.iat*1000).toISOString());}out.textContent=msgs.join("\n");}inp.addEventListener("input",run);run();})();' });
TOOLS.push({ file: "dev-validate-ipv6.html", meta: { title: "IPv6 校验", desc: "校验 IPv6 地址格式是否合法（含 :: 压缩规则）。", category: "dev", tags: ["ipv6", "校验", "网络"], order: 2475 }, body: '<div class="field"><label>IPv6 地址</label><input id="inp" type="text" placeholder="例如 2001:db8::1"></div><div class="field"><label>结果</label><pre id="out"></pre></div>', script: '(function(){var $=PHT.$;var inp=$("#inp"),out=$("#out");function valid(s){s=s.trim();if(!s)return false;var dbl=s.indexOf("::");if(dbl>=0&&s.indexOf("::",dbl+1)>=0)return false;var parts=(dbl<0?s.split(":"):s.replace("::",":").split(":"));if(parts.length>8)return false;for(var i=0;i<parts.length;i++){if(parts[i]==="")continue;if(!/^[0-9a-fA-F]{1,4}$/.test(parts[i]))return false;}return true;}function run(){var v=inp.value.trim();out.textContent=v?((valid(v)?"合法 IPv6 地址":"非法 IPv6 地址")):"";}inp.addEventListener("input",run);run();})();' });
TOOLS.push({ file: "dev-validate-mac.html", meta: { title: "MAC 地址校验", desc: "校验 MAC 地址格式（支持 : - . 分隔）。", category: "dev", tags: ["mac", "校验", "网络"], order: 2476 }, body: '<div class="field"><label>MAC 地址</label><input id="inp" type="text" placeholder="例如 00:1B:44:11:3A:B7"></div><div class="field"><label>结果</label><pre id="out"></pre></div>', script: '(function(){var $=PHT.$;var inp=$("#inp"),out=$("#out");function valid(s){s=s.trim();return /^([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}$/.test(s)||/^([0-9A-Fa-f]{4}\\.){2}[0-9A-Fa-f]{4}$/.test(s);}function run(){var v=inp.value.trim();out.textContent=v?((valid(v)?"合法 MAC 地址":"非法 MAC 地址")):"";}inp.addEventListener("input",run);run();})();' });
TOOLS.push({ file: "dev-validate-date.html", meta: { title: "日期格式校验", desc: "校验常见日期格式是否合法（含闰年判断）。", category: "dev", tags: ["日期", "校验", "格式"], order: 2477 }, body: '<div class="field"><label>日期字符串</label><input id="inp" type="text" placeholder="例如 2026-10-31"></div><div class="field"><label>结果</label><pre id="out"></pre></div>', script: '(function(){var $=PHT.$;var inp=$("#inp"),out=$("#out");function chk(y,mo,d){if(mo<1||mo>12)return false;if(d<1||d>31)return false;var dim=[31,28,31,30,31,30,31,31,30,31,30,31];if((y%4===0&&y%100!==0)||y%400===0)dim[1]=29;return d<=dim[mo-1];}function valid(s){s=s.trim();var m;if((m=s.match(/^(\\d{4})[-/](\\d{1,2})[-/](\\d{1,2})$/)))return chk(+m[1],+m[2],+m[3]);if((m=s.match(/^(\\d{1,2})[-/](\\d{1,2})[-/](\\d{4})$/)))return chk(+m[3],+m[1],+m[2]);return false;}function run(){var v=inp.value.trim();out.textContent=v?((valid(v)?"合法日期":"非法日期")):"";}inp.addEventListener("input",run);run();})();' });
TOOLS.push({ file: "dev-validate-xml.html", meta: { title: "XML 合法性校验", desc: "检查 XML 文本是否格式良好（well-formed）。", category: "dev", tags: ["xml", "校验", "格式"], order: 2478 }, body: '<div class="field"><label>XML 文本</label><textarea id="inp" rows="6" placeholder="粘贴 XML"></textarea></div><div class="field"><label>结果</label><pre id="out"></pre></div>', script: '(function(){var $=PHT.$;var inp=$("#inp"),out=$("#out");function run(){var v=inp.value.trim();if(!v){out.textContent="";return;}try{var doc=new DOMParser().parseFromString(v,"application/xml");if(doc.getElementsByTagName("parsererror").length>0){out.textContent="非法 XML："+doc.getElementsByTagName("parsererror")[0].textContent;}else{out.textContent="格式良好的 XML";}}catch(e){out.textContent="无法解析："+e.message;}}inp.addEventListener("input",run);run();})();' });
TOOLS.push({ file: "dev-validate-base64.html", meta: { title: "Base64 校验", desc: "校验字符串是否为合法 Base64 编码。", category: "dev", tags: ["base64", "校验", "开发"], order: 2479 }, body: '<div class="field"><label>字符串</label><textarea id="inp" rows="5" placeholder="粘贴 Base64"></textarea></div><div class="field"><label>结果</label><pre id="out"></pre></div>', script: '(function(){var $=PHT.$;var inp=$("#inp"),out=$("#out");function run(){var v=inp.value.trim();if(!v){out.textContent="";return;}if(!/^[A-Za-z0-9+/]*={0,2}$/.test(v)){out.textContent="非法 Base64：含非法字符";return;}if(v.length%4!==0){out.textContent="非法 Base64：长度应为 4 的倍数";return;}if(v.replace(/=/g,"").length===0){out.textContent="非法 Base64：内容为空";return;}try{atob(v);out.textContent="合法 Base64";}catch(e){out.textContent="非法 Base64：解码失败";}}inp.addEventListener("input",run);run();})();' });
TOOLS.push({ file: "dev-validate-hex.html", meta: { title: "十六进制校验", desc: "校验字符串是否为合法十六进制（可选 0x 或 # 前缀）。", category: "dev", tags: ["hex", "校验", "开发"], order: 2480 }, body: '<div class="field"><label>字符串</label><input id="inp" type="text" placeholder="例如 1a2b 或 0xFF"></div><div class="field"><label>结果</label><pre id="out"></pre></div>', script: '(function(){var $=PHT.$;var inp=$("#inp"),out=$("#out");function run(){var v=inp.value.trim();if(!v){out.textContent="";return;}if(/^(0x|#)?[0-9a-fA-F]+$/.test(v)&&/^[0-9a-fA-F]/.test(v.replace(/^(0x|#)/,""))){out.textContent="合法十六进制";}else{out.textContent="非法十六进制";}}inp.addEventListener("input",run);run();})();' });
TOOLS.push({ file: "dev-validate-domain.html", meta: { title: "域名校验", desc: "校验域名格式是否合法（含标签与顶级域规则）。", category: "dev", tags: ["域名", "校验", "网络"], order: 2481 }, body: '<div class="field"><label>域名</label><input id="inp" type="text" placeholder="例如 example.com"></div><div class="field"><label>结果</label><pre id="out"></pre></div>', script: '(function(){var $=PHT.$;var inp=$("#inp"),out=$("#out");function valid(s){return /^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\\.)+[a-z]{2,}$/i.test(s.trim());}function run(){var v=inp.value.trim();out.textContent=v?((valid(v)?"合法域名":"非法域名")):"";}inp.addEventListener("input",run);run();})();' });

// ---------- Batch 9d-2：开发者进阶 / 设计 工具 ----------
TOOLS.push({ file: "dev-regex-tester.html", meta: { title: "正则表达式测试", desc: "实时测试正则，列出所有匹配及捕获分组。", category: "dev", tags: ["正则", "regex", "开发"], order: 2482 }, body: '<div class="field"><label>正则模式</label><input id="pat" type="text" placeholder="例如 (\\d{4})-(\\d{2})"></div><div class="field"><label>标志</label><input id="fl" type="text" placeholder="g i m s（可空）"></div><div class="field"><label>测试文本</label><textarea id="txt" rows="6" placeholder="在此粘贴文本"></textarea></div><div class="field"><label>匹配结果</label><pre id="out"></pre></div>', script: '(function(){var $=PHT.$;var pat=$("#pat"),fl=$("#fl"),txt=$("#txt"),out=$("#out");function run(){var p=pat.value,f=fl.value;if(!p){out.textContent="";return;}var re;try{re=new RegExp(p,f);}catch(e){out.textContent="正则错误: "+e.message;return;}var s=txt.value,res=[],m,count=0;if(f.indexOf("g")<0){var mm=re.exec(s);if(mm){res.push("匹配: "+mm[0]);if(mm.length>1)res.push("分组: "+JSON.stringify(mm.slice(1)));count=1;}else{res.push("无匹配");}}else{while((m=re.exec(s))){count++;res.push("#"+count+": "+m[0]+(m.length>1?("  分组: "+JSON.stringify(m.slice(1))):""));if(m.index===re.lastIndex)re.lastIndex++;}}out.textContent=(count?("共 "+count+" 处匹配\n"):"")+res.join("\n");}pat.addEventListener("input",run);fl.addEventListener("input",run);txt.addEventListener("input",run);run();})();' });
TOOLS.push({ file: "dev-csv-to-json.html", meta: { title: "CSV 转 JSON", desc: "将 CSV 文本（支持引号与转义）转换为 JSON 数组。", category: "dev", tags: ["csv", "json", "转换"], order: 2483 }, body: '<div class="field"><label>CSV 文本</label><textarea id="inp" rows="7" placeholder="name,age\nAlice,30\nBob,25"></textarea></div><div class="field"><button id="go" class="btn">转换</button> <button id="cp" class="btn ghost">复制</button></div><div class="field"><label>JSON 结果</label><pre id="out"></pre></div>', script: '(function(){var $=PHT.$;var inp=$("#inp"),out=$("#out"),go=$("#go"),cp=$("#cp");function parseCSV(text){var rows=[],row=[],field="",i=0,inQ=false;while(i<text.length){var c=text[i];if(inQ){if(c===\'"\'){if(text[i+1]===\'"\'){field+=\'"\';i+=2;continue;}inQ=false;i++;continue;}field+=c;i++;}else{if(c===\'"\'){inQ=true;i++;continue;}if(c===\',\'){row.push(field);field="";i++;continue;}if(c===\'\n\'){row.push(field);rows.push(row);row=[];field="";i++;continue;}if(c===\'\r\'){i++;continue;}field+=c;i++;}}if(field.length>0||row.length>0){row.push(field);rows.push(row);}return rows;}function run(){var text=inp.value;if(!text.trim()){out.textContent="";return;}var rows=parseCSV(text);if(rows.length<1){out.textContent="空";return;}var head=rows[0],res=[];for(var r=1;r<rows.length;r++){if(rows[r].length===1&&rows[r][0]==="")continue;var o={};for(var c=0;c<head.length;c++){var val=rows[r][c]!==undefined?rows[r][c]:"";if(val!==""&&!isNaN(val)&&/^-?\\d+(\\.\\d+)?$/.test(val))val=parseFloat(val);o[head[c]]=val;}res.push(o);}out.textContent=JSON.stringify(res,null,2);}go.addEventListener("click",run);inp.addEventListener("input",run);cp.addEventListener("click",function(){PHT.copy(out.textContent).then(function(){PHT.flash(cp,"已复制");});});run();})();' });
TOOLS.push({ file: "dev-json-to-csv.html", meta: { title: "JSON 转 CSV", desc: "将对象数组 JSON 转换为 CSV 文本。", category: "dev", tags: ["json", "csv", "转换"], order: 2484 }, body: '<div class="field"><label>JSON 文本（对象数组）</label><textarea id="inp" rows="7" placeholder=\'[{"name":"Alice","age":30}]\'></textarea></div><div class="field"><button id="go" class="btn">转换</button> <button id="cp" class="btn ghost">复制</button></div><div class="field"><label>CSV 结果</label><pre id="out"></pre></div>', script: '(function(){var $=PHT.$;var inp=$("#inp"),out=$("#out"),go=$("#go"),cp=$("#cp");function run(){var txt=inp.value.trim();if(!txt){out.textContent="";return;}var json;try{json=JSON.parse(txt);}catch(e){out.textContent="JSON 解析失败: "+e.message;return;}if(!Array.isArray(json)){out.textContent="需为对象数组";return;}var keys={};json.forEach(function(o){if(o&&typeof o==="object")Object.keys(o).forEach(function(k){keys[k]=1;});});var ks=Object.keys(keys);var lines=[ks.join(",")];json.forEach(function(o){lines.push(ks.map(function(k){var v=o?o[k]:"";if(v===undefined||v===null)v="";v=String(v);if(/[",\\n\\r]/.test(v))v=\'"\'+v.replace(/"/g,\'""\')+\'"\';return v;}).join(","));});out.textContent=lines.join("\\n");}go.addEventListener("click",run);inp.addEventListener("input",run);cp.addEventListener("click",function(){PHT.copy(out.textContent).then(function(){PHT.flash(cp,"已复制");});});run();})();' });
TOOLS.push({ file: "text-diff.html", meta: { title: "文本对比", desc: "对两段文本做逐行对比，标记新增与删除的行。", category: "text", tags: ["对比", "diff", "文本"], order: 2485 }, body: '<div class="field"><label>原文本（旧）</label><textarea id="a" rows="7" placeholder="旧文本，每行一行"></textarea></div><div class="field"><label>新文本</label><textarea id="b" rows="7" placeholder="新文本，每行一行"></textarea></div><div class="field"><button id="go" class="btn">对比</button></div><div class="field"><label>差异（−删除 / +新增 / 空格相同）</label><pre id="out"></pre></div>', script: '(function(){var $=PHT.$;var a=$("#a"),b=$("#b"),out=$("#out"),go=$("#go");function diff(x,y){var n=x.length,m=y.length;var dp=[];for(var i=0;i<=n;i++){dp[i]=[];for(var j=0;j<=m;j++)dp[i][j]=0;}for(i=n-1;i>=0;i--)for(j=m-1;j>=0;j--){dp[i][j]=x[i]===y[j]?dp[i+1][j+1]+1:Math.max(dp[i+1][j],dp[i][j+1]);}var i=0,j=0,res=[];while(i<n&&j<m){if(x[i]===y[j]){res.push("  "+x[i]);i++;j++;}else if(dp[i+1][j]>=dp[i][j+1]){res.push("- "+x[i]);i++;}else{res.push("+ "+y[j]);j++;}}while(i<n){res.push("- "+x[i]);i++;}while(j<m){res.push("+ "+y[j]);j++;}return res.join("\\n");}function run(){var x=a.value.split("\\n"),y=b.value.split("\\n");out.textContent=diff(x,y);}go.addEventListener("click",run);a.addEventListener("input",run);b.addEventListener("input",run);run();})();' });
TOOLS.push({ file: "dev-color-name.html", meta: { title: "颜色名称查询", desc: "按 CSS 颜色名称查十六进制与 RGB，或反查已知色值名称。", category: "dev", tags: ["颜色", "名称", "css"], order: 2486 }, body: '<div class="field"><label>颜色名称或十六进制</label><input id="inp" type="text" placeholder="例如 red 或 #FF0000"></div><div class="field"><label>结果</label><pre id="out"></pre></div>', script: '(function(){var $=PHT.$;var inp=$("#inp"),out=$("#out");var NAMES={red:"#FF0000",green:"#008000",blue:"#0000FF",white:"#FFFFFF",black:"#000000",yellow:"#FFFF00",orange:"#FFA500",pink:"#FFC0CB",purple:"#800080",gray:"#808080",grey:"#808080",cyan:"#00FFFF",magenta:"#FF00FF",lime:"#00FF00",teal:"#008080",navy:"#000080",aqua:"#00FFFF",olive:"#808000",maroon:"#800000",silver:"#C0C0C0",gold:"#FFD700",coral:"#FF7F50",salmon:"#FA8072",khaki:"#F0E68C",indigo:"#4B0082",violet:"#EE82EE",tomato:"#FF6347",crimson:"#DC143C",chocolate:"#D2691E",turquoise:"#40E0D0",lavender:"#E6E6FA",skyblue:"#87CEEB",royalblue:"#4169E1",steelblue:"#4682B4",forestgreen:"#228B22",seagreen:"#2E8B57",hotpink:"#FF69B4",deeppink:"#FF1493",slateblue:"#6A5ACD",darkred:"#8B0000",darkgreen:"#006400",darkblue:"#00008B",lightgray:"#D3D3D3",lightblue:"#ADD8E6",lightgreen:"#90EE90",lightcoral:"#F08080",lightpink:"#FFB6C1",lightyellow:"#FFFFE0",darkgray:"#A9A9A9",dimgray:"#696969",firebrick:"#B22222",indianred:"#CD5C5C",mediumblue:"#0000CD",midnightblue:"#191970",powderblue:"#B0E0E6",springgreen:"#00FF7F",lawngreen:"#7CFC00",orchid:"#DA70D6",plum:"#DDA0DD",tan:"#D2B48C",brown:"#A52A2A",beige:"#F5F5DC",ivory:"#FFFFF0",snow:"#FFFAFA",azure:"#F0FFFF",linen:"#FAF0E6",mintcream:"#F5FFFA"};var HEX2={};for(var k in NAMES)HEX2[NAMES[k].toUpperCase()]=k;function rgb(h){h=h.replace("#","");return "rgb("+parseInt(h.substr(0,2),16)+", "+parseInt(h.substr(2,2),16)+", "+parseInt(h.substr(4,2),16)+")";}function run(){var v=inp.value.trim().toLowerCase();if(!v){out.textContent="";return;}if(NAMES[v]){var hex=NAMES[v];out.textContent="名称: "+v+"\\nHEX: "+hex+"\\nRGB: "+rgb(hex);return;}var m=v.match(/^#?([0-9a-f]{6})$/i);if(m){var up="#"+m[1].toUpperCase();if(HEX2[up])out.textContent="HEX: "+up+"\\n名称: "+HEX2[up]+"\\nRGB: "+rgb(up);else out.textContent="HEX: "+up+"\\n未找到对应名称\\nRGB: "+rgb(up);return;}out.textContent="未知颜色名称或格式";}inp.addEventListener("input",run);run();})();' });
TOOLS.push({ file: "dev-keycode.html", meta: { title: "按键码查询", desc: "按下任意键，显示其 key、code 与 keyCode。", category: "dev", tags: ["keycode", "按键", "开发"], order: 2487 }, body: '<div class="field"><label>在此区域按下按键</label><input id="k" type="text" placeholder="点击后按下任意键" style="font-size:18px;padding:12px;"></div><div class="field"><label>结果</label><pre id="out"></pre></div>', script: '(function(){var $=PHT.$;var k=$("#k"),out=$("#out");k.addEventListener("keydown",function(e){e.preventDefault();out.textContent="key: "+JSON.stringify(e.key)+"\\ncode: "+e.code+"\\nkeyCode: "+e.keyCode+"\\nwhich: "+e.which;});k.addEventListener("focus",function(){out.textContent="等待按键…";});})();' });
TOOLS.push({ file: "design-easing.html", meta: { title: "缓动函数生成", desc: "可视化 cubic-bezier 缓动曲线并生成对应 CSS。", category: "design", tags: ["缓动", "bezier", "动画"], order: 2488 }, body: '<div class="field"><label>x1</label><input id="x1" type="number" value="0.25" step="0.05"><label>y1</label><input id="y1" type="number" value="0.1" step="0.05"><label>x2</label><input id="x2" type="number" value="0.25" step="0.05"><label>y2</label><input id="y2" type="number" value="1" step="0.05"></div><div class="field"><div id="box" style="position:relative;height:60px;background:#f0f3f8;border-radius:8px;"><span id="ball" style="position:absolute;top:10px;left:10px;width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#FF6E9C,#E0114B);"></span></div></div><div class="field"><button id="go" class="btn">预览动画</button> <button id="cp" class="btn ghost">复制 CSS</button></div><div class="field"><label>CSS</label><pre id="out"></pre></div>', script: '(function(){var $=PHT.$;var x1=$("#x1"),y1=$("#y1"),x2=$("#x2"),y2=$("#y2"),ball=$("#ball"),out=$("#out"),go=$("#go"),cp=$("#cp");function css(){return "cubic-bezier("+x1.value+", "+y1.value+", "+x2.value+", "+y2.value+")";}function preview(){var c=css();ball.style.transition="none";ball.style.left="10px";requestAnimationFrame(function(){requestAnimationFrame(function(){ball.style.transition="left 1s "+c;ball.style.left="calc(100% - 50px)";});});}function run(){out.textContent="transition: all 0.6s "+css()+";";}go.addEventListener("click",function(){preview();});[x1,y1,x2,y2].forEach(function(el){el.addEventListener("input",run);});cp.addEventListener("click",function(){PHT.copy(out.textContent).then(function(){PHT.flash(cp,"已复制");});});run();})();' });
TOOLS.push({ file: "design-clamp.html", meta: { title: "流式字号 clamp", desc: "按最小/最大字号与视口范围生成 fluid 的 CSS clamp()。", category: "design", tags: ["clamp", "流式", "字号"], order: 2489 }, body: '<div class="field"><label>最小字号 (px)</label><input id="minf" type="number" value="16"><label>最大字号 (px)</label><input id="maxf" type="number" value="32"><label>最小视口 (px)</label><input id="minv" type="number" value="320"><label>最大视口 (px)</label><input id="maxv" type="number" value="1200"></div><div class="field"><button id="go" class="btn">生成</button> <button id="cp" class="btn ghost">复制</button></div><div class="field"><label>CSS</label><pre id="out"></pre></div>', script: '(function(){var $=PHT.$;var minf=$("#minf"),maxf=$("#maxf"),minv=$("#minv"),maxv=$("#maxv"),out=$("#out"),go=$("#go"),cp=$("#cp");function run(){var mn=parseFloat(minf.value),mx=parseFloat(maxf.value),vw1=parseFloat(minv.value),vw2=parseFloat(maxv.value);if(vw2<=vw1){out.textContent="最大视口需大于最小视口";return;}var slope=(mx-mn)/(vw2-vw1);var yint=mn-slope*vw1;out.textContent="font-size: clamp("+mn+"px, "+yint.toFixed(4)+"px + "+(slope*100).toFixed(4)+"vw, "+mx+"px);";}go.addEventListener("click",run);[minf,maxf,minv,maxv].forEach(function(el){el.addEventListener("input",run);});cp.addEventListener("click",function(){PHT.copy(out.textContent).then(function(){PHT.flash(cp,"已复制");});});run();})();' });
TOOLS.push({ file: "design-specificity.html", meta: { title: "CSS 优先级计算", desc: "输入 CSS 选择器，估算其特异性 (a,b,c)。", category: "design", tags: ["优先级", "specificity", "css"], order: 2490 }, body: '<div class="field"><label>CSS 选择器</label><input id="inp" type="text" placeholder="例如 #nav ul li.active a:hover"></div><div class="field"><label>结果</label><pre id="out"></pre></div>', script: '(function(){var $=PHT.$;var inp=$("#inp"),out=$("#out");function run(){var sel=inp.value.trim();if(!sel){out.textContent="";return;}var a=0,b=0,c=0;sel.replace(/#[A-Za-z0-9_:-]+/g,function(){a++;return "";});sel.replace(/\\.[A-Za-z0-9_-]+/g,function(){b++;return "";});sel.replace(/\\[[^\\]]*\\]/g,function(){b++;return "";});sel.replace(/::?[a-zA-Z-]+\\(/g,function(){b++;return "";});sel.replace(/(^|[^:]):[a-zA-Z-]+/g,function(){b++;return "";});sel.replace(/::[a-zA-Z-]+/g,function(){c++;return "";});sel.replace(/(^|[\\s>+~])([a-zA-Z][a-zA-Z0-9]*)/g,function(){c++;return "";});out.textContent="特异性 (ID, 类/属性/伪类, 元素/伪元素): ("+a+", "+b+", "+c+")";}inp.addEventListener("input",run);run();})();' });
TOOLS.push({ file: "dev-cron-builder.html", meta: { title: "Cron 表达式生成", desc: "通过下拉选择分钟/小时/日/月/星期，生成 Cron 表达式。", category: "dev", tags: ["cron", "定时", "开发"], order: 2491 }, body: '<div class="field"><label>分钟</label><select id="m"></select><label>小时</label><select id="h"></select><label>日</label><select id="d"></select><label>月</label><select id="mo"></select><label>星期</label><select id="w"></select></div><div class="field"><button id="go" class="btn">生成</button> <button id="cp" class="btn ghost">复制</button></div><div class="field"><label>Cron 表达式</label><pre id="out"></pre></div>', script: '(function(){var $=PHT.$;function fill(sel,from,to,star){var s=$(sel);for(var i=from;i<=to;i++){var o=document.createElement("option");o.value=String(i);o.textContent=String(i);s.appendChild(o);}if(star){var o0=document.createElement("option");o0.value="*";o0.textContent="*";s.insertBefore(o0,s.firstChild);}}fill("#m",0,59,true);fill("#h",0,23,true);fill("#d",1,31,true);fill("#mo",1,12,true);fill("#w",0,7,true);var out=$("#out"),cp=$("#cp");function run(){out.textContent=$("#m").value+" "+$("#h").value+" "+$("#d").value+" "+$("#mo").value+" "+$("#w").value;}["#m","#h","#d","#mo","#w"].forEach(function(s){$(s).addEventListener("change",run);});cp.addEventListener("click",function(){PHT.copy(out.textContent).then(function(){PHT.flash(cp,"已复制");});});run();})();' });

// ---------- Batch 9e：统计 / 生活 工具 ----------
calcTool({ file: "stat-normal-dist.html", title: "正态分布概率", desc: "给定 z 分数，用误差函数近似求其对应百分位（左侧面积）。", category: "calc", tags: ["正态分布", "统计", "z分数"], order: 2492, fields: [{ id: "z", label: "z 分数", type: "number", value: 1.96 }], outputs: [{ id: "p", label: "百分位 (%)" }], compute: function (a) { function erf(x) { var s = x < 0 ? -1 : 1; x = Math.abs(x); var t = 1 / (1 + 0.3275911 * x); var y = 1 - (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t) * Math.exp(-x * x); return s * y; } var p = 0.5 * (1 + erf(a.z / Math.sqrt(2))); return { p: p * 100 }; } });
calcTool({ file: "stat-binomial.html", title: "二项分布概率", desc: "计算 n 次试验中恰好 k 次与至多 k 次成功的概率。", category: "calc", tags: ["二项分布", "概率", "统计"], order: 2493, fields: [{ id: "n", label: "试验次数 n", type: "number", value: 10 }, { id: "p", label: "成功概率 p (0-1)", type: "number", value: 0.5 }, { id: "k", label: "成功次数 k", type: "number", value: 5 }], outputs: [{ id: "eq", label: "恰好 k 次" }, { id: "le", label: "至多 k 次" }], compute: function (a) { function C(n, k) { k = Math.min(k, n - k); var r = 1; for (var i = 0; i < k; i++) r = r * (n - i) / (i + 1); return r; } var peq = C(a.n, a.k) * Math.pow(a.p, a.k) * Math.pow(1 - a.p, a.n - a.k); var ple = 0; for (var i = 0; i <= a.k; i++) ple += C(a.n, i) * Math.pow(a.p, i) * Math.pow(1 - a.p, a.n - i); return { eq: peq, le: ple }; } });
calcTool({ file: "stat-poisson.html", title: "泊松分布概率", desc: "计算平均发生率 λ 下恰好 k 次与至多 k 次的概率。", category: "calc", tags: ["泊松", "概率", "统计"], order: 2494, fields: [{ id: "lam", label: "平均发生率 λ", type: "number", value: 3 }, { id: "k", label: "发生次数 k", type: "number", value: 2 }], outputs: [{ id: "eq", label: "恰好 k 次" }, { id: "le", label: "至多 k 次" }], compute: function (a) { function fact(n) { var r = 1; for (var i = 2; i <= n; i++) r *= i; return r; } var peq = Math.pow(a.lam, a.k) * Math.exp(-a.lam) / fact(a.k); var ple = 0; for (var i = 0; i <= a.k; i++) ple += Math.pow(a.lam, i) * Math.exp(-a.lam) / fact(i); return { eq: peq, le: ple }; } });
calcTool({ file: "stat-confidence-interval.html", title: "置信区间", desc: "按样本均值、标准差、容量与 z 值估计均值的置信区间。", category: "calc", tags: ["置信区间", "统计", "推断"], order: 2495, fields: [{ id: "mean", label: "样本均值", type: "number", value: 100 }, { id: "sd", label: "样本标准差", type: "number", value: 15 }, { id: "n", label: "样本容量 n", type: "number", value: 30 }, { id: "z", label: "z 值 (95%=1.96)", type: "number", value: 1.96 }], outputs: [{ id: "lower", label: "下限" }, { id: "upper", label: "上限" }], compute: function (a) { if (a.n <= 0) return { lower: "—", upper: "—" }; var me = a.z * a.sd / Math.sqrt(a.n); return { lower: a.mean - me, upper: a.mean + me }; } });
calcTool({ file: "stat-lottery-odds.html", title: "彩票中奖概率", desc: "由总号码数与抽取数估算中头奖的组合数及赔率。", category: "calc", tags: ["彩票", "概率", "组合"], order: 2496, fields: [{ id: "total", label: "总号码数", type: "number", value: 49 }, { id: "pick", label: "抽取数", type: "number", value: 6 }], outputs: [{ id: "comb", label: "组合数" }, { id: "odds", label: "中奖概率" }], compute: function (a) { function C(n, k) { k = Math.min(k, n - k); if (k < 0 || k > n) return 0; var r = 1; for (var i = 0; i < k; i++) r = r * (n - i) / (i + 1); return r; } var c = C(a.total, a.pick); return { comb: c, odds: c > 0 ? 1 / c : 0 }; } });
calcTool({ file: "stat-birthday-paradox.html", title: "生日悖论", desc: "计算 n 个人中至少两人生日相同的概率。", category: "calc", tags: ["生日悖论", "概率", "趣味"], order: 2497, fields: [{ id: "n", label: "人数 n", type: "number", value: 23 }], outputs: [{ id: "p", label: "至少两人同生日概率 (%)" }], compute: function (a) { var p = 1; for (var i = 0; i < a.n; i++) p *= (365 - i) / 365; return { p: (1 - p) * 100 }; } });
calcTool({ file: "stat-dice-probability.html", title: "掷骰概率", desc: "计算 m 个 n 面骰子点数之和恰好等于目标值的概率。", category: "calc", tags: ["骰子", "概率", "统计"], order: 2498, fields: [{ id: "dice", label: "骰子数 m", type: "number", value: 2 }, { id: "sides", label: "面数 n", type: "number", value: 6 }, { id: "target", label: "目标和", type: "number", value: 7 }], outputs: [{ id: "p", label: "概率" }, { id: "ways", label: "组合数" }], compute: function (a) { var m = Math.max(1, Math.min(10, a.dice | 0)), n = Math.max(2, Math.min(40, a.sides | 0)), t = a.target | 0; if (t < m || t > m * n) return { p: 0, ways: 0 }; var cur = []; for (var i = 1; i <= n; i++) cur[i] = 1; for (var d = 2; d <= m; d++) { var nxt = []; for (var s = d; s <= d * n; s++) { var sum = 0; for (var k = 1; k <= n && k <= s - d + 1; k++) sum += cur[s - k] || 0; nxt[s] = sum; } cur = nxt; } var ways = cur[t] || 0; var total = Math.pow(n, m); return { p: ways / total, ways: ways }; } });
calcTool({ file: "util-ordinal.html", title: "序数转换", desc: "将整数转换为英文序数（1st, 2nd…）与中文第 N。", category: "util", tags: ["序数", "转换", "格式"], order: 2499, fields: [{ id: "n", label: "整数 n", type: "text", value: "42" }], outputs: [{ id: "en", label: "英文序数" }, { id: "zh", label: "中文" }], compute: function (a) { var m = String(a.n).match(/-?\d+/); if (!m) return { en: "请输入整数", zh: "—" }; var n = parseInt(m[0], 10); var s = Math.abs(n).toString(); var suf; if (s.slice(-2) >= "11" && s.slice(-2) <= "13") suf = "th"; else if (s.slice(-1) === "1") suf = "st"; else if (s.slice(-1) === "2") suf = "nd"; else if (s.slice(-1) === "3") suf = "rd"; else suf = "th"; return { en: n + suf, zh: "第" + Math.abs(n) + (n < 0 ? "（负）" : "") }; } });
TOOLS.push({ file: "util-moon-phase.html", meta: { title: "月相查询", desc: "按日期估算月相、相位进度与亮面比例。", category: "util", tags: ["月相", "月球", "生活"], order: 2500 }, body: '<div class="field"><label>日期</label><input id="d" type="date"></div><div class="field"><label>结果</label><pre id="out"></pre></div>', script: '(function(){var $=PHT.$;var d=$("#d"),out=$("#out");if(!d.value)d.value=new Date().toISOString().slice(0,10);function phase(date){var ref=Date.UTC(2000,0,6,18,14,0);var days=(date.getTime()-ref)/86400000;var syn=29.530588853;return ((days%syn)/syn+1)%1;}function name(p){var names=["新月","娥眉月","上弦月","盈凸月","满月","亏凸月","下弦月","残月"];return names[Math.floor(p*8)%8];}function run(){var dt=new Date(d.value+"T00:00:00");var p=phase(dt);var illum=Math.abs(Math.cos(p*Math.PI))*100;out.textContent="月相: "+name(p)+"\\n相位进度: "+(p*100).toFixed(1)+"%\\n亮面比例(近似): "+illum.toFixed(1)+"%";}d.addEventListener("change",run);run();})();' });
TOOLS.push({ file: "util-sun-times.html", meta: { title: "日出日落时间", desc: "按纬度、经度与日期近似计算日出与日落（当地时区）。", category: "util", tags: ["日出", "日落", "太阳"], order: 2501 }, body: '<div class="field"><label>纬度</label><input id="lat" type="number" value="39.9"><label>经度</label><input id="lon" type="number" value="116.4"></div><div class="field"><label>日期</label><input id="d" type="date"></div><div class="field"><label>结果</label><pre id="out"></pre></div>', script: '(function(){var $=PHT.$;var lat=$("#lat"),lon=$("#lon"),d=$("#d"),out=$("#out");if(!d.value)d.value=new Date().toISOString().slice(0,10);function fmt(min){min=((min%1440)+1440)%1440;var h=Math.floor(min/60),m=Math.round(min%60);return (h<10?"0":"")+h+":"+(m<10?"0":"")+m;}function run(){var date=new Date(d.value+"T12:00:00");var N=Math.floor((date-new Date(date.getFullYear(),0,0))/86400000);var rad=Math.PI/180;var fy=2*Math.PI/365*(N-1);var eqTime=229.18*(0.000075+0.001868*Math.cos(fy)-0.032077*Math.sin(fy)-0.014615*Math.cos(2*fy)-0.040849*Math.sin(2*fy));var decl=0.006918-0.399912*Math.cos(fy)+0.070257*Math.sin(fy)-0.006758*Math.cos(2*fy)+0.000907*Math.sin(2*fy)-0.002697*Math.cos(3*fy)+0.00148*Math.sin(3*fy);var HA=Math.acos(Math.cos(90.833*rad)/(Math.cos(lat.value*rad)*Math.cos(decl))-Math.tan(lat.value*rad)*Math.tan(decl));var sr=720-4*(lon.value*1+HA*180/Math.PI)-eqTime;var ss=720-4*(lon.value*1-HA*180/Math.PI)-eqTime;var tz=date.getTimezoneOffset();out.textContent="日出: "+fmt(sr-tz)+"\\n日落: "+fmt(ss-tz);}lat.addEventListener("input",run);lon.addEventListener("input",run);d.addEventListener("change",run);run();})();' });
TOOLS.push({ file: "util-vcard.html", meta: { title: "vCard 生成器", desc: "填写联系人信息，生成可下载的 vCard (v3.0)。", category: "util", tags: ["vcard", "联系人", "生成"], order: 2502 }, body: '<div class="field"><label>姓名</label><input id="name" type="text" placeholder="张三"><label>电话</label><input id="tel" type="text" placeholder="138..."><label>邮箱</label><input id="email" type="text" placeholder="a@b.com"><label>单位</label><input id="org" type="text"><label>备注</label><input id="note" type="text"></div><div class="field"><button id="go" class="btn">生成</button> <button id="dl" class="btn ghost">下载 .vcf</button></div><div class="field"><label>vCard</label><pre id="out"></pre></div>', script: '(function(){var $=PHT.$;var name=$("#name"),tel=$("#tel"),email=$("#email"),org=$("#org"),note=$("#note"),out=$("#out"),go=$("#go"),dl=$("#dl");function run(){var s="BEGIN:VCARD\\nVERSION:3.0\\nN:"+name.value+"\\nFN:"+name.value+"\\n";if(tel.value)s+="TEL;TYPE=CELL:"+tel.value+"\\n";if(email.value)s+="EMAIL:"+email.value+"\\n";if(org.value)s+="ORG:"+org.value+"\\n";if(note.value)s+="NOTE:"+note.value+"\\n";s+="END:VCARD";out.textContent=s;}go.addEventListener("click",run);dl.addEventListener("click",function(){if(!out.textContent)run();PHT.download("contact.vcf",out.textContent,"text/vcard");});run();})();' });
TOOLS.push({ file: "util-ics.html", meta: { title: "日程 ICS 生成器", desc: "生成可导入日历的 .ics 事件文件。", category: "util", tags: ["ics", "日历", "生成"], order: 2503 }, body: '<div class="field"><label>标题</label><input id="title" type="text" placeholder="会议"><label>开始</label><input id="start" type="datetime-local"><label>结束</label><input id="end" type="datetime-local"><label>地点</label><input id="loc" type="text"><label>描述</label><input id="desc" type="text"></div><div class="field"><button id="go" class="btn">生成</button> <button id="dl" class="btn ghost">下载 .ics</button></div><div class="field"><label>ICS</label><pre id="out"></pre></div>', script: '(function(){var $=PHT.$;var title=$("#title"),start=$("#start"),end=$("#end"),loc=$("#loc"),desc=$("#desc"),out=$("#out"),go=$("#go"),dl=$("#dl");function fmt(s){if(!s)return "";return s.replace(/[-:]/g,"").replace(/\.\d+$/,"")+"Z";}function run(){if(!start.value){out.textContent="";return;}var s="BEGIN:VCALENDAR\\nVERSION:2.0\\nPRODID:-//PureHTMLTools//ICS//CN\\nBEGIN:VEVENT\\nUID:"+Date.now()+"@purehtml\\nDTSTAMP:"+fmt(new Date().toISOString())+"\\nDTSTART:"+fmt(start.value)+"\\nDTEND:"+fmt(end.value||start.value)+"\\nSUMMARY:"+title.value+"\\n";if(loc.value)s+="LOCATION:"+loc.value+"\\n";if(desc.value)s+="DESCRIPTION:"+desc.value+"\\n";s+="END:VEVENT\\nEND:VCALENDAR";out.textContent=s;}go.addEventListener("click",run);dl.addEventListener("click",function(){if(!out.textContent)run();PHT.download("event.ics",out.textContent,"text/calendar");});run();})();' });
TOOLS.push({ file: "util-acronym.html", meta: { title: "缩写生成", desc: "从短语中提取首字母生成缩写（支持中英文）。", category: "util", tags: ["缩写", "首字母", "文本"], order: 2504 }, body: '<div class="field"><label>短语</label><textarea id="inp" rows="4" placeholder="例如 Hyper Text Markup Language"></textarea></div><div class="field"><label>结果</label><pre id="out"></pre></div>', script: '(function(){var $=PHT.$;var inp=$("#inp"),out=$("#out");function run(){var t=inp.value.trim();if(!t){out.textContent="";return;}var toks=t.split(/\\s+/).filter(Boolean);var ac=toks.map(function(w){return w.charAt(0)||"";}).join("").toUpperCase();out.textContent="缩写: "+ac+"\\n来源词: "+toks.join(" / ");}inp.addEventListener("input",run);run();})();' });
TOOLS.push({ file: "util-name-combiner.html", meta: { title: "名字融合", desc: "将两个名字混合成类似 portmanteau 的新名字。", category: "util", tags: ["名字", "融合", "趣味"], order: 2505 }, body: '<div class="field"><label>名字 A</label><input id="a" type="text" placeholder="Anna"><label>名字 B</label><input id="b" type="text" placeholder="Bob"></div><div class="field"><label>结果</label><pre id="out"></pre></div>', script: '(function(){var $=PHT.$;var a=$("#a"),b=$("#b"),out=$("#out");function run(){var x=a.value.trim(),y=b.value.trim();if(!x||!y){out.textContent="";return;}var m=Math.ceil(x.length/2),n=Math.floor(y.length/2);var main=x.slice(0,m)+y.slice(n);out.textContent="融合: "+main+"\\n方案二: "+x.slice(0,Math.ceil(x.length/3))+y.slice(Math.floor(y.length/3));}a.addEventListener("input",run);b.addEventListener("input",run);run();})();' });
TOOLS.push({ file: "util-packing-list.html", meta: { title: "行李清单", desc: "按出行类型生成一份可勾选的行李清单。", category: "util", tags: ["行李", "清单", "旅行"], order: 2506 }, body: '<div class="field"><label>出行类型</label><select id="t"><option value="商务">商务</option><option value="旅行">休闲旅行</option><option value="海滩">海滩</option><option value="登山">登山徒步</option></select> <button id="go" class="btn">生成</button></div><div class="field"><label>清单</label><pre id="out"></pre></div>', script: '(function(){var $=PHT.$;var t=$("#t"),out=$("#out"),go=$("#go");var L={商务:["笔记本电脑","充电器","证件","名片","衬衫","充电宝","眼镜"],旅行:["衣物","洗漱用品","证件","充电器","相机","常用药","现金/银行卡","雨具"],海滩:["泳衣","防晒霜","毛巾","拖鞋","墨镜","遮阳帽","水壶"],登山:["登山鞋","背包","水壶","冲锋衣","头灯","地图","急救包","能量棒"]};function run(){out.textContent=(L[t.value]||[]).map(function(i){return "[ ] "+i;}).join("\\n");}go.addEventListener("click",run);t.addEventListener("change",run);run();})();' });
TOOLS.push({ file: "util-jetlag.html", meta: { title: "时差与倒时差", desc: "按出发地与目的地时区偏移估算时差与恢复天数。", category: "util", tags: ["时差", "旅行", "健康"], order: 2507 }, body: '<div class="field"><label>出发地时区偏移 (小时)</label><input id="from" type="number" value="8"><label>目的地时区偏移 (小时)</label><input id="to" type="number" value="-5"></div><div class="field"><label>结果</label><pre id="out"></pre></div>', script: '(function(){var $=PHT.$;var from=$("#from"),to=$("#to"),out=$("#out");function run(){var diff=to.value*1-from.value*1;var r=Math.abs(diff);var days=(r/2).toFixed(1);out.textContent="时差: "+(diff>0?"+":"")+diff+" 小时\\n预计完全适应约: "+days+" 天\\n提示: 每天向东每跨1区约需1天，向西约半天。";}from.addEventListener("input",run);to.addEventListener("input",run);run();})();' });
TOOLS.push({ file: "util-anagram.html", meta: { title: "变位词判断", desc: "判断两组字母是否为变位词（字母组成相同）。", category: "util", tags: ["变位词", "字母", "文本"], order: 2508 }, body: '<div class="field"><label>第一组</label><input id="a" type="text" placeholder="listen"><label>第二组</label><input id="b" type="text" placeholder="silent"></div><div class="field"><label>结果</label><pre id="out"></pre></div>', script: '(function(){var $=PHT.$;var a=$("#a"),b=$("#b"),out=$("#out");function norm(s){return s.toLowerCase().replace(/[^a-z0-9一-鿿]/g,"").split("").sort().join("");}function run(){var x=a.value.trim(),y=b.value.trim();if(!x||!y){out.textContent="";return;}out.textContent=(norm(x)===norm(y))?"是变位词 ✅":"不是变位词 ❌";}a.addEventListener("input",run);b.addEventListener("input",run);run();})();' });
TOOLS.push({ file: "util-palindrome.html", meta: { title: "回文判断", desc: "判断文本是否为回文（忽略大小写与标点）。", category: "util", tags: ["回文", "文本", "趣味"], order: 2509 }, body: '<div class="field"><label>文本</label><input id="inp" type="text" placeholder="A man a plan a canal Panama"></div><div class="field"><label>结果</label><pre id="out"></pre></div>', script: '(function(){var $=PHT.$;var inp=$("#inp"),out=$("#out");function run(){var s=inp.value.toLowerCase().replace(/[^a-z0-9一-鿿]/g,"");var r=s.split("").reverse().join("");out.textContent=s&&s===r?"是回文 ✅":"不是回文 ❌";}inp.addEventListener("input",run);run();})();' });
TOOLS.push({ file: "util-caesar.html", meta: { title: "凯撒密码", desc: "对文本按指定位移进行凯撒移位加密/解密。", category: "util", tags: ["凯撒", "密码", "加密"], order: 2510 }, body: '<div class="field"><label>文本</label><textarea id="inp" rows="4" placeholder="Hello"></textarea></div><div class="field"><label>位移</label><input id="shift" type="number" value="3"><button id="go" class="btn">加密</button> <button id="cp" class="btn ghost">复制</button></div><div class="field"><label>结果</label><pre id="out"></pre></div>', script: '(function(){var $=PHT.$;var inp=$("#inp"),shift=$("#shift"),out=$("#out"),go=$("#go"),cp=$("#cp");function caesar(s,sh){sh=((sh%26)+26)%26;return s.replace(/[a-z]/gi,function(c){var base=c<="Z"?65:97;return String.fromCharCode((c.charCodeAt(0)-base+sh)%26+base);});}function run(){out.textContent=caesar(inp.value,shift.value*1);}go.addEventListener("click",run);inp.addEventListener("input",run);shift.addEventListener("input",run);cp.addEventListener("click",function(){PHT.copy(out.textContent).then(function(){PHT.flash(cp,"已复制");});});run();})();' });
TOOLS.push({ file: "image-to-datauri.html", meta: { title: "图片转 Data URI", desc: "将本地图片转换为 Base64 Data URI（在浏览器内完成，不上传）。", category: "image", tags: ["datauri", "图片", "转换"], order: 2511 }, body: '<div class="field"><label>选择图片</label><input id="f" type="file" accept="image/*"></div><div class="field"><button id="cp" class="btn ghost">复制</button></div><div class="field"><label>Data URI</label><textarea id="out" rows="6" readonly></textarea></div>', script: '(function(){var $=PHT.$;var f=$("#f"),out=$("#out"),cp=$("#cp");f.addEventListener("change",function(){var file=f.files[0];if(!file)return;var r=new FileReader();r.onload=function(){out.value=r.result;};r.readAsDataURL(file);});cp.addEventListener("click",function(){PHT.copy(out.value).then(function(){PHT.flash(cp,"已复制");});});})();' });
TOOLS.push({ file: "logic-truth-table.html", meta: { title: "真值表生成", desc: "输入布尔表达式（变量用字母，支持 & | ^ ! 与括号），生成真值表。", category: "dev", tags: ["真值表", "逻辑", "布尔"], order: 2512 }, body: '<div class="field"><label>布尔表达式</label><input id="expr" type="text" placeholder="A & (B | !C)"><button id="go" class="btn">生成</button></div><div class="field"><label>真值表</label><pre id="out"></pre></div>', script: '(function(){var $=PHT.$;var expr=$("#expr"),out=$("#out"),go=$("#go");function run(){var s=expr.value.replace(/\\s/g,"");if(!s){out.textContent="";return;}var ast,i;try{ast=parseExpr();}catch(e){out.textContent="解析错误: "+e.message;return;}var vars=[];(function collect(n){if(!n)return;if(n.var)vars.push(n.var);collect(n.a);collect(n.b);})(ast);vars=vars.filter(function(v,k){return vars.indexOf(v)===k;}).sort();if(vars.length>8){out.textContent="变量过多（最多 8 个）";return;}var lines=[];lines.push(vars.join(" ")+" | 结果");var total=1<<vars.length;for(var mask=0;mask<total;mask++){var val={};for(var v=0;v<vars.length;v++)val[vars[v]]=!!(mask&(1<<(vars.length-1-v)));var r=ev(ast,val);var row=vars.map(function(x){return val[x]?"1":"0";}).join(" ");lines.push(row+" | "+(r?"1":"0"));}out.textContent=lines.join("\\n");}function parseExpr(){i=0;return parseOr();}function parseOr(){var v=parseXor();while(expr[i]==="|"){i++;v={op:"|",a:v,b:parseXor()};}return v;}function parseXor(){var v=parseAnd();while(expr[i]==="^"){i++;v={op:"^",a:v,b:parseAnd()};}return v;}function parseAnd(){var v=parseFactor();while(expr[i]==="&"){i++;v={op:"&",a:v,b:parseFactor()};}return v;}function parseFactor(){if(expr[i]==="!"){i++;return {op:"!",a:parseFactor()};}if(expr[i]==="("){i++;var e=parseExpr();i++;return e;}var c=expr[i];if(/[A-Za-z]/.test(c)){i++;return {var:c};}throw new Error("意外字符: "+c);}function ev(n,vars){if(n.op==="!")return !ev(n.a,vars);if(n.op==="&")return ev(n.a,vars)&&ev(n.b,vars);if(n.op==="^")return ev(n.a,vars)!==ev(n.b,vars);if(n.op==="|")return ev(n.a,vars)||ev(n.b,vars);return !!vars[n.var];}go.addEventListener("click",run);expr.addEventListener("input",run);run();})();' });

// ---------- Batch 9f + 9g：补齐工具 ----------
TOOLS.push({ file: "util-timestamp-converter.html", meta: { title: "时间戳转换", desc: "Unix 时间戳与日期时间互转（本地与 UTC）。", category: "util", tags: ["时间戳", "日期", "转换"], order: 2513 }, body: '<div class="field"><label>Unix 时间戳（秒）</label><input id="ts" type="number" placeholder="例如 1700000000"></div><div class="field"><label>结果</label><pre id="out"></pre></div><div class="field"><label>或选择日期时间 → Unix</label><input id="dt" type="datetime-local"> <button id="toTs" class="btn">转时间戳</button></div><div class="field"><label>Unix 结果</label><pre id="out2"></pre></div>', script: '(function(){var $=PHT.$;var ts=$("#ts"),out=$("#out"),dt=$("#dt"),toTs=$("#toTs"),out2=$("#out2");function run(){var v=ts.value.trim();if(!v){out.textContent="";return;}var d=new Date(parseFloat(v)*1000);if(isNaN(d.getTime())){out.textContent="无效时间戳";return;}out.textContent="本地: "+d.toLocaleString()+"\\nUTC: "+d.toUTCString()+"\\nISO: "+d.toISOString();}function run2(){if(!dt.value){out2.textContent="";return;}var d=new Date(dt.value);out2.textContent="Unix(秒): "+Math.floor(d.getTime()/1000)+"\\nUnix(毫秒): "+d.getTime();}ts.addEventListener("input",run);toTs.addEventListener("click",run2);dt.addEventListener("change",run2);run();})();' });
unitConvTool({ file: "unit-data-storage-bits.html", title: "数据容量（位）换算", desc: "在比特、半字节、字节、千比特与千字节之间换算。", tags: ["数据", "比特", "换算"], order: 2514, units: [{ name: "比特 bit", factor: 1 }, { name: "半字节 nibble", factor: 4 }, { name: "字节 B", factor: 8 }, { name: "千比特 Kibit", factor: 1024 }, { name: "千字节 KiB", factor: 8192 }] });
calcTool({ file: "util-discount-stack.html", title: "叠加折扣", desc: "计算多档折扣（依次打折）后的最终价格与节省金额。", category: "util", tags: ["折扣", "价格", "购物"], order: 2515, fields: [{ id: "price", label: "原价 (元)", type: "number", value: 100 }, { id: "d1", label: "折扣1 (%)", type: "number", value: 20 }, { id: "d2", label: "折扣2 (%)", type: "number", value: 10 }], outputs: [{ id: "final", label: "折后价" }, { id: "saved", label: "节省" }], compute: function (a) { var f = a.price * (1 - a.d1 / 100) * (1 - a.d2 / 100); return { final: f, saved: a.price - f }; } });
calcTool({ file: "stat-geometric-probability.html", title: "几何分布概率", desc: "计算第 k 次试验才首次成功的概率（几何分布）。", category: "calc", tags: ["几何分布", "概率", "统计"], order: 2516, fields: [{ id: "p", label: "单次成功概率 p (0-1)", type: "number", value: 0.2 }, { id: "k", label: "第 k 次", type: "number", value: 3 }], outputs: [{ id: "prob", label: "概率" }], compute: function (a) { if (a.p <= 0 || a.p > 1) return { prob: "p 需为 0-1" }; return { prob: Math.pow(1 - a.p, a.k - 1) * a.p }; } });
textTool({ file: "text-duplicate-lines.html", title: "重复行统计", desc: "统计文本中重复出现的行及其出现次数。", category: "text", tags: ["重复行", "统计", "文本"], order: 2517, fields: [{ id: "text", label: "文本", type: "textarea", rows: 8, placeholder: "每行一个条目" }], transform: function (args) { var lines = args.text.split(/\n/); var f = {}, out = []; lines.forEach(function (l) { var t = l.trim(); if (t === "") return; f[t] = (f[t] || 0) + 1; }); var keys = Object.keys(f).filter(function (k) { return f[k] > 1; }); if (!keys.length) return "无重复行"; return keys.map(function (k) { return f[k] + " ×: " + k; }).join("\n"); } });
calcTool({ file: "math-combination-value.html", title: "组合数 C(n,k)", desc: "计算从 n 个元素中取 k 个的组合数。", category: "calc", tags: ["组合", "数学", "计数"], order: 2518, fields: [{ id: "n", label: "n", type: "number", value: 10, min: 0 }, { id: "k", label: "k", type: "number", value: 3, min: 0 }], outputs: [{ id: "c", label: "C(n,k)" }], compute: function (a) { var k = Math.min(a.k, a.n - a.k); if (k < 0 || k > a.n) return { c: 0 }; var r = 1; for (var i = 0; i < k; i++) r = r * (a.n - i) / (i + 1); return { c: r }; } });
calcTool({ file: "math-permutation-value.html", title: "排列数 P(n,k)", desc: "计算从 n 个元素中取 k 个的排列数。", category: "calc", tags: ["排列", "数学", "计数"], order: 2519, fields: [{ id: "n", label: "n", type: "number", value: 10, min: 0 }, { id: "k", label: "k", type: "number", value: 3, min: 0 }], outputs: [{ id: "p", label: "P(n,k)" }], compute: function (a) { if (a.k < 0 || a.k > a.n) return { p: 0 }; var r = 1; for (var i = 0; i < a.k; i++) r *= (a.n - i); return { p: r }; } });
calcTool({ file: "geo-bearing.html", title: "方位角计算", desc: "计算从起点到终点的初始方位角（度）。", category: "calc", tags: ["方位角", "导航", "几何"], order: 2520, fields: [{ id: "lat1", label: "起点纬度 (°)", type: "number", value: 39.9 }, { id: "lon1", label: "起点经度 (°)", type: "number", value: 116.4 }, { id: "lat2", label: "终点纬度 (°)", type: "number", value: 31.2 }, { id: "lon2", label: "终点经度 (°)", type: "number", value: 121.5 }], outputs: [{ id: "brng", label: "方位角 (°)" }], compute: function (a) { var t1 = a.lat1 * Math.PI / 180, t2 = a.lat2 * Math.PI / 180, dLon = (a.lon2 - a.lon1) * Math.PI / 180; var y = Math.sin(dLon) * Math.cos(t2); var x = Math.cos(t1) * Math.sin(t2) - Math.sin(t1) * Math.cos(t2) * Math.cos(dLon); var brng = Math.atan2(y, x) * 180 / Math.PI; return { brng: (brng + 360) % 360 }; } });
calcTool({ file: "util-file-size-split.html", title: "文件均分", desc: "将总大小按份数均分，估算每份大小。", category: "util", tags: ["文件", "均分", "容量"], order: 2521, fields: [{ id: "total", label: "总大小 (MB)", type: "number", value: 1024 }, { id: "parts", label: "份数", type: "number", value: 4, min: 1 }], outputs: [{ id: "each", label: "每份 (MB)" }, { id: "eachGb", label: "每份 (GB)" }], compute: function (a) { if (a.parts <= 0) return { each: "份数需为正", eachGb: "—" }; var e = a.total / a.parts; return { each: e, eachGb: e / 1024 }; } });
TOOLS.push({ file: "util-duration-parse.html", meta: { title: "时长解析", desc: "将 1h30m15s 这样的时长文本解析为秒与可读分解。", category: "util", tags: ["时长", "解析", "时间"], order: 2522 }, body: '<div class="field"><label>时长文本</label><input id="inp" type="text" placeholder="例如 2h30m"></div><div class="field"><label>结果</label><pre id="out"></pre></div>', script: '(function(){var $=PHT.$;var inp=$("#inp"),out=$("#out");function run(){var s=inp.value.trim().toLowerCase();if(!s){out.textContent="";return;}var d=0,w=/(\d+)\s*w/.exec(s),dd=w?+w[1]:0;var h=/(\d+)\s*h/.exec(s),hh=h?+h[1]:0;var m=/(\d+)\s*m/.exec(s),mm=m?+m[1]:0;var sec=/(\d+)\s*s/.exec(s),ss=sec?+sec[1]:0;d=(dd*7+hh)*24*3600+mm*60+ss;var parts=[];if(dd)parts.push(dd+" 周");if(hh)parts.push(hh+" 小时");if(mm)parts.push(mm+" 分");if(ss)parts.push(ss+" 秒");out.textContent="总秒数: "+d+"\\n分解: "+(parts.join(" ")||"0 秒");}inp.addEventListener("input",run);run();})();' });
textTool({ file: "util-thousands-separator.html", title: "千分位分隔", desc: "为整数或小数添加千位分隔符。", category: "util", tags: ["千分位", "格式", "数字"], order: 2523, fields: [{ id: "text", label: "数字", type: "text", placeholder: "1234567.89" }], transform: function (args) { var s = args.text.trim(); if (!/^-?\d+(\.\d+)?$/.test(s)) return "请输入数字"; var neg = s[0] === "-"; var num = s.replace("-", ""); var parts = num.split("."); var intp = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ","); return (neg ? "-" : "") + intp + (parts[1] ? "." + parts[1] : ""); } });
textTool({ file: "util-card-formatter.html", title: "银行卡号分组", desc: "将连续卡号按每 4 位分组，便于核对。", category: "util", tags: ["卡号", "格式化", "银行"], order: 2524, fields: [{ id: "text", label: "卡号", type: "text", placeholder: "输入连续数字" }], transform: function (args) { var d = args.text.replace(/\D/g, ""); if (!d) return ""; return d.replace(/(.{4})/g, "$1 ").trim(); } });
textTool({ file: "util-phone-formatter.html", title: "电话号码分组", desc: "将连续数字按常见格式分组（11 位手机号 3-4-4）。", category: "util", tags: ["电话", "格式化", "通讯"], order: 2525, fields: [{ id: "text", label: "号码", type: "text", placeholder: "输入连续数字" }], transform: function (args) { var d = args.text.replace(/\D/g, ""); if (!d) return ""; if (d.length === 11) return d.slice(0, 3) + "-" + d.slice(3, 7) + "-" + d.slice(7); return d.replace(/(.{4})/g, "$1 ").trim(); } });
calcTool({ file: "math-sum-divisors.html", title: "约数和 σ(n)", desc: "计算正整数 n 的所有正约数之和。", category: "calc", tags: ["约数", "数论", "数学"], order: 2526, fields: [{ id: "n", label: "n", type: "number", value: 12, min: 1 }], outputs: [{ id: "res", label: "约数和" }], compute: function (a) { var n = Math.floor(a.n), s = 0; for (var i = 1; i <= n; i++) if (n % i === 0) s += i; return { res: s }; } });
calcTool({ file: "math-prime-count.html", title: "素数计数 π(n)", desc: "计算不超过 n 的素数个数。", category: "calc", tags: ["素数", "计数", "数论"], order: 2527, fields: [{ id: "n", label: "n", type: "number", value: 100, min: 1 }], outputs: [{ id: "res", label: "素数个数" }], compute: function (a) { var n = Math.floor(a.n), c = 0; function isP(x) { if (x < 2) return false; for (var i = 2; i * i <= x; i++) if (x % i === 0) return false; return true; } for (var k = 2; k <= n; k++) if (isP(k)) c++; return { res: c }; } });
calcTool({ file: "math-armstrong.html", title: "水仙花数判断", desc: "判断一个数是否为阿姆斯特朗数（各位数字幂次和等于自身）。", category: "calc", tags: ["水仙花数", "数论", "数学"], order: 2528, fields: [{ id: "n", label: "整数 n", type: "text", value: "153" }], outputs: [{ id: "res", label: "结果" }], compute: function (a) { var s = String(a.n).replace(/[^0-9]/g, ""); if (!s) return { res: "请输入数字" }; var len = s.length, sum = 0; for (var i = 0; i < len; i++) sum += Math.pow(+s[i], len); return { res: (+s === sum) ? "是阿姆斯特朗数" : "不是阿姆斯特朗数" }; } });
calcTool({ file: "math-happy-number.html", title: "快乐数判断", desc: "判断一个数是否为快乐数（迭代平方和最终得 1）。", category: "calc", tags: ["快乐数", "数论", "数学"], order: 2529, fields: [{ id: "n", label: "整数 n", type: "text", value: "19" }], outputs: [{ id: "res", label: "结果" }], compute: function (a) { var n = parseInt(String(a.n).replace(/[^0-9]/g, ""), 10); if (isNaN(n)) return { res: "请输入数字" }; var seen = {}; while (n !== 1 && !seen[n]) { seen[n] = 1; var s = 0; while (n) { s += (n % 10) * (n % 10); n = Math.floor(n / 10); } n = s; } return { res: n === 1 ? "是快乐数" : "不是快乐数" }; } });
genTool({ file: "math-collatz.html", title: "冰雹序列", desc: "生成考拉兹（冰雹）猜想的迭代序列。", category: "util", tags: ["考拉兹", "序列", "数学"], order: 2530, fields: [{ id: "n", label: "起始数 n", type: "number", value: 27, min: 1 }], gen: function (a) { var n = Math.max(1, Math.floor(a.n)); var seq = [n]; while (n > 1) { n = n % 2 ? 3 * n + 1 : n / 2; seq.push(n); if (seq.length > 200) break; } return seq.join(" -> "); } });
calcTool({ file: "geo-triangle-centroid.html", title: "三角形重心", desc: "由三个顶点坐标计算三角形的重心（质心）。", category: "calc", tags: ["重心", "三角形", "几何"], order: 2531, fields: [{ id: "x1", label: "x1", type: "number", value: 0 }, { id: "y1", label: "y1", type: "number", value: 0 }, { id: "x2", label: "x2", type: "number", value: 6 }, { id: "y2", label: "y2", type: "number", value: 0 }, { id: "x3", label: "x3", type: "number", value: 3 }, { id: "y3", label: "y3", type: "number", value: 6 }], outputs: [{ id: "cx", label: "重心 x" }, { id: "cy", label: "重心 y" }], compute: function (a) { return { cx: (a.x1 + a.x2 + a.x3) / 3, cy: (a.y1 + a.y2 + a.y3) / 3 }; } });
calcTool({ file: "geo-destination.html", title: "目标点推算", desc: "按起点、方位角与距离推算目标经纬度。", category: "calc", tags: ["导航", "目标点", "几何"], order: 2532, fields: [{ id: "lat1", label: "起点纬度 (°)", type: "number", value: 39.9 }, { id: "lon1", label: "起点经度 (°)", type: "number", value: 116.4 }, { id: "brng", label: "方位角 (°)", type: "number", value: 90 }, { id: "dist", label: "距离 (km)", type: "number", value: 100 }], outputs: [{ id: "lat2", label: "终点纬度" }, { id: "lon2", label: "终点经度" }], compute: function (a) { var R = 6371, br = a.brng * Math.PI / 180, la1 = a.lat1 * Math.PI / 180, lo1 = a.lon1 * Math.PI / 180; var la2 = Math.asin(Math.sin(la1) * Math.cos(a.dist / R) + Math.cos(la1) * Math.sin(a.dist / R) * Math.cos(br)); var lo2 = lo1 + Math.atan2(Math.sin(br) * Math.sin(a.dist / R) * Math.cos(la1), Math.cos(a.dist / R) - Math.sin(la1) * Math.sin(la2)); return { lat2: la2 * 180 / Math.PI, lon2: ((lo2 * 180 / Math.PI + 540) % 360) - 180 }; } });
calcTool({ file: "phys-carnot.html", title: "卡诺效率", desc: "计算理想卡诺热机效率（温度需为绝对温度，单位一致）。", category: "calc", tags: ["卡诺", "效率", "热机"], order: 2533, fields: [{ id: "th", label: "高温热源 T_h", type: "number", value: 500 }, { id: "tc", label: "低温热源 T_c", type: "number", value: 300 }], outputs: [{ id: "eff", label: "效率 (%)" }], compute: function (a) { if (a.th <= a.tc || a.th <= 0) return { eff: "需 T_h > T_c > 0" }; return { eff: (1 - a.tc / a.th) * 100 }; } });
calcTool({ file: "chem-dilution.html", title: "溶液稀释 C1V1=C2V2", desc: "按稀释公式求稀释后的体积。", category: "calc", tags: ["稀释", "化学", "溶液"], order: 2534, fields: [{ id: "c1", label: "原浓度 C1", type: "number", value: 1 }, { id: "v1", label: "原体积 V1", type: "number", value: 100 }, { id: "c2", label: "目标浓度 C2", type: "number", value: 0.1 }], outputs: [{ id: "v2", label: "目标体积 V2" }], compute: function (a) { if (a.c2 <= 0) return { v2: "目标浓度需为正" }; return { v2: a.c1 * a.v1 / a.c2 }; } });
calcTool({ file: "chem-molarity.html", title: "摩尔浓度求物质的量", desc: "由浓度与体积计算物质的量 n = C × V。", category: "calc", tags: ["摩尔", "浓度", "化学"], order: 2535, fields: [{ id: "c", label: "浓度 C (mol/L)", type: "number", value: 2 }, { id: "v", label: "体积 V (L)", type: "number", value: 0.5 }], outputs: [{ id: "moles", label: "物质的量 (mol)" }], formulas: [{ id: "moles", expr: "c*v" }] });
calcTool({ file: "chem-moles.html", title: "质量求物质的量", desc: "由质量与摩尔质量计算物质的量 n = m / M。", category: "calc", tags: ["摩尔", "质量", "化学"], order: 2536, fields: [{ id: "m", label: "质量 m (g)", type: "number", value: 18 }, { id: "mm", label: "摩尔质量 M (g/mol)", type: "number", value: 18 }], outputs: [{ id: "moles", label: "物质的量 (mol)" }], compute: function (a) { if (a.mm <= 0) return { moles: "摩尔质量需为正" }; return { moles: a.m / a.mm }; } });
calcTool({ file: "fin-capm.html", title: "CAPM 期望收益", desc: "按资本资产定价模型估算资产期望收益率。", category: "calc", tags: ["CAPM", "收益", "理财"], order: 2537, fields: [{ id: "rf", label: "无风险利率 (%)", type: "number", value: 2 }, { id: "beta", label: "β 系数", type: "number", value: 1.2 }, { id: "rm", label: "市场预期收益 (%)", type: "number", value: 8 }], outputs: [{ id: "r", label: "期望收益 (%)" }], compute: function (a) { return { r: a.rf + a.beta * (a.rm - a.rf) }; } });
calcTool({ file: "fin-sharpe.html", title: "夏普比率", desc: "由收益率、无风险利率与波动率估算夏普比率。", category: "calc", tags: ["夏普", "风险", "理财"], order: 2538, fields: [{ id: "ret", label: "收益率 (%)", type: "number", value: 12 }, { id: "rf", label: "无风险利率 (%)", type: "number", value: 2 }, { id: "sd", label: "波动率 (%)", type: "number", value: 10 }], outputs: [{ id: "sharpe", label: "夏普比率" }], compute: function (a) { if (a.sd <= 0) return { sharpe: "波动率需为正" }; return { sharpe: (a.ret - a.rf) / a.sd }; } });
calcTool({ file: "util-significant-figures.html", title: "有效数字保留", desc: "将数值按指定位数的有效数字进行舍入。", category: "util", tags: ["有效数字", "舍入", "数字"], order: 2539, fields: [{ id: "x", label: "数值", type: "number", value: 0.012345 }, { id: "n", label: "有效数字位数", type: "number", value: 3, min: 1 }], outputs: [{ id: "res", label: "结果" }], compute: function (a) { if (a.x === 0) return { res: 0 }; var d = Math.ceil(Math.log10(Math.abs(a.x))); var p = Math.pow(10, a.n - d); return { res: Math.round(a.x * p) / p }; } });

// ---------- Batch 9h + 9i：最后补齐 ----------
calcTool({ file: "phys-youngs.html", title: "杨氏模量", desc: "由应力与应变计算杨氏模量 E = σ / ε。", category: "calc", tags: ["杨氏模量", "应力", "物理"], order: 2540, fields: [{ id: "stress", label: "应力 σ (Pa)", type: "number", value: 2e8 }, { id: "strain", label: "应变 ε (无量纲)", type: "number", value: 0.01 }], outputs: [{ id: "e", label: "杨氏模量 E (Pa)" }], compute: function (a) { if (a.strain === 0) return { e: "应变不能为 0" }; return { e: a.stress / a.strain }; } });
calcTool({ file: "fin-roe.html", title: "净资产收益率 ROE", desc: "按净利润与股东权益计算 ROE。", category: "calc", tags: ["ROE", "收益率", "理财"], order: 2541, fields: [{ id: "ni", label: "净利润", type: "number", value: 100 }, { id: "equity", label: "股东权益", type: "number", value: 500 }], outputs: [{ id: "roe", label: "ROE (%)" }], compute: function (a) { if (a.equity <= 0) return { roe: "权益需为正" }; return { roe: a.ni / a.equity * 100 }; } });
calcTool({ file: "fin-debt-to-income.html", title: "债务收入比 DTI", desc: "按每月债务支出与月收入计算债务收入比。", category: "calc", tags: ["DTI", "债务", "理财"], order: 2542, fields: [{ id: "debt", label: "月债务支出", type: "number", value: 4000 }, { id: "income", label: "月收入", type: "number", value: 15000 }], outputs: [{ id: "dti", label: "DTI (%)" }], compute: function (a) { if (a.income <= 0) return { dti: "收入需为正" }; return { dti: a.debt / a.income * 100 }; } });
calcTool({ file: "util-alcohol-units.html", title: "酒精单位", desc: "按体积与酒精度估算英制酒精单位（1 单位 = 10ml 纯乙醇）。", category: "util", tags: ["酒精", "单位", "健康"], order: 2543, fields: [{ id: "vol", label: "体积 (ml)", type: "number", value: 330 }, { id: "abv", label: "酒精度 ABV (%)", type: "number", value: 5 }], outputs: [{ id: "units", label: "酒精单位" }, { id: "pure", label: "纯乙醇 (ml)" }], compute: function (a) { var pure = a.vol * a.abv / 100; return { units: pure * 0.789 / 10, pure: pure }; } });
calcTool({ file: "util-hat-size.html", title: "帽围尺码", desc: "由头围（厘米）估算帽码（美码）。", category: "util", tags: ["帽码", "尺码", "生活"], order: 2544, fields: [{ id: "cm", label: "头围 (cm)", type: "number", value: 57 }], outputs: [{ id: "size", label: "美码" }, { id: "cm2", label: "头围 (cm)" }], compute: function (a) { return { size: (a.cm / 2.54) / Math.PI, cm2: a.cm }; } });
calcTool({ file: "util-bed-size.html", title: "床垫尺寸参考", desc: "按床型给出常见床垫宽高（厘米）。", category: "util", tags: ["床", "尺寸", "家居"], order: 2545, fields: [{ id: "size", label: "床型", type: "select", options: [{ value: "单人床", label: "单人床" }, { value: "双人床", label: "双人床" }, { value: "大双人", label: "大双人 1.8m" }, { value: "加大", label: "加大 2.0m" }, { value: "Twin(美)", label: "Twin(美)" }, { value: "Full(美)", label: "Full(美)" }, { value: "Queen(美)", label: "Queen(美)" }, { value: "King(美)", label: "King(美)" }, { value: "Cal King(美)", label: "Cal King(美)" }] }], outputs: [{ id: "w", label: "宽 (cm)" }, { id: "h", label: "高 (cm)" }], compute: function (a) { var t = { "单人床": [90, 190], "双人床": [150, 200], "大双人": [180, 200], "加大": [200, 200], "Twin(美)": [99, 191], "Full(美)": [137, 191], "Queen(美)": [152, 203], "King(美)": [193, 203], "Cal King(美)": [183, 213] }; var r = t[a.size]; return { w: r[0], h: r[1] }; } });
calcTool({ file: "util-envelope-size.html", title: "信封尺寸参考", desc: "按信封规格给出尺寸（毫米）。", category: "util", tags: ["信封", "尺寸", "办公"], order: 2546, fields: [{ id: "size", label: "规格", type: "select", options: [{ value: "#10", label: "#10" }, { value: "A2", label: "A2" }, { value: "A6", label: "A6" }, { value: "C5", label: "C5" }, { value: "C4", label: "C4" }, { value: "DL", label: "DL" }] }], outputs: [{ id: "w", label: "宽 (mm)" }, { id: "h", label: "高 (mm)" }], compute: function (a) { var t = { "#10": [241, 105], "A2": [111, 146], "A6": [121, 165], "C5": [162, 229], "C4": [229, 324], "DL": [110, 220] }; var r = t[a.size]; return { w: r[0], h: r[1] }; } });
calcTool({ file: "util-birthstone.html", title: "生辰石查询", desc: "按出生月份查询对应的生辰石。", category: "util", tags: ["生辰石", "月份", "生活"], order: 2547, fields: [{ id: "m", label: "月份", type: "select", options: [{ value: "1", label: "1 月" }, { value: "2", label: "2 月" }, { value: "3", label: "3 月" }, { value: "4", label: "4 月" }, { value: "5", label: "5 月" }, { value: "6", label: "6 月" }, { value: "7", label: "7 月" }, { value: "8", label: "8 月" }, { value: "9", label: "9 月" }, { value: "10", label: "10 月" }, { value: "11", label: "11 月" }, { value: "12", label: "12 月" }] }], outputs: [{ id: "stone", label: "生辰石" }], compute: function (a) { var t = { "1": "石榴石", "2": "紫水晶", "3": "海蓝宝石", "4": "钻石", "5": "祖母绿", "6": "珍珠", "7": "红宝石", "8": "橄榄石", "9": "蓝宝石", "10": "欧泊", "11": "黄玉", "12": "绿松石" }; return { stone: t[a.m] }; } });
calcTool({ file: "util-wind-chill.html", title: "风寒指数", desc: "按气温与风速计算体感温度（风寒指数，℃）。", category: "util", tags: ["风寒", "体感", "天气"], order: 2548, fields: [{ id: "t", label: "气温 (°C)", type: "number", value: 0 }, { id: "v", label: "风速 (km/h)", type: "number", value: 20 }], outputs: [{ id: "wc", label: "体感温度 (°C)" }], compute: function (a) { if (a.v < 0) return { wc: "风速需非负" }; var vp = Math.pow(a.v, 0.16); return { wc: 13.12 + 0.6215 * a.t - 11.37 * vp + 0.3965 * a.t * vp }; } });
calcTool({ file: "util-heat-index.html", title: "酷热指数", desc: "按气温与相对湿度估算酷热指数（体感温度，℃）。", category: "util", tags: ["酷热", "体感", "天气"], order: 2549, fields: [{ id: "t", label: "气温 (°C)", type: "number", value: 30 }, { id: "rh", label: "相对湿度 (%)", type: "number", value: 70 }], outputs: [{ id: "hi", label: "酷热指数 (°C)" }], compute: function (a) { var Tf = a.t * 9 / 5 + 32; var HI; if (Tf < 80) { HI = Tf; } else { HI = -42.379 + 2.04901523 * Tf + 10.14333127 * a.rh - 0.22475541 * Tf * a.rh - 0.00683783 * Tf * Tf - 0.05481717 * a.rh * a.rh + 0.00122874 * Tf * Tf * a.rh + 0.00085282 * Tf * a.rh * a.rh - 0.00000199 * Tf * Tf * a.rh * a.rh; if (a.rh < 13 && Tf >= 80 && Tf <= 112) HI -= ((13 - a.rh) / 4) * Math.sqrt((17 - Math.abs(Tf - 95)) / 17); } return { hi: (HI - 32) * 5 / 9 }; } });
calcTool({ file: "util-dew-point.html", title: "露点温度", desc: "按气温与相对湿度估算露点温度（℃）。", category: "util", tags: ["露点", "湿度", "天气"], order: 2550, fields: [{ id: "t", label: "气温 (°C)", type: "number", value: 25 }, { id: "rh", label: "相对湿度 (%)", type: "number", value: 60 }], outputs: [{ id: "dp", label: "露点 (°C)" }], compute: function (a) { var a0 = 17.27, b0 = 237.7; var g = Math.log(a.rh / 100) + a0 * a.t / (b0 + a.t); return { dp: b0 * g / (a0 - g) }; } });

// ---------- 写出 ----------
mkdirSync(toolsDir, { recursive: true });
let count = 0;
for (const t of TOOLS) {
  writeFileSync(join(toolsDir, t.file), page(t.meta, t.body, t.script, t.style));
  count++;
}
console.log("生成工具文件：" + count);
