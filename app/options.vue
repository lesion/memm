<template lang="pug">
#options
  .content
    img(src='img/memm_40.png')
    b.title memm ({{RELEASE}})

    br
    br    
    vue-markdown.

      You can use it as a bookmarks manager, tag your bookmarks and see related links while doing it.
      __memm will NOT track you__. You can decide to save your data where you choose to:

    #widget
    
    span.
      You have {{bookmarks.length}} bookmarks

  .content.links
    form.pure-form
      fieldset
        legend Filter your bookmarks
        input(placeholder='Title')
        select.pure-input-1-2
          option(value='last_month') Last day
          option(value='last_month') Last week
          option(value='last_month') Last month
        input(placeholder='Tags')
  .content.links
    ul
      li(v-for='bookmark in bookmarks') 
        a(:href="bookmark.url") {{bookmark.title}} [{{bookmark.tags}}]

    
</template>

<script>

const util = require('./util')
import VueMarkdown from 'vue-markdown'
import RemoteStorage from 'remotestoragejs'
import 'remotestorage-module-bookmarks'
import 'remotestorage-widget'
import 'normalize.css/normalize.css'
import 'purecss'

const browser = chrome || browser

const DROPBOX_APPKEY = 'anw6ijw3c9pdjse'
const GDRIVE_CLIENTID = '603557860486-umim41h4sit6abt871a92k13r1e1d33q.apps.googleusercontent.com'

let rs = new RemoteStorage({logging: true})
rs.access.claim('bookmarks', 'rw')

rs.setApiKeys('dropbox', {appKey: DROPBOX_APPKEY})
rs.caching.enable('/bookmarks/')

// rs.displayWidget({ domID: '#widget'})

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
  mounted () {
    setTimeout( () => {
      console.error('dentro mounted !')
      rs.bookmarks.archive.getAll()
      .then( bookmarks => {
        console.error(bookmarks)
        this.bookmarks = bookmarks
        rs.displayWidget({ domID: 'widget'})
      })

    }, 500)
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

<style lang="stylus">

*
  box-sizing: border-box
  
html
  
  background: #eee
  font-family: "Ubuntu Mono"
  font-size: 18px
  padding: 12px

  .title
    font-size: 30px
    
  #widget
    margin-right: auto
    margin-left: auto
    width: 50%
    
    
  .content
    width: 60%
    margin-left: auto
    margin-right: auto
    padding 25px
    background #fff
    border: 1px solid #ccc
    margin-top: -1px

  .links 
    width: 80%

  img
    float: left
    margin-right: 10px
    
  ul
    list-style: none
    
  a
    text-decoration: none
    color: blue


</style>
