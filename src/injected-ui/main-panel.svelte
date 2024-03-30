<script lang="ts">
  import CounterUi from "~injected-ui/counter.svelte";
  import SummaryUi from "~injected-ui/summary.svelte";
  import TimelineUi from "~injected-ui/timeline.svelte";
  import { CustomEventType, DocumentSelector } from "~lib/constants";
  import { consoleDebug } from "~lib/utils";
  import { activated, videoPlayerNode } from "~stores/volatile";

  let timelineUi: TimelineUi;
  let currentVideoId = new URLSearchParams(document.location.search).get("v");

  // activate/deactivate ui
  document.addEventListener(CustomEventType.Activate, (event) => {
    consoleDebug(`ui activate ${event}`);
    if ("detail" in event && typeof event.detail === "boolean") {
      consoleDebug(`ui activate ${$activated} -> ${event.detail}`);
      $activated = event.detail;
    } else {
      consoleDebug(`ui activate event broke ${JSON.stringify(event)}`);
    }
  });

  /**
   * reset video player and time elements
   */
  async function resetVideo() {
    consoleDebug(`reset ${$videoPlayerNode} to undefined`);
    $videoPlayerNode = undefined;

    // wait for ad to finish
    const observer = new MutationObserver(getVideoAfterAds);
    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true
    });

    // force function call in case video has already changed
    getVideoAfterAds();

    // what the fuck i just discovered hoisting
    function getVideoAfterAds() {
      // do nothing when ads are shown
      if (document.querySelector(DocumentSelector.Advertisement)) {
        consoleDebug("wait for ads to finish");
        return;
      }

      // look for video after ads are gone
      const video: HTMLMediaElement = document.querySelector(
        DocumentSelector.Video
      );

      // wait for video duration to load
      if (video && !Number.isNaN(video.duration)) {
        // hoisting goes so crazy
        observer.disconnect();

        consoleDebug(`video loaded ${video}`);
        $videoPlayerNode = video;
      }
    }
  }

  /**
   * infinitely running listen for video changes to reset scoreboard
   * https://stackoverflow.com/a/51025612
   *
   * note: alternative funny solution lol
   * https://stackoverflow.com/a/18398921
   */
  new MutationObserver(() => {
    // get video id from url
    const newVideoId = new URLSearchParams(document.location.search).get("v");

    // ensure video reset is only done once
    if (currentVideoId !== newVideoId) {
      consoleDebug(`change video ${currentVideoId} -> ${newVideoId}`);
      currentVideoId = newVideoId;

      // reset scores if exists
      if ($videoPlayerNode && timelineUi) {
        timelineUi.resetScoreMap();
      }

      resetVideo();
    }
  })
    // start observing the document for video src mutations
    .observe(document, { attributeFilter: ["src"], subtree: true });

  // set video on first load
  resetVideo();
</script>

<div
  id="clicker-browser-extension-panel"
  class={$activated ? "" : "hidden-content"}
>
  <div id="clicker-browser-extension-timeline-container">
    <TimelineUi bind:this={timelineUi} />
  </div>

  <CounterUi on:judgeClick={({ detail }) => timelineUi.parseClick(detail)} />

  <SummaryUi
    {currentVideoId}
    on:resetScoreMap={() => timelineUi.resetScoreMap()}
    on:importScoreMap={({ detail }) => timelineUi.setScoreMap(detail)}
  />
</div>
