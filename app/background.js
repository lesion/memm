/* global chrome */
'use strict'

import storage from './storage'

chrome.omnibox.onInputChanged.addListener((input, fn) => {

  storage.search(input.split(' '))
  .then(ret => ret.map(url => ({content: url, description: url})))
  .then(suggestions => {
    console.error('BACKGROUND ! input changed :', suggestions)
    // chrome.omnibox.setDefaultSuggestion({description: suggestions[0].url})
    fn(suggestions)
  })
})

chrome.omnibox.onInputEntered.addListener((url, type) => {
  chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
    chrome.tabs.update(tabs[0].id, {url})  
  })
})
