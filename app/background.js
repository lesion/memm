/**
 * background process is taking care of RemoteStorage communication
 * and omnibox
 */

/* global chrome, browser */
'use strict'

import RemoteStorage from 'remotestoragejs'
import Bookmarks from 'remotestorage-module-bookmarks'

import util from './util'
import partial from 'lodash-es/partial'
import debounce from 'lodash-es/debounce'
import Bookmark from './bookmarks'

const BROWSER = chrome || browser
const DROPBOX_APPKEY = 'anw6ijw3c9pdjse'
const GDRIVE_CLIENTID = '603557860486-njmfirchq2gp4k33hqmja0ch6m4puf93.apps.googleusercontent.com'

let currentTags = []

// remoteStorage instance
let rs

function firstRun (e) {
  util.option.set('no_first_run', true)

  // open options window
  BROWSER.runtime.openOptionsPage()
}

// check if it's first time
util.option.get('no_first_run')
.catch(firstRun)

function eventHandler (event) {
  if (['disconnected', 'network-offline'].includes(event)) {
    BROWSER.browserAction.setIcon({path: '/img/offline.png'})
  } else if (['connected', 'network-online'].includes(event)) {
    BROWSER.browserAction.setIcon({path: '/img/online.png'})
  }
}

function main () {
  // initialize RemoteStorage
  window.rs = rs = new RemoteStorage({
    cache: true,
    logging: false,
    modules: [Bookmarks]
  })
  rs.setApiKeys({dropbox: DROPBOX_APPKEY, googledrive: GDRIVE_CLIENTID})
  rs.access.claim('bookmarks', 'rw')
  rs.caching.enable('/bookmarks/')

  // manage rs events (e.g. to set icon)
  rs.on('connected', partial(eventHandler, 'connected'))
  rs.on('disconnected', partial(eventHandler, 'disconnected'))
  rs.on('network-online', partial(eventHandler, 'network-online'))
  rs.on('network-offline', partial(eventHandler, 'network-offline'))
  rs.on('ready', partial(eventHandler, 'ready'))

  Bookmark.setRS(rs)

  // a message is coming from popup
  BROWSER.runtime.onMessage.addListener(handleMessage)

  // a tab is updated (new site loaded?)
  BROWSER.tabs.onUpdated.addListener(tabUpdated)

  // omnibox events handlers
  if (BROWSER.omnibox) {
    BROWSER.omnibox.onInputChanged.addListener(debounce(fillOmnibox, 100, {leading: true}))
    BROWSER.omnibox.onInputEntered.addListener(enterOmnibox)
  }
}

function fillOmnibox (input, cb) {
  var tags = input.split(/[\s,]+/)
  tags = tags.concat(currentTags)

  BROWSER.omnibox.setDefaultSuggestion({description: `${tags.join(', ')} ❇`})

  cb(util.bookmarks2suggestion(tags, Bookmark.byTags(tags)))
}

function handleMessage (message, sender, cb) {
  switch (message.msg) {
    case 'getURLInfo':
      cb(Bookmark.byURL(message.url))
      break

    case 'searchTags':
      cb(Bookmark.byTags(message.tags))
      break

    case 'setTags':
      Bookmark.store({url: message.url, title: message.title, tags: message.tags})
      const bookmarks = Bookmark.byURL(message.url)
      if (!bookmarks) {
        BROWSER.browserAction.setBadgeText({text: ``, tabId: message.tabId})
      } else {
        BROWSER.browserAction.setBadgeText({text: `${bookmarks.related.length}`, tabId: message.tabId})
      }
      cb(bookmarks)
      break

    case 'connect':
      rs._init()
      break

    case 'disconnect':
      rs._init()
      break
  }
  return true
}

function enterOmnibox (url, type) {
  // TODO: used to tag with omnibox
  // if (!util.isUrl(url)) {
  //   Bookmark.store({url: currentTabInfo.url,
  //     title: currentTabInfo.title,
  //     tags: url.split(/[\s,]+/)})
  // } else {
  util.setCurrentTabUrl(url)
  // }
  return true
}


function tabUpdated (tabId, updateProperty) {
  if (!updateProperty.status || updateProperty.status !== 'loading') return
  util.getTabInfo(tabId)
  .then(info => {
    const bookmark = Bookmark.byURL(info.url).then( bookmark => {
      if (!bookmark || bookmark.related.length === 0) {
        BROWSER.browserAction.setBadgeText({text: ``, tabId})
      } else {
        BROWSER.browserAction.setBadgeText({text: `${bookmark.related.length}`, tabId})
      }
    })
  })
  .catch(e => {
    console.error(e)
  })
}

main()