module.exports = {
  
  extractToken (url) {
    // https://hpjohjhlkbabmpfmfbgeefnaafipanhd.chromiumapp.org/#access_token=YqT9ddr%2FkFHCA321CKNp%2B3Lxgx8%3D&token_type=bearer&state=
    return url.match(/#access_token=([^&?]*)/)[1]
  },

  isUrl (url) {
    return (url.match(/^http[s]?:\/\//) !== null)
  },

  // get/set extension options
  option: {
    get (name) {
      return new Promise( (resolve, reject) => {
        chrome.storage.local.get(name, items => {
          if (chrome.runtime.lastError || !items.name)
            reject(new Error(chrome.runtime.lastError))
          else
            resolve(items)
        })
      })
    },
    set (name, value) {
      chrome.storage.local.set({name: value})
    }
  }
}
