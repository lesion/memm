/* global chrome */
'use strict'

import storage from './storage'
;(function () {
  // alert(storage)
  window.addEventListener('DOMContentLoaded', loaded)

  function loaded () {
    chrome.tabs.query({ currentWindow: true, active: true }, getCurrentTab)
  }

  function getCurrentTab (tab) {
    var tags = document.getElementById('tags')
    tags.focus()
    tags.addEventListener('keypress', (e) => {
      if (e.keyCode === 13) done(tab, tags.value.split(','))
    })
  }

  function done (tab, tags) {
    var field = document.getElementById('field')
    field.classList = 'field done'
    document.body.classList = 'done'
    storage.set(tab[0].url, tags)
    // addBookmark(tab[0].url, tab[0].title, tags)
    // setTimeout(window.close, 900)
  }
})()

// var remoteStorage = new RemoteStorage({
//   logging: true,  // defaults to false
// })

// remoteStorage.access.claim('bookmarks','rw')

// remoteStorage.

// remoteStorage.displayWidget('remotestorage-connect')
// chrome.tabs.create({url: 'http://autistici.org'}, function(tab) {
// localStorage.setItem('auth-tab-id', tab.id)
// })
// function getParameterByName (url, name) {
//   var match = RegExp('[?&#]' + name + '=([^&]*)').exec(url.search)
//   return match && decodeURIComponent(match[1].replace(/\+/g, ' '))
// }
// var url = 'https://mystuff.ns0.it/rs/oauth/les?client_id=ciao&response_type=token&scope=bookmarks&redirect_uri=' + chrome.identity.getRedirectURL()
// chrome.identity.launchWebAuthFlow({url: url, interactive: true}, (ret) => {
//   console.error(ret)
//   console.error(getParameterByName(ret,'access_token'))
//   remoteStorage.remote.configure({
//     token: getParameterByName(ret,'access_token')
//   })
// })
// remoteStorage.connect('les@mystuff.ns0.it/rs')
// remoteStorage.on('ready', console.log.bind(console.log) )
// remoteStorage.on('connected', console.log.bind(console.log) )
// remoteStorage.on('disconnected', console.log.bind(console.log) )

// })

//   console.error(remoteStorage)

//   function pushAll(allDone) {
//     function pushOne(node, parentPath, cb) {
//       if(node.url) {
//         remoteStorage.bookmarks.store(parentPath, node.title, node.url, node.index, cb)
//       } else {
//         var i = 0, dirPath
//         var pushIter = function() {
//           if(i < node.children.length) {
//             pushOne(node.children[i++], dirPath, pushIter)
//           } else {
//             allDone()
//           }
//         }
//         remoteStorage.bookmarks.createDirectory(
//           parentPath, node.title, node.index,
//           function(p) { dirPath = p; pushIter(); }
//         )
//       }
//     }

//     chrome.bookmarks.getTree(function(tree) {
//       var root = tree[0]

//       remoteStorage.bookmarks.deactivateSync()

//       for(var i=0;i<root.children.length;i++) {
//         pushOne(root.children[i], '')
//       }

//       remoteStorage.bookmarks.activateSync()
//       remoteStorage.bookmarks.syncNow()

//     })
//   }

//   function pullAll() {
//     var note = document.getElementById('not-impl')
//     note.style.display = 'block'
//     setTimeout(function() {
//       note.style.display = 'none'
//     }, 2500)
//   }

//   remoteStorage.access.claim('bookmarks','rw')

//   remoteStorage.displayWidget('remotestorage-connect', {
//     syncShortcut: false,
//     authDialog: function(url) {
//       chrome.tabs.create({url: url}, function(tab) {
//         localStorage.setItem('auth-tab-id', tab.id)
//       })
//     }
//   })

//   var connected = ( remoteStorage.getWidgetState() == 'connected' ||
//                     remoteStorage.getWidgetState() == 'busy' )

//   document.getElementById(
//     connected ? 'connected-info' : 'intro'
//   ).style.display = 'block'

//   if(connected) {
//     document.getElementById('push-all').addEventListener('click', function(event) {
//       event.target.setAttribute('disabled', true)
//       pushAll(function() {
//         event.target.setAttribute('disabled', false)
//         var succ = document.getElementById('succ')
//         succ.style.display = 'block'
//         setTimeout(function() { succ.style.display = 'none'; }, 2500)
//       })
//     })
//     document.getElementById('pull-all').addEventListener('click', pullAll)
//   }

// })
