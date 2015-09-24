
var segmentLine;
var segmentLineBorder;
var segmentLineShadow;

var SPEED_ZONES = [{
    value: SPEED_LIMIT_LVL_1,
    color: SPEED_COLOR_LVL_1
}, {
    value: SPEED_LIMIT_LVL_2,
    color: SPEED_COLOR_LVL_2
}, {
    value: SPEED_LIMIT_LVL_3,
    color: SPEED_COLOR_LVL_3
}, {
    value: SPEED_LIMIT_LVL_4,
    color: SPEED_COLOR_LVL_4
}, {
    color: SPEED_COLOR_LVL_5
}];

var STRESS_ZONES = [{
    value: STRESS_LIMIT_LVL_1,
    color: STRESS_COLOR_LVL_1
}, {
    value: STRESS_LIMIT_LVL_2,
    color: STRESS_COLOR_LVL_2
}, {
    value: STRESS_LIMIT_LVL_3,
    color: STRESS_COLOR_LVL_3
}, {
    value: STRESS_LIMIT_LVL_4,
    color: STRESS_COLOR_LVL_4
}, {
    color: STRESS_COLOR_LVL_5
}];

var POWER_ZONES = [{
    value: POWER_LIMIT_LVL_1,
    color: POWER_COLOR_LVL_1
}, {
    value: POWER_LIMIT_LVL_2,
    color: POWER_COLOR_LVL_2
}, {
    value: POWER_LIMIT_LVL_3,
    color: POWER_COLOR_LVL_3
}, {
    value: POWER_LIMIT_LVL_4,
    color: POWER_COLOR_LVL_4
}, {
    color: POWER_COLOR_LVL_5
}];

