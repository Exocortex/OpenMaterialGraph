var specgraph = require('../../specgraph');
var fs = require('fs');
var xml2js = require('xml2js');
var R = require('ramda');
var SpecLibrary = require('./SpecLibrary');
var VRMatValueParser = require('./VRMatValueParser');
var VRMatSpecInferer = require('./VRMatSpecInferer');

VRMat = function () {
	specgraph.Graph.call( this );
};

VRMat.prototype = Object.create( specgraph.Graph.prototype );
VRMat.prototype.constructor = VRMat;

VRMat.specCreator = function( vrMatJSON, library, callback ) {

	if( ! vrMatJSON || ! vrMatJSON.vismat ) {
		return callback( new Error( "invalid vrMatJSON" ) );
	}

	// need to wait until the full graph is created until resolving references
	var referencesToResolve = [];

	var vrMatGraph = new VRMat();
	//console.log( "VRMAT", vrMatGraph );
	var assets = vrMatJSON.vismat.Asset;
	//console.log( assets );
	R.forEach( function( asset ) {
		//console.log( 'ASSET', asset );

		R.forEach( function( plugin ) {
			//console.log( 'PLUGIN', plugin );

			R.forEach( function( vrayPlugin ) {
				//console.log( 'VRAYPLUGIN', vrayPlugin );

				if( ! vrayPlugin ) return;

				var nodeName = vrayPlugin['$'].name;

				var spec = library.get( nodeName );
				//console.log( 'SPEC NodeName', nodeName );
				if( ! spec ) {
					spec = VRMatSpecInferer.infer( vrayPlugin );
					//console.log( 'SPEC', spec );
					library.add( spec );
				};

				var node = new specgraph.Node( vrMatGraph, spec );
				node.label = asset['$'].url;
				//console.log( "node.label", node.label );

				var params = vrayPlugin.parameters[0].parameter;
				R.forEach( function( param ) {
					var value = VRMatValueParser.parse( param );
					if( value !== null && value.reference ) {
						referencesToResolve.push( {
							input: node.inputs[ param['$'].name ],
							reference: value.label
						} );
					}
					else {
						node.inputs[ param['$'].name ] = value;
					}
				}, params );

			}, plugin.vrayplugin );

		}, asset.plugin );

	}, assets );

	// resolve all references by their labels
	R.forEach( function( referenceToResolve ) {
		var input = referencesToResolve.input;
		var referenceLabel = referencesToResolve.referenceLabel;

		var targetOutput = null;

		R.forEach( function( node ) {
			R.forEach( function( output ) {
				if( output.path() === referenceLabel ) {
					targetOutput = output;
				}
			}, node.outputs );
		}, graph.nodes );

		if( ! targetNode ) {
			return callback( new Error( "can not find reference for input: " + input.path() + "  label: " + referenceLabel ) );
		}

		input.connect( targetOutput );
	}, referencesToResolve );

	callback( null, vrMatGraph );
//	if( callback ) callback( vrMatJSON );

};


VRMat.parseFromString = function( string, library, callback ) {
	//console.log( 'VRMat.parseFromString' );

	xml2js.parseString( string, function( err, result ) {
		if (err) return callback( err );

	//	console.log( 'varxml2js.parseString', err, JSON.stringify( result, null, '  ' ) );
		VRMat.specCreator( result, library, callback );
	});

};

VRMat.parseFromFile = function( fileName, library, callback ) {
	//console.log( 'VRMat.parseFromFile' );

	fs.readFile( fileName, 'utf8', function (err, data) {
		if (err) return callback( err );

	//	console.log( 'readFileSync', err, data );
		VRMat.parseFromString( data, library, callback );
	});

};



module.exports = VRMat;
