// CSS for focus mode
const focusCSS = `
  /* Hide main interface elements */
  #related, 
  #secondary, 
  #masthead-container, 
  #comments, 
  ytd-guide-renderer,
  ytd-player-overlay,
  ytd-live-chat-frame,
  #info-container,
  #container.ytd-searchbox,
  #end,
  #top-row,
  #owner,
  #menu-container,
  #info-contents,
  
  /* Remove the below section */
  #below,
  div#below.style-scope.ytd-watch-flexy,
  div#below.style-scope.ytd-watch-flexy.__web-inspector-hide-shortcut__ {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    height: 0 !important;
    overflow: hidden !important;
  }
    html, body {
    overflow: hidden !important;
  }
`;
// Create style tag once
const styleTag = document.createElement('style');
styleTag.textContent = focusCSS;

// Apply CSS when state changes
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    try {
        if (message.focusMode) {
            console.log('Enabling focus mode');
            if (!document.head.contains(styleTag)) {
                document.head.appendChild(styleTag);
            }
        } else {
            console.log('Disabling focus mode');
            if (document.head.contains(styleTag)) {
                document.head.removeChild(styleTag);
            }
        }
        sendResponse({success: true});
    } catch (error) {
        console.error('Error:', error);
        sendResponse({success: false, error: error.message});
    }
    return true; // Keep the message channel open for sendResponse
});

// Check initial state
chrome.storage.local.get(['focusMode'], (result) => {
    console.log('Initial focusMode state:', result.focusMode);
    if (result.focusMode) {
        if (!document.head.contains(styleTag)) {
            document.head.appendChild(styleTag);
        }
    }
});
