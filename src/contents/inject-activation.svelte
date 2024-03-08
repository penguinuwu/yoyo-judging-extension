<script context="module" lang="ts">
  import type {
    PlasmoCSConfig,
    PlasmoGetInlineAnchor,
    PlasmoMountShadowHost
  } from "plasmo";

  import { DocumentSelector } from "~contents/constants";

  export const config: PlasmoCSConfig = {
    // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Match_patterns
    // https://developer.chrome.com/docs/extensions/mv3/match_patterns/
    matches: ["https://*.youtube.com/*"]
  };

  // https://docs.plasmo.com/framework/content-scripts-ui/life-cycle#inline
  export const getInlineAnchor: PlasmoGetInlineAnchor = () => {
    return document.querySelector(DocumentSelector.ChannelInfo);
  };

  export const mountShadowHost: PlasmoMountShadowHost = ({
    anchor,
    shadowHost
  }) => {
    anchor!.element!.appendChild(shadowHost);
  };
</script>

<script lang="ts">
  import { CustomEventType } from "~contents/constants";

  let activated = false;

  // toggle activation boolean
  function toggle() {
    console.debug(`clicking button ${activated} -> ${!activated}`);
    // set it to reduce visual lag
    activated != activated;
    document.dispatchEvent(
      new CustomEvent(CustomEventType.Activate, { detail: !activated })
    );
  }

  // listen for button changes
  document.addEventListener(CustomEventType.Activate, (event) => {
    console.debug(`button activate ${event}`);
    // typescript thing
    if ("detail" in event && typeof event.detail === "boolean") {
      console.debug(`button activate ${activated} -> ${event.detail}`);
      activated = event.detail;
    } else {
      console.debug(`button activate event broke ${JSON.stringify(event)}`);
    }
  });
</script>

<button on:click={toggle}>
  {#if !activated}
    Score
  {:else}
    Stop
  {/if}
</button>
