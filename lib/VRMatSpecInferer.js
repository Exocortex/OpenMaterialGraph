var R = require('ramda');

var VRMatSpecInferer = function() {
};

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

VRMatSpecInferer.infer = function( vrayPlugin ) {

	var nodeName = vrayPlugin['$'].name;
	var params = vrayPlugin.parameters[0].parameter;
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

	R.forEach( function( param ) {
		var paramName = param['$'].name;
		var paramType = param['$'].type;
		var nodeInput = sanitizeNodeInput( paramName, paramType, param.value );

		spec.inputs[ nodeInput.name ] = {
			type: nodeInput.type,
			value: nodeInput.value
		};
	}, params );

	return spec;
};

module.exports = VRMatSpecInferer;
