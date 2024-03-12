<script lang="ts">
  import { formatTimestamp } from "~contents/utils";

  export let videoPlayerNode: HTMLMediaElement | undefined;
  $: videoDuration = videoPlayerNode ? videoPlayerNode.duration : undefined;

  // initialize array of 10 objects
  let scoreMap = new Array(10)
    .fill(undefined)
    .map(() => new Map<number, number>());

  /**
   * delete all mappings of timestamp to click
   */
  export function resetScoreMap() {
    for (let index = 0; index < 10; index++) {
      scoreMap[index].clear();
    }
  }

  /**
   * add click to score mapping at current time
   * @param click
   */
  export function parseClick(click: number) {
    if (!videoPlayerNode || !videoDuration) {
      console.debug(`video not ready to click!!`);
      return;
    }

    let clickTime = videoPlayerNode.currentTime;
    console.debug(`parseClick: ${click} at ${clickTime}`);

    // prevent time from hitting the very end of video
    if (clickTime >= videoDuration) {
      clickTime = videoDuration - 0.000001;
    }

    // calculate times
    const timePercentage = (clickTime / videoDuration) * 100;
    const blockIndex = Math.floor(timePercentage / scoreMap.length);
    console.debug(
      `timePercentage: ${timePercentage}, blockIndex: ${blockIndex}`
    );

    // update time-to-score mapping
    const newScore =
      click +
      (scoreMap[blockIndex].has(clickTime)
        ? scoreMap[blockIndex].get(clickTime)
        : 0);
    if (newScore === 0) {
      // delete and re-render
      scoreMap[blockIndex] =
        scoreMap[blockIndex].delete(clickTime) && scoreMap[blockIndex];
    } else {
      scoreMap[blockIndex].set(clickTime, newScore);
    }

    // sort hashmap (and force re-render)
    scoreMap[blockIndex] = [...scoreMap[blockIndex].keys()]
      .sort()
      .reduce((obj, key) => {
        obj.set(key, scoreMap[blockIndex].get(key));
        return obj;
      }, new Map<number, number>());
  }

  /**
   * delete click from score mapping at given time
   * @param clickTime
   * @param click
   */
  function deleteClick(clickTime: number, click: number) {
    if (!videoPlayerNode) {
      console.debug(`video not ready to unclick!!`);
      return;
    }

    console.debug(`deleting click ${click} at ${clickTime}`);

    // calculate score map index to locate the click bucket
    const timePercentage = (clickTime / videoDuration) * 100;
    const blockIndex = Math.floor(timePercentage / scoreMap.length);

    // delete and re-render
    scoreMap[blockIndex] =
      scoreMap[blockIndex].delete(clickTime) && scoreMap[blockIndex];
  }
</script>

<div id="clicker-browser-extension-timeline">
  <!-- divide timeline into 10 sections -->
  {#each Array(10) as _, i}
    <div class="clicker-browser-extension-block" style="left: {i * 10}%">
      <div class="clicker-browser-extension-list">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Click</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {#each scoreMap[i].entries() as [clickTime, click]}
              <tr>
                <td
                  class="timestamp"
                  on:click={() => (videoPlayerNode.currentTime = clickTime)}
                >
                  {formatTimestamp(clickTime, videoDuration)}
                </td>
                <td>{click}</td>
                <td
                  class="delete"
                  on:click={() => deleteClick(clickTime, click)}>🗑️</td
                >
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/each}

  <!-- stripes inbetween each timeline section -->
  {#each Array(9) as _, i}
    <span
      class="clicker-browser-extension-tick"
      style="left: {(i + 1) * 10 - 0.1}%"
    />
  {/each}

  <!-- stripes displaying clicks -->
  {#each scoreMap as scores}
    {#each scores.entries() as [clickTime, click]}
      <span
        class={`clicker-browser-extension-stripe ${click > 0 ? "pos" : "neg"}`}
        style={`left: ${(clickTime / videoDuration) * 100}%`}
      />
    {/each}
  {/each}
</div>
