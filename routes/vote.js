/* eslint func-names: 0 */
var express = require( 'express' );
var router = express.Router();
var Poll = require( '../models/polls' );
var renderParams = require( '../models/text' ).vote;
var ensureLoggedIn = require( 'connect-ensure-login' ).ensureLoggedIn;
var _ = require( 'lodash' );

router.get( '/', function( req, res, next ) {
  Poll.getAll( function( err, docs ) {
    if ( err ) {
      next( err );
    }
    renderParams.polls = docs;
    res.render( 'vote/main', renderParams )
  } )
} );

router.get( '/manage', ensureLoggedIn( '/login' ), function( req, res, next ) {
  Poll.getOwnedBy( res.locals.user._id, function( err, docs ) {
    if ( err ) {
      next( err );
    }
    renderParams.polls = docs;
    res.locals.manage = true;
    res.render( 'vote/main', renderParams )
  } )
} );

router.route( '/new' )
  .get( ensureLoggedIn( '/login' ), function( req, res, next ) {
    res.render( 'vote/newPoll', renderParams )
  } )
  .post( ensureLoggedIn( '/login'), addPoll, function( req, res, next ) {
    res.redirect( renderParams.link );
  } )

router.get( '/about', function( req, res ) {
  res.render( 'task', renderParams )
} );

router.post( '/:link/delete', ensureLoggedIn( '/login' ), function( req, res, next ) {
  Poll.delete( req.params.link, res.locals.user._id, function( err, doc ) {
    if ( err ) {
      req.flash( 'error', 'There was an error deleting the poll' )
    } else if ( !doc ) {
      req.flash( 'error', 'You do not have permission to delete this poll.' )
    } else {
      req.flash( 'success', 'Poll successfully deleted.' )
    }
    res.locals.manage = true;
    res.redirect( renderParams.link + '/manage' );
  } )
} )

router.route( '/:link' )
  .get( function( req, res, next ) {
    Poll.findOneByLink( req.params.link, function( err, doc ) {
      if ( err || !doc ) {
        req.flash( 'error', 'That poll does not exist!' )
        res.redirect( renderParams.link );
      }
      req.session.poll = doc;
      renderParams.poll = doc;
      res.render( 'vote/poll', renderParams )
    } )
  } )
  .post( ensureLoggedIn( '/login' ), function( req, res, next ) {
    var pollOptions = [];
    for ( var i = 0; i < req.session.poll.options.length; i++ ) {
      pollOptions.push( req.session.poll.options[ i ].label );
    }
    if ( pollOptions.indexOf( req.body.new ) == -1 ) {
      Poll.addOption( req.params.link, req.body.new, function( err, doc ) {
        if ( err ) {
          req.flash( 'error', 'There was an error' )
          res.redirect( renderParams.link + req.url );
        } else {
          renderParams.poll = doc;
          res.render( 'vote/poll', renderParams );
        }
      } )
    } else {
      req.flash( 'error', 'That option already exists' )
      res.redirect( renderParams.link + req.url );
    }
  } )

// catch 404 and forward to error handler
router.use( function( req, res, next ) {
  var err = new Error( 'Not Found' );
  err.status = 404;
  next( err );
} );

module.exports = router;

function addPoll( req, res, next ) {
  var data = {
    title: req.body.title,
    owner: res.locals.user._id,
    options: []
  }
  var uniqOptions = _.uniq( req.body.option );
  if ( uniqOptions.length < 2 ) {
    req.flash( 'error', 'You must have 2 or more unique options' )
    res.redirect( renderParams.link + '/new' );
  } else {
    for ( var i = 0; i < uniqOptions.length; i++ ) {
      if ( uniqOptions[ i ].length ) {
        data.options.push( { label: uniqOptions[ i ], count: 0 } );
      }
    }
    var newPoll = new Poll( data )
    newPoll.save( function( err ) {
      if ( err ) {
        next( err )
      }
      next();
    } );
  }
}
