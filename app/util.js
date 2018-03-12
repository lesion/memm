/* global chrome, browser */
// import {insersection} from 'lodash'
import Bookmarks from './bookmarks'
const BROWSER = chrome || browser

export default {
  // convert bookmarks into omnibar suggestions
  bookmarks2suggestion (tags, bookmarks) {
    return bookmarks.map(b => {
      // const foundTags = intersection(tags, b.tags)
      // TODO: order by number of matched tags
      return {
        content: b.url,
        description: `${b.url.replace('&', '&amp;')} ${b.tags.join(', ')}`
      }
    })
  },

  // navigate to url
  setCurrentTabUrl (url) {
    BROWSER.tabs.query({ currentWindow: true, active: true },
      tabs => { BROWSER.tabs.update(tabs[0].id, {url}) })
  },

  getCurrentTabInfo () {
    return new Promise((resolve, reject) => {
      BROWSER.tabs.query({active: true}, tabs => {
        resolve({ url: tabs[0].url, title: tabs[0].title, id: tabs[0].id })
      })
    })
  },

  // get tab info !
  getTabInfo (tabId) {
    return new Promise((resolve, reject) => {
      BROWSER.tabs.get(tabId, resolve)
    })
  },
  // extract oauth token
  extractToken (url) {
    return url.match(/#access_token=([^&?]*)/)[1]
  },

  // check if is url
  isUrl (url) {
    return (url.match(/^http[s]?:\/\//) !== null)
  },

  sendMessage (msg) {
    return new Promise((resolve, reject) => {
      const ret = BROWSER.runtime.sendMessage(null, msg, null, resolve)
      if (ret && ret.then) return ret
    })
  },

  importBookmarks () {
    function scanTree (item) {
      if (item.url) {
        console.log(`bookmark ${item.url} added`)
        Bookmarks.store({url: item.url, tags: ['imported'], title: item.title})
      }

      // recursive import
      if (item.children) {
        item.children.forEach(scanTree)
      }
    }

    const bookmarkRoot = BROWSER.bookmarks.getTree(bookmarkItems => scanTree(bookmarkItems[0]))
    if (bookmarkRoot && bookmarkRoot.then) {
      bookmarkRoot.then(bookmarkItems => scanTree(bookmarkItems[0]))
    }
  },

  // get/set extension options
  option: {
    get (name) {
      return new Promise((resolve, reject) => {
        BROWSER.storage.local.get(name, items => {
          if (BROWSER.runtime.lastError || !items[name]) {
            reject(new Error(BROWSER.runtime.lastError))
          } else {
            resolve(items)
          }
        })
      })
    },
    set (name, value) {
      BROWSER.storage.local.set({[name]: value})
    }
  }
}
