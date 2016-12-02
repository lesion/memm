const Vue = require('vue')
const options = require('./options.vue')

const vm = new Vue({
  el: '#mount',
  components: {options},
  render: h => h('options')
})
