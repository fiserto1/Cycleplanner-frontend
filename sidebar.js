
function initializeSidebar() {
    var menuModal = $(".menu-modal");
    menuModal.on("hidden.bs.modal", function() {
        $("#menu-panel").css("opacity", "1");
        focusout();
    });
    menuModal.on("show.bs.modal", function() {
        $("#menu-panel").css("opacity", "0.8");
    });

    var languageDropdown = $("#language-dropdown");
    languageDropdown.on("show.bs.collapse", function(){
        var dropdownIcon = $("#language-dropdown-icon");
        dropdownIcon.removeClass("fa-chevron-left");
        dropdownIcon.addClass("fa-chevron-down");
    });
    languageDropdown.on("hide.bs.collapse", function(){
        var dropdownIcon = $("#language-dropdown-icon");
        dropdownIcon.removeClass("fa-chevron-down");
        dropdownIcon.addClass("fa-chevron-left");
    });
}
