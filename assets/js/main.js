var d3 = require('d3');
var queue = require('queue-async');
var _ = require("underscore");
var colorbrewer = require("colorbrewer");
var Backbone = require('backbone');

var margin = {top: 10, left: 10, bottom: 10, right: 10}
, width = parseInt(d3.select('#world-map').style('width'))
, width = width - margin.left - margin.right
, mapRatio = 651/1008
, height = width * mapRatio;

var colorscheme = "BuGn";

var dataMap;

// =======================
// Chart defs
// =======================

var charts = {
    "reported": {
        "title": "Reported MDR-TB & XDR-TB Cases",
        "ordinals": ["No Reported Cases", "Reported MDR-TB Case",
                     "Reported XDR-TB Case", "Reported MDR-TB & XDR-TB"]
    },
    "pub_mdr": {
        "title": "Publication Documenting MDR-TB Cases",
        "ordinals": ["No Publication",
                     "Publication with Adult MDR-TB",
                     "Publication with Child MDR-TB",
                     "Publication with Adult & Child MDR-TB"]
    },
    "pub_xdr": {
        "title": "Publication Documenting XDR-TB Cases",
        "ordinals": ["No Publication",
                     "Publication with Adult XDR-TB",
                     "Publication with Child XDR-TB",
                     "Publication with Adult & Child XDR-TB"]
    },
    "all_mdr": {
        "title": "All Data on MDR-TB",
        "ordinals": ["No Reported Cases",
                     "Reported Cases without Publication",
                     "Reported Cases with Publications for Adults",
                     "Reported Cases with Publications for Adults & Children"]
    },
    "all_xdr": {
        "title": "All Data on XDR-TB",
        "ordinals": ["No Reported Cases",
                     "Reported Cases without Publication",
                     "Reported Cases with Publications for Adults",
                     "Reported Cases with Publications for Adults & Children"]
    },
    "estimated": {
        "title": "Estimated MDR-TB Cases",
        "scale": "log",
        "segments": 5
    },
    "eval_0": {
        "title": "0-4 Year Olds: Needing Evaluation",
        "scale": "log",
        "segments": 5
    },
    "eval_5": {
        "title": "5-14 Year Olds: Needing Evaluation",
        "scale": "log",
        "segments": 5
    },
    "treat_0": {
        "title": "0-4 Year Olds: Needing Treatment",
        "scale": "log",
        "segments": 5
    },
    "treat_5": {
        "title": "5-14 Year Olds: Needing Treatment",
        "scale": "log",
        "segments": 5
    },
    "therapy_0": {
        "title": "0-4 Year Olds: Needing Preventative Therapy",
        "scale": "log",
        "segments": 5
    },
    "therapy_5": {
        "title": "5-14 Year Olds: Needing Preventative Therapy",
        "scale": "log",
        "segments": 5
    }
}

// =======================
// Load data from CSVs
// =======================
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
        console.log(data);
        dataMap = d3.map(data);
        init();
    });


function cleanEvalCSV(data) {
    var dataFields = {"Estimated MDR-TB cases": "estimated",
                      "0-4 year olds needing evaluation": "eval_0",
                      "5-14 year olds needing evaluation": "eval_5",
                      "0-4 year olds needing treatment": "treat_0",
                      "5-14 year olds needing treatment": "treat_5",
                      "0-4 year olds needing preventive therapy": "therapy_0",
                      "5-14 year olds needing preventive therapy": "therapy_5"}

    var d = {}
    _(dataFields).each(function (value, key) {
      d[value] = +data[key]
    });

    d["country"] = data["Country"]
    return {id: data["Country code"],
            data: d}
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

    d["reported"] = d["reported_mdr"] + 2 * d["reported_xdr"];
    d["pub_mdr"] = d["documented_adult_mdr"] + 2 * d["documented_child_mdr"];
    d["pub_xdr"] = d["documented_adult_mdr"] + 2 * d["documented_child_xdr"];

    if (d["documented_child_mdr"] === 1) {
        d["all_mdr"] = 3;
    } else if (d["documented_adult_mdr"] === 1) {
        d["all_mdr"] = 2;
    } else {
        d["all_mdr"] = d["reported_mdr"];
    }

    if (d["documented_child_xdr"] === 1) {
        d["all_xdr"] = 3;
    } else if (d["documented_adult_xdr"] === 1) {
        d["all_xdr"] = 2;
    } else {
        d["all_xdr"] = d["reported_xdr"];
    }

    return {id: data["Country code"],
            data: d}
}


