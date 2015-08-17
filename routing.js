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

var SERVER_ERR_MSG_400 = "Zde není možné nalézt trasy.";
var SERVER_ERR_MSG_50X = "Server nyní není dostupný.";

var basicRouteOptions;
var borderRouteOptions;
var segmentRouteOptions;

$(document).ready(function() {
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
});

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
    if (destinationMarker.getLatLng() != null && startMarker.getLatLng() != null) {
        //console.log("Start");
        var target = document.getElementById('map');
        spinner.spin(target);
        $.ajax({
            url: "http://its.felk.cvut.cz/cycle-planner-mc/api/v2/journeys/mc?startLat=" + startMarker.getLatLng().lat
            + "&startLon=" + startMarker.getLatLng().lng
            + "&endLat=" + destinationMarker.getLatLng().lat
            + "&endLon=" + destinationMarker.getLatLng().lng,

            success: handler,
            error: serverError
        });
    } else {
        removeAllRoutesFromMap();
        hidePanelsExceptSearch();
    }
}
function serverError(xhr,status,error) {
    spinner.stop();
    removeAllRoutesFromMap();
    hidePanelsExceptSearch();
    //var text = xhr.responseText;
    //console.log(xhr.status);

    var errorCode = xhr.status;
    if (errorCode == 400) {
        $("#error-panel").text(SERVER_ERR_MSG_400).show();
    } else if (errorCode >= 500 && errorCode < 510) {
        $("#error-panel").text(SERVER_ERR_MSG_50X).show();
    }
}

var allChartOptions = [];

var basicRoutes = L.layerGroup();

var response;

function handler(obj) {
    spinner.stop();
    //console.log(obj);
    response = obj;
    allChartOptions = []; //TODO prepsat na lokalni promennou
    removeAllRoutesFromMap();
    hidePanelsExceptSearch();
    var plans = obj.plans;
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
        createButtonForRoute(plans[i], i);
    }
    basicRoutes.addTo(map);
    $("#routes-panel").show("blind");

}

function routeClick(e) {
    var routeIndex = basicRoutes.getLayers().indexOf(e.target);
    console.log(routeIndex);
    var button = $(".route-but").eq(routeIndex);
    button.trigger("click").focus();
}

function createButtonForRoute(plan, routeIndex) {
    //data-toggle="collapse" data-target="#settings-panel"
    var routeButton = $("<button>").addClass("btn btn-default route-but col-md-4");
    var routeDiv = $("<div>").addClass("route-desc");
    var routeSpan1 = $("<i>").addClass("fa fa-arrows-h");
    var planLength = (plan.length / 1000).toFixed(1);
    var planDuration = (plan.duration / 60).toFixed(0);
    routeSpan1.text(" " + planLength + " km");
    var routeSpan2 = $("<i>").addClass("fa fa-clock-o");
    routeSpan2.text(" " + planDuration + " min");
    var routeSpan3 = $("<i>").addClass("fa fa-area-chart");
    routeSpan3.text(" " + plan.elevationGain + " m");
    routeSpan1.appendTo(routeDiv);
    $("<hr>").appendTo(routeDiv);
    routeSpan2.appendTo(routeDiv);
    $("<hr>").appendTo(routeDiv);
    routeSpan3.appendTo(routeDiv);
    routeDiv.appendTo(routeButton);
    routeButton.appendTo("#routes-panel");
    routeButton.click({param1: routeIndex, param2: plan}, routeButtonClick);
}
var firstRouteClick=0;
function routeButtonClick(e) {
    var routeIndex = e.data.param1;
    var plan = e.data.param2;
    showSegments(routeIndex, plan);
    createChart(allChartOptions[routeIndex], routeIndex);
    $("#route-description").html("trasa <br> popis");
    $("#chart-panel").show("blind", 500, afterChartShow(routeIndex));
    $("#legend").show("blind", 500);
}

function afterChartShow(routeIndex) {
    if (firstRouteClick != 0) {

        $("#route-description").hide("blind", 350);
        $("#route-description").show("blind", 350);
    }
    firstRouteClick = 1;

}