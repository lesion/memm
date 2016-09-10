

// window.onload = function() {
//   var div = document.createElement('div');
//   div.setAttribute('id', 'remotestorage-connect');
//   document.body.appendChild(div);

//   remoteStorage.defineModule('bookmarks', function() { return { exports: {} } });

//   remoteStorage.access.claim('bookmarks','rw');
//   remoteStorage.displayWidget('remotestorage-connect');

// }
// 
chrome.commands.onCommand.addListener(function(command) {
  console.log('bk Command:', command);
})

