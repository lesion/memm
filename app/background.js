/* global chrome */
'use strict'

/**
 * background process is taking care of RemoteStorage communication
 * and omnibox
 */

const browser = chrome || browser
const DROPBOX_APPKEY = 'anw6ijw3c9pdjse'
const GDRIVE_CLIENTID = '603557860486-njmfirchq2gp4k33hqmja0ch6m4puf93.apps.googleusercontent.com'

import RemoteStorage from 'remotestoragejs'
import 'remotestorage-module-bookmarks'

import util from './util'
import partial from 'lodash.partial'
import debounce from 'lodash.debounce'
// import log from './log'

import Bookmark from './bookmarks'

let currentTags = []

// remoteStorage instance
let rs

// check if it's first time
// TOFIX
util.option.get('no_first_run')
.catch(firstRun)

function firstRun (e) {
  util.option.set('no_first_run', true)

  // open options window
  browser.runtime.openOptionsPage()
}

function main () {
  // initialize RemoteStorage
  window.rs = rs = new RemoteStorage()
  rs.setApiKeys('dropbox', {appKey: DROPBOX_APPKEY})
  rs.setApiKeys('googledrive', {clientId: GDRIVE_CLIENTID})
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
  browser.runtime.onMessage.addListener(handleMessage)

  // a tab is updated (new site loaded?)
  browser.tabs.onUpdated.addListener(tabUpdated)

  // omnibox events handlers
  if (browser.omnibox) {
    browser.omnibox.onInputChanged.addListener(debounce(fillOmnibox, 100, {leading: true}))
    browser.omnibox.onInputEntered.addListener(enterOmnibox)
  }
}

main()

function eventHandler (event) {
  if (['disconnected', 'network-offline'].includes(event)) {
    browser.browserAction.setIcon({path: '/img/offline.png'})
  } else if (['connected', 'network-online'].includes(event)) {

    browser.browserAction.setIcon({path: '/img/online.png'})
    Bookmark.sync()
  }
}

function handleMessage (message, sender, cb) {
  switch (message.msg) {
    case 'getURLInfo':

      cb(Bookmark.byURL(message.url))
      break

    case 'setTags':
      Bookmark.store({url: message.url, title: message.title, tags: message.tags})
      const bookmark = Bookmark.byTags(message.tags, message.url)
      if (!bookmark || bookmark.related.length === 0) {
        browser.browserAction.setBadgeText({text: ``, tabId: message.tabId})
      } else {
        browser.browserAction.setBadgeText({text: `${bookmark.related.length}`, tabId: message.tabId})
      }
      cb(bookmark)
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
  if (!util.isUrl(url)) {
    Bookmark.store({url: currentTabInfo.url,
      title: currentTabInfo.title,
      tags: url.split(/[\s,]+/)})
  } else {
    util.setCurrentTabUrl(url)
  }
  return true
}

function fillOmnibox (input, cb) {
  var tags = input.split(/[\s,]+/)
  tags = tags.concat(currentTags)

  browser.omnibox.setDefaultSuggestion({description: `${tags.join(', ')} ❇`})

  util.bookmarks2suggestion(tags, Bookmark.byTags(tags))
  .then(cb)
  .catch(e => {
    console.error(e)
  })
}

function tabUpdated (tabId, updateProperty) {
  if (!updateProperty.status || updateProperty.status !== 'loading') return
  util.getTabInfo(tabId)
  .then(info => {
    const bookmark = Bookmark.byURL(info.url)
    if (!bookmark || bookmark.related.length === 0) {
      browser.browserAction.setBadgeText({text: ``, tabId})
    } else {
      browser.browserAction.setBadgeText({text: `${bookmark.related.length}`, tabId})
    }
  })
  .catch(e => {
    console.error(e)
  })
}
