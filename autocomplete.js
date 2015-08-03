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
        serviceUrl: "http://ec2-52-28-222-45.eu-central-1.compute.amazonaws.com:3100/suggest/nearby",
        paramName: "input",
        dataType: "jsonp",
        params: {
            lat: map.getCenter().lat,
            lon: map.getCenter().lng
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
            map.setView(L.latLng(suggestion.data[1],suggestion.data[0]));
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

function changeParams() {
    $(".whisper").autocomplete().setOptions({
        params: {
            lat: map.getCenter().lat,
            lon: map.getCenter().lng
        }
    })
}

function findGps(element) {
    console.log(element.value);
}