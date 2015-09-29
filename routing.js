
var ROUTE_COLOR = "#717171";
var BORDER_ROUTE_COLOR = "#6F9000";
var SPEED_BORDER_ROUTE_COLOR = "#6F9000";
var STRESS_BORDER_ROUTE_COLOR = "#99000d";
var POWER_BORDER_ROUTE_COLOR = "#084594";

var ROUTE_OPACITY = 0.5;
var BORDER_ROUTE_OPACITY = 1;
var SEGMENT_ROUTE_OPACITY = 1;

var ROUTE_WEIGHT = 7;
var BORDER_ROUTE_WEIGHT = 7;
var SEGMENT_ROUTE_WEIGHT = 5;

var BASIC_ROUTE_OPTIONS = {
    color: ROUTE_COLOR,
    weight: ROUTE_WEIGHT,
    opacity: ROUTE_OPACITY,
    lineJoin: 'round',
    lineCap: 'round',
    smoothFactor: 0
};

var BORDER_ROUTE_OPTIONS = {
    color: BORDER_ROUTE_COLOR,
    weight: BORDER_ROUTE_WEIGHT,
    opacity: BORDER_ROUTE_OPACITY,
    lineJoin: 'round',
    lineCap: 'round',
    smoothFactor: 0
};

var SEGMENT_ROUTE_OPTIONS = {
    color: "#90BB00",
    weight: SEGMENT_ROUTE_WEIGHT,
    opacity: SEGMENT_ROUTE_OPACITY,
    lineJoin: 'round',
    lineCap: 'square',
    smoothFactor: 0
};

var allChartOptions = [];
var basicRoutes = L.layerGroup();
var response;


function initializeRouting() {
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

    $("#cancel-button").click(cancelRoute);
}

function showPlanFromHash(obj) {
    var origin = obj.request.origin;
    var destination = obj.request.destination;
    var startLatLng = L.latLng(origin.latE6/1000000, origin.lonE6/1000000);
    var destinationLatLng = L.latLng(destination.latE6/1000000, destination.lonE6/1000000);
    findAddressFromCoordinates(0, startLatLng);
    findAddressFromCoordinates(allMarkers.length-1, destinationLatLng);
    allMarkers[0].setLatLng(startLatLng).addTo(map);
    allMarkers[allMarkers.length-1].setLatLng(destinationLatLng).addTo(map);
    showPlans(obj);
}

function cancelRoute() {
    hidePanelsExceptSearch();
    removeAllRoutesFromMap();
    $("#cancel-button").hide();
    location.replace("#");
    for (var i = 0; i < allMarkers.length; i++) {
        map.removeLayer(allMarkers[i]);
        allMarkers[i].setLatLng(null);
        $("#search-panel").find("input").val("");
    }
}

function hidePanelsExceptSearch() {
    $("#routes-panel").html("").hide();
    $("#legend").hide();
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
                    success: showPlans,
                    error: serverError
                });
            }
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

    if (errorCode == 400) {
        $("#error-panel").text($.t("error.server.message-400")).show();
    } else if (errorCode >= 500 && errorCode < 510) {
        $("#error-panel").text($.t("error.server.message-50x")).show();
    }
}

function showPlans(obj) {
    $("#cancel-button").show();

    if (obj.status == "OUT_OF_BOUNDS") {
        handleServerError(400);
        return;
    }
    var hash = "#responseId=" + obj.responseId;
    location.replace(hash);
    spinner.stop();
    console.log(obj);
    response = obj;
    allChartOptions = {
        elevation: {
            data: []
        },
        speed: {
            data: []
        },
        stress: {
            data: []
        },
        power: {
            data: []
        }
    };
    removeAllRoutesFromMap();
    hidePanelsExceptSearch();
    var plans = obj.plans;

    iterateAllPlans(plans);

    basicRoutes.addTo(map);

    $('[data-toggle="tooltip"]').tooltip();

    setTimeout(function(){
        for(var i = 0; i < plans.length; i++){
            createSpeedChart(i);
            createStressChart(i);
            createPowerChart(i);
        }

    }, 20);// does not work without timeout

    var bbox = plans[0].boundingBox;
    var southWest = L.latLng(bbox.bottomRight.latE6 / 1000000, (bbox.topLeft.lonE6 / 1000000));
    var northEast = L.latLng(bbox.topLeft.latE6 / 1000000, (bbox.bottomRight.lonE6 / 1000000));
    var bounds = L.latLngBounds(southWest, northEast);
    map.fitBounds(bounds, {paddingTopLeft: [500, 20], paddingBottomRight: [20,20]});

    $("#routes-panel").show("blind");
}

