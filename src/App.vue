<template>
  <v-app dark>
    <v-navigation-drawer persistent clipped v-model="leftDrawer">
      <v-toolbar class="grey--text cyan darken-4" dark>
        <v-toolbar-title>Graphs</v-toolbar-title>
      </v-toolbar>

      <v-list>
        <v-list-tile v-for="(graph_item, i) in graph_items"
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
             class="grey--text"
             >
             <!-- document.getElementById('right-drawer').style.width = '70%' -->
        <v-icon>view_module</v-icon>
      </v-btn>
    </v-toolbar>
    <main>

      <!-- "Single Revision" screen -->
      <v-layout justify-center v-if="currentGraph === 'revision'">
        <v-flex xs11 sm11>
          <!-- TODO: remove the min-height once the graph is operational -->
          <v-card style="margin-top: 15px; min-height: 30000px">
            <v-card-title primary-title>
              <div>
                <h3 class="headline mb-0 orange--text">Revision</h3>
                <div class="grey--text">Actions in a revision</div>
              </div>
            </v-card-title>

            <v-card-actions>
              <v-btn class="orange--text">&lt;</v-btn>
              <v-spacer></v-spacer>
              <v-btn class="orange--text">&gt;</v-btn>
            </v-card-actions>

            <v-layout align-center justify-center>
              <v-flex xs12>
                <v-card-media src="/public/v.png" height="200px" contain></v-card-media>
                <!-- TODO:   Create a "Revision graph" component using D3.
                             Then bind it to '#revision-svg'. -->
                <!-- TODO: remove the class="blue-grey darken-4" line below. -->
                <svg id="revision-svg"
                     class="blue-grey darken-4"
                     style="display: block; margin: auto"
                     width="95%" > </svg>
              </v-flex>
            </v-layout>
          </v-card>
        </v-flex>
      </v-layout>


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
                <!-- TODO:   Create a "Revision graph" component using D3.
                             Then bind it to '#revisions-svg'. -->
                <!-- TODO: remove the class="blue-grey darken-4" line below. -->
                <svg id="revisions-svg"
                     class="blue-grey darken-4"
                     style="display: block; margin: auto"
                     width="95%" > </svg>
              </v-flex>
            </v-layout>

          </v-card>
        </v-flex>
      </v-layout>

    </main>
    <v-navigation-drawer id="right-drawer"
                         persistent clipped right
                         v-model="rightDrawer"
                         v-bind:style="{ width: rightDrawerWidth }">
      <v-toolbar class="grey--text indigo"
                 dark>
                 <!-- style="padding-top: 25px; padding-bottom: 10px; margin-bottom: 10px" -->
        <v-toolbar-title>Legend</v-toolbar-title>
        <!-- <v-layout wrap indigo justify-center align-center> -->
        <!--   <v-flex xs12><v-toolbar-title>Legend</v-toolbar-title></v-flex> ->-
        <!--   <v-flex xs1><v-subheader></v-subheader></v-flex> -->
        <!--   <v-flex xs3><v-subheader>Process</v-subheader></v-flex> -->
        <!--   <v-flex xs3><v-subheader>Action</v-subheader></v-flex> -->
        <!--   <v-flex xs3><v-subheader>Time (ms)</v-subheader></v-flex> -->
        <!--   <v-flex xs2><v-subheader>Time (%)</v-subheader></v-flex> -->
        <!-- </v-layout> -->
      </v-toolbar>


      <v-data-table class="elevation-0 grey--text"
                    v-bind:headers="legend.headers"
                    :items="legend.items"
                    hide-actions >
        <template slot="items" scope="props" class="blue">
          <td class="text-xs-left" :class="props.item.color"></td>
          <td class="text-xs-center">{{ props.item.process }}</td>
          <td class="text-xs-center">{{ props.item.action }}</td>
          <td class="text-xs-right">{{ props.item.time_ms.toLocaleString() }}</td>
          <td class="text-xs-right">{{ props.item.time_perc }}</td>
        </template>
      </v-data-table>


      <!-- <v-layout wrap justify-center align-center> -->
      <!--   <v-flex xs1><v-subheader class="blue"></v-subheader></v-flex> -->
      <!--   <v-flex xs3><v-subheader>spoofax mode</v-subheader></v-flex> -->
      <!--   <v-flex xs3><v-subheader>syntax coloring</v-subheader></v-flex> -->
      <!--   <v-flex xs3><v-subheader>1,300</v-subheader></v-flex> -->
      <!--   <v-flex xs2><v-subheader>70</v-subheader></v-flex> -->

      <!--   <v-flex xs1> -->
      <!--     <v-subheader class="red"></v-subheader> -->
      <!--   </v-flex> -->
      <!--   <v-flex xs11> -->
      <!--     <v-subheader>Bar</v-subheader> -->
      <!--   </v-flex> -->

      <!--   <v-flex xs1> -->
      <!--     <v-subheader class="green"></v-subheader> -->
      <!--   </v-flex> -->
      <!--   <v-flex xs11> -->
      <!--     <v-subheader>Baz</v-subheader> -->
      <!--   </v-flex> -->

      <!--   <v-flex xs1> -->
      <!--     <v-subheader class="purple"></v-subheader> -->
      <!--   </v-flex> -->
      <!--   <v-flex xs11> -->
      <!--     <v-subheader>Qux</v-subheader> -->
      <!--   </v-flex> -->

      <!-- </v-layout> -->

    </v-navigation-drawer>
  </v-app>
</template>

<script>
    export default {
        data () {
                // fixed: false,
            var dataObj = {
                graph_items: [
                    // For more icons see https://material.io/icons/
                    { icon: 'filter_1',    title: 'Revision',  graph: 'revision'  },
                    { icon: 'filter_none', title: 'Revisions', graph: 'revisions' }
                ],
                leftDrawer: true,
                rightDrawer: false,
                rightDrawerWidth: '0%',
                rightDrawerOpenWidth: '700px',
                title: 'Amplify Viz',

                // Options: 'none' and any `graph_items.graph` value above.
                currentGraph: 'none',

                legend: {
                    headers: [
                        { text: 'Color',     value: 'color',      align: 'center',  sortable: false },
                        { text: 'Process',   value: 'process',    align: 'center',  sortable: false },
                        { text: 'Action',    value: 'action',     align: 'center',  sortable: true  },
                        { text: 'Time (ms)', value: 'time_ms',    align: 'right',   sortable: true  },
                        { text: 'Time (%)',  value: 'time_perc',  align: 'right',   sortable: true  }
                    ],
                    items: [
                        {
                            color: 'blue',
                            process: 'spoofax server',
                            action: 'parse',
                            time_ms: 400000000,
                            time_perc: 18,
                            value: false,
                            name: 'Frozen Yogurt',
                        },
                        {
                            color: 'red',
                            process: 'spoofax server',
                            time_ms: 2000000000,
                            time_perc: 60,
                            action: 'analyze',
                            value: false,
                            name: 'Ice cream sandwich',
                        },
                        {
                            color: 'purple',
                            process: 'spoofax server',
                            action: 'syntax colors',
                            time_ms: 1000000000,
                            time_perc: 30,
                            value: false,
                            name: 'Frozen Yogurt',
                        },
                        {
                            color: 'yellow',
                            process: 'emacs',
                            action: 'sent originating msg',
                            time_ms: 40000,
                            time_perc: 0,
                            value: false,
                            name: 'Frozen Yogurt',
                        },
                    ]
                }
            };
            window.VueData = dataObj; // Ensure the data is accessible from HTML
            return dataObj;
        }
    }
</script>

<style lang="stylus">
  @import './stylus/main'
</style>
