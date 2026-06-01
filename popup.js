/* Texty popup — enable/disable toggle */

const toggle = document.getElementById("toggle");
const statusLabel = document.querySelector(".status-label");

// Load stored state
chrome.storage.local.get("enabled", ({ enabled }) => {
  const isEnabled = enabled !== false;
  toggle.checked = isEnabled;
  statusLabel.textContent = isEnabled ? "Enabled" : "Disabled";
});

// Persist toggle changes
toggle.addEventListener("change", () => {
  const isEnabled = toggle.checked;
  chrome.storage.local.set({ enabled: isEnabled });
  statusLabel.textContent = isEnabled ? "Enabled" : "Disabled";

  // Notify the active tab if it has the content script loaded
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]?.id) return;
    chrome.tabs.sendMessage(tabs[0].id, { type: "texty-toggle", enabled: isEnabled })
      .catch(() => {
        // Tab doesn't have content script (e.g. chrome:// page) — that's fine,
        // the stored state will be read on the next page load.
      });
  });
});
