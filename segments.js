/**
 * Created by Tomas on 14.08.2015.
 */
var ELEVATION_SEGMENTS = 0;
var SPEED_SEGMENTS = 1;
var SURFACE_SEGMENTS = 2;
var ROAD_TYPE_SEGMENTS = 3;


var LEGEND_LVL_1_COLOR = "#0040FF";
var LEGEND_LVL_2_COLOR = "#0080FF";
var LEGEND_LVL_3_COLOR = "#15B0FF";
var LEGEND_LVL_4_MIDDLE_COLOR = "#90BB00";
var LEGEND_LVL_5_COLOR = "#FFC000";
var LEGEND_LVL_6_COLOR = "#FF8115";
var LEGEND_LVL_7_COLOR = "#FF5D54";
var LEGEND_LVL_8_COLOR = "#FF0000";

var MAX_SEGMENT_DISTANCE = 50;

var segmentRoute;
var lastClickedRoute;
var segChoice;
$(document).ready(function() {
    segmentRoute = L.layerGroup();
    segChoice = ELEVATION_SEGMENTS;

    $(".legend-button").click(function(e) {
        segChoice = $(e.target).parent().index();
        var routeIndex = basicRoutes.getLayers().indexOf(lastClickedRoute);
        showSegments(routeIndex, response.plans[routeIndex])
    });
    drawSegmentsInLegend();

});
function drawSegmentsInLegend() {
    $(".level1").css("background-color", LEGEND_LVL_1_COLOR);
    $(".level2").css("background-color", LEGEND_LVL_2_COLOR);
    $(".level3").css("background-color", LEGEND_LVL_3_COLOR);
    $(".level4").css("background-color", LEGEND_LVL_4_MIDDLE_COLOR);
    $(".level5").css("background-color", LEGEND_LVL_5_COLOR);
    $(".level6").css("background-color", LEGEND_LVL_6_COLOR);
    $(".level7").css("background-color", LEGEND_LVL_7_COLOR);
    $(".level8").css("background-color", LEGEND_LVL_8_COLOR);
}

function showSegments(routeIndex, plan) {

    removeSegmentRouteFromMap();
    chooseTypeOfSegments(plan, routeIndex);

    if (lastClickedRoute != null) {
        lastClickedRoute.setStyle(basicRouteOptions);
    }
    lastClickedRoute = basicRoutes.getLayers()[routeIndex];
    lastClickedRoute.setStyle(borderRouteOptions);
    lastClickedRoute.bringToFront();
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
            showSpeedSegments(plan, routeIndex);
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

        if (segmentDistance > MAX_SEGMENT_DISTANCE || i == steps.length-1) {
            var oneSpeedPath = L.polyline(pathLatLngs, segmentRouteOptions);


            var speedInKmh = (segmentDistance/time) * 3.6;

            if (speedInKmh < 5) {
                oneSpeedPath.setStyle({color: LEGEND_LVL_8_COLOR});
            } else if (speedInKmh < 10) {
                oneSpeedPath.setStyle({color: LEGEND_LVL_7_COLOR});
            } else if (speedInKmh < 15) {
                oneSpeedPath.setStyle({color: LEGEND_LVL_5_COLOR});
            }  else if (speedInKmh > 30){
                oneSpeedPath.setStyle({color: LEGEND_LVL_1_COLOR});
            } else if (speedInKmh > 25) {
                oneSpeedPath.setStyle({color: LEGEND_LVL_2_COLOR});
            } else if (speedInKmh > 20) {
                oneSpeedPath.setStyle({color: LEGEND_LVL_3_COLOR});
            }
            segmentRoute.addLayer(oneSpeedPath);

            segmentDistance = steps[i].distanceToNextStep;
            time = plan.steps[i].travelTimeToNextStep;
            pathLatLngs = [];
            pathLatLngs.push(L.latLng(lat, lng));
        } else {
            segmentDistance += steps[i].distanceToNextStep;
            time += plan.steps[i].travelTimeToNextStep;
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