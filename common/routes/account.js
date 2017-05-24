var User = require( '../models/users' );
var passport = require( 'passport' );
var ensureLoggedIn = require( 'connect-ensure-login' ).ensureLoggedIn;
var ensureLoggedOut = require( 'connect-ensure-login' ).ensureLoggedOut;
var express = require( 'express' );
var router = express.Router();


router.get( '/login', function( req, res ) {
  if ( req.headers.referer ) {
    req.session.returnTo = req.headers.referer
  }
  res.render( 'users/login', {
    title: 'login'
  } );
} );

router.get( '/logout', function( req, res ) {
  req.logout();
  if ( req.headers.referer ) {
    res.redirect( req.headers.referer );
  } else {
    res.redirect( '/' );
  }
} );

router.get( '/profile', ensureLoggedIn( '/login' ), function( req, res ) {
  res.render( 'users/profile', {
    title: 'profile'
  } );
} );

router.get( '/profile/api/:id', ensureLoggedIn( '/login' ), function( req, res ) {
  res.send( req.user.github );
} );



router.route( '/auth/local/:new?' )
  .get( ensureLoggedOut( '/login' ), function( req, res ) {
    if ( req.params.new == 'new' ) {
      res.render( 'users/localLogin', {
        title: 'Sign Up',
        newUser: true
      } );
    } else {
      res.render( 'users/localLogin', {
        title: 'login'
      } );
    }
  } )
  .post( validateFields, addUser, passport.authenticate( 'local', {
    successReturnToOrRedirect: '/',
    failureRedirect: '/auth/local',
    failureFlash: true
  } ) );

router.get( '/auth/github', passport.authenticate( 'github' ) );

router.get( '/auth/github/callback', passport.authenticate( 'github', {
  successReturnToOrRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
} ) );
router.get( '/auth/google', passport.authenticate( 'google', { scope: ['profile'] } ) );

router.get( '/auth/google/callback', passport.authenticate( 'google', {
  successReturnToOrRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
} ) );

// catch 404 and forward to error handler
router.use( function( req, res, next ) {
  var err = new Error( 'Not Found' );
  err.status = 404;
  next( err );
} );


module.exports = router;

function validateFields( req, res, next ) {
  if ( req.body.passwordVerify ) {
    if ( req.body.passwordVerify != req.body.password ) {
      req.flash( 'error', "passwords don't match" );
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
    User.findOne( {
      'local.username': req.body.username
    }, function( err, user ) {
      if ( err ) {
        next( err );
      }
      if ( !user ) {
        var newUser = new User( {
          local: {
            username: req.body.username,
            password: req.body.password,
          },
          profile: { displayName: req.body.username },
          nbrClicks: {
            clicks: 0
          }
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
