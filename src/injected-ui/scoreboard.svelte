<script lang="ts">
  import { Storage } from "@plasmohq/storage";
  import { StorageKeys } from "~contents/store";
  import TimelineUi from "~injected-ui/timeline.svelte";

  // activate/deactivate ui
  export let activated: boolean;

  let timelineUi: TimelineUi;
  let videoPlayerNode: HTMLMediaElement;

  // browser storage
  const storage = new Storage();

  // key bindings
  let positiveKey: string;
  let negativeKey: string;
  // get default keys iife
  (async function () {
    positiveKey = await storage.get(StorageKeys.PositiveKey);
    negativeKey = await storage.get(StorageKeys.NegativeKey);
    console.debug(`init get keys "${positiveKey}", "${negativeKey}"`);

    // some key is missing from storage, reset to default
    if (!positiveKey || !negativeKey) {
      console.debug("reset keys");
      positiveKey = "1";
      negativeKey = "0";
      storage.set(StorageKeys.PositiveKey, positiveKey);
      storage.set(StorageKeys.NegativeKey, negativeKey);
    }
  })();

  // watch for key binding changes
  storage.watch({
    [StorageKeys.PositiveKey]: (c) => {
      console.debug(`positiveKey: ${c.newValue}`);
      positiveKey = c.newValue;
    },
    [StorageKeys.NegativeKey]: (c) => {
      console.debug(`negativeKey: ${c.newValue}`);
      negativeKey = c.newValue;
    }
  });

  // listen for clicks
  document.addEventListener(
    "keydown",
    (event) => {
      // do nothing if scoring has not begun
      if (!activated || !videoPlayerNode) {
        return;
      }

      if (event.key === positiveKey || event.key === negativeKey) {
        // disable default key actions
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        const click = event.key === positiveKey ? +1 : -1;
        console.debug(`click ${click}`);
        timelineUi.parseClick(click);
      }
    },
    // capture prioritizes this event listener it's rly kool
    // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#capture
    { capture: true }
  );

  /**
   * reset video player and time elements
   */
  async function resetVideo() {
    videoPlayerNode = undefined;

    const observer = new MutationObserver((_mutationList) => {
      // ignore video details when ads are shown
      if (document.querySelector("div.ad-showing")) return;

      // tries to select video when ads are gone
      const video: HTMLMediaElement = document.querySelector(
        "#movie_player video"
      );
      if (video) {
        videoPlayerNode = video;
        observer.disconnect();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  /**
   * infinitely running listen for video changes to reset scoreboard
   * https://stackoverflow.com/a/51025612
   *
   * TODO: seems kinda inefficient...
   *
   * note: alternative funny solution lol
   * https://stackoverflow.com/a/18398921
   */
  new MutationObserver((mutationList) => {
    for (const mutation of mutationList) {
      if (
        mutation.type === "attributes" &&
        mutation.target.nodeType === Node.ELEMENT_NODE &&
        "tagName" in mutation.target &&
        mutation.target.tagName === "VIDEO" &&
        mutation.attributeName === "src"
      ) {
        // TODO: src value change multiple times idk why 💀
        console.debug("video change");
        // reset scores if exists
        if (videoPlayerNode && timelineUi) timelineUi.resetScoreMap();
        resetVideo();
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

<div id="clicker-browser-extension-scoreboard">
  <button title={positiveKey} on:click={() => timelineUi.parseClick(+1)}>
    +1
  </button>

  <TimelineUi
    bind:this={timelineUi}
    {videoPlayerNode}
    videoDuration={videoPlayerNode ? videoPlayerNode.duration : undefined}
  />

  <button title={negativeKey} on:click={() => timelineUi.parseClick(-1)}>
    -1
  </button>
</div>
