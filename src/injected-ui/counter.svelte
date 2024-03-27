<script lang="ts">
  import { Storage } from "@plasmohq/storage";
  import { createEventDispatcher } from "svelte";

  import { StorageKey } from "~contents/constants";
  import { activated, playbackMode, videoPlayerNode } from "~contents/store";

  const dispatch = createEventDispatcher<{ judgeClick: number }>();

  // browser storage
  const storage = new Storage();

  // key bindings
  let keyPositive: string;
  let keyNegative: string;

  // get default keys iife
  (async function () {
    keyPositive = await storage.get(StorageKey.KeyPositive);
    keyNegative = await storage.get(StorageKey.KeyNegative);
    console.debug(`init get keys "${keyPositive}", "${keyNegative}"`);

    // some key is missing from storage, reset to default
    if (!keyPositive || !keyNegative) {
      console.debug("reset keys");
      keyPositive = "1";
      keyNegative = "0";
      storage.set(StorageKey.KeyPositive, keyPositive);
      storage.set(StorageKey.KeyNegative, keyNegative);
    }
  })();

  // watch for key binding changes
  storage.watch({
    [StorageKey.KeyPositive]: (c) => {
      console.debug(`keyPositive: ${c.newValue}`);
      keyPositive = c.newValue;
    },
    [StorageKey.KeyNegative]: (c) => {
      console.debug(`keyNegative: ${c.newValue}`);
      keyNegative = c.newValue;
    }
  });

  // listen for clicks
  document.addEventListener(
    "keydown",
    (event) => {
      // do nothing if scoring has not begun
      if (!$activated || $playbackMode || !$videoPlayerNode) {
        return;
      }

      if (event.key === keyPositive || event.key === keyNegative) {
        // disable default key actions
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        // ignore keys held down
        if (event.repeat) {
          console.debug(`capture key ${event.key}`);
          return;
        }

        const click = event.key === keyPositive ? +1 : -1;
        console.debug(`click ${click}`);
        dispatch("judgeClick", click);
      }
    },
    // capture prioritizes this event listener it's rly kool
    // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#capture
    { capture: true }
  );
</script>

<div id="clicker-browser-extension-counter-buttons">
  <button
    class="youtube-button green w-50 h-4em"
    title={keyPositive}
    on:click={() => dispatch("judgeClick", +1)}
    disabled={$playbackMode || !$videoPlayerNode}
  >
    +1<br />(Shortcut: "{keyPositive}")
  </button>
  <button
    class="youtube-button red w-50 h-4em"
    title={keyNegative}
    on:click={() => dispatch("judgeClick", -1)}
    disabled={$playbackMode || !$videoPlayerNode}
  >
    -1<br />(Shortcut: "{keyNegative}")
  </button>
</div>
