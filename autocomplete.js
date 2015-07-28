/**
 * Created by Tomas on 21. 7. 2015.
 */

var availableTags = [
    { value: 'Anglicka 154', data: L.latLng(50.07697, 14.43226) },
    { value: 'Parlerova 1235', data: L.latLng(50.08744, 14.38728) },
];

$(function() {


    $(".whisper").autocomplete( {
        lookup: availableTags,
        onSelect: function(suggestion) {
            console.log($(this).parent().index());
            var markerIndex = $(this).parent().index();
            allMarkers[markerIndex].setLatLng(suggestion.data).addTo(map);
            getPlans();
        }
    });
    //
    //$(".search-destination" ).autocomplete({
    //    lookup: availableTags,
    //    onSelect: function(suggestion) {
    //        destinationMarker.setLatLng(suggestion.data).addTo(map);
    //        getPlans();
    //    }
    //});
});

function findGps(element) {
    console.log(element.value);
}