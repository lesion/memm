/* global chrome */
/*
 * set( url, tags)
 * get( url ) =>  tags
 * search( [tags] ) => [urls]
 *
 * each tag contains a list of url
 * searching more tags has to be sorted ... (n of tags, most recent!)
 *
 * {
 *   'tag1': [ 'site1', 'site2', 'site3' ]
 *   'tag2': [ 'site1', 'site2']
 * }
 *
 * get('tag1')
 * 
 */

import 'chrome-storage-promise'
let storage = chrome.storage.promise.local

export default {
  set (url, newTags) {
    console.error('dentro il set di ' + url + ' inserisco ', newTags)
    // prendo prima tutti i tag gia' presenti per questo url
    // storage.get(`url:${url}`)
    // .then(currentTags => {
    var obj = {}
    newTags.forEach(tag => { obj[tag] = url })
    storage.set(obj)
    storage.set({ [`url:${url}`]: newTags })
    //  })
  },

  get (url) {
    return storage.get(`url:${url}`)
  },

  search (tags) {
    return storage.get(tags)
    .then(urls => {
      console.error('URLS: ', urls)
      return Object.values(urls) //.values()
    })
  }
}
