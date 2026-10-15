// Mirrors the saved settings onto <html> as data attributes; focus.css does
// the actual hiding. Wrapped in a function so the file can be injected into a
// tab more than once (see background.js) without redeclaring anything.
(() => {
	const ATTRIBUTES = {
		focusMode: "data-ytfm-focus-mode",
		hideComments: "data-ytfm-hide-comments",
		hideSuggested: "data-ytfm-hide-suggested",
		hideSidebar: "data-ytfm-hide-sidebar",
		hideRecommendations: "data-ytfm-hide-recommendations",
		hideVideoDetails: "data-ytfm-hide-details",
		hideSearchBar: "data-ytfm-hide-search",
	};

	const root = document.documentElement;

	function apply(settings) {
		for (const [key, attribute] of Object.entries(ATTRIBUTES)) {
			if (!(key in settings)) continue;
			root.toggleAttribute(attribute, Boolean(settings[key]));
		}
	}

	// Initial state. Keys that were never saved count as "off".
	chrome.storage.local.get(Object.keys(ATTRIBUTES), (saved) => {
		const settings = {};
		for (const key of Object.keys(ATTRIBUTES)) settings[key] = saved[key];
		apply(settings);
	});

	// The popup and the keyboard shortcut both just write to storage, so every
	// open YouTube tab picks up changes here without any messaging.
	chrome.storage.onChanged.addListener((changes, area) => {
		if (area !== "local") return;
		const updated = {};
		for (const key of Object.keys(ATTRIBUTES)) {
			if (key in changes) updated[key] = changes[key].newValue;
		}
		apply(updated);
	});
})();
