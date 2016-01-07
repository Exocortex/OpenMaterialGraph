var R = require('ramda');

var VRMatValueParser = function() {
};

VRMatValueParser.fileName = function( value ) {
	if( value === undefined && value === null ) return null;

	return value;
};

VRMatValueParser.componentTransform = function( value ) {
	if( value === undefined && value === null ) return null;
  var base = value[0].componentTransform[0];
	return {
		rotation: {
			x: base.x_rotation[0],
			y: base.y_rotation[0],
			z: base.z_rotation[0]
		},
		translation: {
			y: base.y_offset[0],
      x: base.x_offset[0],
			z: base.z_offset[0]
		},
		scale: {
			x: base.x_scale[0],
			y: base.y_scale[0],
			z: base.z_scale[0]
		},
		mirror: {
			x: base.x_mirror[0],
			y: base.y_mirror[0],
			z: base.z_mirror[0]
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
	var result = VRMatValueParser.color( value );

	if( ! result ) {
		return VRMatValueParser.reference( value );
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

  if( parser ) {
    return parser.parse( param.value );
  }

  return null;
};

module.exports = VRMatValueParser;
