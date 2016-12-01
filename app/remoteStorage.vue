<template lang="pug">
#rs-widget.rs-widget.rs-floating(:class='state')

  img.rs-main-logo.loading(src='img/remoteStorage.png')

  .rs-box-initial(@click='changeState(\'choose\')')
    h1.rs-small-headline Connect Remote Storage
    span.rs-sub-headline To own and control your data

  .rs-box-connected
    .rs-connected-text
      h1.rs-user.rs-small-headline {{userName}}
      span.rs-sub-headline Synced 2 min ago

    .rs-connected-buttons
      button.rs-button.rs-button-small.rs-disconnect(title='Disconnect',@click='disconnect')
        img.rs-icon.rs-power-icon(src='img/power.png')
      button.rs-button.rs-button-small.rs-sync(title='Sync now')
        img.rs-icon.rs-loop-icon(src='img/loop.png')

  .rs-box-choose
    .rs-box-choose-content
      h1.rs-big-headline  Own Your Data
      p.rs-short-desc This app allows you to own and control your data.
        a.rs-help(href='https://remotestorage.io/' target='_blank') Read more

      p.rs-choose-backend Please choose your storage:
      .rs-button-wrap
        button.rs-button.rs-button-big.rs-choose-rs(@click='changeState(\'sign-in\')')
          img.rs-logo(src='img/remoteStorage.png')
          div Remote Storage
        button.rs-button.rs-button-big.rs-choose-dropbox(@click='connect(\'dropbox\')')
          img.dropbox-logo(src='img/dropbox.png')
          div Dropbox
        button.rs-button.rs-button-big.rs-choose-gdrive(@click='connect(\'gdrive\')')
          img.gdrive-logo(src='img/gdrive.png')
          div Google Drive

  .rs-box-sign-in
    .rs-sign-in-content
      form.rs-sign-in-form(name='rs-sign-in-form', @submit.prevent='connect(\'RS\')')
        h1.rs-big-headline Connect your Remote Storage
        input#rsUser(type='text',placeholder='user@provider.com',v-model='user')
        input.rs-connect(type='submit',value='Connect')
        a.rs-help(href='https://remotestorage.io/get', target='_blank') Need help?

</template>

<script>

module.exports = {
  props: ['rs'],
  mounted () {
    console.error('sono dentro MOUNTED ', this.rs)
    this.rs.addGlobalEventListener(this.eventListener)
  },
  methods: {
    disconnect () {
      console.error('sono dentro disconnect !')
      this.rs.disconnect()
    },
    eventListener (eventName) {
      if (typeof this[eventName] === 'function') {
        this[eventName](Array.prototype.slice.call(arguments, 1))
      } else {
        console.error('EVENTO: ', eventName, Array.prototype.slice.call(arguments, 1))
      }
    },
    error (e) {
      console.error('SONO DENTRO ERROR: ', e)
    },
    notConnected (e) {
      console.error('DENTRO NOT_CONNECTED ', e)
    },
    disconnected (e) {
      console.error('DENTRO DISCONNECTED ', e)
      this.changeState('initial')
    },
    changeState (state) {
      console.error('dentro change state ', state)
      this.state = `rs-state-${state}`
    },
    connected ([username]) {
      console.error('DENTRO CONNECTED!', username)
      this.userName = username
      this.changeState('connected')
    },
    connect (service) {
      console.error('sono qui lancio un evento')
      this.$emit('connect', this.user || service)
      // this.rs.connect(this.user)
      // port.postMessage(service === 'RS'?this.user:service)        
    },

  },
  data () {
    return {
      userName: '',
      user: null,
      state: 'rs-state-initial'
    }
  }
}
function start() {

  const signInBox = document.querySelector('.rs-box-sign-in');
  const signInContent = document.querySelector('.rs-sign-in-content');
  const signInContentHeight = signInContent.clientHeight;

  const rsWidget = document.querySelector('#rs-widget');
  const rsLogo = document.querySelector('.rs-main-logo');
  const rsCloseButton = document.querySelector('.rs-close');
  const rsChooseRemoteStorageButton = document.querySelector('button.rs-choose-rs');
  const rsChooseDropboxButton = document.querySelector('button.rs-choose-dropbox');
  const rsChooseGoogleDriveButton = document.querySelector('button.rs-choose-gdrive');
  const rsDisconnectButton = document.querySelector('.rs-disconnect');
  const rsSyncButton = document.querySelector('.rs-sync');
  const rsConnected = document.querySelector('.rs-box-connected');
  const rsConnect = document.querySelector('.rs-connect')
  const rsUser = document.querySelector('#rsUser')


  // NEED A REFACTORING !! COPY/PASTE FROM ORIGINAL WIDGET

  setClickHandlers()
  function setClickHandlers() {
  
    // Disconnect button
    rsDisconnectButton.addEventListener('click', () => {
      console.log("clicked disconnect button");
      rsWidget.classList.remove("rs-state-connected");
      rsWidget.classList.add("rs-state-initial");
      fadeOut(rsConnected);
      delayFadeIn(rsInitial, 300);
    });

    // Sync button
    rsSyncButton.addEventListener('click', () => {
      console.log("clicked sync button");
      rsSyncButton.classList.toggle("rs-rotate");
    });


    // // Stop clicks on the widget itthis from triggering the above event
    // rsWidget.addEventListener('click', (e) => {
    //   e.stopPropagation();
    // });

    // Click on the logo to bring the full widget back
    rsLogo.addEventListener('click', () => {
      if (rsWidget.classList.contains("rs-state-connected")) {
        rsWidget.classList.toggle("rs-hide", false);
        delayFadeIn(rsConnected, 300);
      }
    });
  }

  function closeWidget() {
    rsWidget.classList.remove("rs-state-sign-in");
    rsWidget.classList.remove("rs-state-choose");
    delayFadeIn(rsInitial, 300);
    signInBox.setAttribute("style", "height: 0;");
    chooseBox.setAttribute("style", "height: 0;");
  }

  // To delay fadeIn until other animations are finished
  function delayFadeIn(element, delayTime) {
    setTimeout(() => {
      fadeIn(element);
    }, delayTime);
  }

  // CSS can't fade elements in and out of the page flow so we have to do it in JS
  function fadeOut(element) {
    let op = 1;  // initial opacity
    let timer = setInterval(function () {
      if (op <= 0.1){
        clearInterval(timer);
        element.style.display = "none";
      }
      element.style.opacity = op;
      element.style.filter = "alpha(opacity=" + op * 100 + ")";
      op -= op * 0.1;
    }, 3);
  }

  function fadeIn(element) {
    let op = 0.1;  // initial opacity
    element.style.display = "block";
    let timer = setInterval(function () {
      if (op >= 1){
        clearInterval(timer);
      }
      element.style.opacity = op;
      element.style.filter = "alpha(opacity=" + op * 100 + ")";
      op += op * 0.1;
    }, 3);
  }
}
</script>

