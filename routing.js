/**
 * Created by Tomas on 7. 7. 2015.
 */

var ROUTE_COLOR = "#717171"; //2382FF
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

var basicRouteOptions;
var borderRouteOptions;
var segmentRouteOptions;

//var ROUTE_BUT_PANEL_LIMIT = 4;
//var firstShowedRouteButId = 0;

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
        color: "#90BB00",
        weight: SEGMENT_ROUTE_WEIGHT,
        opacity: SEGMENT_ROUTE_OPACITY,
        lineJoin: 'round',
        lineCap: 'square', //"butt"
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
    };
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
    //console.log(obj.status);
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
    //var fourRoutesDiv = $("<div>").addClass("four-routes-panel");
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
        //var chOptions = {
        //    elevation: {
        //        data: XYData
        //    },
        //    speed: {
        //        data: XYSpeedData
        //    },
        //    stress: {
        //        data: XYStressData
        //    },
        //    power: {
        //        data: XYPowerData
        //    }
        //
        //};
        //allChartOptions.push(chOptions);

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
    countCriteriaWeight(maxDuration, maxPlanStress, maxEffort);
    allChartOptions.elevation.max = maxElevation;
    allChartOptions.elevation.min = minElevation;
    allChartOptions.speed.max = maxSpeed;
    allChartOptions.speed.min = minSpeed;
    allChartOptions.stress.max = maxStress;
    allChartOptions.stress.min = minStress;
    allChartOptions.power.max = maxPower;
    allChartOptions.power.min = minPower;
    basicRoutes.addTo(map);

    $('[data-toggle="tooltip"]').tooltip();

    setTimeout(function(){
        for(var i = 0; i < plans.length; i++){
            createSpeedChart(i);
            createStressChart(i);
            createPowerChart(i);
        }

    }, 20);// bez timeoutu nefunguje...


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

    //showLimitedRouteButs(plans.length);
    //$("#show-item-top").click(function() {
    //    if (firstShowedRouteButId > 0) {
    //        firstShowedRouteButId--;
    //        console.log(firstShowedRouteButId);
    //        showLimitedRouteButs(plans.length);
    //    }
    //});
    //$("#show-item-bottom").click(function() {
    //    console.log(plans.length-ROUTE_BUT_PANEL_LIMIT);
    //    if (firstShowedRouteButId < (plans.length-ROUTE_BUT_PANEL_LIMIT)) {
    //        firstShowedRouteButId++;
    //        console.log(firstShowedRouteButId);
    //        showLimitedRouteButs(plans.length);
    //    }
    //});

}

//function showLimitedRouteButs(plansLength) {
//    $(".route-but").hide();
//    for (var k = firstShowedRouteButId; (k < (firstShowedRouteButId + ROUTE_BUT_PANEL_LIMIT)) && (k < plansLength); k++) {
//        $("#route-but-" + k).show();
//    }
//    setTimeout(function(){
//        for(var i = 0; i < plansLength; i++){
//            createSpeedChart(i);
//            createStressChart(i);
//            createPowerChart(i);
//        }
//
//    }, 200);
//}

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
    routeButton.attr("id", "route-but-" + routeIndex);
    //routeButton.css("z-index", butZIndex);
    var routeDiv = $("<span>").addClass("route-desc row");

    var criteriaWeightTab = createCriteriaWeightTab(plan, routeIndex);
    var durationTab = createDurationTab(plan, routeIndex);
    var stressTab = createStressTab(plan, routeIndex);
    var effortTab = createEffortTab(plan, routeIndex);
    var lengthTab = createLengthTab(plan, routeIndex);

    criteriaWeightTab.appendTo(routeDiv);
    durationTab.appendTo(routeDiv);
    stressTab.appendTo(routeDiv);
    effortTab.appendTo(routeDiv);
    lengthTab.appendTo(routeDiv);

    routeDiv.appendTo(routeButton);
    routeButton.appendTo($("#routes-panel"));

    //routeButton.click({param1: routeIndex, param2: plan}, routeButtonClick);

}
var firstRouteClick=0;
function routeButtonClick(e) {
    var routeIndex = e.data.param1;
    var plan = e.data.param2;
    $("#legend").show();
    $(".small-chart").hide();
    $(".description-tab").hide();
    var buttonDivId = "#route-but-" + routeIndex;
    $(buttonDivId).find(".small-chart").show();
    $(buttonDivId).find(".description-tab").show();
    $(".selected-weight").removeClass("selected-weight");
    $(buttonDivId).find(".criteria-weight-tab").addClass("selected-weight");
    $(buttonDivId).find(".criteria-weight").addClass("selected-weight");
    showSegments(routeIndex, plan);
    setTimeout(function(){
        createSpeedChart(routeIndex);
        createStressChart(routeIndex);
        createPowerChart(routeIndex);
    }, 10);
}

