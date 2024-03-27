import { writable } from "svelte/store"

// initialize array of 10 objects
const scoreMap = writable(
  Array(10)
    .fill(undefined)
    .map(() => new Map<number, number>())
)

const videoPlayerNode = writable<HTMLMediaElement | undefined>()

const playbackMode = writable(false)

const activated = writable(false)

export { activated, playbackMode, scoreMap, videoPlayerNode }
