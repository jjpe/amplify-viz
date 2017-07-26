<template>
  <v-app dark>
    <v-navigation-drawer persistent clipped v-model="leftDrawer">
      <v-toolbar class="grey--text cyan darken-4" dark>
        <v-toolbar-title>Graphs</v-toolbar-title>
      </v-toolbar>

      <v-list>
        <v-list-tile v-for="(graph_item, i) in leftDrawerEntries"
                     :key="i"
                     value="true"
                     @click.native="currentGraph = graph_item.graph;
                                    leftDrawer = !leftDrawer">
          <v-list-tile-action>
            <v-icon light v-html="graph_item.icon"></v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title v-text="graph_item.title"></v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar fixed>
      <v-toolbar-side-icon @click.native.stop="leftDrawer = !leftDrawer"
                           class="grey--text"></v-toolbar-side-icon>
      <v-spacer></v-spacer>
      <v-toolbar-title class="grey--text" v-text="title"></v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon>
        <!-- TODO:
             clicking needs to actually sync data from MongoDB,
             or request it from an application server  -->
        <v-icon class="grey--text">sync</v-icon>
      </v-btn>
      <v-btn icon
             @click.native.stop="rightDrawer = !rightDrawer;
                                 rightDrawerWidth === '0%'
                                     ? rightDrawerWidth = rightDrawerOpenWidth
                                     : rightDrawerWidth = '0%'"
             class="grey--text">
        <v-icon>view_module</v-icon>
      </v-btn>
    </v-toolbar>
    <main>
      <!-- "Revision Overview" screen -->
      <v-layout justify-center v-if="currentGraph === 'revisions'">
        <v-flex xs11 sm11>
          <v-card style="margin-top: 15px; margin-bottom: 15px">

            <v-card-title primary-title>
              <div>
                <h3 class="headline mb-0 orange--text">Revisions</h3>
                <div class="grey--text">Overview of recorded revisions</div>
              </div>
            </v-card-title>

            <v-card-actions>
              <!-- TODO: are there even any actions for this graph? -->
            </v-card-actions>

            <v-layout align-center justify-center>
              <v-flex xs12>
                <revisions-graph id="revisions-svg"
                                 :msgs="msgs"
                                 :kinds="kinds"></revisions-graph>
              </v-flex>
            </v-layout>

          </v-card>
        </v-flex>
      </v-layout>

    </main>
    <v-navigation-drawer id="right-drawer"
                         persistent clipped right
                         v-model="rightDrawer"
                         :style="{ width: rightDrawerWidth }">
      <v-toolbar class="grey--text indigo" dark>
        <v-toolbar-title>Legend</v-toolbar-title>
      </v-toolbar>
      <av-legend id="legend-table" :msgs="msgs"></av-legend>
    </v-navigation-drawer>
  </v-app>
</template>

