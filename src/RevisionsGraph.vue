<template>
  <svg :id="id" width="100%"></svg>
</template>

<script>
import * as d3 from 'd3';
export default {
    name: 'revisions-graph',
    props: ['id'],
    data() {
        window.RevisionsGraph = this;
        return {
            msgs: [],
            kinds: [],
        };
    },

    computed: {
        msgsByRevision: function() {
            return _.groupBy(this.msgs, (msg) => msg.revision)
        },
        graphData: function() {
            console.log('[RevisionsGraph.computed.graphData()] this.msgs', this.msgs);
            console.log('[RevisionsGraph.computed.graphData()] this.msgsByRevision', this.msgsByRevision);
            console.log('[RevisionsGraph.computed.graphData()] this.kinds', this.kinds);
            let data = _.map(this.msgsByRevision,  function(msgs, revision) {
                // TODO: Find a better selector than 'source':
                let originatingMsg = _.find(msgs, (m) => m.kind === 'source');
                let otherMsgs =    _.filter(msgs, (m) => m.kind !== 'source');

                console.log('[RevisionsGraph.computed.graphData().map] msgs: ', msgs);
                console.log('[RevisionsGraph.computed.graphData().map] revision:', revision);
                console.log('[RevisionsGraph.computed.graphData().map] originatingMsg: ', originatingMsg);
                console.log('[RevisionsGraph.computed.graphData().map] otherMsgs: ', otherMsgs);

                let row = { revision: revision };
                let prevMsg = originatingMsg;
                for (let msg of msgs) {
                    // TODO: FIXME: I doubt that deltaT is right:
                    let deltaT = msg.received_at_ns - prevMsg.sent_at_ns;
                    row[msg.kind] = deltaT;
                    prevMsg = msg;
                }

                console.log('[RevisionsGraph.computed.graphData().map] row: ', row);
                return row;
            });
            let sortedData = _.orderBy(data, ['revision'], ['desc']);
            console.log('[RevisionsGraph.computed.graphData()] sortedData', sortedData);
            return sortedData;
        },
    },

    methods: {
        redraw(msgs, kinds) {
            this.msgs  = msgs;
            this.kinds = kinds;
            this.renderGraph();
        },

        renderGraph() {
            if (this.graphData === undefined || this.graphData === null) {
                throw '[RevisionsGraph.renderGraph()] No graph data found';
            }

            let margin = {top: 50, right: 40, bottom: 40, left: 70};
            const BAR_HEIGHT = 60;
            let svgWidth = document
                .getElementById(this.id)
                .getBoundingClientRect()
                .width;
            let width = Math.ceil(svgWidth) - margin.left - margin.right;
            let height = BAR_HEIGHT * this.graphData.length;
            let xScale = d3.scaleLinear().rangeRound([0, width]);
            let yScale = d3.scaleBand().rangeRound([height, 0]).padding(0.1);
            let colorScale = d3.scaleOrdinal(d3.schemeCategory20);
            let xAxis = d3.axisTop(xScale);
            let yAxis = d3.axisLeft(yScale)
                // Comma grouping for thousands
                .tickFormat(d3.format(",.0f"));

            d3.select(`#${this.id} g`).remove(); // Remove old graph, if present
            let svg = d3.select(`#${this.id}`)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                  .attr("transform", `translate(${margin.left}, ${margin.top})`);

            let stack = d3.stack()
                .keys(window.RevisionsGraph.kinds)
                // .order(d3.stackOrder)
                .offset(d3.stackOffsetNone);
            let layers = stack(this.graphData);
            let lastLayer =  layers.length > 0
                ? layers[layers.length - 1]
                : []; // default when there are no layers

            // Sort the graph data by revision, ascending:
            this.graphData.sort((a, b) => b.revision - a.revision);

            console.log('[revisionsGraph.renderGraph()] this.msgs',  this.msgs);
            console.log('[revisionsGraph.renderGraph()] this.kinds', this.kinds);
            console.log("[revisionsGraph.renderGraph()] sorted graphData", this.graphData);
            console.log("[revisionsGraph.renderGraph()] layers", layers);
            console.log('[revisionsGraph.renderGraph()] last layer: ', lastLayer);

            let maxX = lastLayer.length > 0
                ? d3.max(lastLayer,  (d) => d[0])
                : 0 /* Default when the last layer is empty */;
            xScale.domain([0, maxX]).nice();
            yScale.domain(this.graphData.map((d) => d.revision));

            let layer = svg.selectAll(".layer")
                .data(layers)
                .enter().append("g")
                .attr("class", "layer")
                .attr("color",  (d, i) => colorScale(i).replace('#', ''))
                .style("fill",  (d, i) => colorScale(i));

            layer.selectAll("rect") // Stacked bars for each revision
                // .data(function(d) { return d; })
                .data((d) => d)
                .enter().append("rect")
                  .attr("y", (d) => yScale(d.data.revision))
                  .attr("x", (d) => xScale(d[0]))
                  .attr("height", yScale.bandwidth())
                  .attr("width", function(d) {
                      // Set the width to 0 when there is no `d[1]` value
                      if (Number.isNaN(d[1])) { return 0; }
                      return xScale(d[1]) - xScale(d[0]);
                  });

            svg.append("g")  // X axis
                .attr("class", "axis axis--x")
                .call(xAxis);
            svg.select(`.axis--x`)
                .append('text')
                  .attr('text-anchor', 'middle')
                  .attr('x', `${width/2}px`)
                  .attr('y', '-30px')
                  .text('Time (ns)');

            svg.append("g")  // Y axis
                .attr("class", "axis axis--y")
                .call(yAxis);
            svg.select(`.axis--y`)
                .append('text')
                  .attr('text-anchor', 'middle')
                  .attr('x', `-${height/2}px`)
                  .attr('y', '-50px')
                  .attr('style', 'transform: rotate(-90deg)')
                  .text('Revision');

            // TODO: "cut out" pieces of each bar to visualize `Wire Time`:
            // <rect y="240" x="116" height="178" width="20" style="fill: rgb(66, 66, 66);"></rect>

            svg.append("g")  // Vertical grid lines
                .attr("class", "grid")
                .attr("stroke-width", "0.06em")
                .call(d3.axisTop(xScale).tickSize(-width).tickFormat(""));
            svg.selectAll('g.grid g.tick line')
                .attr('stroke-dasharray', '10, 10')
                .attr('y2', height);

            // Clean up the length of the left/rightmost vertical grid lines
            svg.selectAll('g.grid path.domain').remove();
        },
    },

    mounted() {
        window.RevisionsGraph = this;
        this.renderGraph();
    },
};
</script>

<style>
svg {
    background: transparent;
    display: block;
    margin: auto;
}
.axis text { /* X/Y axis ticker text */
    font: 10px Roboto;
    fill: grey;
}
#revisions-svg > g > g > text { /* X/Y axis labels */
    fill: grey;
    font-family: roboto;
    font-size: 20px;
    /* transform: rotate(-90deg); */
}
.axis line,
.axis path { /* X/Y axis proper */
    fill: none;
    shape-rendering: crispEdges;
    stroke: grey;
}
g.grid path.domain { /* X axis override. Necessary due to the vertical lines */
    stroke: grey;
}
g.tick line { /* X/Y axis ticker lines perpendicular to the axis itself */
    stroke: grey;
}
</style>

<!--
{
    process: String,
    request_number: u64,
    kind: String,
    origin: Option<String>,
    contents: Option<Contents>,
    regions: Vec<Region>,
    language: Option<Language>,
    ast: Option<Ast>,
    sent_at: u64,
    received_at_ns,
    transmission_duration_ns
}
-->
