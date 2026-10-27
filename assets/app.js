/* 纯 HTML 工具箱 - 首页交互 */
(function () {
  "use strict";

  var root = document.documentElement;
  var STORE_KEY = "pht-theme";
  var themeBtn = document.getElementById("themeToggle");
  var media = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  function storedTheme() {
    try {
      var v = localStorage.getItem(STORE_KEY);
      return v === "light" || v === "dark" ? v : null;
    } catch (e) {
      return null;
    }
  }

  function applyTheme(theme, persist) {
    root.setAttribute("data-theme", theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#0b0e12" : "#f6f5f1");
    if (themeBtn) {
      themeBtn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      themeBtn.setAttribute("aria-label", theme === "dark" ? "切换到浅色主题" : "切换到深色主题");
    }
    if (persist) {
      try {
        localStorage.setItem(STORE_KEY, theme);
      } catch (e) {
        /* 隐私模式下忽略 */
      }
    }
  }

  applyTheme(root.getAttribute("data-theme") === "dark" ? "dark" : "light", false);

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next, true);
    });
  }

  if (media) {
    var onSchemeChange = function (e) {
      if (!storedTheme()) applyTheme(e.matches ? "dark" : "light", false);
    };
    if (media.addEventListener) media.addEventListener("change", onSchemeChange);
    else if (media.addListener) media.addListener(onSchemeChange);
  }

  var grid = document.getElementById("toolGrid");
  if (!grid) return;

  var cards = Array.prototype.slice.call(grid.querySelectorAll(".card"));
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var input = document.getElementById("toolSearch");
  var empty = document.getElementById("emptyState");
  var note = document.getElementById("resultNote");
  var clearBtn = document.getElementById("clearSearch");
  var activeCat = "all";

  function normalize(text) {
    return (text || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function cardText(card) {
    if (!card.__haystack) card.__haystack = normalize(card.getAttribute("data-search"));
    return card.__haystack;
  }

  function matchesQuery(card, tokens) {
    var hay = cardText(card);
    for (var i = 0; i < tokens.length; i++) {
      if (hay.indexOf(tokens[i]) === -1) return false;
    }
    return true;
  }

  function updateUrl() {
    var q = input ? input.value.trim() : "";
    if (!window.history || !window.history.replaceState) return;
    var params = new URLSearchParams();
    if (q) params.set("q", q);
    if (activeCat !== "all") params.set("cat", activeCat);
    var query = params.toString();
    var url = window.location.pathname + (query ? "?" + query : "") + window.location.hash;
    try {
      window.history.replaceState(null, "", url);
    } catch (e) {
      /* file:// 下可能失败，忽略 */
    }
  }

  function render() {
    var tokens = normalize(input ? input.value : "").split(" ").filter(Boolean);
    var visible = 0;

    cards.forEach(function (card) {
      var ok = (activeCat === "all" || card.getAttribute("data-cat") === activeCat) && matchesQuery(card, tokens);
      card.classList.toggle("is-hidden", !ok);
      if (ok) visible++;
    });

    chips.forEach(function (chip) {
      chip.setAttribute("aria-pressed", chip.getAttribute("data-cat") === activeCat ? "true" : "false");
    });

    if (empty) empty.classList.toggle("is-visible", visible === 0);
    if (note) {
      if (tokens.length || activeCat !== "all") {
        note.textContent = "找到 " + visible + " 个工具";
        note.hidden = false;
      } else {
        note.textContent = "";
        note.hidden = true;
      }
    }
    if (clearBtn) clearBtn.hidden = !(input && input.value);
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      activeCat = chip.getAttribute("data-cat") || "all";
      render();
      updateUrl();
    });
  });

  if (input) {
    input.addEventListener("input", function () {
      render();
      updateUrl();
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        input.value = "";
        activeCat = "all";
        render();
        updateUrl();
        input.blur();
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      if (input) input.value = "";
      activeCat = "all";
      render();
      updateUrl();
      if (input) input.focus();
    });
  }

  document.addEventListener("keydown", function (e) {
    var tag = (e.target && e.target.tagName) || "";
    var typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (e.target && e.target.isContentEditable);
    if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      if (input) input.focus();
    }
  });

  // 支持从搜索参数恢复筛选状态
  try {
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    var cat = params.get("cat");
    if (q && input) input.value = q;
    if (cat && chips.some(function (c) { return c.getAttribute("data-cat") === cat; })) activeCat = cat;
    root.setAttribute("data-ready", "true");
  } catch (e) {
    /* 忽略 */
  }

  render();
})();
