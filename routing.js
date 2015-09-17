/**
 * Created by Tomas on 7. 7. 2015.
 */

var ROUTE_COLOR = "#717171"; //2382FF
var BORDER_ROUTE_COLOR = "#6F9000";

var ROUTE_OPACITY = 0.5;
var BORDER_ROUTE_OPACITY = 1;
var SEGMENT_ROUTE_OPACITY = 1;

var ROUTE_WEIGHT = 7;
var BORDER_ROUTE_WEIGHT = 7;
var SEGMENT_ROUTE_WEIGHT = 5;

var basicRouteOptions;
var borderRouteOptions;
var segmentRouteOptions;

function initializeRouting() {
    basicRouteOptions = {
        color: ROUTE_COLOR,
        weight: ROUTE_WEIGHT,
        opacity: ROUTE_OPACITY,
        lineJoin: 'round',
        lineCap: 'round', //"butt"
        //dashArray: "5, 10",
        smoothFactor: 0
        //noClip: false
    };
    segmentRouteOptions = {
        color: LEGEND_LVL_4_MIDDLE_COLOR,
        weight: SEGMENT_ROUTE_WEIGHT,
        opacity: SEGMENT_ROUTE_OPACITY,
        lineJoin: 'round',
        lineCap: 'butt', //"butt"
        //dashArray: "5, 10",
        smoothFactor: 0
        //noClip: false
    };
    borderRouteOptions = {
        color: BORDER_ROUTE_COLOR,
        weight: BORDER_ROUTE_WEIGHT,
        opacity: BORDER_ROUTE_OPACITY,
        lineJoin: 'round',
        lineCap: 'round', //"butt"
        //dashArray: "5, 10",
        smoothFactor: 0
        //noClip: false
    }
    var hash = location.hash;
    if (hash != "") {
        var responseId = parseInt(hash.substr(12));
        var prevLocation = "http://its.felk.cvut.cz/cycle-planner-1.5.0-SNAPSHOT/api/v3/planner/plans/responseId/" + responseId;
        $.ajax({
            url: prevLocation,
            success: showPlanFromHash,
            error: serverError
        });
    }
}
function showPlanFromHash(obj) {
    var origin = obj.request.origin;
    var destination = obj.request.destination;
    var startLatLng = L.latLng(origin.latE6/1000000, origin.lonE6/1000000);
    var destinationLatLng = L.latLng(destination.latE6/1000000, destination.lonE6/1000000);
    findAddressFromCoordinates(0, startLatLng);
    findAddressFromCoordinates(1, destinationLatLng);
    allMarkers[0].setLatLng(startLatLng).addTo(map);
    allMarkers[allMarkers.length-1].setLatLng(destinationLatLng).addTo(map);
    handler(obj);
}

function hidePanelsExceptSearch() {
    $("#routes-panel").html("").hide();
    $("#legend").hide();
    $("#chart-panel").hide();
    firstRouteClick = 0;
    $("#error-panel").hide();
}

function removeAllRoutesFromMap() {
    removeSegmentRouteFromMap();
    map.removeLayer(basicRoutes);
    basicRoutes.clearLayers();
}

function getPlans() {
    var startMarker = allMarkers[0];
    var destinationMarker = allMarkers[allMarkers.length-1];
    if (destinationMarker.getLatLng() != null && startMarker.getLatLng() != null) {
        //console.log("Start");
        var target = document.getElementById('map');
        spinner.spin(target);
        var data = {
            "client":"multicriteria-cycleplanner",
            "origin":{
                "type":"ORIGIN",
                "latE6": (startMarker.getLatLng().lat * 1000000),
                "lonE6": (startMarker.getLatLng().lng * 1000000)
            },
            "destination":{
                "type":"DESTINATION",
                "latE6": (destinationMarker.getLatLng().lat * 1000000),
                "lonE6": (destinationMarker.getLatLng().lng * 1000000)},
            "averageSpeedKmPH": 20.0
        };
        $.ajax({
            method: "POST",
            url: "http://its.felk.cvut.cz/cycle-planner-1.5.0-SNAPSHOT/api/v3/planner/plan",
            contentType: "application/json",
            //headers: {"Content-Type": "application/json"},
            data: JSON.stringify(data),
            error: serverError,
            success: function(data, status, xhr) {
                var location = xhr.getResponseHeader("Location");
                console.log(location);
                $.ajax({
                    url: location,
                    success: handler,
                    error: serverError
                });
            },
            error: serverError
        });

    } else {
        removeAllRoutesFromMap();
        hidePanelsExceptSearch();
    }
}

