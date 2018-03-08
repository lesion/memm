import Vue from 'vue'
import Options from './options.vue'

const vm = new Vue({
  render: h => h(Options)
}).$mount('#mount')