function createCriteriaWeightTab(plan, routeIndex) {
    var durationWeight = $('<div>').addClass("criteria-weight-tab col-md-12");
    return durationWeight;
}

function createDurationTab(plan, routeIndex) {
    var planDuration = (plan.criteria.travelTime / 60).toFixed(0);
    var durationTab = $('<div href="#speed-legend" data-toggle="tab">').addClass("duration-desc criteria-tab col-md-4");
    durationTab.click(function(e) {
        segChoice = SPEED_SEGMENTS;
        $(".criteria-tab").removeClass("selected-but");
        var currentTarget = $(e.currentTarget);
        currentTarget.addClass("selected-but");
        showSegments(routeIndex, plan);
    });
    //var durationWeight = $("<div>").addClass("criteria-weight");
    //durationWeight.attr("id", "duration-weight");
    //durationWeight.css("background-color", SPEED_COLOR_LVL_3);
    //durationWeight.appendTo(durationTab);
    var durationDesc = $('<span data-toggle="tooltip" data-placement="top">').addClass("one-criteria row");
    durationDesc.attr("id", "route-duration");
    durationDesc.attr("data-original-title", $.t("tooltip.route-description.travel-time"));
    var durationLabel = $('<span data-i18n="route-description.travel-time">').addClass("description-label translate");
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

    //$(window).resize();
    durationChart.appendTo(durationTab);

    return durationTab;
}

function createStressTab(plan, routeIndex) {
    var stressTab = $('<div href="#stress-legend" data-toggle="tab">').addClass("stress-desc criteria-tab col-md-4");
    stressTab.click(function(e) {
        segChoice = STRESS_SEGMENTS;
        $(".criteria-tab").removeClass("selected-but");
        $(e.currentTarget).addClass("selected-but");
        $("#legend").show();
        showSegments(routeIndex, plan);
    });

    //var stressWeight = $("<div>").addClass("criteria-weight");
    //stressWeight.attr("id", "stress-weight");
    //stressWeight.css("background-color", STRESS_COLOR_LVL_3);
    //stressWeight.appendTo(stressTab);
    var stressDesc = $('<span data-toggle="tooltip" data-placement="top">').addClass("one-criteria row");
    stressDesc.attr("id", "route-stress");
    stressDesc.attr("data-original-title", $.t("tooltip.route-description.stress"));
    var stressLabel = $('<span data-i18n="route-description.stress">').addClass("description-label translate");
    stressLabel.text($.t("route-description.stress"));
    stressLabel.appendTo(stressDesc);
    var stressValue = $('<span>').addClass("description-value");
    stressValue.text(plan.criteria.stress + " SU");
    stressValue.appendTo(stressDesc);
    stressDesc.appendTo(stressTab);

    var divId = "stress-chart-" + routeIndex;
    var stressChart = $("<div>").attr("id", divId).addClass("small-chart row");
    stressChart.appendTo(stressTab);

    return stressTab;
}

