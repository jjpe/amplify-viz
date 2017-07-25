<template>
  <!-- TODO: parameterize the ID attr:  av-legend-table   -->
  <v-data-table :id="id"
                class="elevation-0"
                :headers="headers"
                :items="msgs"
                hide-actions >
    <template slot="items" scope="props" class="blue">
      <td class="text-xs-left" :class="props.item.color"></td>
      <td class="text-xs-center">{{ props.item.process }}</td>
      <td class="text-xs-center">{{ props.item.revision }}</td>
      <td class="text-xs-center">{{ props.item.kind }}</td>
      <td class="text-xs-right">{{ props.item.time_ms.toLocaleString() }}</td>
      <td class="text-xs-right">{{ props.item.time_perc }}</td>
    </template>
  </v-data-table>
</template>

<script>
export default {
    name: 'av-legend',
    props: ['id', 'msgs'],

    data() {
        // A kludge to ensure the .attr() call in the fixHeaders()
        // results in HTML that can actually call fixHeaders().
        window.AvLegend = this;

        return {
            headers: [
                { text: 'Color',     value: 'color',      align: 'center',  sortable: false },
                { text: 'Process',   value: 'process',    align: 'center',  sortable: true  },
                { text: 'Revision',  value: 'revision',   align: 'center',  sortable: true  },
                { text: 'Kind',      value: 'kind',       align: 'center',  sortable: true  },
                { text: 'Time (ms)', value: 'time_ms',    align: 'right',   sortable: true  },
                { text: 'Time (%)',  value: 'time_perc',  align: 'right',   sortable: true  }
            ],
        };
    },

    methods: {
        fixHeaders: function() {
            // A hack to color the legend table headers correctly.

            const COLOR = 'grey';
            d3.selectAll(`#${this.id} table thead tr th`)
            // Fix the headers again after sorting a column:
                .attr('onclick', 'window.AvLegend.fixHeaders()')
                .classed(`${COLOR}--text`, true)
                .classed('text--darken-1', true);
            // Color the upward/downward sorting arrow icon as well:
            d3.selectAll(`#${this.id} table thead tr th i`)
                .classed(`${COLOR}--text`, true);
        }
    },

    mounted() {
        this.fixHeaders()
    },
};
</script>

<style>

</style>
