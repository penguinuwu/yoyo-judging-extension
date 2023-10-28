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
  import styleText from "data-text:./style.css";

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
    matches: ["*://*.youtube.com/*"]
  };

  // https://docs.plasmo.com/framework/content-scripts-ui/life-cycle#inline
  export const getInlineAnchor: PlasmoGetInlineAnchor = () => {
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

  import { isActivated } from "./store";

  // activate/deactivate ui
  let activated: boolean;
  isActivated.subscribe((value) => (activated = value));

  // browser storage
  const storage = new Storage();

  // key bindings
  let positiveKey: string;
  let negativeKey: string;

  // get default keys iife
  (async () => {
    positiveKey = await storage.get("positiveKey");
    negativeKey = await storage.get("negativeKey");
    console.debug(`init get keys "${positiveKey}", "${negativeKey}"`);

    // some key is missing from storage, reset to default
    if (!positiveKey || !negativeKey) {
      console.debug("reset keys");
      positiveKey = "1";
      negativeKey = "0";
      storage.set("positiveKey", positiveKey);
      storage.set("negativeKey", negativeKey);
    }
  })();

  // watch for key binding changes
  storage.watch({
    positiveKey: (c) => {
      console.debug(`positiveKey: ${c.newValue}`);
      positiveKey = c.newValue;
    },
    negativeKey: (c) => {
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
  <button>+1</button>
  <div id="clicker-browser-extension-timeline">
    {#each Array(10) as _, i}
      <div class="clicker-browser-extension-block" style="left: {i * 10}%">
        <div class="clicker-browser-extension-list">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Click</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody />
          </table>
        </div>
      </div>

      {#if i !== 9}
        <span
          class="clicker-browser-extension-tick"
          style="left: {(i + 1) * 10 - 0.1}%"
        />
      {/if}
    {/each}
  </div>
  <button>-1</button>
</div>
