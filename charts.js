/**
 * Created by Tomas on 4. 8. 2015.
 */
//var data = {
//    // A labels array that can contain any sort of values
//    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
//    // Our series array that contains series objects or in this case series data arrays
//    series: [
//        [5, 2, 4, 2, 0]
//    ]
//};
//
//// Create a new line chart object where as first parameter we pass in a selector
//// that is resolving to our chart container element. The Second parameter
//// is the actual data object.
//new Chartist.Line('.ct-chart', data);



var chart = new Chartist.Line('.ct-chart', {
    labels: [1, 2, 3, 4, 5, 6, 7, 8],
    series: [
        [5, 9, 7, 8, 5, 3, 5, 4]
    ]
}, {
    high: 300,
    low: 180,
    showArea: true,
    showPoint: false,
    axisX: {
        showLabel: false,
        showGrid: false,
    },
    axisY: {
        offset: 0,
        showLabel: false,
        showGrid: false,
    },
    chartPadding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    },
    //width: 300,
    height: 100
});

chart.on('draw', function(data) {
    if(data.type === 'line' || data.type === 'area') {
        data.element.animate({
            d: {
                begin: 2000 * data.index,
                dur: 2000,
                from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
                to: data.path.clone().stringify(),
                easing: Chartist.Svg.Easing.easeOutQuint
            }
        });
    }
});