<style lang='stylus'>

.rs-main-logo.loading
  animation: spin 1.2s infinite ease-in-out

/* Widget */
.rs-widget
  max-width: 300px;
  color: #333;
  background-color: #fff;
  border-radius: 3px;
  padding: 10px;
  display: inline-block;
  margin: 10px;
  overflow: hidden;
  transition: max-width 300ms ease-out 0ms, background 300ms linear 300ms, box-shadow 300ms linear 300ms;
  box-sizing: border-box
  font-family: Ubuntu

  *
    box-sizing: border-box

  a
    color: #0093cc

/* Main logo */
.rs-main-logo
  float: left
  margin-left: 45%;
  transition: margin-left 300ms ease-out

/* Initial Connect remote storage box */
.rs-box-initial
  padding: 1px 0
  margin-left: 45px
  overflow: hidden
  white-space: nowrap
  opacity: 0
  transition: opacity 300ms ease-out

.rs-box-initial:hover
  cursor: pointer

.rs-state-initial 
  .rs-box-initial 
    opacity: 1




  .rs-main-logo
    margin-left: 0

.rs-box-choose
  clear: both
  text-align: center
  overflow: hidden
  height: 0px
  font-size: 1.3em
  transition: height 300ms ease-out

  .rs-box-choose-content
    padding: 0 10px 10px 10px

.rs-state-choose 

  .rs-box-initial
    position: absolute
    opacity: 0

  .rs-box-choose
    height: 414px


.rs-box-choose .rs-big-headline {
  margin-top: 20px;
  margin-bottom: 20px;
}
.rs-box-choose p {
  margin-top: 0;
  margin-bottom: 20px;
}
.rs-box-choose img {
  float: left;
  margin-right: 0.625em;
}

@keyframes spin {
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.5;
  }

}



/* Sign in box */
.rs-box-sign-in
  text-align: center
  height: 0
  overflow: hidden
  transition: height 300ms ease-out

  .rs-sign-in-content
    padding: 0 10px 10px 10px

.rs-state-sign-in
  .rs-box-sign-in
    height: 250px

.rs-box-sign-in .rs-big-headline {
  margin-top: 0;
}


.rs-sign-in-form input[type=text] {
  padding: 15px 10px;
  display: block;
  width: 100%;
  font: inherit;
  margin-bottom: 20px;
}
.rs-sign-in-form input[type=submit] {
  padding: 15px 10px;
  margin-bottom: 15px;
  display: block;
  width: 100%;
  border-width: 0;
  border-radius: 3px;
  background-color: #3fb34f;
  font: inherit;
  color: #fff;
  transition: box-shadow 200ms, background-color 200ms;
}
.rs-sign-in-form input[type=submit]:hover {
  cursor: pointer;
  background-color: #4BCB5D;
  box-shadow: 0 1px 2px 0 rgba(0,0,0,0.1), 0 3px 8px 0 rgba(0,0,0,0.2);
}
.rs-sign-in-form input[type=submit]:active {
  background-color: #3fb34f;
}




