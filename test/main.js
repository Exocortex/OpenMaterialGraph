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
var bitmapNames = {};

var toSortedTable = function( map ) {

		var list = [];
		for( var key in map ) {
			list.push( { key: key, value: map[key] } );
		}

		list.sort( function( a, b ) {
			if( a.value < b.value ) return -1;
			if( a.value > b.value ) return 1;
			return 0;
		});

			var totalCount = 0;
			var output = [];
			for( var i = 0; i < list.length; i ++ ) {
				output.push( list[i].value + '\t' + list[i].key + '\n');
				totalCount ++;
			}
			output.push( totalCount + '\tTOTAL UNIQUE IMAGES\n');

			return output.join( '' );
};

//if( fs.exists)
console.log( 'currentDirectory', currentDirectory );
fs.readdir( currentDirectory, function( err, files ) {
	console.log( 'err', err );
	console.log( 'files', files );

	var loadVRMat = ( file, callback ) => {
		var fullPath = path.resolve( currentDirectory + '/' + file );
		console.log( 'reading: ', fullPath );
		OMG.VRMat.parseFromFile( fullPath, specLibrary, ( err, vrMat ) => {
			//console.log( 'vrMat', vrMat );
			//var outputPath = path.resolve(__dirname + resourcesDirectory + "/output.json" );
			//console.log( 'outputPath', outputPath );

//			VRMat.specCreator( vrMat, specLibrary, function( err, name, data ) {
	//			specLibrary.add( data );
			R.forEach( function( node ) {
				specUsageCount[ name.spec.name ] = ( specUsageCount[ name.spec.name ] || 0 ) + 1;
				if( name === 'BitmapBuffer' && data.inputs.file && data.inputs.file.value ) {
					bitmapNames[ data.inputs.file.value ] = ( bitmapNames[ data.inputs.file.value ] || 0 ) + 1;
				}
			}, vrMat.nodes );
			callback();
		});
	};

	fa.c(10).each(files, loadVRMat, function(err) {
		console.log( toSortedTable( specUsageCount ) );
		console.log( toSortedTable( bitmapNames ) );
		OMG.SpecIO.saveLibraryToDirectory( specLibrary, __dirname + resourcesDirectory, function() {
		});
	});

});
