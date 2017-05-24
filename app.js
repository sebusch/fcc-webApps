/* eslint one-var: 0 */
var http = require( 'http' );
var express = require( 'express' );
var favicon = require( 'serve-favicon' );
var session = require( 'express-session' );
var passport = require( 'passport' );
var bodyParser = require( 'body-parser' );
var helmet = require( 'helmet' );
var path = require( 'path' );
var logger = require( 'morgan' );
var flash = require( 'connect-flash' );
var expressSanitized = require( 'express-sanitize-escape' );

///////////////////////////////
//
// create app and server ( need server here for websocket )
//
var app = express();
var server = http.createServer( app );
var expressWs = require( 'express-ws' )( app, server );

///////////////////////////////
//
// load routes ( after websocket server to use websockets )
//
var vote = require( './apps/vote/route' );
var nightlife = require( './apps/nightlife/route' );
var stocks = require( './apps/stocks/route' );
var book = require( './apps/book/route' );
var account = require( './common/routes/account' );
var text = require( './common/models/text' );

///////////////////////////////
//
// initialize passport and app settings
//
require( './common/config/passport' )();
app.set( 'json spaces', 2 );
app.set( 'views', path.join( __dirname, 'common', 'views' ) );
app.set( 'view engine', 'pug' );

///////////////////////////////
//
// common middleware
//
app.use( helmet() );
app.use( favicon( path.join( __dirname, 'common', 'public', 'favicon.ico' ) ) );
app.use( logger( 'dev' ) );
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( {
  extended: true
} ) );
app.use( expressSanitized.middleware() );

///////////////////////////////
//
// session middleware, passport configuration, local vars
//
app.use( session( {
  secret: 'biscuit is my doggie',
  resave: false,
  saveUninitialized: true
} ) );
app.use( passport.initialize() );
app.use( passport.session() );
app.use( function( req, res, next ) {
  res.locals.user = req.user;
  next();
} );

///////////////////////////////
//
// flash messages
//
app.use( flash() );
app.use( function( req, res, next ) {
  res.locals.messages = require( 'express-messages' )( req, res );
  next();
} );

///////////////////////////////
//
// for websocket request: attach wss to request for use in routes
//
app.use( function( req, res, next ) {
  if ( req.ws ) {
    // console.log( req.ws.upgradeReq.sessionID )
    // console.log( req.ws.upgradeReq.originalUrl )
    req.wss = expressWs.getWss();
  }
  next()
} )

//////////////////////////////
//
// and finally the routes
//
app.use( express.static( path.join( __dirname, 'common', 'public' ) ) );

app.use( text.vote.link, vote );
app.use( text.nightlife.link, nightlife );
app.use( text.stocks.link, stocks );
app.use( text.book.link, book );

app.get( '/', function( req, res ) {
  res.render( 'index', {
    title: 'Full stack Projects',
    pages: text
  } )
} )
app.get( '/about', function( req, res ) {
  res.render( 'task', {
    title: 'Full stack Projects',
    userStories: [
      'These apps were developed to fulfill the requirements for the backend development certificate under the curriculum developed by www.freecodecamp.com.'
    ]
  } )
} );
app.use( account );


// catch 404 and forward to error handler
app.use( function( req, res, next ) {
  var err = new Error( 'Not Found' );
  err.status = 404;
  next( err );
} );

// error handlers

// development error handler
// will print stacktrace
if ( app.get( 'env' ) === 'development' ) {
  app.use( function( err, req, res, next ) {
    res.status( err.status || 500 );
    res.render( 'error', {
      title: 'Error',
      message: err.message,
      error: err
    } );
  } );
}

// production error handler
// no stacktraces leaked to user
app.use( function( err, req, res, next ) {
  res.status( err.status || 500 );
  res.render( 'error', {
    title: 'Error',
    message: err.message,
    error: {}
  } );
} );

module.exports = { app: app, server: server };
