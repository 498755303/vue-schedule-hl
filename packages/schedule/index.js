/*
 * @Description: 
 * @LastEditors: HL
 * @LastEditTime: 2020-02-24 19:20:51
 */
import VueSchedule from './index.vue';
VueSchedule.install = function (Vue) {
    Vue.component(VueSchedule.name, VueSchedule)
}
export default VueSchedule