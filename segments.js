/**
 * Created by Tomas on 14.08.2015.
 */
var ELEVATION_SEGMENTS = 0;
var SPEED_SEGMENTS = 1;
var STRESS_SEGMENTS = 2;
var POWER_SEGMENTS = 3;
var SURFACE_SEGMENTS = 4;
var ROAD_TYPE_SEGMENTS = 5;

var SPEED_LIMIT_LVL_1 = 5;
var SPEED_LIMIT_LVL_2 = 12;
var SPEED_LIMIT_LVL_3 = 24;
var SPEED_LIMIT_LVL_4 = 30;
//var SPEED_LIMIT_LVL_5 = ; // maxvalue

var SPEED_COLOR_LVL_1 = "#c7e9c0";
var SPEED_COLOR_LVL_2 = "#a1d99b";
var SPEED_COLOR_LVL_3 = "#74c476";
var SPEED_COLOR_LVL_4 = "#31a354";
var SPEED_COLOR_LVL_5 = "#006d2c";

var STRESS_LIMIT_LVL_1 = 2;
var STRESS_LIMIT_LVL_2 = 3;
var STRESS_LIMIT_LVL_3 = 4;
var STRESS_LIMIT_LVL_4 = 5;
//var STRESS_LIMIT_LVL_5 = ; // maxvalue

var STRESS_COLOR_LVL_1 = "#fcbba1";
var STRESS_COLOR_LVL_2 = "#fc9272";
var STRESS_COLOR_LVL_3 = "#fb6a4a";
var STRESS_COLOR_LVL_4 = "#de2d26";
var STRESS_COLOR_LVL_5 = "#a50f15";

var POWER_LIMIT_LVL_1 = 20;
var POWER_LIMIT_LVL_2 = 60;
var POWER_LIMIT_LVL_3 = 100;
var POWER_LIMIT_LVL_4 = 140;
//var POWER_LIMIT_LVL_5 = ; // maxvalue

var POWER_COLOR_LVL_1 = "#c6dbef";
var POWER_COLOR_LVL_2 = "#9ecae1";
var POWER_COLOR_LVL_3 = "#6baed6";
var POWER_COLOR_LVL_4 = "#3182bd";
var POWER_COLOR_LVL_5 = "#08519c";

var LEGEND_LVL_1_COLOR = "#0040FF";
var LEGEND_LVL_2_COLOR = "#0080FF";
var LEGEND_LVL_3_COLOR = "#15B0FF";
var LEGEND_LVL_4_MIDDLE_COLOR = "#90BB00";
var LEGEND_LVL_5_COLOR = "#FFC000";
var LEGEND_LVL_6_COLOR = "#FF8115";
var LEGEND_LVL_7_COLOR = "#FF5D54";
var LEGEND_LVL_8_COLOR = "#FF0000";


var segmentRoute;
var lastClickedRoute;
var segChoice;
$(document).ready(function() {
    segmentRoute = L.layerGroup();
    segChoice = SPEED_SEGMENTS;

    $(".legend-button").click(function(e) {
        segChoice = $(e.target).parent().index();
        var routeIndex = basicRoutes.getLayers().indexOf(lastClickedRoute);
        showSegments(routeIndex, response.plans[routeIndex])
    });
    drawSegmentsInLegend();

});
function drawSegmentsInLegend() {
    var speedLegend = $("#speed-legend");
    speedLegend.find(".level1").css("background-color", SPEED_COLOR_LVL_1);
    speedLegend.find(".level2").css("background-color", SPEED_COLOR_LVL_2);
    speedLegend.find(".level3").css("background-color", SPEED_COLOR_LVL_3);
    speedLegend.find(".level4").css("background-color", SPEED_COLOR_LVL_4);
    speedLegend.find(".level5").css("background-color", SPEED_COLOR_LVL_5);

    var stressLegend = $("#stress-legend");
    stressLegend.find(".level1").css("background-color", STRESS_COLOR_LVL_1);
    stressLegend.find(".level2").css("background-color", STRESS_COLOR_LVL_2);
    stressLegend.find(".level3").css("background-color", STRESS_COLOR_LVL_3);
    stressLegend.find(".level4").css("background-color", STRESS_COLOR_LVL_4);
    stressLegend.find(".level5").css("background-color", STRESS_COLOR_LVL_5);

    var powerLegend = $("#power-legend");
    powerLegend.find(".level1").css("background-color", POWER_COLOR_LVL_1);
    powerLegend.find(".level2").css("background-color", POWER_COLOR_LVL_2);
    powerLegend.find(".level3").css("background-color", POWER_COLOR_LVL_3);
    powerLegend.find(".level4").css("background-color", POWER_COLOR_LVL_4);
    powerLegend.find(".level5").css("background-color", POWER_COLOR_LVL_5);
}

function showSegments(routeIndex, plan) {

    removeSegmentRouteFromMap();
    if (lastClickedRoute != null) {
        lastClickedRoute.setStyle(basicRouteOptions);
    }

    lastClickedRoute = basicRoutes.getLayers()[routeIndex];
    lastClickedRoute.setStyle(borderRouteOptions);
    lastClickedRoute.bringToFront();
    chooseTypeOfSegments(plan, routeIndex);
    segmentRoute.addTo(map);
}

function removeSegmentRouteFromMap() {
    if (segmentRoute != null) {
        map.removeLayer(segmentRoute);
        segmentRoute.clearLayers();
    }
}

