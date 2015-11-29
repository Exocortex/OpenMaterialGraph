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