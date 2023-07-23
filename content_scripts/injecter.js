// inject script file
// https://stackoverflow.com/a/9517879
// https://stackoverflow.com/a/9310273

const uiElement = document.createElement("script");

// TODO: change `chrome` to `browser` dynamically
uiElement.src = chrome.runtime.getURL("injected_scripts/ui.js");
uiElement.onload = function () {
	this.remove();
};

(document.head || document.documentElement).appendChild(uiElement);