function serverError(xhr,status,error) {

    var errorCode = xhr.status;
    handleServerError(errorCode);
}

function handleServerError(errorCode) {
    spinner.stop();
    removeAllRoutesFromMap();
    hidePanelsExceptSearch();
    //var text = xhr.responseText;
    //console.log(xhr.status);


    if (errorCode == 400) {
        $("#error-panel").text($.t("error.server.message-400")).show();
    } else if (errorCode >= 500 && errorCode < 510) {
        $("#error-panel").text($.t("error.server.message-50x")).show();
    }
}

var allChartOptions = [];

var basicRoutes = L.layerGroup();

var response;

function handler(obj) {
    console.log(obj.status);

    if (obj.status == "OUT_OF_BOUNDS") {
        handleServerError(400);
        return;
    }
    var hash = "#responseId=" + obj.responseId;
    location.replace(hash);
    spinner.stop();
    console.log(obj);
    response = obj;
    allChartOptions = []; //TODO prepsat na lokalni promennou
    removeAllRoutesFromMap();
    hidePanelsExceptSearch();
    var plans = obj.plans;
    var butZIndex = 500;
    //var fourRoutesDiv = $("<div>").addClass("four-routes-panel");
    for (var i = 0; i < plans.length; i++) {
        var oneBasicRouteLatLngs = [];
        var distanceFromStart = 0;
        var XYData = []; //TODO graf bude taky lazy nacitanej
        var minElevation = Number.MAX_VALUE;
        var maxElevation = Number.MIN_VALUE;
        var steps = plans[i].steps;
        for (var j = 0; j < (steps.length); j++) {
            var coordinate = steps[j].coordinate;
            var lat = coordinate.latE6 / 1000000;
            var lng = coordinate.lonE6 / 1000000;
            XYData.push([distanceFromStart, coordinate.elevation]);
            maxElevation = Math.max(maxElevation, coordinate.elevation);
            minElevation = Math.min(minElevation, coordinate.elevation);
            distanceFromStart += steps[j].distanceToNextStep;
            oneBasicRouteLatLngs.push(L.latLng(lat, lng));
        }
        var chOptions = {
            max: maxElevation,
            min: minElevation,
            data: XYData
        };
        allChartOptions.push(chOptions);

        var oneBasicRoute = L.polyline(oneBasicRouteLatLngs, basicRouteOptions);
        oneBasicRoute.on('click', routeClick);
        basicRoutes.addLayer(oneBasicRoute);
        //if (i%4 == 0) {
        //    console.log(i);
        //    fourRoutesDiv = null;
        //    fourRoutesDiv = $("<div>").addClass("four-routes-panel");
        //    fourRoutesDiv.css("z-index", butZIndex);
        //    fourRoutesDiv.appendTo("#routes-panel");
        //    butZIndex--;
        //}
        //createButtonForRoute(plans[i], i, butZIndex, fourRoutesDiv);
        createButtonForRoute(plans[i], i);
    }
    basicRoutes.addTo(map);

    //TODO sortovani- je potreba si ulozit do id buttonu index v poli vsech polyline a vsude pouzivat toto cislo misto indexu v danem divu
    //TODO dale je potreba ulozit hodnotu jednotlivych kriterii jako samostatne divy aby se k ni dalo snadno pristupovat pri sortovani
    //NASLEDUJE PREDPRIPRAVENY SORTING
    //var allRouteDivs = $(".route-but");
    //var orderedRouteButtons = allRouteDivs.sort(function (a, b) {
    //    var divA = $(a);
    //    var divB = $(b);
    //    if (divA.find(".kriterium1").text() == divB.find(".kriterium1").text()) {
    //        if (divA.find(".kriterium2").text() == divB.find(".kriterium2").text()) {
    //            return divA.find(".kriterium3").text() > divB.find(".kriterium3").text();
    //        } else {
    //            return divA.find(".kriterium2").text() > divB.find(".kriterium2").text();
    //        }
    //    } else {
    //        return divA.find(".kriterium1").text() > divB.find("kriterium1").text();
    //    }
    //});
    //$("#routes-panel").html(orderedRouteButtons);


    var bbox = plans[0].boundingBox;
    var southWest = L.latLng(bbox.bottomRight.latE6 / 1000000, (bbox.topLeft.lonE6 / 1000000));
    var northEast = L.latLng(bbox.topLeft.latE6 / 1000000, (bbox.bottomRight.lonE6 / 1000000));
    //L.marker(southWest).addTo(map);
    //L.marker(northEast).addTo(map);
    var bounds = L.latLngBounds(southWest, northEast);
    map.fitBounds(bounds, {paddingTopLeft: [500, 20], paddingBottomRight: [20,20]});
    //map.zoomOut();

    $("#routes-panel").show("blind");
    //$("#chart-panel").show("blind");

}

