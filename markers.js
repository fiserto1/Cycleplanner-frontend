/**
 * Created by Tomas on 14. 7. 2015.
 */
//var startLatLng = L.latLng(50.07697, 14.43226);
//var endLatLng = L.latLng(50.08744, 14.38728);
var MIDDLE_POINT_LIMIT = 3;

var startIcon, destinationIcon, middlePointIcon;
//var startMarker, destinationMarker;
var allMarkers = [];

function initializeMarkers() {

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
    var startMarker = L.marker(null, {
        icon: startIcon,
        draggable: true
    });

    var destinationMarker = L.marker(null, {
        icon: destinationIcon,
        draggable: true
    });
    allMarkers.push(startMarker);
    allMarkers.push(destinationMarker);




    $("#change-direction-icon").click(onChangeDirectionClick);
    $("#add-point-icon").click(onAddPointClick);
    $(".remove-point").click(onRemovePointClick);

    //map.on('click', onMapClick);
    map.on('moveend', changeParams);
    startMarker.on('dragend', onMarkerDrag);
    destinationMarker.on('dragend', onMarkerDrag);



    setShowCloseOnFocus($("input"));

}

function onMapClick(e, input) {
    //TODO pouzit $(document.activeElement) misto input... usetri starosti ktery input je aktivovany
    //console.log(e.target);
    //console.log(input);

    var $input = $(input.target);
    allMarkers[$input.parent().index()].setLatLng(e.latlng).addTo(map);
    findAddressFromCoordinates($input.parent().index(), e.latlng);
    getPlans();
    map.off("click");
}

function onMarkerDrag(e) {
    $("#chart-panel").hide();
    $("#legend").hide();
    findAddressFromCoordinates(allMarkers.indexOf(e.target), e.target.getLatLng());
    getPlans();
}

function onChangeDirectionClick() {
    allMarkers.reverse();
    allMarkers[0].setIcon(startIcon);
    allMarkers[allMarkers.length-1].setIcon(destinationIcon);
    for(var i = 1; i<allMarkers.length-1; i++) {
        allMarkers[i].setIcon(middlePointIcon);
    }
    reverseSearchForm();
    getPlans();
}

function reverseSearchForm() {
    //TODO prepsat lepe
    var value = $(".search-start").val();
    $(".search-start").val($(".search-destination").val());
    $(".search-destination").val(value);
    if (allMarkers.length > 3) {
        var allForms = $("#search-group").children();
        var secondInput = allForms.eq(1).find("input");
        var preLastInput = allForms.eq(allForms.length - 2).find("input");
        value = secondInput.val();
        secondInput.val(preLastInput.val());
        preLastInput.val(value);
    }
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
        var closeButton = $("<button type='button' tabindex='-1'>").addClass("close remove-point");
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

        allMarkers[0].setIcon(middlePointIcon);

        var newMarker = L.marker(null, {
            icon: startIcon,
            draggable: true
        });
        newMarker.on('dragend', onMarkerDrag);
        allMarkers.unshift(newMarker);
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

        allMarkers[allMarkers.length-1].setIcon(middlePointIcon);

        var newMarker = L.marker(null, {
            icon: destinationIcon,
            draggable: true
        });
        newMarker.on('dragend', onMarkerDrag);
        allMarkers.push(newMarker);
        searchInput.focus();
        console.log(allMarkers);
    }


}

function onRemovePointClick() {
    var wholeInput = $(this).parent().parent();

    if ($("#search-group").children().length > 2) {
        //$(this).parent().parent().hide( "slide", { direction: "up" }, "slow" );
        map.removeLayer(allMarkers[wholeInput.index()]);
        allMarkers.splice(wholeInput.index(), 1);
        wholeInput.remove();

        allMarkers[0].setIcon(startIcon);
        allMarkers[allMarkers.length - 1].setIcon(destinationIcon);

        refreshSearchGroup();
        getPlans();


        if ($("#search-group").children().length < (MIDDLE_POINT_LIMIT + 2)) {
            $("#addPointIcon").removeClass("disabled-icon");
        }
        if ($("#search-group").children().length == 2) {
            //$(".remove-point").css("color", white);
        }
    } else {
        map.removeLayer(allMarkers[wholeInput.index()]);
        allMarkers[wholeInput.index()].setLatLng(null);
        $(this).parent().prev().val("");
        getPlans();

    }
}

function refreshSearchGroup() {
    $(".form-control").removeClass("search-start search-destination search-middle-point");
    $("#search-panel .fa-map-marker").removeClass("start-icon destination-icon middle-point-icon");
    var allForms = $("#search-group").children();
    for (var i = 0; i < allForms.length; i++) {
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
//function findCoordinatesFromAdress(address, index) {
//    $.ajax({
//        url: "http://ec2-52-28-222-45.eu-central-1.compute.amazonaws.com:3100/suggest/nearby?input=" + address
//        + "&size=1" + "&lat=" + map.getCenter().lat + "&lon=" + map.getCenter().lng,
//        success: function (data) {
//            //console.log(data);
//            console.log(address);
//            console.log(index);
//            console.log(data.features[0].geometry.coordinates);
//            //return data.features[0].geometry.coordinates;
//        },
//        error: function () {
//            console.log("SERVER ERROR")
//        }
//    });
//}

var dragIndex;
$(function () {
    $("#search-group").sortable({
        handle: ".drag-drop",
        update: function (event, ui) {
            refreshSearchGroup();
            var dropIndex = ui.item.index();
            var markerToMove = allMarkers[dragIndex];
            allMarkers.splice(dragIndex, 1);
            allMarkers.splice(dropIndex, 0, markerToMove);
            allMarkers[0].setIcon(startIcon);
            allMarkers[allMarkers.length-1].setIcon(destinationIcon);
            for(var i = 1; i<allMarkers.length-1; i++) {
                allMarkers[i].setIcon(middlePointIcon);
            }
            getPlans();
        },
        start: function (event, ui) {
            dragIndex = ui.item.index();
        }
        //stop: function (event, ui) {
        //    console.log("to: " + ui.item.index());
        //}
    });
    //$("#search-group").disableSelection(); //// nefunguje ve firefoxu
});
//
//
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