/**
 * Created by Tomas on 14. 7. 2015.
 */
//var startLatLng = L.latLng(50.07697, 14.43226);
//var endLatLng = L.latLng(50.08744, 14.38728);

var startIcon = L.AwesomeMarkers.icon({
    prefix: 'fa', //font awesome rather than bootstrap
    markerColor: 'blue',
    //spin: true,
    icon: 'bicycle' //http://fortawesome.github.io/Font-Awesome/icons/
});
var destinationIcon = L.AwesomeMarkers.icon({
    prefix: 'fa', //font awesome rather than bootstrap
    markerColor: 'red',
    icon: 'bicycle' //http://fortawesome.github.io/Font-Awesome/icons/
});

var startMarker = L.marker(null, {
    icon: startIcon,
    draggable:true,
    title: "Start"
});
var destinationMarker = L.marker(null, {
    icon: destinationIcon,
    draggable:true,
    title: "Destination"
});


function onMapClick(e) {
    if (startMarker.getLatLng() == null) {
        startMarker.setLatLng(e.latlng).addTo(map);
        document.getElementById("searchStart").value = e.latlng;
        getPlans();

    } else if (destinationMarker.getLatLng() == null) {
        destinationMarker.setLatLng(e.latlng).addTo(map);
        document.getElementById("searchDestination").value = e.latlng;
        getPlans();
    }

}

function onMarkerDrag(e) {
    document.getElementById("searchStart").value = startMarker.getLatLng();
    document.getElementById("searchDestination").value = destinationMarker.getLatLng();
    getPlans();
    //var marker = e.target;
    //marker.setLatLng(marker.getLatLng());
}

function swapMarkers() {
    var latLng = startMarker.getLatLng();
    startMarker.setLatLng(destinationMarker.getLatLng());
    destinationMarker.setLatLng(latLng);
    swapSearchForm();
    getPlans();
}

function swapSearchForm() {
    var value = document.getElementById("searchStart").value;
    document.getElementById("searchStart").value = document.getElementById("searchDestination").value;
    document.getElementById("searchDestination").value = value;
}


function addPoint() {
    var inputGroup = $("<div>").addClass("input-group");
    var markerAddon = $("<div>").addClass("input-group-addon");
    var closeAddon = $("<div>").addClass("input-group-addon");
    closeAddon.click(function() {
        $(this).parent().remove();
    });
    $("<i>").addClass("fa fa-map-marker middle-point-icon").appendTo(markerAddon);
    $("<i>").addClass("fa fa-times").appendTo(closeAddon);
    markerAddon.appendTo(inputGroup);
    $("<input type='text'>").addClass("form-control whisper").appendTo(inputGroup);
    closeAddon.appendTo(inputGroup);
    inputGroup.insertBefore($("#destination-input"));
}

document.getElementById("changeDirectionIcon").onclick = swapMarkers;
document.getElementById("addPointIcon").onclick = addPoint;

map.on("click", onMapClick);
startMarker.on('dragend', onMarkerDrag);
destinationMarker.on('dragend', onMarkerDrag);