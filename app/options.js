import Vue from 'vue'
const options = require('./options.vue')

const vm = new Vue({
  components: {options},
  render: h => h(options)
}).$mount('#mount')
