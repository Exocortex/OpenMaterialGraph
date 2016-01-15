var fs = require( 'fs' );
var fa = require( 'fa' );
var path = require( 'path' );
var specgraph = require('specgraph');
var OMG = require('../lib');
var R = require('ramda');
var nodeDir = require('node-dir');

var resourcesDirectory = "/vrmats";

var specLibrary = new OMG.SpecLibrary();

var currentDirectory = path.resolve(__dirname + resourcesDirectory + "/v1" );
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

var fs = require('fs');
var walk = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var i = 0;
    (function next() {
      var file = list[i++];
      if (!file) return done(null, results);
      file = dir + '/' + file;
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            next();
          });
        } else {
          results.push(file);
          next();
        }
      });
    })();
  });
};

var convertToPhysical = function( vrayMatGraph ) {
	var result = {};
	result.materialType = "Physical";
	result.name = "vrayMatGraph"
}
//if( fs.exists)
console.log( 'currentDirectory', currentDirectory );

nodeDir.files( currentDirectory, function( err, files ) {
	if( err ) return console.log( 'err', err );
	//console.log( 'files', files );

	var callbackCount = 0;

	var loadVRMat = ( file, callback ) => {
		var fullPath = file;//path.resolve( currentDirectory + '/' + file );
		if( path.extname( fullPath ) !== ".vrmat") {
			return callback();
		}

		//console.log( 'reading: ', fullPath );
		OMG.VRMat.parseFromFile( fullPath, specLibrary, ( err, vrMat ) => {
			if( err ) {
				console.log( "ERROR", err );
				return callback( err );
			}


			//console.log( "VR MAT", vrMat );
			//var outputPath = path.resolve(__dirname + resourcesDirectory + "/output.json" );
			//console.log( 'outputPath', outputPath );

//			VRMat.specCreator( vrMat, specLibrary, function( err, name, data ) {
	//			specLibrary.add( data );
			R.forEach( function( node ) {
			//	console.log( 'node', node );
				var name = node.spec.name;
				//console.log( 'name', name );
				specUsageCount[ name ] = ( specUsageCount[ name ] || 0 ) + 1;
				if( name === 'BitmapBuffer' ) {
					//console.log( node );
					if( node.inputs.file && node.inputs.file.value ) {
						bitmapNames[ node.inputs.file.value ] = ( bitmapNames[ node.inputs.file.value ] || 0 ) + 1;
					}
				}
			}, R.values( vrMat.nodes ) );


			//var rootNodes = OMG.VRMatToPhysical.getRootNodes( vrMat );
			//for( var i = 0; i < rootNodes.length; i ++ ) {
				//console.log( "Root node: " + rootNodes[i].path() );
			//}

			//OMG.VRMatToPhysical.treeToString( vrMat, '' );
			//var primaryBRDFVrayMtl = OMG.VRMatToPhysical.findBaseBRDFVRayMtl( rootNodes[0] );
			//if( primaryBRDFVrayMtl ) {
				//console.log( 'primary BRDF VRay Mtl: ' + primaryBRDFVrayMtl.path() + " <" + primaryBRDFVrayMtl.spec.name + ">");
			//	OMG.VRMatToPhysical.nodeTreeToString( primaryBRDFVrayMtl, '' );
			//}
			console.log( path.basename( fullPath ) );
			console.log( OMG.VRMatToPhysical.getPhysicalPropertiesFromVRMat( vrMat ) );
			callback();
		});
	};

	fa.c(10).each(files, loadVRMat, function(err) {
		console.log( "");
		console.log( toSortedTable( specUsageCount ) );
		console.log( toSortedTable( bitmapNames ) );
	//	OMG.SpecIO.saveLibraryToDirectory( specLibrary, __dirname + resourcesDirectory, function() {
	//	});
	});


});
