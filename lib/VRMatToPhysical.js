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

var treeToString = function( graph ) {
  var rootNodes = getRootNodes( graph );
}

module.exports = {
  extractPhysical: extractPhysical,
  getRootNodes: getRootNodes,
  treeToString: treeToString,
};
