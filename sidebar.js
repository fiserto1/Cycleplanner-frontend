/**
 * Created by Tomas on 24.08.2015.
 */
$(document).ready(function() {
    $("#menu-icon").click(function(e) {
        //$(".modal-sm").show("slide");
    });
    $("#about-panel").on("hidden.bs.modal", function(e) {
        focusout();
    });
    $("#feedback-panel").on("hidden.bs.modal", function(e) {
        focusout();
    });
    $("#api-panel").on("hidden.bs.modal", function(e) {
        focusout();
    });
});
