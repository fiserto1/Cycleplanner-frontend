/**
 * Created by Tomas on 7. 7. 2015.
 */

var ROUTE_COLOR = "#2382FF";
var BORDER_CLICKED_ROUTE_COLOR = "#6F9000";
var CLICKED_ROUTE_COLOR = "#90BB00";

var ROUTE_OPACITY = 0.5;
var CLICKED_ROUTE_OPACITY = 1;

var ROUTE_WEIGHT = 7;
var CLICKED_ROUTE_WEIGHT = 5;

var MAX_SEGMENT_DISTANCE = 50;

var ELEVATION_SEGMENTS = 0;
var SPEED_SEGMENTS = 1;


function getPlans() {
    $.ajax({
        url: "http://its.felk.cvut.cz/cycle-planner-mc/api/v2/journeys/mc?startLat=" + startMarker.getLatLng().lat
        + "&startLon=" + startMarker.getLatLng().lng
        + "&endLat=" + endMarker.getLatLng().lat
        + "&endLon=" + endMarker.getLatLng().lng,

        success: handler
    });
}

var elevationRoutes = L.layerGroup();
var speedRoutes = L.layerGroup();
var basicRoutes = L.layerGroup();
var segColoredClickedRoute;
var segColoredClickedRouteIndex;
var segChoice = ELEVATION_SEGMENTS;

function handler(obj) {
    if (segColoredClickedRoute != null) {
        map.removeLayer(segColoredClickedRoute);
    }
    document.getElementById("routes").innerHTML = "<p>Trasy</p>";
    elevationRoutes.clearLayers();
    speedRoutes.clearLayers();
    basicRoutes.clearLayers();
    for (var i = 0; i < obj.plans.length; i++) {
        var oneElevationRoute = L.layerGroup();
        var oneSpeedRoute = L.layerGroup();
        var pathLatLngs = [];
        var oneBasicRouteLatLngs = [];
        var k = 0;
        var elevationA = obj.plans[i].steps[0].coordinate.elevation;
        var distance = 0;
        var time = 0;

        for (var j = 0; j < (obj.plans[i].steps.length); j++) {
            pathLatLngs[k] = L.latLng(obj.plans[i].steps[j].coordinate.latE6 / 1000000,
                obj.plans[i].steps[j].coordinate.lonE6 / 1000000);
            oneBasicRouteLatLngs[j] = pathLatLngs[k];

            if (distance > MAX_SEGMENT_DISTANCE || j == obj.plans[i].steps.length-1) {
                var clickedRouteOptions = {
                    color: CLICKED_ROUTE_COLOR,
                    weight: CLICKED_ROUTE_WEIGHT,
                    opacity: CLICKED_ROUTE_OPACITY,
                    lineJoin: 'round',
                    lineCap: 'butt', //"butt"
                    //dashArray: "5, 10",
                    smoothFactor: 1
                    //noClip: false
                }

                var oneElevationPath = L.polyline(pathLatLngs, clickedRouteOptions);
                var oneSpeedPath = L.polyline(pathLatLngs, clickedRouteOptions);

                var elevationB = obj.plans[i].steps[j].coordinate.elevation;
                var elevationPerc = 100*(elevationB - elevationA) / distance;

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

                var speedInKmh = (distance/time) * 3.6;

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


                oneElevationRoute.addLayer(oneElevationPath);
                oneSpeedRoute.addLayer(oneSpeedPath);

                elevationA = elevationB;
                distance = obj.plans[i].steps[j].distanceToNextStep;
                time = obj.plans[i].steps[j].travelTimeToNextStep;
                k = 1;
                pathLatLngs = [];
                pathLatLngs[0] = L.latLng(obj.plans[i].steps[j].coordinate.latE6 / 1000000,
                    obj.plans[i].steps[j].coordinate.lonE6 / 1000000);
            } else {
                distance += obj.plans[i].steps[j].distanceToNextStep;
                time += obj.plans[i].steps[j].travelTimeToNextStep;
                k++;
            }
        }
        elevationRoutes.addLayer(oneElevationRoute);
        speedRoutes.addLayer(oneSpeedRoute);

        var oneBasicRoute = L.polyline(oneBasicRouteLatLngs, {
            color: ROUTE_COLOR,
            weight: ROUTE_WEIGHT,
            opacity: ROUTE_OPACITY,
            lineJoin: 'round',
            lineCap: 'round', //"butt"
            //dashArray: "5, 10",
            smoothFactor: 1
            //noClip: false
        });
        oneBasicRoute.on('click', routeClick);
        basicRoutes.addLayer(oneBasicRoute);
        createButtonForRoute(obj, i);
    }
    basicRoutes.addTo(map);

    switch (segChoice) {
        case ELEVATION_SEGMENTS:
            segColoredClickedRoute = elevationRoutes.getLayers()[0];
            segColoredClickedRouteIndex = 0;
            break;
        case SPEED_SEGMENTS:
            segColoredClickedRoute = speedRoutes.getLayers()[0];
            segColoredClickedRouteIndex = 0;
            break;
    }
    legend.addTo(map);
    changeLegend(segChoice);
}

