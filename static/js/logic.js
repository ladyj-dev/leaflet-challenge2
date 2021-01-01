// define tile layers
var streetmap = L.tileLayer(
  "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
  {
    attribution:
      "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY,
  }
);

var satellite = L.tileLayer(
  "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
  {
    attribution:
      "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/satellite-v9",
    accessToken: API_KEY,
  }
);

var darkmap = L.tileLayer(
  "https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
  {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY,
  }
);

// create a generic map where id="mapid"
var myMap = L.map("mapid", {
  center: [37.7, 14],
  zoom: 3,
});

// add streetmap tile layer to the map
satellite.addTo(myMap);

// create layers for each dataset
var earthquakes = L.layerGroup();
var tectonic = L.layerGroup();

// create an object to hold our base layers
var basemaps = {
  "Street Map": streetmap,
  "Dark Map": darkmap,
  "Satellite Map": satellite,
};

// create an object to hold the layers for each dataset
var overlay = {
  "Tectonic Plates": tectonic,
  Earthquakes: earthquakes,
};

// add a control layer (so you can choose what was built)
L.control
  .layers(basemaps, overlay, {
    collapsed: false,
  })
  .addTo(myMap);

// grab tectonic plates geojson data from webpage https://github.com/fraxen/tectonicplates/blob/master/GeoJSON/PB2002_plates.json
var tectonicUrl =
  "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";
d3.json(tectonicUrl, function (plates) {
  // add data and style info to the tectonic plates layer
  L.geoJSON(plates, {
    color: "pink",
    weight: 5,
  })
    //   add to the tectonic plate layer(chaining)
    .addTo(tectonic);
  //   add tectonic plate layer to myMap
  tectonic.addTo(myMap);
});

// grab earthquake geojson https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_week.geojson
var earthquakeUrl =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_week.geojson";
d3.json(earthquakeUrl, function (data) {
  // add data and style info to earthquake layer
  // create circles to visualize each earthquake need radius(magnitude) and color(depth)
  function styleinfo(features) {
    //   grabbing info needed to style our marker
    return {
      radius: getradius(features.properties.mag),
      fillColor: getcolor(features.geometry.coordinates[2]),
      stroke: true,
      weight: 0.2,
      fillOpacity: 0.5,
      color: "black",
      opacity: 1,
    };
  }

  // create a function for the radius/magnitude
  function getradius(magnitude) {
    return magnitude * 4; //three is just a scaling factor to visualize difference in magnitude
  }

  // create a function for the color(depth)
  function getcolor(depth) {
    switch (true) {
      case depth > 90:
        return "#c51b7d";
      case depth > 70:
        return "#e9a3c9";
      case depth > 50:
        return "#fde0ef";
      case depth > 30:
        return "#e6f5d0";
      case depth > 10:
        return "#a1d76a";
      default:
        return "#4d9221";
    }
  }

  //   add geojson layer to the map (above is styling but no content)
  L.geoJSON(data, {
    //   create a circlemarker
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },
    style: styleinfo,

    // create popup (using d3 bindpopup)
    onEachFeature: function (feature, layer) {
      layer.bindPopup(
        "Location: " +
          feature.properties.place +
          //    add break tag to clean up popup
          "<br>Magnitude: " +
          feature.properties.mag +
          "<br>Depth(km): " +
          feature.geometry.coordinates[2]
      );
    },

    // add to layer created for earthquakes not to myMap
  }).addTo(earthquakes);
  earthquakes.addTo(myMap);

  // create a legend (object)
  var legend = L.control({
    position: "bottomright",
  });

  // add details to the legend
  legend.onAdd = function () {
    var div = L.DomUtil.create("div", "info legend"),
      grades = [0, 10, 30, 50, 70, 90];
    // var colors = [
    //     "#4d9221",
    //     "#a1d76a",
    //     "#e6f5d0",
    //     "#fde0ef",
    //     "#e9a3c9",
    //     "#c51b7d"
    // ];

    // loop through and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML += [
        "depth",
        '<i style="background:' +
          getcolor(grades[i] + 1) +
          '"></i> ' +
          grades[i] +
          // add km so user understands measurement and add space
          (grades[i + 1]
            ? "&ndash;" + grades[i + 1] + " km" + "<br>"
            : "+" + " km"),
      ];
    }

    return div;
  };

  legend.addTo(myMap);

  //   generate a legend for size
  var size_note = L.control({
    position: "bottomleft",
  });
  size_note.onAdd = function () {
    var div = L.DomUtil.create("div", "info legend");
    // add to html
    div.innerHTML +=
      "Size is a function of the magnitude, smaller circles are magnitude 1";
    return div;
  };
  size_note.addTo(myMap);
});
