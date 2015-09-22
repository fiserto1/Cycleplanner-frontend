/**
 * Created by Tomas on 14.08.2015.
 */
var ELEVATION_SEGMENTS = 0;
var SPEED_SEGMENTS = 1;
var STRESS_SEGMENTS = 2;
var POWER_SEGMENTS = 3;
var SURFACE_SEGMENTS = 4;
var ROAD_TYPE_SEGMENTS = 5;

var SPEED_COLOR_LVL_1 = "#c7e9c0";
var SPEED_COLOR_LVL_2 = "#a1d99b";
var SPEED_COLOR_LVL_3 = "#74c476";
var SPEED_COLOR_LVL_4 = "#31a354";
var SPEED_COLOR_LVL_5 = "#006d2c";

var STRESS_COLOR_LVL_1 = "#fcbba1";
var STRESS_COLOR_LVL_2 = "#fc9272";
var STRESS_COLOR_LVL_3 = "#fb6a4a";
var STRESS_COLOR_LVL_4 = "#de2d26";
var STRESS_COLOR_LVL_5 = "#a50f15";

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

var MAX_SEGMENT_DISTANCE = 50;
var MAX_SPEED_SEGMENT_DISTANCE = 10;
var MAX_POWER_SEGMENT_DISTANCE = 10;

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

function showElevationSegments(plan, routeIndex) {
    var pathLatLngs = [];
    var elevationA = plan.steps[0].coordinate.elevation;
    var segmentDistance = 0;
    var steps = plan.steps;
    for (var i = 0; i < steps.length; i++) {
        var coordinate = steps[i].coordinate;
        var lat = coordinate.latE6 / 1000000;
        var lng = coordinate.lonE6 / 1000000;
        pathLatLngs.push(L.latLng(lat, lng));

        if (segmentDistance > MAX_SEGMENT_DISTANCE || i == steps.length-1) {
            var oneElevationPath = L.polyline(pathLatLngs, segmentRouteOptions);
            var elevationB = coordinate.elevation;
            var elevationPerc = 100*(elevationB - elevationA) / segmentDistance;

            if (elevationPerc > 10) {
                oneElevationPath.setStyle({color: LEGEND_LVL_8_COLOR});
            } else if (elevationPerc > 7) {
                oneElevationPath.setStyle({color: LEGEND_LVL_7_COLOR});
            } else if (elevationPerc > 4) {
                oneElevationPath.setStyle({color: LEGEND_LVL_5_COLOR});
            }  else if (elevationPerc < -10){
                oneElevationPath.setStyle({color: LEGEND_LVL_1_COLOR});
            } else if (elevationPerc < -7) {
                oneElevationPath.setStyle({color: LEGEND_LVL_2_COLOR});
            } else if (elevationPerc < -4) {
                oneElevationPath.setStyle({color: LEGEND_LVL_3_COLOR});
            }
            segmentRoute.addLayer(oneElevationPath);

            elevationA = elevationB;
            segmentDistance = steps[i].distanceToNextStep;
            pathLatLngs = [];
            pathLatLngs.push(L.latLng(lat, lng));
        } else {
            segmentDistance += steps[i].distanceToNextStep;
        }
    }
}

function showSpeedSegments(plan, routeIndex) {
    var pathLatLngs = [];
    var segmentDistance = 0;
    var time = 0;
    var steps = plan.steps;
    for (var i = 0; i < steps.length; i++) {
        var coordinate = steps[i].coordinate;
        var lat = coordinate.latE6 / 1000000;
        var lng = coordinate.lonE6 / 1000000;
        pathLatLngs.push(L.latLng(lat, lng));

        if (segmentDistance > MAX_SPEED_SEGMENT_DISTANCE || i == steps.length-1) {
            var oneSpeedPath = L.polyline(pathLatLngs, segmentRouteOptions);


            var speedInKmh = (segmentDistance/time) * 3.6;

            if (speedInKmh < 5) {
                oneSpeedPath.setStyle({color: SPEED_COLOR_LVL_5});
            } else if (speedInKmh < 12) {
                oneSpeedPath.setStyle({color: SPEED_COLOR_LVL_4});
            } else if (speedInKmh < 24) {
                oneSpeedPath.setStyle({color: SPEED_COLOR_LVL_3});
            } else if (speedInKmh < 30) {
                oneSpeedPath.setStyle({color: SPEED_COLOR_LVL_2});
            } else {
                oneSpeedPath.setStyle({color: SPEED_COLOR_LVL_1});
            }
            segmentRoute.addLayer(oneSpeedPath);

            segmentDistance = steps[i].distanceToNextStep;
            time = steps[i].travelTimeToNextStep;
            pathLatLngs = [];
            pathLatLngs.push(L.latLng(lat, lng));
        } else {
            segmentDistance += steps[i].distanceToNextStep;
            time += steps[i].travelTimeToNextStep;
        }
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
        if (stress < 2) {
            oneStressPath.setStyle({color: STRESS_COLOR_LVL_1});
        } else if (stress < 3) {
            oneStressPath.setStyle({color: STRESS_COLOR_LVL_2});
        } else if (stress < 4) {
            oneStressPath.setStyle({color: STRESS_COLOR_LVL_3});
        } else if (stress < 5) {
            oneStressPath.setStyle({color: STRESS_COLOR_LVL_4});
        } else {
            oneStressPath.setStyle({color: STRESS_COLOR_LVL_5});
        }
        segmentRoute.addLayer(oneStressPath);
    }
}

