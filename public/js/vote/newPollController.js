/* global ajaxFunctions */

( function() {
  ajaxFunctions.ready( function() {

    var addButton = document.querySelector( '#addOption' );
    var formList = document.querySelector( '.form-group#optionGroup' );

    addButton.addEventListener( 'click', function() {

      var formEntry = document.createElement( 'input' );
      formEntry.setAttribute( 'class', 'form-control' );
      formEntry.setAttribute( 'type', 'text' );
      formEntry.setAttribute( 'placeholder', 'Option' );
      formEntry.setAttribute( 'name', 'option' );


      console.log('click')
      formList.appendChild( formEntry )
    } );
  } );

} )();
