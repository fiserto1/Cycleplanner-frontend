// data format: [[x1,y1],[x2,y2],[x3,y3],...]
//$(document).ready(function() {
var elevationCircle = L.circleMarker(null,{
    fillColor: "#2A98FF",
    color: "white",
    opacity: 1,
    fillOpacity: 1
}).setRadius(5);
//});

function createChart(data, min, max) {
    var hChart = $('#hChart').highcharts({
        chart: {
            //width: 200,
            height: 100,
            type: 'area',//areaspline
            borderRadius: 2,
            marginTop: 0,
            marginRight: 0,
            marginLeft: 0,
            marginBottom: 0,
            //spacingBottom: 0,
            //spacingTop: 0,
            //spacingLeft: 0,
            //spacingRight: 0,
        },
        title: {
            text: null
        },
        xAxis: {
            maxPadding: 0,
            minPadding: 0,
            allowDecimals: false,
            //labels: {
            //    formatter: function () {
            //        return this.value; // clean, unformatted number for year
            //    }
            //}
        },
        yAxis: {
            title: {
                text: null
            },
            //labels: {
            //    align: "left",
            //    x: 10,
            //    y: 5,
            //
            //},
            //tickWidth: 1,
            //tickPosition: "inside",
            //opposite: true,
            gridLineWidth: 0,
            endOnTick: false,
            startOnTick: false,
            max: max+20,
            min: min-20,
            //labels: {
            //    formatter: function () {
            //        return this.value ;
            //    }
            //}
        },
        credits: {
            enabled: false
        },
        tooltip: {
            enabled: false
        },
        legend: {
            enabled: false
        },
        plotOptions: {
            area: {
                //pointStart: 0,
                marker: {
                    enabled: false,
                    symbol: 'circle',
                    radius: 2,
                    states: {
                        hover: {
                            enabled: true
                        }
                    }
                }
            }
        },
        series: [

            {
            //name: 'Trasa',
            data: data,
            zoneAxis: "x",
            //TODO obarvit zony v grafu stejne jako segmenty
            //zones: [{
            //    value: 500,
            //    color: '#f7a35c'
            //}, {
            //    value: 1500,
            //    color: '#7cb5ec'
            //}, {
            //    color: '#90ed7d'
            //}],
            point: {
                events: {
                    mouseOver: function () {
                        //console.log(this.index);
                        elevationCircle.setLatLng(basicRoutes.getLayers()[segColoredClickedRouteIndex].getLatLngs()[this.index]).addTo(map);
                        elevationCircle.bindPopup("Výška: " + this.y + " m.n.m.").openPopup();
                        //elevationP(map);
                        //var chart = this.series.chart;
                        //if (!chart.lbl) {
                        //    chart.lbl = chart.renderer.label('')
                        //        .attr({
                        //            padding: 10,
                        //            r: 10,
                        //            fill: Highcharts.getOptions().colors[1]
                        //        })
                        //        .css({
                        //            color: '#FFFFFF'
                        //        })
                        //        .add();
                        //}
                        //chart.lbl
                        //    .show()
                        //    .attr({
                        //        text: 'x: ' + this.x + ', y: ' + this.y
                        //    });
                    },
                    mouseOut: function () {
                        map.removeLayer(elevationCircle);
                    }
                }
            },
            fillColor : {
                linearGradient : {
                    x1: 0,
                    y1: 0,
                    x2: 0,
                    y2: 1
                },
                stops : [
                    [0, Highcharts.getOptions().colors[0]],
                    [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                ]
            }
        }]
    });
};