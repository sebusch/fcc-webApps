/* eslint func-names: 0 */
var express = require( 'express' );
var router = express.Router();
var renderParams = require( '../models/text' ).stocks;

router.get( '/about', function( req, res ) {
  console.log(expressWs)
  res.render( 'task', renderParams )
} );

router.get( '/', function( req, res ) {
  res.render( 'stocks/main', renderParams )
} )

// router.ws( '/socketserver', function( ws, req ) {
//   ws.on( 'message', function( msg ) {
//     ws.send( msg );
//   } );
// } );


// catch 404 and forward to error handler
router.use( function( req, res, next ) {
  var err = new Error( 'Not Found' );
  err.status = 404;
  next( err );
} );

module.exports = router;

