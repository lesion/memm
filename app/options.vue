<template lang="pug">
#options
  .left.pure-u-2-5
    strong.title memm {{RELEASE}} / settings

    p Here's the place where you can change the few memm's settings:
    p.
      You can <a href='#' @click='omnibox = !omnibox'>{{omnibox?'disable':'enable'}}</a> omnibox,
      <a href='#' @click='sync = !sync'>{{sync?'disable':'enable'}}</a> syncronization between your browser and memm or
      just <a href='#' @click='importBookmarks'>import</a> your original bookmarks into memm once.
      <br><br>
      You're able to privately store your data into a remote storage of your choice:
    #widget

  .right.pure-u-3-5
    .content
      form.pure-form
        fieldset
          legend You have {{rsBookmarks.length}} total bookmarks and {{bookmarks.length}} shown | Filter your bookmarks
          input(placeholder='Title | url | tags', type='text', v-model='search', autofocus, @keydown='keydown')
          div.tag(v-for='(tag, index) in searchTags') 
            a(@click='searchTags.splice(index, 1)', href='#') x 
            span {{tag}}

    .content.links
      ul(@mouseenter='enter')
        li(v-for='(bookmark, index) in bookmarks')
          span.remove(@click='remove(bookmark.id)') x 
          a(:href="bookmark.url",:class='{selected: selected==index}') {{bookmark.title}}
            div.tag(v-for='tag in bookmark.tags')
              span {{tag}}


    a.fork(href='https://github.com/lesion/memm')
      img(src="img/fork.png",alt="Fork me on GitHub")
    
</template>

<script>

import util from './util'
import VueMarkdown from 'vue-markdown'
import RemoteStorage from 'remotestoragejs'
import Bookmarks from 'remotestorage-module-bookmarks'
import Widget from 'remotestorage-widget'
import 'normalize.css/normalize.css'
import 'purecss'
import {intersection} from 'lodash'

const browser = chrome || browser

const DROPBOX_APPKEY = 'anw6ijw3c9pdjse'
const GDRIVE_CLIENTID = '603557860486-umim41h4sit6abt871a92k13r1e1d33q.apps.googleusercontent.com'

let rs = new RemoteStorage({logging: true, modules: [Bookmarks]})

rs.setApiKeys('dropbox', {appKey: DROPBOX_APPKEY})
rs.setApiKeys('googledrive', {clientId: GDRIVE_CLIENTID})

rs.access.claim('bookmarks', 'rw')
rs.caching.enable('/bookmarks/')

// oAuth dance (let RS use chrome.identity)
RemoteStorage.Authorize.getLocation = browser.identity.getRedirectURL
RemoteStorage.Authorize.setLocation = url => {
  browser.identity.launchWebAuthFlow({url, interactive: true}, responseUrl => {
    console.error(responseUrl)
    if (!browser.runtime.lastError) {
      const token = util.extractToken(responseUrl)
      rs.remote.configure({token})
    } else {
      console.error(browser.runtime.lastError)
    }
 })
}

rs.access.claim('bookmarks', 'rw')
export default {
  data () {
    return { 
      // rs,
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
        if (this.searchTags.length) {
          return (intersection(this.searchTags, b.tags).length > 0)
        }

        // if(this.search) {
          if (b.title.toLowerCase().indexOf(this.search.toLowerCase())>-1 ||
              b.url.toLowerCase().indexOf(this.search.toLowerCase())>-1) return true
        // }


        return false

      })
    }
  },
  components: { VueMarkdown },
  mounted () {
    const that = this
    rs.on('connected', () => this.connected(this))
    rs.on('ready', () => this.refresh(this))
    rs.on('disconnected', this.disconnected)

    rs.on('ready', () => new Widget(rs, {domID:'widget', leaveOpen: true}) )

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
    remove (id) {
      rs.bookmarks.archive.remove(id)
      this.refresh(this)
    },
    disconnected: () => {
      browser.runtime.sendMessage( {msg: 'disconnect'}, null )
    },
    connected: (self) => {
      browser.runtime.sendMessage( {msg: 'connect'}, null )
      self.refresh(self)
    },
    refresh: (self) => {
      console.error(rs)
      rs.bookmarks.archive.getAll()
      .then(bookmarks => {
        self.rsBookmarks = bookmarks.filter(b=>b!==true)
      })
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
  background #eee
  font-family "Ubuntu Mono"
  font-size 18px
  padding 0px
  margin 0px
  
#options
  display flex

  .title
    font-size 22px
    
  button
    margin 3px

  .right
    background #f9f9f9
    border-left 1px solid #ddd
    
    form
      margin-top: 50px
      padding-left: 15px
    
    .url
      display block
      transition: opacity .2s
      right 0px
      height 3em
      position fixed
      bottom 0px
      background-color #ccc
      font-weight bold
      color #333
      overflow hidden
      padding 5px
      width 100%
      
    .links
      a
        padding-left 35px
        width 100%
        display block
        word-wrap break-word
        
      a.selected
      a:hover
        background-color #eee
        
      span.remove
        float left
        margin-left 10px
        cursor pointer
        color red
    
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
