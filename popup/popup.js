document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('focusModeToggle');
    const label = document.getElementById('focusLabel');

    // Get the current state from storage
    chrome.storage.local.get(['focusMode'], (result) => {
        const isactive = result.focusMode || false;
        toggle.checked = isActive;
        label.textContent = isActive ? "Disable Focus Mode" : "Enable Focus Mode";
    });

    // Toggle focus mode on change
    toggle.addEventListener('change', () => {
        const isActive = toggle.checked;

        // Save state
        chrome.storage.local.set({ focusMode: isActive }, () => {
            try {
                chrome.tabs.query({ url: "*://*.youtube.com/watch*" }, (tabs) => {
                    tabs.forEach(tab => {
                        // Inject content script just in case it's not already loaded
                        chrome.scripting.executeScript({
                            target: { tabId: tab.id },
                            files: ["content.js"]
                        }, () => {
                            chrome.tabs.sendMessage(tab.id, { focusMode: isActive }).catch((err) => {
                                if (!err.message.includes("Could not establish connection")) {
                                    console.error('Error sending message to tab:', err);
                                }
                            });
                        });
                    });
                });
            } catch (e) {
                console.error('Error updating tabs:', e);
            }
        });
    });
});
});
