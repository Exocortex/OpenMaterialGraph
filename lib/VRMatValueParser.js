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

	var result = parseInt( value );
	if( isNaN( result ) ) return null;
	return result;
};

VRMatValueParser.float = function( value ) {
	if( value === undefined || value === null || value.length === 0 ) return null;

	var result = parseFloat( value );
	if( isNaN( result ) ) return null;
	return result;
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
		name: "referenceList",
		match: function( parameter ) {
			return (( parameter.handler === 'weights' ) ||( parameter.handler === 'brdfs' )) && ( parameter.type === 'list' );
		},
		parsers: [ VRMatValueParser.referenceList ]
	},
	{
		name: "filename",
		match: function( parameter ) {
			return ( parameter.handler === 'FileBrowserHandler' ) && ( parameter.type === 'string' );
		},
		parsers: [ VRMatValueParser.fileName ]
	},
	{
		name: "string",
		match: function( parameter ) {
			return ( parameter.type === 'string' );
		},
		parsers: [ VRMatValueParser.string ]
	},
  {
		name: "float",
		match: function( parameter ) {
			return ( parameter.type === 'float' );
		},
		parsers: [ VRMatValueParser.float ]
	},
	{
		name: "integer",
		match: function( parameter ) {
			return ( parameter.type === 'integer' );
		},
		parsers: [ VRMatValueParser.integer ]
	},
	{
		name: "boolean",
		match: function( parameter ) {
			return ( parameter.type === 'bool' );
		},
		parsers: [ VRMatValueParser.boolean ]
	},
	{
		name: "componentTransform",
		match: function( parameter ) {
			return ( parameter.type === 'componentTransform' );
		},
		parsers: [ VRMatValueParser.componentTransform ]
	},
	{
		name: "color",
		match: function( parameter ) {
			return ( parameter.type === 'color' );
		},
		parsers: [ VRMatValueParser.color ]
	},
	{
		name: "acolor",
		match: function( parameter ) {
			return ( parameter.type === 'acolor' );
		},
		parsers: [ VRMatValueParser.acolor ]
	},
	{
		name: "floatOrReference",
		match: function( parameter ) {
			return ( parameter.type === 'float texture' );
		},
		parsers: [ VRMatValueParser.float, VRMatValueParser.reference ]
	},
	{
		name: "colorOrReference",
		match: function( parameter ) {
			return ( parameter.type === 'color texture' );
		},
		parsers: [ VRMatValueParser.color, VRMatValueParser.reference ]
	},
	{
		name: "acolorOrReference",
		match: function( parameter ) {
			return ( parameter.type === 'acolor texture' );
		},
		parsers: [ VRMatValueParser.acolor, VRMatValueParser.reference ]
	},
	{
		name: "reference",
		match: function( parameter ) {
			return ( parameter.type === 'plugin' );
		},
		parsers: [ VRMatValueParser.reference ]
	}
];

VRMatValueParser.parse = function( param ) {

  var parser = R.find( function( parser ) {
    return parser.match( param['$'] );
  }, VRMatValueParser.parsers );

  if( parser ) {
		var result = null;
		for( var i = 0; i < parser.parsers.length; i ++ ) {
    	result = parser.parsers[i]( param.value[0] );
			if( result !== null ) {
				break;
			}
		}
		if( result === undefined ) {
			console.log( param );
			console.log( parser );
		}
		console.log( parser.name, result, param.value[0], param['$'].name );
		return result;
  }
	else {
		console.log( "     NO PARSER", result, param.value[0], param['$'].name, param['$'].type );
	}

  return null;
};

module.exports = VRMatValueParser;
