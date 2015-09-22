// data format: [[x1,y1],[x2,y2],[x3,y3],...]
//$(document).ready(function() {
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
//});

function createDurationChart(data, routeIndex, target, max, min) {
    var hChart = target.highcharts({
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
                enabled: false,
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
            max: max+5,
            min: min
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
            color: '#6BA448',
            animation: false,
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
                        speedCircle.setLatLng(basicRoutes.getLayers()[routeIndex].getLatLngs()[this.index]);
                        speedCircle.addTo(map);
                        speedCircle.bindPopup("Speed: " + this.y.toFixed(1) + " km/h").openPopup();
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
                        map.removeLayer(speedCircle);
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


function createStressChart(data, routeIndex, target, max, min) {
    var hChart = target.highcharts({
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
            max: max + 2,
            min: min - 1
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
            color: '#D34A45',
            animation: false,
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
                        stressCircle.setLatLng(basicRoutes.getLayers()[routeIndex].getLatLngs()[this.index]);
                        stressCircle.addTo(map);
                        stressCircle.bindPopup("Stress: " + this.y + " SU").openPopup();
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
                        map.removeLayer(stressCircle);
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


function createEffortChart(data, routeIndex, target, max, min) {
    var hChart = target.highcharts({
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
            max: max,
            min: min
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
            animation: false,
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
                        powerCircle.setLatLng(basicRoutes.getLayers()[routeIndex].getLatLngs()[this.index]);
                        powerCircle.addTo(map);
                        powerCircle.bindPopup("Power: " + this.y.toFixed(1) + " W").openPopup();
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
                        map.removeLayer(powerCircle);
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