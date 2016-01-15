var _ = require('underscore');

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
    var entryType = "";
    if( name === "brdfs" ) {
      entryType = "brdf";
    }
    else if( name === "weights" ) {
      entryType = "float";
    }
    else if( name === "channels" ) {
      entryType = "string";
    }
    else if( name === "psd_group_name" || name === "psd_alpha_name" ) {
      entryType = "string";
    }
    else {
      console.log( "WARNING, unknown list param type: ", name, type, value );
    }

    var listResults = [];
    for( var i = 0; i < 10; i ++ ) {
      var listResult = {
        name: name + i,
        type: entryType,
        value: null
      }
      listResults.push( listResult );
    }
    result = listResults;
  }
  else {
    if( ! result.value ) {
      result.value = null;
      return result;
    }
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

VRMatSpecInferer.infer = function( vrayPlugin, spec ) {

  var nodeName = vrayPlugin['$'].name;
  var params = vrayPlugin.parameters[0].parameter;
  var nodeOutputType = vrayPlugin['$'].type;

  //console.log( "--------------------------------------------------------------------------------------")
  //console.log( 'params', params );

  var nodeOutput = sanitizeNodeOutput( nodeName, nodeOutputType );
  spec = spec || {
    name: nodeName,
    version: "0.0.1",
    description: "Auto-generated",
    inputs: {

    },
    outputs: {
      default: {
        name: 'default',
        type: nodeOutput.type
      }
    }
  };
  //console.log( 'params', params );
  _.forEach( params, function( param ) {
    //console.log( 'param', param );
    //param = param;
    //console.log( 'param', param );
    var paramName = param['$'].name;
    var paramType = param['$'].type;
    var nodeInput = sanitizeNodeInput( paramName, paramType, param.value );

    if( nodeInput.length ) {
        for( var i = 0; i < nodeInput.length; i ++ ) {
          spec.inputs[ nodeInput[i].name ] = {
            name: nodeInput[i].name,
            type: nodeInput[i].type,
            value: nodeInput[i].value
          };
        }
    }
    else {
      spec.inputs[ nodeInput.name ] = {
        name: nodeInput.name,
        type: nodeInput.type,
        value: nodeInput.value
      };
    }
  } );

  //console.log( 'spec.inputs', spec.inputs );

  return spec;
};

module.exports = VRMatSpecInferer;
