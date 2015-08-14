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
var LEGEND_LVL_6_COLOR = "#FF5D54";
var LEGEND_LVL_7_COLOR = "#FF0000";

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
});

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
                oneElevationPath.setStyle({color: "#FF0000"});
            } else if (elevationPerc > 7) {
                oneElevationPath.setStyle({color: "#FF5D54"});
            } else if (elevationPerc > 4) {
                oneElevationPath.setStyle({color: "#FFC000"});
            }  else if (elevationPerc < -10){
                oneElevationPath.setStyle({color: "#0040FF"});
            } else if (elevationPerc < -7) {
                oneElevationPath.setStyle({color: "#0080FF"});
            } else if (elevationPerc < -4) {
                oneElevationPath.setStyle({color: "#15B0FF"});
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
                oneSpeedPath.setStyle({color: "#FF0000"});
            } else if (speedInKmh < 10) {
                oneSpeedPath.setStyle({color: "#FF5D54"});
            } else if (speedInKmh < 15) {
                oneSpeedPath.setStyle({color: "#FFC000"});
            }  else if (speedInKmh > 30){
                oneSpeedPath.setStyle({color: "#0040FF"});
            } else if (speedInKmh > 25) {
                oneSpeedPath.setStyle({color: "#0080FF"});
            } else if (speedInKmh > 20) {
                oneSpeedPath.setStyle({color: "#15B0FF"});
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
            if (surfaceForOneSegment == "PAVED_SMOOTH") {
                oneSurfacePath.setStyle({color: "#15B0FF"});
            } else if (surfaceForOneSegment == "PAVED_COBBLESTONE") {
                oneSurfacePath.setStyle({color: "#FF0000"});
            } else if (surfaceForOneSegment == "UNPAVED") {
                oneSurfacePath.setStyle({color: "#FFC000"});
            } else if (surfaceForOneSegment != null){
                console.log(surfaceForOneSegment);
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
            if (roadTypeForOneSegment == "PRIMARY") {
                oneRoadTypePath.setStyle({color: "#FF0000"});
            } else if (roadTypeForOneSegment == "SECONDARY") {
                oneRoadTypePath.setStyle({color: "#FF5D54"});
            } else if (roadTypeForOneSegment == "TERTIARY") {
                oneRoadTypePath.setStyle({color: "#FF8115"});
            } else if (roadTypeForOneSegment == "ROAD") {
                oneRoadTypePath.setStyle({color: "#FFC000"});
            } else if (roadTypeForOneSegment == "STEPS") {
                oneRoadTypePath.setStyle({color: "#0040FF"});
            } else if (roadTypeForOneSegment == "FOOTWAY") {
                oneRoadTypePath.setStyle({color: "#0080FF"});
            } else if (roadTypeForOneSegment == "CYCLEWAY") {
                oneRoadTypePath.setStyle({color: "#15B0FF"});
            } else if (roadTypeForOneSegment != null) {
                console.log(roadTypeForOneSegment);
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