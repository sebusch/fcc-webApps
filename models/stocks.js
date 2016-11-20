var db = require( '../db' );
var collection = db.get( 'stocks' )

var Stock = function( data ) {
  this.data = data;
  this.createdAt = new Date();
}

Stock.prototype.data = {};
Stock.prototype.save = function( callback ) {
  collection.insert( this.data, callback );
}

// returns array that should be there, as well as docs that I already have.
Stock.initial = function( callback ) {
  collection.findOne( { type: 'list' } ).then( ( doc ) => {
    if ( doc ) {
      collection.find( { code: { $in: doc.data } } ).then( function( docs ) {
        if ( docs ) {
          callback( doc.data, docs )
        } else {
          callback( doc.data, [] )
        }
      } )
    } else {
      callback( [], [] )
    }
  } )
}

// saves array of docs
Stock.updateInitial = function( docArray, callback ) {
  collection.insert( docArray, callback )
}

//updates list of codes
Stock.removeCode = function( code ) {
  collection.update( { type: 'list' }, { $pull: { data: code } } )
}

Stock.addCode = function( code ) {
  collection.update( { type: 'list' }, { $addToSet: { data: code } } )
}

// find if we already saved the data
Stock.find = function( code, callback ) {
  collection.findOne( { code: code } ).then( callback )
}

//save new data
//ensure there is not already a doc there.
Stock.save = function( doc, callback ) {
  collection.findOneAndUpdate(
    {
      code: doc.code
    },
    {
      $setOnInsert: doc
    },
    {
      upsert: true // insert the document if it does not exist
    },
    callback
  )
}

module.exports = Stock;
// one document that says the list of stocks to include:
// {
//   type: list,
//   data: [ array of stock codes ]
// }

// {
//   createdAt: new Date()
//   code: stock code
//   name: business name
//   data: stock data
// }
