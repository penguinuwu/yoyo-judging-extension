<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import { CustomEventType, StorageKey } from "~lib/constants";
  import type { ScoreJson } from "~lib/types";
  import { consoleDebug, getScoresPerSecond } from "~lib/utils";
  import {
    activated,
    playbackMode,
    scoreMap,
    videoPlayerNode
  } from "~stores/volatile";

  const dispatch = createEventDispatcher<{
    resetScoreMap: void;
    importScoreMap: ScoreJson;
  }>();

  export let currentVideoId: string;

  // convert to sorted flattened array
  $: scoreMapFlat = $scoreMap
    .flatMap((block) => Array.from(block))
    .sort((a, b) => a[0] - b[0]);

  // converted to array for browser compatibility
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/reduce
  $: [scorePositive, scoreNegative] = scoreMapFlat.reduce(
    (sums, [_time, score]) => {
      sums[score > 0 ? 0 : 1] += score;
      return sums;
    },
    [0, 0]
  );
  $: scoreTotal = scorePositive + scoreNegative;
  $: totalTime =
    Math.max(...scoreMapFlat.flatMap(([time, _score]) => time)) -
    Math.min(...scoreMapFlat.flatMap(([time, _score]) => time));

  // download scores
  let filesDownloadElement: HTMLAnchorElement;
  function downloadScores() {
    consoleDebug(`download scores ${currentVideoId}`);

    // missing data
    if (!currentVideoId || !scoreMapFlat || scoreMapFlat.length <= 0) {
      return;
    }

    // set download default file name
    filesDownloadElement.setAttribute(
      "download",
      `yoyo-scores_${Date.now()}_${currentVideoId}.json`
    );

    // generate stringified json
    const scoreJson: ScoreJson = {
      date: Date.now(),
      scores: scoreMapFlat,
      videoId: currentVideoId
    };
    const scoreJsonString = JSON.stringify(scoreJson);
    filesDownloadElement.setAttribute(
      "href",
      `data:application/json;charset=utf-8,` +
        encodeURIComponent(scoreJsonString)
    );

    // download file
    filesDownloadElement.click();
  }

  // import scores
  let scoreImportElement: HTMLInputElement;
  let scoreFiles: FileList;
  $: if (scoreFiles && scoreFiles.length > 0) {
    scoreFiles[0]
      .text()
      .then((scoreText) => {
        // verify video loaded
        if (!currentVideoId || !$videoPlayerNode) {
          scoreFiles = undefined;
          window.alert("Error: video not ready!");
          return;
        }

        // read json
        const scoreJson = JSON.parse(scoreText) as ScoreJson;
        consoleDebug(`import scores`);
        consoleDebug(scoreJson);

        // reset reference
        scoreFiles = undefined;

        // validate json structure
        if (
          !scoreJson ||
          !Array.isArray(scoreJson.scores) ||
          scoreJson.scores.length <= 0
        ) {
          window.alert("Error: empty scores data!");
          return;
        } else if (scoreJson.videoId !== currentVideoId) {
          window.alert("Error: wrong video!");
          return;
        }

        // validate each time-click pair
        for (const pair of scoreJson.scores) {
          if (
            !Array.isArray(pair) ||
            pair.length !== 2 ||
            typeof pair[0] !== "number" ||
            typeof pair[1] !== "number"
          ) {
            consoleDebug(pair);
            window.alert("Error: incorrect scores format");
            return;
          }
        }

        // sort pairs
        scoreJson.scores.sort((a, b) => a[0] - b[0]);

        // input is validated
        dispatch("importScoreMap", scoreJson);
      })
      .catch((error) => {
        consoleDebug(error);
        scoreFiles = undefined;
        window.alert("Error: cannot understand scores!");
      });
  }

  // playback mode
  const intervalDelay = 10;
  const intervalDelayThreshold = intervalDelay * 4; // max delay before skipping clicks
  let intervalId: number | undefined;
  let scoreMapIndex: number | undefined;
  async function togglePlaybackMode() {
    // disable playback mode
    if ($playbackMode) {
      consoleDebug("playback mode disabled");

      playbackMode.set(false);

      // clear interval
      clearInterval(intervalId);
      intervalId = undefined;

      // pause video
      if ($videoPlayerNode) {
        $videoPlayerNode.pause();
      }

      return;
    }

    // scoring has not begun
    if (!activated || !videoPlayerNode || !scoreMapFlat) {
      return;
    }

    // get first click time
    const firstClickTime = Math.min(
      ...scoreMapFlat.flatMap(([time, _score]) => time)
    );
    if (!Number.isFinite(firstClickTime)) {
      consoleDebug(`first click time not finite ${firstClickTime}`);
      return;
    }

    // enable playback
    consoleDebug("playback mode enabled");
    playbackMode.set(true);

    // set video to 5 seconds before first click
    $videoPlayerNode.currentTime = Math.max(firstClickTime - 5, 0);
    let previousTime = $videoPlayerNode.currentTime;

    // start video
    await $videoPlayerNode.play();

    // clear old interval to be safe, then set new interval
    clearInterval(intervalId);
    intervalId = setInterval(() => {
      // video changed or scoring stopped
      if (!activated || !videoPlayerNode || !scoreMapFlat) {
        consoleDebug(`playback: video changed or scoring stopped`);
        clearInterval(intervalId);
        return;
      }

      const currentTime = $videoPlayerNode.currentTime;

      // video paused
      if (previousTime === currentTime) {
        consoleDebug(`playback: video paused at ${currentTime}`);
        return;
      }

      // video rewinded or fast-forwarded or huge lag
      if (
        currentTime < previousTime ||
        previousTime + intervalDelayThreshold < currentTime
      ) {
        consoleDebug(`playback: reset ${previousTime} -> ${currentTime}`);
        previousTime = currentTime;
        scoreMapIndex = undefined;
        return;
      }

      // find next click index
      if (scoreMapIndex === undefined) {
        consoleDebug(
          `playback: scoreMapIndex undefined (${previousTime}, ${currentTime}]`
        );

        // search for index of clicks recorded after previousTime
        // TODO: use binary search since array is sorted
        // scoreMapIndex = findSorted(scoreMapFlat, (e) => previousTime < e[0]);
        scoreMapIndex = scoreMapFlat.findIndex(
          ([clickTime, _click]) => previousTime < clickTime
        );

        // no clicks recorded after previousTime
        if (scoreMapIndex === -1) {
          return;
        }
      }

      // play clicks between (previousTime, currentTime]
      while (scoreMapIndex < scoreMapFlat.length) {
        const [timestamp, click] = scoreMapFlat[scoreMapIndex];

        // stop playing clicks past current time
        if (currentTime < timestamp) {
          break;
        }

        document.dispatchEvent(
          new CustomEvent(CustomEventType.ClickFlash, {
            detail: click > 0 ? StorageKey.KeyPositive : StorageKey.KeyNegative
          })
        );
        scoreMapIndex++;
      }

      previousTime = currentTime;
    }, intervalDelay);
  }
