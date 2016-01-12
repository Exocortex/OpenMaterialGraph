var R = require('ramda');

var VRMatValueParser = function() {
};

VRMatValueParser.fileName = function( value ) {
	if( value === undefined || value === null ) return null;

	return value;
};

VRMatValueParser.componentTransform = function( value ) {
	if( value === undefined || value === null ) return null;
  var base = value.componentTransform[0];
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
	if( value === undefined || value === null || value.length === 0 ) return null;

	return ( parseInt( value ) === 1 );
};

VRMatValueParser.integer = function( value ) {
	if( value === undefined || value === null || value.length === 0 ) return null;

	return parseInt( value );
};

VRMatValueParser.float = function( value ) {
	if( value === undefined || value === null || value.length === 0 ) return null;

	return parseFloat( value );
};

VRMatValueParser.string = function( value ) {
	if( value === undefined || value === null || value.length === 0 ) return "";

	return value;
};

VRMatValueParser.color = function( value ) {
	if( value === undefined || value === null || value.length === 0 ) return null;

	// not a color
	if( value.r === undefined || value.g === undefined || value.b === undefined ) {
		return null;
	}

	return {
		r: value.r[0],
		g: value.g[0],
		b: value.b[0]
	};
};

VRMatValueParser.acolor = function( value ) {
	if( value === undefined || value === null || value.length === 0 ) return null;

	// not a color
	if( value.r === undefined || value.g === undefined || value.b === undefined || value.a === undefined ) {
		return null;
	}

	return {
		r: value.r[0],
		g: value.g[0],
		b: value.b[0],
		a: value.a[0]
	};
};

VRMatValueParser.reference = function( value ) {
	if( value === undefined || value === null || value.length === 0 ) return null;

	//console.log( 'value for reference', value, value.length, ! value  );
	return {
		referenceType: 'label',
		label: value + "/default"
	};
};

VRMatValueParser.colorOrReference = function( value ) {
	var result = VRMatValueParser.color( value );

  if( result ) return result;

	return VRMatValueParser.reference( value );
};

VRMatValueParser.acolorOrReference = function( value ) {
	var result = VRMatValueParser.acolor( value );

	if( result ) return result;

	return VRMatValueParser.reference( value );
};

VRMatValueParser.referenceList = function( value ) {
	var entries = value.list.entry;

	var references = {
			referenceType: 'labels',
			labels: []
		};

	for( var i = 0; i < entries.length; i ++ ) {
		references.labels[i] = entries[i];
	}

	console.log( 'references', references );

	return weightReferences;
};

VRMatValueParser.parsers = [
	{
		match: function( parameter ) {
			return (( parameter.handler === 'weights' ) ||( parameter.handler === 'brdfs' )) && ( parameter.type === 'list' );
		},
		parse: VRMatValueParser.referenceList
	},
	{
		match: function( parameter ) {
			return ( parameter.handler === 'FileBrowserHandler' ) && ( parameter.type === 'string' );
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
			return ( parameter.type === 'float' );
		},
		parse: VRMatValueParser.float
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
			return ( parameter.type === 'color' );
		},
		parse: VRMatValueParser.color
	},
	{
		match: function( parameter ) {
			return ( parameter.type === 'acolor' );
		},
		parse: VRMatValueParser.acolor
	},
	{
		match: function( parameter ) {
			return ( parameter.type === 'color texture' );
		},
		parse: VRMatValueParser.colorOrReference
	},
	{
		match: function( parameter ) {
			return ( parameter.type === 'acolor texture' );
		},
		parse: VRMatValueParser.acolorOrReference
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
    var result = parser.parse( param.value[0] );
		if( result === undefined ) {
			console.log( param );
			console.log( parser );
		}
		return result;
  }

  return null;
};

module.exports = VRMatValueParser;
