/* eslint func-names: 0 */
var express = require( 'express' );
var router = express.Router();
var ClickHandler = require( '../models/clickHandler' );
var renderParams = require( '../models/text' ).vote;
var passport = require( 'passport' );
var link = require( '../models/text' ).vote.link;
var User = require( '../models/users' );

router.get( '/', isLoggedIn, function( req, res ) {
  res.render( 'voting', renderParams )
} );

router.get( '/login', function( req, res ) {
  res.render( 'login', {
    title: 'login'
  } );
} );

router.get( '/logout', function( req, res ) {
  req.logout();
  res.redirect( /*link + */ '/login' );
} );

router.get( '/profile', isLoggedIn, function( req, res ) {
  res.render( 'profile', {
    title: 'profile'
  } );
} );

router.route( '/auth/local/:new?' )
  .get( function( req, res ) {
    if ( req.params.new == 'new' ) {
      res.render( 'localLogin', {
        title: 'Sign Up',
        newUser: true
      } );
    } else {
      res.render( 'localLogin', {
        title: 'login'
      } );
    }
  } )
  .post( validateFields, addUser, passport.authenticate( 'local', {
    successRedirect: '/',
    failureRedirect: '/auth/local',
    failureFlash: true/*'Incorrect username or password'*/,
  } ) );

router.get( '/auth/github', passport.authenticate( 'github' ) );

router.get( '/auth/github/callback', passport.authenticate( 'github', {
  successRedirect: '/', //link,
  failureRedirect: /*link +*/ '/login'
} ) );

router.get( '/api/:id', isLoggedIn, function( req, res ) {
  res.send( req.user.github );
} );

router.route( '/api/:id/clicks' )
  .get( isLoggedIn, function( req, res, next ) {
    ClickHandler.getClicks( req.user._id, function( err, result ) {
      if ( err ) {
        next( err );
      }
      console.log( result )
      res.send( result );
    } );
  } )
  .post( isLoggedIn, function( req, res, next ) {
    ClickHandler.addClick( req.user._id, function( err, result ) {
      if ( err ) {
        next( err );
      }
      res.send( result );
    } );
  } )
  .delete( isLoggedIn, function( req, res, next ) {
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


function isLoggedIn( req, res, next ) {
  if ( req.isAuthenticated() ) {
    return next();
  } else {
    res.redirect( /*link + */ '/login' );
  }
}

function validateFields( req, res, next ) {
  console.log( req.body )
  if ( req.body.passwordVerify ) {
    if ( req.body.passwordVerify != req.body.password ) {
      req.flash( 'error', 'passwords don\'t match' );
      res.redirect( '/auth/local/new' );
    } else {
      next();
    }
  } else {
    next()
  }
}

function addUser( req, res, next ) {
  if ( req.params.new == 'new' ) {
    User.findOne( { 'local.username': req.body.username }, function( err, user ) {
      if ( err ) {
        next( err );
      }
      if ( !user ) {
        var newUser = new User( {
          local: {
            username: req.body.username,
            password: req.body.password,
          },
          nbrClicks: { clicks: 0 }
        } );
        newUser.save( function( err, user ) {
          if ( err ) {
            next( err );
          }
          next();
        } );
      } else {
        req.flash( 'error', 'User name is not available' )
        res.redirect( '/auth/local/new' );
      }
    } )
  } else {
    next();
  }
}
