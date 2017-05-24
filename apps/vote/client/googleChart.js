/* global google, poll  */

//make them globals so i can update them
var googleChartData;
var chart;
var googleChartOptions;
var googleLoaded = false;

google.charts.load( 'current', {
  packages: [ 'corechart' ]
} );

google.charts.setOnLoadCallback( function() {
  googleLoaded = true;
} );

function drawChart() {
  // Define the chart to be drawn.
  googleChartData = new google.visualization.DataTable();
  googleChartData.addColumn( 'string', 'Option' );
  googleChartData.addColumn( 'number', 'Votes' );
  var rows = [];
  for ( var i = 0; i < poll.options.length; i++ ) {
    rows.push( [ poll.options[ i ].label, poll.options[ i ].count ] );
  }
  googleChartData.addRows( rows );
  googleChartOptions = {
    'legend': {
      position: 'right',
      alignment: 'top'
    },
    'chartArea': {'left': 15, 'top': 15,'width': '100%', 'height': '100%'},
    'width': 300,
    'height': 220
  };
  // Instantiate and draw the chart.
  chart = new google.visualization.PieChart( document.getElementById( 'myPieChart' ) );
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
