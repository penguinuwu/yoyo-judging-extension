<script lang="ts">
  import { Storage } from "@plasmohq/storage";
  import { createEventDispatcher } from "svelte";

  import { StorageKey } from "~contents/constants";

  export let activated: boolean;
  export let videoPlayerNode: HTMLMediaElement;

  const dispatch = createEventDispatcher();

  // browser storage
  const storage = new Storage();

  // key bindings
  let positiveKey: string;
  let negativeKey: string;

  // get default keys iife
  (async function () {
    positiveKey = await storage.get(StorageKey.PositiveKey);
    negativeKey = await storage.get(StorageKey.NegativeKey);
    console.debug(`init get keys "${positiveKey}", "${negativeKey}"`);

    // some key is missing from storage, reset to default
    if (!positiveKey || !negativeKey) {
      console.debug("reset keys");
      positiveKey = "1";
      negativeKey = "0";
      storage.set(StorageKey.PositiveKey, positiveKey);
      storage.set(StorageKey.NegativeKey, negativeKey);
    }
  })();

  // watch for key binding changes
  storage.watch({
    [StorageKey.PositiveKey]: (c) => {
      console.debug(`positiveKey: ${c.newValue}`);
      positiveKey = c.newValue;
    },
    [StorageKey.NegativeKey]: (c) => {
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

        // ignore keys held down
        if (event.repeat) {
          console.debug(`capture key ${event.key}`);
          return;
        }

        const click = event.key === positiveKey ? +1 : -1;
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
    style="background-color: green;"
    title={positiveKey}
    on:click={() => dispatch("judgeClick", +1)}
  >
    +1<br />(Shortcut: "{positiveKey}")
  </button>
  <button
    style="background-color: red;"
    title={negativeKey}
    on:click={() => dispatch("judgeClick", -1)}
  >
    -1<br />(Shortcut: "{negativeKey}")
  </button>
</div>
