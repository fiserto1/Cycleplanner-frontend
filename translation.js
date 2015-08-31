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
        $("#mobile-app-panel").i18n();
        $(".left-sidebar").i18n();
        translateContextmenu(t);
        translateLayerControl(t);
        translateTooltips(t);
        //TODO translateErrorPanel(t) or create error div for all errors..;
        $(".legend").i18n();
        $("#myTab").i18n();
        $("#web-title").i18n();

        //console.log($(".leaflet-contextmenu-item").eq(0).children());
        // programatical access
        var appName = t("app.name");
    });
}

$(document).ready(function() {
    var isMobile = false; //initiate as false
    // device detection
    if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
        || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) isMobile = true;
    console.log(isMobile);
    if (isMobile) {
        $("#mobile-app-panel").show();

    }
    $('[data-toggle="tooltip"]').tooltip();


    i18n.init({ lng: "en-US" }, function(err, t) {
        // translate nav
        $("#mobile-app-panel").i18n();
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
