<template>
  <!-- <div>FOO!</div> -->
  <!-- TODO: parameterize the ID attr -->
  <svg id="revisions-svg"
       class="blue-grey darken-4"
       style="display: block; margin: auto"
       width="100%"> </svg>
       <!-- class="transparent" -->
</template>

<script>
import * as d3 from 'd3';
const data = [99, 71, 78, 25, 36, 92, 1, 200];
export default {
    name: 'revisions-graph',
    mounted() {
        // const svg = d3.select('#revisions-svg')
        //       .attr('height', 400)
        //       .append('g').attr('transform', 'translate(0, 10)');

        let initStackedBarChart = {
            draw: function(config) {
                let data = config.data;
                let margin = {top: 20, right: 20, bottom: 30, left: 50};
                let parseDate = d3.timeParse("%m/%Y");
                let svgWidth = Math.ceil(document
                                         .getElementById('revisions-svg')
                                         .getBoundingClientRect()
                                         .width);
                // let width = svgWidth - margin.left - margin.right;
                let width = svgWidth;
                let height = 500 - margin.top - margin.bottom;
                let xScale = d3.scaleLinear().rangeRound([0, width]);
                let yScale = d3.scaleBand().rangeRound([height, 0]).padding(0.1);
                let colorScale = d3.scaleOrdinal(d3.schemeCategory20);
                let xAxis = d3.axisBottom(xScale);
                let yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%b"));
                let svg = d3.select("#" + config.element)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

                let stack = d3.stack()
                    .keys(config.key)
                    // .order(d3.stackOrder)
                    .offset(d3.stackOffsetNone);

                let layers = stack(data);
                console.log("layers", layers);
                console.log("data", data);

                data.sort(function(a, b) { return b.total - a.total; });
                xScale.domain([
                    0,
                    d3.max(layers[layers.length - 1],    (d) => d[0] + d[1])
                ]).nice();
                yScale.domain(data.map(function(d) { return parseDate(d.date); }));

                let layer = svg.selectAll(".layer")
                    .data(layers)
                    .enter().append("g")
                      .attr("class", "layer")
                      .style("fill", function(d, i) { return colorScale(i); });

                layer.selectAll("rect")
                    .data(function(d) { return d; })
                    .enter().append("rect")
                    .attr("y", function(d) { return yScale(parseDate(d.data.date)); })
                    .attr("x", function(d) { return xScale(d[0]); })
                    .attr("height", yScale.bandwidth())
                    .attr("width", function(d) { return xScale(d[1]) - xScale(d[0]) });

                // svg.append("g")
                //     .attr("class", "axis axis--x")
                //     .attr("transform", "translate(0," + (height+5) + ")")
                //     .call(xAxis);

                svg.append("g")
                    .attr("class", "axis axis--y")
                    .attr("transform", "translate(0,0)")
                    .call(yAxis);
            }
        };

        let data = [
            {"date": "4/1854", "total": 8571, "disease":   1, "wounds":  0, "other":  5},
            {"date": "5/1854", "total":23333, "disease":  12, "wounds":  0, "other":  9},
            {"date": "6/1854", "total":28333, "disease":  11, "wounds":  0, "other":  6},
            {"date": "7/1854", "total":28772, "disease": 359, "wounds":  0, "other": 23},
            {"date": "8/1854", "total":30246, "disease": 828, "wounds":  1, "other": 30},
            {"date": "9/1854", "total":30290, "disease": 788, "wounds": 81, "other": 70},
            {"date":"10/1854", "total":30643, "disease": 503, "wounds":132, "other":128},
            {"date":"11/1854", "total":29736, "disease": 844, "wounds":287, "other":106},
            {"date":"12/1854", "total":32779, "disease":1725, "wounds":114, "other":131},
            {"date": "1/1855", "total":32393, "disease":2761, "wounds": 83, "other":324},
            {"date": "2/1855", "total":30919, "disease":2120, "wounds": 42, "other":361},
            {"date": "3/1855", "total":30107, "disease":1205, "wounds": 32, "other":172},
            {"date": "4/1855", "total":32252, "disease": 477, "wounds": 48, "other": 57},
            {"date": "5/1855", "total":35473, "disease": 508, "wounds": 49, "other": 37},
            {"date": "6/1855", "total":38863, "disease": 802, "wounds":209, "other": 31},
            {"date": "7/1855", "total":42647, "disease": 382, "wounds":134, "other": 33},
            {"date": "8/1855", "total":44614, "disease": 483, "wounds":164, "other": 25},
            {"date": "9/1855", "total":47751, "disease": 189, "wounds":276, "other": 20},
            {"date":"10/1855", "total":46852, "disease": 128, "wounds": 53, "other": 18},
            {"date":"11/1855", "total":37853, "disease": 178, "wounds": 33, "other": 32},
            {"date":"12/1855", "total":43217, "disease":  91, "wounds": 18, "other": 28},
            {"date": "1/1856", "total":44212, "disease":  42, "wounds":  2, "other": 48},
            {"date": "2/1856", "total":43485, "disease":  24, "wounds":  0, "other": 19},
            {"date": "3/1856", "total":46140, "disease":  15, "wounds":  0, "other": 35}
        ];
        let key = ["wounds", "other", "disease"];

        initStackedBarChart.draw({
            data: data,
            key: key,
            element: 'revisions-svg'
        });

        // const x = d3.scaleLinear().range([0, 430]);
        // const y = d3.scaleLinear().range([210, 0]);
        // d3.axisLeft().scale(x);
        // d3.axisTop().scale(y);
        // x.domain(d3.extent(data, (d, i) => i));
        // y.domain([0, d3.max(data, d => d)]);
        // const createPath = d3.line()
        //       .x((d, i) => x(i))
        //       .y(d => y(d));
        // svg.append('path').attr('d', createPath(data));
    },
};
</script>

<style>
  /* svg { */
  /*   margin: 25px; */
  /* } */
  /* svg path { */
  /*   fill: none; */
  /*   stroke: #76BF8A; */
  /*   stroke-width: 3px; */
  /* } */

  .axis text {
      font: 10px sans-serif;
  }
  .axis line,
  .axis path {
      fill: none;
      stroke: #000;
      shape-rendering: crispEdges;
  }
  .path-line {
      fill: none;
      stroke: yellow;
      stroke-width: 1.5px;
  }
  svg {
      background: #f0f0f0;
  }
</style>
