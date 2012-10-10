
window.addEventListener('DOMContentLoaded', function() {

  remoteStorage.defineModule('bookmarks', function(privateClient) {

    privateClient.use('');

    function buildId(string) {
      return Sha1.hex_sha1(string);
    }

    return {

      exports: {

        deactivateSync: privateClient.deactivateSync,
        activateSync: privateClient.activateSync,

        // Add or update a bookmark.
        //
        // Parameters:
        //   path  - path to the bookmark (without the final part), '' for root.
        //   title - human readable title of the bookmark.
        //   url   - URL to link to. must be unique.
        //   index - position within "path", to display at in lists.
        store: function(parentPath, title, url, index, cb) {
          var path = parentPath + buildId(url);
          privateClient.storeObject('bookmark', path, {
            title: title,
            url: url,
            index: index
          }, cb);
        },

        createDirectory: function(parentPath, title, index, cb) {
          var dirPath = parentPath + buildId(title) + '/';
          var path = dirPath + '_meta';
          privateClient.storeObject('directory-meta', path, {
            title: title,
            index: index,
          }, function() { cb(dirPath); });
        },

        syncNow: function() {
          privateClient.syncNow('');
        }
      }

    }

  });

  function pushAll(allDone) {
    function pushOne(node, parentPath, cb) {
      if(node.url) {
        remoteStorage.bookmarks.store(parentPath, node.title, node.url, node.index, cb);
      } else {
        var i = 0, dirPath;
        var pushIter = function() {
          if(i < node.children.length) {
            pushOne(node.children[i++], dirPath, pushIter);
          } else {
            allDone();
          }
        }
        remoteStorage.bookmarks.createDirectory(
          parentPath, node.title, node.index,
          function(p) { dirPath = p; pushIter(); }
        );
      }
    }

    chrome.bookmarks.getTree(function(tree) {
      var root = tree[0];

      remoteStorage.bookmarks.deactivateSync();

      for(var i=0;i<root.children.length;i++) {
        pushOne(root.children[i], '');
      }

      remoteStorage.bookmarks.activateSync();
      remoteStorage.bookmarks.syncNow();

    });
  }

  function pullAll() {
    var note = document.getElementById('not-impl');
    note.style.display = 'block';
    setTimeout(function() {
      note.style.display = 'none';
    }, 2500);
  }

  remoteStorage.claimAccess({'bookmarks':'rw'});

  remoteStorage.displayWidget('remotestorage-connect', {
    syncShortcut: false,
    authDialog: function(url) {
      chrome.tabs.create({url: url}, function(tab) {
        localStorage.setItem('auth-tab-id', tab.id);
      });
    }
  });

  var connected = ( remoteStorage.getWidgetState() == 'connected' ||
                    remoteStorage.getWidgetState() == 'busy' );

  document.getElementById(
    connected ? 'connected-info' : 'intro'
  ).style.display = 'block';

  if(connected) {
    document.getElementById('push-all').addEventListener('click', function(event) {
      event.target.setAttribute('disabled', true);
      pushAll(function() {
        event.target.setAttribute('disabled', false);
        var succ = document.getElementById('succ');
        succ.style.display = 'block';
        setTimeout(function() { succ.style.display = 'none'; }, 2500);
      });
    });
    document.getElementById('pull-all').addEventListener('click', pullAll);
  }

});
