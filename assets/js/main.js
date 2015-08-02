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

function drawMap(error, world) {
  if (error) throw error;
  console.log(world);

  svg.append("g")
    .attr("class", "countries")
    .selectAll("path")
    .data(topojson.feature(world, world.objects.countries).features)
    .enter().append("path")
    .attr("class", "country")
    .attr("data-country-id", function (d) { return d.id; })
    .attr("id", function (d) { return "country-" + d.id; })
    .attr("d", path);

  svg.insert("path", ".graticule")
      .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
      .attr("class", "boundary")
      .attr("d", path);
}

function updateMap(error, dataMap) {
  var countries = svg.selectAll("path.country");

  var quantize = d3.scale.quantize()
      .domain([0, _(dataMap.values()).max()])
      .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));

  countries.attr("class", function (d) { return "country " + quantize(dataMap.get(d.id)); });
}

function drawAndUpdateMap(error, world, data) {
  var dataMap = d3.map();
  _(data).each(function (d) {
    dataMap.set(d.id, d.value)
  });
  drawMap(error, world);
  updateMap(error, dataMap);
}

queue()
    .defer(d3.json, "world-50m.json")
    .defer(d3.csv, "crude_evaluation_targets.csv", function (d) {
      return {id: ccToNum[d["Country code"]], value: +d["Estimated MDR-TB cases"]}
    })
    .await(drawAndUpdateMap);
