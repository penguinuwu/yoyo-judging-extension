<script lang="ts">
  import { CustomEventType, StorageKey } from "~lib/constants";
  import type { ScoreJson } from "~lib/types";
  import { consoleDebug, formatTimestamp } from "~lib/utils";
  import {
    activated,
    playbackMode,
    scoreMap,
    videoPlayerNode
  } from "~stores/volatile";

  $: videoDuration = $videoPlayerNode?.duration;

  /**
   * set scores from json, assuming input is sanitized
   * @param scoreJson
   */
  export function setScoreMap(scoreJson: ScoreJson) {
    resetScoreMap();

    for (let [clickTime, click] of scoreJson.scores) {
      // prevent time from hitting the very end of video
      if (clickTime >= videoDuration) {
        clickTime = videoDuration - 0.000001;
      }

      // calculate block index
      const timePercentage = (clickTime / videoDuration) * 100;
      const blockIndex = Math.floor(timePercentage / $scoreMap.length);
      consoleDebug(
        `timePercentage: ${timePercentage}, blockIndex: ${blockIndex}`
      );

      // set score
      $scoreMap[blockIndex].set(clickTime, click);
    }

    // sort hashmap (and force re-render)
    for (let blockIndex = 0; blockIndex < $scoreMap.length; blockIndex++) {
      $scoreMap[blockIndex] = new Float64Array($scoreMap[blockIndex].keys())
        .sort()
        .reduce((score, time) => {
          score.set(time, $scoreMap[blockIndex].get(time));
          return score;
        }, new Map<number, number>());
    }
  }

  /**
   * delete all mappings of timestamp to click
   */
  export function resetScoreMap() {
    $scoreMap = Array(10)
      .fill(undefined)
      .map(() => new Map<number, number>());
  }

  /**
   * add click to score mapping at current time
   * @param click
   */
  export function parseClick(click: number) {
    if (!$activated || $playbackMode || !$videoPlayerNode || !videoDuration) {
      consoleDebug(`video not ready to click!!`);
      return;
    }

    let clickTime = $videoPlayerNode.currentTime;
    consoleDebug(`parseClick: ${click} at ${clickTime}`);

    document.dispatchEvent(
      new CustomEvent(CustomEventType.ClickFlash, {
        detail: click > 0 ? StorageKey.KeyPositive : StorageKey.KeyNegative
      })
    );

    // prevent time from hitting the very end of video
    if (clickTime >= videoDuration) {
      clickTime = videoDuration - 0.000001;
    }

    // calculate block index
    const timePercentage = (clickTime / videoDuration) * 100;
    const blockIndex = Math.floor(timePercentage / $scoreMap.length);
    consoleDebug(
      `timePercentage: ${timePercentage}, blockIndex: ${blockIndex}`
    );

    // update time-to-score mapping
    const newScore = click + ($scoreMap[blockIndex].get(clickTime) ?? 0);
    if (newScore === 0) {
      // delete and re-render
      $scoreMap[blockIndex] =
        $scoreMap[blockIndex].delete(clickTime) && $scoreMap[blockIndex];
    } else {
      $scoreMap[blockIndex].set(clickTime, newScore);
    }

    // sort hashmap (and force re-render)
    $scoreMap[blockIndex] = new Float64Array($scoreMap[blockIndex].keys())
      .sort()
      .reduce((score, time) => {
        score.set(time, $scoreMap[blockIndex].get(time));
        return score;
      }, new Map<number, number>());
  }

  /**
   * delete click from score mapping at given time
   * @param clickTime
   * @param click
   */
  function deleteClick(clickTime: number, click: number) {
    if (!$activated || $playbackMode || !$videoPlayerNode) {
      consoleDebug(`video not ready to unclick!!`);
      return;
    }

    consoleDebug(`deleting click ${click} at ${clickTime}`);

    // calculate score map index to locate the click bucket
    const timePercentage = (clickTime / videoDuration) * 100;
    const blockIndex = Math.floor(timePercentage / $scoreMap.length);

    // delete and re-render
    $scoreMap[blockIndex] =
      $scoreMap[blockIndex].delete(clickTime) && $scoreMap[blockIndex];
  }
</script>

<div id="clicker-browser-extension-timeline">
  <!-- divide timeline into 10 sections -->
  {#each new Array(10) as _, i}
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
            {#each $scoreMap[i].entries() as [clickTime, click]}
              <tr>
                <td
                  class="timestamp"
                  on:click={() => ($videoPlayerNode.currentTime = clickTime)}
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
  {#each new Array(9) as _, i}
    <span
      class="clicker-browser-extension-tick"
      style="left: {(i + 1) * 10 - 0.1}%"
    />
  {/each}

  <!-- stripes displaying clicks -->
  {#each $scoreMap as scores}
    {#each scores.entries() as [clickTime, click]}
      <span
        class={`clicker-browser-extension-stripe ${click > 0 ? "pos" : "neg"}`}
        style={`left: ${(clickTime / videoDuration) * 100}%`}
      />
    {/each}
  {/each}
</div>
