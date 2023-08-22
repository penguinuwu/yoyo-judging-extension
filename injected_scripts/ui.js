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
 * show scoring timeline ui
 * @param {Element} startButtonNode
 */
function showScoring(startButtonNode) {
	// TODO: did i make a race condition :3c
	startButtonNode.disabled = true;
	startButtonNode.textContent = "Loading...";
	window.postMessage({ type: "FROM_PAGE", text: "GET_KEYS" }, "*");
}

/**
 * hide scoring timeline ui
 * @param {Element} startButtonNode
 * @param {Element} uiNode
 * @param {Element} clickerControllers
 */
function hideScoring(startButtonNode, uiNode, clickerControllers) {
	// TODO: this is probably fine riiiiiiiight.........
	startButtonNode.disabled = true;
	startButtonNode.textContent = "Loading...";

	// remove click listener
	console.log(clickerControllers);
	if (clickerControllers.length > 0) clickerControllers.shift().abort();

	// remove scoring ui
	uiNode.remove("clicker-browser-extension-scoreboard");

	// TODO: this is probably fine riiiiiiiight......... pt2
	startButtonNode.textContent = "Score";
	startButtonNode.disabled = false;
}

/**
 * reset all clicks
 * @param {Array<Element>} scoreTableNodes
 * @param {{Date: number}} mapTimesToScores
 */
function resetScoring(scoreTableNodes, mapTimesToScores) {
	// clear table data
	// https://stackoverflow.com/a/65413839
	scoreTableNodes.forEach((tableBody) => tableBody.replaceChildren());

	// clear positive stripes on timeline
	Array.from(
		document.getElementsByClassName("clicker-browser-extension-stripe-pos")
	).forEach((stripe) => stripe.remove());

	// clear negative stripes on timeline
	Array.from(
		document.getElementsByClassName("clicker-browser-extension-stripe-neg")
	).forEach((stripe) => stripe.remove());

	// clear clicks table
	Object.getOwnPropertyNames(mapTimesToScores).forEach(
		(clickTime) => delete mapTimesToScores[clickTime]
	);
}

/**
 * record click in scores object and update ui
 * @param {Element} videoPlayerNode
 * @param {Element} timeline
 * @param {Array<Element>} tables
 * @param {{Date: number}} scoreMap
 * @param {number} change
 */
function parseClick(videoPlayerNode, timeline, tables, scoreMap, change) {
	const clickTime = videoPlayerNode.getCurrentTime();
	const videoDuration = videoPlayerNode.getDuration();

	console.log(`parseClick: ${change} at ${clickTime}`);

	// prevent time from hitting the very end of video
	if (clickTime >= videoDuration) {
		clickTime = videoDuration - 0.000001;
	}

	// calculate times
	const timePercentage = (clickTime / videoDuration) * 100;
	const blockIndex = Math.floor(timePercentage / 10);
	console.log(`timePercentage: ${timePercentage}, blockIndex: ${blockIndex}`);

	// update time-to-score mapping
	if (scoreMap.hasOwnProperty(`${clickTime}`)) {
		scoreMap[`${clickTime}`] += change;
	} else {
		scoreMap[`${clickTime}`] = change;
	}

	const idHash = `${clickTime}-${change}-${Math.random()}`;

	// update ui stripe
	const stripe = document.createElement("span");
	stripe.id = `stripe-${idHash}`;
	stripe.style.left = `${timePercentage}%`;
	if (change > 0) {
		stripe.className = "clicker-browser-extension-stripe-pos";
	} else {
		stripe.className = "clicker-browser-extension-stripe-neg";
	}
	timeline.appendChild(stripe);

	// populate table data
	const timeData = document.createElement("td");
	timeData.textContent = clickTime;
	timeData.onclick = () => videoPlayerNode.seekTo(clickTime, true);

	const scoreData = document.createElement("td");
	scoreData.textContent = `${change > 0 ? "+" : "-"}${change}`;

	const deleteData = document.createElement("td");
	deleteData.textContent = "🗑️";
	deleteData.onclick = () => {
		console.log(`delete ${idHash}`);

		// delete ui
		document.getElementById(`stripe-${idHash}`).remove();
		document.getElementById(`table-${idHash}`).remove();

		// delete click
		if (scoreMap.hasOwnProperty(`${clickTime}`)) {
			scoreMap[`${clickTime}`] -= change;
		}
	};

	// update ui table
	const tableRow = document.createElement("tr");
	tableRow.id = `table-${idHash}`;
	tableRow.appendChild(timeData);
	tableRow.appendChild(scoreData);
	tableRow.appendChild(deleteData);
	tables[blockIndex].appendChild(tableRow);

	// sort table https://stackoverflow.com/a/49041392
	// iterate through tr
	Array.from(tables[blockIndex].children)
		.sort(
			(tr1, tr2) =>
				// sort only considering time data
				parseFloat(tr1.children[0].textContent) >
				parseFloat(tr2.children[0].textContent)
		)
		// reappend tr back into table in order (does not duplicate)
		.forEach((tr) => tables[blockIndex].appendChild(tr));
}

/**
 * main function
 * note: top level await only allowed for modules
 * https://stackoverflow.com/a/72657456
 */
