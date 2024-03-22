<script lang="ts">
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher<{
    resetScoreMap: void;
    importScoreMap: [number, number][][];
  }>();

  // array of 10 objects
  export let scoreMap: Map<number, number>[];

  $: scoreMapFlat = new Map(scoreMap.flatMap((block) => [...block]));

  // converted to array for browser compatibility
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/reduce
  $: [scorePositive, scoreNegative] = [...scoreMapFlat.values()].reduce(
    (sums, clicks) => {
      sums[clicks > 0 ? 0 : 1] += clicks;
      return sums;
    },
    [0, 0]
  );
  $: scoreTotal = scorePositive + scoreNegative;
  $: totalTime =
    Math.max(...scoreMapFlat.keys()) - Math.min(...scoreMapFlat.keys());

  // $: if (scoreMapFlat || !scoreMapFlat) {
  //   console.debug("update scoreMapFlat");
  //   console.debug(scoreMapFlat);
  // }
  // $: if (scorePositive || !scorePositive)
  //   console.debug(`update scorePositive ${scorePositive}`);
  // $: if (scoreNegative || !scoreNegative)
  //   console.debug(`update scoreNegative ${scoreNegative}`);
  // $: if (scoreTotal || !scoreTotal)
  //   console.debug(`update scoreTotal ${scoreTotal}`);
  // $: if (totalTime || !totalTime)
  //   console.debug(`update totalTime ${totalTime}`);

  // download scores
  let filesDownloadElement: HTMLAnchorElement;
  let fileContent: string;
  function downloadScores() {
    const scoreArray = scoreMap.map((block) => [...block.entries()]);
    const scoreJson = JSON.stringify(scoreArray, null, "\t");
    fileContent =
      `data:application/json;charset=utf-8,` + encodeURIComponent(scoreJson);
    filesDownloadElement.setAttribute("download", `scores.json`);
    filesDownloadElement.click();
  }

  // import scores
  let scoreImportElement: HTMLInputElement;
  let scoreFiles: FileList;
  $: if (scoreFiles && scoreFiles.length > 0) {
    scoreFiles[0]
      .text()
      .then((scoreText) => {
        const scores = JSON.parse(scoreText) as [number, number][][];

        // validate outer structure of score blocks
        if (!scores || !Array.isArray(scores) || scores.length != 10) {
          console.debug(scoreText);
          window.alert("Error: incorrect scores format!");
          return;
        }

        // validate inner structure
        for (let index = 0; index < 10; index++) {
          if (!Array.isArray(scores[index])) {
            console.debug(scoreText);
            window.alert("Error: incorrect scores format!");
            return;
          }
          for (const pair of scores[index]) {
            // validate each time-click pair
            if (
              !Array.isArray(pair) ||
              pair.length !== 2 ||
              typeof pair[0] !== "number" ||
              typeof pair[1] !== "number"
            ) {
              console.debug(pair);
              window.alert("Error: incorrect scores format");
              return;
            }

            // try-catch validation lol
            try {
              new Map(scores[index]);
            } catch (error) {
              console.debug(error);
              window.alert("Error: incorrect scores format!");
              return;
            }
          }
        }

        // input is validated
        dispatch("importScoreMap", scores);
      })
      .catch((error) => {
        console.debug(error);
        window.alert("Error: cannot understand scores!");
      });
  }
</script>

<div>
  <table style="color: white;">
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
          {scoreTotal} ({(scoreTotal / totalTime).toFixed(2)} clicks/second)
        </td>
        <td>
          {scorePositive} ({(scorePositive / totalTime).toFixed(2)} clicks/second)
        </td>
        <td>
          {scoreNegative} ({(scoreNegative / totalTime).toFixed(2)} clicks/second)
        </td>
      </tr>
    </tbody>
  </table>
</div>

<button on:click={() => dispatch("resetScoreMap")}>Reset</button>
<button on:click={() => downloadScores()}>Download Scores</button>
<button on:click={() => scoreImportElement.click()}>Import Scores</button>
<button>Play Scores</button>

<a
  bind:this={filesDownloadElement}
  href={fileContent}
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