function createEffortTab(plan, routeIndex) {
    var physicalEffort = (plan.criteria.physicalEffort / 1000).toFixed(0);

    var effortTab = $('<div href="#power-legend" data-toggle="tab">').addClass("effort-desc criteria-tab col-md-4");
    effortTab.click(function(e) {
        segChoice = POWER_SEGMENTS;
        $(".criteria-tab").removeClass("selected-but");
        $(e.currentTarget).addClass("selected-but");
        $("#legend").show();
        showSegments(routeIndex, plan);
    });
    //var effortWeight = $("<div>").addClass("criteria-weight");
    //effortWeight.attr("id", "effort-weight");
    //effortWeight.css("background-color", POWER_COLOR_LVL_3);
    //effortWeight.appendTo(effortTab);
    var effortDesc = $('<span data-toggle="tooltip" data-placement="top">').addClass("one-criteria row");
    effortDesc.attr("id", "route-physical-effort");
    effortDesc.attr("data-original-title", $.t("tooltip.route-description.physical-effort"));
    var effortLabel = $('<span data-i18n="route-description.physical-effort">').addClass("description-label translate");
    effortLabel.text($.t("route-description.physical-effort"));
    effortLabel.appendTo(effortDesc);
    var effortValue = $('<span>').addClass("description-value");
    effortValue.text(physicalEffort + " kJ");
    effortValue.appendTo(effortDesc);
    effortDesc.appendTo(effortTab);

    var divId = "effort-chart-" + routeIndex;
    var effortChart = $("<div>").attr("id", divId).addClass("small-chart row");
    effortChart.appendTo(effortTab);

    return effortTab;
}

function createLengthTab(plan, routeIndex) {
    var length = plan.length;
    var elevationGain = plan.elevationGain;
    var elevationDrop = plan.elevationDrop;
    var lengthTab = $("<div>").addClass("description-tab col-md-12");
    var lengthDesc = $('<span data-toggle="tooltip" data-placement="bottom">').addClass("one-description");
    lengthDesc.attr("data-original-title", $.t("tooltip.route-description.length"));
    var lengthLabel = $('<span data-i18n="route-description.length">').addClass("description-label translate");
    lengthLabel.text($.t("route-description.length"));
    lengthLabel.appendTo(lengthDesc);
    var lengthValue = $('<span>').addClass("description-value");
    if (length < 1000) {
        lengthValue.text(length + " m,");
    } else {
        lengthValue.text((length/1000).toFixed(1) + " km,");
    }
    lengthValue.appendTo(lengthDesc);
    lengthDesc.appendTo(lengthTab);
    
    var elevationGainDesc = $('<span data-toggle="tooltip" data-placement="bottom">').addClass("one-description");
    elevationGainDesc.attr("data-original-title", $.t("tooltip.route-description.elevation-gain"));
    var elevationGainLabel = $('<span data-i18n="route-description.elevation-gain">').addClass("description-label translate");
    elevationGainLabel.text($.t("route-description.elevation-gain"));
    elevationGainLabel.appendTo(elevationGainDesc);
    var elevationGainValue = $('<span>').addClass("description-value");
    elevationGainValue.text(elevationGain + " m,");
    elevationGainValue.appendTo(elevationGainDesc);
    elevationGainDesc.appendTo(lengthTab);

    var elevationDropDesc = $('<span data-toggle="tooltip" data-placement="bottom">').addClass("one-description");
    elevationDropDesc.attr("data-original-title", $.t("tooltip.route-description.elevation-drop"));
    var elevationDropLabel = $('<span data-i18n="route-description.elevation-drop">').addClass("description-label translate");
    elevationDropLabel.text($.t("route-description.elevation-drop"));
    elevationDropLabel.appendTo(elevationDropDesc);
    var elevationDropValue = $('<span>').addClass("description-value");
    elevationDropValue.text(elevationDrop + " m");
    elevationDropValue.appendTo(elevationDropDesc);
    elevationDropDesc.appendTo(lengthTab);

    var shareBut = $('<span data-toggle="tooltip" data-placement="bottom">').addClass("description-icon");
    shareBut.attr("id", "share-button");
    shareBut.attr("data-original-title", $.t("tooltip.share"));
    var shareIcon = $("<i>").addClass("fa fa-share-alt fa-lg");
    shareIcon.appendTo(shareBut);
    shareBut.appendTo(lengthTab);
    var exportBut = $('<span data-toggle="tooltip" data-placement="bottom">').addClass("description-icon");
    exportBut.attr("id", "export-button");
    exportBut.attr("data-original-title", $.t("tooltip.export"));
    var exportIcon = $("<i>").addClass("fa fa-external-link fa-lg");
    exportIcon.appendTo(exportBut);
    exportBut.appendTo(lengthTab);
    return lengthTab;
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