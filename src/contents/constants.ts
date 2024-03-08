enum StorageKey {
  PositiveKey = "POSITIVE_KEY",
  NegativeKey = "NEGATIVE_KEY"
}

enum DocumentSelector {
  Advertisement = "div.ad-showing",
  BelowVideo = "#primary-inner > #below",
  ChannelInfo = "#top-row > #owner",
  Video = "#movie_player video"
}

enum CustomEventType {
  Activate = "clicker-browser-extension:video-change"
}

export { CustomEventType, DocumentSelector, StorageKey }