</script>

<div id="clicker-browser-extension-summary">
  <table>
    <thead>
      <tr>
        <th>Total Score</th>
        <th>Positive</th>
        <th>Negative</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          {scoreTotal} ({getScoresPerSecond(scoreTotal, totalTime)})
        </td>
        <td>
          {scorePositive} ({getScoresPerSecond(scorePositive, totalTime)})
        </td>
        <td>
          {scoreNegative} ({getScoresPerSecond(scoreNegative, totalTime)})
        </td>
      </tr>
    </tbody>
  </table>
</div>

<div>
  <button
    class="youtube-button w-25"
    on:click={() => dispatch("resetScoreMap")}
    disabled={$playbackMode || !scoreMapFlat || scoreMapFlat.length <= 0}
  >
    Reset
  </button>
  <button
    class="youtube-button w-25"
    on:click={() => downloadScores()}
    disabled={$playbackMode || !scoreMapFlat || scoreMapFlat.length <= 0}
  >
    Download Scores
  </button>
  <button
    class="youtube-button w-25"
    on:click={() => scoreImportElement.click()}
    disabled={$playbackMode || !currentVideoId || !$videoPlayerNode}
  >
    Import Scores</button
  >
  <button
    class="youtube-button w-25"
    on:click={() => togglePlaybackMode()}
    disabled={!scoreMapFlat || scoreMapFlat.length <= 0}
  >
    {$playbackMode ? "Stop Play Back" : "Play Back Scores"}
  </button>
</div>

<a
  bind:this={filesDownloadElement}
  href={""}
  style="display: none; visibility: hidden;"
  hidden
>
  {""}
</a>
<input
  bind:this={scoreImportElement}
  bind:files={scoreFiles}
  type="file"
  accept=".json,application/json"
  style="display: none; visibility: hidden;"
  hidden
/>
