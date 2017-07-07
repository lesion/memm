## memm
#### browser extension to tag your bookmarks and store it privately

### Warning
this extension is in development, use at your own risk

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/f17aba2aee5a44e3aa8debeb192178f1)](https://www.codacy.com/app/lesion/memm?utm_source=github.com&utm_medium=referral&utm_content=lesion/memm&utm_campaign=badger)
[![Code Climate](https://codeclimate.com/github/lesion/memm/badges/gpa.svg)](https://codeclimate.com/github/lesion/memm)
[![license](https://img.shields.io/github/license/lesion/memm.svg)]()
<!-- [![dependencies Status](https://david-dm.org/lesion/memm/status.svg)](https://david-dm.org/lesion/memm) -->
<!-- [![devDependencies Status](https://david-dm.org/lesion/memm/dev-status.svg)](https://david-dm.org/lesion/memm?type=dev) -->

[![Chrome Web Store](https://developer.chrome.com/webstore/images/ChromeWebStore_Badge_v2_206x58.png)](https://chrome.google.com/webstore/detail/memm/nmmkepllfhgjonodmhgaoaehnknoadfo)


### Features
- You can add multiple tag to each bookmark
- Bookmarks are optionally stored with [RemoteStorage](https://github.com/remotestorage/remotestorage.js) (so it can be shared privately with other browsers / devices / software)
- While tagging, a list of matched url is shown
- Omnibar support: press .<space> on urlbar and search by tag
- Tag you bookmark with alt+shift+m


### Big picture wishes ... (writing some notes here...)
I want a way to link different types of resources:

I consider a TAG at the same level of a BOOKMARK,
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
- CONTACTS
