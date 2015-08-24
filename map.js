var LONGITUDE_SHIFT = 0.015;

var map;
var legend;
var lastClickedPosition = null;

$(document).ready(function () {
    var contextMenuItems = [{
        text: "Pøidat zaèátek",
        iconCls: "fa fa-map-marker start-icon",
        callback: function () {
            if (allMarkers[0].getLatLng() != null) {
                addNewStartPoint();
            }
            allMarkers[0].setLatLng(lastClickedPosition).addTo(map);
            findAddressFromCoordinates(0, lastClickedPosition);
            getPlans();
        }
    }, {
        text: "Pøidat destinaci",
        iconCls: "fa fa-map-marker destination-icon",
        callback: function () {
            if (allMarkers[allMarkers.length-1].getLatLng() != null) {
                onAddPointClick();
            }
            allMarkers[allMarkers.length-1].setLatLng(lastClickedPosition).addTo(map);
            findAddressFromCoordinates(allMarkers.length - 1, lastClickedPosition);
            getPlans();
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
        contextmenu: true,
        contextmenuItems: contextMenuItems
    }).setView([50.08165, 14.40505], 14);
    var zoomControl = L.control.zoom({position: "topright"});
    zoomControl.addTo(map);

    //var cycleMap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    //    maxZoom: 18,
    //    id: 'fiserto1.mlpdi4he',
    //    accessToken: 'pk.eyJ1IjoiZmlzZXJ0bzEiLCJhIjoiNmE1NzkzMjQ5ZjdhYTMxZDllNzhlNmQxNGMzZGIyMTAifQ.2xblvAvcBqHdhd3GnKNrbQ'
    //});
    //var baseMaps = {
    //    "Streets + cyklostezky": cycleMap,
    //    "Streets": streetsMap
    //};

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

    var myIcon = L.AwesomeMarkers.icon({
        prefix: 'fa', //font awesome rather than bootstrap
        markerColor: 'green',
        //spin: true,
        icon: 'bicycle' //http://fortawesome.github.io/Font-Awesome/icons/
    });
    var signLayer = L.geoJson(cycleSigns, {
        style: function () {
            return {
                icon: myIcon
            };
        },
        //filter: function(feature, layer) {
        //    return (feature.properties.DRUH == 302)
        //},
        onEachFeature: function (feature, layer) {
            layer.bindPopup(feature.properties.POPIS);
        }
    });

    var overlayMaps = {
        "Cyklostezky": cycleLayer,
        "Cykloznaèky": signLayer
    };

    L.control.locate({position: 'topright', keepCurrentZoomLevel: true}).addTo(map);
    L.control.layers(null, overlayMaps).addTo(map);

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
});


$(function () {
    map.on("contextmenu", function (e) {
        lastClickedPosition = e.latlng;
        return false;

    });
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
