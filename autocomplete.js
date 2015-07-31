/**
 * Created by Tomas on 21. 7. 2015.
 */

//var availableTags = [
//    { value: 'Anglicka 154', data: L.latLng(50.07697, 14.43226) },
//    { value: 'Parlerova 1235', data: L.latLng(50.08744, 14.38728) },
//];
$(document).ready(function() {
    setAC();
});

function setAC() {


    $(".whisper").autocomplete( {
        serviceUrl: "http://ec2-52-28-222-45.eu-central-1.compute.amazonaws.com:3100/suggest",
        paramName: "input",
        dataType: "jsonp",
        params: {
            lat: 50.08165,
            lon: 14.40505
        },
        transformResult: function(response) {
            return {
                suggestions: $.map(response.features, function(dataItem) {
                    return { value: dataItem.properties.text, data: dataItem.geometry.coordinates};
                })
            };
        },
        //lookup: availableTags,
        onSelect: function(suggestion) {
            //
            // DULEZITE
            // odpoved ze serveru ma prohozene LAT,LNG[leaflet] na LNG,LAT[odpoved]
            //
            console.log(suggestion);
            //console.log($(this).parent().index());
            var markerIndex = $(this).parent().index();
            L.marker(suggestion.data, {
                icon: startIcon,
                draggable:true
            }).addTo(map);
            allMarkers[markerIndex].setLatLng(L.latLng(suggestion.data[1],suggestion.data[0])).addTo(map);
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
};



function findGps(element) {
    console.log(element.value);
}