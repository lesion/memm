'usr strict'

import intersection from 'lodash-es/intersection'
import filter from 'lodash-es/filter'
import cloneDeep from 'lodash-es/cloneDeep'
import forOwn from 'lodash-es/forOwn'


const Bookmark = {
  bookmarks: {},
  rs: null,
  setRS (remoteStorageInstance) {
    this.rs = remoteStorageInstance
  },

  sync () {
    this.rs.bookmarks.archive.getAll()
    .then(ret => {
      this.bookmarks = {}
      forOwn(ret, b => {
        this.bookmarks[b.url] = {title: b.title, tags: b.tags, url: b.url, id: b.id}
      })
    })
  },

  store (bookmark) {
    this.bookmarks[bookmark.url] = bookmark
    return this.rs.bookmarks.archive.store({url: bookmark.url, tags: bookmark.tags, title: bookmark.title})
  },

  remove (id) {
    return this.rs.bookmarks.archive.remove(id)
  },
  /**
   * return bookmarks matches tags
   * @param  {Array} tags
   * @return {Array} bookmarks
   */
  byTags (tags) {
    return filter(this.bookmarks, b => intersection(b.tags, tags).length)
  },

  byURL (url) {
    const bookmark = cloneDeep(this.bookmarks[url])
    if (!bookmark) return false
    bookmark.related = Bookmark.getRelated(bookmark.tags, url)
    return bookmark
  },

  getRelated (tags, url) {
    return filter(this.bookmarks, b => {
      if (b.url === url) return false
      // true if bookmark share tags
      return intersection(b.tags, tags).length
    })
  }
}

export default Bookmark
