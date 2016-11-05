/* eslint func-names: 0 */
var express = require( 'express' );
var router = express.Router();
var ClickHandler = require( '../models/clickHandler' );
var ensureLoggedIn = require( 'connect-ensure-login' ).ensureLoggedIn;

router.get( '/:id', ensureLoggedIn( '/login' ), function( req, res ) {
  res.send( req.user.github );
} );

router.route( '/vote/:id/clicks' )
  .get( ensureLoggedIn( '/login' ), function( req, res, next ) {
    ClickHandler.getClicks( req.user._id, function( err, result ) {
      if ( err ) {
        next( err );
      }
      res.send( result );
    } );
  } )
  .post( ensureLoggedIn( '/login' ), function( req, res, next ) {
    ClickHandler.addClick( req.user._id, function( err, result ) {
      if ( err ) {
        next( err );
      }
      res.send( result );
    } );
  } )
  .delete( ensureLoggedIn( '/login' ), function( req, res, next ) {
    ClickHandler.resetClicks( req.user._id, function( err, result ) {
      if ( err ) {
        next( err );
      }
      res.send( result );
    } );
  } );

// catch 404 and forward to error handler
router.use( function( req, res, next ) {
  var err = new Error( 'Not Found' );
  err.status = 404;
  next( err );
} );

module.exports = router;


