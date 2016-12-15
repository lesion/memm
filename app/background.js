'use strict'

/* global chrome */
const browser = chrome || browser
const DROPBOX_APPKEY = 'anw6ijw3c9pdjse'
const GDRIVE_CLIENTID = '603557860486-njmfirchq2gp4k33hqmja0ch6m4puf93.apps.googleusercontent.com'

import RemoteStorage from 'remotestoragejs'
import 'remotestorage-module-bookmarks'

import util from './util'
import partial from 'lodash.partial'
import debounce from 'lodash.debounce'

let currentTabInfo = null
// let currentURLInfo = null
let currentTags = []

let rs

// check if running for the first time
util.option.get('no_first_run')
.catch(firstRun)

function firstRun (e) {
  console.error('Sono dentro first RUN!')
  util.option.set('no_first_run', true)

  // open options window
  // browser.runtime.openOptionsPage()
}

/**
 * background process is taking care of RemoteStorage communication
 * and omnibox
 */
function main () {
  rs = new RemoteStorage()
  rs.setApiKeys('dropbox', {appKey: DROPBOX_APPKEY})
  rs.setApiKeys('googledrive', {clientId: GDRIVE_CLIENTID})
  rs.access.claim('bookmarks', 'rw')
  rs.on('connected', partial(eventHandler, 'connected'))
  rs.on('disconnected', partial(eventHandler, 'disconnected'))
  rs.on('network-online', partial(eventHandler, 'network-online'))
  rs.on('network-offline', partial(eventHandler, 'network-offline'))
  rs.on('ready', partial(eventHandler, 'ready'))

  browser.runtime.onMessage.addListener(gotMessage)
  browser.tabs.onRemoved.addListener(removeCachedTab)
  browser.tabs.onUpdated.addListener(cacheTab)

  if (browser.omnibox) {
    browser.omnibox.onInputChanged.addListener(debounce(fillOmnibox, 10))
    browser.omnibox.onInputEntered.addListener(enterOmnibox)
  }
}

main()

function eventHandler (event) {
  console.error('dentro eventHandler' + event)
  if (['disconnected', 'network-offline'].includes(event)) {
    chrome.browserAction.setIcon({path: '/img/offline.png'})
  } else if (['connected', 'network-online'].includes(event)) {
    chrome.browserAction.setIcon({path: '/img/online.png'})
  }
}

function gotMessage (message, sender, cb) {
  console.error('sono dentro il background di gotMessage ! ', message)
  switch (message.msg) {
    case 'getURLInfo':
      console.error(cache)
      console.error(message.tabId)
      cb(cache[message.tabId])
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

function enterOmnibox (url, type) {
  if (!util.isUrl(url)) {
    rs.bookmarks.archive.store({url: currentTabInfo.url,
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

  rs.bookmarks.archive.searchByTags(tags)
    .then(partial(util.bookmarks2suggestion, tags))
    .then(cb)
}

let cache = {}

function cacheTab (id, updateProperty) {
  if (!updateProperty.status || updateProperty.status !== 'complete') return
  cache[id] = { ready: false }
  util.getCurrentTabInfo()
  .then(info => {
    // aggiorno la cache per questo tab !
    rs.bookmarks.archive.searchByURL(info.url)
    .then(bookmark => {
      console.error('dentro by url ', bookmark)
      if (!bookmark) return
      cache[id] = { bookmark }
      return rs.bookmarks.archive.searchByTags(bookmark.tags)
    })
    .then(related => {
      console.error('dentro related ', related)
      cache[id].related = related
      cache[id].ready = true
    })
  })
}

function removeCachedTab (id) {
  cache[id] = undefined
  delete cache[id]
}

// function updateActiveTab (id, updateProperty) {

  // return util.getCurrentTabInfo()
  //   .then(info => {
  //     // console.error('sono qui dentro 2,', info.url)
  //     if (currentTabInfo && currentTabInfo.url === info.url) return currentURLInfo
  //     // console.error('sono qui ok !?')
  //     currentTabInfo = info
  //     return rs.bookmarks.archive.searchByURL(info.url)
  //       .then(info => {
  //         currentURLInfo = info
  //         return info
  //       })
  //       .catch(e => {
  //         console.error('ERROR: ', e)
  //       })
  //   })
// }
