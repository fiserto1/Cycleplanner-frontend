
function initializeSidebar() {
    $(".menu-modal").on("hidden.bs.modal", function(e) {
        $("#menu-panel").css("opacity", "1");
        focusout();
    });
    $(".menu-modal").on("show.bs.modal", function(e) {
        $("#menu-panel").css("opacity", "0.8");
    });
    initializeMap();
}
