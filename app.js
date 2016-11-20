/* eslint one-var: 0 */
var http = require( 'http' );
var express = require( 'express' );
var favicon = require( 'serve-favicon' );

var text = require( './models/text' );
var session = require( 'express-session' );
var passport = require( 'passport' );
var bodyParser = require( 'body-parser' );
var helmet = require( 'helmet' );
var path = require( 'path' );
var logger = require( 'morgan' );
var flash = require( 'connect-flash' );
var expressSanitized = require( 'express-sanitize-escape' );

var app = express();
var server = http.createServer( app );
var expressWs = require( 'express-ws' )( app, server );


var vote = require( './routes/vote' );
var nightlife = require( './routes/nightlife' );
var stocks = require( './routes/stocks' );
var book = require( './routes/book' );
var account = require( './routes/account' );
var api = require( './routes/api' );

require( './config/passport' )();

app.set( 'json spaces', 2 );
app.set( 'views', path.join( __dirname, 'views' ) );
app.set( 'view engine', 'pug' );
app.use( favicon( path.join( __dirname, 'public', 'favicon.ico' ) ) );
app.use( logger( 'dev' ) );

app.use( helmet() );
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( {
  extended: true
} ) );
app.use( expressSanitized.middleware() );

app.use( session( {
  secret: 'biscuit is my doggie',
  resave: false,
  saveUninitialized: true
} ) );

app.use( passport.initialize() );
app.use( passport.session() );

app.use( flash() );
app.use( function( req, res, next ) {
  res.locals.messages = require( 'express-messages' )( req, res );
  next();
} );

app.use( function( req, res, next ) {
  res.locals.user = req.user;
  next();
} );

app.use( function( req, res, next ) {

  if ( req.ws ) {
    // console.log( req.ws.upgradeReq.sessionID )
    // console.log( req.ws.upgradeReq.originalUrl )
    req.wss = expressWs.getWss();
  }
  next()
} )
// expressWs.getWss().on( 'connection', function( socket ) {
//   console.log( 'connection' + socket.upgradeReq.originalUrl )
//   socket.on( 'open', function( ) {
//     console.log( 'open' + socket.upgradeReq.sessionID );
//   } )
//   socket.on( 'message', function( data ) {
//     console.log( 'message:' + socket.upgradeReq.sessionID + ':' + data );
//   } )
// } )


app.use( express.static( path.join( __dirname, '/public' ) ) );

app.use( '/api', api );
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
