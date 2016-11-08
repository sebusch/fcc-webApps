/* eslint func-names: 0 */
var express = require( 'express' );
var router = express.Router();
var Poll = require( '../models/polls' );
var ensureLoggedIn = require( 'connect-ensure-login' ).ensureLoggedIn;

router.get( '/:id', ensureLoggedIn( '/login' ), function( req, res ) {
  res.send( req.user.github );
} );

router.route( '/vote/:id/:option?' )
  .get( function( req, res, next ) {
    if ( req.params.option == 'orig' && req.session.poll ) {
      res.send( req.session.poll );
    } else {
      Poll.findOneByLink( req.params.id, function( err, result ) {
        if ( err ) {
          next( err );
        }
        res.send( result );
      } );
    }
  } )
  .post( function( req, res, next ) {
    Poll.addVote( req.params.id, req.params.option, function( err, result ) {
      if ( err ) {
        next( err );
      }
      res.send( result );
    } );
  } )


// catch 404 and forward to error handler
router.use( function( req, res, next ) {
  var err = new Error( 'Not Found' );
  err.status = 404;
  next( err );
} );

module.exports = router;


