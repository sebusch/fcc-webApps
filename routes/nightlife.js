/* eslint func-names: 0 */
var express = require( 'express' );
var router = express.Router();
var Nightlife = require( '../models/nightlife' );
var renderParams = require( '../models/text' ).nightlife;
var ensureLoggedIn = require( 'connect-ensure-login' ).ensureLoggedIn;

var Yelp = require( 'yelp' );

var yelp = new Yelp( {
  consumer_key: process.env.YELP_CONSUMER_KEY,
  consumer_secret: process.env.YELP_CONSUMER_SECRET,
  token: process.env.YELP_TOKEN,
  token_secret: process.env.YELP_TOKEN_SECRET,
} );


router.get( '/about', function( req, res ) {
  res.render( 'task', renderParams )
} );

router.post( '/api/add/:id', ensureLoggedIn( '/login' ), function( req, res, next ) {
  Nightlife.new( req.params.id, 'Name', res.locals.user._id, function( err, data ) {
    if ( err ) {
      next( err )
    }
    Nightlife.searchGoing( [ req.params.id ], function( err, docs ) {
      if ( err ) {
        req.flash( 'error', 'There was an error' )
        next( err );
      }
      res.send( docs )
    } )
  } )
} )
router.post( '/api/cancel/:id', ensureLoggedIn( '/login' ), function( req, res, next ) {
  Nightlife.notGoing( req.params.id, res.locals.user._id, function( err, data ) {
    if ( err ) {
      next( err )
    }
    Nightlife.searchGoing( [ req.params.id ], function( err, docs ) {
      if ( err ) {
        req.flash( 'error', 'There was an error' )
        next( err );
      }
      res.send( docs )
    } )
  } )
} )

router.get( '/', function( req, res, next ) {
  res.locals.yelp = req.session.yelpResults;
  res.locals.lastSearch = req.session.lastSearch;
  var listBusinesses = [];
  if ( res.locals.yelp ) {
    for ( var i = 0; i < res.locals.yelp.businesses.length; i++ ) {
      listBusinesses.push( res.locals.yelp.businesses[ i ].id )
    }
  }
  if ( listBusinesses.length ) {
    Nightlife.searchGoing( listBusinesses, function( err, docs ) {
      if ( err ) {
        req.flash( 'error', 'There was an error' )
        next( err );
      }
      req.session.going = docs;
      res.locals.going = docs;
      res.render( 'nightlife/main', renderParams )
    } )
  } else {
    res.render( 'nightlife/main', renderParams )
  }
} )

router.post( '/', function( req, res, next ) {
  yelp.search( {
    term: req.body.term,
    category_filter: req.body.category,
    radius_filter: req.body.distance,
    sort: req.body.sort, //2=highest rated. 1=closest. 0=best match
    offset: '0', //for pagination later. i think it's 20 results per page
    location: req.body.location
  } )
    .then( function( data ) {
      req.session.yelpResults = data;
      req.session.lastSearch = req.body
      res.locals.lastSearch = req.body

      res.redirect( renderParams.link )
    } )
    .catch( function( err ) {
      next( err )
    } );
} )


// catch 404 and forward to error handler
router.use( function( req, res, next ) {
  var err = new Error( 'Not Found' );
  err.status = 404;
  next( err );
} );

module.exports = router;

