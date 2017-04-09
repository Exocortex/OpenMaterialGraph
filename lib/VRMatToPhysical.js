var _ = require('underscore');

var extractPhysical = function( varMatGraph ) {

};

var getRootNodes = function( graph ) {
  var rootNodes = [];
  var collectRootNodes = function( nodeName ) {
    var node = graph.nodes[nodeName];
    var connectedCount = 0;
    _.forEach( Object.keys( node.outputs ), function( outputName ) {
      var output = node.outputs[outputName];
      if( output.isConnected() ) {
        connectedCount ++;
      }
      //console.log( "output.isConnected()", output.isConnected(), node.path() );
    } );

    if( connectedCount === 0 ) {
      rootNodes.push( node );
    }
  };
  _.forEach( Object.keys( graph.nodes ), collectRootNodes );
  return rootNodes;
};

var getDiffuseColor = function( rootNode ) {
    return 0;
}

var nodeTreeToString = function( node, prefix ) {
  //console.log( node, prefix );
  console.log( prefix + node.label + " [" + node.spec.name + "]" );

  var prefix2 = prefix + ' ';
  for( var inputName in node.inputs ) {
    var input = node.inputs[inputName];
    //console.log( input );
    var text = prefix2 + '.' + inputName + " <" + input.spec.type + "> = ";
    var nodeValue = input.value;
    if( nodeValue && nodeValue.node ) {
      console.log( text );
      nodeTreeToString( nodeValue.node, prefix2 + ' ' );
    }
    else {
      console.log( text + JSON.stringify( nodeValue ) );
    }
  }
}

var treeToString = function( graph ) {
  var rootNodes = getRootNodes( graph );
  for( var i in rootNodes ) {
    console.log( nodeTreeToString( rootNodes[i], '' ) );
  }

}

var collectNodeInputVariations = function( nodes, nodeInputVariations ) {
  nodeInputVariations = nodeInputVariations || {};
  _.each( nodes, function( node ) {
    var inputVariations = nodeInputVariations[ node.spec.name ] || {};
    nodeInputVariations[ node.spec.name ] = inputVariations;

    _.each( node.inputs, function( input ) {
      var inputValue = input.value;
      if( inputValue === undefined || inputValue === null ) {
        inputValue = "<null>"
      }
      var variations = inputVariations[ input.spec.name ] || {};
      inputVariations[ input.spec.name ] = variations;
      if( inputValue.spec ) {
        inputValue = "<" + inputValue.node.spec.name + ">";
      }
      else {
        inputValue = JSON.stringify( inputValue );
      }
      variations[ inputValue ] = ( variations[ inputValue ] || 0 ) + 1;
    });
  });
  return nodeInputVariations;
}

var identifyVaryingNodeInputs = function( nodeInputVariations ) {
    var varyingNodeInputs = {};
    _.each( nodeInputVariations, function( inputVariations, nodeSpecName ) {
      _.each( inputVariations, function( variations, inputSpecName ) {
          var numVariations = Object.keys( variations ).length;
          if( numVariations > 1 ) {
            var fullName = nodeSpecName + '.' + inputSpecName;
            varyingNodeInputs[ fullName ] = variations;
          }
      });
    });

    return varyingNodeInputs;
}

var findBaseBRDFVRayMtl = function( node, optionalNodePath ) {
  if( ! node ) return null;

  if( optionalNodePath ) {
    optionalNodePath.push( node );
  }

  //console.log( 'findPrimaryBRDFVRayMtl', node.label, node.spec.name );
  switch( node.spec.name ) {

    case "BRDFVRayMtl":
      return node;

    case "MtlSingleBRDF":
      var input = node.inputs['brdf'];
      if( input && input.isConnected() ) {
        //console.log( 'connected input', input );
        return findBaseBRDFVRayMtl( input.value.node, optionalNodePath );
      }

      break;
    case "MtlASGVIS":
    case 'BRDFLayered':
          // get last brdf
      for( var i = 10; i >= 0; i -- ) {
        var inputName = 'brdfs' + i;
        var input = node.inputs[ inputName ];
        if( input && input.isConnected() ) {
          return findBaseBRDFVRayMtl( input.value.node, optionalNodePath )
        }
      }
      break;

  }
  console.log( "ERROR, can not traverse node in findBaseBRDFVRayMtl: " + node.label + " <" + node.spec.name + ">");

  return null;
}

var getColorFromInput = function( input, isFalloff ) {
    if( input ) {
      //console.log( 'getBaseColorFromInput: input', input.path() );
      if( input.isConnected() ) {
        return findColor( input.value.node, isFalloff );
      }

      var colorValue = input.value;
      if(( colorValue !== null )&&( colorValue !== undefined )&&( colorValue.r !== undefined )&&( colorValue.g !== undefined )&&( colorValue.b !== undefined )) {
        return colorValue;
      }
    }

    return { r: 1, g: 1, b: 1 };
}



