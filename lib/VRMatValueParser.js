var R = require('ramda');

var VRMatValueParser = function() {
};

VRMatValueParser.fileName = function( value, param, node ) {
	if( value === undefined || value === null ) return null;

	var result = {};
	result[param.name] = value;
	return result;
};

VRMatValueParser.componentTransform = function( value, param, node ) {
	if( value === undefined || value === null ) return null;
  var base = value.componentTransform[0];

	var result = {};
	result[param.name] = {
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
	return result;
};

VRMatValueParser.boolean = function( value, param, node ) {
	if( value === undefined || value === null || value.length === 0 ) return null;

	var bool = ( parseInt( value ) === 1 );

	var result = {};
	result[param.name] = bool;
	return result;
};

VRMatValueParser.integer = function( value, param, node ) {
	if( value === undefined || value === null || value.length === 0 ) return null;

	var number = parseInt( value );
	if( isNaN( number ) ) return null;

	var result = {};
	result[param.name] = number;
	return result;
};

VRMatValueParser.float = function( value, param, node ) {
	if( value === undefined || value === null || value.length === 0 ) return null;

	var number = parseFloat( value );
	if( isNaN( number ) ) return null;

	var result = {};
	result[param.name] = number;
	return result;
};

VRMatValueParser.string = function( value, param, node ) {
	if( value === undefined || value === null || value.length === 0 ) return "";

	var result = {};
	result[param.name] = value;
	return result;
};

VRMatValueParser.color = function( value, param, node ) {
	if( value === undefined || value === null || value.length === 0 ) return null;

	// not a color
	if( value.r === undefined || value.g === undefined || value.b === undefined ) {
		return null;
	}

	var result = {};
	result[param.name] = {
		r: value.r[0],
		g: value.g[0],
		b: value.b[0]
	};
	return result;
};

VRMatValueParser.acolor = function( value, param, node ) {
	if( value === undefined || value === null || value.length === 0 ) return null;

	// not a color
	if( value.r === undefined || value.g === undefined || value.b === undefined || value.a === undefined ) {
		return null;
	}

	var result = {};
	result[param.name] = {
		r: value.r[0],
		g: value.g[0],
		b: value.b[0],
		a: value.a[0]
	};
	return result;
};

VRMatValueParser.reference = function( value, param, node ) {
	if( value === undefined || value === null || value.length === 0 ) return null;

	var result = {};
	result[param.name] = {
		referenceType: 'label',
		label: value + "/default"
	};
	return result;
};


VRMatValueParser.referenceList = function( value, param, node ) {
	if( value === undefined || value === null || value.length === 0 ) return null;

//	console.log( "referenceList", value.list[0].entry );

	//console.log( 'value for reference', value, value.length, ! value  );
	var result = {};
	if( ! value.list[0].entry ) {
		return result;
	}

	for( var i = 0; i < value.list[0].entry.length; i ++ ) {
		var entry = value.list[0].entry[i];
		if( ! ( entry === undefined || entry === null || entry.length === 0 ) ) {
			result[param.name + i] = {
				referenceType: 'label',
				label: entry + "/default"
			};
		}
	}
	//console.log( 'result', result );
	return result;
};

VRMatValueParser.parsers = [
	{
		name: "referenceList",
		match: function( parameter ) {
			return ( parameter.type === 'list' );
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

VRMatValueParser.parse = function( param, node ) {

	if( ! param.value ) {
		return {};
	}

  var parser = R.find( function( parser ) {
    return parser.match( param['$'] );
  }, VRMatValueParser.parsers );

	var inputNameToValues = null;
  if( parser ) {
		for( var i = 0; i < parser.parsers.length; i ++ ) {
    	inputNameToValues = parser.parsers[i]( param.value[0], param['$'], node );
			if( inputNameToValues !== null ) {
				break;
			}
		}
		if( inputNameToValues === undefined ) {
			console.log( param );
			console.log( parser );
		}

		//console.log( inputNameToValues );
		return inputNameToValues;
  }
	else {
		console.log( "     NO PARSER", parser, param.value, param['$'].name, param['$'].type );
	}

  return null;

};

module.exports = VRMatValueParser;
