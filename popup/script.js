const negativeNode = document.getElementById("neg-key");
const positiveNode = document.getElementById("pos-key");

/**
 * get current key bindings from storage and set in popup
 */
async function setKeysFromStorage() {
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

	negativeNode.value = data.negativeKey;
	positiveNode.value = data.positiveKey;
}
setKeysFromStorage();

/**
 * listen for key binding changes in popup
 */
addEventListener("input", (event) => {
	console.log(event);
	if (event.target === negativeNode || event.target === positiveNode) {
		console.log(`event is negKey or posKey`);
		if (negativeNode.value === positiveNode.value) {
			// duplicate bindings, both keys are invalid
			negativeNode.setCustomValidity("Invalid duplicate key bind!");
			positiveNode.setCustomValidity("Invalid duplicate key bind!");
		} else {
			// check keys for validity
			negativeNode.setCustomValidity(
				/^.$/.test(negativeNode.value) ? "" : "Invalid key bind!"
			);
			positiveNode.setCustomValidity(
				/^.$/.test(positiveNode.value) ? "" : "Invalid key bind!"
			);

			if (negativeNode.checkValidity() && positiveNode.checkValidity()) {
				// both keys are valid, save keys to browser storage
				chrome.storage.sync.set({
					positiveKey: positiveNode.value,
					negativeKey: negativeNode.value,
				});
			}
		}
	}
});
