import Vue from 'vue'
import Popup from './popup.vue'

const vm = new Vue({
  render: h => h(Popup)
}).$mount('#mount')
