var d3 = require('d3');
var queue = require('queue-async');
var _ = require("underscore");
var colorbrewer = require("colorbrewer");

var margin = {top: 10, left: 10, bottom: 10, right: 10}
  , width = parseInt(d3.select('#world-map').style('width'))
  , width = width - margin.left - margin.right
  , mapRatio = 651/1008
  , height = width * mapRatio;

var quantiles = 9;

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
  var scale = d3.scale.quantize()
      .domain([0,
        Math.round(_(dataMap.values()).max() / quantiles) * quantiles]);

  var colors = scale.range(colorbrewer.Purples[quantiles]);
  var legend = d3.select('#legend')
    .append('ul')
    .attr('class', 'list-inline');

  var keys = legend.selectAll('li.key').data(colors.range());
  keys.enter().append('li')
      .attr('class', 'key')
      .style('border-top-color', String)
      .text(function(d) {
        var r = colors.invertExtent(d);
        return r[0];
      });

  var countries = svg.selectAll("path.land");

  var quantize = scale
      .range(d3.range(quantiles).map(function(i) {
        return "q" + i + "-" + quantiles; }));

  countries.attr("class", function () {
    if (dataMap.get(this.id) !== undefined) {
      return "land " + quantize(dataMap.get(this.id));
    } else {
      return "land no-data";
    }});
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
