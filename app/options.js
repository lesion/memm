import Vue from 'vue'
import Options from './options.vue'

import 'mdi/css/materialdesignicons.min.css'
const vm = new Vue({
  render: h => h(Options)
}).$mount('#mount')
