/* global chrome */

import RemoteStorage from 'remotestoragejs'
import util from './util'

let rs = new RemoteStorage()
rs.access.claim('bookmarks', 'rw')

RemoteStorage.Authorize.getLocation = chrome.identity.getRedirectURL
RemoteStorage.Authorize.setLocation = (url) => {
  chrome.identity.launchWebAuthFlow({url, interactive: true}, (responseUrl) => {
      console.error('porcodio sono qua !!!', responseUrl)
      // if (chrome.runtime.lastError) return
      let params = util.extractParams(responseUrl)
      rs.remote.configure({token: params.access_token})
    })
}

rs.remote.on('change', e => { console.error('CHANGE: ', e) })
rs.on('connected', e => { console.error('CONNECTED: ', e) })
rs.on('wire-done', e => { console.error('WIRE-DONE: ', e) })

chrome.storage.local.get( 'options', ret => {
  start(ret.options)
})

function login (options) {

}

function start (options) {
  console.error('[MEM] Dentro RS!', options)
  if (options.token && options.username) {
    auth(options)
  } else {
    // blink the icon
  }
}

// check if we have a saved token and try to use that

// connect to remoteStorage

// in case of auth failure ask for permission

//const bookmark = {
  //url: 'http://jsunconf.eu',
  //title: 'JS unconference in Hamburg',
  //tags: ['javascript', 'conference']
//}

//import bookmarks from 'remotestorage-module-bookmarks'
//rs.bookmarks.archive.store(bookmark)
//.then(console.log.bind(console))
//.catch(console.error.bind(console))



// console.error(rs.bookmarks.archive.getAll()
//   .then(console.log.bind(console))
//   .catch(console.error.bind(console)))


chrome.extension.onConnect.addListener(port => {
  port.onMessage.addListener(user => {
    console.error('dentro on message', user)
    rs.connect(user)
  })
})

// let currentUrl

// chrome.omnibox.onInputChanged.addListener((input, fn) => {
//   chrome.omnibox.setDefaultSuggestion({description: `Add ${input} to <url>${currentUrl}</url> ❇`})
//   storage.search(input.split(/[\s,]+/))
//     .then(ret => {
//       let urls = Object.keys(ret)
//       return urls.map(url => {
//         return {
//           content: url,
//           description: `<url>${url}</url> <match>${ret[url].tags.join(', ')}</match>`
//         }
//       })
//     })
//     // .then(ret => ret.map(url => ({content: url, description: url})))
//     .then(suggestions => {
//       console.error('BACKGROUND ! input changed :', suggestions)
//       fn(suggestions)
//     })
// })

// chrome.omnibox.onInputStarted.addListener(() => {
//   chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
//     currentUrl = tabs[0].url
//   })
// })

// chrome.omnibox.onInputEntered.addListener((url, type) => {
//   //   // qui devo controllare se 
//   // alert(type)
//   if (!isUrl(url)) {
//     // qui devo taggare la roba 
//     storage.add(currentUrl, url.split(/[\s,]+/))
//     console.error('adding !!')
//     return
//   }
//   chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
//     chrome.tabs.update(tabs[0].id, {url})
//   })
//   return true
// })
