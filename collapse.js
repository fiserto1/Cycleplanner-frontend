/**
 * Created by Tomas on 21. 7. 2015.
 */
$(document).ready(function(){
    $("#settings-panel").on("hide.bs.collapse", function(){
        $("#settingsIcon").css("color", "#333333");
    });
    $("#settings-panel").on("show.bs.collapse", function(){
        $("#settingsIcon").css("color", "deepskyblue");
    });
});