function chooseTypeOfSegments(plan, routeIndex) {
    switch (segChoice) {
        case ELEVATION_SEGMENTS:

            showElevationSegments(plan, routeIndex);
            break;
        case SPEED_SEGMENTS:
            lastClickedRoute.setStyle({color: SPEED_BORDER_ROUTE_COLOR});
            showSpeedSegments(plan, routeIndex);
            break;
        case STRESS_SEGMENTS:
            lastClickedRoute.setStyle({color: STRESS_BORDER_ROUTE_COLOR});
            showStressSegments(plan, routeIndex);
            break;
        case POWER_SEGMENTS:
            lastClickedRoute.setStyle({color: POWER_BORDER_ROUTE_COLOR});
            showPowerSegments(plan, routeIndex);
            break;
        case SURFACE_SEGMENTS:
            showSurfaceSegments(plan, routeIndex);
            break;
        case ROAD_TYPE_SEGMENTS:
            showRoadTypeSegments(plan, routeIndex);
            break;
    }
}

function showSpeedSegments(plan, routeIndex) {
    var steps = plan.steps;
    for (var i = 0; i < steps.length-1; i++) {
        var coordinate = steps[i].coordinate;
        var nextCoordinate = steps[i+1].coordinate;
        var lat = coordinate.latE6 / 1000000;
        var lng = coordinate.lonE6 / 1000000;
        var nextLat = nextCoordinate.latE6 / 1000000;
        var nextLng = nextCoordinate.lonE6 / 1000000;
        var pathLatLngs = [];
        pathLatLngs.push(L.latLng(lat, lng));
        pathLatLngs.push(L.latLng(nextLat, nextLng));

        var oneSpeedPath = L.polyline(pathLatLngs, segmentRouteOptions);
        var segmentDistance = steps[i].distanceToNextStep;
        var time = steps[i].travelTimeToNextStep;
        var speedInKmh = (segmentDistance/time) * 3.6;
        if (speedInKmh < SPEED_LIMIT_LVL_1) {
            oneSpeedPath.setStyle({color: SPEED_COLOR_LVL_1});
        } else if (speedInKmh < SPEED_LIMIT_LVL_2) {
            oneSpeedPath.setStyle({color: SPEED_COLOR_LVL_2});
        } else if (speedInKmh < SPEED_LIMIT_LVL_3) {
            oneSpeedPath.setStyle({color: SPEED_COLOR_LVL_3});
        } else if (speedInKmh < SPEED_LIMIT_LVL_4) {
            oneSpeedPath.setStyle({color: SPEED_COLOR_LVL_4});
        } else {
            oneSpeedPath.setStyle({color: SPEED_COLOR_LVL_5});
        }
        segmentRoute.addLayer(oneSpeedPath);
    }
}

function showStressSegments(plan, routeIndex) {
    var steps = plan.steps;
    for (var i = 0; i < steps.length-1; i++) {
        var coordinate = steps[i].coordinate;
        var nextCoordinate = steps[i+1].coordinate;
        var lat = coordinate.latE6 / 1000000;
        var lng = coordinate.lonE6 / 1000000;
        var nextLat = nextCoordinate.latE6 / 1000000;
        var nextLng = nextCoordinate.lonE6 / 1000000;
        var pathLatLngs = [];
        pathLatLngs.push(L.latLng(lat, lng));
        pathLatLngs.push(L.latLng(nextLat, nextLng));

        var oneStressPath = L.polyline(pathLatLngs, segmentRouteOptions);
        var stress = steps[i].stressToNextStep;
        if (stress < STRESS_LIMIT_LVL_1) {
            oneStressPath.setStyle({color: STRESS_COLOR_LVL_1});
        } else if (stress < STRESS_LIMIT_LVL_2) {
            oneStressPath.setStyle({color: STRESS_COLOR_LVL_2});
        } else if (stress < STRESS_LIMIT_LVL_3) {
            oneStressPath.setStyle({color: STRESS_COLOR_LVL_3});
        } else if (stress < STRESS_LIMIT_LVL_4) {
            oneStressPath.setStyle({color: STRESS_COLOR_LVL_4});
        } else {
            oneStressPath.setStyle({color: STRESS_COLOR_LVL_5});
        }
        segmentRoute.addLayer(oneStressPath);
    }
}

function showPowerSegments(plan, routeIndex) {
    var steps = plan.steps;
    for (var i = 0; i < steps.length-1; i++) {
        var coordinate = steps[i].coordinate;
        var nextCoordinate = steps[i+1].coordinate;
        var lat = coordinate.latE6 / 1000000;
        var lng = coordinate.lonE6 / 1000000;
        var nextLat = nextCoordinate.latE6 / 1000000;
        var nextLng = nextCoordinate.lonE6 / 1000000;
        var pathLatLngs = [];
        pathLatLngs.push(L.latLng(lat, lng));
        pathLatLngs.push(L.latLng(nextLat, nextLng));
        var time = steps[i].travelTimeToNextStep;
        var effort = steps[i].physicalEffortToNextStep;
        var onePowerPath = L.polyline(pathLatLngs, segmentRouteOptions);
        var powerInW = effort / time;
        if (powerInW < POWER_LIMIT_LVL_1) {
            onePowerPath.setStyle({color: POWER_COLOR_LVL_1});
        } else if (powerInW < POWER_LIMIT_LVL_2) {
            onePowerPath.setStyle({color: POWER_COLOR_LVL_2});
        } else if (powerInW < POWER_LIMIT_LVL_3) {
            onePowerPath.setStyle({color: POWER_COLOR_LVL_3});
        } else if (powerInW < POWER_LIMIT_LVL_4) {
            onePowerPath.setStyle({color: POWER_COLOR_LVL_4});
        } else {
            onePowerPath.setStyle({color: POWER_COLOR_LVL_5});
        }
        segmentRoute.addLayer(onePowerPath);
    }
}