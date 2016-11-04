/* eslint one-var: 0 */
require( './config/passport' )();
var express = require( 'express' );
var favicon = require( 'serve-favicon' );
var vote = require( './routes/vote' );
var text = require( './models/text' );
var session = require( 'express-session' );
var passport = require( 'passport' );
var bodyParser = require( 'body-parser' );
var helmet = require( 'helmet' );
var path = require( 'path' );
var logger = require( 'morgan' );
var flash = require( 'connect-flash' );
var expressSanitized = require('express-sanitize-escape');

var app = express();


app.set( 'views', path.join( __dirname, 'views' ) );
app.set( 'view engine', 'pug' );
app.use( favicon( path.join( __dirname, 'public', 'favicon.ico' ) ) );
app.use( logger( 'dev' ) );

app.use( helmet() );
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( {
  extended: true
} ) );
app.use(expressSanitized.middleware());

app.use( session( {
  secret: 'secretClementine',
  resave: false,
  saveUninitialized: true
} ) );


app.use( passport.initialize() );
app.use( passport.session() );

// app.get( '/', function( req, res ) {
//   res.render( 'index', {
//     title: 'Full stack Projects',
//     pages: text
//   } )
// } )

app.use( flash() );
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

app.use( express.static( path.join( __dirname, '/public' ) ) );
app.use( text.vote.link, vote );

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

module.exports = app;
