## memm

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/f17aba2aee5a44e3aa8debeb192178f1)](https://www.codacy.com/app/lesion/memm?utm_source=github.com&utm_medium=referral&utm_content=lesion/memm&utm_campaign=badger)

### A Chrome extension to tag your bookmarks and store it privately

### Features
- You can add multiple tag to each bookmark
- Bookmarks are stored with [RemoteStorage](https://github.com/remotestorage/remotestorage.js)
- While tagging, a list of matched url is shown
- Omnibar support: press .<space> on urlbar and search by tag
- Tag you bookmark with ctrl+m

### Todo
- Firefox porting

### Big picture wishes ... (writing some notes here...)
I want a way to link different types of resources:

I want to consider a TAG at the same level of a BOOKMARK,
a PICTURE, a NOTE. This extension is currently connecting
a BOOKMARK object with a TAG object. I'm experimenting connecting
a BOOKMARK with a laverna's NOTE (some syntax is needed for each type of
resource like the # for TAG) or probably TAG could be the gateway 
to find entities you want to connect to....
Need to find software that manage each type of resource with something like
remotestorage:

- BOOKMARK: this extension
- NOTE: laverna (need some little modification)
- MAIL: mailpile !?!?! (one-way is enought....)
- PICTURE: probably faster to do it from scratch !
- TASK / EVENT: https://taskrs.5apps.com/
