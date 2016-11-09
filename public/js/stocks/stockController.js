/* global ajaxFunctions */

( function() {
  var path = window.location.hostname + window.location.pathname + '/socketserver';
  console.log( path );
  ajaxFunctions.ready( function() {
    var exampleSocket = new WebSocket( 'ws://' + path );

    document.querySelector( 'button' ).addEventListener( 'click', function() {
      exampleSocket.send( 'Sent from client! SEB' );
    } );

    exampleSocket.onmessage = function( event ) {
      console.log( event.data );
    }

  } );

} )();
