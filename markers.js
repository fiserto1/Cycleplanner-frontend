/**
 * Created by Tomas on 14. 7. 2015.
 */
//var startLatLng = L.latLng(50.07697, 14.43226);
//var endLatLng = L.latLng(50.08744, 14.38728);
var MIDDLE_POINT_LIMIT = 3;

var startIcon, destinationIcon, middlePointIcon;
var startMarker, destinationMarker;
var allMarkers = [];

$(document).ready(function() {

    startIcon = L.AwesomeMarkers.icon({
        prefix: 'fa', //font awesome rather than bootstrap
        markerColor: 'blue',
        //spin: true,
        icon: 'bicycle' //http://fortawesome.github.io/Font-Awesome/icons/
    });
    destinationIcon = L.AwesomeMarkers.icon({
        prefix: 'fa', //font awesome rather than bootstrap
        markerColor: 'red',
        icon: 'bicycle' //http://fortawesome.github.io/Font-Awesome/icons/
    });

    middlePointIcon = L.AwesomeMarkers.icon({
        prefix: 'fa', //font awesome rather than bootstrap
        markerColor: 'orange',
        icon: 'bicycle' //http://fortawesome.github.io/Font-Awesome/icons/
    });
    startMarker = L.marker(null, {
        icon: startIcon,
        draggable: true
    });

    destinationMarker = L.marker(null, {
        icon: destinationIcon,
        draggable: true
    });
    allMarkers.push(startMarker);
    allMarkers.push(destinationMarker);




    $("#changeDirectionIcon").click(onChangeDirectionClick);
    $("#addPointIcon").click(onAddPointClick);
    $(".remove-point").click(onRemovePointClick);

    map.on('click', onMapClick);
    startMarker.on('dragend', onMarkerDrag);
    destinationMarker.on('dragend', onMarkerDrag);



    setShowCloseOnFocus($("input"));

});

function onMapClick(e) {
    $.ajax({
        url: "http://ec2-52-28-222-45.eu-central-1.compute.amazonaws.com:3100/reverse?lat=" + e.latlng.lat
        + "&lon=" + e.latlng.lng,
        success: setPoint,
        error: serverError
    });


//    if (startMarker.getLatLng() == null) {
//        startMarker.setLatLng(e.latlng).addTo(map);
//        $(".search-start").val(e.latlng);
//        getPlans();
//
//    } else if (destinationMarker.getLatLng() == null) {
//        destinationMarker.setLatLng(e.latlng).addTo(map);
//        $(".search-destination").val(e.latlng);
//        getPlans();
//    }
//
}

function setPoint(data) {
    //prohozene souradnice
    console.log(data.features[0].geometry.coordinates);
    console.log(data.features[0].properties.text);
}
//
//
function onMarkerDrag(e) {
    $(".search-start").val(startMarker.getLatLng());
    $(".search-destination").val(destinationMarker.getLatLng());
    getPlans();
    //var marker = e.target;
    //marker.setLatLng(marker.getLatLng());
}

