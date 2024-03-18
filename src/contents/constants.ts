enum StorageKey {
  KeyPositive = "KEY_POSITIVE",
  KeyNegative = "KEY_NEGATIVE"
}

enum DocumentSelector {
  Advertisement = "div.ad-showing",
  BelowVideo = "#primary-inner > #below",
  ChannelInfo = "#top-row > #owner",
  Video = "#movie_player video",
  VideoBackground = "ytd-player#ytd-player"
}

enum CustomEventType {
  Activate = "clicker-browser-extension:video-change",
  Click = "clicker-browser-extension:click"
}

export { CustomEventType, DocumentSelector, StorageKey }
