<template lang="pug">
#options
  img(src='img/memm_40.png')
  .beginning
    vue-markdown.
      __memm__ ({{RELEASE}})
      You can use it as a bookmarks manager, tag your bookmarks and see related links while doing it. 
      __memm will NOT track you__. You can decide to save your data where you choose to:
  ul
    li(v-for='bookmark in bookmarks')
    
</template>

<script>

const util = require('./util')
import VueMarkdown from 'vue-markdown'
import RemoteStorage from 'remotestoragejs'
import 'remotestorage-widget'
const browser = chrome || browser

const DROPBOX_APPKEY = 'anw6ijw3c9pdjse'
const GDRIVE_CLIENTID = '603557860486-umim41h4sit6abt871a92k13r1e1d33q.apps.googleusercontent.com'

let rs = new RemoteStorage()
rs.setApiKeys('dropbox', {appKey: DROPBOX_APPKEY})

rs.displayWidget()


// oAuth dance (let RS use chrome.identity)
RemoteStorage.Authorize.getLocation = browser.identity.getRedirectURL
RemoteStorage.Authorize.setLocation = url => {
  browser.identity.launchWebAuthFlow({url, interactive: true}, responseUrl => {
   if (!browser.runtime.lastError) {
     const token = util.extractToken(responseUrl)
     rs.remote.configure({token})
   } else {
    console.error(browser.runtime.lastError)
   }
 })
}

rs.access.claim('bookmarks', 'rw')
module.exports = {
  data () {
    return { 
      rs,
      'RELEASE': ENV.RELEASE,
      bookmarks: []
    }
  },
  components: { VueMarkdown },
  methods: {
    connect: user => {
      if (user=='dropbox') {
        rs.setApiKeys('dropbox', {appKey: DROPBOX_APPKEY})
        rs.setBackend('dropbox')
        rs.dropbox.connect()
      } else if (user==='gdrive') {
        let gdrive = new RemoteStorage.GoogleDrive(rs, GDRIVE_CLIENTID)
        gdrive.connect()
      } else {
        rs.connect(user)
      }
    }
  }
}
</script>

<style lang='stylus' scoped>
html
  background: #ccc
  font-family: Arial
  font-size: 18px

  img
    float: left
    margin-right: 10px


</style>
