<template>
  <!-- TODO: parameterize the ID attr -->
  <div>
  <v-btn class="orange--text" @click.native="currentRevisionMsgs()">blah</v-btn>
  <svg id="revision-svg"
       class="blue-grey darken-4"
       style="display: block; margin: auto"
       width="95%"></svg>
  </div>
</template>

<script>
import * as d3 from 'd3';
import _ from 'lodash';
const data = [99, 71, 78, 25, 36, 92, 10, 200, 0, 40, 170, 31, 59,5];
export default {
    name: 'revision-graph',
    data() {
        window.RevisionGraphData = {
            currentRevision: 2,
            msgs: [
                {
                    color: 'blue',
                    revision: 2,
                    process: 'spoofax server',
                    kind: 'parse',
                    time_ms: 400000000,
                    time_perc: 18,
                    value: false,
                    name: 'Frozen Yogurt',
                },
                {
                    color: 'red',
                    revision: 2,
                    process: 'spoofax server',
                    time_ms: 2000000000,
                    time_perc: 60,
                    kind: 'analyze',
                    value: false,
                    name: 'Ice cream sandwich',
                },
                {
                    color: 'purple',
                    revision: 2,
                    process: 'spoofax server',
                    kind: 'syntax colors',
                    time_ms: 1000000000,
                    time_perc: 30,
                    value: false,
                    name: 'Frozen Yogurt',
                },
                {
                    color: 'yellow',
                    revision: 3,
                    process: 'emacs',
                    kind: 'sent originating msg',
                    time_ms: 40000,
                    time_perc: 0,
                    value: false,
                    name: 'Frozen Yogurt',
                },
            ],

        };
        return window.RevisionGraphData;
    },
    mounted() {
        const svg = d3.select('#revision-svg')
              .attr('height', 300)
              .append('g').attr('transform', 'translate(10, 10)');
        const xScale = d3.scaleLinear().range([0, 1000]);
        const yScale = d3.scaleLinear().range([250, 0]);
        d3.axisLeft().scale(xScale);
        d3.axisTop().scale(yScale);
        xScale.domain(d3.extent(data, (d, i) => i));
        yScale.domain([0, d3.max(data, d => d)]);
        const createPath = d3.line()
              .x((d, i) => xScale(i))
              .y(d => yScale(d));
        svg.append('path')
           .attr('d', createPath(data));
    },
    methods: {
        currentRevisionMsgs() {
            // Get the msgs for the current revision
            let currentRevision = this.$data.currentRevision;
            var msgs = _.chain(this.$data.msgs)
                .filter((msg) => msg.revision === currentRevision)
                .value();
            console.log(`msgs for revision ${currentRevision}:\n`, msgs);
            return msgs;
        },
        currentRevisionActions() {
            // Get the actions for the current revision
            let currentRevision = this.$data.currentRevision;
            var actions = _.chain(this.$data.msgs)
                .filter((msg) => msg.revision === currentRevision)
                .map((msg) => msg.kind)
                .uniq()
                .value();
            console.log(`actions for revision ${currentRevision}:\n`, actions);
            return actions;
        }
    }
};
</script>

<style>
  svg {
    margin: 25px;
  }
  svg path {
    fill: none;
    /* stroke: #76BF8A; */
    stroke: red;
    stroke-width: 3px;
  }
</style>
