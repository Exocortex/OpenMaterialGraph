var R = require('ramda');

var VRMatValueParser = function() {
};

VRMatValueParser.fileName = function( value ) {
	if( value === undefined && value === null ) return null;

	return value;
};

VRMatValueParser.componentTransform = function( value ) {
	if( value === undefined && value === null ) return null;

	return {
		rotation: {
			x: value.componentTransform.x_rotation,
			y: value.componentTransform.y_rotation,
			z: value.componentTransform.z_rotation
		},
		translation: {
			x: value.componentTransform.x_offset,
			y: value.componentTransform.y_offset,
			z: value.componentTransform.z_offset
		},
		scale: {
			x: value.componentTransform.x_scale,
			y: value.componentTransform.y_scale,
			z: value.componentTransform.z_scale
		},
		mirror: {
			x: value.componentTransform.x_mirror,
			y: value.componentTransform.y_mirror,
			z: value.componentTransform.z_mirror
		}
	};
};

VRMatValueParser.boolean = function( value ) {
	if( value === undefined && value === null ) return null;

	return ( parseInt( value ) === 1 );
};

VRMatValueParser.integer = function( value ) {
	if( value === undefined && value === null ) return null;

	return parseInt( value );
};

VRMatValueParser.float = function( value ) {
	if( value === undefined && value === null ) return null;

	return parseFloat( value );
};

VRMatValueParser.string = function( value ) {
	if( value === undefined && value === null ) return "";

	return value;
};

VRMatValueParser.color = function( value ) {
	if( value === undefined && value === null ) return null;

	// not a color
	if( value.r === undefined || value.g === undefined || value.b === undefined ) {
		return null;
	}

	return value;
};

VRMatValueParser.reference = function( value ) {
	if( value === undefined && value === null ) return null;

	return {
		referenceType: 'label',
		label: value + "/default"
	};
};

VRMatValueParser.colorOrReference = function( value ) {
	var result = VRMatValueHandlers.color( value );

	if( ! result ) {
		return VRMatValueHandlers.reference( value );
	}
};

VRMatValueParser.parsers = [
	{
		match: function( parameter ) {
			return( parameter.handler === 'FileBrowserHandler' ) && ( parameter.type === 'string' );
		},
		parse: VRMatValueParser.fileName
	},
	{
		match: function( parameter ) {
			return ( parameter.type === 'string' );
		},
		parse: VRMatValueParser.string
	},
	{
		match: function( parameter ) {
			return ( parameter.type === 'integer' );
		},
		parse: VRMatValueParser.integer
	},
	{
		match: function( parameter ) {
			return ( parameter.type === 'componentTransform' );
		},
		parse: VRMatValueParser.componentTransform
	},
	{
		match: function( parameter ) {
			return ( parameter.type === 'color' ) || ( parameter.type === 'acolor' );
		},
		parse: VRMatValueParser.color
	},
	{
		match: function( parameter ) {
			return ( parameter.type === 'acolor texture' ) || ( parameter.type === 'color texture' );
		},
		parse: VRMatValueParser.colorOrReference
	},
	{
		match: function( parameter ) {
			return ( parameter.type === 'plugin' );
		},
		parse: VRMatValueParser.reference
	}
];

VRMatValueParser.parse = function( param ) {

  var parser = R.find( function( parser ) {
    return parser.match( param['$'] );
  }, VRMatValueParser.parsers );

  return parser.parse( param.value );
};

module.exports = VRMatValueParser;
