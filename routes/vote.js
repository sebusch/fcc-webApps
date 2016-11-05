/* eslint func-names: 0 */
var express = require( 'express' );
var router = express.Router();
//var ClickHandler = require( '../models/clickHandler' );
var renderParams = require( '../models/text' ).vote;
//var passport = require( 'passport' );
//var User = require( '../models/users' );
var ensureLoggedIn = require( 'connect-ensure-login' ).ensureLoggedIn;


router.get( '/', /*ensureLoggedIn( '/login' ), */function( req, res ) {
  res.render( 'voting', renderParams )
} );

router.get( '/about', function( req, res ) {
  res.render( 'task', renderParams )
} );

// catch 404 and forward to error handler
router.use( function( req, res, next ) {
  var err = new Error( 'Not Found' );
  err.status = 404;
  next( err );
} );

module.exports = router;

