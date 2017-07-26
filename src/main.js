import Vue from 'vue';
import App from './App.vue';
import AvLegend from './AvLegend.vue';
import RevisionsGraph from './RevisionsGraph.vue';
import Vuetify from 'vuetify';

Vue.use(Vuetify);
Vue.use(AvLegend);
Vue.use(RevisionsGraph);

var vue = new Vue({
  el: '#app',
  render: h => h(App)
});