function iterateAllPlans(plans) {
    var maxElevation = Number.MIN_VALUE;
    var minElevation = Number.MAX_VALUE;
    var maxSpeed = Number.MIN_VALUE;
    var minSpeed = Number.MAX_VALUE;
    var maxStress = Number.MIN_VALUE;
    var minStress = Number.MAX_VALUE;
    var maxPower = Number.MIN_VALUE;
    var minPower = Number.MAX_VALUE;

    var maxDuration = Number.MIN_VALUE;
    var maxPlanStress = Number.MIN_VALUE;
    var maxEffort = Number.MIN_VALUE;
    for (var i = 0; i < plans.length; i++) {
        var planDuration = plans[i].criteria.travelTime;
        var planStress = plans[i].criteria.stress;
        var planEffort = plans[i].criteria.physicalEffort;

        maxDuration = Math.max(maxDuration, planDuration);
        maxPlanStress = Math.max(planStress, planStress);
        maxEffort = Math.max(maxDuration, planEffort);

        var oneBasicRouteLatLngs = [];
        var distanceFromStart = 0;
        var XYData = [];
        var XYSpeedData = [];
        var XYStressData = [];
        var XYPowerData = [];

        var steps = plans[i].steps;
        for (var j = 0; j < (steps.length); j++) {
            var coordinate = steps[j].coordinate;
            var lat = coordinate.latE6 / 1000000;
            var lng = coordinate.lonE6 / 1000000;
            var sectionLength = steps[j].distanceToNextStep;
            var sectionTime = steps[j].travelTimeToNextStep;
            if (j != steps.length-1) {
                var sectionSpeed = (sectionLength/sectionTime)*3.6;
                maxSpeed = Math.max(maxSpeed, sectionSpeed);
                minSpeed = Math.min(minSpeed, sectionSpeed);
                XYSpeedData.push([distanceFromStart + (sectionLength/2), sectionSpeed]);

                var sectionStress = steps[j].stressToNextStep;
                maxStress = Math.max(maxStress, sectionStress);
                minStress = Math.min(minStress, sectionStress);
                XYStressData.push([distanceFromStart + (sectionLength/2), sectionStress]);

                var sectionEffort = steps[j].physicalEffortToNextStep;
                var sectionPower = sectionEffort/sectionTime;
                maxPower = Math.max(maxPower, sectionPower);
                minPower = Math.min(minPower, sectionPower);
                XYPowerData.push([distanceFromStart + (sectionLength/2), sectionPower]);
            }
            XYData.push([distanceFromStart, coordinate.elevation]);
            maxElevation = Math.max(maxElevation, coordinate.elevation);
            minElevation = Math.min(minElevation, coordinate.elevation);
            distanceFromStart += steps[j].distanceToNextStep;
            oneBasicRouteLatLngs.push(L.latLng(lat, lng));
        }
        allChartOptions.elevation.data.push(XYData);
        allChartOptions.speed.data.push(XYSpeedData);
        allChartOptions.stress.data.push(XYStressData);
        allChartOptions.power.data.push(XYPowerData);

        var oneBasicRoute = L.polyline(oneBasicRouteLatLngs, BASIC_ROUTE_OPTIONS);
        oneBasicRoute.on('click', routeClick);
        basicRoutes.addLayer(oneBasicRoute);
        createButtonForRoute(plans[i], i);
    }
    countCriteriaWeight(maxDuration, maxPlanStress, maxEffort);
    allChartOptions.elevation.max = maxElevation;
    allChartOptions.elevation.min = minElevation;
    allChartOptions.speed.max = maxSpeed;
    allChartOptions.speed.min = minSpeed;
    allChartOptions.stress.max = maxStress;
    allChartOptions.stress.min = minStress;
    allChartOptions.power.max = maxPower;
    allChartOptions.power.min = minPower;
}

function countCriteriaWeight(maxDuration, maxStress, maxEffort) {
    var plans = response.plans;
    for (var i = 0; i < plans.length; i++) {
        var planDuration = plans[i].criteria.travelTime;
        var planStress = plans[i].criteria.stress;
        var planEffort = plans[i].criteria.physicalEffort;

        var durationPerc = planDuration/maxDuration;
        var stressPerc = planStress/maxStress;
        var effortPerc = planEffort/maxEffort;
        var sumPerc = (durationPerc + stressPerc + effortPerc);
        var durationWeight = durationPerc / sumPerc;
        var stressWeight = stressPerc / sumPerc;
        var effortWeight = effortPerc / sumPerc;

        //console.log("duration: " + (durationWeight*100).toFixed(1));
        //console.log("stress: " + (stressWeight*100).toFixed(1));
        //console.log("effort: " + (effortWeight*100).toFixed(1));

        var divId = "#route-but-" + i;
        var criteriaWeightTab = $(divId).find(".criteria-weight-tab");
        var criteriaWeightSpan = $("<div>").addClass("row criteria-weight-tab");
        var durationWeightSpan = $("<div>").css("width", (durationWeight*100) + "%");
        durationWeightSpan.css("background-color", SPEED_COLOR_LVL_3);
        durationWeightSpan.addClass("criteria-weight");
        var stressWeightSpan = $("<div>").css("width", (stressWeight*100) + "%");
        stressWeightSpan.css("background-color", STRESS_COLOR_LVL_3);
        stressWeightSpan.addClass("criteria-weight");
        var effortWeightSpan = $("<div>").css("width", (effortWeight*100) + "%");
        effortWeightSpan.css("background-color", POWER_COLOR_LVL_3);
        effortWeightSpan.addClass("criteria-weight");
        durationWeightSpan.appendTo(criteriaWeightSpan);
        stressWeightSpan.appendTo(criteriaWeightSpan);
        effortWeightSpan.appendTo(criteriaWeightSpan);
        criteriaWeightSpan.appendTo(criteriaWeightTab);
    }
}

function routeClick(e) {
    var routeIndex = basicRoutes.getLayers().indexOf(e.target);
    console.log("route index: " + routeIndex);
    var button = $("#route-but-" + routeIndex);
    var criteriaTab;
    switch (segChoice) {
        case SPEED_SEGMENTS:
            criteriaTab = button.find(".duration-desc");
            break;
        case STRESS_SEGMENTS:
            criteriaTab = button.find(".stress-desc");
            break;
        case POWER_SEGMENTS:
            criteriaTab = button.find(".effort-desc");
            break;
    }
    criteriaTab.trigger("click").focus();
}