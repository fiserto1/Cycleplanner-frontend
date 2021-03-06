/**
 * run web application after document ready
 * show smartbanner for mobile devices
 * main -> spinner -> translation -> sidebar -> map -> markers -> segments -> routing
 */
$(document).ready(function() {

    initializeSpinner();
    initializeTranslation();
    initializeSidebar();

    $.smartbanner({
        icon: "img/app-icon.png"
    });

    initializeMap();
    initializeMarkers();
    initializeSegments();
    initializeRouting();
});