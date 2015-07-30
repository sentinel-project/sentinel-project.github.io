window.d3 = require('d3');
window.topojson = require('topojson');
require('./d3-geomap/vendor/d3.geomap.dependencies.min');
require('./d3-geomap/js/d3.geomap');

var map = d3.geomap.choropleth()
    .geofile('countries.json')
    .colors(colorbrewer.YlGnBu[9])
    .column('Estimated MDR-TB cases')
    // .format(format)
    .legend(true)
    .unitId('Country code');

d3.csv('crude_evaluation_targets.csv', function(error, data) {
    d3.select('#map')
        .datum(data)
        .call(map.draw, map);
});
