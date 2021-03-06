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
                     @click.native="currentGraph = graph_item.title;
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
      <v-btn icon @click.native="fetchMsgs()">
        <!-- TODO:
             clicking needs to actually sync data from MongoDB,
             or request it from an application server  -->
        <v-icon class="grey--text">sync</v-icon>
      </v-btn>
      <v-btn icon
             @click.native.stop="toggleRightDrawer()"
             class="grey--text">
        <v-icon>view_module</v-icon>
      </v-btn>
      <!-- <v-btn icon -->
      <!--        @click.native.stop="rightDrawer = !rightDrawer; -->
      <!--                            rightDrawerWidth === '0%' -->
      <!--                                ? rightDrawerWidth = rightDrawerOpenWidth -->
      <!--                                : rightDrawerWidth = '0%'" -->
      <!--        class="grey--text"> -->
      <!--   <v-icon>view_module</v-icon> -->
      <!-- </v-btn> -->
    </v-toolbar>
    <main>
      <!-- "Revision Overview" screen -->
      <v-layout justify-center v-if="currentGraph === 'Revisions'">
        <v-flex xs11 sm11>
          <v-card style="margin-top: 15px; margin-bottom: 15px;">

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
                <revisions-graph id="revisions-svg" :msgs="msgs" :kinds="kinds"></revisions-graph>
              </v-flex>
            </v-layout>

          </v-card>
        </v-flex>
      </v-layout>

    </main>
    <v-navigation-drawer id="right-drawer"
                         persistent clipped right
                         :style="{ width: rightDrawerWidth }"
                         v-model="rightDrawer"
                         hide-overlay>
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
            msgs: [],

            // Options: 'none' and any `leftDrawerEntries.title` value.
            currentGraph: 'Revisions',

            leftDrawer: false,
            leftDrawerEntries: [
                // For more icons see https://material.io/icons/
                { icon: 'filter_none', title: 'Revisions' }
            ],

            rightDrawer: true,
            rightDrawerWidth: '0%',
            rightDrawerOpenWidth: '70%',

            colorScale: d3.scaleOrdinal(d3.schemeCategory20),
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
        sourceMsgs: function() {
            /// Return the "source" msg from each revision.
            return _.filter(this.msgs,  (msg) => msg.kind === 'source');
        },
        fattenedMsgs: function() {
            let colorForKind = this.colorForKind;
            let sourceMsgs = this.sourceMsgs;
            // let prevMsg = { sent_at_ns: 0 };
            let fattenedMsgs = _.map(this.msgs, function(msg) {
                msg.color = colorForKind(msg.kind);
                msg.wire_time_ns = parseInt(msg.received_at_ns) - parseInt(msg.sent_at_ns);
                // let srcMsg = _.filter(sourceMsgs, (sm) => sm.revision === msg.revision)[0];
                // console.log(`[fattenedMsgs] msg.received_at_ns: `, msg.received_at_ns);
                // console.log(`[fattenedMsgs] parseInt(msg.received_at_ns): `, parseInt(msg.received_at_ns));
                // console.log(`[fattenedMsgs] srcMsg.sent_at_ns: `, srcMsg.sent_at_ns);
                // console.log(`[fattenedMsgs] parseInt(srcMsg.sent_at_ns): `, parseInt(srcMsg.sent_at_ns));
                // msg.action_time_ns = parseInt(msg.received_at_ns) - parseInt(srcMsg.sent_at_ns);
                return msg;
            });


            for (let idx in this.msgsByRevision) {
                let revisionMsgs = _.chain(this.msgsByRevision[idx])
                    .sortBy(['sent_at_ns'], ['asc'])
                    .value();
                let prevMsg = revisionMsgs[0];
                for (let midx in revisionMsgs) {
                    let msg = revisionMsgs[midx];
                    msg.action_time_ns = parseInt(msg.received_at_ns) - parseInt(prevMsg.received_at_ns);
                    prevMsg = msg;
                }
            }

            console.log(`[fattenedMsgs] fattenedMsgs: `, fattenedMsgs);
            return fattenedMsgs;
        },
    },

    methods: {
        fetchMsgs() {
            console.log('[fetchMsgs] method called');
            d3.request('/msgs/')
                .header('X-Requested-With', 'XMLHttpRequest')
                .header('Content-Type', 'application/json')
                .get(function(resp) {
                    let msgs = JSON.parse(resp.responseText);
                    let sortedMsgs = _.orderBy(
                        msgs,
                        ['revision', 'sent_at_ns'],
                        ['asc', 'asc']
                    );
                    console.log('[fetchMsgs callback] msgs: ', msgs);
                    console.log('[fetchMsgs callback] sorted msgs: ', sortedMsgs);
                    window.AvApp.msgs = msgs;
                    window.RevisionsGraph.redraw(
                        window.AvApp.msgs,
                        window.AvApp.kinds
                    );
                    window.AvLegend.msgs = window.AvApp.fattenedMsgs;
                });
        },

        colorForKind(kind) {
            let index = _.indexOf(this.kinds, kind);
            if (index < 0) { return null; }
            return this.colorScale(index);
        },

        toggleRightDrawer() {
            let oldWidth = d3.select('#right-drawer').style('width');
            let newWidth =  oldWidth === '0%'
                ? '70%' //this.rightDrawerOpenWidth
                : '0%';
            // d3.select('#right-drawer').style('width', newWidth);
            this.rightDrawerWidth = newWidth;
            // if (width !== '0%') {
            //     d3.select('#right-drawer').style('width', '0%');
            // } else {
            //     d3.select('#right-drawer').style('width', '70%');
            // }
        },

        dispatchKeypress(event) {
            switch (event.key) {
            case 'g': // Toggles the Graph drawer
                this.leftDrawer = !this.leftDrawer;
                break;
            case 'l': // Toggles the Legend drawer
                this.toggleRightDrawer();
                break;
            case 'f': // Causes a graph data fetch
                this.fetchMsgs();
                break;
            // default:
            //     console.log('key event:', event); // Useful to discover other key codes
            }
        },
    },

    mounted() {
        window.addEventListener('keydown', this.dispatchKeypress, false);
        window.AvApp.fetchMsgs();

        // This is a hack to get the menu to hide initially:
        window.AvApp.toggleRightDrawer();
        window.AvApp.toggleRightDrawer();
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
    overflow-y: scroll;
}
#right-drawer {
    overflow-y: scroll;
}
</style>

<style lang="stylus">
  @import './stylus/main'
</style>
