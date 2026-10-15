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

	// Remembers that we (not the user) switched YouTube into theater mode, so
	// turning the filter off can switch it back. YouTube itself remembers
	// theater mode across page loads, so this has to survive reloads too.
	const THEATER_FLAG = "theaterSetByFocusMode";
	const SYNC_MARK = "data-ytfm-theater-sync";

	const root = document.documentElement;
	let wantTheater = false;
	let theaterIsOurs = false;
	let settingsLoaded = false;

	function apply(settings) {
		for (const [key, attribute] of Object.entries(ATTRIBUTES)) {
			if (!(key in settings)) continue;
			root.toggleAttribute(attribute, Boolean(settings[key]));
		}
		if ("hideSuggested" in settings) {
			wantTheater = Boolean(settings.hideSuggested);
			syncTheater();
		}
	}

	function setTheaterIsOurs(value) {
		theaterIsOurs = value;
		if (value) chrome.storage.local.set({ [THEATER_FLAG]: true });
		else chrome.storage.local.remove(THEATER_FLAG);
	}

	// With suggestions hidden, put the watch page in YouTube's own theater mode
	// so the video fills the window. Using YouTube's button (rather than
	// resizing the player with CSS) keeps working when YouTube rearranges the
	// page. At most one click per video and setting, so a layout we can't read
	// never makes us toggle back and forth.
	let handledKey = null;
	let retryTimer = null;

	function syncTheater() {
		clearTimeout(retryTimer);
		if (!settingsLoaded || location.pathname !== "/watch") return;
		const key = location.href + "|" + wantTheater;
		if (key === handledKey) return;

		let tries = 0;
		const attempt = () => {
			const watch = document.querySelector("ytd-watch-flexy");
			const button = document.querySelector("#movie_player .ytp-size-button");
			if (!watch || !button) {
				// The player builds its controls after the page shell loads.
				if (++tries < 40) retryTimer = setTimeout(attempt, 250);
				return;
			}
			handledKey = key;
			const inTheater = watch.hasAttribute("theater");
			const enter = wantTheater && !inTheater;
			const leave = !wantTheater && theaterIsOurs;
			if (!enter && !leave) return;

			// A second copy of this script can be running in the tab (it is
			// re-injected after an update). Whoever acts first records it on
			// <html>, which every copy can see, so the button is pressed once.
			const [lastWant, lastAt] = (root.getAttribute(SYNC_MARK) || "").split("|");
			if (lastWant === String(wantTheater) && Date.now() - Number(lastAt) < 2000) return;
			root.setAttribute(SYNC_MARK, `${wantTheater}|${Date.now()}`);

			if (enter) {
				button.click();
				setTheaterIsOurs(true);
			} else {
				if (inTheater) button.click();
				setTheaterIsOurs(false);
			}
		};
		attempt();
	}

	// Initial state. Keys that were never saved count as "off".
	chrome.storage.local.get([...Object.keys(ATTRIBUTES), THEATER_FLAG], (saved) => {
		theaterIsOurs = Boolean(saved[THEATER_FLAG]);
		settingsLoaded = true;
		const settings = {};
		for (const key of Object.keys(ATTRIBUTES)) settings[key] = saved[key];
		apply(settings);
	});

	// The popup and the keyboard shortcut both just write to storage, so every
	// open YouTube tab picks up changes here without any messaging.
	chrome.storage.onChanged.addListener((changes, area) => {
		if (area !== "local") return;
		if (THEATER_FLAG in changes) {
			theaterIsOurs = Boolean(changes[THEATER_FLAG].newValue);
		}
		const updated = {};
		for (const key of Object.keys(ATTRIBUTES)) {
			if (key in changes) updated[key] = changes[key].newValue;
		}
		apply(updated);
	});

	// YouTube swaps pages without reloading; re-check after each navigation.
	document.addEventListener("yt-navigate-finish", syncTheater);
})();
