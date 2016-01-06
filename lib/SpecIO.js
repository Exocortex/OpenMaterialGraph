var fs = require('fs');
var xml2js = require('xml2js');
var path = require( 'path' );
var R = require('ramda');

SpecIO = function () {
};

SpecIO.readSpecFromFile = function( fileName, callback ) {
	fs.readFile( fileName, 'utf8', function (err, string) {
		if( err ) return callback( err );

		var json = JSON.parse( string );
		callback( null, json );
	});
};

SpecIO.readSpecsFromDirectory = function( directory, callback ) {
  fs.readdir( directory, function( err, files ) {
		if( err ) return callback( err );

		var readFile = file => {
			var fullPath = path.resolve( directory + '/' + file );
      var extension = path.extname( fullPath );
      if( extension === '.json' || extension === '.omg' ) {
			  fs.readFile( fullPath, callback );
      }
		};

		R.forEach( readFile, files );
	});
};

SpecIO.writeSpecToFile = function( fileName, spec, callback ) {
  var string = JSON.stringify( spec, null, '\t' );
  fs.writeFile( fileName, string, 'utf8', function( err ) {
    callback( err );
  });
};

SpecIO.writeLibraryToDirectory = function( directory, specs, callback ) {
  var writeFile = spec => {
    var fullPath = path.resolve( directory + '/' + spec.name + ".json" );
    SpecIO.writeSpecToFile( fullPath, spec, callback );
  }

  R.forEach( writeFile, specs );
};



SpecIO.loadSpecFromFile = function( library, fileName ) {
  SpecIO.readSpecFromFile( fileName, function( err, json ) {
    if( ! err ) {
      library.add( json );
    }
  })
};

SpecIO.loadSpecsFromDirectory = function( library, directory ) {
  SpecIO.readSpecsFromDirectory( directory, function( err, json ) {
    if( ! err ) {
      library.add( json );
    }
  })
};

SpecIO.saveSpecToFile = function( library, fileName, specName, callback ) {
  SpecIO.writeSpecToFile( fileName, library.get( specName ), callback );
};

SpecIO.saveLibraryToDirectory = function( library, directory, callback ) {
	var specs = [];
	for( var key in library.specNameToSpec ) {
		specs.push( library.specNameToSpec[key] );
	}
  SpecIO.writeLibraryToDirectory( directory, specs, callback );
};

module.exports = SpecIO;
