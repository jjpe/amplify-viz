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
                     @click.native="currentGraph = graph_item.graph; leftDrawer = !leftDrawer">
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
        <!-- @ click.native.stop="fixed = !fixed" -->
        <!-- TODO: clicking needs to actually sync data from MongoDB -->
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

      <!-- <\!-- "Single Revision" screen -\-> -->
      <!-- <v-layout justify-center v-if="currentGraph === 'revision'"> -->
      <!--   <v-flex xs11 sm11> -->
      <!--     <\!-- TODO: remove the min-height once the graph is operational -\-> -->
      <!--     <v-card style="margin-top: 15px; min-height: 30000px"> -->
      <!--       <v-card-title primary-title> -->
      <!--         <div> -->
      <!--           <h3 class="headline mb-0 orange--text">Revision</h3> -->
      <!--           <div class="grey--text">Actions in a revision</div> -->
      <!--         </div> -->
      <!--       </v-card-title> -->

      <!--       <v-card-actions> -->
      <!--         <v-btn class="orange--text">&lt;</v-btn> -->
      <!--         <v-spacer></v-spacer> -->
      <!--         <v-btn dark large fab disabled class="orange--text"> -->
      <!--           {{ currentRevisionValidationRules.valid(currentRevision) }} -->
      <!--         </v-btn> -->
      <!--         <v-spacer></v-spacer> -->
      <!--         <\!-- <v-spacer></v-spacer> -\-> -->
      <!--         <\!-- <v-spacer></v-spacer> -\-> -->
      <!--         <\!-- <v-spacer></v-spacer> -\-> -->
      <!--         <\!-- <v-spacer></v-spacer> -\-> -->
      <!--         <\!-- <v-spacer></v-spacer> -\-> -->
      <!--         <\!-- <\\!-- <v-spacer></v-spacer> -\\-> -\-> -->
      <!--         <\!-- <v-text-field name="input-3" -\-> -->
      <!--         <\!--               label="Revision" -\-> -->
      <!--         <\!--               v-model="currentRevisionRange" -\-> -->
      <!--         <\!--               :rules="[currentRevisionRangeValidationRules.valid]" -\-> -->
      <!--         <\!--               persistent-hint -\-> -->
      <!--         <\!--               dark -\-> -->
      <!--         <\!--               single-line -\-> -->
      <!--         <\!--               ></v-text-field> -\-> -->
      <!--         <\!-- <\\!-- <v-spacer></v-spacer> -\\-> -\-> -->
      <!--         <\!-- <v-spacer></v-spacer> -\-> -->
      <!--         <\!-- <v-spacer></v-spacer> -\-> -->
      <!--         <\!-- <v-spacer></v-spacer> -\-> -->
      <!--         <\!-- <v-spacer></v-spacer> -\-> -->
      <!--         <\!-- <v-spacer></v-spacer> -\-> -->
      <!--         <\!-- <v-spacer></v-spacer> -\-> -->
      <!--         <v-btn class="orange--text">&gt;</v-btn> -->
      <!--       </v-card-actions> -->

      <!--       <v-layout align-center justify-center> -->
      <!--         <v-flex xs12> -->
      <!--           <\!-- <v-card-media src="/public/v.png" height="200px" contain></v-card-media> -\-> -->
      <!--           <revision-graph></revision-graph> -->
      <!--         </v-flex> -->
      <!--       </v-layout> -->
      <!--     </v-card> -->
      <!--   </v-flex> -->
      <!-- </v-layout> -->


      <!-- "Revision Overview" screen -->
      <v-layout justify-center v-if="currentGraph === 'revisions'">
        <v-flex xs11 sm11>
          <v-card style="margin-top: 15px; min-height: 30000px">

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
                <revisions-graph></revisions-graph>
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
// import RevisionGraph from './RevisionGraph.vue'; // TODO: remove
import RevisionsGraph from './RevisionsGraph.vue';
export default {
    data() {
        // A kludge to ensure that the methods can be called from outside the
        // VaApp component.  This is used for e.g. creating key bindings for
        // the left and right side navs.
        window.AvApp = this;

        return {
            title: 'Amplify Viz',
            msgs: this.fetchMsgs(),

            // Options: 'none' and any `leftDrawerEntries.graph` value.
            currentGraph: 'none',

            leftDrawer: true,
            leftDrawerEntries: [
                // For more icons see https://material.io/icons/
                // { icon: 'filter_1',    title: 'Revision',  graph: 'revision'  },
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
    },

    methods: {
        fetchMsgs() { // TODO: unstub and implement
            return [
                {
                    color: 'blue',
                    process: 'spoofax server',
                    revision: 3,
                    kind: 'parse',
                    time_ms: 400000000,
                    time_perc: 18,
                },
                {
                    color: 'red',
                    process: 'spoofax server',
                    revision: 3,
                    time_ms: 2000000000,
                    time_perc: 60,
                    kind: 'analyze',
                },
                {
                    color: 'purple',
                    process: 'spoofax server',
                    revision: 3,
                    kind: 'syntax colors',
                    time_ms: 1000000000,
                    time_perc: 30,
                },
                {
                    color: 'yellow',
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

        toggleRightDrawer() {
            app.rightDrawer = !app.rightDrawer;
            app.rightDrawerWidth =  app.rightDrawerWidth === '0%'
                ? app.rightDrawerOpenWidth
                : '0%';
        },
    },

    mounted() {
        let dispatchKeypress = function(e) {
            let app = window.AvApp;
            switch (e.keyCode) {
            case 71: // 'G' key, toggles the Graphs drawer
                app.leftDrawer = !app.leftDrawer;
                break;
            case 76: // 'L' key, toggles the Legend drawer
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
        // RevisionGraph,
        RevisionsGraph,
    }
}
</script>

<style lang="stylus">
  @import './stylus/main'
</style>
