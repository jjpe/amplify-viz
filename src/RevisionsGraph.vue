<template>
  <svg :id="id"
       style="display: block; margin: auto"
       width="100%"> </svg>
       <!-- class="blue-grey darken-4" -->
</template>

<script>
import * as d3 from 'd3';
const data = [99, 71, 78, 25, 36, 92, 1, 200];
export default {
    name: 'revisions-graph',
    props: ['id', 'msgs', 'kinds'],

    computed: {
        msgsByRevision: function() {
            return _.groupBy(this.msgs, (msg) => msg.revision)
        },
    },

    mounted() {
        let initStackedBarChart = {
            draw: function(config) {
                let data = config.data;
                let margin = {top: 20, right: 20, bottom: 40, left: 50};
                let svgWidth = document
                    .getElementById('revisions-svg')
                    .getBoundingClientRect()
                    .width;
                let roundedSvgWidth = Math.ceil(svgWidth);
                // let width = svgWidth - margin.left - margin.right;
                let width = roundedSvgWidth - margin.left - margin.right;
                let height = 500 - margin.top - margin.bottom;
                let xScale = d3.scaleLinear().rangeRound([0, width]);
                let yScale = d3.scaleBand().rangeRound([height, 0]).padding(0.1);
                let colorScale = d3.scaleOrdinal(d3.schemeCategory20);
                let xAxis = d3.axisTop(xScale);
                let yAxis = d3.axisLeft(yScale)
                    // use comma grouping for thousands
                    .tickFormat(d3.format(",.0f"));
                let svg = d3.select("#" + config.element)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

                let stack = d3.stack()
                    .keys(config.key) // RevisionGraph.kinds
                    // .order(d3.stackOrder)
                    .offset(d3.stackOffsetNone);

                let layers = stack(data);
                console.log("[revisions-graph] layers", layers);
                console.log("[revisions-graph] data", data);

                // data.sort(function(a, b) { return b.total - a.total; });
                data.sort((a, b) => b.revision - a.revision);

                // TODO: The x-scale must become scale Time/Date rather than Time/Date:
                let lastLayer = layers[layers.length - 1];
                xScale.domain([0, d3.max(lastLayer,    (d) => d[0])]).nice();
                // TODO: The y-scale must become scale rev# rather than Time/Date:
                let parseDate = d3.timeParse("%m/%Y");
                yScale.domain(data.map(function(d) {
                    // console.log('le D: ', d);
                    return d.revision;
                    // console.log('le D: ', d);
                    // console.log('parse date: ', parseDate(d.date));
                    // return parseDate(d.date);
                }));

                let layer = svg.selectAll(".layer")
                    .data(layers)
                    .enter().append("g")
                      .attr("class", "layer")
                      .style("fill", function(d, i) { return colorScale(i); });

                layer.selectAll("rect")
                    .data(function(d) { return d; })
                    .enter().append("rect")
                    // .attr("y", function(d) { return yScale(parseDate(d.data.date)); })
                    .attr("y", function(d) {
                        console.log('LE D: ', d);
                        return yScale(d.data.revision);
                    })
                    .attr("x", function(d) { return xScale(d[0]); })
                    .attr("height", yScale.bandwidth())
                    .attr("width", function(d) { return xScale(d[1]) - xScale(d[0]) });

                svg.append("g")
                    .attr("class", "axis axis--x")
                    // .attr("transform", "translate(0," + (height+5) + ")")
                    .call(xAxis);

                svg.append("g")
                    .attr("class", "axis axis--y")
                    // .attr("transform", "translate(0,0)")
                    .call(yAxis);

                // svg.selectAll(".axis--y path").attr("style", "stroke: grey");
                // svg.selectAll(".axis--x path").attr("style", "stroke: grey");
                // svg.selectAll(".tick line").attr("style", "stroke: grey");

                // Fix the tick text color
                d3.selectAll("g.tick text").attr('fill', 'lightgrey');
                d3.selectAll("g.tick line").attr('stroke', 'white').attr('fill', 'white');


                // TODO: "cut out" pieces of each bar to visualize Wire Time:
                // <rect y="240" x="116" height="178" width="20" style="fill: rgb(66, 66, 66);"></rect>



                // // gridlines in x axis function
                // function make_x_gridlines() { return d3.axisBottom(xScale).ticks(5) }

                // svg.selectAll('g')
                //     .attr("class", "grid")
                //     .call(
                //         make_x_gridlines()
                //         // .tickSize(-height)
                //             .tickSize(config.data.length)
                //             .tickFormat("")
                //     );


                // // gridlines in y axis function
                // function make_y_gridlines() { return d3.axisLeft(yScale).ticks(5) }

                // // add the Y gridlines
                // svg.append("g")
                //     .attr("class", "grid")
                //     .call(
                //         make_y_gridlines()
                //             .tickSize(-width)
                //             .tickFormat("")
                //     )
            }
        };

        let data = [ // TODO: one entry per revision
            {
                'revision': 3,
                'total': 800000000,
                'syntax colors': 300000000,
                'parse': 400000000,
                'analyze': 400000000,
                'sent originating msg': 200,
                "date": "4/1854",
            },

            {
                'revision': 4,
                'total': 1800000000,
                'syntax colors': 200000000,
                'parse': 300000000,
                'analyze': 7400000000,
                'sent originating msg': 400000,
                "date": "7/1854",
            },

            {
                'revision': 50000,
                'total': 60000000,
                'syntax colors': 30000000,
                'parse': 40000000,
                'analyze': 40000000,
                'sent originating msg': 200000,
                "date": "10/1854",
            },

            // // Each entry/object here represents a month:
            // {"date": "4/1854", "total": 8571, "disease":   1, "wounds":  0, "other":  5},
            // {"date": "5/1854", "total":23333, "disease":  12, "wounds":  0, "other":  9},
            // {"date": "6/1854", "total":28333, "disease":  11, "wounds":  0, "other":  6},
            // {"date": "7/1854", "total":28772, "disease": 359, "wounds":  0, "other": 23},
            // {"date": "8/1854", "total":30246, "disease": 828, "wounds":  1, "other": 30},
            // {"date": "9/1854", "total":30290, "disease": 788, "wounds": 81, "other": 70},
            // {"date":"10/1854", "total":30643, "disease": 503, "wounds":132, "other":128},
            // {"date":"11/1854", "total":29736, "disease": 844, "wounds":287, "other":106},
            // {"date":"12/1854", "total":32779, "disease":1725, "wounds":114, "other":131},
            // {"date": "1/1855", "total":32393, "disease":2761, "wounds": 83, "other":324},
            // {"date": "2/1855", "total":30919, "disease":2120, "wounds": 42, "other":361},
            // {"date": "3/1855", "total":30107, "disease":1205, "wounds": 32, "other":172},
            // {"date": "4/1855", "total":32252, "disease": 477, "wounds": 48, "other": 57},
            // {"date": "5/1855", "total":35473, "disease": 508, "wounds": 49, "other": 37},
            // {"date": "6/1855", "total":38863, "disease": 802, "wounds":209, "other": 31},
            // {"date": "7/1855", "total":42647, "disease": 382, "wounds":134, "other": 33},
            // {"date": "8/1855", "total":44614, "disease": 483, "wounds":164, "other": 25},
            // {"date": "9/1855", "total":47751, "disease": 189, "wounds":276, "other": 20},
            // {"date":"10/1855", "total":46852, "disease": 128, "wounds": 53, "other": 18},
            // {"date":"11/1855", "total":37853, "disease": 178, "wounds": 33, "other": 32},
            // {"date":"12/1855", "total":43217, "disease":  91, "wounds": 18, "other": 28},
            // {"date": "1/1856", "total":44212, "disease":  42, "wounds":  2, "other": 48},
            // {"date": "2/1856", "total":43485, "disease":  24, "wounds":  0, "other": 19},
            // {"date": "3/1856", "total":46140, "disease":  15, "wounds":  0, "other": 35}

        ];

        // These define which layers/actions/kinds appear, and in which order:
        let key = ["wounds", "other", "disease"];

        console.log('[av-legend] this.msgs', this.msgs);
        console.log('[av-legend] this.kinds', this.kinds);
        initStackedBarChart.draw({
            element: 'revisions-svg',
            // data: this.msgs,
            key: this.kinds,
            data: data,
            // key: key
        });

    },
};
</script>

<style>
  .axis text {
      font: 10px Roboto;
  }
  .axis line,
  .axis path {
      fill: none;
      shape-rendering: crispEdges;
      stroke: grey;
  }
  .path-line {
      fill: none;
      stroke: yellow;
      stroke-width: 1.5px;
  }
  svg {
      background: transparent;
  }
</style>
