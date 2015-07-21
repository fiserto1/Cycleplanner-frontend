/**
 * Created by Tomas on 14. 7. 2015.
 */
//var startLatLng = L.latLng(50.07697, 14.43226);
//var endLatLng = L.latLng(50.08744, 14.38728);

var startMarker = L.marker(null, {
    draggable:true,
    title: "Start"
});
var endMarker = L.marker(null, {
    icon: L.icon({iconUrl: "marker-icon-red.png"}),
    draggable:true,
    title: "End"
});

var mapClickCounter = 0;
function onMapClick(e) {
    if (mapClickCounter == 0) {
        startMarker.setLatLng(e.latlng).addTo(map);
        mapClickCounter++;
    } else if (mapClickCounter == 1) {
        endMarker.setLatLng(e.latlng).addTo(map);
        getPlans();
        mapClickCounter++;
    } else {

    }
}

function onMarkerDrag(e) {
    getPlans();
    //var marker = e.target;
    //marker.setLatLng(marker.getLatLng());
}

function swapMarkers() {
    var latLng = startMarker.getLatLng();
    startMarker.setLatLng(endMarker.getLatLng());
    endMarker.setLatLng(latLng);
    if (endMarker.getLatLng() != null && startMarker.getLatLng() != null) {
        getPlans();
    }
}
document.getElementById("chDir").onclick = swapMarkers;

map.on("click", onMapClick);
startMarker.on('dragend', onMarkerDrag);
endMarker.on('dragend', onMarkerDrag);