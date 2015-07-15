/**
 * Created by Tomas on 14. 7. 2015.
 */
var startLatLng = L.latLng(50.07697, 14.43226);
var endLatLng = L.latLng(50.08744, 14.38728);

var startMarker = L.marker(startLatLng, {
    draggable:true,
    title: "Start"
}).addTo(map);
var endMarker = L.marker(endLatLng, {
    icon: L.icon({iconUrl: "marker-icon-red.png"}),
    draggable:true,
    title: "End"
}).addTo(map);

function onMarkerDrag(e) {
    //var marker = e.target;
    //marker.setLatLng(marker.getLatLng());
}

function swapMarkers() {
    var latLng = startMarker.getLatLng();
    startMarker.setLatLng(endMarker.getLatLng());
    endMarker.setLatLng(latLng);
}

startMarker.on('dragend', onMarkerDrag);
endMarker.on('dragend', onMarkerDrag);