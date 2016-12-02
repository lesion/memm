const Vue = require('vue')
const popup = require('./popup.vue')

const vm = new Vue({
  el: '#mount',
  components: {popup},
  render: h => h('popup')
})
