var d3 = require('d3');
var queue = require('queue-async');
var _ = require("underscore");
var colorbrewer = require("colorbrewer");

var margin = {top: 10, left: 10, bottom: 10, right: 10}
  , width = parseInt(d3.select('#world-map').style('width'))
  , width = width - margin.left - margin.right
  , mapRatio = 651/1008
  , height = width * mapRatio;

var segments = 5;

var svg = d3.select("#world-map").select("svg");

svg.attr('width', width).attr('height', height);

d3.select(window).on('resize', resize);

function resize() {
    // adjust things when the window size changes
    width = parseInt(d3.select('#world-map').style('width'));
    width = width - margin.left - margin.right;
    height = width * mapRatio;

    svg.attr('width', width).attr('height', height);
}

function updateMap(error, dataMap) {
    var scale = d3.scale.log().base(10);
    console.log(scale.domain());
    console.log(scale.range());
    var colors = scale.copy().range(colorbrewer.Purples[segments]);
    
    var legend = d3.select('#legend')
        .append('ul')
        .attr('class', 'list-inline');

    var keys = legend.selectAll('li.key').data(colors.range());
    keys.enter().append('li')
        .attr('class', 'key')
        .style('border-top-color', String)
        .text(function(d) {
            var r = colors.invert(d);
            return r[0];
        });

    var countries = svg.selectAll("path.land");

    // var quantize = scale
    //   .range(d3.range(segments).map(function(i) {
    //     return "q" + i + "-" + segments; }));

    var colorClass = function (i) {
        if (i === 0) {
            return "q0-" + segments;
        }
        return "q" + Math.min(segments - 1, Math.floor(scale(i))) + "-" + segments;
    }

    countries.attr("class", function () {
    if (dataMap.get(this.id) !== undefined) {
      return "land " + colorClass(dataMap.get(this.id));
    } else {
      return "land no-data";
    }});

    countries.attr("data-tb", function () { return dataMap.get(this.id) });
}

d3.csv("crude_evaluation_targets.csv", function (d) {
  return {id: d["Country code"], value: +d["Estimated MDR-TB cases"]}
}, function (error, data) {
    var dataMap = d3.map();
    _(data).each(function (d) {
      dataMap.set(d.id, d.value)
    });
    console.log(dataMap);
    updateMap(error, dataMap);
})
