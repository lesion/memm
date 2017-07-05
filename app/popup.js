import Vue from 'vue/dist/vue'
const popup = require('./popup.vue')

const vm = new Vue({
  components: {popup},
  render: h => h(popup)
}).$mount('#mount')
