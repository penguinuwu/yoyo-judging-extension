<script context="module" lang="ts">
  import type {
    PlasmoCSConfig,
    PlasmoGetInlineAnchor,
    PlasmoGetStyle,
    PlasmoMountShadowHost
  } from "plasmo";

  import { DocumentSelector } from "~contents/constants";

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
    return document.querySelector(DocumentSelector.BelowVideo);
  };

  export const mountShadowHost: PlasmoMountShadowHost = ({
    anchor,
    shadowHost
  }) => {
    anchor!.element!.prepend(shadowHost);
  };
</script>

<script lang="ts">
  import JudgingPanel from "~injected-ui/main-panel.svelte";
</script>

<JudgingPanel />
