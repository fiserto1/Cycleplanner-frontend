var map;
var legend;
var LONGITUDE_SHIFT = 0.015;
$(document).ready(function() {



map = L.map('map', {zoomControl: false,
    contextmenu: true,
    contextmenuItems: [{
        text: "Pøidat zaèátek",
        iconCls: "fa fa-map-marker start-icon",
        callback : function(){
            if (startMarker.getLatLng() != null) {
                addNewStartPoint();
            }
            startMarker.setLatLng(lastClickedPosition).addTo(map);
            findAddressFromCoordinates(0, lastClickedPosition);
            getPlans();
        }
    }, {
        text: "Pøidat destinaci",
        iconCls: "fa fa-map-marker destination-icon",
        callback : function(){
            if (destinationMarker.getLatLng() != null) {
                onAddPointClick();
            }
            destinationMarker.setLatLng(lastClickedPosition).addTo(map);
            findAddressFromCoordinates(allMarkers.length-1, lastClickedPosition);
            getPlans();
        }
    }]
}).setView([50.08165, 14.40505], 14);

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
console.log(cycleSigns.features[0].properties.POPIS)
var signLayer = L.geoJson(cycleSigns, {
    style: function () {
        return {
            color: "purple"
        };
    },
    //filter: function(feature, layer) {
    //    return (feature.properties.DRUH == 302)
    //},
    onEachFeature: function (feature, layer) {
        console.log(feature.properties.POPIS);
        layer.bindPopup(feature.properties.POPIS);
    }
});


var overlayMaps = {
    "Cyklostezky": cycleLayer,
    "Cykloznaèky": signLayer
};

L.control.locate({ position: 'topright', keepCurrentZoomLevel: true }).addTo(map);
L.control.layers(baseMaps, overlayMaps).addTo(map);

legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {
    return document.getElementById("legend");
};

    $("#legend").hover(function() {
        map.dragging.disable();
        map.doubleClickZoom.disable();
        map.touchZoom.disable();
        map.off("click");
        //TODO vypnout context menu map.off("contextmenu");
    }, function() {
        map.dragging.enable();
        map.doubleClickZoom.enable();
        map.touchZoom.enable();
        //TODO zapnout context menu
    });
    legend.addTo(map);
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
    map.on("contextmenu", function(e) {
        lastClickedPosition = e.latlng;
        return false;

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
