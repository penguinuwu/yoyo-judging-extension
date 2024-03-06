<script lang="ts">
  export let videoPlayerNode: HTMLMediaElement;
  export let videoDuration: number;

  // initialize array of 10 objects
  let scoreMap: { [timestamp: string]: number }[] = Array(10)
    .fill(undefined)
    .map(() => {
      return {};
    });

  /**
   * delete all mappings of timestamp to click
   */
  export function resetScoreMap() {
    for (let index = 0; index < 10; index++) scoreMap[index] = {};
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
    if (!scoreMap[blockIndex].hasOwnProperty(`${clickTime}`)) {
      scoreMap[blockIndex][`${clickTime}`] = 0;
    }
    scoreMap[blockIndex][`${clickTime}`] += click;

    // sort hashmap
    scoreMap[blockIndex] = Object.keys(scoreMap[blockIndex])
      .sort()
      .reduce((obj, key) => {
        obj[key] = scoreMap[blockIndex][key];
        return obj;
      }, {});
  }

  /**
   * delete click from score mapping at given time
   * @param clickTime
   * @param click
   */
  function deleteClick(clickTime: string, click: number) {
    if (!videoPlayerNode) {
      console.debug(`video not ready to unclick!!`);
      return;
    }

    console.debug(`deleting click ${click} at ${clickTime}`);

    // calculate score map index to locate the click bucket
    const timePercentage = (parseFloat(clickTime) / videoDuration) * 100;
    const blockIndex = Math.floor(timePercentage / scoreMap.length);
    scoreMap[blockIndex][clickTime] -= click;
    // scoreMap = scoreMap;
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
            {#each Object.entries(scoreMap[i]) as [clickTime, click]}
              {#if parseInt(`${click}`, 10) !== 0}
                <tr>
                  <td
                    on:click={() =>
                      (videoPlayerNode.currentTime = parseFloat(clickTime))}
                  >
                    {clickTime}
                  </td>
                  <td>{click}</td>
                  <td on:click={() => deleteClick(clickTime, click)}>🗑️</td>
                </tr>
              {/if}
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
    {#each Object.entries(scores) as [clickTime, click]}
      {#if parseInt(`${click}`) !== 0}
        <span
          class={parseInt(`${click}`) > 0
            ? "clicker-browser-extension-stripe-pos"
            : "clicker-browser-extension-stripe-neg"}
          style={`left: ${(parseFloat(`${clickTime}`) / videoDuration) * 100}%`}
        />
      {/if}
    {/each}
  {/each}
</div>
