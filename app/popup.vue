<template lang="pug">
  #popup(@keydown='keydown')
    .header
      img.link(src='img/memm_40.png',@click='openOptions')
      span.title memm 
      input(type='text', v-model='tag', ref='tag', placeholder='put some tags here')

    .tags
      div.tag(v-for="(tag, index) in tags") 
        a(href='#',@click='removeTag(index)') x 
        span {{tag}}

    .bookmarks(:class='{selected: selected!=-1}')
      a.bookmark(v-for='(bookmark, index) in bookmarks',
        :href='bookmark.url', 
        :class='{selected: selected==index}') {{bookmark.title}}

    .tags
      div.tag(v-for='tag in selectedBookmark.tags')
        span {{tag}}
      div.info {{selectedBookmark.url}}
      
</template>

<script>
'use strict'

const browser = chrome || browser;
const util = require('./util')

export default {
  computed: {
    selectedBookmark () {
      if(this.bookmarks[this.selected])
        return this.bookmarks[this.selected]
      else
        return false
    }
  },
  data () {
    return {
      tags: [],
      tag: '',
      url: '',  
      bookmarks: [],
      selected: -1,
      title: '',
      tabId: undefined
    }
  },
  mounted () {
    util.getCurrentTabInfo()
    .then(info => {
      this.url = info.url
      this.title = info.title
      this.tabId = info.id
      browser.runtime.sendMessage({msg: 'getURLInfo', url: info.url, tabId: this.tabId}, null, this.currentTabInfo)
    })
    .catch()
    this.$refs.tag.focus()
  },
  methods: {
    openOptions () {
      browser.runtime.openOptionsPage()
    },
    removeTag (indexTag) {
      this.tags.splice(indexTag, 1)

      // cerco i match con la lista dei tag creati ora !
      // browser.runtime.sendMessage({msg:'getMatch', tags: this.tags},
        // this.matchBookmarks)

      // invio il setTags 
      browser.runtime.sendMessage( {msg: 'setTags', 
        title: this.title, url: this.url, tabId: this.tabId, tags: this.tags}, null, this.currentTabInfo)
    },
    matchBookmarks (bookmarks) {
      this.bookmarks = bookmarks.filter(b => b.url !== this.url)
      // controllo se selected punta ad un bookmark esistente
      if (this.selected!==-1 && bookmarks.length<=this.selected)
        this.selected = 0
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


      if(ev.which === SPACE || ev.which === COMMA || ev.which === TAB) {
        // lo pulisco
        const tag = this.tag.replace(/[,\s]+/,'')

        // devo controllare non sia vuoto e che non sia
        // gia esistente !!
        if (!tag || this.tags.indexOf(tag)!==-1) {
          ev.preventDefault()
          return
        }

        // aggiungo il tag alla lista
        this.tags.push(tag)

        // azzero l'input corrente
        this.tag = ''
        ev.preventDefault()

        // cerco i match con la lista dei tag creati ora !
        browser.runtime.sendMessage( {msg: 'setTags', 
          title: this.title, url: this.url, tabId: this.tabId, tags: this.tags}, null, this.currentTabInfo)
      } 

      // add current tag
      if (ev.which === ENTER) {
         // cleaning it
        const tag = this.tag.replace(/[,\s]+/,'')

        if (tag && this.tags.indexOf(tag)===-1) {
          this.tags.push(tag)
        }


        if (this.selectedBookmark) {
          browser.tabs.create({url: this.selectedBookmark.url, active: true})
          // window.open(this.selectedBookmark.url)
        } else {
          // invio il messaggio al background
          browser.runtime.sendMessage( {msg: 'setTags', 
            title: this.title, url: this.url, tags: this.tags, tabId: this.tabId}, null)
        }

        // popup close !
        window.close()
      }
    },
    currentTabInfo (info) {

      if (!info) {
        this.tags = []
        this.bookmarks = []
      } else {
        this.tags = info.bookmark.tags
        if (info.related)
          this.bookmarks = info.related.filter(r => r.url !== this.url)
      }

      // controllo se selected punta ad un bookmark esistente lo riazzero
      if (this.selected!==-1 && this.bookmarks.length<=this.selected) {
        this.selected = 0
      }
    }
  }
}
</script>

<style lang="stylus">
$orange = #3f4c5a
$tag = #eee

html
body
  font-family: "Ubuntu Mono"
  background-color $orange
  margin 0px 0px
  padding 0px 0px

.tags
  padding 10px 10px 5px 10px
  background-color #303a46

  .info
    font-size: 15px
    word-break break-all
    color #ffa500

#popup  

  a
    text-decoration none
    color red

  .header
    display flex
    align-items center
    margin 8px 

    img
      height 25px
      cursor pointer

    .title
      font-family: "Ubuntu Mono"
      font-size: 18px
      font-weight: bold
      margin 0px 10px
      color orange

    input
      font-family "Ubuntu Mono"
      font-size: 12px
      padding: 5px
      border: none
      flex-grow: 1
      background-color $tag
      border-radius 2px

      &:focus
        outline: none

  .url
    color: blue
    font-size: 9px

  .tag
    background-color #c9c8d2
    padding: 1px 5px 2px 5px
    margin-right: 5px
    margin-bottom: 5px
    border-radius: 2px
    display: inline-block

  .bookmarks
    background-color $tag

    &:hover,
    &.selected
      
      a.bookmark
        color #ff5b5b
        background-color: #2a353f

        &:nth-child(odd)
          background-color #313c47

    a.bookmark
      transition: color .5s, background-color .5s
      display block
      color black
      padding 5px
      color #904646
      padding-left 10px
      word-break break-all
      background-color: #27313b

      &.selected
        background-color #6a748b !important
        color white


</style>
