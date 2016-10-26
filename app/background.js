/* global chrome */
const DROPBOX_APPKEY = 'anw6ijw3c9pdjse'
const GDRIVE_CLIENTID = '603557860486-njmfirchq2gp4k33hqmja0ch6m4puf93.apps.googleusercontent.com'

import RemoteStorage from 'remotestoragejs'
import 'remotestorage-module-bookmarks'

import util from './util'
import partial from 'lodash.partial'
import debounce from 'lodash.debounce'

// check first run
util.option.get('no_first_run')
.catch(firstRun)

let currentTabInfo = null
let currentTags = []
const rs = new RemoteStorage()

function firstRun (e) {
  util.option.set('no_first_run', true)

  // open option window
  chrome.runtime.openOptionsPage()
}

function main () {
  rs.setApiKeys('dropbox', {appKey: DROPBOX_APPKEY})
  rs.setApiKeys('googledrive', {clientId: GDRIVE_CLIENTID})
  rs.access.claim('bookmarks', 'rw')

  chrome.omnibox.onInputChanged.addListener(debounce(fillOmnibox, 10))
  // chrome.omnibox.onInputStarted.addListener(getCurrentTabInfo)
  chrome.runtime.onMessage.addListener(gotMessage)
  chrome.tabs.onUpdated.addListener(getCurrentTabInfo)
}

main()

function gotMessage (message, sender, cb) {
  switch (message.msg) {
    case 'getURLInfo':
      getURLInfo(message.url)
        .then(cb)
      break
    case 'setTags':
      rs.bookmarks.archive.store({url: message.url,
        title: message.title,
        tags: message.tags})
      break
    case 'getMatch':
      // devo cercare i match per i tag che mi arrivano
      rs.bookmarks.archive.searchByTags(message.tags)
        .then(cb)
  }
  return true
}

function fillOmnibox (input, cb) {
  var tags = input.split(/[\s,]+/)
  tags = tags.concat(currentTags)

  chrome.omnibox.setDefaultSuggestion({description: `${tags.join(', ')} ❇`})

  rs.bookmarks.archive.searchByTags(tags)
    .then(partial(util.bookmarks2suggestion, tags))
    .then(cb)
}

function getURLInfo (url) {
  return rs.bookmarks.archive.searchByURL(url)
}

function getCurrentTabInfo () {
  // get current tab info
  return util.getCurrentTabInfo()
    .then(info => {
      currentTabInfo = info
      // get current tags
      getURLInfo(info.url)
        .then(bookmark => { currentTags = bookmark.tags })
        .catch(() => { currentTags = [] })
    })
}

chrome.omnibox.onInputEntered.addListener((url, type) => {
  if (!util.isUrl(url)) {
    rs.bookmarks.archive.store({url: currentTabInfo.url,
      title: currentTabInfo.title,
      tags: url.split(/[\s,]+/)})
  } else {
    util.setCurrentTabUrl(url)
  }
  return true
})
