// does frog things
// TODO: split code into multiple files

/**
 * wait for element then return querySelector result
 * https://stackoverflow.com/a/61511955
 * @param {string} selector
 * @returns Promise<Element>
 */
function waitForElm(selector) {
	return new Promise((resolve) => {
		if (document.querySelector(selector)) {
			return resolve(document.querySelector(selector));
		}

		const observer = new MutationObserver((_mutations) => {
			if (document.querySelector(selector)) {
				resolve(document.querySelector(selector));
				observer.disconnect();
			}
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true,
		});
	});
}

/**
 * handles scoring key inputs
 * @param {Element} playerNode
 * @param {Element} scoresNode
 * @param {*} score
 * @param {string} posKey
 * @param {string} negKey
 * @returns {function}
 */
function handleScoringKeydown(playerNode, scoresNode, score, posKey, negKey) {
	return (event) => {
		if (event.key === posKey || event.key === negKey) {
			const time = playerNode.getCurrentTime();

			// disable default key actions
			event.preventDefault();
			event.stopPropagation();
			event.stopImmediatePropagation();

			const click = event.key === posKey ? +1 : -1;
			if (score.hasOwnProperty(`${time}`)) {
				score[`${time}`] += click;
			} else {
				score[`${time}`] = click;
			}

			updateScores(scoresNode, score);
		}
	};
}

/**
 *
 * @param {*} startButtonNode
 */
function setScoring(startButtonNode) {
	// TODO: did i make a race condition :3c
	startButtonNode.disabled = true;
	startButtonNode.textContent = "Loading...";
	window.postMessage({ type: "FROM_PAGE", text: "GET_KEYS" }, "*");
}

/**
 *
 * @param {*} startButtonNode
 * @param {*} scoreboardNode
 * @param {*} clickerControllers
 */
function clearScoring(startButtonNode, scoreboardNode, clickerControllers) {
	// TODO: this is probably fine riiiiiiiight.........
	startButtonNode.disabled = true;
	startButtonNode.textContent = "Loading...";

	// remove click listener
	console.log(clickerControllers);
	if (clickerControllers.length > 0) clickerControllers.shift().abort();

	// remove scoring ui
	scoreboardNode.remove("clicker-browser-extension-scoreboard");

	// TODO: this is probably fine riiiiiiiight......... pt2
	startButtonNode.textContent = "Score";
	startButtonNode.disabled = false;
}

/**
 * update score ui
 * @param {Element} scoresNode
 * @param {object} score
 */
function updateScores(scoresNode, score) {
	let number = 0;
	Object.values(score).forEach((value) => {
		number += parseInt(value);
	});
	scoresNode.textContent = number;
	console.log(score);
}

/**
 * main function
 * note: top level await only allowed for modules
 * https://stackoverflow.com/a/72657456
 */
(async () => {
	// TODO: figure out how to import instead of pasting code lol
	// https://stackoverflow.com/a/53033388 maybe
	// const { waitForElm } = await import(thing);

	// get video player
	const videoPlayerNode = await waitForElm("#movie_player");

	// cannot just use id because chrome has multiple #owner ids 💀
	// div containing the Subscribe button
	const channelInfoNode = await waitForElm("#top-row > #owner");
	// div containing items directly under the video
	const belowVideoNode = await waitForElm("#primary-inner > #below");

	// #region create scoring ui
	const score = {};

	const scoreboardNode = document.createElement("div");
	scoreboardNode.id = "clicker-browser-extension-scoreboard";

	const scoresNode = document.createElement("button");
	scoresNode.disabled = true;
	scoresNode.textContent = 0;

	const positiveNode = document.createElement("button");
	positiveNode.textContent = "+1";
	positiveNode.onclick = () => {
		const time = videoPlayerNode.getCurrentTime();
		if (score.hasOwnProperty(`${time}`)) {
			score[`${time}`] += 1;
		} else {
			score[`${time}`] = +1;
		}
		console.log(`+1 at ${time}`);
		updateScores(scoresNode, score);
	};
	const negativeNode = document.createElement("button");
	negativeNode.textContent = "-1";
	negativeNode.onclick = () => {
		const time = videoPlayerNode.getCurrentTime();
		if (score.hasOwnProperty(`${time}`)) {
			score[`${time}`] -= 1;
		} else {
			score[`${time}`] = -1;
		}
		console.log(`-1 at ${time}`);
		updateScores(scoresNode, score);
	};

	const submitNode = document.createElement("button");
	submitNode.textContent = "Submit";
	submitNode.title = "Submit current clicks to the database";
	submitNode.onclick = () => {
		console.log("submit");
		window.postMessage(
			{ type: "FROM_PAGE", text: "SET_SCORE", score: score },
			"*"
		);
	};

	const resetNode = document.createElement("button");
	resetNode.textContent = "Reset";
	resetNode.title = "Reset all current clicks";
	resetNode.onclick = () => {
		console.log("reset");
		for (const key in score) {
			delete score[key];
		}
		updateScores(scoresNode, score);
	};

	// append to ui
	scoreboardNode.appendChild(positiveNode);
	scoreboardNode.appendChild(negativeNode);
	scoreboardNode.appendChild(scoresNode);
	scoreboardNode.appendChild(submitNode);
	scoreboardNode.appendChild(resetNode);
	// #endregion

	// #region create start/stop scoring button
	const startButtonNode = document.createElement("button");
	startButtonNode.textContent = "Score";

	// TODO: ... this has to be the only way i swear right ..........
	const clickerControllers = [];

	startButtonNode.onclick = (event) => {
		console.log(event);
		// TODO: .textContent is probably fine lolllllllll
		if (startButtonNode.textContent === "Score") {
			setScoring(startButtonNode);
		} else if (startButtonNode.textContent === "Stop") {
			clearScoring(startButtonNode, scoreboardNode, clickerControllers);
		}
	};
	// #endregion

	// listen to the content scripts for key binding changes
	document.addEventListener(
		"clicker-browser-extension:key-bindings",
		(event) => {
			// TODO: .textContent is probably fine lolllllllll pt2
			// do nothing if scoring has not begun
			if (startButtonNode.textContent === "Score") {
				return;
			}

			// accept key bindings
			const positiveKey = event.detail.positiveKey;
			const negativeKey = event.detail.negativeKey;
			positiveKey.title = positiveKey;
			negativeNode.title = negativeKey;

			// clear current key bindings if any exist
			clearScoring(startButtonNode, scoreboardNode, clickerControllers);

			// add new abort controller to clear current key bindings
			const newClickerController = new AbortController();
			clickerControllers.push(newClickerController);

			// listen for clicks
			document.addEventListener(
				"keydown",
				handleScoringKeydown(
					videoPlayerNode,
					scoresNode,
					score,
					positiveKey,
					negativeKey
				),
				// capture prioritizes this event listener
				// signal aborts the event listener
				{ capture: true, signal: newClickerController.signal }
			);

			belowVideoNode.prepend(scoreboardNode);

			// TODO: did i make a race condition :3c part2
			startButtonNode.textContent = "Stop";
			startButtonNode.disabled = false;
		}
	);

	// add scoring button
	channelInfoNode.appendChild(startButtonNode);
})();
