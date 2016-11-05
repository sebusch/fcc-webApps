
var GitHubStrategy = require( 'passport-github' ).Strategy;
var LocalStrategy = require( 'passport-local' ).Strategy;
var User = require( '../models/users' );
var configAuth = require( './auth' );
var passport = require( 'passport' );


module.exports = function( ) {
  passport.serializeUser( function( user, done ) {
    done( null, user._id ); //had to change to user._id here..... orig: user.id
  } );

  passport.deserializeUser( function( id, done ) {
    User.findById( id, function( err, user ) {
      done( err, user );
    } );
  } );

  passport.use( new LocalStrategy( function( username, password, callback ) {
    User.findOne( { 'local.username': username }, function( err, user ) {
      if ( err ) {
        return callback( err );
      }
      if ( !user ) {
        return callback( null, false, { message: 'User does not exist' } );
      }
      if ( user.local.password !== password ) {
        return callback( null, false, { message: 'Password incorrect' } );
      }
      return callback( null, user );
    } )
  } ) )

  passport.use( new GitHubStrategy( {
    clientID: configAuth.githubAuth.clientID,
    clientSecret: configAuth.githubAuth.clientSecret,
    callbackURL: configAuth.githubAuth.callbackURL
  }, function( token, refreshToken, profile, done ) {
    process.nextTick( function() {
      User.findOne( {
        'github.id': profile.id
      }, function( err, user ) {
        if ( err ) {
          return done( err );
        }
        if ( user ) {
          return done( null, user );
        } else {
          var newUser = new User( {
            github: {
              id: profile.id,
              username: profile.username,
              displayName: profile.displayName,
              publicRepos: profile._json.public_repos
            },
            profile: { displayName: profile.displayName },
            nbrClicks: { clicks: 0 }
          } );
          newUser.save( function( err, user ) {
            if ( err ) {
              throw err;
            }
            return done( null, user );
          } );
        }
      } );
    } );
  } ) );


};

// serialized user is stored in req.session.passport.user
// deserialized user searches database and stores document in req.user
