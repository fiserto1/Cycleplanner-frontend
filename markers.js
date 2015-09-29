/*
To enable middle points
    1) set MIDDLE_POINT_LIMIT
    2) uncomment "$("#add-point-icon").click(onAddPointClick);"
    3) remove class "disabled-icon" for element "#add-point-icon" in index.html
 */

var MIDDLE_POINT_LIMIT = 0;

var START_MARKER_ICON = L.AwesomeMarkers.icon({
    prefix: 'fa', //font awesome
    markerColor: 'blue',
    icon: 'bicycle'
});
var DESTINATION_MARKER_ICON = L.AwesomeMarkers.icon({
    prefix: 'fa', //font awesome
    markerColor: 'red',
    icon: 'bicycle'
});
var MIDDLE_POINT_MARKER_ICON = L.AwesomeMarkers.icon({
    prefix: 'fa', //font awesome
    markerColor: 'orange',
    icon: 'bicycle'
});

var allMarkers = [];
var dragIndex;

function initializeMarkers() {

    var startMarker = L.marker(null, {
        icon: START_MARKER_ICON,
        draggable: true
    });

    var destinationMarker = L.marker(null, {
        icon: DESTINATION_MARKER_ICON,
        draggable: true
    });
    allMarkers.push(startMarker);
    allMarkers.push(destinationMarker);

    //$("#add-point-icon").click(addNewDestinationPoint);
    $("#change-direction-icon").click(onChangeDirectionClick);
    $(".remove-point").click(onRemovePointClick);

    map.on('moveend', changeParams);
    startMarker.on('dragend', onMarkerDrag);
    destinationMarker.on('dragend', onMarkerDrag);

    setShowCloseOnFocus($("input"));

    $("#search-group").sortable({
        handle: ".drag-drop",
        update: function (event, ui) {
            refreshSearchGroup();
            var dropIndex = ui.item.index();
            var markerToMove = allMarkers[dragIndex];
            allMarkers.splice(dragIndex, 1);
            allMarkers.splice(dropIndex, 0, markerToMove);
            allMarkers[0].setIcon(START_MARKER_ICON);
            allMarkers[allMarkers.length-1].setIcon(DESTINATION_MARKER_ICON);
            for(var i = 1; i<allMarkers.length-1; i++) {
                allMarkers[i].setIcon(MIDDLE_POINT_MARKER_ICON);
            }
            getPlans();
        },
        start: function (event, ui) {
            dragIndex = ui.item.index();
        }
    });

    initializeSegments();
}

function onMapClick(e, input) {
    var latLon = e.latlng;
    var $input = $(input.target);
    var inputIndex = $input.parent().index();

    allMarkers[inputIndex].setLatLng(latLon).addTo(map);
    findAddressFromCoordinates(inputIndex, latLon);
    map.off("click");
    getPlans();
}

function onMarkerDrag(e) {
    var markerIndex = allMarkers.indexOf(e.target);
    findAddressFromCoordinates(markerIndex, e.target.getLatLng());
    getPlans();
}

function onChangeDirectionClick() {
    allMarkers.reverse();
    allMarkers[0].setIcon(START_MARKER_ICON);
    var destinationIndex = allMarkers.length-1;
    allMarkers[destinationIndex].setIcon(DESTINATION_MARKER_ICON);
    for(var i = 1; i < destinationIndex; i++) {
        allMarkers[i].setIcon(MIDDLE_POINT_MARKER_ICON);
    }
    reverseSearchForm();
    getPlans();
}

function reverseSearchForm() {
    var fromTopIndex = 0;
    var fromBottomIndex = allMarkers.length-1;
    var limit = Math.floor(allMarkers.length/2);
    var allForms = $("#search-group").children();
    while (limit > fromTopIndex) {
        var fromTopInput = allForms.eq(fromTopIndex).find("input");
        var fromBottomInput = allForms.eq(fromBottomIndex).find("input");
        var value = fromBottomInput.val();
        fromBottomInput.val(fromTopInput.val());
        fromTopInput.val(value);
        fromTopIndex++;
        fromBottomIndex--;
    }
}

function addNewStartPoint() {
    var searchGroup = $("#search-group");
    if (searchGroup.children().length < (MIDDLE_POINT_LIMIT + 2)) {

        searchGroup.find(".start-icon").addClass("middle-point-icon");
        searchGroup.find(".start-icon").removeClass("start-icon");
        var startInput = $(".search-start");
        startInput.addClass("search-middle-point");
        startInput.removeClass("search-start");

        var inputGroup = $("<div>").addClass("input-group");
        var markerAddon = $("<div>").addClass("input-group-addon drag-drop");
        var closeAddon = $("<div>").addClass("input-group-addon right-addon");
        var closeButton = $("<button type='button' tabindex='-1'>").addClass("close remove-point");
        closeButton.click(onRemovePointClick);
        $("<span>").html("&times").appendTo(closeButton);
        closeButton.appendTo(closeAddon);
        $("<i>").addClass("fa fa-map-marker start-icon").appendTo(markerAddon);
        markerAddon.appendTo(inputGroup);
        var searchInput = $("<input type='search'>").addClass("form-control search-start whisper");
        setShowCloseOnFocus(searchInput);
        searchInput.appendTo(inputGroup);
        closeAddon.appendTo(inputGroup);
        inputGroup.prependTo(searchGroup);

        setAC();

        if (searchGroup.children().length == (MIDDLE_POINT_LIMIT + 2)) {
            $("#add-point-icon").addClass("disabled-icon");
        }

        allMarkers[0].setIcon(MIDDLE_POINT_MARKER_ICON);

        var newMarker = L.marker(null, {
            icon: START_MARKER_ICON,
            draggable: true
        });
        newMarker.on('dragend', onMarkerDrag);
        allMarkers.unshift(newMarker);
    }
}