var findColor = function( node, isFalloff, optionalNodePath ) {
  //console.log( 'findBaseColor: node', node.path() );

  var resultColor = { r: 1, g: 1, b: 1 };

  if( ! node ) return resultColor;

  if( optionalNodePath ) {
    optionalNodePath.push( node );
  }

  //console.log( 'findPrimaryBRDFVRayMtl', node.label, node.spec.name );

  //console.log( 'findColor',  node.spec.name );
  switch( node.spec.name ) {

    case "TexCombineColor":
      var input = node.inputs['texture'];
      if( input && input.isConnected() ) {
        //console.log( 'connected input', input );
        var color = findColor( input.value.node, isFalloff, optionalNodePath );
        if( color ) {
          resultColor.r *= color.r;
          resultColor.g *= color.g;
          resultColor.b *= color.b;
        }
      }
      //console.log( 'texture_multiplier',  node.inputs['texture_multiplier'] ? node.inputs['texture_multiplier'].value : null );
      //console.log( 'result_multiplier', node.inputs['result_multiplier'] ? node.inputs['result_multiplier'].value : null );

      var colorInput = node.inputs['color'];
      var color = colorInput.value;
      if( color ) {
        resultColor.r *= color.r;
        resultColor.g *= color.g;
        resultColor.b *= color.b;
      }
      return resultColor;

    case "TexFalloff":
      var input = node.inputs[ isFalloff ? 'color2' : 'color1'];
      if( input && input.isConnected() ) {
        //console.log( 'connected input', input );
        var color = findColor( input.value.node, false, optionalNodePath );
        if( color ) {
          resultColor.r *= color.r;
          resultColor.g *= color.g;
          resultColor.b *= color.b;
        }
      }
      return resultColor;
  }
  //console.log( "ERROR, can not traverse node in findBaseColor: " + node.label + " <" + node.spec.name + ">");
  //nodeTreeToString( node, '' );
  return resultColor;
}



var findTexBitmap = function( node, isFalloff, optionalNodePath ) {
  //console.log( 'findBaseTexBitmap: node', node.path() );

  if( ! node ) return null;

  if( optionalNodePath ) {
    optionalNodePath.push( node );
  }

  //console.log( 'findPrimaryBRDFVRayMtl', node.label, node.spec.name );
  switch( node.spec.name ) {

    case "TexBitmap":
      return node;

    case "TexCombineColor":
      var input = node.inputs['texture'];
      if( input && input.isConnected() ) {
        //console.log( 'connected input', input );
        return findTexBitmap( input.value.node, isFalloff, optionalNodePath );
      }
      break;

    case "TexFalloff":
      var input = node.inputs[ isFalloff ? 'color2' : 'color1'];
      if( input && input.isConnected() ) {
        //console.log( 'connected input', input );
        return findTexBitmap( input.value.node, false, optionalNodePath );
      }
      break;
  }
  //console.log( "ERROR, can not traverse node in findBaseTexBitmap: " + node.label + " <" + node.spec.name + ">");
  //nodeTreeToString( node, '' );
  return null;
}

var getImagePropertiesFromTexBitmap = function( node ) {
  if( ! node ) return null;
  if( node.spec.name !== "TexBitmap" ) throw new Error( "unknown node type: " + node.spec.name );
  var properties = {};

  var uvwGen = node.inputs['uvwgen'].value.node;
  if( uvwGen ) {
    properties['wrap'] = {
      x: ( uvwGen.inputs['wrap_u'].value === 1 ),
      y: ( uvwGen.inputs['wrap_v'].value === 1 )
    };

    var safeInverse = function( a ) {
      if( a ) return 1.0 / a;
      return 1.0;
    }
    var transformComponents = uvwGen.inputs['uvw_transform'].value;
    if( transformComponents ) {
      properties['repeat'] = {
        x: parseFloat( transformComponents.scale.x ),
        y: parseFloat( transformComponents.scale.y )
      };
      properties['offset'] = {
        x: parseFloat( transformComponents.translation.x ),
        y: parseFloat( transformComponents.translation.y )
      };
    }
  }

  properties['invert'] = false;

  var bitmapInput = node.inputs['bitmap'];
  if( bitmapInput.isConnected() ) {
    var bitmapBuffer = bitmapInput.value.node;
    if( bitmapBuffer ) {
      var fileName = bitmapBuffer.inputs['file'].value;
      if( fileName ) {
        properties['fileName'] = fileName;
      }
    }
  }
  return properties;
}

var getImageFromInput = function( input, isFalloff ) {
  //console.log( 'getImageFromInput: input', input.path() );
  if( ! input || ! input.value ) return null;
  if( ! input.isConnected() ) return null;
  var bitmapTex = findTexBitmap( input.value.node, isFalloff );
  if( ! bitmapTex ) return null;
  return getImagePropertiesFromTexBitmap( bitmapTex );
}

var getBumpPropertiesFromNode = function( node ) {

  var bumpOnInput = node.inputs[ 'bump_on' ];
  if( bumpOnInput && bumpOnInput.value ) {
    var properties = {};
    var bumpScale = node.inputs['bump_tex_mult'];
    properties['bumpScale'] = bumpScale.value;
    properties['bumpMap'] = getImageFromInput( node.inputs['bump_tex'] );
    return properties;
  }

  var connectedInputs = node.outputs['default'].connectedInputs;
  for( var uuid in connectedInputs ) {
    var input = connectedInputs[uuid];
    return getBumpPropertiesFromNode( input.node );
  }

  return null;
}

