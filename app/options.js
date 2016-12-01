const Vue = require('vue')
const options = require('./options.vue')

new Vue({
  el: '#mount',
  components: {options},
  render: h => h('options')
})
