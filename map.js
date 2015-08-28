var LONGITUDE_SHIFT = 0.015;

var map;
var legend;
var lastClickedPosition = null;

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

function initializeMap() {

    //var addStart = $.t("contextmenu.add-start");
    //console.log(addStart);
    //console.log("raz");
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
        accessToken: 'pk.eyJ1IjoiZmlzZXJ0bzEiLCJhIjoiNmE1NzkzMjQ5ZjdhYTMxZDllNzhlNmQxNGMzZGIyMTAifQ.2xblvAvcBqHdhd3GnKNrbQ'
    });

    map = L.map('map', {
        layers: streetsMap,
        zoomControl: false,
        attributionControl: false,
        contextmenu: true,
        contextmenuItems: contextMenuItems
    }).setView([50.08165, 14.40505], 14);
    map.on("contextmenu", function (e) {
        lastClickedPosition = e.latlng;
        return false;

    });
    var hash = L.hash(map);
    var zoomControl = L.control.zoom({position: "topright"});
    zoomControl.addTo(map);

    //asynchronous
    addControlLayers();

    legend = L.control({position: 'bottomright'});
    legend.onAdd = function (map) {
        return document.getElementById("legend");
    };

    $("#legend").hover(function () {
        map.dragging.disable();
        map.doubleClickZoom.disable();
        map.touchZoom.disable();
        map.off("click");//nejlepe ho zase zapnout, takto
        //TODO vypnout context menu map.off("contextmenu");
    }, function () {
        map.dragging.enable();
        map.doubleClickZoom.enable();
        map.touchZoom.enable();
        //TODO zapnout context menu
    });
    legend.addTo(map);

    setAC();
    initializeMarkers();
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
        getRackLayerFromFile(cycleLayer);
    });
}

function getRackLayerFromFile(cycleLayer) {
    $.getJSON("./json/DOP_CykloZnacky_b.json", function(data) {
        //var myIcon = L.AwesomeMarkers.icon({
        //    prefix: 'fa', //font awesome rather than bootstrap
        //    markerColor: 'green',
        //    extraClasses: 'rack-marker',
        //    //spin: true,
        //    icon: 'my' //http://fortawesome.github.io/Font-Awesome/icons/
        //});
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
            },
            pointToLayer: function(feature, latlng) {
                return L.marker(latlng, {icon: myIcon});
            }
        });

        var overlayMaps = {};
        overlayMaps[$.t("control-layers.cycle-paths")] = cycleLayer;
        overlayMaps[$.t("control-layers.cycle-racks")] = rackLayer;

        L.control.locate({position: 'topright', keepCurrentZoomLevel: true}).addTo(map);
        L.control.layers(null, overlayMaps).addTo(map);
    });
}

$(function () {

});

function findAddressFromCoordinates(inputIndex, latlng) {
    $.ajax({
        url: "http://ec2-52-28-222-45.eu-central-1.compute.amazonaws.com:3100/reverse?lat=" + latlng.lat
        + "&lon=" + latlng.lng,
        success: function (data) {
            console.log(data.features[0].properties.text);
            var lastClickedAddress = data.features[0].properties.text;
            $("#search-group").children().eq(inputIndex).find("input").val(lastClickedAddress);
        },
        error: function () {
            $("#search-group").children().eq(inputIndex).find("input").val(latlng);
        }
    });
}
