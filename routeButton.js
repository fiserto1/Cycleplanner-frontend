/**
 * Created by Tomas on 29.09.2015.
 */
function createButtonForRoute(plan, routeIndex) {

    var routeButton = $("<div>").addClass("route-but col-md-12");
    //id je index daneho planu v polich polyline, nezamenit se zobrazovanym poradim na strance
    routeButton.attr("id", "route-but-" + routeIndex);
    var routeSpan = $("<span>").addClass("route-desc row");

    var criteriaWeightTab = $('<div>').addClass("criteria-weight-tab col-md-12");
    var durationTab = createDurationTab(plan, routeIndex);
    var stressTab = createStressTab(plan, routeIndex);
    var effortTab = createEffortTab(plan, routeIndex);
    var lengthTab = createLengthTab(plan, routeIndex);

    criteriaWeightTab.appendTo(routeSpan);
    durationTab.appendTo(routeSpan);
    stressTab.appendTo(routeSpan);
    effortTab.appendTo(routeSpan);
    lengthTab.appendTo(routeSpan);

    routeSpan.appendTo(routeButton);
    routeButton.appendTo($("#routes-panel"));
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