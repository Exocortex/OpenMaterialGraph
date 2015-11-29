/**
 * @author bhouston / http://clara.io
 */

OMG.NodeOutput = function ( node, name, dataType ) {

	if( node === undefined ) throw new Error();
	if( name === undefined ) throw new Error();
	if( dataType === undefined ) throw new Error();

	this.node = node;
	this.name = name;
	this.dataType = dataType;
	this.connectedOutput = null;

};

OMG.NodeOutput.prototype = {

	constructor: OMG.NodeOutput,

	connect: function( input ) {

		input.connect( this );

	},

	toJSON: function() {

	}

};