<template>
  <v-data-table :id="id"
                :headers="headers"
                :items="msgs"
                :pagination.sync="pagination">
    <template slot="items" scope="props">
      <td @mouseenter="mouseEnterColorCell"
          @mouseleave="mouseLeaveColorCell"
          class="unselectable text-xs-left"
          :style="{background: props.item.color}"></td>
      <td class="unselectable text-xs-center">{{ props.item.revision }}</td>
      <td class="unselectable text-xs-center">{{ props.item.process  }}</td>
      <td class="unselectable text-xs-center">{{ props.item.kind     }}</td>
      <td class="unselectable text-xs-right">{{ formattedDuration(props.item.action_time_ns) }}</td>
      <td class="unselectable text-xs-right">{{ formattedDate(props.item.sent_at_ns)         }}</td>
      <td class="unselectable text-xs-right">{{ formattedDate(props.item.received_at_ns)     }}</td>
      <td class="unselectable text-xs-right">{{ formattedDuration(props.item.wire_time_ns)   }}</td>
    </template>
  </v-data-table>
</template>

<script>
import moment from 'moment';
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
                { text: 'Color',          value: 'color',          align: 'center', sortable: false },
                { text: 'Process',        value: 'process',        align: 'center', sortable: true  },
                { text: 'Revision',       value: 'revision',       align: 'center', sortable: true  },
                { text: 'Action',         value: 'kind',           align: 'center', sortable: true  },
                /// Action time `T_action` of an action in a Revision is the
                /// time delta between 2 moments:
                ///  1. The moment that the `originating msg` was sent
                ///  2. The moment that the corresponding `action msg` was
                ///     received by the Collector
                { text: 'T action (ms)',  value: 'action_time_ns', align: 'right',  sortable: true  },
                /// Wire time `T~~` of a `msg` is the time delta between:
                ///  1. The moment the msg was sent
                ///  2. The moment that same msg was received by the Collector
                { text: 'T~~ (ms)',       value: 'wire_time_ns',   align: 'right',  sortable: true  },
                { text: 'Sent At',        value: 'sent_at_ns',     align: 'right',  sortable: true  },
                { text: 'Received At',    value: 'received_at_ns', align: 'right',  sortable: true  },
            ],

            pagination: {
                rowsPerPage: 100,
                sortBy: 'sent_at_ns'
            },

        };
    },

    methods: {
        formattedDuration(nanoseconds) {
            // Return the result as milliseconds rounded to 1 decimal.
            return Math.round(nanoseconds / 1000000).toFixed(1)
        },
        formattedDate(nanoseconds) {
            let millis = parseInt(nanoseconds) / 1000000;
            return moment(millis).format('DD/MM/\'YY  HH:mm:ss.SSS');
        },

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

        mouseEnterColorCell: function(event) {
            let element = event.target;
            let bgColor = d3.select(element).style('background');
            let bgHexColor = this.colorToHex(bgColor);
            this.layersNotColoredAs(bgHexColor).style('opacity', 0.1);
            d3.select('.navigation-drawer--right').style('opacity', 0.2);
        },

        mouseLeaveColorCell: function(event) {
            let element = event.target;
            let bgColor = d3.select(element).style('background');
            let bgHexColor = this.colorToHex(bgColor);
            this.layersNotColoredAs(bgHexColor).style('opacity', 1);
            d3.select('.navigation-drawer--right').style('opacity', 1);
        },

        layerColoredAs(color) {
            let colorHex = window.AvLegend.colorToHex(color);
            return d3.selectAll('#revisions-svg g g.layer')
                .filter(function(d, i, layers) {
                    let element = layers[i];
                    let style = window.getComputedStyle(element);
                    let fill = style.getPropertyValue('fill');
                    let fillHex = window.AvLegend.colorToHex(fill);
                    return fillHex.trim() === colorHex.trim();
                });
        },

        layersNotColoredAs(color) {
            let colorHex = window.AvLegend.colorToHex(color);
            return d3.selectAll('#revisions-svg g g.layer')
                .filter(function(d, i, layers) {
                    let element = layers[i];
                    let style = window.getComputedStyle(element);
                    let fill = style.getPropertyValue('fill');
                    let fillHex = window.AvLegend.colorToHex(fill);
                    return fillHex.trim() !== colorHex.trim();
                });
        },

        colorToRgb(color) {
            if (color.startsWith('rgb(')) {
                return color.trim();
            } else if (color.startsWith('#')) {
                return this.hexStringToRgbString(color).trim();
            } else {
                throw `Unknown color: ${color}`
            }
        },

        colorToHex(color) {
            if (color.startsWith('rgb(')) {
                return this.rgbStringToHex(color).trim();
            } else if (color.startsWith('#')) {
                return color.trim();
            } else {
                throw `Unknown color: ${color}`
            }
        },

        componentToHex(c) {
            let hex = c.toString(16);
            return hex.length == 1 ? '0' + hex : hex;
        },

        rgbToHex(r, g, b) {
            let red   = this.componentToHex(r);
            let green = this.componentToHex(g);
            let blue  = this.componentToHex(b);
            return `#${red}${green}${blue}`;
        },

        hexStringToRgb(hex) {
            let result = /#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        },

        rgbStringToHex(rgb) {
            let result = /rgb\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)\)/g.exec(rgb);
            let r = parseInt(result[1]);
            let g = parseInt(result[2]);
            let b = parseInt(result[3]);
            return this.rgbToHex(r, g, b);
        },

        hexStringToRgbString(hex) {
            let o = this.hexStringToRgb(hex);
            return `rgb(${o.r},${o.g},${o.b})`;
        },

    },

    mounted() {
        this.fixHeaders();
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
.unselectable {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}
</style>
