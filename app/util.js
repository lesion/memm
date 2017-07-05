/* global chrome */
// import {insersection} from 'lodash'
const browser = chrome || browser

export default {
  // convert bookmarks into omnibar suggestions
  bookmarks2suggestion (tags, bookmarks) {
    return bookmarks.map(b => {
      // const foundTags = intersection(tags, b.tags)
      // TODO: order by number of matched tags
      return {
        content: b.url,
        description: `<url>${b.url.replace('&', '&amp;')}</url> <match>${b.tags.join(', ')}</match>`
      }
    })
  },

  // navigate to url
  setCurrentTabUrl (url) {
    browser.tabs.query({ currentWindow: true, active: true },
      tabs => { browser.tabs.update(tabs[0].id, {url}) })
  },

  getCurrentTabInfo () {
    return new Promise((resolve, reject) => {
      browser.tabs.query({active: true}, tabs => {
        resolve({ url: tabs[0].url, title: tabs[0].title, id: tabs[0].id })
      })
    })
  },

  // get tab info !
  getTabInfo (tabId) {
    return new Promise((resolve, reject) => {
      browser.tabs.get(tabId, resolve)
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

  // get/set extension options
  option: {
    get (name) {
      return new Promise((resolve, reject) => {
        browser.storage.local.get(name, items => {
          if (browser.runtime.lastError || !items[name]) {
            reject(new Error(browser.runtime.lastError))
          } else {
            resolve(items)
          }
        })
      })
    },
    set (name, value) {
      browser.storage.local.set({[name]: value})
    }
  }
}
