
function initializeTranslation() {
    var defaultLanguage = "en-US";
    i18n.init({ lng: defaultLanguage }, function(err, t) {
        changeLanguage(defaultLanguage);
        initializeSidebar();
    });

    $("#english").click(function() {
        changeLanguage("en-US");
    });
    $("#czech").click(function() {
        changeLanguage("cs-CZ");
    });
}

function changeLanguage(language) {
    i18n.setLng(language, function(err, t) {

        $("#mobile-app-panel").i18n();
        $(".translate").i18n();
        translateContextmenu(t);
        translateLayerControl(t);
        translateTooltips(t);
        //TODO translateErrorPanel(t);
        $("#about-description").html(t("about.html"));
        $("#api-description").html(t("api.body.description.html"));
        $("#feedback-description").html(t("feedback.body.description.html"));
        //$("#text-feedback").attr("placeholder", t("feedback.textarea-placeholder"));
        //$("#api-reason").attr("placeholder", t("api.body.reason"));
        //$("#api-email").attr("placeholder", t("api.body.email"));
    });
}

function translateContextmenu(t) {
    var items = $(".leaflet-contextmenu-item");
    var firstItem = items.eq(0);
    var firstIcon = firstItem.find("span");
    firstItem.text(t("contextmenu.add-start"));
    firstIcon.prependTo(firstItem);

    var secondItem = items.eq(1);
    var secondIcon = secondItem.find("span");
    secondItem.text(t("contextmenu.add-destination"));
    secondIcon.prependTo(secondItem);
}

function translateLayerControl(t) {
    var selectors = $(".leaflet-control-layers-selector");
    selectors.eq(0).next().text(" " + t("control-layers.cycle-paths"));
    selectors.eq(1).next().text(" " + t("control-layers.cycle-racks"));
}

function translateTooltips(t) {
    $(".menu-tooltip").attr("data-original-title", t("tooltip.menu"));
    $(".settings-tooltip").attr("data-original-title", t("tooltip.settings"));
    $(".cancel-tooltip").attr("data-original-title", t("tooltip.cancel"));
    $(".change-dir-tooltip").attr("data-original-title", t("tooltip.change-direction"));
    $(".add-point-tooltip").attr("data-original-title", t("tooltip.add-point"));

    $("#route-duration").attr("data-original-title", t("tooltip.route-description.travel-time"));
    $("#route-stress").attr("data-original-title", t("tooltip.route-description.stress"));
    $("#route-physical-effort").attr("data-original-title", t("tooltip.route-description.physical-effort"));
    $("#route-length").attr("data-original-title", t("tooltip.route-description.length"));
    $("#route-elevation-gain").attr("data-original-title", t("tooltip.route-description.elevation-gain"));
    $("#route-elevation-drop").attr("data-original-title", t("tooltip.route-description.elevation-drop"));
    $("#share-button").attr("data-original-title", t("tooltip.share"));
    $("#export-button").attr("data-original-title", t("tooltip.export"));

    $(".leaflet-control-locate").attr("data-original-title", t("tooltip.locate"));
    $(".leaflet-control-zoom-in").attr("data-original-title", t("tooltip.zoom-in"));
    $(".leaflet-control-zoom-out").attr("data-original-title", t("tooltip.zoom-out"));
    $('[data-toggle="tooltip"]').tooltip();
}