# Texty

Typography inspection layer for the web.

Texty reveals the typography truth of any text element — font, size, weight, line-height, color, spacing — instantly, without opening DevTools.

## Philosophy

The browser already knows everything about a piece of text. It knows the font, the size, the line height, the color, the spacing. Yet discovering this information requires opening developer tools, navigating panels, inspecting nodes, and translating implementation details into design information.

Texty exists because developers should not have to open DevTools for typography.

### The Truth Principle

Texty reveals. Texty does not interpret, invent, or speculate.

If the browser reports `font-size: 16px`, Texty shows `font-size: 16px`. Not `text-base`. Not `probably text-base`. Raw truth always wins.

A fast wrong answer is a bug. A beautiful wrong answer is a bug.

## Features

- **Hover inspection** — hover any text to see its typography properties in a floating tooltip
- **Click to pin** — click text to pin the tooltip in place; stays pinned on scroll and resize
- **Per-property copy** — every property has a copy button that copies `property: value;`
- **Copy all** — single button to copy all properties at once
- **Viewport-aware** — tooltip automatically flips to stay within the viewport
- **No DevTools** — works on any page, no setup, no panels to open

## Installation

1. Clone the repository
2. Open `chrome://extensions` in Chrome (or `edge://extensions` in Edge)
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `texty` directory
5. Texty is now active on every page

## Usage

| Action | Result |
|---|---|
| Hover any text | Tooltip appears near cursor |
| Click text | Tooltip pins in place |
| Click again (anywhere) | Tooltip unpins |
| Click different text while pinned | Switches to new element |
| Press Escape | Dismisses pinned tooltip |
| Click copy icon (each row) | Copies `property: value;` |
| Click "Copy All" button | Copies all properties |

## Inspected Properties

Texty inspects the following computed CSS properties:

- `font-family` — primary font name
- `font-size` — computed pixel size
- `line-height` — computed pixel value
- `font-weight` — numeric weight (400, 500, 700, etc.)
- `letter-spacing` — computed spacing
- `color` — resolved hex color
- `text-transform` — shown when not `none`
- `text-decoration` — shown when not `none`
- `font-style` — shown when not `normal`
- `text-align` — shown when not `start`
- `word-spacing` — shown when not default

Properties at their default values are hidden to keep the tooltip focused.

## Development

```
texty/
  manifest.json        — Chrome MV3 manifest
  content-script.js    — Inspection logic (IIFE, no dependencies)
  tooltip.css          — Tooltip styles (CSS custom properties)
  icons/               — Extension icons (16, 48, 128)
```

No build step. No dependencies. Edit and reload.

## License

MIT

## Architecture

Texty is a single content script injected at `document_end`. It listens for hover and click events on the document, identifies the nearest inspectable text element, reads its computed CSS properties via `getComputedStyle`, and renders the results into a floating DOM node.

No frameworks. No build pipeline. Roughly 350 lines of vanilla JavaScript.

## Browser Support

Chrome 88+, Edge 88+, and any Chromium-based browser supporting Manifest V3. Firefox support requires minor adjustments to the manifest.

## Design Principles

- **Raw truth** — show computed values, never interpret or guess
- **Instant** — one action (hover or click) reveals everything
- **Copyable** — every property and the full payload are one click away from the clipboard
- **Unobtrusive** — zero-impact when not in use; no DOM mutations to the page

## Why Texty

Because opening DevTools to inspect typography is unnecessarily slow. The browser already knows everything about a piece of text. Texty surfaces that knowledge instantly, without panels, tabs, or hunting through the DOM tree.

## Edge Cases

- **Large containers** — elements spanning >90% of the viewport are skipped
- **Hidden elements** — `display:none`, `visibility:hidden`, and `opacity:0` elements are ignored
- **Input fields** — `<input>` and `<textarea>` are inspectable despite having no DOM text nodes
- **Viewport edges** — the tooltip auto-flips horizontally and vertically to stay visible

No build step. No dependencies. Edit the source files and reload the extension from `chrome://extensions`.

## Contributing

Texty is intentionally minimal. Before proposing a feature, ask: does it help answer "What is this text?" If not, it probably does not belong in Texty.
