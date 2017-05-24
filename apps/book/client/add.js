/* global ajaxFunctions */
var formHandler;
( function() {
  var apiUrl = '/' + window.location.pathname.split( '/' )[ 1 ] + '/api';
  //dom element variables
  var resultsEl;

  formHandler = function( form ) {
    // var queryString = '?q= +intitle:' + form.query.value +
    //   '+inauthor:' + form.author.value;
    form.query.blur();
    var queryString = '?q=' + form.query.value +
      '&search[field]=all';
    resultsEl.innerHTML = '';
    ajaxFunctions.ajaxRequest( 'GET', apiUrl + '/search' + queryString, function( data ) {
      var resObject = JSON.parse( data );
      if ( resObject.error ) {
        errorEl( 'Error searching' )
      } else {
        appendResults( resObject );
      }
    } )


  }


  ajaxFunctions.ready( function() {
    resultsEl = document.getElementById( 'results' );
  } );

  function errorEl( message ) {
    resultsEl.innerHTML = '';
    var el = document.querySelector( '#errorMessage' );
    if ( !el ) {
      el = document.createElement( 'p' );
      el.setAttribute( 'class', 'alert alert-danger' );
      el.setAttribute( 'id', 'errorMessage' );
    }
    el.innerHTML = message;
    resultsEl.appendChild( el );
  }
  function appendResults( data ) {
    for ( var i = 0; i < data.length; i++ ) {
      append( data[ i ] )
    }
  }
  function append( obj ) {
    var el = document.createElement( 'div' );
    el.setAttribute( 'class', 'panel panel-default' );
    //el.setAttribute( 'style', 'width: 300px; display: inline-block;' );
    el.setAttribute( 'id', obj.id );
    el.innerHTML = innerHTML( obj );

    resultsEl.appendChild( el )
  }

  function innerHTML( obj ) {
    var htmlStr = '<div class="panel-body">';
    htmlStr += '<div style="display: table-row;">';
    htmlStr += '<div style="display: table-cell;"><input type="checkbox" name="book" value=' + JSON.stringify( obj ) + '/></div>'
    if ( obj.cover ) {
      if ( obj.cover.smallThumbnail ) {
        htmlStr += '<img style="height: 100px; display: table-cell" src="' + obj.cover.smallThumbnail.split( '&edge=curl' ).join( '' ) + '"/>';
      }
    }
    htmlStr += '<div style="display: table-cell; vertical-align: top; padding-left: 10px">'
    htmlStr += '<h3 style="margin-top: 0px">' + obj.title;
    if ( obj.subtitle ) {
      htmlStr += '<br/><small>' + obj.subtitle + '</small>';
    }
    htmlStr += '</h3>'
    if ( obj.authors ) {
      htmlStr += '<p>By: ' + obj.authors.join( ', ' ) + '</p>';
    }
    htmlStr += '</div></div></div>';
    return htmlStr
  }
// {
//   id: obj.id,
//   title: obj.title,
//   subtitle: obj.subtitle,
//   authors: obj.authors,
//   cover: obj.imageLinks,
//   description: obj.description
// }



} )();