(async () => {
	// TODO: figure out how to import instead of everything in 1 file lol

	// get video player
	const videoPlayerNode = await waitForElm("#movie_player");
	const videoDuration = videoPlayerNode.getDuration();

	console.log(videoDuration);

	// cannot just use id because chrome has multiple #owner ids 💀
	// div containing the Subscribe button
	const channelInfoNode = await waitForElm("#top-row > #owner");
	// div containing items directly under the video
	const belowVideoNode = await waitForElm("#primary-inner > #below");

	// #region create scoring ui
	// maps datetime to click integer
	const mapTimesToScores = {};

	// contains scoring timeline ui
	const uiNode = document.createElement("div");
	uiNode.id = "clicker-browser-extension-ui";

	// contains score reset and submit buttons
	const scoreboardNode = document.createElement("div");
	scoreboardNode.id = "clicker-browser-extension-scoreboard";

	// create timeline
	const timelineNode = document.createElement("div");
	timelineNode.id = "clicker-browser-extension-timeline";

	// split the timeline into 10 blocks
	const scoreTableNodes = [];
	for (let i = 0; i <= 90; i += 10) {
		const block = document.createElement("div");
		block.className = "clicker-browser-extension-block";
		block.style.left = `${i}%`;
		timelineNode.appendChild(block);

		const list = document.createElement("div");
		list.className = "clicker-browser-extension-list";
		block.appendChild(list);

		// make table
		const table = document.createElement("table");
		list.appendChild(table);
		const header = document.createElement("thead");
		table.appendChild(header);
		const headerRow = document.createElement("tr");
		header.appendChild(headerRow);

		// make table header rows
		const timestamp = document.createElement("th");
		timestamp.textContent = "Time";
		headerRow.appendChild(timestamp);
		const click = document.createElement("th");
		click.textContent = "Click";
		headerRow.appendChild(click);
		const deletion = document.createElement("th");
		deletion.textContent = "Delete";
		headerRow.appendChild(deletion);

		// index the tables to display clicks
		const body = document.createElement("tbody");
		table.appendChild(body);
		scoreTableNodes.push(body);

		// skip tick for the last 10% because it will be offscreen
		if (i === 90) continue;

		// draw tick
		const tick = document.createElement("span");
		tick.className = "clicker-browser-extension-tick";
		tick.style.left = `${i + 10 - 0.1}%`;
		timelineNode.appendChild(tick);
	}

	const positiveNode = document.createElement("button");
	positiveNode.textContent = "+1";
	positiveNode.onclick = () => {
		console.log(`positiveNode.onclick: +1`);
		parseClick(
			videoPlayerNode,
			timelineNode,
			scoreTableNodes,
			mapTimesToScores,
			+1
		);
	};
	const negativeNode = document.createElement("button");
	negativeNode.textContent = "-1";
	negativeNode.onclick = () => {
		console.log(`negativeNode.onclick: -1`);
		parseClick(
			videoPlayerNode,
			timelineNode,
			scoreTableNodes,
			mapTimesToScores,
			-1
		);
	};

	const utilsNode = document.createElement("div");
	utilsNode.id = "clicker-browser-extension-utils";

	const submitNode = document.createElement("button");
	submitNode.textContent = "Submit";
	submitNode.title = "Submit current clicks to the database";
	submitNode.onclick = () => {
		console.log("submit");
		if (confirm("Submit scores to online database?")) {
			window.postMessage(
				{
					type: "FROM_PAGE",
					text: "SET_SCORE",
					score: mapTimesToScores,
				},
				"*"
			);
		}
	};
	const resetNode = document.createElement("button");
	resetNode.textContent = "Reset";
	resetNode.title = "Reset all current clicks";
	resetNode.onclick = () => {
		console.log("reset");
		if (confirm("Reset all clicks?")) {
			resetScoring(scoreTableNodes, mapTimesToScores);
		}
	};

	// append to ui
	scoreboardNode.appendChild(positiveNode);
	scoreboardNode.appendChild(timelineNode);
	scoreboardNode.appendChild(negativeNode);

	utilsNode.appendChild(submitNode);
	utilsNode.appendChild(resetNode);

	uiNode.appendChild(scoreboardNode);
	uiNode.appendChild(utilsNode);
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
			showScoring(startButtonNode);
		} else if (startButtonNode.textContent === "Stop") {
			hideScoring(startButtonNode, uiNode, clickerControllers);
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
			hideScoring(startButtonNode, uiNode, clickerControllers);

			// add new abort controller to clear current key bindings
			const newClickerController = new AbortController();
			clickerControllers.push(newClickerController);

			// listen for clicks
			document.addEventListener(
				"keydown",
				(event) => {
					if (
						event.key === positiveKey ||
						event.key === negativeKey
					) {
						// disable default key actions
						event.preventDefault();
						event.stopPropagation();
						event.stopImmediatePropagation();

						const click = event.key === positiveKey ? +1 : -1;
						parseClick(
							videoPlayerNode,
							timelineNode,
							scoreTableNodes,
							mapTimesToScores,
							click
						);
					}
				},
				// capture prioritizes this event listener
				// signal aborts the event listener
				{ capture: true, signal: newClickerController.signal }
			);

			belowVideoNode.prepend(uiNode);

			// TODO: did i make a race condition :3c part2
			startButtonNode.textContent = "Stop";
			startButtonNode.disabled = false;
		}
	);

	// listen for video changes
	document.addEventListener("clicker-browser-extension:video-change", () => {
		console.log("video change reset");
		resetScoring(scoreTableNodes, mapTimesToScores);
	});

	// add scoring button
	channelInfoNode.appendChild(startButtonNode);
})();
