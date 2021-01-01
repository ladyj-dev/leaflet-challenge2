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
streetmap.addTo(myMap);

// create layers for each dataset
var earthquakes = L.layerGroup();
var tectonic = L.layerGroup();

// create an object to hold our base layers
var basemaps = {
  "Street Map": streetmap,
  "Dark Map": darkmap,
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
