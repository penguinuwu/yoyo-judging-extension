/**
 * listen for score submissions
 */
window.addEventListener("message", (event) => {
	// We only accept messages from ourselves
	if (event.source !== window) {
		return;
	}

	if (event.data.type && event.data.type === "FROM_PAGE") {
		console.log(`received: ${event.data.text}`);
		if (event.data.text === "SET_SCORE") {
			// send scores to background scripts to database
			console.log(event.data.score);
		}
	}
});
