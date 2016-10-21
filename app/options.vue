<template lang='pug'>
#options
  remoteStorage(@connect='connect',:rs='rs')
  ul
    li(v-for='bookmark in bookmarks')
    
</template>

<script>

const DROPBOX_APPKEY = 'anw6ijw3c9pdjse'
const GDRIVE_CLIENTID = '603557860486-umim41h4sit6abt871a92k13r1e1d33q.apps.googleusercontent.com'

// remoteStorageWidget !!
const remoteStorageWidget = require('./remoteStorage.vue')

const util = require('./util')
const rs = new RemoteStorage()

// // oAuth dance (let RS use chrome.identity)
RemoteStorage.Authorize.getLocation = chrome.identity.getRedirectURL
RemoteStorage.Authorize.setLocation = (url) => {
  console.error('lancio ', url)
  chrome.identity.launchWebAuthFlow({url, interactive: true}, responseUrl => {
    console.error('launchWeb' + responseUrl)
    const token = util.extractToken(responseUrl)
    rs.remote.configure({token})
  })
}

rs.access.claim('bookmarks', 'rw')

module.exports = {
  components: { remoteStorage: remoteStorageWidget },
  data () {
    return { 
      rs,
      bookmarks: []
    }
  },
  mounted () {

  },
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


</style>