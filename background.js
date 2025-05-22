chrome.commands.onCommand.addListener((command) => {
    if (command === "toggle-focus-mode") {
        chrome.storage.local.get(['focusMode'], (result) => {
            const newState = !result.focusMode;
            chrome.storage.local.set({ focusMode: newState });

            chrome.tabs.query({ url: "*://*.youtube.com/watch*" }, (tabs) => {
                tabs.forEach(tab => {
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        files: ["content.js"]
                    }, () => {
                        // Once injected, send the message
                        chrome.tabs.sendMessage(tab.id, { focusMode: newState });
                    });
                });
            });
        });
    }
});
