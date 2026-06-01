/* Texty popup — enable/disable toggle */

const toggle = document.getElementById("toggle");
const statusLabel = document.querySelector(".status-label");

// Load stored state
chrome.storage.local.get("enabled", ({ enabled }) => {
  const isEnabled = enabled !== false; // default true
  toggle.checked = isEnabled;
  statusLabel.textContent = isEnabled ? "Enabled" : "Disabled";
});

// Persist toggle changes
toggle.addEventListener("change", () => {
  const isEnabled = toggle.checked;
  chrome.storage.local.set({ enabled: isEnabled });
  statusLabel.textContent = isEnabled ? "Enabled" : "Disabled";

  // Notify active tabs to update
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, { type: "texty-toggle", enabled: isEnabled });
    }
  });
});