function onChangeDirectionClick() {
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

////TODO spojit fce addNewStartPoint() a onAddPointClick()... jedna vklada pred druha za seznam
function addNewStartPoint() {

    if ($("#search-group").children().length < (MIDDLE_POINT_LIMIT + 2)) {

        $("#search-panel .start-icon").addClass("middle-point-icon");
        $("#search-panel .start-icon").removeClass("start-icon");
        $(".search-start").addClass("search-middle-point");
        $(".search-start").removeClass("search-start");
        var inputGroup = $("<div>").addClass("input-group");
        var markerAddon = $("<div>").addClass("input-group-addon drag-drop");
        var closeAddon = $("<div>").addClass("input-group-addon right-addon");
        var closeButton = $("<button type='button'>").addClass("close remove-point");
        closeButton.click(onRemovePointClick);
        $("<span>").html("&times").appendTo(closeButton);
        closeButton.appendTo(closeAddon);
        $("<i>").addClass("fa fa-map-marker start-icon").appendTo(markerAddon);
        //$("<i>").addClass("fa fa-times").appendTo(closeAddon);
        markerAddon.appendTo(inputGroup);
        var searchInput = $("<input type='search'>").addClass("form-control search-start whisper");
        setShowCloseOnFocus(searchInput);
        searchInput.appendTo(inputGroup);
        closeAddon.appendTo(inputGroup);
        inputGroup.prependTo($("#search-group"));

        setAC();

        if ($("#search-group").children().length == (MIDDLE_POINT_LIMIT + 2)) {
            $("#addPointIcon").addClass("disabled-icon");
        }
        if ($("#search-group").children().length > 2) {
            //$(".remove-point").css("color", "#333333");
        }

        startMarker.setIcon(middlePointIcon);

        var newMarker = L.marker(null, {
            icon: startIcon,
            draggable: true
        });
        newMarker.on('dragend', onMarkerDrag);
        allMarkers.unshift(newMarker);
        startMarker = newMarker;
    }
}

function onAddPointClick() {
    //if allMarkers.length < limit
    //console.log($("#search-group").children().length);
    if ($("#search-group").children().length < (MIDDLE_POINT_LIMIT + 2)) {

        $("#search-panel .destination-icon").addClass("middle-point-icon");
        $("#search-panel .destination-icon").removeClass("destination-icon");
        $(".search-destination").addClass("search-middle-point");
        $(".search-destination").removeClass("search-destination");
        var inputGroup = $("<div>").addClass("input-group");
        var markerAddon = $("<div>").addClass("input-group-addon drag-drop");
        var closeAddon = $("<div>").addClass("input-group-addon right-addon");
        var closeButton = $("<button type='button'>").addClass("close remove-point");
        closeButton.click(onRemovePointClick);
        $("<span>").html("&times").appendTo(closeButton);
        closeButton.appendTo(closeAddon);
        $("<i>").addClass("fa fa-map-marker destination-icon").appendTo(markerAddon);
        //$("<i>").addClass("fa fa-times").appendTo(closeAddon);
        markerAddon.appendTo(inputGroup);
        var searchInput = $("<input type='search'>").addClass("form-control search-destination whisper");
        setShowCloseOnFocus(searchInput);
        searchInput.appendTo(inputGroup);
        closeAddon.appendTo(inputGroup);
        inputGroup.appendTo($("#search-group"));

        setAC();

        if ($("#search-group").children().length == (MIDDLE_POINT_LIMIT + 2)) {
            $("#addPointIcon").addClass("disabled-icon");
        }
        if ($("#search-group").children().length > 2) {
            //$(".remove-point").css("color", "#333333");
        }

        destinationMarker.setIcon(middlePointIcon);

        var newMarker = L.marker(null, {
            icon: destinationIcon,
            draggable: true
        });
        newMarker.on('dragend', onMarkerDrag);
        allMarkers.push(newMarker);
        destinationMarker = newMarker;
    }


}

function onRemovePointClick() {
    var wholeInput = $(this).parent().parent();

    if ($("#search-group").children().length > 2) {
        //$(this).parent().parent().hide( "slide", { direction: "up" }, "slow" );
        map.removeLayer(allMarkers[wholeInput.index()]);
        allMarkers.splice(wholeInput.index(), 1);
        wholeInput.remove();

        startMarker = allMarkers[0];
        startMarker.setIcon(startIcon);
        destinationMarker = allMarkers[allMarkers.length - 1];
        destinationMarker.setIcon(destinationIcon);

        refreshSearchGroup();
        getPlans();


        if ($("#search-group").children().length < (MIDDLE_POINT_LIMIT + 2)) {
            $("#addPointIcon").removeClass("disabled-icon");
        }
        if ($("#search-group").children().length == 2) {
            //$(".remove-point").css("color", white);
        }
    } else {
        allMarkers[wholeInput.index()].setLatLng(null);
        map.removeLayer(allMarkers[wholeInput.index()]);
        wholeInput.val("");

    }
}

function refreshSearchGroup() {
    $(".form-control").removeClass("search-start search-destination search-middle-point");
    $("#search-panel .fa-map-marker").removeClass("start-icon destination-icon middle-point-icon");
    var allInputs = $("#search-group").children();
    for (var i = 0; i < allInputs.length; i++) {
        if (i == 0) {
            allInputs.eq(i).find("i").addClass("start-icon");
            allInputs.eq(i).find("input").addClass("search-start");
        } else if (i == (allInputs.length - 1)) {
            allInputs.eq(i).find("i").addClass("destination-icon");
            allInputs.eq(i).find("input").addClass("search-destination");
        } else {
            allInputs.eq(i).find("i").addClass("middle-point-icon");
            allInputs.eq(i).find("input").addClass("search-middle-point"); //zatim k nicemu nepouzivam
        }
    }
}
//
function assignMarkersToInputs() {

    var allInputs = $("#search-group").children();
    for (var i = 0; i < allInputs.length; i++) {
        var text = allInputs.eq(i).find("input").val();
        //if input is not empty {
        //
        //    allMarkers[i].setLatLng([50.07989, 14.39844]).addTo(map);
        //} else {
        //    map.removeLayer(allMarkers[i]);
        //}
    }
}
//
$(function () {
    $("#search-group").sortable({
        handle: ".drag-drop", update: function (event, ui) {
            refreshSearchGroup();
            //assignMarkersToInputs();
        }
    });
    //$("#search-group").disableSelection(); //// nefunguje ve firefoxu
});
//
//
function setShowCloseOnFocus(focusedElement) {
    focusedElement.focus(function () {
        $(this).next().children().addClass("focus-in");
    });
    focusedElement.blur(function () {
        //console.log($(this).next().children());
        $(this).next().children().removeClass("focus-in");
    });
}