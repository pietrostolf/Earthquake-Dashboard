var map = L.map('map', {
    center: [0, 0],
    zoom: 2
});

var earthquakes = [];

// Function to get the color based on depth
function getColor(depth) {
    return depth >= 90 ? "#FF0D0D" :
        depth < 90 && depth >= 70 ? "#FF4E11" :
            depth < 70 && depth >= 50 ? "#FF8E15" :
                depth < 50 && depth >= 30 ? "#FFB92E" :
                    depth < 30 && depth >= 10 ? "#ACB334" :
                        "#69B34C";
}

// Function to draw the circles
function drawCircle(point, latlng) {
    var mag = point.properties.mag;
    var depth = point.geometry.coordinates[2];
    var radius = mag * 20000; // Calculate the radius based on the magnitude

    // Adjust the radius based on the magnitude
    if (mag >= 5) {
        radius *= 2;
    } else if (mag >= 4) {
        radius *= 1.5;
    }

    var popupContent = "<b>" + point.properties.place + "</b><br>" +
        "Magnitude: " + mag + "<br>" +
        "Depth: " + depth + " km<br>" +
        "<a href='" + point.properties.url + "' target='_blank'>More details</a>";

    return L.circle(latlng, {
        fillOpacity: 0.5,
        color: getColor(depth),
        fillColor: getColor(depth),
        radius: radius
    }).bindPopup(popupContent);
}

// Use D3 to fetch and parse the earthquake data from the GeoJSON feed.
d3.json('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson').then(function (data) {
    earthquakes = data.features;

    // Create a marker for each earthquake.
    for (var i = 0; i < earthquakes.length; i++) {
        var earthquake = earthquakes[i];

        var marker = drawCircle(earthquake, [earthquake.geometry.coordinates[1], earthquake.geometry.coordinates[0]]);

        map.addLayer(marker);
    }

    // Create a legend that shows the relationship between depth and color.
    var legend = L.control({ position: 'bottomright' });
    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend');
        var grades = [-10, 10, 30, 50, 70, 90];

        // Add a title to the legend
        div.innerHTML = '<h4>Depth Color Scale:</h4>';

        // Loop through the depth intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
        return div;
    };

    legend.addTo(map);
}).catch(function (error) {
    console.error('Error:', error);
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
}).addTo(map);