<script lang="ts">
  import { Storage } from "@plasmohq/storage";
  import { StorageKeys } from "~contents/store";
  import TimelineUi from "~judging-timeline.svelte";

  // activate/deactivate ui
  export let activated: boolean;

  let timelineUi: TimelineUi;

  // browser storage
  const storage = new Storage();

  // key bindings
  let positiveKey: string;
  let negativeKey: string;

  // get default keys iife
  (async () => {
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
      if (!activated) {
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
</script>

<div
  id="clicker-browser-extension-scoreboard"
  class={activated ? "" : "hidden-content"}
>
  <button title={positiveKey} on:click={() => timelineUi.parseClick(+1)}>
    +1
  </button>

  <TimelineUi bind:this={timelineUi} />

  <button title={negativeKey} on:click={() => timelineUi.parseClick(-1)}>
    -1
  </button>
</div>
