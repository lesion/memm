/**
 * RemoteStorage connect widget
 * @constructor
 * @param {object} remoteStorage - remoteStorage instance
 * @param {object} options - Widget options (domID, ...)
 */


  // CSS can't animate to unknown height (as in height: auto)
  // so we need to store the height, set it to 0 and use it when we want the animation
  const chooseBox = document.querySelector('.rs-box-choose');
  const chooseBoxHeight = chooseBox.clientHeight;
  // Set the height to zero until the initial button is clicked
  chooseBox.setAttribute("style", "height: 0");

  const signInBox = document.querySelector('.rs-box-sign-in');
  const signInContent = document.querySelector('.rs-sign-in-content');
  const signInContentHeight = signInContent.clientHeight;

  const rsWidget = document.querySelector('#rs-widget');
  const rsLogo = document.querySelector('.rs-main-logo');
  const rsCloseButton = document.querySelector('.rs-close');
  const rsInitial = document.querySelector('.rs-box-initial');
  const rsChooseRemoteStorageButton = document.querySelector('button.rs-choose-rs');
  const rsChooseDropboxButton = document.querySelector('button.rs-choose-dropbox');
  const rsChooseGoogleDriveButton = document.querySelector('button.rs-choose-gdrive');
  const rsDisconnectButton = document.querySelector('.rs-disconnect');
  const rsSyncButton = document.querySelector('.rs-sync');
  const rsConnected = document.querySelector('.rs-box-connected');
  const rsConnect = document.querySelector('.rs-connect')
  const rsUser = document.querySelector('#rsUser')

  setEventListeners();
  setClickHandlers();

  function setEventListeners() {
    // Sign-in form
    let rsSignInForm = document.querySelector('.rs-sign-in-form');
    rsSignInForm.addEventListener('submit', (e) => {
      e.preventDefault();
    });
  }

  function setClickHandlers() {
    // Initial button
    rsInitial.addEventListener('click', () => {
      console.log("clicked initial button");
      rsWidget.classList.remove("rs-state-initial");
      rsWidget.classList.add("rs-state-choose");
      fadeOut(rsInitial);
      // Set height of the ChooseBox back to original height.
      chooseBox.setAttribute("style", "height: " + chooseBoxHeight);
    });

    // Choose RS button
    rsChooseRemoteStorageButton.addEventListener('click', () => {
      console.log("clicked RS button");
      rsWidget.classList.remove("rs-state-choose");
      rsWidget.classList.add("rs-state-sign-in");
      chooseBox.setAttribute("style", "height: 0");
      signInBox.setAttribute("style", "height: " + chooseBoxHeight + "px"); // Set the sign in box to same height as chooseBox
      signInContent.setAttribute("style", "padding-top: " + ((chooseBoxHeight - signInContentHeight) / 2) + "px"); // Center it
    });

    rsConnect.addEventListener('click', () => {
      console.error('connect !')
      var port = chrome.extension.connect({name: "mem"});
      port.postMessage(rsUser.value)
    })

    // Choose Dropbox button
    rsChooseDropboxButton.addEventListener('click', () => {
      console.log("clicked Dropbox button", rs);
      rs["dropbox"].connect();
      // rsWidget.classList.remove("rs-state-choose");
      // rsWidget.classList.add("rs-state-connected");
      // chooseBox.setAttribute("style", "height: 0");
      // delayFadeIn(rsConnected, 600);
    });

    // Choose Google drive button
    rsChooseGoogleDriveButton.addEventListener('click', () => {
      console.log("clicked Google drive Button");
      rs["googledrive"].connect();
      // rsWidget.classList.remove("rs-state-choose");
      // rsWidget.classList.add("rs-state-connected");
      // chooseBox.setAttribute("style", "height: 0");
      // delayFadeIn(rsConnected, 600);
    });

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


    // Stop clicks on the widget itthis from triggering the above event
    rsWidget.addEventListener('click', (e) => {
      e.stopPropagation();
    });

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
