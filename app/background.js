/* global chrome */
'use strict'

const browser = chrome || browser
const DROPBOX_APPKEY = 'anw6ijw3c9pdjse'
const GDRIVE_CLIENTID = '603557860486-njmfirchq2gp4k33hqmja0ch6m4puf93.apps.googleusercontent.com'

import RemoteStorage from 'remotestoragejs'
import 'remotestorage-module-bookmarks'

import util from './util'
import partial from 'lodash.partial'
import debounce from 'lodash.debounce'
import log from './log'

let currentTabInfo = null
let currentTags = []

// cache is url based
let cache = {}

// remoteStorage instance
let rs

// check if it's first time
util.option.get('no_first_run')
.catch(firstRun)

function firstRun (e) {
  util.option.set('no_first_run', true)

  // open options window
  browser.runtime.openOptionsPage()
}

/**
 * background process is taking care of RemoteStorage communication
 * and omnibox
 */
function main () {
  // initialize RemoteStorage
  rs = new RemoteStorage()
  rs.setApiKeys('dropbox', {appKey: DROPBOX_APPKEY})
  rs.setApiKeys('googledrive', {clientId: GDRIVE_CLIENTID})
  rs.access.claim('bookmarks', 'rw')

  // manage rs events (e.g. to set icon)
  rs.on('connected', partial(eventHandler, 'connected'))
  rs.on('disconnected', partial(eventHandler, 'disconnected'))
  rs.on('network-online', partial(eventHandler, 'network-online'))
  rs.on('network-offline', partial(eventHandler, 'network-offline'))
  rs.on('ready', partial(eventHandler, 'ready'))

  // a message is coming from popup
  browser.runtime.onMessage.addListener(handleMessage)

  // cache needs an update when:
  // - a tab is updated (load complete)
  // - a tab is removed
  browser.tabs.onRemoved.addListener(removeCachedTab)
  browser.tabs.onUpdated.addListener(cacheTab)

  // omnibox events handlers
  if (browser.omnibox) {
    browser.omnibox.onInputChanged.addListener(debounce(fillOmnibox, 100, {leading: true}))
    browser.omnibox.onInputEntered.addListener(enterOmnibox)
  }
}

main()

function eventHandler (event) {
  if (['disconnected', 'network-offline'].includes(event)) {
    chrome.browserAction.setIcon({path: '/img/offline.png'})
  } else if (['connected', 'network-online'].includes(event)) {
    chrome.browserAction.setIcon({path: '/img/online.png'})
  }
}

function handleMessage (message, sender, cb) {
  switch (message.msg) {
    case 'getURLInfo':
      log(`[getURLInfo] ${message.url}`)
      log(message)
      cb(cache[message.url])
      break

    case 'setTags':
      log('[setTags] ')
      rs.bookmarks.archive.store(message)
      .then(() => updateCache(message.url, message.tabId))
      .then(info => {
        cb(info)
      })
      .catch(e => {
        cb(undefined)
      })

      break
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

function updateCache (url, id) {
   // update cache for an url
  let ntags = 0
  return rs.bookmarks.archive.searchByURL(url)
  .then(bookmark => {
    if (!bookmark || bookmark.tags.length === 0) {
      cache[url] = undefined
      browser.browserAction.setBadgeText({text: '', tabId: id})
      return Promise.reject(undefined)
    }

    cache[url] = { bookmark }
    ntags = bookmark.tags.length
    return rs.bookmarks.archive.searchByTags(bookmark.tags)
  }).then(related => {
    const nRelated = related.length ? related.length - 1 : 0
    browser.browserAction.setBadgeText({text: `${nRelated}/${ntags}`, tabId: id})
    cache[url].related = related
    cache[url].ready = true
    return cache[url]
  })
}

function cacheTab (id, updateProperty) {
  if (!updateProperty.status || updateProperty.status !== 'complete') return
  util.getCurrentTabInfo()
  .then(info => updateCache(info.url, id))
}

function removeCachedTab (id) {
  // console.error('removed Cached ', id, arguments)
  // cache[id] = undefined
  // delete cache[id]
}
