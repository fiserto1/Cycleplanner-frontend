var map = L.map('map', {zoomControl: false}).setView([50.08165, 14.40505], 14);

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

L.control.layers(baseMaps, overlayMaps).addTo(map);


var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = document.getElementById("legend");

    div.style.display = "block";
    return div;
};

function changeLegend(segChoice) {
    var div = document.getElementById("legend");


    switch (segChoice) {
        case ELEVATION_SEGMENTS:
            div.innerHTML = "<strong>Pøevýšení trasy</strong>" +
                "<nav class='legend clearfix'>" +
                "        <span style='background:#FF0000;'></span>" +
                "        <span style='background:#FF5D54;'></span>" +
                "        <span style='background:#FFC000;'></span>" +
                "        <span style='background:#90BB00;'></span>" +
                "        <span style='background:#15B0FF;'></span>" +
                "        <span style='background:#0080FF;'></span>" +
                "        <span style='background:#0040FF;'></span>" +
                "        <label>Stoupání</label>" + //>10m
                "    <label></label>" +             //8 az 10m
                "    <label></label>" +             //5 az 7m
                "    <label>Rovina</label>" +       //4 az -4m
                "    <label></label>" +             //-5 az -7m
                "    <label></label>" +             //-8 az -10m
                "    <label>Klesání</label>" +      //<-10m
                "    </nav>";
            break;
        case SPEED_SEGMENTS:
            div.innerHTML = "<strong>Rychlost trasy</strong>" +
                "<nav class='legend clearfix'>" +
                "        <span style='background:#FF0000;'></span>" +
                "        <span style='background:#FF5D54;'></span>" +
                "        <span style='background:#FFC000;'></span>" +
                "        <span style='background:#90BB00;'></span>" +
                "        <span style='background:#15B0FF;'></span>" +
                "        <span style='background:#0080FF;'></span>" +
                "        <span style='background:#0040FF;'></span>" +
                "        <label><5km/h</label>" +
                "    <label>5-9km/h</label>" +
                "    <label>10-14km/h</label>" +
                "    <label>15-19km/h</label>" +
                "    <label>20-24km/h</label>" +
                "    <label>25-30km/h</label>" +
                "    <label>>30km/h</label>" +
                "    </nav>";
            break;
    }

}
//legend.addTo(map);
var lastClickedPosition = null;
$(function() {
    //TODO zaridit aby se kontextove menu u kraje zobrazilo na spravnou stranu
    var $contextMenu = $("#contextMenu");
    map.on("click", function() {$contextMenu.hide();})
    map.on("contextmenu", function(e) {
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
        $contextMenu.hide();

        if (destinationMarker.getLatLng() != null) {
            onAddPointClick();
        }
        destinationMarker.setLatLng(lastClickedPosition).addTo(map);
        $(".search-destination").val(lastClickedPosition);
        getPlans();
    });

    $contextMenu.on("click", "#add-start-item", function() {
        $contextMenu.hide();

        if (startMarker.getLatLng() != null) {
            addNewStartPoint();
        }
        startMarker.setLatLng(lastClickedPosition).addTo(map);
        $(".search-start").val(lastClickedPosition);
        getPlans();
    });

});
