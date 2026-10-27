/* 工具页公共脚本：构建时内联进每个工具 */
(function () {
  "use strict";

  var root = document.documentElement;
  var KEY = "pht-theme";

  function readStored() {
    try {
      var v = localStorage.getItem(KEY);
      return v === "light" || v === "dark" ? v : null;
    } catch (e) {
      return null;
    }
  }

  function setTheme(theme, persist) {
    root.setAttribute("data-theme", theme);
    var btn = document.querySelector("[data-theme-toggle]");
    if (btn) {
      btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      btn.setAttribute("aria-label", theme === "dark" ? "切换到浅色主题" : "切换到深色主题");
      btn.setAttribute("title", theme === "dark" ? "切换到浅色主题" : "切换到深色主题");
    }
    if (persist) {
      try {
        localStorage.setItem(KEY, theme);
      } catch (e) {
        /* 忽略私有模式写入失败 */
      }
    }
  }

  setTheme(root.getAttribute("data-theme") === "dark" ? "dark" : "light", false);

  var toggle = document.querySelector("[data-theme-toggle]");
  if (toggle) {
    toggle.addEventListener("click", function () {
      setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark", true);
    });
  }

  if (window.matchMedia) {
    var media = window.matchMedia("(prefers-color-scheme: dark)");
    var onChange = function (e) {
      if (!readStored()) setTheme(e.matches ? "dark" : "light", false);
    };
    if (media.addEventListener) media.addEventListener("change", onChange);
    else if (media.addListener) media.addListener(onChange);
  }

  function legacyCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    var ok = false;
    try {
      ta.select();
      ta.setSelectionRange(0, ta.value.length);
      ok = document.execCommand("copy");
    } catch (e) {
      ok = false;
    }
    document.body.removeChild(ta);
    return ok;
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(
        function () {
          return true;
        },
        function () {
          return legacyCopy(text);
        }
      );
    }
    return Promise.resolve(legacyCopy(text));
  }

  function flash(btn, label) {
    if (!btn) return;
    if (!btn.__label) btn.__label = btn.innerHTML;
    btn.textContent = label || "已复制";
    clearTimeout(btn.__flashTimer);
    btn.__flashTimer = setTimeout(function () {
      btn.innerHTML = btn.__label;
    }, 1400);
  }

  function setStatus(el, text, type) {
    if (!el) return;
    el.textContent = text || "";
    el.classList.remove("error", "ok");
    if (type === "error" || type === "ok") el.classList.add(type);
  }

  function download(filename, data, mime) {
    var blob = data instanceof Blob ? data : new Blob([data], { type: mime || "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  function bytes(n) {
    if (!isFinite(n) || n < 0) return "-";
    var units = ["B", "KB", "MB", "GB"];
    var i = 0;
    while (n >= 1024 && i < units.length - 1) {
      n /= 1024;
      i++;
    }
    return (i === 0 ? n : n.toFixed(n >= 100 ? 0 : 1)) + " " + units[i];
  }

  function debounce(fn, wait) {
    var t;
    return function () {
      var args = arguments;
      var ctx = this;
      clearTimeout(t);
      t = setTimeout(function () {
        fn.apply(ctx, args);
      }, wait);
    };
  }

  window.PHT = {
    $: function (sel, scope) {
      return (scope || document).querySelector(sel);
    },
    $$: function (sel, scope) {
      return Array.prototype.slice.call((scope || document).querySelectorAll(sel));
    },
    copy: copyText,
    flash: flash,
    status: setStatus,
    download: download,
    bytes: bytes,
    debounce: debounce,
    setTheme: setTheme
  };
})();
