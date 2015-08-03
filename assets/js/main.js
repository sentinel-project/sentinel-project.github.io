var d3 = require('d3');
require("d3-geo-projection")(d3);
var topojson = require('topojson');
var queue = require('queue-async');
var _ = require("underscore");

var width = 1200,
    height = 800;
//
// var projection = d3.geo.eckert4()
//     .scale(220)
//     .rotate([-10, 0])
//     .translate([width / 2, height / 2]);
// var path = d3.geo.path().projection(projection);
// var graticule = d3.geo.graticule();

// var svg = d3.select("#map").append("svg")
//     .attr("width", width)
//     .attr("height", height);
//
// svg.append("defs").append("path")
//     .datum({type: "Sphere"})
//     .attr("id", "sphere")
//     .attr("d", path);
//
// svg.append("use")
//     .attr("class", "stroke")
//     .attr("xlink:href", "#sphere");
//
// svg.append("use")
//     .attr("class", "fill")
//     .attr("xlink:href", "#sphere");
//
// svg.append("path")
//     .datum(graticule)
//     .attr("class", "graticule")
//     .attr("d", path);

var svg = d3.select("#world-map").select("svg")
    .attr("width", width)
    .attr("height", height);

function updateMap(error, dataMap) {
  var countries = svg.selectAll("path.land");
  console.log(countries);

  var quantize = d3.scale.quantize()
      .domain([0, _(dataMap.values()).max()])
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
