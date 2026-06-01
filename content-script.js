/* Texty — Typography Inspection Layer
 * Injects a floating tooltip that reveals computed typography
 * properties on hover/click. No dependencies. */

(function () {
  "use strict";

  const COPY_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';

  const CHECK_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
  const COPYALL_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  const PROPERTIES = [
// key: camelCase CSSOM property, label: kebab-case display, transform: value mapper, hide: skip predicate
    {
      key: "fontFamily",
      label: "font-family",
      transform: (v) => v.split(",")[0].trim().replace(/^["']|["']$/g, ""),
    },
    { key: "fontSize", label: "font-size" },
    { key: "lineHeight", label: "line-height" },
    { key: "fontWeight", label: "font-weight" },
    { key: "letterSpacing", label: "letter-spacing" },
    {
      key: "color",
      label: "color",
      transform: rgbToHex,
    },
    {
      key: "textTransform",
      label: "text-transform",
      hide: (v) => v === "none",
    },
    {
      key: "textDecorationLine",
      label: "text-decoration",
      hide: (v) => v === "none",
    },
    {
      key: "fontStyle",
      label: "font-style",
      hide: (v) => v === "normal",
    },
    {
      key: "textAlign",
      label: "text-align",
      hide: (v) => v === "start",
    },
    {
      key: "wordSpacing",
      label: "word-spacing",
      hide: (v) => v === "0px" || v === "normal",
    },
  ];
  const HOVER_DELAY = 160;
  const TOOLTIP_GAP = 14;
  let tooltip = null;
  let hoverTimer = null;
  let pinnedEl = null;
  let currentEl = null;
  let lastMouseX = 0;
  let lastMouseY = 0;
  function init() {
    if (document.getElementById("texty-tooltip")) return;
    tooltip = buildTooltip();
    document.body.appendChild(tooltip);
    document.addEventListener("mouseover", onMouseOver, { passive: true }); // passive: never calls preventDefault
    document.addEventListener("mouseout", onMouseOut, { passive: true });
    document.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("click", onClick, { passive: true });
    document.addEventListener("keydown", onKeyDown, { passive: true });
  }

  function buildTooltip() {
    const el = document.createElement("div");
    el.id = "texty-tooltip";
    el.setAttribute("role", "tooltip");

    const rows = document.createElement("div");
    rows.className = "texty-rows";
    el.appendChild(rows);

    const divider = document.createElement("div");
    divider.className = "texty-divider";
    el.appendChild(divider);

    const copyAll = document.createElement("button");
    copyAll.className = "texty-copy-all";
    copyAll.innerHTML = `${COPYALL_ICON} Copy All`;
    copyAll.addEventListener("click", (e) => {
      e.stopPropagation();
      copyAllProperties();
    });
    el.appendChild(copyAll);

    el.addEventListener("click", (e) => e.stopPropagation());
    el.addEventListener("mousedown", (e) => e.stopPropagation());
    el.addEventListener("mouseleave", (e) => {
      if (pinnedEl) return;
      if (e.relatedTarget && currentEl && currentEl.contains(e.relatedTarget)) return;
      hideTooltip();
      currentEl = null;
    });
    return el;
  }
  function onMouseOver(e) {
    if (pinnedEl) return;
    const el = findTextElement(e.target);
    if (!el) return;
    currentEl = el;
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(() => {
      if (currentEl === el) showTooltip(el);
    }, HOVER_DELAY);
  }

  function onMouseOut(e) {
    if (pinnedEl) return;
    if (e.relatedTarget && e.relatedTarget.closest("#texty-tooltip")) return;
    const el = findTextElement(e.target);
    if (el && el === currentEl) {
      clearTimeout(hoverTimer);
      hideTooltip();
      currentEl = null;
    }
  }

  function onMouseMove(e) {
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    if (tooltip.classList.contains("texty-visible") && !pinnedEl) {
      positionTooltip(e.clientX, e.clientY);
    }
  }

  function onClick(e) {
    if (e.target.closest("#texty-tooltip")) return;

    if (pinnedEl) {
      unpin();
      const newEl = findTextElement(e.target);
      if (newEl) {
        currentEl = newEl;
        showTooltip(newEl);
        pin(newEl, e.clientX, e.clientY);
      }
      return;
    }

    const el = findTextElement(e.target);
    if (!el) return;

    if (currentEl === el && tooltip.classList.contains("texty-visible")) {
      pin(el, e.clientX, e.clientY);
      return;
    }

    clearTimeout(hoverTimer);
    currentEl = el;
    showTooltip(el);
    pin(el, e.clientX, e.clientY);
  }

  function onKeyDown(e) {
    if (e.key === "Escape" && pinnedEl) {
      unpin();
      hideTooltip();
    }
  }
  function pin(el, x, y) {
    pinnedEl = el;
    currentEl = el;
    positionTooltip(x, y);
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("scroll", onResize, { passive: true });
  }

  function unpin() {
    pinnedEl = null;
    window.removeEventListener("resize", onResize);
    window.removeEventListener("scroll", onResize);
    hideTooltip();
  }

  function onResize() {
    if (pinnedEl) positionTooltipPinned();
  }

  function findTextElement(el) {
    // Elements never inspected — structural, media, or programmatic only
    const BLOCK = new Set([
      "HTML","BODY","HEAD","SCRIPT","STYLE","NOSCRIPT",
      "IFRAME","OBJECT","EMBED","SVG","CANVAS","VIDEO","AUDIO","TEMPLATE",
    ]);
    let node = el;
    while (node && node !== document.documentElement) {
      const tag = node.tagName;
      if (!tag || BLOCK.has(tag)) return null;
      if (node.id === "texty-tooltip") return null;
      const isInput = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      const hasText = hasDirectText(node);
      if ((hasText || isInput) && isInspectable(node)) return node;
      node = node.parentElement;
    }
    return null;
  }

  // Only count immediate text nodes — avoids matching text of deep descendants
  function hasDirectText(el) {
    for (const child of el.childNodes) {
      if (child.nodeType === Node.TEXT_NODE && child.textContent.trim()) return true;
    }
    return false;
  }

  // Filters out hidden, zero-size, and full-viewport containers
  function isInspectable(el) {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (rect.width > vw * 0.9 && rect.height > vh * 0.7) return false;
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") return false;
    if (parseFloat(style.opacity) === 0) return false;
    return true;
  }
  function showTooltip(el) {
    if (!tooltip) return;
    render(el);
    positionTooltip(lastMouseX, lastMouseY);
    tooltip.classList.add("texty-visible");
  }

  function hideTooltip() {
    if (pinnedEl) return;
    tooltip.classList.remove("texty-visible");
    currentEl = null;
  }

  function positionTooltip(cx, cy) {
    const rect = tooltip.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = cx + TOOLTIP_GAP;
    let top = cy + TOOLTIP_GAP;
    if (left + rect.width > vw - 8) left = cx - rect.width - TOOLTIP_GAP;
    if (left < 8) left = 8; // clamp to viewport edge
    if (top + rect.height > vh - 8) top = cy - rect.height - TOOLTIP_GAP;
    if (top < 8) top = 8;
    tooltip.style.left = left + "px";
    tooltip.style.top = top + "px";
  }

  function positionTooltipPinned() {
    if (!pinnedEl) return;
    const rect = pinnedEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    positionTooltip(cx, cy);
  }
  function render(el) {
    const style = getComputedStyle(el);
    const rows = tooltip.querySelector(".texty-rows");
    rows.innerHTML = "";

    const visible = [];
    for (const prop of PROPERTIES) {
      let value = style[prop.key];
      if (!value) continue;
      if (prop.hide && prop.hide(value, style)) continue;
      if (prop.transform) value = prop.transform(value);
      visible.push({ label: prop.label, value });
    }

    for (const { label, value } of visible) {
      const row = document.createElement("div");
      row.className = "texty-row";

      const labelEl = document.createElement("span");
      labelEl.className = "texty-label";
      labelEl.textContent = label + ":";

      const valueEl = document.createElement("span");
      valueEl.className = "texty-value";
      valueEl.textContent = value;
      valueEl.title = value;

      const copyBtn = document.createElement("button");
      copyBtn.className = "texty-copy";
      copyBtn.innerHTML = COPY_ICON;
      copyBtn.title = "Copy " + label;
      copyBtn.addEventListener("click", () => copySingle(label, value, copyBtn));

      row.appendChild(labelEl);
      row.appendChild(valueEl);
      row.appendChild(copyBtn);
      rows.appendChild(row);
    }

    // Store formatted payload for copy-all (avoids re-serializing)
    tooltip._payload = visible
      .map((p) => p.label + ": " + p.value + ";")
      .join("\n");
  }
  function rgbToHex(rgb) {
    const m = rgb.match(
      /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/
    );
    if (!m) return rgb;
    const r = parseInt(m[1], 10);
    const g = parseInt(m[2], 10);
    const b = parseInt(m[3], 10);
    const a = m[4] !== undefined ? parseFloat(m[4]) : 1;
    const hex = "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");
    if (a < 1) return hex + Math.round(a * 255).toString(16).padStart(2, "0");
    return hex;
  }

  function copySingle(label, value, btn) {
    const text = label + ": " + value + ";";
    navigator.clipboard.writeText(text).then(() => flash(btn));
  }

  function copyAllProperties() {
    if (!tooltip._payload) return;
    navigator.clipboard.writeText(tooltip._payload).then(() => {
      const btn = tooltip.querySelector(".texty-copy-all");
      const origHTML = btn.innerHTML;
      btn.innerHTML = `${CHECK_ICON} Copied`;
      btn.classList.add("texty-copied");
      setTimeout(() => {
        btn.innerHTML = origHTML;
        btn.classList.remove("texty-copied");
      }, 1400);
    });
  }

  function flash(btn) {
    const origHTML = btn.innerHTML;
    btn.innerHTML = CHECK_ICON;
    btn.classList.add("texty-copied");
    setTimeout(() => {
      btn.innerHTML = origHTML;
      btn.classList.remove("texty-copied");
    }, 900);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
  })();
