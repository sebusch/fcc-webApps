/* eslint func-names: 0 */
// Book sub-app
var appName = 'book';

var express = require( 'express' );
var router = express.Router();
var renderParams = require( '../../common/models/text' )[ appName ];
var viewPath = '../../apps/' + appName + '/views';

var https = require( 'https' );
var parseXML = require( 'xml2js' ).parseString;

var path = require( 'path' );
router.use( express.static( path.join( __dirname, 'client' ) ) );

router.get( '/about', function( req, res ) {
  res.render( 'task', renderParams )
} );

router.get( '/', function( req, res ) {
  res.render( viewPath + '/main', renderParams )
} )

// router.get( '/add', function( req, res ) {
//   res.render( viewPath + '/add', renderParams )
// } )

router.route( '/add' )
  .get( function( req, res ) {
    res.render( viewPath + '/search', renderParams )
  } )
  .post( function( req, res ) {
    if ( req.body.query ) {
      console.log( req.body.query )
      delete req.session.results;
      res.locals.searchTerm = req.body.query;
      search( req.body.query, function( resp ) {
        res.locals.results = format( resp );
        req.session.results = res.locals.results;
        res.render( viewPath + '/search', renderParams )
      } )
    } else {
      if ( !req.body.bookID ) {
        req.flash( 'error', 'No books selected' )
        res.locals.results = req.session.results;
        res.render( viewPath + '/search', renderParams )
      } else {
        var savedBooks = [];
        console.log( req.body.bookID )
        if ( !( req.body.bookID instanceof Array ) ) {
          req.body.bookID = [ req.body.bookID ]
        }
        for ( var i = 0; i < req.body.bookID.length; i++ ) {
          for ( var j = 0; j < req.session.results.length; j++ ) {
            if ( req.session.results[ j ].id == req.body.bookID[ i ] ) {
              savedBooks.push( req.session.results[ j ] )
            }
          }
        }
        if ( savedBooks.length != req.body.bookID.length ) {
          console.log( 'need to search for book info again' )
        }
        res.locals.results = savedBooks;
        req.flash( 'success', 'Books saved' )
        res.render( viewPath + '/search', renderParams )
      }
    }
  } )

router.get( '/test', function( req, res ) {
  searchGR( 'good omens' + '&search[field]=all', function( resp ) {
    res.json( resp )
  } )
} )

router.get( '/api/search', function( req, res ) {

  // searchGR( req.query.q, function( resp ) {
  //   res.json( formatGR( resp ) )
  // } )

  search( req.query.q, function( resp ) {
    res.json( format( resp ) )
  } )

} )

// catch 404 and forward to error handler
router.use( function( req, res, next ) {
  var err = new Error( 'Not Found' );
  err.status = 404;
  next( err );
} );

module.exports = router;

function search( query, callback ) {
  var url = 'https://www.googleapis.com/books/v1/volumes?projection=lite&key=' +
    process.env.GOOGLE_API_KEY +
    '&q=' + query;
  https.get( url, ( resp ) => {
    var data = '';
    resp.on( 'data', ( d ) => {
      data += d.toString();
    } );
    resp.on( 'end', ( ) => {
      var response = JSON.parse( data );
      callback( response );
    } );
  } )

}
function format( resp ) {
  if ( resp.error ) {
    console.log( resp )
    return resp;
  } else if ( !resp.items ) {
    return {
      error: 'No results found'
    };
  } else {
    var titles = [];
    for ( var i = 0; i < resp.items.length; i++ ) {
      var obj = resp.items[ i ].volumeInfo;
      titles.push( {
        id: resp.items[ i ].id,
        title: obj.title,
        subtitle: obj.subtitle,
        authors: obj.authors,
        cover: obj.imageLinks,
        description: obj.description
      } )
    }
    return titles;
  }
}

function searchGR( query, callback ) {
  var url = 'https://www.goodreads.com/search/index.xml?key=' +
    process.env.GOODREADS_API_KEY +
    '&q=' + query;
  https.get( url, ( resp ) => {
    var data = '';
    resp.on( 'data', ( d ) => {
      data += d.toString();
    } );
    resp.on( 'end', ( ) => {
      parseXML( data, {
        ignoreAttrs: true,
        valueProcessors: [ parseNumbers ]
      }, function( err, response ) {
        //callback( formatGR( response ) )
        callback( response )
      } );
    } );
  } )
}
function parseNumbers( str ) {
  if ( !isNaN( str ) ) {
    str = str % 1 === 0 ? parseInt( str, 10 ) : parseFloat( str );
  }
  return str;
}

function formatGR( obj ) {
  var titles = [];
  var arr = obj.GoodreadsResponse.search[ 0 ].results[ 0 ].work;
  for ( var i = 0; i < arr.length; i++ ) {
    var book = arr[ i ];
    var authors = [];
    for ( var j = 0; j < book.best_book[ 0 ].author.length; j++ ) {
      authors.push( book.best_book[ 0 ].author[ j ].name[ 0 ] );
    }
    titles.push( {
      id: book.id[ 0 ],
      title: book.best_book[ 0 ].title[ 0 ],
      authors: authors,
      cover: {
        thumbnail: book.best_book[ 0 ].image_url[ 0 ]
      }
    } )

  }
  return titles;
}