/* eslint func-names: 0 */
var express = require( 'express' );
var router = express.Router();
var renderParams = require( '../models/text' ).book;

router.get( '/about', function( req, res ) {
  res.render( 'task', renderParams )
} );

router.get( '/', function( req, res ) {
  res.render( 'book/main', renderParams )
} )

// catch 404 and forward to error handler
router.use( function( req, res, next ) {
  var err = new Error( 'Not Found' );
  err.status = 404;
  next( err );
} );

module.exports = router;
