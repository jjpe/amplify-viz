import Vue from 'vue';
import App from './App.vue';
import Vuetify from 'vuetify';

Vue.use(Vuetify);

var vue = new Vue({
  el: '#app',
  render: h => h(App)
});

// window.vue = vue;
