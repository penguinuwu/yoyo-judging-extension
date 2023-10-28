<script context="module" lang="ts">
  import type {
    PlasmoCSConfig,
    PlasmoGetInlineAnchor,
    PlasmoMountShadowHost
  } from "plasmo";

  export const config: PlasmoCSConfig = {
    // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Match_patterns
    // https://developer.chrome.com/docs/extensions/mv3/match_patterns/
    matches: ["*://*.youtube.com/*"]
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
  import { isActivated } from "./store";

  // activate/deactivate ui
  let activated: boolean;
  isActivated.subscribe((value) => (activated = value));

  // toggle activation boolean
  const toggle = () => isActivated.set(!activated);
</script>

<button on:click={toggle}>
  {#if !activated}
    Score
  {:else}
    Stop
  {/if}
</button>
