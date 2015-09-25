/**
 * Created by Tomas on 24.08.2015.
 */
$(document).ready(function() {
    $("#menu-button").click(function(e) {
        //$(".modal-sm").show("slide");
    });
    $(".menu-modal").on("hidden.bs.modal", function(e) {
        $("#menu-panel").css("opacity", "1");
        focusout();
    });
    $(".menu-modal").on("show.bs.modal", function(e) {
        $("#menu-panel").css("opacity", "0.8");
    });
});
