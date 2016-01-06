var specgraph = require('../../specgraph');
var fs = require('fs');
var xml2js = require('xml2js');
var SpecLibrary = require('./SpecLibrary');

VRMat = function () {
};

VRMat.prototype = Object.create( specgraph.Graph.prototype );
VRMat.prototype.constructor = VRMat;

var sanitizeNodeOutput = function( name, type ) {

	var result = {
		name: name,
		type: type
	};

	if( result.type === "BRDF" ) {
		result.type = "brdf";
	}

	if( result.type === "UVW" ) {
		result.type = "uvwgen";
	}

	return result;
}

var sanitizeNodeInput = function( name, type, value ) {

	var result = {
		name: name,
		type: type,
		value: value
	};

	if( ( name.indexOf( "uvwgen" ) >= 0 ) && type === "plugin" ) {
		result.type = "uvwgen";
	}
	if( name === "bitmap" && type === "plugin" ) {
		result.type = "bitmap";
	}
	if( name === "brdf" && type === "plugin" ) {
		result.type = "brdf";
	}
	if( type === "list" ) {
		if( name === "brdfs" ) result.type = "brdfs list";
		else if( name === "weights" ) result.type = "float list";
		result.value = result.value[0].list[0].entry;
	}
	else {
		if( result.value.length === 1 ) {
			result.value = result.value[0];
		}
		if( type === "bool" ) {
			result.value = ( value === '0' ) ? false : true;
		}
		if( type.indexOf( 'color' ) >= 0 ) {
			if( result.value.r !== undefined && result.value.a !== undefined  ) {
				result.value = { r: result.value.r[0], g: result.value.g[0], b: result.value.b[0], a: result.value.a[0] };
			}
			else if( result.value.r !== undefined ) {
				result.value = { r: result.value.r[0], g: result.value.g[0], b: result.value.b[0] };
			}
		}
	}

	return result;
}

var fileNameHandler = function() {
};
var componentTransformHandler = function() {
};


var parameterEvidenceToParameterType = [
	{
		parameter: {
			handler: 'FileBrowserHandler',
			type: 'string',
		},
		handler: fileNameHandler
	},
	{
		parameter: {
			handler: 'ComboBoxHandler',
			name: 'filter_type'
			type: 'integer',
		},
		valueType: 'integer'
	},
	{
		parameter: {
			handler: 'TextureTransformHandler',
			name: 'uvw_transform'
			type: 'componentTransform',
		},
		handler: componentTransformHandler
	},
	{
		parameter: {
			type: 'color'
		},
		handler colorHandler
	},
	{
		parameter: {
			type: '(acolor|float) texture'
		},
		handler nodeReferenceHandler
	}
];

VRMat.specCreator = function( vrMatJSON, library, callback ) {

	if( ! vrMatJSON || ! vrMatJSON.vismat ) {
		return;
	}

	var graph = new OMG.Graph();

	var assets = vrMatJSON.vismat.Asset;
	//console.log( assets );
	for( var i = 0; i < assets.length; i ++ ) {
		var asset = assets[i];
		//console.log( 'ASSET', asset );
		var plugins = asset.plugin;
		for( var k = 0; k < plugins.length; k ++ ) {
			var plugin = plugins[k];
			//console.log( 'PLUGIN', plugin );
			var vrayplugins = plugin.vrayplugin;
			for( var m = 0; m < vrayplugins.length; m ++ ) {
				var vrayPlugin = vrayplugins[m];
				//console.log( 'VRAYPLUGIN', vrayPlugin );
				if( vrayPlugin ) {

					//specLibrary.get( varPlugin );

					var nodeName = vrayPlugin['$'].name;
					var params = vrayPlugin.parameters[0].parameter;

					var spec = library.get( this.nodeName );
					if( ! spec ) {

						//var requestNodeSpec = ...;
						//if( ! requestNodeSpec ) {
						var nodeOutputType = vrayPlugin['$'].type;
						var nodeOutput = sanitizeNodeOutput( nodeName, nodeOutputType );
						var spec = {
							name: nodeName,
							version: "0.0.1",
							description: "Auto-generated",
							inputs: {

							},
							outputs: {
								default: {
									type: nodeOutput.type
								}
							}
						};
						//if( pluginNameToStructure[ nodeName ] ) {
							//continue;
						//}
							for( var j = 0; j < params.length; j ++ ) {
							var param = params[j];
							//console.log( 'PARAM', param );
							var paramName = param['$'].name;
							var paramType = param['$'].type;
							var nodeInput = sanitizeNodeInput( paramName, paramType, param.value );

							spec.inputs[ nodeInput.name ] = {
								type: nodeInput.type,
								value: nodeInput.value
							};
						}

						library.add( spec );

					};
					var node = new OMG.Node( graph, spec );
					node.label = asset.url;
					console.log( "node.label", node.label );
					for( var j = 0; j < params.length; j ++ ) {
						var param = params[j];
						var handler = param.handler;
						switch( handler ) {
							case 'ColorTexFrameHandler':
							case 'FloatTexFrameHandler':
							case 'TextureHandler':
								// node reference
								break;

							case 'FileBrowserHandler':
								// file reference
								break;

							case 'ComboBoxHandler':
								// choice handler
								break;

							case 'TextureTransformHandler':
								// matrix as rotation, offset, scale and mirror
								break;

					}
					//console.log();
					//console.log( JSON.stringify( data, null, 4 ) );
					//console.log();
					callback( null, nodeName, spec );
				}
			}
		}
	}

//	if( callback ) callback( vrMatJSON );

};


VRMat.parseFromString = function( string, callback ) {
	//console.log( 'VRMat.parseFromString' );

	xml2js.parseString( string, function( err, result ) {
		//console.log( 'varxml2js.parseString', err, JSON.stringify( result, null, '  ' ) );
		callback( result );
	});

};

VRMat.parseFromFile = function( fileName, callback ) {
	//console.log( 'VRMat.parseFromFile' );

	fs.readFile( fileName, 'utf8', function (err, data) {
		//console.log( 'readFileSync', err, data );
		if (err) return callback( err );
  		return VRMat.parseFromString( data, callback );
	});

};



module.exports = VRMat;
