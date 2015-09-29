
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

/*
data format: [[x1,y1],[x2,y2],[x3,y3],...]
dataType = speed/stress/power
var options = {
    data: [],
    routeIndex: 1,
    target: divElement,
    max: maxValue,
    min: minValue,
    dataType: (speed/stress/power),
    pointerColor: "#ff0000"
};
*/
function createChart(options) {
    var hChart = options.target.highcharts({
        chart: {
            type: 'line',
            borderRadius: 0,
            marginTop: 5,
            marginRight: 5,
            marginLeft: 5,
            marginBottom: 5
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
            //showFirstLabel: true,
            //showLastLabel: true,
            //tickPositions: [options.min, options.max],
            title: {
                text: null
            },
            labels: {
                enabled: false
            },
            tickWidth: 0,
            gridLineWidth: 0,
            lineWidth: 0,
            endOnTick: false,
            startOnTick: false,
            max: options.max,
            min: options.min
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
            data: options.data,
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
        }]
    });
}

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