
var speedCircle = L.circleMarker(null,{
    fillColor: "#6BA448",
    color: "white",
    opacity: 1,
    fillOpacity: 1
}).setRadius(5);
var stressCircle = L.circleMarker(null,{
    fillColor: "#D34A45",
    color: "white",
    opacity: 1,
    fillOpacity: 1
}).setRadius(5);
var powerCircle = L.circleMarker(null,{
    fillColor: "#2A98FF",
    color: "white",
    opacity: 1,
    fillOpacity: 1
}).setRadius(5);


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
        series: [{
            lineWidth: 2,
            //color: '#6BA448',
            animation: false,
            //name: 'Trasa',
            data: options.data,
            //zoneAxis: "x",
            zones: options.zones,
            point: {
                events: {
                    mouseOver: function () {
                        switch (options.dataType) {
                            case SPEED_SEGMENTS:
                                speedCircle.setLatLng(basicRoutes.getLayers()[options.routeIndex].getLatLngs()[this.index]);
                                speedCircle.addTo(map);
                                speedCircle.bindPopup("Speed: " + this.y.toFixed(1) + " km/h").openPopup();
                                break;
                            case STRESS_SEGMENTS:
                                stressCircle.setLatLng(basicRoutes.getLayers()[options.routeIndex].getLatLngs()[this.index]);
                                stressCircle.addTo(map);
                                stressCircle.bindPopup("Stress: " + this.y + " SU").openPopup();
                                break;
                            case POWER_SEGMENTS:
                                powerCircle.setLatLng(basicRoutes.getLayers()[options.routeIndex].getLatLngs()[this.index]);
                                powerCircle.addTo(map);
                                powerCircle.bindPopup("Power: " + this.y.toFixed(1) + " W").openPopup();
                                break;
                        }



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
                        switch (options.dataType) {
                            case SPEED_SEGMENTS:
                                map.removeLayer(speedCircle);
                                break;
                            case STRESS_SEGMENTS:
                                map.removeLayer(stressCircle);
                                break;
                            case POWER_SEGMENTS:
                                map.removeLayer(powerCircle);
                                break;
                        }
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
        zones: POWER_ZONES
    };
    createChart(options);
}

//function createDurationChart(data, routeIndex, target, max, min) {
//    var hChart = target.highcharts({
//        chart: {
//            //height: 50,
//            type: 'line',//areaspline
//            borderRadius: 0,
//            marginTop: 5,
//            marginRight: 5,
//            marginLeft: 5,
//            marginBottom: 5
//            //spacingBottom: 0,
//            //spacingTop: 0,
//            //spacingLeft: 0,
//            //spacingRight: 0,
//            //events: {
//            //    load: function() {
//            //        this.redraw()
//            //        $(window).resize();
//            //    }
//            //}
//        },
//        title: {
//            text: null
//        },
//        xAxis: {
//            tickWidth: 0,
//            maxPadding: 0,
//            minPadding: 0,
//            allowDecimals: true,
//            gridLineWidth: 0,
//            lineWidth: 0,
//            labels: {
//                enabled: false,
//                formatter: function () {
//                    return this.value/1000 + ' km';
//                }
//            }
//        },
//        yAxis: {
//
//            //tickPositions: [chartOptionsAndData.min, chartOptionsAndData.max],
//            title: {
//                text: null
//            },
//            //showFirstLabel: true,
//            //showLastLabel: true,
//            labels: {
//                enabled: false,
//                //align: "right",
//                //x: -12,
//                //y: 5,
//
//            },
//            tickWidth: 0,
//            //tickPosition: "inside",
//            //opposite: true,
//            gridLineWidth: 0,
//            lineWidth: 0,
//            endOnTick: false,
//            startOnTick: false,
//            max: max+5,
//            min: min
//            //labels: {
//            //    formatter: function () {
//            //        return this.value + ' m';
//            //    }
//            //}
//        },
//        credits: {
//            enabled: false
//        },
//        tooltip: {
//            enabled: false,
//            crosshairs: [{
//                dashStyle: 'dash'
//            }, {
//               dashStyle: "dash"
//            }]
//        },
//        legend: {
//            enabled: false
//        },
//        plotOptions: {
//            area: {
//                //pointStart: 0,
//                marker: {
//                    enabled: false,
//                    symbol: 'circle',
//                    radius: 2,
//                    states: {
//                        hover: {
//                            enabled: true
//                        }
//                    }
//                }
//            }
//        },
//        series: [{
//            lineWidth: 2,
//            color: '#6BA448',
//            animation: false,
//            //name: 'Trasa',
//            data: data,
//            //zoneAxis: "x",
//            zones: [{
//                value: SPEED_LIMIT_LVL_1, //5
//                color: SPEED_COLOR_LVL_1
//            }, {
//                value: SPEED_LIMIT_LVL_2,
//                color: SPEED_COLOR_LVL_2
//            }, {
//                value: SPEED_LIMIT_LVL_3,
//                color: SPEED_COLOR_LVL_3
//            }, {
//                value: SPEED_LIMIT_LVL_4,
//                color: SPEED_COLOR_LVL_4
//            }, {
//                color: SPEED_COLOR_LVL_5
//            }],
//            point: {
//                events: {
//                    mouseOver: function () {
//                        speedCircle.setLatLng(basicRoutes.getLayers()[routeIndex].getLatLngs()[this.index]);
//                        speedCircle.addTo(map);
//                        speedCircle.bindPopup("Speed: " + this.y.toFixed(1) + " km/h").openPopup();
//                        //elevationP(map);
//                        //var chart = this.series.chart;
//                        //if (!chart.lbl) {
//                        //    chart.lbl = chart.renderer.label('')
//                        //        .attr({
//                        //            padding: 10,
//                        //            r: 10,
//                        //            fill: Highcharts.getOptions().colors[1]
//                        //        })
//                        //        .css({
//                        //            color: '#FFFFFF'
//                        //        })
//                        //        .add();
//                        //}
//                        //chart.lbl
//                        //    .show()
//                        //    .attr({
//                        //        text: 'x: ' + this.x + ', y: ' + this.y
//                        //    });
//                    },
//                    mouseOut: function () {
//                        map.removeLayer(speedCircle);
//                    }
//                }
//            }
//            //fillColor : {
//            //    linearGradient : {
//            //        x1: 0,
//            //        y1: 0,
//            //        x2: 0,
//            //        y2: 1
//            //    },
//            //    stops : [
//            //        [0, Highcharts.getOptions().colors[0]],
//            //        [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
//            //    ]
//            //}
//        }]
//    });
//};
//
//
//function createStressChart(data, routeIndex, target, max, min) {
//    var hChart = target.highcharts({
//        chart: {
//            //height: 50,
//            type: 'line',//areaspline
//            borderRadius: 0,
//            marginTop: 5,
//            marginRight: 5,
//            marginLeft: 5,
//            marginBottom: 5
//            //spacingBottom: 0,
//            //spacingTop: 0,
//            //spacingLeft: 0,
//            //spacingRight: 0,
//            //events: {
//            //    load: function() {
//            //        this.redraw()
//            //        $(window).resize();
//            //    }
//            //}
//        },
//        title: {
//            text: null
//        },
//        xAxis: {
//            tickWidth: 0,
//            maxPadding: 0,
//            minPadding: 0,
//            allowDecimals: true,
//            gridLineWidth: 0,
//            lineWidth: 0,
//            labels: {
//                enabled: false,
//                formatter: function () {
//                    return this.value/1000 + ' km';
//                }
//            }
//        },
//        yAxis: {
//
//            //tickPositions: [chartOptionsAndData.min, chartOptionsAndData.max],
//            title: {
//                text: null
//            },
//            //showFirstLabel: true,
//            //showLastLabel: true,
//            labels: {
//                enabled: false
//                //align: "right",
//                //x: -12,
//                //y: 5,
//
//            },
//            tickWidth: 0,
//            //tickPosition: "inside",
//            //opposite: true,
//            gridLineWidth: 0,
//            lineWidth: 0,
//            endOnTick: false,
//            startOnTick: false,
//            max: max + 2,
//            min: min - 1
//            //labels: {
//            //    formatter: function () {
//            //        return this.value + ' m';
//            //    }
//            //}
//        },
//        credits: {
//            enabled: false
//        },
//        tooltip: {
//            enabled: false,
//            crosshairs: [{
//                dashStyle: 'dash'
//            }, {
//                dashStyle: "dash"
//            }]
//        },
//        legend: {
//            enabled: false
//        },
//        plotOptions: {
//            area: {
//                //pointStart: 0,
//                marker: {
//                    enabled: false,
//                    symbol: 'circle',
//                    radius: 2,
//                    states: {
//                        hover: {
//                            enabled: true
//                        }
//                    }
//                }
//            }
//        },
//        series: [{
//            lineWidth: 2,
//            color: '#D34A45',
//            animation: false,
//            //name: 'Trasa',
//            data: data,
//            //zoneAxis: "x",
//            zones: [{
//                value: STRESS_LIMIT_LVL_1,
//                color: STRESS_COLOR_LVL_1
//            }, {
//                value: STRESS_LIMIT_LVL_2,
//                color: STRESS_COLOR_LVL_2
//            }, {
//                value: STRESS_LIMIT_LVL_3,
//                color: STRESS_COLOR_LVL_3
//            }, {
//                value: STRESS_LIMIT_LVL_4,
//                color: STRESS_COLOR_LVL_4
//            }, {
//                color: STRESS_COLOR_LVL_5
//            }],
//            point: {
//                events: {
//                    mouseOver: function () {
//                        stressCircle.setLatLng(basicRoutes.getLayers()[routeIndex].getLatLngs()[this.index]);
//                        stressCircle.addTo(map);
//                        stressCircle.bindPopup("Stress: " + this.y + " SU").openPopup();
//                        //elevationP(map);
//                        //var chart = this.series.chart;
//                        //if (!chart.lbl) {
//                        //    chart.lbl = chart.renderer.label('')
//                        //        .attr({
//                        //            padding: 10,
//                        //            r: 10,
//                        //            fill: Highcharts.getOptions().colors[1]
//                        //        })
//                        //        .css({
//                        //            color: '#FFFFFF'
//                        //        })
//                        //        .add();
//                        //}
//                        //chart.lbl
//                        //    .show()
//                        //    .attr({
//                        //        text: 'x: ' + this.x + ', y: ' + this.y
//                        //    });
//                    },
//                    mouseOut: function () {
//                        map.removeLayer(stressCircle);
//                    }
//                }
//            }
//            //fillColor : {
//            //    linearGradient : {
//            //        x1: 0,
//            //        y1: 0,
//            //        x2: 0,
//            //        y2: 1
//            //    },
//            //    stops : [
//            //        [0, Highcharts.getOptions().colors[0]],
//            //        [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
//            //    ]
//            //}
//        }]
//    });
//};
//
//
//function createEffortChart(data, routeIndex, target, max, min) {
//    var hChart = target.highcharts({
//        chart: {
//            //height: 50,
//            type: 'line',//areaspline
//            borderRadius: 0,
//            marginTop: 5,
//            marginRight: 5,
//            marginLeft: 5,
//            marginBottom: 5
//            //spacingBottom: 0,
//            //spacingTop: 0,
//            //spacingLeft: 0,
//            //spacingRight: 0,
//            //events: {
//            //    load: function() {
//            //        this.redraw()
//            //        $(window).resize();
//            //    }
//            //}
//        },
//        title: {
//            text: null
//        },
//        xAxis: {
//            tickWidth: 0,
//            maxPadding: 0,
//            minPadding: 0,
//            allowDecimals: true,
//            gridLineWidth: 0,
//            lineWidth: 0,
//            labels: {
//                enabled: false,
//                formatter: function () {
//                    return this.value/1000 + ' km';
//                }
//            }
//        },
//        yAxis: {
//
//            //tickPositions: [chartOptionsAndData.min, chartOptionsAndData.max],
//            title: {
//                text: null
//            },
//            //showFirstLabel: true,
//            //showLastLabel: true,
//            labels: {
//                enabled: false
//                //align: "right",
//                //x: -12,
//                //y: 5,
//
//            },
//            tickWidth: 0,
//            //tickPosition: "inside",
//            //opposite: true,
//            gridLineWidth: 0,
//            lineWidth: 0,
//            endOnTick: false,
//            startOnTick: false,
//            max: max,
//            min: min
//            //labels: {
//            //    formatter: function () {
//            //        return this.value + ' m';
//            //    }
//            //}
//        },
//        credits: {
//            enabled: false
//        },
//        tooltip: {
//            enabled: false,
//            crosshairs: [{
//                dashStyle: 'dash'
//            }, {
//                dashStyle: "dash"
//            }]
//        },
//        legend: {
//            enabled: false
//        },
//        plotOptions: {
//            area: {
//                //pointStart: 0,
//                marker: {
//                    enabled: false,
//                    symbol: 'circle',
//                    radius: 2,
//                    states: {
//                        hover: {
//                            enabled: true
//                        }
//                    }
//                }
//            }
//        },
//        series: [{
//            lineWidth: 2,
//            animation: false,
//            //name: 'Trasa',
//            data: data,
//            //zoneAxis: "x",
//            zones: [{
//                value: POWER_LIMIT_LVL_1,
//                color: POWER_COLOR_LVL_1
//            }, {
//                value: POWER_LIMIT_LVL_2,
//                color: POWER_COLOR_LVL_2
//            }, {
//                value: POWER_LIMIT_LVL_3,
//                color: POWER_COLOR_LVL_3
//            }, {
//                value: POWER_LIMIT_LVL_4,
//                color: POWER_COLOR_LVL_4
//            }, {
//                color: POWER_COLOR_LVL_5
//            }],
//            point: {
//                events: {
//                    mouseOver: function () {
//                        powerCircle.setLatLng(basicRoutes.getLayers()[routeIndex].getLatLngs()[this.index]);
//                        powerCircle.addTo(map);
//                        powerCircle.bindPopup("Power: " + this.y.toFixed(1) + " W").openPopup();
//                        //elevationP(map);
//                        //var chart = this.series.chart;
//                        //if (!chart.lbl) {
//                        //    chart.lbl = chart.renderer.label('')
//                        //        .attr({
//                        //            padding: 10,
//                        //            r: 10,
//                        //            fill: Highcharts.getOptions().colors[1]
//                        //        })
//                        //        .css({
//                        //            color: '#FFFFFF'
//                        //        })
//                        //        .add();
//                        //}
//                        //chart.lbl
//                        //    .show()
//                        //    .attr({
//                        //        text: 'x: ' + this.x + ', y: ' + this.y
//                        //    });
//                    },
//                    mouseOut: function () {
//                        map.removeLayer(powerCircle);
//                    }
//                }
//            }
//            //fillColor : {
//            //    linearGradient : {
//            //        x1: 0,
//            //        y1: 0,
//            //        x2: 0,
//            //        y2: 1
//            //    },
//            //    stops : [
//            //        [0, Highcharts.getOptions().colors[0]],
//            //        [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
//            //    ]
//            //}
//        }]
//    });
//};