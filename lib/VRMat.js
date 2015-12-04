var specgraph = require('specgraph');
var fs = require('fs');
var xml2js = require('xml2js');

VRMat = function () {
};

VRMat.prototype = Object.create( specgraph.Graph.prototype );
VRMat.prototype.constructor = VRMat;

VRMat.parseFromString = function( string, callback ) {

	varxml2js.parseString( string, function( err, result ) {

		console.log( result );

	});

};

VRMat.parseFromFile = function( fileName, callback ) {

	fs.readFileSync( fileName, 'utf-8', function (err, data) {
		if (err) return callback( err );
  		return VRMat.parseFromString( data, callback );
	});

};



module.exports = VRMat;