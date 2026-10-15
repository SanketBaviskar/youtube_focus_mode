const FILTER_KEYS = [
	"hideComments",
	"hideSuggested",
	"hideSidebar",
	"hideRecommendations",
	"hideVideoDetails",
	"hideSearchBar",
];

// Same behaviour as the popup's master switch: flip Focus Mode and set every
// filter to match. Open YouTube tabs react through chrome.storage.onChanged.
async function toggleFocusMode() {
	const { focusMode } = await chrome.storage.local.get("focusMode");
	const enabled = !focusMode;
	const settings = { focusMode: enabled };
	for (const key of FILTER_KEYS) settings[key] = enabled;
	await chrome.storage.local.set(settings);
}

chrome.commands.onCommand.addListener((command) => {
	if (command === "toggle-focus-mode") toggleFocusMode();
});

// YouTube tabs that were already open when the extension was installed or
// updated don't have the content script yet; add it so they work without a
// reload.
chrome.runtime.onInstalled.addListener(async () => {
	const tabs = await chrome.tabs.query({ url: "*://*.youtube.com/*" });
	for (const tab of tabs) {
		try {
			await chrome.scripting.insertCSS({
				target: { tabId: tab.id },
				files: ["focus.css"],
			});
			await chrome.scripting.executeScript({
				target: { tabId: tab.id },
				files: ["content.js"],
			});
		} catch (error) {
			// Discarded or still-loading tabs can't be scripted; they get the
			// content script normally when they load.
		}
	}
});
