<template lang="pug">
  #popup(@keydown='keydown')
    .header
      img.link(src='img/memm_40.png',@click='openOptions')
      span.title memm 
      input(type='text', v-model='tag', ref='tag', placeholder='put some tags here', autofocus)

    .tags
      div.tag(v-for="(tag, index) in tags") 
        span {{tag}}

    .bookmarks(:class='{selected: selected!=-1}')
      a.bookmark(v-if='tags.length',
        href='#',
        click='addBookmark',
        :class='{selected: selected == 0}') Add bookmark
      a.bookmark(v-for='(bookmark, index) in bookmarks',
        :href='bookmark.url', target='parent'
        :class='{selected: selected==index+1}') {{bookmark.title}}

    .tags
      div.tag(v-for='tag in selectedBookmark.tags')
        span {{tag}}
      div.info {{selectedBookmark.url}}
      
</template>

<script>
const BROWSER = chrome || browser;
import util from './util'

export default {
  computed: {
    selectedBookmark () {
      if(this.bookmarks[this.selected-1])
        return this.bookmarks[this.selected-1]
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
      this.$nextTick( () => {
        util.sendMessage({msg: 'getURLInfo', url: info.url, tabId: this.tabId})
          .then(this.currentTabInfo)
      })
    })
    this.$refs.tag.focus()
  },
  methods: {
    openOptions () {
      BROWSER.runtime.openOptionsPage()
    },
    removeTag (indexTag) {
      this.tags.splice(indexTag, 1)

      util.sendMessage({
        msg: 'setTags',
        title: this.title,
        url: this.url,
        tabId: this.tabId,
        tags: this.tags
      })
      .then(this.currentTabInfo)
    },
    matchBookmarks (bookmarks) {
      this.bookmarks = bookmarks.filter(b => b.url !== this.url)
      if (this.selected!==-1 && bookmarks.length<=this.selected)
        this.selected = 0
    },
    addBookmark () {
       const tag = this.tag.replace(/[,\s]+/,'')

        // check if empty or already there
        if (tag && this.tags.indexOf(tag)!==-1) {
          this.tags.push(tag)
        }

        if (!this.tags.length === 0) {
          this.tags.push('untagged')
        }

        this.tag = ''
        const message = {
          msg: 'setTags',
          title: this.title,
          url: this.url,
          tabId: this.tabId,
          tags: this.tags
        }

        util.sendMessage(message)

        window.close()
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
          this.selected = this.bookmarks.length
        else
          this.selected -= 1
      }

      if(ev.which === ARROW_DOWN) {
        if (this.selected === this.bookmarks.length)
          this.selected = -1
        else
          this.selected += 1
      }


      if(ev.which === SPACE || ev.which === COMMA || ev.which === TAB) {
        const tag = this.tag.replace(/[,\s]+/,'')
        // check if empty or already there
        if (!tag || this.tags.indexOf(tag)!==-1) {
          ev.preventDefault()
          return
        }

        this.tags.push(tag)

        this.tag = ''
        ev.preventDefault()
        util.sendMessage({msg: 'searchTags', tags: this.tags})
          .then( bookmarks => {
            this.bookmarks = bookmarks.filter( b => b.url != this.url )
          } )

      } 

      // add current tag
      if (ev.which === ENTER) {
        if (this.selected == -1) {
          this.addBookmark()
          return
        }

         // clear the input box
        const tag = this.tag.replace(/[,\s]+/,'')

        if (tag && this.tags.indexOf(tag)===-1) {
          this.tags.push(tag)
        }

        if (this.selectedBookmark) {
          BROWSER.tabs.create({url: this.selectedBookmark.url, active: true})
        } else {
          // send message to background
          util.sendMessage( {msg: 'searchTags', tags: this.tags } )
            .then( bookmarks => this.bookmarks = bookmarks )
            // title: this.title, url: this.url, tags: this.tags, tabId: this.tabId, nocb: true})
        }

        // popup close !
        window.close()
      }
    },
    currentTabInfo (info) {
      if (!info) {
        console.error('lastError', BROWSER.runtime.lastError)
        this.bookmarks = []
      } else {
        this.tags = info.tags
        this.bookmarks = info.related.filter(r => r.url !== this.url)
      }

      if (this.selected!==-1 && this.info.related.length<=this.selected) {
        this.selected = -1
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
  width: 350px
  font-family: Cantarell, Arial, sans-serif
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
      font-family Cantarell, Arial, sans-serif
      font-size 18px
      font-weight bold
      margin 0px 10px
      color orange

    input
      font-family Cantarell, Arial, sans-serif
      font-size 12px
      padding 5px
      border none
      flex-grow 1
      background-color $tag
      border-radius 2px

      &:focus
        outline: none

  .url
    color: blue
    font-size: 11px

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
      transition: color .5s, background-color .5s, border .5s
      display block
      color black
      padding 5px
      color #904646
      padding-left 10px
      word-break break-all
      background-color #27313b
      border-left 3px solid transparent

      &.selected
        background-color #6a748b !important
        color white
        border-left 3px solid orange


</style>
