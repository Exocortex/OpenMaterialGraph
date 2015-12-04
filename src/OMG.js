/**
 * @author bhouston / http://clara.io/
 */

var OMG = {

	VERSION: {	// SEMVER 2.0, reference http://semver.org
		MAJOR: 0,	// increment when you make incompatible API changes,
		MINOR: 1,	// increment when you add functionality in a backwards-compatible manner
		PATCH: 0	// increment you make backwards-compatible bug fixes
	};

}

OMG._SpecCache = {};	// written assuming this will be filled in with some specifications.

OMG.getSpecJSON = function( specPath ) {
	var specDirs = specPath.split( '/' );

	var spec = OMG._SpecCache;
	for( var i = 0; i < specDirs.length; i ++ ) {
		spec = spec[ specDirs[i] ];
	}

	return spec;
};

OMG.createUuid = generateUUID: function () {

	// http://www.broofa.com/Tools/Math.uuid.htm

	var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split( '' );
	var uuid = new Array( 36 );
	var rnd = 0, r;

	return function () {

		for ( var i = 0; i < 36; i ++ ) {

			if ( i === 8 || i === 13 || i === 18 || i === 23 ) {

				uuid[ i ] = '-';

			} else if ( i === 14 ) {

				uuid[ i ] = '4';

			} else {

				if ( rnd <= 0x02 ) rnd = 0x2000000 + ( Math.random() * 0x1000000 ) | 0;
				r = rnd & 0xf;
				rnd = rnd >> 4;
				uuid[ i ] = chars[ ( i === 19 ) ? ( r & 0x3 ) | 0x8 : r ];

			}

		}

		return uuid.join( '' );

	};

}();