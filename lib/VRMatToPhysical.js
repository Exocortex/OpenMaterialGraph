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

var findPrimaryBRDFVRayMtl = function( node, optionalNodePath ) {
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
        return findPrimaryBRDFVRayMtl( input.value.node, optionalNodePath );
      }

      break;
    case "MtlASGVIS":
    case 'BRDFLayered':
          // get last brdf
      for( var i = 10; i >= 0; i -- ) {
        var inputName = 'brdfs' + i;
        var input = node.inputs[ inputName ];
        if( input && input.isConnected() ) {
          return findPrimaryBRDFVRayMtl( input.value.node, optionalNodePath )
        }
      }
      break;

  }
  console.log( "ERROR, can not traverse node looking for PrimaryBRDFVrayMtl: " + node.label + " <" + node.spec.name + ">");

  return null;
}

module.exports = {
  extractPhysical: extractPhysical,
  getRootNodes: getRootNodes,
  treeToString: treeToString,
  findPrimaryBRDFVRayMtl: findPrimaryBRDFVRayMtl,
};
