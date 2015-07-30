var d3 = require('d3');
require("d3-geo-projection")(d3);
var topojson = require('topojson');
var queue = require('queue-async');
var isoc = require("isoc");
var _ = require("underscore");

var ccToNum = _(isoc).reduce(
    function (memo, d) { memo[d.alpha3] = +d.numeric; return memo },
    {}
  );

var width = 1200,
    height = 800;

var projection = d3.geo.eckert4()
    .scale(220)
    .rotate([-10, 0])
    .translate([width / 2, height / 2]);
var path = d3.geo.path().projection(projection);
var graticule = d3.geo.graticule();

var casesById = d3.map();

var quantize = d3.scale.quantize()
    .domain([0, 2000])
    .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));

var logize = d3.scale.log()
    .base(2)
    .nice()
    .range(d3.range(9).map(function (i) { return "log-" + i; }));

var svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);

svg.append("defs").append("path")
    .datum({type: "Sphere"})
    .attr("id", "sphere")
    .attr("d", path);

svg.append("use")
    .attr("class", "stroke")
    .attr("xlink:href", "#sphere");

svg.append("use")
    .attr("class", "fill")
    .attr("xlink:href", "#sphere");

svg.append("path")
    .datum(graticule)
    .attr("class", "graticule")
    .attr("d", path);



queue()
    .defer(d3.json, "world-50m.json")
    .defer(d3.csv, "crude_evaluation_targets.csv", function (d) {
      casesById.set(ccToNum[d["Country code"]], +d["Estimated MDR-TB cases"]);
    })
    .await(drawMap);

function drawMap(error, world) {
  if (error) throw error;

  console.log(world);

  svg.append("g")
    .attr("class", "countries")
    .selectAll("path")
    .data(topojson.feature(world, world.objects.countries).features)
    .enter().append("path")
    .attr("class", function(d) { return "country " + quantize(casesById.get(d.id)); })
    .attr("d", path);

  svg.insert("path", ".graticule")
      .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
      .attr("class", "boundary")
      .attr("d", path);

}

d3.select(self.frameElement).style("height", height + "px");
