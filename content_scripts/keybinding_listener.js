/**
 * listen from injected scripts
 */
window.addEventListener("message", async (event) => {
	// We only accept messages from ourselves
	if (event.source !== window) {
		return;
	}

	if (event.data.type && event.data.type === "FROM_PAGE") {
		console.log(`received: ${event.data.text}`);

		if (event.data.text === "GET_KEYS") {
			// injected scripts requesting for key bindings
			const { positiveKey, negativeKey } = await getKeys();
			sendKeys(positiveKey, negativeKey);
		} else if (event.data.text === "UPDATE_KEYS") {
			// injected scripts updated key bindings
			const positiveKey = event.data.newKeys.positiveKey;
			const negativeKey = event.data.newKeys.negativeKey;
			if (await setKeys(event.data.newKeys)) {
				sendKeys(positiveKey, negativeKey);
			}
		}
	}
});

/**
 * listen for changes in browser.storage.sync
 */
chrome.storage.onChanged.addListener(async (changes, _areaName) => {
	// TODO: will this cause edge cases where there is no newValue?
	console.log(changes);
	console.log(changes.positiveKey);
	console.log(changes.negativeKey);
	if (changes.positiveKey || changes.negativeKey) {
		const { positiveKey, negativeKey } = await getKeys();
		sendKeys(positiveKey, negativeKey);
	}
});

/**
 * get keys from browser.storage.sync
 * @returns {Promise<{ positiveKey, negativeKey }>}
 */
async function getKeys() {
	let data;
	try {
		data = await chrome.storage.sync.get();
	} catch (error) {
		data = {};
	}

	// add default key if not found in storage
	if (!data.hasOwnProperty("positiveKey")) {
		data.positiveKey = "1";
	}
	if (!data.hasOwnProperty("negativeKey")) {
		data.negativeKey = "0";
	}

	return data;
}

/**
 * set keys to browser.storage.sync
 * @param {string} positiveKey
 * @param {string} negativeKey
 * @returns {Promise<boolean>}
 */
async function setKeys(positiveKey, negativeKey) {
	// check if keys are duplicate
	if (positiveKey === negativeKey) return false;

	// check if keys are valid
	const valid = /^.$/;
	if (!valid.test(positiveKey) || !valid.test(negativeKey)) return false;

	await chrome.storage.sync.set({ positiveKey, negativeKey });
	return true;
}

/**
 * send keys to injected scripts
 * @param {string} positiveKey
 * @param {string} negativeKey
 * @returns {Promise<boolean>}
 */
async function sendKeys(positiveKey, negativeKey) {
	// check if keys are duplicate
	if (positiveKey === negativeKey) return false;

	// check if keys are valid
	const valid = /^.$/;
	if (!valid.test(positiveKey) || !valid.test(negativeKey)) return false;

	// clone object to fix firefox permissions error
	// https://stackoverflow.com/a/46081249
	let clonedDetail = { positiveKey: positiveKey, negativeKey: negativeKey };
	if (typeof cloneInto === "function") {
		clonedDetail = cloneInto(clonedDetail, document.defaultView);
	}

	document.dispatchEvent(
		new CustomEvent("clicker-browser-extension:key-bindings", {
			detail: clonedDetail,
		})
	);
	return true;
}
