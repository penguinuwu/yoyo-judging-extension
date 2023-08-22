/**
 * inject various file
 */

// TODO: change `chrome` to `browser` dynamically

/**
 * request service worker to inject css file
 */
function injectCSS() {
	chrome.runtime.sendMessage({
		"clicker-browser-extension:service-worker": "inject-css",
	});
}

/**
 * inject script file
 * https://stackoverflow.com/a/9517879
 * https://stackoverflow.com/a/9310273
 */
function injectScript() {
	const scriptElement = document.createElement("script");
	scriptElement.src = chrome.runtime.getURL("injected_scripts/ui.js");
	scriptElement.onload = function () {
		this.remove();
	};
	(document.head || document.documentElement).appendChild(scriptElement);
}

/**
 * detect changes overwriting injection script
 * https://stackoverflow.com/a/51025612
 *
 * note: alternative funny solution lol
 * https://stackoverflow.com/a/18398921
 */
function addObserver() {
	// Select the node that will be observed for mutations
	const targetNode = document.body;

	// Options for the observer (which mutations to observe)
	const config = { attributes: true, childList: true, subtree: true };

	// Callback function to execute when mutations are observed
	const callback = (mutationList, _observer) => {
		for (const mutation of mutationList) {
			if (
				mutation.type === "attributes" &&
				mutation.target.nodeType === Node.ELEMENT_NODE &&
				mutation.target.tagName === "VIDEO" &&
				mutation.attributeName === "src"
			) {
				// TODO: make permanent fix
				if (srcCurrent !== mutation.target.src) {
					// bandaid fix for src value changing multiple times
					// (idk why it do that 💀)))
					console.debug(`video change: ${mutation.target.src}`);
					srcCurrent = mutation.target.src;
					document.dispatchEvent(
						new CustomEvent(
							"clicker-browser-extension:video-change"
						)
					);
				}
			}
		}
	};

	// Create an observer instance linked to the callback function
	const observer = new MutationObserver(callback);

	// Start observing the target node for configured mutations
	observer.observe(targetNode, config);
}

// do an initial script injection
injectCSS();
injectScript();

// observe for when injected script gets overwritten
let srcCurrent = null;
addObserver();
