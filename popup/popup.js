document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('focusModeToggle');

    // Get the current state from storage
    chrome.storage.local.get(['focusMode'], (result) => {
        toggle.checked = result.focusMode || false;
    });

    // Toggle focus mode on change
    toggle.addEventListener('change', () => {
        const isActive = toggle.checked;

        // Save state
        chrome.storage.local.set({ focusMode: isActive });

        // Try to update all YouTube tabs
        try {
            if (chrome.tabs) {
                chrome.tabs.query({url: "*://*.youtube.com/*"}, (tabs) => {
                    tabs.forEach(tab => {
                        chrome.tabs.sendMessage(tab.id, { focusMode: isActive }).catch((err) => {
                            // Ignore "Could not establish connection" errors
                            if (!err.message.includes("Could not establish connection")) {
                                console.error('Error sending message to tab:', err);
                            }
                        });
                    });
                });
            } else {
                // Fallback: send a runtime message (content script should listen for this)
                chrome.runtime.sendMessage({ focusMode: isActive });
            }
        } catch (e) {
            console.error('Error updating tabs:', e);
        }
    });
});