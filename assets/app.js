/* Data Engineering Design Patterns — Reader app */

(function () {
  "use strict";

  /* ---------- Document manifest ---------- */
  var DOCS = [
    { path: "SKILL.md", title: "Overview", desc: "Core frameworks & mental models", group: "Overview" },
    { path: "cheatsheet.md", title: "Cheatsheet", desc: "Decision rules & trade-offs", group: "Reference" },
    { path: "patterns.md", title: "Patterns", desc: "All 68 design patterns", group: "Reference" },
    { path: "glossary.md", title: "Glossary", desc: "Key terms & definitions", group: "Reference" },
    { path: "chapters/ch01-introducing-design-patterns.md", title: "Introducing Data Engineering Design Patterns", num: "1", group: "Chapters" },
    { path: "chapters/ch02-data-ingestion.md", title: "Data Ingestion Design Patterns", num: "2", group: "Chapters" },
    { path: "chapters/ch03-error-management.md", title: "Error Management Design Patterns", num: "3", group: "Chapters" },
    { path: "chapters/ch04-idempotency.md", title: "Idempotency Design Patterns", num: "4", group: "Chapters" },
    { path: "chapters/ch05-data-value.md", title: "Data Value Design Patterns", num: "5", group: "Chapters" },
    { path: "chapters/ch06-data-flow.md", title: "Data Flow Design Patterns", num: "6", group: "Chapters" },
    { path: "chapters/ch07-data-security.md", title: "Data Security Design Patterns", num: "7", group: "Chapters" },
    { path: "chapters/ch08-data-storage.md", title: "Data Storage Design Patterns", num: "8", group: "Chapters" },
    { path: "chapters/ch09-data-quality.md", title: "Data Quality Design Patterns", num: "9", group: "Chapters" },
    { path: "chapters/ch10-data-observability.md", title: "Data Observability Design Patterns", num: "10", group: "Chapters" }
  ];

  var byPath = {};
  DOCS.forEach(function (d) { byPath[d.path] = d; });

  var DEFAULT_PATH = "SKILL.md";

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

  /* ---------- Markdown setup ---------- */
  var slugify = function (text) {
    return text
      .toLowerCase()
      .replace(/[^\w\u00C0-\u024F\u4e00-\u9fff]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section";
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

  marked.setOptions({
    renderer: renderer,
    gfm: true,
    breaks: false
  });

  var stripFrontmatter = function (raw) {
    var m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
    return m ? raw.slice(m[0].length) : raw;
  };

  /* ---------- Rendering ---------- */
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
    if (window.scrollY > 0 || !location.hash) window.scrollTo(0, 0);
  };

  var buildToc = function () {
    var heads = docEl.querySelectorAll("h2, h3");
    tocNav.innerHTML = "";
    if (!heads.length) {
      tocEl.style.display = "none";
      return;
    }
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
    home.textContent = "Reader";
    crumbsEl.appendChild(home);
    var sep = document.createElement("span");
    sep.textContent = "/";
    crumbsEl.appendChild(sep);
    var b = document.createElement("b");
    b.textContent = d.group === "Chapters" ? "Chapter " + d.num : d.title;
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
    var dirLabel = dir === "prev" ? "← Previous" : "Next →";
    var label = d.group === "Chapters" ? "Ch " + d.num + " · " + d.title : d.title;
    a.innerHTML = '<span class="dir">' + dirLabel + '</span><span class="label">' + label + "</span>";
    return a;
  };

  /* ---------- Sidebar ---------- */
  var buildNav = function (filter) {
    navEl.innerHTML = "";
    var groups = ["Overview", "Reference", "Chapters"];
    groups.forEach(function (g) {
      var items = DOCS.filter(function (d) {
        return d.group === g && (!filter || matches(d, filter));
      });
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
        t.textContent = d.group === "Chapters" ? d.title : d.title;
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
    var hay = (d.title + " " + d.desc + " " + d.path).toLowerCase();
    return hay.indexOf(q) >= 0;
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
    if (!h) return { path: DEFAULT_PATH, anchor: null };
    if (!byPath[h]) return { path: DEFAULT_PATH, anchor: null };
    return { path: h, anchor: anchor };
  };

  var load = function () {
    var r = parseHash();
    fetch(r.path)
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

  /* ---------- Global link interception (anchor + .md in rendered HTML) ---------- */
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
      return;
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
  var closeSidebar = function () {
    sidebarEl.classList.remove("open");
    scrimEl.classList.remove("show");
  };
  menuBtn.addEventListener("click", function () {
    sidebarEl.classList.toggle("open");
    scrimEl.classList.toggle("show");
  });
  scrimEl.addEventListener("click", closeSidebar);

  /* ---------- Init ---------- */
  var savedTheme = "light";
  try { savedTheme = localStorage.getItem("mdv-theme") || "light"; } catch (e) {}
  applyTheme(savedTheme);
  buildNav("");
  load();
})();
