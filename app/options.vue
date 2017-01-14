<template lang="pug">
#options(@keydown='keydown')
  .left.pure-u-1-5
    strong.title memm {{RELEASE}} / settings

    p Here's the place where you can change the few memm's settings:
    p.
      You can <a href='#' @click='omnibox = !omnibox'>{{omnibox?'disable':'enable'}}</a> omnibox,
      <a href='#' @click='sync = !sync'>{{sync?'disable':'enable'}}</a> syncronization between your browser and memm or
      just <a href='#' @click='importBookmarks'>import</a> your original bookmarks into memm once.
      <br><br>
      You're able to privately store your data into a remote storage of your choice:
    #widget

  .right.pure-u-4-5
    .content
      form.pure-form
        fieldset
          legend You have {{rsBookmarks.length}} bookmarks | Filter your bookmarks
          input(placeholder='Title | url | tags', type='text', v-model='search', autofocus)
          div.tag(v-for='(tag, index) in searchTags') 
            a(@click='searchTags.splice(index, 1)', href='#') x 
            span {{tag}}

    .content.links
      ul(@mouseenter='enter')
        li(v-for='(bookmark, index) in bookmarks') 
          a(:href="bookmark.url",:class='{selected: selected==index}') {{bookmark.title}}
            div.tag(v-for='tag in bookmark.tags')
              span {{tag}}
            span.url {{bookmark.url}}

    a.fork(href='https://github.com/lesion/memm')
      img(src="https://camo.githubusercontent.com/38ef81f8aca64bb9a64448d0d70f1308ef5341ab/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f6461726b626c75655f3132313632312e706e67",alt="Fork me on GitHub")
    
</template>

<script>

const util = require('./util')
import VueMarkdown from 'vue-markdown'
import RemoteStorage from 'remotestoragejs'
import 'remotestorage-module-bookmarks'
import 'remotestorage-widget'
import 'normalize.css/normalize.css'
import 'purecss'
import {intersection} from 'lodash'

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
      rsBookmarks: [],
      orderBy: '',
      searchTags: [],
      search: '',
      selected: -1
    }
  },
  computed: {
    bookmarks () {
      // assign matching points
      // show only > 0
      // sort by it
      const m = 0
      return this.rsBookmarks.filter( b => {
        if(this.search) {
          if (b.title.toLowerCase().indexOf(this.search.toLowerCase())>-1 ||
              b.url.toLowerCase().indexOf(this.search.toLowerCase())>-1) return true
        }

        if (this.searchTags.length) {
          console.error(intersection(this.searchTags, b.tags))
          if(intersection(this.searchTags, b.tags).length) {
            return true
          }
        }

        return false

      })
    }
  },
  components: { VueMarkdown },
  mounted () {
    rs.on('connected', this.connected)
    rs.on('disconnected', this.disconnected)
    rs.bookmarks.archive.getAll()
    .then(bookmarks => {

      this.rsBookmarks = bookmarks.filter(b=>b!==true)
    })

    rs.on('ready', () => {
        rs.displayWidget({ domID: 'widget', leaveOpen: true}) })
  },
  methods: {
    enter () {
      this.selected = -1
    },
    keydown (ev) {

      const ARROW_UP    = 38
      const ARROW_DOWN  = 40
      const ENTER       = 13
      const SPACE       = 32
      const TAB         = 9
      const COMMA       = 188

      if(ev.which == ARROW_UP) {
        if (this.selected === -1)
          this.selected = this.bookmarks.length-1
        else
          this.selected -= 1
      }

      if(ev.which === ARROW_DOWN) {
        if (this.selected === this.bookmarks.length-1)
          this.selected = -1
        else
          this.selected += 1
      }

      if (ev.which === SPACE || ev.which === TAB || ev.which === COMMA)
      {
        // lo pulisco
        const tag = this.search.replace(/[,\s]+/,'')

        // devo controllare non sia vuoto e che non sia
        // gia esistente !!
        if (!tag || this.searchTags.indexOf(tag)!==-1) {
          ev.preventDefault()
          return
        }

        // aggiungo il tag alla lista
        this.searchTags.push(tag)

        // azzero l'input corrente
        this.search = ''
        ev.preventDefault()
      }

      if(ev.which === ENTER) {
        ev.preventDefault()
        browser.tabs.create({url: this.bookmarks[this.selected].url, active: true})
      }
    },
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

  
html,
body,
#options
  background: #eee
  font-family: "Ubuntu Mono"
  font-size: 18px
  padding: 0px
  margin: 0px
  height: 100%
  
#options
  display: flex

  .title
    font-size: 22px
    
  button
    margin: 3px

  .right
    background #f9f9f9
    border-left 1px solid #ddd
    
    form
      margin-top: 50px
      padding-left: 15px
    
    .url
      transition: opacity .2s
      position: absolute
      opacity: 0
      margin-left: 5px
      top: 10px
      right: 160px
      font-weight: bold
      color: #333
      max-width: 60%
      overflow: hidden
      line-height: 19px      

      
    .links
      a
        padding-left: 15px
        width: 100%
        display: block
        font-family: "Open sans", Arial
        
      a.selected .url
      a:hover .url
        opacity: 1
      
      a.selected
      a:hover
        background-color: #eee
    
  .left
    padding 15px
    background #fff

  .rs-widget
    margin: 0px

  img
    float: left
    
  ul
    list-style: none
    margin 0px
    padding 0px
    
    li
      line-height: 30px
      width 100%
    
  a
    text-decoration: none
    color: blue

    &.fork
      position: absolute
      top: 0
      right: 0
      border: 0

  .tag
    background-color #c9c8d2
    padding: 1px 5px 2px 5px
    margin-left: 5px
    margin-bottom: 5px
    border-radius: 2px
    display: inline
    color: #444
    font-size: 15px
    


</style>
