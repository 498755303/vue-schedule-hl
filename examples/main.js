import Vue from 'vue'
import App from './App.vue'
import VueSchedule from "../packages/index";
Vue.use(VueSchedule);
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
