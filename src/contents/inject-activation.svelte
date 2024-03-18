<script context="module" lang="ts">
  import type { PlasmoCSConfig, PlasmoGetRootContainer } from "plasmo";

  import { DocumentSelector } from "~contents/constants";
  import { waitForElm } from "~contents/utils";

  export const config: PlasmoCSConfig = {
    matches: ["https://*.youtube.com/*"]
  };

  export const getRootContainer: PlasmoGetRootContainer = async () =>
    await waitForElm(DocumentSelector.ChannelInfo);
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

<button
  class="yt-spec-button-shape-next yt-spec-button-shape-next--filled yt-spec-button-shape-next--mono yt-spec-button-shape-next--size-m"
  style="margin: 0 8px;"
  on:click={toggle}
>
  {#if !activated}
    Score
  {:else}
    Stop
  {/if}
</button>
