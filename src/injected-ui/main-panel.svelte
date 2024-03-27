<script lang="ts">
  import { CustomEventType, DocumentSelector } from "~contents/constants";
  import { activated, videoPlayerNode } from "~contents/store";
  import CounterUi from "~injected-ui/counter.svelte";
  import SummaryUi from "~injected-ui/summary.svelte";
  import TimelineUi from "~injected-ui/timeline.svelte";

  let timelineUi: TimelineUi;
  let currentVideoId = new URLSearchParams(document.location.search).get("v");

  // activate/deactivate ui
  document.addEventListener(CustomEventType.Activate, (event) => {
    console.debug(`ui activate ${event}`);
    if ("detail" in event && typeof event.detail === "boolean") {
      console.debug(`ui activate ${$activated} -> ${event.detail}`);
      $activated = event.detail;
    } else {
      console.debug(`ui activate event broke ${JSON.stringify(event)}`);
    }
  });

  /**
   * reset video player and time elements
   */
  async function resetVideo() {
    console.debug(`reset ${$videoPlayerNode} to undefined`);
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
        console.debug("wait for ads to finish");
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

        console.debug(`video loaded ${video}`);
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
  new MutationObserver((mutationList) => {
    for (const mutation of mutationList) {
      if (
        mutation.type === "attributes" &&
        mutation.target.nodeType === Node.ELEMENT_NODE &&
        "tagName" in mutation.target && // for typescript
        mutation.target.tagName === "VIDEO" &&
        mutation.attributeName === "src"
      ) {
        // src value change triggers multiple times idk why 💀
        const params = new URLSearchParams(document.location.search);
        const newVideoId = params.get("v");

        // ensure video reset is only done once
        if (currentVideoId !== newVideoId) {
          console.debug(`video change detected:`);
          console.debug(mutation.target);

          console.debug(`change video ${currentVideoId} -> ${newVideoId}`);
          currentVideoId = newVideoId;

          // reset scores if exists
          if ($videoPlayerNode && timelineUi) {
            timelineUi.resetScoreMap();
          }

          resetVideo();
        }
      }
    }
  })
    // start observing the document body for mutations
    .observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true
    });

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
