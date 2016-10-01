export default {
  
  // get/set extension options
  option: {
    get (name) {
      return new Promise( (resolve, reject) => {
        chrome.storage.get(name, items => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError))
          }
          resolve(items)
        })
      })
    },
    set (name, value) {
      chrome.storage.set(name, value)
    }
  }
}
