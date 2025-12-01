document.addEventListener("DOMContentLoaded", () => {
	const toggles = {
		focusMode: document.getElementById("focusModeToggle"),
		hideComments: document.getElementById("hideCommentsToggle"),
		hideSuggested: document.getElementById("hideSuggestedToggle"),
		hideSidebar: document.getElementById("hideSidebarToggle"),
		hideRecommendations: document.getElementById(
			"hideRecommendationsToggle"
		),
		hideVideoDetails: document.getElementById("hideVideoDetailsToggle"),
		hideSearchBar: document.getElementById("hideSearchBarToggle"),
	};

	// Load saved settings
	chrome.storage.local.get(Object.keys(toggles), (result) => {
		for (const [key, element] of Object.entries(toggles)) {
			if (element) {
				element.checked = result[key] || false;
			}
		}
	});

	// Helper to save and broadcast settings
	function updateSettings() {
		const settings = {};
		for (const [key, element] of Object.entries(toggles)) {
			if (element) {
				settings[key] = element.checked;
			}
		}

		// Save to storage
		chrome.storage.local.set(settings);

		// Broadcast to tabs
		chrome.tabs.query({ url: "*://*.youtube.com/*" }, (tabs) => {
			tabs.forEach((tab) => {
				chrome.tabs
					.sendMessage(tab.id, {
						type: "UPDATE_SETTINGS",
						settings: settings,
					})
					.catch((err) => {
						// Ignore connection errors
					});
			});
		});
	}

	// Attach listeners
	for (const [key, element] of Object.entries(toggles)) {
		if (element) {
			element.addEventListener("change", (e) => {
				// If Master toggle changed, update all others
				if (key === "focusMode") {
					const isChecked = element.checked;
					for (const [otherKey, otherElement] of Object.entries(
						toggles
					)) {
						if (otherKey !== "focusMode" && otherElement) {
							otherElement.checked = isChecked;
						}
					}
				}
				// If any other toggle changed to false, uncheck Master
				else if (!element.checked && toggles.focusMode.checked) {
					toggles.focusMode.checked = false;
				}

				updateSettings();
			});
		}
	}
});
