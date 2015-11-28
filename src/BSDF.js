/**
 * @author bhouston / http://clara.io
 *
 * A Node with a BSDF output.  Or derived from the BSDF Node type.
 *
 */

OMG.BSDF = function () {

	OMG.Node.call( this );
	this.out.push( new OMG.NodeOutput( this, OMG.TYPES.BSDF, 'bsdf' ) );

};

OMG.BSDF.prototype = Object.create( OMG.Node.prototype );

OMG.BSDF.prototype = {

	constructor: OMG.BSDF,

};
