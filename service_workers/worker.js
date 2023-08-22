// inject style css when requested
chrome.runtime.onMessage.addListener((request, sender, _sendResponse) => {
	if (request["clicker-browser-extension:service-worker"] === "inject-css") {
		chrome.scripting.insertCSS({
			target: { tabId: sender.tab.id },
			files: ["injected_scripts/ui-style.css"],
		});
	}
});
