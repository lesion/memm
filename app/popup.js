import Vue from 'vue/dist/vue'
const popup = require('./popup.vue')

const vm = new Vue({
  el: '#mount',
  components: {popup},
  render: h => h('popup')
})
