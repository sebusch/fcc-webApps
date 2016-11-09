/* global ajaxFunctions, updateChart, googleLoaded, drawChart, google */
var poll = {};
( function() {
  var apiUrl = '/api' + window.location.pathname
  var buttons;
  function updateVotes( data ) {
    poll = JSON.parse( data );
    updateChart( poll );
    for ( var i = 0; i < poll.options.length; i++ ) {
      document.querySelector( '#vote' + i ).innerHTML = poll.options[ i ].count;
    }
  }

  ajaxFunctions.ready( function() {

    ajaxFunctions.ajaxRequest( 'GET', apiUrl + '/orig', function( data ) {
      poll = JSON.parse( data );
      if ( googleLoaded ) {
        drawChart();
      } else {
        google.charts.setOnLoadCallback( drawChart );
      }
    } )

    buttons = document.querySelectorAll( '.btn-vote' );

    for ( var i = 0; i < buttons.length; ++i ) {
      buttons[ i ].addEventListener( 'click', function() {
        document.querySelector( '#voted-tag' ).setAttribute( 'style', 'display: visible' )
        ajaxFunctions.ajaxRequest( 'POST', apiUrl + '/' + this.id, updateVotes );
        for ( var j = 0; j < buttons.length; j++ ) {
          buttons[ j ].setAttribute( 'disabled', 'disabled' );
        }
      } );
    }

    var addOptionButton = document.querySelector( '#addOption' );
    if ( addOptionButton ) {

      addOptionButton.addEventListener( 'click', function() {
        var formEl = document.createElement( 'form' );
        formEl.setAttribute( 'method', 'post' );

        var inputEl = document.createElement( 'input' );
        inputEl.setAttribute( 'type', 'text' );
        inputEl.setAttribute( 'required', true );
        inputEl.setAttribute( 'autofocus', true );
        inputEl.setAttribute( 'placeholder', 'New option' );
        inputEl.setAttribute( 'name', 'new' );

        var buttonSubmit = document.createElement( 'button' );
        buttonSubmit.setAttribute( 'class', 'btn btn-info' );
        buttonSubmit.setAttribute( 'type', 'submit' );
        buttonSubmit.innerHTML = 'Add option';

        var div = document.querySelector( '#addOptionDiv' );
        div.innerHTML = '';
        div.appendChild( formEl );
        formEl.appendChild( inputEl );
        formEl.appendChild( document.createElement( 'br' ) );
        formEl.appendChild( buttonSubmit );

      } );
    }

  } );

} )();
