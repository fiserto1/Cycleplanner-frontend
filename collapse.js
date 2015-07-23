/**
 * Created by Tomas on 21. 7. 2015.
 */
$(document).ready(function(){
    $("#settings").on("hide.bs.collapse", function(){
        $("#settingsIcon").css("color", "black");
    });
    $("#settings").on("show.bs.collapse", function(){
        $("#settingsIcon").css("color", "deepskyblue");
    });

    //$("#hideIcon").click(function() {
    //    $("#routes").toggle("fold");
    //});
});