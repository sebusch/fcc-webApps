var db = require( '../db' );

var collection = db.get( 'users' )

var User = function( data ) {
  this.data = data;
}

User.prototype.data = {};
User.prototype.save = function( callback ) {
  collection.insert( this.data, callback );
}

User.findById = function( id, callback ) {
  collection.findOne( {
    _id: id
  }, callback );
}

User.findOne = function( search, callback ) {
  collection.findOne( search, callback );
}


module.exports = User;

// {
//  github: {
//      id: String,
//      displayName: String,
//      username: String,
//    publicRepos: Number
//  },
// nbrClicks: {
//    clicks: Number
// }
