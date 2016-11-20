/* global google  */

//make them globals so i can update them
var googleChartData;
var chart;
var googleChartOptions;
var googleLoaded = false;

var stockData = {
  'data': [ [ '2016-11-08', 124.22 ], [ '2016-11-07', 122.15 ], [ '2016-11-04', 120.75 ], [ '2016-11-03', 120.0 ], [ '2016-11-02', 127.17 ], [ '2016-11-01', 129.5 ], [ '2016-10-31', 130.99 ], [ '2016-10-28', 131.31 ], [ '2016-10-27', 129.69 ], [ '2016-10-26', 131.04 ], [ '2016-10-25', 132.29 ], [ '2016-10-24', 133.28 ], [ '2016-10-21', 132.07 ], [ '2016-10-20', 130.0 ], [ '2016-10-19', 130.11 ], [ '2016-10-18', 128.57 ], [ '2016-10-17', 127.54 ], [ '2016-10-14', 127.91 ], [ '2016-10-13', 127.82 ], [ '2016-10-12', 129.05 ], [ '2016-10-11', 128.88 ], [ '2016-10-10', 130.24 ], [ '2016-10-07', 128.99 ], [ '2016-10-06', 128.74 ], [ '2016-10-05', 128.47 ], [ '2016-10-04', 128.18 ], [ '2016-10-03', 128.77 ], [ '2016-09-30', 128.27 ], [ '2016-09-29', 128.09 ], [ '2016-09-28', 129.23 ], [ '2016-09-27', 128.69 ], [ '2016-09-26', 127.31 ], [ '2016-09-23', 127.96 ], [ '2016-09-22', 130.08 ], [ '2016-09-21', 129.94 ], [ '2016-09-20', 128.64 ], [ '2016-09-19', 128.65 ], [ '2016-09-16', 129.07 ], [ '2016-09-15', 128.35 ], [ '2016-09-14', 127.77 ], [ '2016-09-13', 127.21 ], [ '2016-09-12', 128.69 ] ]
}

function toDate( array ) {
  if ( typeof array[ 0 ][ 0 ] == 'string' ) {
    for ( var i = 0; i < array.length; i++ ) {
      var temp = array[ i ][ 0 ].split( '-' );
      array[ i ][ 0 ] = new Date( temp[ 0 ], temp[ 1 ] - 1, temp[ 2 ] )
    }
  }
}

google.charts.load( 'current', {
  packages: [ 'annotationchart' ]
} );

google.charts.setOnLoadCallback( function() {
  googleLoaded = true;
} );

function drawChart() {
  // Define the chart to be drawn.
  googleChartData = new google.visualization.DataTable();
  googleChartData.addColumn( 'date', 'Date' );
  googleChartData.addColumn( 'number', 'FB' );
  toDate( stockData.data );
  googleChartData.addRows( stockData.data );
  googleChartOptions = {
    legendPosition: 'newRow'
  }
  // googleChartOptions = {
  //   'legend': {
  //     position: 'right',
  //     alignment: 'top'
  //   },
  //   'chartArea': {
  //     'left': 15,
  //     'top': 15,
  //     'width': '100%',
  //     'height': '100%'
  //   },
  //   'width': 300,
  //   'height': 220
  // };
  // Instantiate and draw the chart.
  chart = new google.visualization.AnnotationChart( document.getElementById( 'myGoogleChart' ) );
  chart.draw( googleChartData, googleChartOptions );
}

function updateChart( newData ) {
  if ( googleChartData ) {
    googleChartData.removeRows( 0, googleChartData.getNumberOfRows() );
    var rows = [];
    for ( var i = 0; i < newData.options.length; i++ ) {
      rows.push( [ newData.options[ i ].label, newData.options[ i ].count ] );
    }
    googleChartData.addRows( rows );
    chart.draw( googleChartData, googleChartOptions );
  }
}
