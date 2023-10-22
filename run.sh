#!/bin/bash

ROOT_PATH="$(pwd)"
TMPDIR="$ROOT_PATH/browser-data"
if [[ ! -d "$TMPDIR" ]]; then
    mkdir --parents "$TMPDIR"
fi

# FIREFOX_BUILD_PATH="$ROOT_PATH/build/firefox-mv3-dev"
# # FIREFOX_USER_DIR="$(mktemp --directory "$TMPDIR/firefox.XXXXXXXXXX")"
# FIREFOX_USER_DIR="$TMPDIR/firefox"
# if [[ ! -d "$FIREFOX_USER_DIR" ]]; then
#     mkdir --parents "$FIREFOX_USER_DIR"
#     # can not make temp profile
#     # https://bugzilla.mozilla.org/show_bug.cgi?id=1604376
#     # bro this cli design/documentation feels so crusty
#     # https://wiki.mozilla.org/Firefox/CommandLineOptions#-CreateProfile_.22profile_name_profile_dir.22
#     firefox --CreateProfile "clicker-test $FIREFOX_USER_DIR"
# fi

CHROME_BUILD_PATH="$ROOT_PATH/build/chrome-mv3-dev"
# CHROME_USER_DIR="$(mktemp --directory "$TMPDIR/chrome.XXXXXXXXXX")"
CHROME_USER_DIR="$TMPDIR/chrome"
if [[ ! -d "$CHROME_USER_DIR" ]]; then
    mkdir --parents "$CHROME_USER_DIR"
fi

# # not sure if --no-remote or --new-instance does anything lol.......
# # https://github.com/yoasif/temporary-firefox/blob/master/macos-release.sh
# firefox \
#     --profile "$FIREFOX_USER_DIR" \
#     --no-remote \
#     --new-instance \
#     about:blank &

chromium \
    --password-store=basic \
    --user-data-dir="$CHROME_USER_DIR" \
    --load-extension="$CHROME_BUILD_PATH" \
    about:blank &
