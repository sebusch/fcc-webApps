var db = require( '../db' );

var collection = db.get( 'nightlife' )

var Nightlife = function( data ) {
  this.data = data;
  this.createdAt = new Date();
}

Nightlife.prototype.data = {};
Nightlife.prototype.save = function( callback ) {
  collection.insert( this.data, callback );
}

Nightlife.new = function( yelpID, name, userID, callback ) {
  collection.insert( {
    createdAt: new Date(),
    yelpID: yelpID,
    name: name,
    user: userID
  }, callback );
}

Nightlife.notGoing = function( yelpID, userID, callback ) {
  collection.findOneAndDelete( { yelpID: yelpID, user: userID }, callback )
}

Nightlife.searchGoing = function( yelpIDArray, callback ) {
  collection.aggregate( [
    { $match: {
      yelpID: { $in: yelpIDArray }
    } },
    {
      $group: {
        _id: '$yelpID',
        going: { $addToSet: '$user' }
      }
    }
  ], callback )
}

module.exports = Nightlife;

// {
//   createdAt: new Date()
//   yelpID: businessID from yelp
//   name: business name from yelp
//   user: user._id going
// }
