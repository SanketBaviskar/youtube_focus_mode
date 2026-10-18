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
		let changed = false;
		for (const [key, attribute] of Object.entries(ATTRIBUTES)) {
			if (!(key in settings)) continue;
			const on = Boolean(settings[key]);
			if (root.hasAttribute(attribute) === on) continue;
			root.toggleAttribute(attribute, on);
			changed = true;
		}
		if (changed) refreshPlayerSize();
	}

	// YouTube's player only re-measures itself when the window resizes, so
	// after the layout changes (for example the cinema view in focus.css) let
	// it know, or the video keeps its old size inside the new box.
	function refreshPlayerSize() {
		for (const delay of [50, 400]) {
			setTimeout(() => window.dispatchEvent(new Event("resize")), delay);
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

	// An earlier test build switched YouTube into theater mode for Hide
	// Suggested and recorded that under this key. If that happened, switch
	// theater mode back off once so the cinema view can take over.
	const OLD_THEATER_FLAG = "theaterSetByFocusMode";
	chrome.storage.local.get(OLD_THEATER_FLAG, (saved) => {
		if (!saved[OLD_THEATER_FLAG]) return;
		let tries = 0;
		const undoTheater = () => {
			if (location.pathname !== "/watch") return;
			const watch = document.querySelector("ytd-watch-flexy");
			const button = document.querySelector("#movie_player .ytp-size-button");
			if (!watch || !button) {
				if (++tries < 40) setTimeout(undoTheater, 250);
				return;
			}
			document.removeEventListener("yt-navigate-finish", undoTheater);
			chrome.storage.local.remove(OLD_THEATER_FLAG);
			if (watch.hasAttribute("theater")) button.click();
		};
		document.addEventListener("yt-navigate-finish", undoTheater);
		undoTheater();
	});
})();
