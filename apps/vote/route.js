/* eslint func-names: 0 */
// vote sub-app
var appName = 'vote';
var Poll = require( './model' );

var express = require( 'express' );
var router = express.Router();
var renderParams = require( '../../common/models/text' )[ appName ];
var viewPath = '../../apps/' + appName + '/views';

var ensureLoggedIn = require( 'connect-ensure-login' ).ensureLoggedIn;
var _ = require( 'lodash' );
var path = require( 'path' );

router.use( express.static( path.join( __dirname, 'client' ) ) );

router.get( '/', function( req, res, next ) {
  Poll.getAll( function( err, docs ) {
    if ( err ) {
      next( err );
    }
    renderParams.polls = docs;
    res.render( viewPath + '/main', renderParams )
  } )
} );

router.get( '/manage', ensureLoggedIn( '/login' ), function( req, res, next ) {
  Poll.getOwnedBy( res.locals.user._id, function( err, docs ) {
    if ( err ) {
      next( err );
    }
    renderParams.polls = docs;
    res.locals.manage = true;
    res.render( viewPath + '/main', renderParams )
  } )
} );

router.route( '/new' )
  .get( ensureLoggedIn( '/login' ), function( req, res, next ) {
    res.render( viewPath + '/newPoll', renderParams )
  } )
  .post( ensureLoggedIn( '/login'), addPoll, function( req, res, next ) {
    res.redirect( renderParams.link );
  } )

router.get( '/about', function( req, res ) {
  res.render( 'task', renderParams )
} );


router.route( '/api/:id/:option?' )
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
      res.render( viewPath + '/poll', renderParams )
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
          res.render( viewPath + '/poll', renderParams );
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
