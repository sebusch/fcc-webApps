var db = require( '../../db' );

var collection = db.get( 'polls' )
// poll = {
//   _id: mongodb id,
//   title: "this is my poll title",
//   options: [
//     { label: "vote for me!", count: 0 },
//     { label: "no vote me!", count: 10 }
//   ],
//   link: getID(),
//   owner: _id of owner in users collection 5818752d9d46bd1768e9fec8
// }
var Poll = function( data ) {
  this.data = data;
}

Poll.prototype.data = {};

Poll.prototype.save = function( callback ) {
  this.data.link = getID();
  collection.insert( this.data, callback );
}

Poll.getAll = function( callback ) {
  collection.find( {}, {
    fields: { title: 1, link: 1 },
    sort: { $natural: -1 }
  }, callback )
}
Poll.getOwnedBy = function( id, callback ) {
  collection.find( { owner: id }, { sort: { $natural: -1 } }, callback )
}

Poll.findOne = function( id, callback ) {
  collection.findOne( { _id: id }, callback );
}
Poll.findOneByLink = function( link, callback ) {
  collection.findOne( { link: link }, callback );
}
Poll.addVote = function( link, optionIndex, callback ) {
  var keyStr = 'options.' + optionIndex + '.count';
  collection.findOneAndUpdate( { link: link }, {
    $inc: { [ keyStr ]: 1 }
  }, callback );
}
Poll.searchOption = function( id, option, callback ) {
  collection.findOne( { _id: id, 'options.label': option }, callback )
}

Poll.addOption = function( link, option, callback ) {
  collection.findOneAndUpdate( { link: link }, {
    $addToSet: { options: { label: option, count: 0 } }
  }, callback );
}
Poll.delete = function( link, id, callback ) {
  collection.findOneAndDelete( { owner: id, link: link }, callback );
}

module.exports = Poll;

function getID() {
  var time = new Date();
  var offset = time.getTime() - 1470000000000;
  if ( offset < 0 ) {
    offset = -offset;
  }
  var result = convert( offset.toString(), BASE10, BASE56 );
  return result;
}

var BASE10 = '0123456789';
var BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
var BASE56 = '23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
function convert( src, srctable, desttable ) {
  var srclen = srctable.length;
  var destlen = desttable.length;
  var val = 0;
  var numlen = src.length;
  for ( var i = 0; i < numlen; i++ ) {
    val = val * srclen + srctable.indexOf( src.charAt( i ) );
  }
  if ( val < 0 ) {
    return 0;
  }
  var r = val % destlen;
  var res = desttable.charAt( r );
  var q = Math.floor( val / destlen );
  while ( q ) {
    r = q % destlen;
    q = Math.floor( q / destlen );
    res = desttable.charAt( r ) + res;
  }
  return res;
}
