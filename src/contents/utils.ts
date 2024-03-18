/**
 * wait for element then return querySelector result
 * https://stackoverflow.com/a/61511955
 * 
 * note: i give up on typescript i spent 2 hours
 * unions and custom types wont work 💀
 * @param {string} selector
 * @returns {Promise<Element>}
 */
function waitForElm(selector: string): Promise<any>{
  return new Promise((resolve) => {
    const element = document.querySelector(selector)
    if (element) return resolve(element)

    const observer = new MutationObserver((_mutations) => {
      const element = document.querySelector(selector)
      if (element) {
        resolve(element)
        observer.disconnect()
      }
    })

    observer.observe(document, {
      childList: true,
      subtree: true
    })
  })
}

/**
 * convert timestamp seconds to readable time format
 * @param timestamp seconds with decimal
 * @param maxTime seconds with decimal
 * @returns string format
 */
function formatTimestamp(timestamp: number, maxTime?: number) {
  // check if broken
  if (!maxTime) {
    console.debug(`formatTimestamp timestamp:${timestamp} maxTime:${maxTime}`)
    return "0"
  }

  // get first 4 digits of milliseconds
  const ms = Math.floor((timestamp * 10000) % 1000).toString()

  const s = Math.floor(timestamp % 60).toString()
  const m = Math.floor((timestamp / 60) % 60).toString()

  // no mod to limit hours
  const h = Math.floor(timestamp / 3600).toString()

  return maxTime < 3600
    ? `${m}:${s.padStart(2, "0")}.${ms.padStart(4, "0")}`
    : `${h}:${m.padStart(2, "0")}:${s.padStart(2, "0")}.${ms.padStart(4, "0")}`
}

export { formatTimestamp, waitForElm }
