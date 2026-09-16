/* Generic markdown reader — driven by window.BOOK_CONFIG
 *
 * window.BOOK_CONFIG = {
 *   title:    "Book Title",
 *   subtitle: "Author",
 *   meta:     "small footer text",        // optional
 *   source:   "https://...",              // optional link in footer
 *   base:     ".",                        // prefix for fetching docs
 *   docs: [
 *     { path: "intro.md", title: "Overview", desc: "...", group: "Overview" },
 *     { path: "ch/ch01.md", title: "Ch 1", num: "1", group: "Chapters" }
 *   ]
 * };
 */

(function () {
  "use strict";

  var CFG = window.BOOK_CONFIG || { title: "Reader", docs: [] };
  var DOCS = CFG.docs || [];
  var DEFAULT_PATH = DOCS.length ? DOCS[0].path : null;
  var BASE = CFG.base || ".";

  var byPath = {};
  DOCS.forEach(function (d) { byPath[d.path] = d; });

  /* ---------- Build shell ---------- */
  var SHELL =
    '<div class="app">' +
      '<aside class="sidebar" id="sidebar">' +
        '<div class="sidebar-brand">' +
          '<div class="brand-mark">DE</div>' +
          '<div class="brand-text">' +
            '<span class="brand-title"></span>' +
            '<span class="brand-sub"></span>' +
          '</div>' +
        '</div>' +
        '<div class="search-wrap">' +
          '<input type="search" id="search" placeholder="Filter documents…" autocomplete="off" spellcheck="false" />' +
        '</div>' +
        '<nav class="nav" id="nav" aria-label="Documents"></nav>' +
        '<div class="sidebar-foot">' +
          '<span class="foot-meta"></span>' +
          '<span class="foot-links">' +
            '<a class="foot-home">Home</a>' +
            '<a class="foot-source" target="_blank" rel="noopener">Source</a>' +
          '</span>' +
        '</div>' +
      '</aside>' +
      '<div class="scrim" id="scrim"></div>' +
      '<main class="main">' +
        '<header class="topbar">' +
          '<button class="menu-btn" id="menuBtn" aria-label="Toggle navigation"><span></span><span></span><span></span></button>' +
          '<div class="crumbs" id="crumbs"></div>' +
          '<div class="topbar-actions">' +
            '<button class="icon-btn toc-toggle" id="tocBtn" aria-label="On this page" title="On this page">TOC</button>' +
            '<button class="icon-btn" id="themeBtn" aria-label="Toggle theme" title="Toggle theme"></button>' +
          '</div>' +
        '</header>' +
        '<div class="content-area">' +
          '<article class="doc" id="doc"><div class="loading">Loading…</div></article>' +
          '<aside class="toc" id="toc" aria-label="On this page"><div class="toc-title">On this page</div><nav id="tocNav"></nav></aside>' +
        '</div>' +
        '<footer class="doc-foot" id="docFoot"></footer>' +
      '</main>' +
    '</div>';

  document.body.insertAdjacentHTML("beforeend", SHELL);

  document.title = CFG.title + " — Reader";
  var brandTitle = document.querySelector(".sidebar-brand .brand-title");
  var brandSub = document.querySelector(".sidebar-brand .brand-sub");
  var brandMark = document.querySelector(".brand-mark");
  var footMeta = document.querySelector(".sidebar-foot .foot-meta");
  var footSource = document.querySelector(".sidebar-foot .foot-source");
  var footHome = document.querySelector(".sidebar-foot .foot-home");
  if (brandTitle) brandTitle.textContent = CFG.title || "Reader";
  if (brandSub) brandSub.textContent = CFG.subtitle || "";
  if (brandMark) brandMark.textContent = initials(CFG.title || "R");
  if (footMeta) footMeta.textContent = CFG.meta || "";
  if (footHome) {
    if (CFG.home) { footHome.href = CFG.home; }
    else { footHome.style.display = "none"; }
  }
  if (footSource) {
    if (CFG.source) { footSource.href = CFG.source; footSource.style.display = ""; }
    else { footSource.style.display = "none"; }
  }

  function initials(t) {
    var w = (t || "").trim().split(/\s+/).filter(Boolean);
    if (!w.length) return "R";
    var s = w.map(function (x) { return x.charAt(0); }).join("").toUpperCase();
    return s.length > 2 ? s.slice(0, 2) : s;
  }

  /* ---------- Elements ---------- */
  var navEl = document.getElementById("nav");
  var docEl = document.getElementById("doc");
  var tocNav = document.getElementById("tocNav");
  var tocEl = document.getElementById("toc");
  var crumbsEl = document.getElementById("crumbs");
  var footEl = document.getElementById("docFoot");
  var searchEl = document.getElementById("search");
  var sidebarEl = document.getElementById("sidebar");
  var scrimEl = document.getElementById("scrim");
  var menuBtn = document.getElementById("menuBtn");
  var themeBtn = document.getElementById("themeBtn");
  var tocBtn = document.getElementById("tocBtn");

  /* ---------- Markdown setup ---------- */
  var slugify = function (text) {
    return text.toLowerCase().replace(/[^\w\u00C0-\u024F\u4e00-\u9fff]+/g, "-").replace(/^-+|-+$/g, "") || "section";
  };

  var renderer = new marked.Renderer();
  renderer.heading = function (text, level) {
    var id = slugify(text.replace(/<[^>]*>/g, ""));
    return '<h' + level + ' id="' + id + '">' + text + '</h' + level + '>';
  };

  var currentPath = null;

  var resolveRel = function (basePath, href) {
    var dir = basePath.indexOf("/") >= 0 ? basePath.slice(0, basePath.lastIndexOf("/") + 1) : "";
    var parts = (dir + href).split("/");
    var out = [];
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      if (p === "" || p === ".") continue;
      if (p === "..") { out.pop(); continue; }
      out.push(p);
    }
    return out.join("/");
  };

  renderer.link = function (href, title, text) {
    var target = "";
    if (!href) return "<a>" + text + "</a>";
    if (/^https?:\/\//i.test(href) || /^mailto:/i.test(href)) {
      target = ' target="_blank" rel="noopener"';
    } else if (href.charAt(0) === "#") {
      return '<a href="#' + href.slice(1) + '" data-anchor="' + href.slice(1) + '"' + (title ? ' title="' + title + '"' : "") + ">" + text + "</a>";
    } else {
      var resolved = resolveRel(currentPath, href);
      var anchor = "";
      if (resolved.indexOf("#") >= 0) {
        var sp = resolved.split("#");
        resolved = sp[0];
        anchor = sp[1];
      }
      var hash = "#/" + resolved;
      if (anchor) hash = hash + "@" + anchor;
      href = hash;
    }
    return '<a href="' + href + '"' + (title ? ' title="' + title + '"' : "") + target + ">" + text + "</a>";
  };

  marked.setOptions({ renderer: renderer, gfm: true, breaks: false });

  /* ---------- Rendering ---------- */
  var stripFrontmatter = function (raw) {
    var m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
    return m ? raw.slice(m[0].length) : raw;
  };

  var render = function (path, raw) {
    currentPath = path;
    docEl.innerHTML = marked.parse(stripFrontmatter(raw));
    docEl.querySelectorAll("pre code").forEach(function (block) {
      try { hljs.highlightElement(block); } catch (e) {}
    });
    buildToc();
    updateCrumb(path);
    updateFoot(path);
    updateSidebarActive(path);
    if (window.scrollY > 0) window.scrollTo(0, 0);
  };

  var buildToc = function () {
    var heads = docEl.querySelectorAll("h2, h3");
    tocNav.innerHTML = "";
    if (!heads.length) { tocEl.style.display = "none"; return; }
    tocEl.style.display = "";
    heads.forEach(function (h) {
      var a = document.createElement("a");
      a.href = "#" + h.id;
      a.textContent = h.textContent;
      a.setAttribute("data-target", h.id);
      if (h.tagName === "H3") a.className = "lvl3";
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var t = document.getElementById(h.id);
        if (t) t.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", "#/" + currentPath + "@" + h.id);
        closeDrawers();
      });
      tocNav.appendChild(a);
    });
    observeHeadings();
  };

  var activeTocLink = null;
  var observeHeadings = function () {
    var heads = docEl.querySelectorAll("h2, h3");
    if (!heads.length) return;
    var map = {};
    tocNav.querySelectorAll("a").forEach(function (a) { map[a.getAttribute("data-target")] = a; });
    if (window._headingObserver) window._headingObserver.disconnect();
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          if (activeTocLink) activeTocLink.classList.remove("active");
          activeTocLink = map[en.target.id];
          if (activeTocLink) activeTocLink.classList.add("active");
        }
      });
    }, { rootMargin: "-80px 0px -70% 0px", threshold: 0 });
    heads.forEach(function (h) { obs.observe(h); });
    window._headingObserver = obs;
  };

  var updateCrumb = function (path) {
    var d = byPath[path];
    crumbsEl.innerHTML = "";
    if (!d) { crumbsEl.textContent = ""; return; }
    var home = document.createElement("span");
    home.textContent = CFG.title || "Reader";
    crumbsEl.appendChild(home);
    var sep = document.createElement("span");
    sep.textContent = "/";
    crumbsEl.appendChild(sep);
    var b = document.createElement("b");
    b.textContent = d.group === "Chapters" && d.num ? "Chapter " + d.num : d.title;
    crumbsEl.appendChild(b);
  };

  var updateFoot = function (path) {
    var idx = DOCS.findIndex(function (d) { return d.path === path; });
    var prev = idx > 0 ? DOCS[idx - 1] : null;
    var next = idx >= 0 && idx < DOCS.length - 1 ? DOCS[idx + 1] : null;
    footEl.innerHTML = "";
    footEl.appendChild(footLink(prev, "prev"));
    footEl.appendChild(footLink(next, "next"));
  };

  var footLink = function (d, dir) {
    var a = document.createElement("a");
    a.className = "foot-link " + dir;
    if (!d) { a.className += " disabled"; a.innerHTML = '<span class="dir">&nbsp;</span>'; return a; }
    a.href = "#/" + d.path;
    var label = d.group === "Chapters" && d.num ? "Ch " + d.num + " · " + d.title : d.title;
    a.innerHTML = '<span class="dir">' + (dir === "prev" ? "← Previous" : "Next →") + '</span><span class="label">' + label + "</span>";
    return a;
  };

  /* ---------- Sidebar ---------- */
  var buildNav = function (filter) {
    navEl.innerHTML = "";
    var seen = {};
    DOCS.forEach(function (d) { seen[d.group] = true; });
    Object.keys(seen).forEach(function (g) {
      var items = DOCS.filter(function (d) { return d.group === g && (!filter || matches(d, filter)); });
      if (!items.length) return;
      var wrap = document.createElement("div");
      wrap.className = "nav-group";
      var label = document.createElement("div");
      label.className = "nav-label";
      label.textContent = g;
      wrap.appendChild(label);
      items.forEach(function (d) {
        var a = document.createElement("a");
        a.className = "nav-item";
        a.href = "#/" + d.path;
        a.dataset.path = d.path;
        var t = document.createElement("span");
        t.textContent = d.title;
        a.appendChild(t);
        if (d.num) {
          var chip = document.createElement("span");
          chip.className = "chip";
          chip.textContent = d.num;
          a.appendChild(chip);
        } else if (d.desc) {
          a.title = d.desc;
        }
        wrap.appendChild(a);
      });
      navEl.appendChild(wrap);
    });
  };

  var matches = function (d, q) {
    q = q.toLowerCase();
    return (d.title + " " + d.desc + " " + d.path).toLowerCase().indexOf(q) >= 0;
  };

  var updateSidebarActive = function (path) {
    navEl.querySelectorAll(".nav-item").forEach(function (a) {
      a.classList.toggle("active", a.dataset.path === path);
    });
  };

  /* ---------- Routing ---------- */
  var parseHash = function () {
    var h = location.hash.replace(/^#\/?/, "");
    if (!h) return { path: DEFAULT_PATH, anchor: null };
    var anchor = null;
    if (h.indexOf("@") >= 0) {
      var sp = h.split("@");
      h = sp[0];
      anchor = sp[1];
    }
    if (!h || !byPath[h]) return { path: DEFAULT_PATH, anchor: null };
    return { path: h, anchor: anchor };
  };

  var load = function () {
    var r = parseHash();
    fetch(BASE + "/" + r.path)
      .then(function (res) {
        if (!res.ok) throw new Error("404 " + r.path);
        return res.text();
      })
      .then(function (raw) {
        render(r.path, raw);
        if (r.anchor) {
          setTimeout(function () {
            var el = document.getElementById(r.anchor);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 60);
        }
      })
      .catch(function (err) {
        docEl.innerHTML = '<h1>Not found</h1><p>' + err.message + "</p>";
      });
    closeSidebar();
  };

  /* ---------- Anchor interception ---------- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a");
    if (!a) return;
    if (a.hasAttribute("data-anchor")) {
      e.preventDefault();
      var el = document.getElementById(a.getAttribute("data-anchor"));
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", "#/" + currentPath + "@" + a.getAttribute("data-anchor"));
      }
    }
  });

  window.addEventListener("hashchange", load);

  /* ---------- Search ---------- */
  searchEl.addEventListener("input", function () {
    buildNav(searchEl.value.trim());
  });

  /* ---------- Theme ---------- */
  var applyTheme = function (t) {
    document.documentElement.setAttribute("data-theme", t);
    themeBtn.textContent = t === "dark" ? "☀" : "☾";
    try { localStorage.setItem("mdv-theme", t); } catch (e) {}
  };
  themeBtn.addEventListener("click", function () {
    var cur = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    applyTheme(cur === "dark" ? "light" : "dark");
  });

  /* ---------- Mobile ---------- */
  var closeDrawers = function () {
    sidebarEl.classList.remove("open");
    tocEl.classList.remove("open");
    scrimEl.classList.remove("show");
  };
  var closeSidebar = closeDrawers;
  menuBtn.addEventListener("click", function () {
    sidebarEl.classList.toggle("open");
    tocEl.classList.remove("open");
    if (sidebarEl.classList.contains("open") || tocEl.classList.contains("open")) scrimEl.classList.add("show");
    else scrimEl.classList.remove("show");
  });
  tocBtn.addEventListener("click", function () {
    tocEl.classList.toggle("open");
    sidebarEl.classList.remove("open");
    if (sidebarEl.classList.contains("open") || tocEl.classList.contains("open")) scrimEl.classList.add("show");
    else scrimEl.classList.remove("show");
  });
  scrimEl.addEventListener("click", closeDrawers);

  /* ---------- Init ---------- */
  var savedTheme = "light";
  try { savedTheme = localStorage.getItem("mdv-theme") || "light"; } catch (e) {}
  applyTheme(savedTheme);
  buildNav("");
  if (DEFAULT_PATH) load();
  else docEl.innerHTML = "<h1>Empty</h1><p>No documents configured.</p>";
})();
