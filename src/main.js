import Vue from 'vue';
import App from './App.vue';
import AvLegend from './AvLegend.vue';
import RevisionGraph from './RevisionGraph.vue';
import RevisionsGraph from './RevisionsGraph.vue';
import Vuetify from 'vuetify';

Vue.use(Vuetify);
Vue.use(AvLegend);
Vue.use(RevisionGraph);
Vue.use(RevisionsGraph);

var vue = new Vue({
  el: '#app',
  render: h => h(App)
});
