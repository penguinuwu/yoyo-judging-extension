/**
 * wait for element then return querySelector result
 * https://stackoverflow.com/a/61511955
 *
 * note: i give up on typescript i spent 2 hours
 * unions and custom types wont work 💀
 * @param {string} selector
 * @returns {Promise<Element>}
 */
function waitForElm(selector: string): Promise<any> {
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

    observer.observe(document, { childList: true, subtree: true })
  })
}

/**
 * return scores per second
 * @param score
 * @param time seconds with decimal
 * @returns string format
 */
function getScoresPerSecond(score: number, time: number) {
  if (time === 0 || !Number.isFinite(time) || Number.isNaN(time)) {
    return "N/A clicks/second"
  }
  return `${(score / time).toFixed(2)} clicks/second`
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

/**
 * return first index where condition is true
 * thanks to https://stackoverflow.com/a/6554035/
 * TODO: prove correctness lmao 💀
 * @param array assuming it is sorted
 * @param condition assuming true for lower half and false for upper half
 * @returns index
 */
function findIndexSorted<T>(array: T[], condition: (element: T) => boolean) {
  // empty array or final value greater than lowerbound
  if (array.length <= 0 || condition(array[array.length - 1])) {
    return undefined
  }

  // first value is greater than lowerbound
  if (!condition(array[0])) {
    return 0
  }

  let low = 0
  let high = array.length

  // begin binary search
  while (low < high) {
    const mid = Math.floor((low + high) / 2)

    if (condition(array[mid])) {
      // condition is satisfied, thus check lower indicies
      high = mid
    } else {
      // condition is not satisfied, thus check higher indicies
      low = mid + 1
    }
  }

  return low === high ? low : -1
}

export { findIndexSorted, formatTimestamp, getScoresPerSecond, waitForElm }
