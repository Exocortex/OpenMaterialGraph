/**
 * @author bhouston / http://clara.io
 */

OMG.NodeInput = function ( node, name, dataType ) {

	if( node === undefined ) throw new Error();
	if( name === undefined ) throw new Error();
	if( dataType === undefined ) throw new Error();

	this.node = node;
	this.name = name;
	this.dataType = dataType;
	this.connectedOutput = null;

};

OMG.NodeInput.prototype = {

	constructor: OMG.NodeInput,

	connect: function( output ) {

		if( this.connectedOutput !== null ) throw new Error();
		if( output.connectedInputs.indexOf( this ) >= 0 ) throw new Error();
		if( this.dataType !== output.dataType ) throw new Error();

		this.connectedOutput = output;
		output.connectedInputs.push( this );

	},

	toJSON: function() {

	}

};