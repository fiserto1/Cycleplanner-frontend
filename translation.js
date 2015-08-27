/**
 * Created by Tomas on 25.08.2015.
 */
//var addStart;
function translateLayerControl(t) {
    var selectors = $(".leaflet-control-layers-selector");
    selectors.eq(0).next().text(" " + t("control-layers.cycle-paths"));
    selectors.eq(1).next().text(" " + t("control-layers.cycle-racks"));
}

function translateContextmenu(t) {
    var items = $(".leaflet-contextmenu-item");
    var firstItem = items.eq(0);
    var firstIcon = firstItem.find("span");
    firstItem.text(t("contextmenu.add-start"));
    firstIcon.prependTo(firstItem);

    var secondItem = items.eq(1);
    var secondIcon = secondItem.find("span");
    secondItem.text(t("contextmenu.add-destination"))
    secondIcon.prependTo(secondItem);
}

function translateTooltips(t) {
    $(".menu-tooltip").attr("data-original-title", t("tooltip.menu"));
    $(".settings-tooltip").attr("data-original-title", t("tooltip.settings"));
    $(".change-dir-tooltip").attr("data-original-title", t("tooltip.change-direction"));
    $(".add-point-tooltip").attr("data-original-title", t("tooltip.add-point"));
}

function changeLanguage(language) {
    i18n.setLng(language, function(err, t) {
        // translate nav
        $(".left-sidebar").i18n();
        translateContextmenu(t);
        translateLayerControl(t);
        translateTooltips(t);
        $(".legend").i18n();
        $("#myTab").i18n();
        $("#web-title").i18n();

        //console.log($(".leaflet-contextmenu-item").eq(0).children());
        // programatical access
        var appName = t("app.name");
    });
}

$(document).ready(function() {
    $('[data-toggle="tooltip"]').tooltip();
    i18n.init({ lng: "en-US" }, function(err, t) {
        // translate nav
        $(".left-sidebar").i18n();
        translateTooltips(t);
        translateContextmenu(t);
        translateLayerControl(t);
        initializeMap();
        $(".legend").i18n();
        $("#myTab").i18n();
        $("#web-title").i18n();

        //addStart = t("contextmenu.add-start");
        //console.log(addStart);
        // programatical access
        var appName = t("app.name");
    });
    $("#english").click(function() {
        changeLanguage("en-US");
    });
    $("#czech").click(function() {
        changeLanguage("cs-CZ");
    });
    //i18n.init(function(err, t) {
    //    // translate nav
    //    $(".lnav").i18n();
    //
    //    // programatical access
    //    var appName = t("app.name");
    //});
});
