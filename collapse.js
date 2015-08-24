/**
 * Created by Tomas on 21. 7. 2015.
 */
$(document).ready(function(){
    $("#settings-panel").on("show.bs.collapse", function(){
        $("#settings-icon").css("color", "deepskyblue");
    });
    $("#settings-panel").on("hide.bs.collapse", function(){
        $("#settings-icon").css("color", "#333333");
    });

    $("#language-dropdown").on("show.bs.collapse", function(){
        $("#language-dropdown-icon").removeClass("fa-chevron-left");
        $("#language-dropdown-icon").addClass("fa-chevron-down");
    });
    $("#language-dropdown").on("hide.bs.collapse", function(){
        $("#language-dropdown-icon").removeClass("fa-chevron-down");
        $("#language-dropdown-icon").addClass("fa-chevron-left");
    });
});