
var SPEED_SEGMENTS = 1;
var STRESS_SEGMENTS = 2;
var POWER_SEGMENTS = 3;

var SPEED_LIMIT_LVL_1 = 5;
var SPEED_LIMIT_LVL_2 = 12;
var SPEED_LIMIT_LVL_3 = 24;
var SPEED_LIMIT_LVL_4 = 30;

var SPEED_COLOR_LVL_1 = "#c7e9c0";
var SPEED_COLOR_LVL_2 = "#a1d99b";
var SPEED_COLOR_LVL_3 = "#74c476";
var SPEED_COLOR_LVL_4 = "#31a354";
var SPEED_COLOR_LVL_5 = "#006d2c";

var STRESS_LIMIT_LVL_1 = 2;
var STRESS_LIMIT_LVL_2 = 3;
var STRESS_LIMIT_LVL_3 = 4;
var STRESS_LIMIT_LVL_4 = 5;

var STRESS_COLOR_LVL_1 = "#fcbba1";
var STRESS_COLOR_LVL_2 = "#fc9272";
var STRESS_COLOR_LVL_3 = "#fb6a4a";
var STRESS_COLOR_LVL_4 = "#de2d26";
var STRESS_COLOR_LVL_5 = "#a50f15";

var POWER_LIMIT_LVL_1 = 20;
var POWER_LIMIT_LVL_2 = 60;
var POWER_LIMIT_LVL_3 = 100;
var POWER_LIMIT_LVL_4 = 140;

var POWER_COLOR_LVL_1 = "#c6dbef";
var POWER_COLOR_LVL_2 = "#9ecae1";
var POWER_COLOR_LVL_3 = "#6baed6";
var POWER_COLOR_LVL_4 = "#3182bd";
var POWER_COLOR_LVL_5 = "#08519c";

var segmentRoute;
var lastClickedRoute;
var segChoice;

function initializeSegments() {
    segmentRoute = L.layerGroup();
    segChoice = SPEED_SEGMENTS;
    fillColorLegend();
    initializeRouting();
}

function fillColorLegend() {
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
        case SPEED_SEGMENTS:
            lastClickedRoute.setStyle({color: SPEED_BORDER_ROUTE_COLOR});
            createSpeedSegments(plan, routeIndex);
            break;
        case STRESS_SEGMENTS:
            lastClickedRoute.setStyle({color: STRESS_BORDER_ROUTE_COLOR});
            createStressSegments(plan, routeIndex);
            break;
        case POWER_SEGMENTS:
            lastClickedRoute.setStyle({color: POWER_BORDER_ROUTE_COLOR});
            createPowerSegments(plan, routeIndex);
            break;
    }
}

function createOneSegment(steps, stepIndex) {
    var coordinate = steps[stepIndex].coordinate;
    var nextCoordinate = steps[stepIndex+1].coordinate;
    var lat = coordinate.latE6 / 1000000;
    var lon = coordinate.lonE6 / 1000000;
    var nextLat = nextCoordinate.latE6 / 1000000;
    var nextLon = nextCoordinate.lonE6 / 1000000;
    var pathLatLons = [];
    pathLatLons.push(L.latLng(lat, lon));
    pathLatLons.push(L.latLng(nextLat, nextLon));
    return L.polyline(pathLatLons, segmentRouteOptions);
}

function createSpeedSegments(plan, routeIndex) {
    var steps = plan.steps;
    var limit = steps.length-1;
    for (var i = 0; i < limit; i++) {
        var segmentDistance = steps[i].distanceToNextStep;
        var time = steps[i].travelTimeToNextStep;
        var speedInKmh = (segmentDistance/time) * 3.6;

        var oneSpeedSegment = createOneSegment(steps, i);
        if (speedInKmh < SPEED_LIMIT_LVL_1) {
            oneSpeedSegment.setStyle({color: SPEED_COLOR_LVL_1});
        } else if (speedInKmh < SPEED_LIMIT_LVL_2) {
            oneSpeedSegment.setStyle({color: SPEED_COLOR_LVL_2});
        } else if (speedInKmh < SPEED_LIMIT_LVL_3) {
            oneSpeedSegment.setStyle({color: SPEED_COLOR_LVL_3});
        } else if (speedInKmh < SPEED_LIMIT_LVL_4) {
            oneSpeedSegment.setStyle({color: SPEED_COLOR_LVL_4});
        } else {
            oneSpeedSegment.setStyle({color: SPEED_COLOR_LVL_5});
        }
        segmentRoute.addLayer(oneSpeedSegment);
    }
}

function createStressSegments(plan, routeIndex) {
    var steps = plan.steps;
    var limit = steps.length-1;
    for (var i = 0; i < limit; i++) {
        var stress = steps[i].stressToNextStep;

        var oneStressSegment = createOneSegment(steps, i);
        if (stress < STRESS_LIMIT_LVL_1) {
            oneStressSegment.setStyle({color: STRESS_COLOR_LVL_1});
        } else if (stress < STRESS_LIMIT_LVL_2) {
            oneStressSegment.setStyle({color: STRESS_COLOR_LVL_2});
        } else if (stress < STRESS_LIMIT_LVL_3) {
            oneStressSegment.setStyle({color: STRESS_COLOR_LVL_3});
        } else if (stress < STRESS_LIMIT_LVL_4) {
            oneStressSegment.setStyle({color: STRESS_COLOR_LVL_4});
        } else {
            oneStressSegment.setStyle({color: STRESS_COLOR_LVL_5});
        }
        segmentRoute.addLayer(oneStressSegment);
    }
}

function createPowerSegments(plan, routeIndex) {
    var steps = plan.steps;
    var limit = steps.length-1;
    for (var i = 0; i < limit; i++) {
        var time = steps[i].travelTimeToNextStep;
        var effort = steps[i].physicalEffortToNextStep;
        var powerInW = effort / time;

        var onePowerSegment = createOneSegment(steps, i);
        if (powerInW < POWER_LIMIT_LVL_1) {
            onePowerSegment.setStyle({color: POWER_COLOR_LVL_1});
        } else if (powerInW < POWER_LIMIT_LVL_2) {
            onePowerSegment.setStyle({color: POWER_COLOR_LVL_2});
        } else if (powerInW < POWER_LIMIT_LVL_3) {
            onePowerSegment.setStyle({color: POWER_COLOR_LVL_3});
        } else if (powerInW < POWER_LIMIT_LVL_4) {
            onePowerSegment.setStyle({color: POWER_COLOR_LVL_4});
        } else {
            onePowerSegment.setStyle({color: POWER_COLOR_LVL_5});
        }
        segmentRoute.addLayer(onePowerSegment);
    }
}