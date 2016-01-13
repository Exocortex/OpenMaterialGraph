var R = require('ramda');


var extractPhysical = function( varMatGraph ) {

};

var getRootNodes = function( graph ) {
  var rootNodes = [];
  var collectRootNodes = function( nodeName ) {
    var node = graph.nodes[nodeName];
    var connectedCount = 0;
    R.forEach( function( outputName ) {
      var output = node.outputs[outputName];
      if( output.isConnected() ) {
        connectedCount ++;
      }
      //console.log( "output.isConnected()", output.isConnected(), node.path() );
    }, Object.keys( node.outputs ) );

    if( connectedCount === 0 ) {
      rootNodes.push( node );
    }
  };
  R.forEach( collectRootNodes, Object.keys( graph.nodes ) );
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

var getBaseColorFromInput = function( input ) {
  //console.log( 'getBaseColorFromInput: input', input.path() );

    if( input.isConnected() ) {
      return findBaseColor( input.value.node );
    }

    var colorValue = input.value;
    if(( colorValue.r !== undefined )&&( colorValue.r !== undefined )&&( colorValue.r !== undefined )) {
      return colorValue;
    }

    return { r: 1, g: 1, b: 1 };
}

var findBaseColor = function( node, optionalNodePath ) {
  //console.log( 'findBaseColor: node', node.path() );

  var resultColor = { r: 1, g: 1, b: 1 };

  if( ! node ) return resultColor;

  if( optionalNodePath ) {
    optionalNodePath.push( node );
  }

  //console.log( 'findPrimaryBRDFVRayMtl', node.label, node.spec.name );

  switch( node.spec.name ) {

    case "TexCombineColor":
      var input = node.inputs['texture'];
      if( input && input.isConnected() ) {
        //console.log( 'connected input', input );
        var color = findBaseColor( input.value.node, optionalNodePath );
        if( color ) {
          resultColor.r *= color.r;
          resultColor.g *= color.g;
          resultColor.b *= color.b;
        }
      }
      var colorInput = node.inputs['color'];
      var color = colorInput.value;
      if( color ) {
        resultColor.r *= color.r;
        resultColor.g *= color.g;
        resultColor.b *= color.b;
      }
      return resultColor;

    case "TexFalloff":
      var input = node.inputs['color1'];
      if( input && input.isConnected() ) {
        //console.log( 'connected input', input );
        var color = findBaseColor( input.value.node, optionalNodePath );
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

var findBaseTexBitmap = function( node, optionalNodePath ) {
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
        return findBaseTexBitmap( input.value.node, optionalNodePath );
      }
      break;

    case "TexFalloff":
      var input = node.inputs['color1'];
      if( input && input.isConnected() ) {
        //console.log( 'connected input', input );
        return findBaseTexBitmap( input.value.node, optionalNodePath );
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

    var transformComponents = uvwGen.inputs['uvw_transform'].value;
    if( transformComponents ) {
      properties['repeat'] = {
        x: 1.0 / transformComponents.scale.x,
        y: 1.0 / transformComponents.scale.y
      };
      properties['offset'] = {
        x: transformComponents.translation.x,
        y: transformComponents.translation.y
      };
    }
  }

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

var getImageFromInput = function( input ) {
  //console.log( 'getImageFromInput: input', input.path() );
  if( ! input.isConnected() ) return null;
  var bitmapTex = findBaseTexBitmap( input.value.node );
  if( ! bitmapTex ) return null;
  return getImagePropertiesFromTexBitmap( bitmapTex );
}

var getPhysicalPropertiesFromBRDFVRayMtl = function( node ) {
  if( ! node ) return null;
  if( node.spec.name !== "BRDFVRayMtl" ) throw new Error( "unknown node type: " + node.spec.name );

  var properties = {};
  properties['color'] = getBaseColorFromInput( node.inputs['diffuse'] );
  properties['map'] = getImageFromInput( node.inputs['diffuse'] );

  return properties;
};

var getPhysicalPropertiesFromVRMat = function( vrMat ) {
  var rootNodes = getRootNodes( vrMat );
  if( rootNodes.length !== 1) return null;

  var baseBRDFVRayMtl = findBaseBRDFVRayMtl( rootNodes[0] );
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
};
