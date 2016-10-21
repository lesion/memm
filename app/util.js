/* global chrome */
import intersection from 'lodash.intersection'

module.exports = {
  // convert bookmarks into chrome omnibar suggestions
  bookmarks2suggestion (tags, bookmarks) {
    return bookmarks.map(b => {
      const foundTags = intersection(tags, b.tags)
      return {
        content: b.url,
        description: `<url>${b.url.replace('&', '&amp;')}</url> <match>${foundTags.join(', ')}</match>`
      }
    })
  },

  // navigate to url
  setCurrentTabUrl (url) {
    chrome.tabs.query({ currentWindow: true, active: true },
      tabs => { chrome.tabs.update(tabs[0].id, {url}) })
  },

  // get current tab info !
  getCurrentTabInfo () {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ currentWindow: true, active: true },
        tabs => {
          resolve({ url: tabs[0].url, title: tabs[0].title })
        })
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
        chrome.storage.local.get(name, items => {
          if (chrome.runtime.lastError || !items[name]) {
            reject(new Error(chrome.runtime.lastError))
          } else {
            resolve(items)
          }
        })
      })
    },
    set (name, value) {
      chrome.storage.local.set({name: value})
    }
  }
}
