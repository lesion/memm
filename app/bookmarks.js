'usr strict'

import {intersection, filter, cloneDeep, forOwn} from 'lodash'

let bookmarks = {}
let rs = null

const Bookmark = {
  setRS (remoteStorageInstance) {
    rs = remoteStorageInstance
  },

  sync () {
    rs.bookmarks.archive.getAll()
    .then(ret => {
      bookmarks = {}
      forOwn(ret, b => {
        bookmarks[b.url] = {title: b.title, tags: b.tags, url: b.url, id: b.id}
      })
    })
  },

  store (bookmark) {
    bookmarks[bookmark.url] = bookmark
    return rs.bookmarks.archive.store({url: bookmark.url, tags: bookmark.tags, title: bookmark.title})
  },

  remove (id) {
    return rs.bookmarks.archive.remove(id)
  },
  /**
   * return bookmarks matches tags
   * @param  {Array} tags
   * @return {Array} bookmarks
   */
  byTags (tags, url) {
    const bookmark = cloneDeep(bookmarks[url])
    bookmark.related = Bookmark.getRelated(tags, url)
    return bookmark
  },

  byURL (url) {
    const bookmark = cloneDeep(bookmarks[url])
    if (!bookmark) return false
    bookmark.related = Bookmark.getRelated(bookmark.tags, url)
    return bookmark
  },

  getRelated (tags, url) {
    return filter(bookmarks, b => {
      if (b.url === url) return false
      return intersection(b.tags, tags).length
    })
  }
}

export default Bookmark
