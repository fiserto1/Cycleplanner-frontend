// data format: [[x1,y1],[x2,y2],[x3,y3],...]
function createChart(data, min, max) {
    $('#hChart').highcharts({
        chart: {
            type: 'area' //areaspline
        },
        title: {
            text: null
        },
        xAxis: {

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
        tooltip: {
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