function addNewDestinationPoint() {
    var searchGroup = $("#search-group");
    if (searchGroup.children().length < (MIDDLE_POINT_LIMIT + 2)) {

        searchGroup.find(".destination-icon").addClass("middle-point-icon");
        searchGroup.find(".destination-icon").removeClass("destination-icon");
        var destinationInput = $(".search-destination");
        destinationInput.addClass("search-middle-point");
        destinationInput.removeClass("search-destination");

        var inputGroup = $("<div>").addClass("input-group");
        var markerAddon = $("<div>").addClass("input-group-addon drag-drop");
        var closeAddon = $("<div>").addClass("input-group-addon right-addon");
        var closeButton = $("<button type='button'>").addClass("close remove-point");
        closeButton.click(onRemovePointClick);
        $("<span>").html("&times").appendTo(closeButton);
        closeButton.appendTo(closeAddon);
        $("<i>").addClass("fa fa-map-marker destination-icon").appendTo(markerAddon);
        markerAddon.appendTo(inputGroup);
        var searchInput = $("<input type='search'>").addClass("form-control search-destination whisper");
        setShowCloseOnFocus(searchInput);
        searchInput.appendTo(inputGroup);
        closeAddon.appendTo(inputGroup);
        inputGroup.appendTo(searchGroup);

        setAC();

        if (searchGroup.children().length == (MIDDLE_POINT_LIMIT + 2)) {
            $("#add-point-icon").addClass("disabled-icon");
        }

        allMarkers[allMarkers.length-1].setIcon(MIDDLE_POINT_MARKER_ICON);
        var newMarker = L.marker(null, {
            icon: DESTINATION_MARKER_ICON,
            draggable: true
        });
        newMarker.on('dragend', onMarkerDrag);
        allMarkers.push(newMarker);
        searchInput.focus();
    }
}

function onRemovePointClick() {
    var wholeInput = $(this).parent().parent();
    var searchGroup = $("#search-group");
    if (searchGroup.children().length > 2) {
        map.removeLayer(allMarkers[wholeInput.index()]);
        allMarkers.splice(wholeInput.index(), 1);
        wholeInput.remove();

        allMarkers[0].setIcon(START_MARKER_ICON);
        allMarkers[allMarkers.length - 1].setIcon(DESTINATION_MARKER_ICON);

        refreshSearchGroup();
        getPlans();

        if (searchGroup.children().length < (MIDDLE_POINT_LIMIT + 2)) {
            $("#add-point-icon").removeClass("disabled-icon");
        }
    } else {
        map.removeLayer(allMarkers[wholeInput.index()]);
        allMarkers[wholeInput.index()].setLatLng(null);
        $(this).parent().prev().val("");
        getPlans();
    }
}

function refreshSearchGroup() {
    var searchGroup = $("#search-group");
    $(".form-control").removeClass("search-start search-destination search-middle-point");
    searchGroup.find(".fa-map-marker").removeClass("start-icon destination-icon middle-point-icon");
    var allForms = searchGroup.children();
    var limit = allForms.length;
    for (var i = 0; i < limit; i++) {
        if (i == 0) {
            allForms.eq(i).find("i").addClass("start-icon");
            allForms.eq(i).find("input").addClass("search-start");
        } else if (i == (allForms.length - 1)) {
            allForms.eq(i).find("i").addClass("destination-icon");
            allForms.eq(i).find("input").addClass("search-destination");
        } else {
            allForms.eq(i).find("i").addClass("middle-point-icon");
            allForms.eq(i).find("input").addClass("search-middle-point"); //zatim k nicemu nepouzivam
        }
    }
}

function setShowCloseOnFocus(focusedElement) {
    focusedElement.focus(function (eFocus) {
        $(this).next().children().addClass("focus-in");
        map.off("click");
        map.on("click", function(eClick) {
            onMapClick(eClick,eFocus);
        });
    });
    focusedElement.blur(function (e) {
        var mapDiv = document.getElementById("map");
        if (e.relatedTarget != mapDiv) {
            map.off("click");
        }
        $(this).next().children().removeClass("focus-in");
    });
}