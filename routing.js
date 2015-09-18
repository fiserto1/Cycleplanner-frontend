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
        var XYData = [];
        var XYSpeedData = [];
        var XYStressData = [];
        var XYPowerData = [];
        var maxElevation = Number.MIN_VALUE;
        var minElevation = Number.MAX_VALUE;
        var maxSpeed = Number.MIN_VALUE;
        var minSpeed = Number.MAX_VALUE;
        var maxStress = Number.MIN_VALUE;
        var minStress = Number.MAX_VALUE;
        var maxPower = Number.MIN_VALUE;
        var minPower = Number.MAX_VALUE;
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
        console.log(maxStress);
        console.log(minStress);
        console.log(maxPower);
        console.log(minPower);
        var chOptions = {
            elevation: {
                max: maxElevation,
                min: minElevation,
                data: XYData
            },
            speed: {
                max: maxSpeed,
                min: minSpeed,
                data: XYSpeedData
            },
            stress: {
                max: maxStress,
                min: minStress,
                data: XYStressData
            },
            power: {
                max: maxPower,
                min: minPower,
                data: XYPowerData
            }

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

    setTimeout(function(){
        console.log("halo");
        for(var i = 0; i < allChartOptions.length; i++){

            var chartDivId = "#duration-chart-" + i;
            //var id = $(string);
            createDurationChart(allChartOptions[i].speed, i, $(chartDivId));
            chartDivId = ("#stress-chart-" + i);
            createStressChart(allChartOptions[i].stress, i, $(chartDivId));
            chartDivId = ("#effort-chart-" + i);
            createEffortChart(allChartOptions[i].power, i, $(chartDivId));


            //createDurationChart(allChartOptions[i].stress, i, $("#hChart"));
            //$("#chart-panel").show();
        }

    }, 200);// bez timeoutu nefunguje...


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


//<ul id="myTab" class="nav nav-tabs">
//    <li class="active legend-button">
//    <a href="#elevation-legend" data-toggle="tab" data-i18n="legend.tabs.elevation"></a>
//    </li>
//    <li class="legend-button">
//    <a href="#speed-legend" data-toggle="tab" data-i18n="legend.tabs.speed"></a>
//    </li>
//    <li class="legend-button">
//    <a href="#surface-legend" data-toggle="tab" data-i18n="legend.tabs.surface"></a>
//    </li>
//    <li class="legend-button">
//    <a href="#road-type-legend" data-toggle="tab" data-i18n="legend.tabs.road-type"></a>
//    </li>
//    </ul>
function createButtonForRoute(plan, routeIndex) {

    var routeButton = $("<div>").addClass("route-but col-md-12");
    //id je index daneho planu v polich polyline, nezamenit se zobrazovanym poradim na strance
    routeButton.attr("id", routeIndex);
    //routeButton.css("z-index", butZIndex);
    var routeDiv = $("<span>").addClass("route-desc row");

    var durationTab = createDurationTab(plan, routeIndex);
    var stressTab = createStressTab(plan, routeIndex);
    var effortTab = createEffortTab(plan, routeIndex);

    durationTab.appendTo(routeDiv);
    stressTab.appendTo(routeDiv);
    effortTab.appendTo(routeDiv);

    routeDiv.appendTo(routeButton);
    routeButton.appendTo($("#routes-panel"));

    //routeButton.click({param1: routeIndex, param2: plan}, routeButtonClick);

}
var firstRouteClick=0;
function routeButtonClick(e) {
    var routeIndex = e.data.param1;
    var plan = e.data.param2;
    showSegments(routeIndex, plan);
    //createChart(allChartOptions[routeIndex], routeIndex);
    //console.log(e);
    $(".route-but").removeClass("selected-but");
    $(e.currentTarget).addClass("selected-but");
    if (firstRouteClick == 0) {
        changeValuesInDescriptionPanel(plan);
    }

    $("#chart-panel").show("blind", 500);
    $("#legend").show("blind", 500);
}
function createDurationTab(plan, routeIndex) {
    var planDuration = (plan.criteria.travelTime / 60).toFixed(0);
    var durationTab = $('<div href="#elevation-legend" data-toggle="tab">').addClass("duration-desc criteria-tab col-md-4");
    durationTab.click(function() {
        segChoice = ELEVATION_SEGMENTS;
        //$("#legend").show("blind", 500);
        showSegments(routeIndex, plan);
        //var id = $("#duration-chart-0");
        //createChart(allChartOptions[routeIndex], routeIndex, id);
    });
    var durationDesc = $("<span>").addClass("one-criteria row");
    var durationLabel = $('<span data-i18n="route-description.travel-time">').addClass("description-label");
    durationLabel.text($.t("route-description.travel-time"));
    durationLabel.appendTo(durationDesc);
    var durationValue = $('<span>').addClass("description-value");
    if (planDuration >= 60) {
        durationValue.text(Math.floor(planDuration/60) +" h " + (planDuration%60) + " min");
    } else {
        durationValue.text(planDuration + " min");
    }
    durationValue.appendTo(durationDesc);
    durationDesc.appendTo(durationTab);

    var divId = "duration-chart-" + routeIndex;
    var durationChart = $("<div>").attr("id", divId).addClass("small-chart row");
    //createChart(allChartOptions[routeIndex], routeIndex, durationChart);

    //$(window).resize();
    durationChart.appendTo(durationTab);

    return durationTab;
}

function createStressTab(plan, routeIndex) {
    var stressTab = $('<div href="#road-type-legend" data-toggle="tab">').addClass("stress-desc criteria-tab col-md-4");
    stressTab.click(function() {
        segChoice = ROAD_TYPE_SEGMENTS;
        //$("#legend").show("blind", 500);
        showSegments(routeIndex, plan);
    });
    var stressDesc = $("<span>").addClass("one-criteria row");
    var stressLabel = $('<span data-i18n="route-description.stress">').addClass("description-label");
    stressLabel.text($.t("route-description.stress"));
    stressLabel.appendTo(stressDesc);
    var stressValue = $('<span>').addClass("description-value");
    stressValue.text(plan.criteria.stress + " SU");
    stressValue.appendTo(stressDesc);
    stressDesc.appendTo(stressTab);

    var divId = "stress-chart-" + routeIndex;
    var stressChart = $("<div>").attr("id", divId).addClass("small-chart row");
    //createChart(allChartOptions[routeIndex], routeIndex, stressChart);
    stressChart.appendTo(stressTab);

    return stressTab;
}

function createEffortTab(plan, routeIndex) {
    var physicalEffort = (plan.criteria.physicalEffort / 1000).toFixed(1);

    var effortTab = $('<div href="#surface-legend" data-toggle="tab">').addClass("effort-desc criteria-tab col-md-4");
    effortTab.click(function() {
        segChoice = SURFACE_SEGMENTS;
        //$("#legend").show("blind", 500);
        showSegments(routeIndex, plan);
    });
    var effortDesc = $("<span>").addClass("one-criteria row");
    var effortLabel = $('<span data-i18n="route-description.physical-effort">').addClass("description-label");
    effortLabel.text($.t("route-description.physical-effort"));
    effortLabel.appendTo(effortDesc);
    var effortValue = $('<span>').addClass("description-value");
    effortValue.text(physicalEffort + " kJ");
    effortValue.appendTo(effortDesc);
    effortDesc.appendTo(effortTab);

    var divId = "effort-chart-" + routeIndex;
    var effortChart = $("<div>").attr("id", divId).addClass("small-chart row");
    //createChart(allChartOptions[routeIndex], routeIndex, effortChart);
    effortChart.appendTo(effortTab);

    return effortTab;
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