.rs-small-headline {
  font-size: 1.2em;
  font-weight: bold;
  margin: 0;
  margin-bottom: 2px;
}
.rs-sub-headline {
  color: #666;
  font-size: 1.1em;
}
.rs-big-headline {
  font-size: 1.725em;
  font-weight: normal;
  display: inline-block;
}
.rs-short-desc {
}
.rs-choose-backend {
  font-weight: bold;
}
.rs-button {
  font: inherit;
  color: inherit;
  background-color: transparent;
  border:1px solid #dcdcdc;
  border-radius: 3px;
  cursor: pointer;
}
.rs-button-small {
  padding: 0.563em;
  margin-left: 0.625em;
  transition: border-color 300ms ease-out;
}
.rs-button-wrap {
  margin-top: 10px;
}
.rs-button-big {
  padding: 15px 10px;
  margin-bottom: 10px;
  display: block;
  width: 100%;
  text-align: left;
  transition: box-shadow 200ms;
}
.rs-button-big > div {
  font-size: 1.225em;
  padding: 10px 0;
}
.rs-button-big:hover {
  box-shadow: 0 1px 2px 0 rgba(0,0,0,0.1), 0 3px 8px 0 rgba(0,0,0,0.2);
}
.rs-button-big:active {
  background-color: #eee;
  box-shadow: 0 1px 2px 0 rgba(0,0,0,0.1), 0 3px 8px 0 rgba(0,0,0,0.2);
}
.rs-button-big:last-child {
  margin-bottom: 0;
}
.rs-icon {
  height: 20px;
  fill: #999;
  transition: fill 300ms ease-out;
}




/* Hide everything except logo when connected and clicked outside of box */
.rs-hide {
  max-width: 55px;
  background-color: transparent;
  box-shadow: none;
  opacity: 0.5;
  transition: max-width 300ms ease-out 300ms, opacity 300ms linear 0ms, background 300ms linear, box-shadow 300ms linear 0ms;
}
.rs-hide:hover {
  cursor: pointer;
  opacity: 1;
}


/* Initial Connect remote storage box */
/*.rs-box-initial {
  padding: 1px 0;
  margin-left: 45px;
  overflow: hidden;
  white-space: nowrap;
}
.rs-box-initial:hover {
  cursor: pointer;
}
.rs-state-initial .rs-box-initial {
  display: block;
}
.rs-state-choose .rs-box-initial {
  position: absolute;
}*/




/* Choose provider box */
.rs-box-choose {
  clear: both;
  text-align: center;
  overflow: hidden;
  transition: height 300ms ease-out;
  transition-delay: 0ms;
}
.rs-box-choose-content {
  padding: 0 10px 10px 10px;
}
.rs-box-choose .rs-big-headline {
  margin-top: 20px;
  margin-bottom: 20px;
}
.rs-box-choose p {
  margin-top: 0;
  margin-bottom: 20px;
}
.rs-state-choose .rs-main-logo {
  margin-left: 45%;
  transition-delay: 0ms;
}
.rs-box-choose img {
  float: left;
  margin-right: 0.625em;
}
.rs-state-choose .rs-box-choose {
  transition-delay: 350ms;
}



/* Connected box */
.rs-state-connected
  .rs-box-connected
    display: block

  .rs-main-logo
    margin-left: 0
    margin-right: 10px

  .rs-box-initial
    display: none


.rs-box-connected {
  display: none;
}
.rs-connected-text {
  float: left;
}
.rs-box-connected .rs-user {
  font-weight: bold;
}
.rs-box-connected .rs-button {
  float: right;
}
.rs-connected-buttons {
  float: right;
}
.rs-disconnect:hover {
  border-color: #FF2D2D;
}
.rs-disconnect:hover .rs-icon{
  fill: #FF2D2D;
}
.rs-sync:hover {
  border-color: #FFBB0C;
}
.rs-sync:hover .rs-icon {
  fill: #FFBB0C;
}
.rs-sync.rs-rotate {
  border-color: #FFBB0C;
}
.rs-sync.rs-rotate .rs-icon {
  fill: #FFBB0C;
  animation: rs-spin 1s linear infinite;
}
@keyframes rs-spin { 100% { transform: rotate(360deg); transform:rotate(360deg); } }


/* Floating widget styles*/
.rs-floating {
  position: fixed;
  top: 0;
  right: 0;
}
.rs-close {
  display: none;
  position: absolute;
  top: 10px;
  right: 20px;
}
.rs-close:hover {
  cursor: pointer
}

/* Mobile styles */
@media screen and (max-width: 360px) {
  .rs-widget {
    font-size: 100%;
    transition: all 300ms ease-out;
  }
  .rs-floating {
    position: relative;
    top: auto;
    right: auto
  }
  .rs-state-choose,
  .rs-state-sign-in {
    position: fixed;
    top: 0;
    margin: 0;
    border-radius: 0;
    height: 100%;
    max-width: 100%;
  }
  .rs-state-choose .rs-close,
  .rs-state-sign-in .rs-close {
    display: block;
  }
}
</style>