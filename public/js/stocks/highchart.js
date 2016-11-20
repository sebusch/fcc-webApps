function prepareData( array ) {
  toDate( array );
  array.sort( function( a, b ) {
    return a[ 0 ] - b[ 0 ];
  } );
}

function toDate( array ) {
  if ( typeof array[ 0 ][ 0 ] == 'string' ) {
    for ( var i = 0; i < array.length; i++ ) {
      var temp = array[ i ][ 0 ].split( '-' );
      var newDate = new Date( temp[ 0 ], temp[ 1 ] - 1, temp[ 2 ] )
      array[ i ][ 0 ] = newDate.getTime()
    }
  }
}

$( function() {
  var seriesOptions = [],
    seriesCounter = 0,
    names = [ 'MSFT', 'AAPL', 'GOOG' ];

  /**
   * Create the chart when all data is loaded
   * @returns {undefined}
   */
  function createChart() {

    Highcharts.stockChart( 'myChart', {

      rangeSelector: {
        selected: 4
      },

      // yAxis: {
      //   labels: {
      //     formatter: function() {
      //       return ( this.value > 0 ? ' + ' : '' ) + this.value + '%';
      //     }
      //   },
      //   plotLines: [ {
      //     value: 0,
      //     width: 2,
      //     color: 'silver'
      //   } ]
      // },

      // plotOptions: {
      //   series: {
      //     compare: 'percent',
      //     showInNavigator: true
      //   }
      // },

      tooltip: {
       // pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
        pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>',
        valueDecimals: 2,
        split: false
      },

      series: seriesOptions
    } );
  }
  var stockData = {
    'data': [ [ '2016-11-08', 124.22 ], [ '2016-11-07', 122.15 ], [ '2016-11-04', 120.75 ], [ '2016-11-03', 120.0 ], [ '2016-11-02', 127.17 ], [ '2016-11-01', 129.5 ], [ '2016-10-31', 130.99 ], [ '2016-10-28', 131.31 ], [ '2016-10-27', 129.69 ], [ '2016-10-26', 131.04 ], [ '2016-10-25', 132.29 ], [ '2016-10-24', 133.28 ], [ '2016-10-21', 132.07 ], [ '2016-10-20', 130.0 ], [ '2016-10-19', 130.11 ], [ '2016-10-18', 128.57 ], [ '2016-10-17', 127.54 ], [ '2016-10-14', 127.91 ], [ '2016-10-13', 127.82 ], [ '2016-10-12', 129.05 ], [ '2016-10-11', 128.88 ], [ '2016-10-10', 130.24 ], [ '2016-10-07', 128.99 ], [ '2016-10-06', 128.74 ], [ '2016-10-05', 128.47 ], [ '2016-10-04', 128.18 ], [ '2016-10-03', 128.77 ], [ '2016-09-30', 128.27 ], [ '2016-09-29', 128.09 ], [ '2016-09-28', 129.23 ], [ '2016-09-27', 128.69 ], [ '2016-09-26', 127.31 ], [ '2016-09-23', 127.96 ], [ '2016-09-22', 130.08 ], [ '2016-09-21', 129.94 ], [ '2016-09-20', 128.64 ], [ '2016-09-19', 128.65 ], [ '2016-09-16', 129.07 ], [ '2016-09-15', 128.35 ], [ '2016-09-14', 127.77 ], [ '2016-09-13', 127.21 ], [ '2016-09-12', 128.69 ] ]
  }

  toDate( stockData.data )
  stockData.data.sort( function( a, b ) {
    return a[ 0 ] - b[ 0 ];
  } );
  seriesOptions[ 0 ] = {
    name: 'FB',
    data: stockData.data
  }
  createChart();
  // $.each( names, function( i, name ) {

  //   $.getJSON( 'https://www.highcharts.com/samples/data/jsonp.php?filename=' + name.toLowerCase() + '-c.json&callback=?', function( data ) {

  //     seriesOptions[ i ] = {
  //       name: name,
  //       data: data
  //     };

  //     // As we're loading the data asynchronously, we don't know what order it will arrive. So
  //     // we keep a counter and create the chart when all the data is loaded.
  //     seriesCounter += 1;

//     if ( seriesCounter === names.length ) {
//       createChart();
//     }
//   } );
// } );
} );