//data format: [[x1,y1],[x2,y2],[x3,y3],...]
//dataType = speed/stress/power
//var options = {
//    data: [],
//    routeIndex: 1,
//    targetDiv: div,
//    max: maxValue,
//    min: minValue,
//    dataType: (speed/stress/power)
//};
function createChart(options) {
    var hChart = options.target.highcharts({
        chart: {
            //height: 50,
            type: 'line',//areaspline
            borderRadius: 0,
            marginTop: 5,
            marginRight: 5,
            marginLeft: 5,
            marginBottom: 5
            //spacingBottom: 0,
            //spacingTop: 0,
            //spacingLeft: 0,
            //spacingRight: 0,
            //events: {
            //    load: function() {
            //        this.redraw()
            //        $(window).resize();
            //    }
            //}
        },
        title: {
            text: null
        },
        xAxis: {
            tickWidth: 0,
            maxPadding: 0,
            minPadding: 0,
            allowDecimals: true,
            gridLineWidth: 0,
            lineWidth: 0,
            labels: {
                enabled: false,
                formatter: function () {
                    return this.value/1000 + ' km';
                }
            }
        },
        yAxis: {

            //tickPositions: [chartOptionsAndData.min, chartOptionsAndData.max],
            title: {
                text: null
            },
            //showFirstLabel: true,
            //showLastLabel: true,
            labels: {
                enabled: false
                //align: "right",
                //x: -12,
                //y: 5,

            },
            tickWidth: 0,
            //tickPosition: "inside",
            //opposite: true,
            gridLineWidth: 0,
            lineWidth: 0,
            endOnTick: false,
            startOnTick: false,
            max: options.max,
            min: options.min
            //labels: {
            //    formatter: function () {
            //        return this.value + ' m';
            //    }
            //}
        },
        credits: {
            enabled: false
        },
        tooltip: {
            enabled: false,
            crosshairs: [{
                dashStyle: 'dash'
            }, {
                dashStyle: "dash"
            }]
        },
        legend: {
            enabled: false
        },
        plotOptions: {
            //area: {
            //    //pointStart: 0,
            //    marker: {
            //        enabled: false,
            //        symbol: 'circle',
            //        radius: 2,
            //        states: {
            //            hover: {
            //                enabled: true
            //            }
            //        }
            //    }
            //},
            series: {
                marker: {
                    radius: 2,
                    lineWidth: 1,
                    fillColor: options.pointerColor
                }
            }
        },
        series: [{
            lineWidth: 2,
            animation: false,
            //name: 'Trasa',
            data: options.data,
            //zoneAxis: "x",
            zones: options.zones,
            point: {
                events: {
                    mouseOver: function (e) {
                        var chartValueIndex = e.target.index;
                        var planSteps = response.plans[options.routeIndex].steps;
                        var coord = planSteps[chartValueIndex].coordinate;
                        var latLng = L.latLng(coord.latE6/1000000,coord.lonE6/1000000);
                        var nextCoord = planSteps[chartValueIndex + 1].coordinate;
                        var nextLatLng = L.latLng(nextCoord.latE6/1000000,nextCoord.lonE6/1000000);
                        var segmentLineOptions;
                        var segmentLineBorderOptions;
                        var segmentLineShadowOptions;
                        var popupOptions = {autoPan: false, closeButton: false};
                        var popupString = "";
                        //segmentLine.bringToBack();

                        switch (options.dataType) {
                            case SPEED_SEGMENTS:
                                segmentLineOptions = {
                                    color: SPEED_COLOR_LVL_3,
                                    weight: 7,
                                    opacity: 1
                                };
                                segmentLineBorderOptions = {
                                    color: "white",
                                    weight: 10,
                                    opacity: 1
                                };
                                segmentLineShadowOptions = {
                                    color: SPEED_COLOR_LVL_3,
                                    weight: 17,
                                    opacity: 0.7
                                };
                                popupString = "Speed: " + this.y.toFixed(1) + " km/h";
                                break;
                            case STRESS_SEGMENTS:
                                segmentLineOptions = {
                                    color: STRESS_COLOR_LVL_3,
                                    weight: 7,
                                    opacity: 1
                                };
                                segmentLineBorderOptions = {
                                    color: "white",
                                    weight: 10,
                                    opacity: 1
                                };
                                segmentLineShadowOptions = {
                                    color: STRESS_COLOR_LVL_3,
                                    weight: 17,
                                    opacity: 0.7
                                };
                                popupString = "Stress: " + this.y + " SU";
                                break;
                            case POWER_SEGMENTS:
                                segmentLineOptions = {
                                    color: POWER_COLOR_LVL_3,
                                    weight: 7,
                                    opacity: 1
                                };
                                segmentLineBorderOptions = {
                                    color: "white",
                                    weight: 10,
                                    opacity: 1
                                };
                                segmentLineShadowOptions = {
                                    color: POWER_COLOR_LVL_3,
                                    weight: 17,
                                    opacity: 0.7
                                };
                                popupString = "Power: " + this.y.toFixed(1) + " W";
                                break;
                        }
                        segmentLine = L.polyline([latLng,nextLatLng], segmentLineOptions);
                        segmentLineBorder = L.polyline([latLng,nextLatLng], segmentLineBorderOptions);
                        segmentLineShadow = L.polyline([latLng,nextLatLng], segmentLineShadowOptions);

                        segmentLineShadow.addTo(map);
                        segmentLineBorder.addTo(map);
                        segmentLine.addTo(map);
                        segmentLine.bindPopup(popupString, popupOptions).openPopup();
                    },
                    mouseOut: function () {
                        map.removeLayer(segmentLine);
                        map.removeLayer(segmentLineBorder);
                        map.removeLayer(segmentLineShadow);
                    }
                }
            }
            //fillColor : {
            //    linearGradient : {
            //        x1: 0,
            //        y1: 0,
            //        x2: 0,
            //        y2: 1
            //    },
            //    stops : [
            //        [0, Highcharts.getOptions().colors[0]],
            //        [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
            //    ]
            //}
        }]
    });
};

function createSpeedChart(routeIndex) {
    var chartDivId = "#duration-chart-" + routeIndex;
    var options = {
        target: $(chartDivId),
        data: allChartOptions.speed.data[routeIndex],
        max: allChartOptions.speed.max,
        min: allChartOptions.speed.min,
        routeIndex: routeIndex,
        dataType: SPEED_SEGMENTS,
        pointerColor: SPEED_COLOR_LVL_3,
        zones: SPEED_ZONES
    };
    createChart(options);
}

function createStressChart(routeIndex) {
    var chartDivId = "#stress-chart-" + routeIndex;
    var options = {
        target: $(chartDivId),
        data: allChartOptions.stress.data[routeIndex],
        max: allChartOptions.stress.max + 2,
        min: allChartOptions.stress.min - 1,
        routeIndex: routeIndex,
        dataType: STRESS_SEGMENTS,
        pointerColor: STRESS_COLOR_LVL_3,
        zones: STRESS_ZONES
    };
    createChart(options);
}

function createPowerChart(routeIndex) {
    var chartDivId = "#effort-chart-" + routeIndex;
    var options = {
        target: $(chartDivId),
        data: allChartOptions.power.data[routeIndex],
        max: allChartOptions.power.max,
        min: allChartOptions.power.min,
        routeIndex: routeIndex,
        dataType: POWER_SEGMENTS,
        pointerColor: POWER_COLOR_LVL_3,
        zones: POWER_ZONES
    };
    createChart(options);
}