var map;
var legend;
var LONGITUDE_SHIFT = 0.015;
$(document).ready(function() {



map = L.map('map', {zoomControl: false}).setView([50.08165, 14.40505], 14);

var zoomControl = L.control.zoom({position:"topright"});
zoomControl.addTo(map);

var cycleMap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    maxZoom: 18,
    id: 'fiserto1.mlpdi4he',
    accessToken: 'pk.eyJ1IjoiZmlzZXJ0bzEiLCJhIjoiNmE1NzkzMjQ5ZjdhYTMxZDllNzhlNmQxNGMzZGIyMTAifQ.2xblvAvcBqHdhd3GnKNrbQ'
});

var streetsMap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    maxZoom: 18,
    id: 'fiserto1.3ed94b1c',
    accessToken: 'pk.eyJ1IjoiZmlzZXJ0bzEiLCJhIjoiNmE1NzkzMjQ5ZjdhYTMxZDllNzhlNmQxNGMzZGIyMTAifQ.2xblvAvcBqHdhd3GnKNrbQ'
}).addTo(map);

var baseMaps = {
    "Streets + cyklostezky": cycleMap,
    "Streets": streetsMap
};

var cycleLayer = L.geoJson(cycleRoutes, {
    style: function () {
        return {
            color: "purple",
            opacity: 0.5,
            weight: 2,
            dashArray: "5, 10"
        };
    },
    onEachFeature: function (feature, layer) {
        layer.bindPopup(feature.properties.description);
    }
});
var overlayMaps = {
    "Cyklostezky": cycleLayer
};

L.control.locate({ position: 'topright', keepCurrentZoomLevel: true }).addTo(map);
L.control.layers(baseMaps, overlayMaps).addTo(map);

legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = document.getElementById("legend");

    div.style.display = "block";
    return div;
};
});
//function changeLegend(segChoice) {
//
//    switch (segChoice) {
//        case ELEVATION_SEGMENTS:
//            $("#legend-title").text("Pøevýšení trasy");
//            $("#legend-left-label").text("Stoupání");
//            $("#legend-middle-label").text("Rovina");
//            $("#legend-right-label").text("Klesání");
//            break;
//        case SPEED_SEGMENTS:
//            $("#legend-title").text("Rychlost trasy");
//            $("#legend-left-label").text("Pomalá");
//            $("#legend-middle-label").text("Støední");
//            $("#legend-right-label").text("Rychlá");
//            break;
//        case ROAD_TYPE_SEGMENTS:
//            $("#legend-title").text("Typ cesty");
//            $("#legend-left-label").text("PAVED_COBBLESTONE");
//            $("#legend-middle-label").text("");
//            $("#legend-right-label").text("PAVED_SMOOTH");
//            break;
//    }
//
//}
var lastClickedPosition = null;
$(function() {
    //TODO zaridit aby se kontextove menu u kraje zobrazilo na spravnou stranu
    var $contextMenu = $("#contextMenu");


    map.on("contextmenu", function(e) {
        map.off("click");
        map.on("click", function() {$contextMenu.hide();});
        $contextMenu.css({
            display: "block",
            left: e.containerPoint.x,
            top: e.containerPoint.y
        });
        lastClickedPosition = e.latlng;
        return false;

    });
    //$(".dropdown-menu li").click( {param1: clickLatLng}, onDropdownItemClick);

    $contextMenu.on("click", "#add-destination-item", function() {
        //$contextMenu.hide();
        if (destinationMarker.getLatLng() != null) {
            onAddPointClick();
        }
        destinationMarker.setLatLng(lastClickedPosition).addTo(map);
        findAddressFromCoordinates(allMarkers.length-1, lastClickedPosition);
        getPlans();
    });

    $contextMenu.on("click", "#add-start-item", function() {
        //$contextMenu.hide();
        if (startMarker.getLatLng() != null) {
            addNewStartPoint();
        }
        startMarker.setLatLng(lastClickedPosition).addTo(map);
        findAddressFromCoordinates(0, lastClickedPosition);
        getPlans();
    });

});

function findAddressFromCoordinates(inputIndex, latlng) {
    $.ajax({
        url: "http://ec2-52-28-222-45.eu-central-1.compute.amazonaws.com:3100/reverse?lat=" + latlng.lat
        + "&lon=" + latlng.lng,
        success: function(data) {
            console.log(data.features[0].properties.text);
            var lastClickedAddress = data.features[0].properties.text;
            $("#search-group").children().eq(inputIndex).find("input").val(lastClickedAddress);
        },
        error: function() {
            $("#search-group").children().eq(inputIndex).find("input").val(latlng);
        }
    });
}
