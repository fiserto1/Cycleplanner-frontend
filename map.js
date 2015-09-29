
var map;
var lastClickedPosition = null;

function initializeMap() {
    var contextMenuItems = [{
        text: $.t("contextmenu.add-start"),
        iconCls: "fa fa-map-marker start-icon",
        callback: function() {
            addStartClick();
        }
    }, {
        text: $.t("contextmenu.add-destination"),
        iconCls: "fa fa-map-marker destination-icon",
        callback: function() {
            addDestinationClick()
        }
    }];

    var streetsMap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        maxZoom: 18,
        id: 'fiserto1.3ed94b1c',
        accessToken: 'pk.eyJ1IjoiZmlzZXJ0bzEiLCJhIjoiNmE1NzkzMjQ5ZjdhYTMxZDllNzhlNmQxNGMzZGIyMTAifQ.2xblvAvcBqHdhd3GnKNrbQ',
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery &copy; <a href="http://mapbox.com">Mapbox</a>'
    });
    map = L.map('map', {
        layers: streetsMap,
        zoomControl: false,
        contextmenu: true,
        contextmenuItems: contextMenuItems
    }).setView([50.08165, 14.40505], 14);

    map.on("contextmenu", function (e) {
        lastClickedPosition = e.latlng;
    });
    var zoomControl = L.control.zoom({position: "topright"});
    zoomControl.addTo(map);
    L.control.locate({position: 'topright', keepCurrentZoomLevel: true}).addTo(map);

    //asynchronous
    addControlLayers();

    var legend = L.control({position: 'bottomright'});
    legend.onAdd = function () {
        return document.getElementById("legend");
    };
    legend.addTo(map);

    setAC();
    initializeMarkers();
}

function addStartClick() {
    if (allMarkers[0].getLatLng() != null) {
        addNewStartPoint();
    }
    allMarkers[0].setLatLng(lastClickedPosition).addTo(map);
    findAddressFromCoordinates(0, lastClickedPosition);
    getPlans();
}

function addDestinationClick() {
    if (allMarkers[allMarkers.length-1].getLatLng() != null) {
        onAddPointClick();
    }
    allMarkers[allMarkers.length-1].setLatLng(lastClickedPosition).addTo(map);
    findAddressFromCoordinates(allMarkers.length - 1, lastClickedPosition);
    getPlans();
}

function addControlLayers() {
    $.getJSON("./json/DOP_Cyklotrasy_l.json", function(data) {
        var cycleLayer = L.geoJson(data, {
            style: function () {
                return {
                    color: "purple",
                    opacity: 0.5,
                    weight: 2,
                    dashArray: "5, 10"
                };
            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup(feature.properties.CISLO_TRAS);
            }
        });
        addRackLayerFromFile(cycleLayer);
    });
}

function addRackLayerFromFile(cycleLayer) {
    $.getJSON("./json/DOP_CykloZnacky_b.json", function(data) {
        var myIcon = L.divIcon({
            iconSize: [20, 20],
            iconAnchor: [10,10],
            className: "bike-stand",
            html: '<img src="img/bike_rack.png">'
        });
        var rackLayer = L.geoJson(data, {
            style: function () {
                return {
                    icon: myIcon
                };
            },
            filter: function(feature, layer) {
                return (feature.properties.DRUH == 101);
            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup(feature.properties.POPIS);
                layer.setZIndexOffset(-1000);
                layer.on("contextmenu", function() {
                    lastClickedPosition = layer.getLatLng();
                    map.contextmenu.showAt(layer.getLatLng());
                });
            },
            pointToLayer: function(feature, latlng) {
                return L.marker(latlng, {icon: myIcon});
            }
        });

        var overlayMaps = {};
        overlayMaps[$.t("control-layers.cycle-paths")] = cycleLayer;
        overlayMaps[$.t("control-layers.cycle-racks")] = rackLayer;

        L.control.layers(null, overlayMaps).addTo(map);
        addControlLayersTooltips();
    });
}

function addControlLayersTooltips() {
    var controlLocate = $(".leaflet-control-locate");
    var controlZoomIn = $(".leaflet-control-zoom-in");
    var controlZoomOut = $(".leaflet-control-zoom-out");
    controlLocate.attr("data-toggle", "tooltip");
    controlLocate.attr("data-placement", "bottom");
    controlLocate.attr("data-original-title", $.t("tooltip.locate"));
    controlZoomIn.attr("data-toggle", "tooltip");
    controlZoomIn.attr("data-placement", "bottom");
    controlZoomIn.attr("data-original-title", $.t("tooltip.zoom-in"));
    controlZoomOut.attr("data-toggle", "tooltip");
    controlZoomOut.attr("data-placement", "bottom");
    controlZoomOut.attr("data-original-title", $.t("tooltip.zoom-out"));
    $('[data-toggle="tooltip"]').tooltip();
}