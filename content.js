// CSS for focus mode features
const focusCSS = `
  /* Hide Comments */
  body.yt-focus-hide-comments #comments,
  body.yt-focus-hide-comments ytd-comments {
    display: none !important;
  }

  /* Hide Suggested Videos / Sidebar */
  body.yt-focus-hide-suggested #related,
  body.yt-focus-hide-suggested #secondary,
  body.yt-focus-hide-suggested ytd-watch-next-secondary-results-renderer {
    display: none !important;
  }

  /* Hide Sidebar/Guide */
  body.yt-focus-hide-sidebar ytd-guide-renderer,
  body.yt-focus-hide-sidebar #guide {
    display: none !important;
  }

  /* Hide Recommendations / Home Feed */
  body.yt-focus-hide-recommendations ytd-browse[page-subtype="home"] #primary,
  body.yt-focus-hide-recommendations ytd-browse[page-subtype="home"] #contents {
    display: none !important;
  }
  
  /* Hide Merchandise / Products */
  body.yt-focus-hide-merch #merch-shelf,
  body.yt-focus-hide-merch ytd-merch-shelf-renderer {
      display: none !important;
  }

  /* Hide Video Details (Title, Views, Description, etc.) */
  body.yt-focus-hide-details #above-the-fold,
  body.yt-focus-hide-details #bottom-row,
  body.yt-focus-hide-details ytd-watch-metadata,
  body.yt-focus-hide-details #info-contents,
  body.yt-focus-hide-details #meta {
      display: none !important;
  }

  /* Hide Search Bar */
  body.yt-focus-hide-search #masthead-container #center,
  body.yt-focus-hide-search ytd-masthead #center {
      visibility: hidden !important;
      opacity: 0 !important;
  }

  /* Focus Mode (Master) - Hides header and info completely */
  body.yt-focus-mode #masthead-container, 
  body.yt-focus-mode #info-container,
  body.yt-focus-mode #menu-container,
  body.yt-focus-mode .ytd-video-primary-info-renderer,
  body.yt-focus-mode .ytd-video-secondary-info-renderer {
     display: none !important;
  }
`;

// Create style tag once
const styleTag = document.createElement("style");
styleTag.textContent = focusCSS;

// Helper to toggle classes
function updateFocusState(settings) {
	if (!document.head.contains(styleTag)) {
		document.head.appendChild(styleTag);
	}

	const body = document.body;

	// Toggle classes based on settings
	if (settings.hideComments) body.classList.add("yt-focus-hide-comments");
	else body.classList.remove("yt-focus-hide-comments");

	if (settings.hideSuggested) body.classList.add("yt-focus-hide-suggested");
	else body.classList.remove("yt-focus-hide-suggested");

	if (settings.hideSidebar) body.classList.add("yt-focus-hide-sidebar");
	else body.classList.remove("yt-focus-hide-sidebar");

	if (settings.hideRecommendations)
		body.classList.add("yt-focus-hide-recommendations");
	else body.classList.remove("yt-focus-hide-recommendations");

	if (settings.hideVideoDetails) body.classList.add("yt-focus-hide-details");
	else body.classList.remove("yt-focus-hide-details");

	if (settings.hideSearchBar) body.classList.add("yt-focus-hide-search");
	else body.classList.remove("yt-focus-hide-search");

	if (settings.focusMode) body.classList.add("yt-focus-mode");
	else body.classList.remove("yt-focus-mode");
}

// Apply CSS when state changes
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	try {
		if (message.type === "UPDATE_SETTINGS") {
			console.log("Updating focus settings:", message.settings);
			updateFocusState(message.settings);
		}
		sendResponse({ success: true });
	} catch (error) {
		console.error("Error:", error);
		sendResponse({ success: false, error: error.message });
	}
	return true;
});

// Check initial state
chrome.storage.local.get(
	[
		"focusMode",
		"hideComments",
		"hideSuggested",
		"hideSidebar",
		"hideRecommendations",
		"hideVideoDetails",
		"hideSearchBar",
	],
	(result) => {
		console.log("Initial settings:", result);
		// Default to false if undefined, but maybe we want defaults?
		// For now, respect what is in storage.
		updateFocusState(result);
	}
);
