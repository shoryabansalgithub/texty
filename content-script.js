/* Texty — Typography Inspection Layer */

(function () {
  "use strict";

  const COPY_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';

  const CHECK_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
  const PROPERTIES = [
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
  const HOVER_DELAY = 180;
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
    document.addEventListener("mouseover", onMouseOver, { passive: true });
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
    copyAll.innerHTML = `${COPY_ICON} Copy All`;
    copyAll.addEventListener("click", (e) => {
      e.stopPropagation();
      copyAllProperties();
    });
    el.appendChild(copyAll);

    el.addEventListener("click", (e) => e.stopPropagation());
    el.addEventListener("mousedown", (e) => e.stopPropagation());

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
  })();
