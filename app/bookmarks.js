'usr strict'

import intersection from 'lodash-es/intersection'
import filter from 'lodash-es/filter'
import fromPairs from 'lodash-es/fromPairs'
import map from 'lodash-es/map'


const Bookmark = {
  rs: null,
  setRS (remoteStorageInstance) {
    this.rs = remoteStorageInstance
  },

  get bookmarks () {
    return this.rs.bookmarks.archive.getAll()
      .then( bookmarks => fromPairs(map(bookmarks, b => [b.url, b])) )
  },

  store (bookmark) {
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
    return this.bookmarks
      .then( bookmarks => filter(bookmarks, b => intersection(b.tags, tags).length))
  },

  byURL (url) {
    return this.bookmarks.then( bookmarks => {
      const bookmark = bookmarks[url]
      if (!bookmark) return false
      bookmark.related = filter(bookmarks, b => {
        if (b.url === url) return false
        return intersection(b.tags, bookmark.tags).length
      })
      return bookmark
    })
  },
}

export default Bookmark
