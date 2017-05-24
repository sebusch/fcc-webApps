/* global ajaxFunctions, Highcharts */
var formHandler;
( function() {
  var path = window.location.host + window.location.pathname;
  var socket = new WebSocket( 'ws://' + path );
  var socketOpen = false;
  var seriesOptions = [];
  var chart;
  var stockList;
  var submitButton;
  var input;
  var message0 = { message: 'initial' };
  //client will receive data in this form:
  // [{
  //   action: "delete || error", (if missing, default to add)
  //   code: stock code,
  //   name: full name of company (only for add),
  //   data: data (or error message)
  // },{}...]

  // client will send 3 types of messages:
  // 1: initial
  // 2: add stockname
  // 3: remove stockname
  // {
  //   message: 'initial || add || remove',
  //   code: stockname (only for add/remove)
  // }

  socket.onmessage = function( event ) {
    try {
      removeError();
      submitButton.disabled = false;
      var data = JSON.parse( event.data );
      for ( var i = 0; i < data.length; i++ ) {
        if ( data[ i ].action == 'remove' ) {
          removeSeries( data[ i ].code );
        } else if ( data[ i ].action == 'error' ) {
          addError( data[ i ].message )
        } else {
          input.value = '';
          addSeries( data[ i ] );
        }
      }
    } catch ( e ) {
    }

  }

  socket.onopen = function() {
    socketOpen = true;
    if ( chart ) {
      socket.send( JSON.stringify( message0 ) )
    }
  }

  formHandler = function formHandler( form ) {
    if ( !socketOpen ) {
      addError( 'Connection lost: refresh page' );
    } else {
      submitButton.disabled = true;
      removeError();
      var entry = form.newStock.value.toUpperCase();
      var invalid = !entry.match( /^[0-9a-zA-Z]+$/ );
      if ( invalid ) {
        addError( 'Invalid stock code' );
        submitButton.disabled = false;
      } else {
        var match = false;
        for ( var i = 0; i < chart.series.length; i++ ) {
          if ( chart.series[ i ].name == entry ) {
            match = true;
          }
        }
        if ( match ) {
          addError( 'Stock already plotted' )
          submitButton.disabled = false;
        } else {
          socket.send( JSON.stringify( { message: 'add', code: entry } ) )
        }
      }
    }
  }

  ajaxFunctions.ready( function() {
    //define document element variables
    stockList = document.querySelector( '#stockList' );
    submitButton = document.querySelector( '#formSubmit' );
    input = document.querySelector( '#newStock' );
    createChart();
    if ( socketOpen ) {
      socket.send( JSON.stringify( message0 ) )
    }
  } );

  function addSeries( message ) {
    var match = false;
    for ( var i = 0; i < chart.series.length; i++ ) {
      if ( chart.series[ i ].name == message.code.toUpperCase() ) {
        match = true;
      }
    }
    if ( !match ) {
      addStockElement( message.code.toUpperCase(), message.name )
      chart.addSeries( {
        name: message.code.toUpperCase(),
        data: message.data,
        showInNavigator: true
      } )
    }
  }

  function removeSeries( name ) {
    removeStockElement( name );
    for ( var i = 0; i < chart.series.length; i++ ) {
      if ( chart.series[ i ].name == name.toUpperCase() ) {
        chart.series[ i ].remove();
      }
    }
  }
  /**
   * Create the chart when all data is loaded
   * @returns {undefined}
   */
  function createChart() {
    chart = Highcharts.stockChart( 'myChart', {
      rangeSelector: {
        selected: 4
      },
      tooltip: {
        pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>',
        valueDecimals: 2,
        split: false
      },
      series: seriesOptions
    } );
  }

  function addStockElement( code, name ) {

    var el = document.createElement( 'div' );
    el.setAttribute( 'class', 'col-xs-3' );
    el.setAttribute( 'id', code );
    el.innerHTML = innerHTML( code, name )

    stockList.appendChild( el )
    document.getElementById( 'close-' + code ).addEventListener( 'click', function() {
      if ( socketOpen ) {
        socket.send( JSON.stringify( { message: 'remove', code: code } ) )
      } else {
        addError( 'Connection Lost: refresh page' );
      }
    } )

  }

  function addError( message ) {

    var el = document.querySelector( '#errorMessage' );
    if ( !el ) {
      el = document.createElement( 'p' );
      el.setAttribute( 'class', 'alert alert-danger' );
      el.setAttribute( 'id', 'errorMessage' );
    }
    el.innerHTML = message;

    document.querySelector( 'form' ).appendChild( el );
  }
  function removeError() {
    var el = document.querySelector( '#errorMessage' );
    if ( el ) {
      el.parentNode.removeChild( el );
    }
  }

  function removeStockElement( code ) {
    var element = document.getElementById( code );
    element.parentNode.removeChild( element );
  }

  function innerHTML( code, name ) {
    return '<div class="panel panel-default">' +
      '<div class = "panel-heading">' +
      '<button class = "close" id="close-' + code + '" type="button">&times;</button>' +
      '<h3 class = "panel-title">' + code + '</h3>' +
      '</div>' +
      '<div class = "panel-body">' + name + '</div>' +
      '</div>'
  }

} )();