function routeClick(e) {
    routeButtonClick(basicRoutes.getLayers().indexOf(e.target));
}

function createButtonForRoute(obj, routeIndex) {
    var div = document.getElementById("routes");
    div.style.display = "block";
    var button = document.createElement("BUTTON");
    button.setAttribute("type", "button");
    button.setAttribute("id", "routeButton");
    button.setAttribute("onClick", "routeButtonClick(" + routeIndex + ")");
    var text = document.createTextNode(
        routeIndex + ". trasa: " +
        (obj.plans[routeIndex].length / 1000).toFixed(1) + " km, " +
        (obj.plans[routeIndex].duration / 60).toFixed(0) + " min, " +
        obj.plans[routeIndex].elevationGain + " m");
    button.appendChild(text);
    div.appendChild(button);
    //document.getElementById("basicRoutes").innerHTML += button;
}
function routeButtonClick(routeIndex) {
    //map.removeLayer(basicRoutes);

    switch (segChoice) {
        case ELEVATION_SEGMENTS:
            showSegments(elevationRoutes, routeIndex);
            break;
        case SPEED_SEGMENTS:
            showSegments(speedRoutes, routeIndex);
            break;
    }
}
function changeSegment() {
    var form = document.getElementById("changeSegment");
    var value = form.elements["segment"].value;
    segChoice = parseInt(value);
    switch (segChoice) {
        case ELEVATION_SEGMENTS:
            changeLegend(segChoice);
            var lastClicked = basicRoutes.getLayers()[segColoredClickedRouteIndex];
            lastClicked.setStyle({color: ROUTE_COLOR, opacity: ROUTE_OPACITY, weight: ROUTE_WEIGHT});
            map.removeLayer(segColoredClickedRoute);
            segColoredClickedRoute = elevationRoutes.getLayers()[0];
            segColoredClickedRouteIndex = 0;
            break;
        case SPEED_SEGMENTS:
            changeLegend(segChoice);
            var lastClicked = basicRoutes.getLayers()[segColoredClickedRouteIndex];
            lastClicked.setStyle({color: ROUTE_COLOR, opacity: ROUTE_OPACITY, weight: ROUTE_WEIGHT});
            map.removeLayer(segColoredClickedRoute);
            segColoredClickedRoute = speedRoutes.getLayers()[0];
            segColoredClickedRouteIndex = 0;
            break;
    }

}

function showSegments(segmentRoutes, routeIndex) {
    var lastClicked = basicRoutes.getLayers()[segmentRoutes.getLayers().indexOf(segColoredClickedRoute)];
    lastClicked.setStyle({color: ROUTE_COLOR, opacity: ROUTE_OPACITY, weight: ROUTE_WEIGHT});
    basicRoutes.getLayers()[routeIndex].bringToFront();
    basicRoutes.getLayers()[routeIndex].setStyle({color: BORDER_CLICKED_ROUTE_COLOR, opacity: 1, weight: ROUTE_WEIGHT})
    map.removeLayer(segColoredClickedRoute);
    map.addLayer(segmentRoutes.getLayers()[basicRoutes.getLayers().indexOf(basicRoutes.getLayers()[routeIndex])]);
    segColoredClickedRoute = segmentRoutes.getLayers()[basicRoutes.getLayers().indexOf(basicRoutes.getLayers()[routeIndex])];
    segColoredClickedRouteIndex = routeIndex;
}