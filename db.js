var monk = require( 'monk' );
var mongoURI = process.env.MONGOLAB_URI;
var db = monk( mongoURI )

db.then( ( ) => {
  console.log( 'MongoDB connected successfully' )
} ).catch( ( err ) => {
  console.error( err )
} )

module.exports = db;
