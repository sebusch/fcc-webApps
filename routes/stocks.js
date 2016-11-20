/* eslint func-names: 0 */
var express = require( 'express' );
var router = express.Router();
var renderParams = require( '../models/text' ).stocks;
var https = require( 'https' );
var Stock = require( '../models/stocks' );

router.get( '/about', function( req, res ) {
  res.render( 'task', renderParams )
} );

router.get( '/', function( req, res ) {
  res.render( 'stocks/main', renderParams )
} )

router.ws( '/', function( ws, req ) {
  // ws.on( 'connect', function() {
  //   ws.send( 'connection successful' )
  // } )
  ws.on( 'message', function( msg ) {
    var message = JSON.parse( msg );
    if ( message.message == 'initial' ) {
      gatherInitialStocks( function( docs ) {
        ws.send( JSON.stringify( docs ) )
      } )
    } else if ( message.message == 'add' ) {
      Stock.find( message.code, function( doc ) {
        if ( doc ) {
          broadcast( req, JSON.stringify( [ doc ] ) );
          Stock.addCode( doc.code );
        } else {
          retrieveData( message.code, function( data ) {
            if ( data.dataset ) {
              var stock = {
                createdAt: new Date(),
                code: data.dataset.dataset_code,
                name: data.dataset.name.split( ' Prices, Dividends, Splits and Trading Volume' )[ 0 ],
                data: prepareData( data.dataset.data )
              }
              broadcast( req, JSON.stringify( [ stock ] ) );
              Stock.addCode( data.dataset.dataset_code );
              Stock.save( stock );
            } else {
              ws.send( JSON.stringify( [ { action: 'error', message: 'Error retrieving stock data.' } ] ) )
            }
          } )
        }
      } )
    } else if ( message.message == 'remove' ) {
      Stock.removeCode( message.code.toUpperCase() );
      broadcast( req, JSON.stringify( [ { action: 'remove', code: message.code.toUpperCase() } ] ) )
    }
  } );
} );


// catch 404 and forward to error handler
router.use( function( req, res, next ) {
  var err = new Error( 'Not Found' );
  err.status = 404;
  next( err );
} );

module.exports = router;

function broadcast( req, message ) {
  req.wss.clients.forEach( function each( client ) {
    //console.log( client.upgradeReq.baseUrl ) use this to filter later.
    client.send( message )
  } )
}

function gatherInitialStocks( callback ) {
  Stock.initial( function( array, docs ) {
    //determine if docs collection is complete.
    var complete = false;
    if ( array.length == 0 ) {
      complete = true;
    } else {
      if ( docs ) {
        if ( array.length == docs.length ) {
          complete = true;
        }
      }
    }
    if ( complete ) {
      callback( docs )
    } else {
      var newDocs = [];
      var needed = array;
      if ( docs ) {
        for ( var i = 0; i < docs.length; i++ ) {
          needed.splice( needed.indexOf( docs[ i ].code ), 1 );
        }
      }
      var count = 0;
      var errors = [];
      for ( var i = 0; i < needed.length; i++ ) {
        retrieveData( needed[ i ], ( data ) => {
          count += 1;
          if ( data.dataset ) {
            newDocs.push( {
              createdAt: new Date(),
              code: data.dataset.dataset_code,
              name: data.dataset.name.split( ' Prices, Dividends, Splits and Trading Volume' )[ 0 ],
              data: prepareData( data.dataset.data )
            } );
          } else {
            //console.log( data )
          }
          if ( count == needed.length ) {
            docs.push.apply( docs, newDocs );
            Stock.updateInitial( newDocs, function() {
              callback( docs );
            } )
          }
        } );
      }
    }
  } )
}

function prepareData( array ) {
  toDate( array );
  array.reverse();
  return array
}

function toDate( array ) {
  if ( typeof array[ 0 ][ 0 ] == 'string' ) {
    for ( var i = 0; i < array.length; i++ ) {
      var temp = array[ i ][ 0 ].split( '-' );
      //highcharts plots dates at UTC
      array[ i ][ 0 ] = Date.UTC( temp[ 0 ], temp[ 1 ] - 1, temp[ 2 ] );
    }
  }
}
function retrieveData( code, callback ) {
  const baseUrl = 'https://www.quandl.com/api/v3/datasets/WIKI/';
  var url = baseUrl + code + '.json?api_key=' + process.env.QUANDL_API_KEY + '&rows=253&column_index=4';
  // stock market is open average 252 days per year so restrict to last 253 rows
  // column index 4 is closing price.
  https.get( url, ( resp ) => {
    var data = '';
    resp.on( 'data', ( d ) => {
      data += d.toString();
    } );
    resp.on( 'end', () => {
      var response = JSON.parse( data );
      callback( response );
    } );
  } )
}