var getPhysicalPropertiesFromBRDFVRayMtl = function( node ) {
  if( ! node ) return {
    'baseColor': { r:1, g:1, b:0}
  }

  if( node.spec.name !== "BRDFVRayMtl" ) throw new Error( "unknown node type: " + node.spec.name );

  var properties = {};
  properties['baseMap'] = getImageFromInput( node.inputs['diffuse'], false );
  if( properties['baseMap'] ) {
    properties['baseColor'] = { r:1, g:1, b:1 };
  }
  else {
    properties['baseColor'] = getColorFromInput( node.inputs['diffuse'], false );
  }

  properties['baseFalloffMap'] = getImageFromInput( node.inputs['diffuse'], true );
  if( properties['baseFalloffMap'] ) {
    properties['baseFalloffColor'] = { r:1, g:1, b:1 };
  }
  else {
    properties['baseFalloffColor'] = getColorFromInput( node.inputs['diffuse'], true );
  }

  var refractColor = getColorFromInput( node.inputs['refract'], false );
  var refractMono = ( refractColor.r + refractColor.g + refractColor.b ) * 0.3333333;
  var opacity = 1.0 - refractMono;
  properties['opacityFactor'] = opacity;

  properties['opacityMap'] = getImageFromInput( node.inputs['refract'], false );
  if( properties['opacityMap'] ) {
    properties['opacityMap']['invert'] = ! properties['opacityMap']['invert'];
  }

  if( properties['opacityFactor'] === 1 ) {
    var opacityColor = getColorFromInput( node.inputs['opacity'], false );
    var opacityMono = ( opacityColor.r + opacityColor.g + opacityColor.b ) * 0.3333333;
    properties['opacityFactor'] = opacityMono;
  }

  if( ! properties['opacityMap'] ) {
    properties['opacityMap'] = getImageFromInput( node.inputs['opacity'], false );
  }

  properties['baseFalloff'] = true;
  if( _.isEqual( properties['baseMap'], properties['baseFalloffMap'] ) ) {
    delete properties['baseFalloffMap'];
    if( _.isEqual( properties['baseColor'], properties['baseFalloffColor'] ) ) {
      delete properties['baseFalloffColor'];
      properties['baseFalloff'] = false;
    }
  }

  properties['roughness'] = getColorFromInput( node.inputs['reflect_glossiness'], false ).r;
  if( properties['roughness'] ) {
    properties['roughness'] = Math.sqrt( 1 - properties['roughness'] );
  }
  properties['roughnessMap'] = getImageFromInput( node.inputs['reflect_glossiness'], false );
  if( properties['roughnessMap'] ) {
    properties['roughnessMap']['invert'] = true;
  }

  properties['metallic'] = getColorFromInput( node.inputs['reflect'], false ).r;
  properties['metallicMap'] = getImageFromInput( node.inputs['reflect'], false );

  var bumpProperties = getBumpPropertiesFromNode( node );
  if( bumpProperties ) {
    properties = _.extend( properties, bumpProperties );
  }

  return properties;
};

var getPhysicalPropertiesFromVRMat = function( vrMat ) {
  var rootNodes = getRootNodes( vrMat );
  if( rootNodes.length !== 1) {
    var bestRootNode = null;
    //console.log( "num of rootNodes: ", rootNodes.length, " num of total nodes:", Object.keys( vrMat.nodes ).length );
    for( var i = 0; i < rootNodes.length; i ++ ) {
      //console.log( 'rootNode', rootNodes[i].label, rootNodes[i].spec.type, rootNodes[i].spec.name, rootNodes[i].spec.outputs.default.type );
      if( rootNodes[i].spec.outputs.default.type === "material" ) {
        bestRootNode = rootNodes[i];
      }
    }
    if( bestRootNode ) {
      rootNodes = [ bestRootNode ];
    }
    else {
      return {
        'baseColor': { r:1, g:0, b:0}
      };
    }
  }

  var baseBRDFVRayMtl = findBaseBRDFVRayMtl( rootNodes[0] );

  //nodeTreeToString( baseBRDFVRayMtl, '' );
  //console.log( 'primary BRDF VRay Mtl: ' + baseBRDFVRayMtl.path() + " <" + baseBRDFVRayMtl.spec.name + ">");
  return getPhysicalPropertiesFromBRDFVRayMtl( baseBRDFVRayMtl );
}

module.exports = {
  extractPhysical: extractPhysical,
  getRootNodes: getRootNodes,
  nodeTreeToString: nodeTreeToString,
  treeToString: treeToString,
  findPrimaryBRDFVRayMtl: findBaseBRDFVRayMtl,
  getPhysicalPropertiesFromVRMat: getPhysicalPropertiesFromVRMat,
  collectNodeInputVariations: collectNodeInputVariations,
  identifyVaryingNodeInputs: identifyVaryingNodeInputs,
};
