/**
 * @author bhouston / http://clara.io
 */

OMG.Node = function ( material, template, name ) {

	if( material === undefined ) throw new Error();
	if( template === undefined ) throw new Error();

	this.material = material
	this.template = template;
	this.name = ( name !== undefined ) ? name : "";

	this.in = [];
	this.out = [];

};

OMG.Node.prototype = {

	constructor: OMG.Node,

	addParameter: function( direction, name, dataType ) {
		
		var parameter = new OMG.NodeParameter( this, direction, name, dataType );

		switch( direction ) {

			case OMG.DIRECTION.IN:
				this.in.push( parameter );
				break;

			case OMG.DIRECTION.OUT:
				this.out.push( parameter );
				break;

			default:
				throw new Error();
				
		}

		return parameter;
	},

	toJSON: function() {

	}

};

OMG.Node.fromJSON = function( json ) {

};