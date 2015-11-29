

/**
 * @author bhouston / http://clara.io
 */

OMG.Material = function () {

	this.nodes = [];

};

OMG.Material.prototype = {

	constructor: OMG.Material,

	newNode: function( nodeTemplate ) {

		var nodeSpec = OMG.getSpecJSON( nodeTemplate );

		var node = new OMG.Node( this, nodeSpec );
		this.nodes.push( node );

		return node;
	},

	connect: function( sourceNodeParameter, destNodeParameter ) {

	},

	disconnect: function( )

	toJSON: function() {

	}

};

OMG.Material.fromJSON = function( json ) {

};