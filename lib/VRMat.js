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

VRMat.specCreator = function( fileName, vrMatJSON, library, callback ) {

  if( ! vrMatJSON || ( ! vrMatJSON.vismat && ! vrMatJSON.vrmat )  ) {
    console.log( vrMatJSON );
    return callback( new Error( "invalid vrMatJSON, filename: " + fileName ) );
  }

  // need to wait until the full graph is created until resolving references
  var referencesToResolve = [];

  //console.log( "===================================================================================================" );
  var vrMatGraph = new VRMat();
  //console.log( "VRMAT", vrMatGraph );
  var assets = ( vrMatJSON.vismat || vrMatJSON.vrmat ).Asset;

//  var lastNode = null;

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

      //  lastNode = node;
        //console.log( "NODE LABEL", node.label );

        var params = vrayPlugin.parameters[0].parameter;
        R.forEach( function( param ) {
          var inputNameToValues = VRMatValueParser.parse( param, node );
          for( var inputName in inputNameToValues ) {
            var inputValue = inputNameToValues[ inputName ];
            if( inputValue !== null && inputValue.referenceType && inputValue.label && inputValue.label.length > 0 ) {
              //console.log( "node.inputs", node.inputs, 'params[$].name', param['$'].name );
              referencesToResolve.push( {
                input: node.inputs[ inputName ],
                reference: inputValue.label
              } );
            }
            else {
              var input = node.inputs[ inputName ];
              if( ! input ) console.log( 'can not find input: inputs', node.inputs, 'paramName', inputName );
              input.set( inputValue );
            }
          }
        }, params );

      }, plugin.vrayplugin );

    }, asset.plugin );

  }, assets );

//  lastNode.label = "Root";

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

  //  console.log( 'input', input );

    if( ! targetOutput ) {
      if( input.path().indexOf( "texmap_blend_") < 0 ) {
        console.log( "ignoring unresolveable reference on input:\n  " + input.path() + "\nreference path: " + referenceLabel );
      }
    }
    else {
    //console.log( "resolving: " + input.path() + " to " + targetOutput.path() )
      input.connect( targetOutput );
    }
  }, referencesToResolve );

  callback( null, vrMatGraph );
//  if( callback ) callback( vrMatJSON );

};


VRMat.parseFromString = function( fileName, string, library, callback ) {
  //console.log( 'VRMat.parseFromString' );

  xml2js.parseString( string, function( err, json ) {
    if (err) return callback( err );

  //  console.log( 'varxml2js.parseString', err, JSON.stringify( result, null, '  ' ) );
    VRMat.specCreator( fileName, json, library, callback );
  });

};

VRMat.parseFromFile = function( fileName, library, callback ) {
  //console.log( 'VRMat.parseFromFile' );

  fs.readFile( fileName, 'utf8', function (err, string) {
    if (err) return callback( err );

  //  console.log( 'readFileSync', err, data );
    VRMat.parseFromString( fileName, string, library, callback );
  });

};



module.exports = VRMat;
