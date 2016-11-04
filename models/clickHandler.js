var db = require( '../db' );

var collection = db.get( 'users' )

var ClickHandler = function( data ) {
  this.data = data;
}

ClickHandler.prototype.data = {};
ClickHandler.prototype.log = function() {
  console.log( this );
}
//find clicks by mongo id
ClickHandler.getClicks = function( id, callback ) {
  collection.findOne(
    { '_id': id }, 'nbrClicks',
    callback
  );
}

ClickHandler.addClick = function( id, callback ) {
  collection.findOneAndUpdate(
    { '_id': id },
    {
      $inc: {
        'nbrClicks.clicks': 1,
      }
    },
    {
      projection: {
        nbrClicks: 1,
        _id: 0
      },
    },
    callback
  );
}

ClickHandler.resetClicks = function( id, callback ) {
  collection.findOneAndUpdate(
    { '_id': id },
    {
      $set: {
        'nbrClicks.clicks': 0,
      }
    },
    {
      projection: {
        nbrClicks: 1,
        _id: 0
      },
    },
    callback
  );
}

module.exports = ClickHandler;
//usage:
// ClickHandler.getClicks( function( err, result ) {
//   if ( err ) {
//     //handle err
//   }
//   //handle result
// } );
