var fs = require( 'fs' );
var fa = require( 'fa' );
var path = require( 'path' );
var OMG = require('../lib');
var R = require('ramda');

var resourcesDirectory = "/resources";

var specLibrary = new OMG.SpecLibrary();

var currentDirectory = path.resolve(__dirname + resourcesDirectory );
var specDirectory = path.resolve( __dirname + resourcesDirectory + "/spec" );

//var specProvider = new OMG.SpecProvider();
//specProvider.path.push( specDirectory );

var specUsageCount = {};
//if( fs.exists)
console.log( 'currentDirectory', currentDirectory );
fs.readdir( currentDirectory, function( err, files ) {
	console.log( 'err', err );
	console.log( 'files', files );

	var loadVRMat = ( file, callback ) => {
		var fullPath = path.resolve( currentDirectory + '/' + file );
		console.log( 'reading: ', fullPath );
		OMG.VRMat.parseFromFile( fullPath, vrMat => {
			//console.log( 'vrMat', vrMat );
			var outputPath = path.resolve(__dirname + resourcesDirectory + "/output.json" );
			//console.log( 'outputPath', outputPath );

			VRMat.specCreator( vrMat, function( err, name, data ) {
				specLibrary.add( data );
				specUsageCount[ name ] = ( specUsageCount[ name ] || 0 ) + 1;
			});
			fs.writeFile( outputPath,  JSON.stringify( vrMat, null, '  ' ), callback );
		} );
	};

	fa.each(files, loadVRMat, function(err) {
		console.log( specUsageCount );
	});

});
