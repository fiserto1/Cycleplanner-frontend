/**
 * Created by Tomas on 14. 7. 2015.
 */
//var startLatLng = L.latLng(50.07697, 14.43226);
//var endLatLng = L.latLng(50.08744, 14.38728);

var MIDDLE_POINT_LIMIT = 3;

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
var middlePointIcon = L.AwesomeMarkers.icon({
    prefix: 'fa', //font awesome rather than bootstrap
    markerColor: 'orange',
    icon: 'bicycle' //http://fortawesome.github.io/Font-Awesome/icons/
});

var startMarker = L.marker(null, {
    icon: startIcon,
    draggable:true
});
var destinationMarker = L.marker(null, {
    icon: destinationIcon,
    draggable:true
});

var allMarkers = [];
allMarkers.push(startMarker);
allMarkers.push(destinationMarker);

function onMapClick(e) {
    if (startMarker.getLatLng() == null) {
        startMarker.setLatLng(e.latlng).addTo(map);
        $(".search-start").val(e.latlng);
        getPlans();

    } else if (destinationMarker.getLatLng() == null) {
        destinationMarker.setLatLng(e.latlng).addTo(map);
        $(".search-destination").val(e.latlng);
        getPlans();
    }

}

function onMarkerDrag(e) {
    $(".search-start").val(startMarker.getLatLng());
    $(".search-destination").val(destinationMarker.getLatLng());
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
    var value = $(".search-start").val();
    $(".search-start").val($(".search-destination").val());
    $(".search-destination").val(value);
}


function addMiddlePoint() {
    //if allMarkers.length < limit
    //console.log($("#search-group").children().length);
    if ($("#search-group").children().length < (MIDDLE_POINT_LIMIT + 2)) {

        $(".destination-icon").addClass("middle-point-icon");
        $(".destination-icon").removeClass("destination-icon");
        $(".search-destination").addClass("search-middle-point");
        $(".search-destination").removeClass("search-destination");
        var inputGroup = $("<div>").addClass("input-group");
        var markerAddon = $("<div>").addClass("input-group-addon");
        var closeAddon = $("<div>").addClass("input-group-addon remove-point");
        closeAddon.click(onRemovePointClick);
        $("<i>").addClass("fa fa-map-marker destination-icon").appendTo(markerAddon);
        $("<i>").addClass("fa fa-times").appendTo(closeAddon);
        markerAddon.appendTo(inputGroup);
        $("<input type='search'>").addClass("form-control search-destination whisper").appendTo(inputGroup);
        closeAddon.appendTo(inputGroup);
        inputGroup.appendTo($("#search-group"));

        //
        // AUTOCOMPLETE.js COPY
        // musim volat funkce misto pridavat tridu whisper !!!!
        //
        $(".whisper").autocomplete( {
            lookup: availableTags,
            onSelect: function(suggestion) {
                console.log($(this).parent().index());
                var markerIndex = $(this).parent().index();
                allMarkers[markerIndex].setLatLng(suggestion.data).addTo(map);
                getPlans();
            }
        });
        //
        //END OF COPY
        //

        if ($("#search-group").children().length == (MIDDLE_POINT_LIMIT + 2)) {
            $("#addPointIcon").addClass("disabled-icon");
        }

        destinationMarker.setIcon(middlePointIcon);

        var newMarker = L.marker(null, {
            icon: destinationIcon,
            draggable:true
        });
        newMarker.on('dragend', onMarkerDrag);
        allMarkers.push(newMarker);
        destinationMarker = newMarker;
    }


}
function onRemovePointClick() {
    if ($("#search-group").children().length > 2) {

        $(".destination-icon").removeClass("destination-icon");
        $(".start-icon").removeClass("start-icon");
        $(".search-destination").removeClass("search-destination");
        $(".search-start").removeClass("search-start");

        //TODO jeste pohrat s middle-point classama


        var index = $(this).parent().index();
        $(this).parent().remove();
        map.removeLayer(allMarkers[index]);
        allMarkers.splice(index, 1);

        startMarker = allMarkers[0];
        startMarker.setIcon(startIcon);
        destinationMarker = allMarkers[allMarkers.length-1];
        destinationMarker.setIcon(destinationIcon);

        $(".destination-icon").removeClass("destination-icon");
        $(".start-icon").removeClass("start-icon");
        $(".search-destination").removeClass("search-destination");
        $(".search-start").removeClass("search-start");
        var lastIndex = $("#search-group").children().length-1;
        $("#search-group").children().eq(0).children().eq(0).children().eq(0).addClass("start-icon");
        $("#search-group").children().eq(lastIndex).children().eq(0).children().eq(0).addClass("destination-icon");
        $("#search-group").children().eq(0).children().eq(1).addClass("search-start");
        $("#search-group").children().eq(lastIndex).children().eq(1).addClass("search-destination");
        $(".start-icon").removeClass("middle-point-icon");
        getPlans();
        //udelat refresh do funkce/i aby se dalo pouzit i pro drag & drop
        //TODO refreshInputs();
        //TODO refreshMarkers();

        if ($("#search-group").children().length < (MIDDLE_POINT_LIMIT + 2)) {
            $("#addPointIcon").removeClass("disabled-icon");
        }
    }
}


document.getElementById("changeDirectionIcon").onclick = swapMarkers;
document.getElementById("addPointIcon").onclick = addMiddlePoint;
document.getElementById("addPointIcon").onclick = addMiddlePoint;

map.on("click", onMapClick);
startMarker.on('dragend', onMarkerDrag);
destinationMarker.on('dragend', onMarkerDrag);
$(".remove-point").click(onRemovePointClick);
