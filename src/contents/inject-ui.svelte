<script context="module" lang="ts">
  import type {
    PlasmoCSConfig,
    PlasmoGetInlineAnchor,
    PlasmoGetStyle,
    PlasmoMountShadowHost
  } from "plasmo";

  // CSUI dont work with svelte CSS extraction 💀
  // https://discord.com/channels/946290204443025438/1165938510432305193/
  // solution:
  // https://docs.plasmo.com/framework/content-scripts-ui/styling#import-stylesheet
  import styleText from "data-text:~contents/style.css";

  export const getStyle: PlasmoGetStyle = () => {
    // https://github.com/PlasmoHQ/plasmo/issues/161
    // https://github.com/PlasmoHQ/examples/tree/main/with-css-modules
    const style = document.createElement("style");
    style.textContent = styleText;
    return style;
  };

  export const config: PlasmoCSConfig = {
    // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Match_patterns
    // https://developer.chrome.com/docs/extensions/mv3/match_patterns/
    matches: ["https://*.youtube.com/*"],
    run_at: "document_start"
  };

  // https://docs.plasmo.com/framework/content-scripts-ui/life-cycle#inline
  export const getInlineAnchor: PlasmoGetInlineAnchor = async () => {
    return document.querySelector("#primary-inner > #below");
  };

  export const mountShadowHost: PlasmoMountShadowHost = ({
    anchor,
    shadowHost
  }) => {
    anchor!.element!.prepend(shadowHost);
  };
</script>

<script lang="ts">
  import { Storage } from "@plasmohq/storage";
  import { StorageKeys } from "~contents/store";
  import Scoreboard from "~injected-ui/scoreboard.svelte";

  const storage = new Storage();

  // activate/deactivate ui
  let activated = false;

  // set activation iife
  (async () => {
    activated = await storage.get(StorageKeys.Activated);
    console.debug(`ui get activate ${activated}`);

    // set default value
    if (typeof activated !== "boolean") {
      activated = false;
      storage.set(StorageKeys.Activated, false);
    }

    storage.watch({
      [StorageKeys.Activated]: (c) => {
        console.debug(`ui activated: ${c.newValue}`);
        activated = c.newValue;
      }
    });
  })();
</script>

<div
  id="clicker-browser-extension-ui"
  class={activated ? "" : "hidden-content"}
>
  <Scoreboard {activated} />
</div>