function routeClick(e) {
    var routeIndex = basicRoutes.getLayers().indexOf(e.target);
    console.log(routeIndex);
    var button = $(".route-but").eq(routeIndex);
    button.trigger("click").focus();
}

function createButtonForRoute(plan, routeIndex) {

    //data-toggle="collapse" data-target="#settings-panel"
    var routeButton = $("<button>").addClass("btn btn-default route-but col-md-3");
    //routeButton.css("z-index", butZIndex);
    var routeDiv = $("<div>").addClass("route-desc");
    //var routeSpan1 = $("<i>").addClass("fa fa-clock-o");
    var routeSpan1 = $("<span>");
    var planDuration = (plan.criteria.travelTime / 60).toFixed(0);
    var physicalEffort = (plan.criteria.physicalEffort / 1000).toFixed(1);
    if (planDuration >= 60) {
        routeSpan1.text($.t("route-description.travel-time") + Math.floor(planDuration/60) +" h " + (planDuration%60) + " min");
    } else {
        routeSpan1.text($.t("route-description.travel-time") + planDuration + " min");
    }
    //var routeSpan2 = $("<i>").addClass("fa fa-car");
    var routeSpan2 = $("<span>");
    routeSpan2.text($.t("route-description.stress") + plan.criteria.stress + " SU");
    //var routeSpan3 = $("<i>").addClass("fa fa-gavel");
    var routeSpan3 = $("<span>");
    routeSpan3.text($.t("route-description.physical-effort") + physicalEffort + " kJ");
    routeSpan1.appendTo(routeDiv);
    $("<hr>").appendTo(routeDiv);
    routeSpan2.appendTo(routeDiv);
    $("<hr>").appendTo(routeDiv);
    routeSpan3.appendTo(routeDiv);
    routeDiv.appendTo(routeButton);
    //routeButton.appendTo(fourRoutesDiv);
    routeButton.appendTo($("#routes-panel"));
    routeButton.click({param1: routeIndex, param2: plan}, routeButtonClick);

}
var firstRouteClick=0;
function routeButtonClick(e) {
    var routeIndex = e.data.param1;
    var plan = e.data.param2;
    showSegments(routeIndex, plan);
    createChart(allChartOptions[routeIndex], routeIndex);
    //console.log(e);
    $(".route-but").removeClass("selected-but");
    $(e.currentTarget).addClass("selected-but");
    if (firstRouteClick == 0) {
        changeValuesInDescriptionPanel(plan);
    }

    $("#chart-panel").show("blind", 500);
    $("#legend").show("blind", 500);
}

//vysunuti a zasunuti podrobneho popisu trasy po kliknuti na button
function afterChartShow(plan, routeIndex) {
    if (firstRouteClick != 0) {
        //console.log("nth click");
        $("#full-route-description").hide("blind", 350, function () {
            changeValuesInDescriptionPanel(plan);
        });
        $("#full-route-description").show("blind", 350);
    }
    firstRouteClick = 1;

}

function changeValuesInDescriptionPanel(plan) {
    var planLength = plan.length;
    var planDuration = (plan.criteria.travelTime / 60).toFixed(0);
    var stress = (plan.criteria.stress);
    var physicalEffort = (plan.criteria.physicalEffort/ 1000).toFixed(1);
    if (planDuration >= 60) {
        $("#route-duration-val").text(" "+ Math.floor(planDuration/60) +" h " + (planDuration%60) + " min");
    } else {
        $("#route-duration-val").text(" " + planDuration + " min");
    }
    $("#route-stress-val").text(" " + stress + " SU");
    $("#route-physical-effort-val").text(" " + physicalEffort + " kJ");
    if (planLength < 1000) {
        $("#route-length-val").text(" " + planLength + " m");
    } else {
        $("#route-length-val").text(" " + (planLength/1000).toFixed(1) + " km");
    }
    $("#route-elevation-gain-val").text(" " + plan.elevationGain + " m");
    $("#route-elevation-drop-val").text(" " + plan.elevationDrop + " m");
    //$("#route-elevation-change-val").text(" " + plan.elevationGain + " m");
    //$("#route-crossroads-val").text(" -");
}