// =============================================
// Set up map to display and resize correctly
// =============================================
var worldMap = d3.select("#world-map");
worldMap.attr('class', colorscheme);
var svg = worldMap.select("svg");
svg.attr('width', width).attr('height', height);
d3.select(window).on('resize', resize);


function resize() {
    // adjust things when the window size changes
    width = parseInt(d3.select('#world-map').style('width'));
    width = width - margin.left - margin.right;
    height = width * mapRatio;

    svg.attr('width', width).attr('height', height);
}


// =================
// Show initial map
// =================

function generateLogLegend(segments) {
    return ["0-9", "10-99", "100-999", "1,000-9,999", "10,000+"];
}

function updateMap(mapId) {
    var mapDef = charts[mapId];
    var svg = d3.select("#world-map").select("svg");
    var scale, segments, legendData, tooltipFn;

    if (mapDef.scale === "log") {
        scale = d3.scale.log();
        segments = mapDef.segments;
        var colors = colorbrewer[colorscheme][segments];
        legendData = _(colors).zip(generateLogLegend());
        tooltipFn = function () {
            var data = dataMap.get(this.id);
            if (data !== undefined) {
                return "<h4>" + data.country + "</h4><div>" + d3.format(",d")(data[mapId]) + "</div>";
            }
        }
    } else {
        segments = mapDef.ordinals.length;
        scale = d3.scale.linear();

        var colors = colorbrewer[colorscheme][segments];
        legendData = _(colors).zip(mapDef.ordinals);
        tooltipFn = function () {
            var data = dataMap.get(this.id);
            if (data !== undefined) {
                return "<h4>" + data.country + "</h4><div>" + mapDef.ordinals[data[mapId]] + "</div>";
            }
        }
    }

    d3.select("#map-title").text(mapDef.title);

    var legend = d3.select('#legend');
    legend.selectAll("ul").remove();
    var list = legend.append('ul').attr('class', 'list-inline');
    var keys = list.selectAll('li.key').data(legendData);
    keys.enter()
        .append('li')
        .attr('class', 'key')
        .style('border-left-color', function (d) { return d[0] })
        .text(function (d) {
            return d[1];
        });

    var countries = svg.selectAll("path.land");

    var colorClass = function (i) {
        if (i === 0) {
            return "q0-" + segments;
        }
        return "q" + Math.min(segments - 1, Math.floor(scale(i))) + "-" + segments;
    }

    countries
        .attr("class", function () {
            if (dataMap.get(this.id) !== undefined) {
                return "land " + colorClass(dataMap.get(this.id)[mapId]);
            } else {
                return "land no-data";
            }
        })
        .attr("data-toggle", "tooltip")
        .attr("data-placement", "top")
        .attr("data-original-title", tooltipFn);
}

function init() {
    console.log("hi")
    var MapRouter = Backbone.Router.extend({
        routes: {
            "map/:mapName": "showMap"
        },

        showMap: function (mapName) {
            updateMap(mapName);
        }
    });

    $('svg path.land').tooltip({container: "#world-map",
                                html: true,
                                placement: "auto top",
                                viewport: '#world-map'});

    var initialMap = "reported";
    updateMap(initialMap);

    var router = new MapRouter();
    Backbone.history.start();
}
