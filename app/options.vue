<template lang="pug">
#options
  .content
    strong.title memm {{RELEASE}} / settings
    p Here's the place where you can change the few memm's settings:
    p.
      You can <a href='#' @click='omnibox = !omnibox'>{{omnibox?'disable':'enable'}}</a> omnibox,
      <a href='#' @click='sync = !sync'>{{sync?'disable':'enable'}}</a> syncronization between your browser and memm or
      just <a href='#' @click='importBookmarks'>import</a> your original bookmarks into memm once.
      You're able to privately store your data into a remote storage of your choice:
    #widget

    

    
  //-   span.
  //-     You have {{bookmarks.length}} bookmarks

  //- .content.links
  //-   form.pure-form
  //-     fieldset
  //-       legend Filter your bookmarks
  //-       input(placeholder='Title')
  //-       select.pure-input-1-2
  //-         option(value='last_month') Last day
  //-         option(value='last_month') Last week
  //-         option(value='last_month') Last month
  //-       input(placeholder='Tags')
  //- .content.links
  //-   ul
  //-     li(v-for='bookmark in bookmarks') 
  //-       a(:href="bookmark.url") {{bookmark.title}} [{{bookmark.tags}}]

    
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

let rs = new RemoteStorage({logging: false})
rs.access.claim('bookmarks', 'rw')

rs.setApiKeys('dropbox', {appKey: DROPBOX_APPKEY})
rs.caching.enable('/bookmarks/')

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
      omnibox: true,
      sync: true,
      'RELEASE': ENV.RELEASE,
      bookmarks: []
    }
  },
  components: { VueMarkdown },
  mounted () {
    rs.on('connected', this.connected)
    rs.on('disconnected', this.disconnected)
    setTimeout( () => {
        rs.displayWidget({ domID: 'widget', leaveOpen: true})
    }, 10)
  },
  methods: {
    importBookmarks () {

    },
    disconnected: () => {
      browser.runtime.sendMessage( {msg: 'disconnect'}, null )
    },
    connected: () => {
      browser.runtime.sendMessage( {msg: 'connect'}, null )
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
    font-size: 22px
    float: right
    
  button
    margin: 3px

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
