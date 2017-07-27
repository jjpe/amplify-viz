<template>
  <svg :id="id" width="100%"></svg>
</template>

<script>
import * as d3 from 'd3';
export default {
    name: 'revisions-graph',
    props: ['id', 'msgs', 'kinds'],

    computed: {
        msgsByRevision: function() {
            return _.groupBy(this.msgs, (msg) => msg.revision)
        },
    },

    methods:  {
        computeGraph(data) {
            let margin = {top: 50, right: 40, bottom: 40, left: 70};
            const BAR_HEIGHT = 60;
            let svgWidth = document
                .getElementById(this.id)
                .getBoundingClientRect()
                .width;
            let height = BAR_HEIGHT * data.length;
            let width = Math.ceil(svgWidth) - margin.left - margin.right;
            let xScale = d3.scaleLinear().rangeRound([0, width]);
            let yScale = d3.scaleBand().rangeRound([height, 0]).padding(0.1);
            let colorScale = d3.scaleOrdinal(d3.schemeCategory20);
            let xAxis = d3.axisTop(xScale);
            let yAxis = d3.axisLeft(yScale)
                // Comma grouping for thousands
                .tickFormat(d3.format(",.0f"));
            let svg = d3.select(`#${this.id}`)
                .attr("height", height + margin.top + margin.bottom)
                .append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

            let stack = d3.stack()
                .keys(window.RevisionsGraph.kinds)
                // .order(d3.stackOrder)
                .offset(d3.stackOffsetNone);
            let layers = stack(data);

            // Sort the data by revision, ascending:
            data.sort((a, b) => b.revision - a.revision);

            console.log('[revisions-graph] this.msgs',  this.msgs);
            console.log('[revisions-graph] this.kinds', this.kinds);
            console.log("[revisions-graph] layers", layers);
            console.log("[revisions-graph] data", data);
            console.log("[revisions-graph] sorted data", data);
            console.log('[revisions-graph] last layer: ', layers[layers.length - 1]);

            let lastLayer = layers[layers.length - 1];
            let maxX = d3.max(lastLayer,  (d) => d[0]);
            xScale.domain([0, maxX]).nice();
            yScale.domain(data.map((d) => d.revision));

            let layer = svg.selectAll(".layer")
                .data(layers)
                .enter().append("g")
                .attr("class", "layer")
                .style("fill", function(d, i) { return colorScale(i); });

            layer.selectAll("rect") // Stacked bars for each revision
                .data(function(d) { return d; })
                .enter().append("rect")
                .attr("y", (d) => yScale(d.data.revision))
                .attr("x", (d) => xScale(d[0]))
                .attr("height", yScale.bandwidth())
                .attr("width", (d) => xScale(d[1]) - xScale(d[0]));

            svg.append("g")  // X axis
                .attr("class", "axis axis--x")
                .call(xAxis);
            svg.select(`#${this.id} g`)
                .append('text')
                .attr('text-anchor', 'middle')
                .attr('x', `${width/2}px`)
                .attr('y', '-30px')
                .text('Time (ns)');

            svg.append("g")  // Y axis
                .attr("class", "axis axis--y")
                .call(yAxis);
            svg.select(`#${this.id} g`)
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

        }
    },

    mounted() {
        window.RevisionsGraph = this;

        let data_ = _.chain(this.msgsByRevision)
            .map(function(msgs, revision) {
                console.log('[TEMPORARY]', msgs, revision);
                let originatingMsg =
                    _.find(msgs, (msg) => msg.kind === 'sent originating msg');
                let otherMsgs =
                    _.filter(msgs, (msg) => msg.kind !== 'sent originating msg');
                let msgEpoch = originatingMsg.sent_at;
                for (let msg of otherMsgs) {
                    _.forOwn(msg, function(value, prop) {
                        console.log('-', prop, value);
                    });
                }
                return msgs;
            })
            .value()
        console.log('[TEMPORARY] ', data_);

        let data = [ // TODO: transform the actual data into this format:
            {
                'revision': 3,
                'syntax colors': 300000000,
                'parse': 400000000,
                'analyze': 400000000,
                'sent originating msg': 200,
            },

            {
                'revision': 4,
                'syntax colors': 200000000,
                'parse': 300000000,
                'analyze': 7400000000,
                'sent originating msg': 400000,
            },

            {
                'revision': 60,
                'syntax colors': 30000000,
                'parse': 40000000,
                'analyze': 40000000,
                'sent originating msg': 200000,
            },

            {
                'revision': 61,
                'syntax colors': 30000000,
                'parse': 1600000000,
                'analyze': 2900000000,
                'sent originating msg': 200000,
            },
        ];

        this.computeGraph(data);

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
