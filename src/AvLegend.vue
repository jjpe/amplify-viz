<template>
  <v-data-table :id="id"
                :headers="headers"
                :items="msgs"
                :pagination.sync="pagination">
    <template slot="items" scope="props">
      <td class="text-xs-left" :style="{background: props.item.color}"></td>
      <td class="text-xs-center">{{ props.item.process }}</td>
      <td class="text-xs-center">{{ props.item.revision }}</td>
      <td class="text-xs-center">{{ props.item.kind }}</td>
      <td class="text-xs-right">{{ parseInt(props.item.sent_at_ns).toLocaleString() }}</td>
      <td class="text-xs-right">{{ parseInt(props.item.received_at_ns).toLocaleString() }}</td>
    </template>
  </v-data-table>
</template>

<script>
export default {
    name: 'av-legend',
    props: ['id'],

    data() {
        // A kludge to ensure the .attr() call in the fixHeaders()
        // results in HTML that can actually call fixHeaders().
        window.AvLegend = this;

        return {
            msgs: [],

            headers: [
                { text: 'Color',            value: 'color',          align: 'center', sortable: false },
                { text: 'Process',          value: 'process',        align: 'center', sortable: true  },
                { text: 'Revision',         value: 'revision',       align: 'center', sortable: true  },
                { text: 'Kind',             value: 'kind',           align: 'center', sortable: true  },
                { text: 'Sent At (ns)',     value: 'sent_at_ns',     align: 'right',  sortable: true  },
                { text: 'Received At (ns)', value: 'received_at_ns', align: 'right',  sortable: true  },
            ],

            pagination: {
                rowsPerPage: 100,
                sortBy: 'sent_at_ns'
            },

        };
    },

    methods: {
        fixHeaders: function() {
            const COLOR = 'grey';
            d3.selectAll(`#${this.id} table thead tr th`)
                // Fix the headers again after sorting a column:
                .attr('onclick', 'window.AvLegend.fixHeaders()')
                .classed(`${COLOR}--text`, true)
                .classed('text--darken-1', true);
            // Color the upward/downward sorting arrow icon as well:
            d3.selectAll(`#${this.id} table thead tr th i`)
                .classed(`${COLOR}--text`, true);
        },

        sortByColumn: function(columnName) {
            let index = this.headers.findIndex((h) => h.value === columnName);
            this.pagination.sortBy = this.headers[index].value;
        },
    },

    mounted() {
        this.fixHeaders()
    },
};
</script>

<style>
.datatable__actions {
    color: grey;
}
table.table tbody tr:hover {
  background: #312f2f !important;
}
</style>
