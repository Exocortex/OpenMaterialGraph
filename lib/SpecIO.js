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
			  that.readFile( fullPath, callback );
      }
		};

		R.forEach( readFile, files );
	});
};

SpecIO.writeSpecToFile = function( fileName, spec, callback ) {
  var string = JSON.stringifiy( spec, null, '\t' );
  fs.writeFile( fileName, string, 'utf8', function( err ) {
    callback( err );
  });
};

SpecIO.writeLibraryToDirectory = function( directory, specs, callback ) {
  var that = this;
  var writeFile = spec => {
    var fullPath = path.resolve( directory + '/' + spec.name + ".json" );
    that.writeFile( fullPath, spec, callback );
  }

  R.forEach( specs, writeFile );
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
  SpecIO.writeLibraryToDirectory( directory, Object.values( library.specNameToSpec ), callback );
};

module.exports = SpecIO;
