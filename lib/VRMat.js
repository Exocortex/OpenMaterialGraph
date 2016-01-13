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

	//console.log( "===================================================================================================" );
	var vrMatGraph = new VRMat();
	//console.log( "VRMAT", vrMatGraph );
	var assets = vrMatJSON.vismat.Asset;

	var lastNode = null;

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
				spec = VRMatSpecInferer.infer( vrayPlugin, spec );
					//console.log( 'SPEC', spec );
				if( ! spec ) {
					library.add( spec );
				};

				//console.log( 'spec', spec );
				var node = new specgraph.Node( vrMatGraph, spec );
				//console.log( 'node', node );
				node.label = asset['$'].url;

				lastNode = node;
				//console.log( "NODE LABEL", node.label );

				var params = vrayPlugin.parameters[0].parameter;
				R.forEach( function( param ) {
					var value = VRMatValueParser.parse( param );
					//console.log( "value", value );
					if( value !== null && value.referenceType && value.label && value.label.length > 0 ) {
						//console.log( "node.inputs", node.inputs, 'params[$].name', param['$'].name );
						referencesToResolve.push( {
							input: node.inputs[ param['$'].name ],
							reference: value.label
						} );
					}
					else {
						var input = node.inputs[ param['$'].name ];
						if( ! input ) console.log( 'can not find input: inputs', node.inputs, 'paramName', param['$'].name );
						node.inputs[ param['$'].name ].set( value );
					}
				}, params );

			}, plugin.vrayplugin );

		}, asset.plugin );

	}, assets );

	lastNode.label = "Root";

	/*vrMatGraph.label = lastAssetName;
	console.log( 'vrMatGraph.label', vrMatGraph.label );
	for( var nodeName in vrMatGraph.nodes ) {
		var node = vrMatGraph.nodes[nodeName];
		if( node.label.indexOf( vrMatGraph.label ) === 0 ) {
			node.label = node.label.substring( vrMatGraph.label.length );
			console.log( '.');
		}
	}*/

	// resolve all references by their labels
	//console.log( "referencesToResolve", referencesToResolve );
	R.forEach( function( referenceToResolve ) {
		var input = referenceToResolve.input;
		var referenceLabel = referenceToResolve.reference;

		var targetOutput = vrMatGraph.find( referenceLabel );

	//	console.log( 'input', input );

		if( ! targetOutput ) {
			console.log( "ignoring unresolveable reference on input:\n  " + input.path() + "\nreference path: " + referenceLabel );
		}
		else {
		//console.log( "resolving: " + input.path() + " to " + targetOutput.path() )
			input.connect( targetOutput );
		}
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
