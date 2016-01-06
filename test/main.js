var fs = require( 'fs' );
var path = require( 'path' );
var OMG = require('../lib');
var R = require('ramda');

var resourcesDirectory = "/resources";

var currentDirectory = path.resolve(__dirname + resourcesDirectory );
var specDirectory = path.resolve( (__dirname + resourcesDirectory + "/spec" );

//var specProvider = new OMG.SpecProvider();
//specProvider.path.push( specDirectory );

//if( fs.exists)
console.log( 'currentDirectory', currentDirectory );
fs.readdir( currentDirectory, function( err, files ) {
	console.log( 'err', err );
	console.log( 'files', files );

	var loadVRMat = file => {
		var fullPath = path.resolve( currentDirectory + '/' + file );
		console.log( 'fullPath', fullPath );
		OMG.VRMat.parseFromFile( fullPath, vrMat => {
			//console.log( 'vrMat', vrMat );
			var outputPath = path.resolve(__dirname + resourcesDirectory + "/output.json" );
			//console.log( 'outputPath', outputPath );

			VRMat.specCreator( vrMat, function( err, name, data ) {
				fs.writeFile( name + ".json", JSON.stringify( data, null, 4 ) );
			} );
			fs.writeFile( outputPath,  JSON.stringify( vrMat, null, '  ' ) );
		} );
	};
	R.forEach( loadVRMat, files );
});
