var d3 = require('d3');
var queue = require('queue-async');
var _ = require("underscore");
var colorbrewer = require("colorbrewer");

var width = 1200,
    height = 800;

var svg = d3.select("#world-map").select("svg")
    .attr("width", width)
    .attr("height", height);

function updateMap(error, dataMap) {
  var scale = d3.scale.quantize()
      .domain([0, Math.round(_(dataMap.values()).max() / 9) * 9]);

  var colors = scale.range(colorbrewer.BuGn[9]);
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
      .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));

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
