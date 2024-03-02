/**
 * wait for element then return querySelector result
 * https://stackoverflow.com/a/61511955
 * @param {string} selector
 * @returns Promise<Element>
 */
export function waitForElm(selector: string) {
  // TODO: typescript this 💀
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

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
  })
}
