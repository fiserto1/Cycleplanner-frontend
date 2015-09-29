
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
                    return {
                        value: dataItem.properties.text,
                        data: dataItem.geometry.coordinates};
                })
            };
        },
        formatResult: function(suggestion, currentValue) {
            var p1 = map.getCenter(); //mozna pocitat od posledniho zadaneho bodu
            var p2 = L.latLng(suggestion.data[1], suggestion.data[0]);
            var distance = p1.distanceTo(p2)/1000;
            distance = distance.toFixed( distance < 1 ? 2 : 0 );
            var highlightedValue = "(" + currentValue.replace(RegExp("(\\/|\\.|\\*|\\+|\\?|\\||\\(|\\)|\\[|\\]|\\{|\\}|\\\\)", "g"), "\\$1") + ")";
            highlightedValue = suggestion.value.replace(RegExp(highlightedValue, "gi"), "<strong>$1</strong>")
            return highlightedValue + "<span class='autocomplete-distance'>" + distance + " km</span>";
        },
        onSelect: function(suggestion) {
            /*
            !!DULEZITE!!
            odpoved ze serveru ma prohozene LAT,LNG[leaflet] na LNG,LAT[odpoved]
            */
            var markerIndex = $(this).parent().index();
            var addressLatLon = L.latLng(suggestion.data[1],suggestion.data[0]);
            map.setView(addressLatLon);
            allMarkers[markerIndex].setLatLng(addressLatLon).addTo(map);
            getPlans();
        }
    });
}

function changeParams() {
    $(".whisper").autocomplete().setOptions({
        params: {
            lat: map.getCenter().lat,
            lon: map.getCenter().lng
        }
    })
}

function findAddressFromCoordinates(inputIndex, latLon) {
    $.ajax({
        url: "http://ec2-52-28-222-45.eu-central-1.compute.amazonaws.com:3100/reverse?lat=" + latLon.lat
        + "&lon=" + latLon.lng,
        success: function (data) {
            var lastClickedAddress = data.features[0].properties.text;
            $("#search-group").children().eq(inputIndex).find("input").val(lastClickedAddress);
        },
        error: function () {
            $("#search-group").children().eq(inputIndex).find("input").val(latLon);
        }
    });
}