
console.log('remoteStorage', remoteStorage);

// close auth dialog, once it's finished.
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
  var authTabId = localStorage.getItem('auth-tab-id');
  if(authTabId && (tabId == authTabId)) {
    // only close, if URL also ends on #. That signals, that the access_token
    // has been recovered from fragment.
    if(changeInfo.url && changeInfo.url.match(/^chrome\-extension:\/\/.*#$/)) {
      chrome.tabs.remove(Number(authTabId));
      localStorage.removeItem('auth-tab-id')
    }
  }
});

window.onload = function() {
  var div = document.createElement('div');
  div.setAttribute('id', 'remotestorage-connect');
  document.body.appendChild(div);

  remoteStorage.defineModule('bookmarks', function() { return { exports: {} } });

  remoteStorage.claimAccess({'bookmarks':'rw'});
  remoteStorage.displayWidget('remotestorage-connect');

}