function showPowerSegments(plan, routeIndex) {
    var pathLatLngs = [];
    var segmentDistance = 0;
    var time = 0;
    var effort = 0;
    var steps = plan.steps;
    for (var i = 0; i < steps.length; i++) {
        var coordinate = steps[i].coordinate;
        var lat = coordinate.latE6 / 1000000;
        var lng = coordinate.lonE6 / 1000000;
        pathLatLngs.push(L.latLng(lat, lng));

        if (segmentDistance > MAX_POWER_SEGMENT_DISTANCE || i == steps.length-1) {
            var oneSpeedPath = L.polyline(pathLatLngs, segmentRouteOptions);


            //var speedInKmh = (segmentDistance/time) * 3.6;
            var powerInW = effort / time;
//            console.log("power: " + powerInW);
            if (powerInW < 20) {
                oneSpeedPath.setStyle({color: POWER_COLOR_LVL_1});
            } else if (powerInW < 60) {
                oneSpeedPath.setStyle({color: POWER_COLOR_LVL_2});
            } else if (powerInW < 100) {
                oneSpeedPath.setStyle({color: POWER_COLOR_LVL_3});
            } else if (powerInW < 140) {
                oneSpeedPath.setStyle({color: POWER_COLOR_LVL_4});
            } else {
                oneSpeedPath.setStyle({color: POWER_COLOR_LVL_5});
            }
            segmentRoute.addLayer(oneSpeedPath);

            segmentDistance = steps[i].distanceToNextStep;
            time = steps[i].travelTimeToNextStep;
            effort = steps[i].physicalEffortToNextStep;
            pathLatLngs = [];
            pathLatLngs.push(L.latLng(lat, lng));
        } else {
            segmentDistance += steps[i].distanceToNextStep;
            time += steps[i].travelTimeToNextStep;
            effort += steps[i].physicalEffortToNextStep
        }
    }
}

function showSurfaceSegments(plan, routeIndex) {
    var steps = plan.steps;
    var surfaceForOneSegment = null;
    var segmentLatLngs = [];

    for (var i = 0; i < steps.length; i++) {
        var coordinate = steps[i].coordinate;
        var lat = coordinate.latE6 / 1000000;
        var lng = coordinate.lonE6 / 1000000;
        var currentSurface = steps[i].surface;
        segmentLatLngs.push(L.latLng(lat, lng));

        if (i == steps.length - 2) {
            continue;
        } else if (surfaceForOneSegment != currentSurface || i == steps.length-1) {
            var oneSurfacePath = L.polyline(segmentLatLngs, segmentRouteOptions);

            switch (surfaceForOneSegment) {
                case "PAVED_SMOOTH":
                    oneSurfacePath.setStyle({color: LEGEND_LVL_3_COLOR});
                    break;
                case "UNPAVED":
                    oneSurfacePath.setStyle({color: LEGEND_LVL_5_COLOR});
                    break;
                case "PAVED_COBBLESTONE":
                    oneSurfacePath.setStyle({color: LEGEND_LVL_8_COLOR});
                    break;
            }

            segmentRoute.addLayer(oneSurfacePath);

            surfaceForOneSegment = currentSurface;
            segmentLatLngs = [];
            segmentLatLngs.push(L.latLng(lat, lng));
        } else {
            surfaceForOneSegment = currentSurface;
        }
    }
}

function showRoadTypeSegments(plan, routeIndex) {
    var steps = plan.steps;
    var roadTypeForOneSegment = null;
    var segmentLatLngs = [];
    for (var i = 0; i < steps.length; i++) {
        var coordinate = steps[i].coordinate;
        var lat = coordinate.latE6 / 1000000;
        var lng = coordinate.lonE6 / 1000000;
        var currentRoadType = steps[i].roadType;
        segmentLatLngs.push(L.latLng(lat, lng));
        if (i == steps.length - 2) {
            continue;
        } else if (roadTypeForOneSegment != currentRoadType || i == steps.length - 1) {
            var oneRoadTypePath = L.polyline(segmentLatLngs, segmentRouteOptions);

            switch(roadTypeForOneSegment) {
                case "PRIMARY":
                    oneRoadTypePath.setStyle({color: LEGEND_LVL_8_COLOR});
                    break;
                case "SECONDARY":
                    oneRoadTypePath.setStyle({color: LEGEND_LVL_7_COLOR});
                    break;
                case "TERTIARY":
                    oneRoadTypePath.setStyle({color: LEGEND_LVL_6_COLOR});
                    break;
                case "ROAD":
                    oneRoadTypePath.setStyle({color: LEGEND_LVL_5_COLOR});
                    break;
                case "STEPS":
                    oneRoadTypePath.setStyle({color: LEGEND_LVL_3_COLOR});
                    break;
                case "FOOTWAY":
                    oneRoadTypePath.setStyle({color: LEGEND_LVL_2_COLOR});
                    break;
                case "CYCLEWAY":
                    oneRoadTypePath.setStyle({color: LEGEND_LVL_1_COLOR});
                    break;
            }

            segmentRoute.addLayer(oneRoadTypePath);

            roadTypeForOneSegment = currentRoadType;
            segmentLatLngs = [];
            segmentLatLngs.push(L.latLng(lat, lng));
        } else {
            roadTypeForOneSegment = currentRoadType;
        }
    }

}