<script>
import * as d3 from 'd3';
import _ from 'lodash';
import $ from 'jquery';
import AvLegend from './AvLegend.vue';
import RevisionsGraph from './RevisionsGraph.vue';
export default {
    data() {
        // A kludge to ensure that the methods can be called from outside the
        // VaApp component.  This is used for e.g. creating key bindings for
        // the left and right side navs.
        window.AvApp = this;

        return {
            title: 'Amplify Viz',
            msgs: _.chain(window.AvApp.fetchMsgs())
                .forEach(function(msg, idx) {
                    // msg.color = window.AvApp.legendColorByIndex(idx);
                    msg.color = window.AvApp.colorForKind(msg.kind);
                })
                .value(),

            // Options: 'none' and any `leftDrawerEntries.graph` value.
            currentGraph: 'revisions',

            leftDrawer: false,
            leftDrawerEntries: [
                // For more icons see https://material.io/icons/
                { icon: 'filter_none', title: 'Revisions', graph: 'revisions' }
            ],

            rightDrawer: false,
            rightDrawerWidth: '0%',
            rightDrawerOpenWidth: '700px',

            // For the 'revision' graph:
            currentRevision: '100',
            currentRevisionValidationRules: {
                valid:  function(value) {
                    return /^(\s*)([0-9]+)(\s*)$/.test(value)
                        ? value
                        : 'Invalid revision';
                },
            },

        };
    },

    computed: {
        msgsByRevision: function() {
            return _.groupBy(this.msgs, (msg) => msg.revision)
        },
        kinds: function() {
            return _.chain(this.msgs)
                .map((msg) => msg.kind)
                .uniq()
                .value()
        },
    },


    methods: {
        fetchMsgs() { // TODO: unstub and implement
            return [
                {
                    // color: 'blue',
                    process: 'spoofax server',
                    revision: 3,
                    kind: 'parse',
                    time_ms: 400000000,
                    time_perc: 18,
                },
                {
                    // color: 'red',
                    process: 'spoofax server',
                    revision: 3,
                    kind: 'analyze',
                    time_ms: 2000000000,
                    time_perc: 60,
                },
                {
                    // color: 'purple',
                    process: 'spoofax server',
                    revision: 3,
                    kind: 'syntax colors',
                    time_ms: 1000000000,
                    time_perc: 30,
                },
                {
                    // color: 'purple',
                    process: 'spoofax server',
                    revision: 4,
                    kind: 'syntax colors',
                    time_ms: 670000000,
                    time_perc: 25,
                },
                {
                    // color: 'yellow',
                    process: 'emacs',
                    revision: 4,
                    kind: 'sent originating msg',
                    time_ms: 40000,
                    time_perc: 0,
                },
            ];
        },

        // currentRevisionMsgs: function(currentRevision) {
        //     // Get the msgs for the current revision
        //     // let currentRevision = this.$data.currentRevision;
        //     var msgs = _.chain(this.msgs)
        //         .filter((msg) => msg.revision === currentRevision)
        //         .value();
        //     console.log(`msgs for revision ${currentRevision}:\n`, msgs);
        //     return msgs;
        // },

        // currentRevisionActions: function(currentRevision) {
        //     // Get the actions for the current revision
        //     // let currentRevision = this.$data.currentRevision;
        //     var kinds = _.chain(this.msgs)
        //         .filter((msg) => msg.revision === currentRevision)
        //         .map((msg) => msg.kind)
        //         .uniq()
        //         .value();
        //     console.log(`actions for revision ${currentRevision}:\n`, kinds);
        //     return kinds;
        // },

        legendColorByIndex:  d3.scaleOrdinal(d3.schemeCategory20),

        colorForKind: function(kind) {
            let index = _.indexOf(this.kinds, kind);
            return this.legendColorByIndex(index);
        },

        toggleRightDrawer() {
            app.rightDrawer = !app.rightDrawer;
            app.rightDrawerWidth =  app.rightDrawerWidth === '0%'
                ? app.rightDrawerOpenWidth
                : '0%';
        },
    },

    mounted() {
        var toggleRightDrawer = this.toggleRightDrawer;
        let dispatchKeypress = function(e) {
            let app = window.AvApp;
            switch (e.keyCode) {
            case 71: // 'G' key, toggles the Graphs drawer
                app.leftDrawer = !app.leftDrawer;
                break;
            case 76: // 'L' key, toggles the Legend drawer
                // toggleRightDrawer(); // TODO:
                app.rightDrawer = !app.rightDrawer;
                app.rightDrawerWidth =  app.rightDrawerWidth === '0%'
                    ? app.rightDrawerOpenWidth
                    : '0%';
                break;
                // default: alert(e.KeyCode); // Useful to discover other key codes
            }
        };

        window.addEventListener('keydown', dispatchKeypress, false);
    },

    components: {
        AvLegend,
        RevisionsGraph,
    }
}
</script>

<style>
  body {
      background: #303030;
  }
</style>

<style lang="stylus">
  @import './stylus/main'
</style>
