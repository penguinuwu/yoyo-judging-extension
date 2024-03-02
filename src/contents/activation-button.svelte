<script context="module" lang="ts">
  import type {
    PlasmoCSConfig,
    PlasmoGetInlineAnchor,
    PlasmoMountShadowHost
  } from "plasmo";

  export const config: PlasmoCSConfig = {
    // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Match_patterns
    // https://developer.chrome.com/docs/extensions/mv3/match_patterns/
    matches: ["https://*.youtube.com/*"]
  };

  // https://docs.plasmo.com/framework/content-scripts-ui/life-cycle#inline
  export const getInlineAnchor: PlasmoGetInlineAnchor = () => {
    return document.querySelector("#top-row > #owner");
  };

  export const mountShadowHost: PlasmoMountShadowHost = ({
    anchor,
    shadowHost
  }) => {
    anchor!.element!.appendChild(shadowHost);
  };
</script>

<script lang="ts">
  import { Storage } from "@plasmohq/storage";
  import { StorageKeys } from "~contents/store";

  const storage = new Storage();

  let activated: boolean;

  // toggle activation boolean
  const toggle = () => {
    console.debug(`clicking button ${activated}`);
    storage.set(StorageKeys.Activated, !activated);
  };

  // set activation iife
  (async () => {
    activated = await storage.get(StorageKeys.Activated);
    console.debug(`button get activate ${activated}`);

    if (typeof activated !== "boolean") {
      activated = false;
      storage.set(StorageKeys.Activated, false);
    }

    storage.watch({
      [StorageKeys.Activated]: (c) => {
        console.debug(`button activated: ${c.newValue}`);
        activated = c.newValue;
      }
    });
  })();
</script>

<button on:click={toggle}>
  {#if !activated}
    Score
  {:else}
    Stop
  {/if}
</button>
