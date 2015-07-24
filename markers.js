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


function onMapClick(e) {
    if (startMarker.getLatLng() == null) {
        startMarker.setLatLng(e.latlng).addTo(map);
        document.getElementById("searchStart").value = e.latlng;
        getPlans();

    } else if (endMarker.getLatLng() == null) {
        endMarker.setLatLng(e.latlng).addTo(map);
        document.getElementById("searchDestination").value = e.latlng;
        getPlans();
    }

}

function onMarkerDrag(e) {
    document.getElementById("searchStart").value = startMarker.getLatLng();
    document.getElementById("searchDestination").value = endMarker.getLatLng();
    getPlans();
    //var marker = e.target;
    //marker.setLatLng(marker.getLatLng());
}

function swapMarkers() {
    var latLng = startMarker.getLatLng();
    startMarker.setLatLng(endMarker.getLatLng());
    endMarker.setLatLng(latLng);
    swapSearchForm();
    getPlans();
}

function swapSearchForm() {
    var value = document.getElementById("searchStart").value;
    document.getElementById("searchStart").value = document.getElementById("searchDestination").value;
    document.getElementById("searchDestination").value = value;
}

document.getElementById("chDir").onclick = swapMarkers;

map.on("click", onMapClick);
startMarker.on('dragend', onMarkerDrag);
endMarker.on('dragend', onMarkerDrag);