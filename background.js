chrome.commands.onCommand.addListener((command) => {
    if (command === "toggle-focus-mode") {
        // Get current state
        chrome.storage.local.get(['focusMode'], (result) => {
            const newState = !result.focusMode;
            
            // Save new state
            chrome.storage.local.set({ focusMode: newState });
            
            // Update all YouTube tabs
            chrome.tabs.query({url: "*://*.youtube.com/watch*"}, (tabs) => {
                tabs.forEach(tab => {
                    chrome.tabs.sendMessage(tab.id, { focusMode: newState });
                });
            });
        });
    }
});
