const Vue = require('vue')
const popup = require('./popup.vue')

new Vue({
  el: '#mount',
  components: {popup},
  render: h => h('popup')
})
