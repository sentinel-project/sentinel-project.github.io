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
var dataMap;

// Set up map to display and resize correctly
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


// Load data from CSVs
queue()
    .defer(d3.csv, "crude_evaluation_targets.csv", cleanEvalCSV)
    .defer(d3.csv, "tb_publications.csv", cleanPubCSV)
    .await(function (error, targets, pubs) {
        var data = {};
        targets.forEach(function (d) {
            data[d.id] = d.data;
        });
        pubs.forEach(function (d) {
            data[d.id] = _.extend(data[d.id], d.data);
        });
        dataMap = d3.map(data);
    });


function cleanEvalCSV(data) {
    var dataFields = ["Estimated MDR-TB cases",
                      "0-4 year olds needing evaluation",
                      "5-14 year olds needing evaluation",
                      "0-4 year olds needing treatment",
                      "5-14 year olds needing treatment",
                      "0-4 year olds needing preventive therapy",
                      "5-14 year olds needing preventive therapy"]

    var dataObj = {}
    dataFields.forEach(function (field) {
        dataObj[field] = +data[field]
    });
    dataObj["Country"] = data["Country"]
    return {id: data["Country code"],
            data: dataObj}
}


function cleanPubCSV(data) {
    var dataFields = {"Reported MDR TB case\n(0=no, 1=yes)": "reported_mdr",
                      "Reported XDR TB case\n(0=no, 1=yes)": "reported_xdr",
                      "Publication documenting adult MDR TB case\n(0=no, 1=yes)": "documented_adult_mdr",
                      "Publication documenting child MDR TB case\n(0=no, 1=yes)": "documented_child_mdr",
                      "Publication documenting adult XDR TB case\n(0=no, 1=yes)": "documented_adult_xdr",
                      "Publication documenting child XDR TB case\n(0=no, 1=yes)": "documented_child_xdr"};
    var d = {}
    _(dataFields).each(function (value, key) {
        d[value] = +data[key]
    });

    d["Reported Cases"] = d["reported_mdr"] + 2 * d["reported_xdr"];
    d["Publication Documenting MDR-TB Cases"] = d["documented_adult_mdr"] +
            2 * d["documented_child_mdr"];
    d["Publication Documenting XDR-TB Cases"] = d["documented_adult_mdr"] +
            2 * d["documented_child_xdr"];

    if (d["documented_child_mdr"] === 1) {
        d["All MDR-TB Data"] = 3;
    } else if (d["documented_adult_mdr"] === 1) {
        d["All MDR-TB Data"] = 2;
    } else {
        d["All MDR-TB Data"] = d["reported_mdr"];
    }

    if (d["documented_child_xdr"] === 1) {
        d["All XDR-TB Data"] = 3;
    } else if (d["documented_adult_xdr"] === 1) {
        d["All XDR-TB Data"] = 2;
    } else {
        d["All XDR-TB Data"] = d["reported_xdr"];
    }

    return {id: data["Country code"],
            data: d}
}


function updateMap(error, dataMap) {
    var scale = d3.scale.log().base(10);
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
