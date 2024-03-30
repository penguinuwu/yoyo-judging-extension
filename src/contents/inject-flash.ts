import type { PlasmoCSConfig } from "plasmo"

import { CustomEventType, DocumentSelector, StorageKey } from "~lib/constants"
import { consoleDebug, waitForElm } from "~lib/utils"

export const config: PlasmoCSConfig = { matches: ["https://*.youtube.com/*"] }

const keyframesPositive = {
  easing: "ease-out",
  boxShadow: ["0 0 4em 2em darkgreen", "none"]
}
const keyframesNegative = {
  easing: "ease-out",
  boxShadow: ["0 0 4em 2em crimson", "none"]
}

const animeOptions = {
  duration: 800,
  iterations: 1
}

;(async function () {
  const videoBackgroundElement: Element = await waitForElm(
    DocumentSelector.VideoBackground
  )

  document.addEventListener(CustomEventType.ClickFlash, (event) => {
    consoleDebug(`click ${event}`)
    if ("detail" in event && typeof event.detail === "string") {
      consoleDebug(`click ${event.detail}`)
      switch (event.detail) {
        case StorageKey.KeyPositive:
          consoleDebug(`click positive`)
          videoBackgroundElement.animate(keyframesPositive, animeOptions)
          break

        case StorageKey.KeyNegative:
          consoleDebug(`click negative`)
          videoBackgroundElement.animate(keyframesNegative, animeOptions)
          break

        default:
          consoleDebug(`click event broke ${JSON.stringify(event)}`)
          break
      }
    }
  })
})()
