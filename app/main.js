const Vue = require('vue')
const options = require('./options.vue')
const popup = require('./popup.vue')

new Vue({
  el: '#mount',
  components: {options, popup},
  render: h => h(window.location.pathname.match(/(options|popup)/)[1])
})
