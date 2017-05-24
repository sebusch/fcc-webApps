/* global ajaxFunctions */

( function() {
  //var apiUrl = '/api' + window.location.pathname
  var apiUrl = window.location.pathname + 'api'
  var buttons;
  var id;
  function updateGoing( data ) {
    var dataJSON = JSON.parse( data )
    var numGoing;
    if ( dataJSON.length ) {
      numGoing = dataJSON[ 0 ].going.length;
    } else {
      numGoing = 0;
    }
    document.querySelector( '#num-' + id ).innerHTML = numGoing;
  }

  ajaxFunctions.ready( function() {

    buttons = document.querySelectorAll( '.btn-xs' );
    if ( buttons ) {
      for ( var i = 0; i < buttons.length; ++i ) {
        buttons[ i ].addEventListener( 'click', function() {
          var action
          id = this.id
          if ( this.classList.contains( 'add' ) ) {
            action = 'add';
            this.classList.remove( 'add' );
            this.classList.add( 'cancel' );
            this.classList.remove( 'btn-primary' )
            this.classList.add( 'btn-danger' )
            this.innerHTML = 'Cancel'
          } else {
            action = 'cancel';
            this.classList.remove( 'cancel' );
            this.classList.add( 'add' );
            this.classList.remove( 'btn-danger' )
            this.classList.add( 'btn-primary' )
            this.innerHTML = 'Add me'
          }
          ajaxFunctions.ajaxRequest( 'POST', apiUrl + '/' + action + '/' + this.id, updateGoing );
        } );
      }
    }
  } );

} )();
