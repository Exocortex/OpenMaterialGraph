/**
 * @author bhouston / https://clara.io
 */

module( "Camera" );

test( "phong-blinnPhong", function() {
	
	for( var i = 0; i < 2048; i ++ ) {
		var j = blinnPhongExponentToPhongShininess( phongShininessToBlinnExponent( i ) );
		ok( j === i );
	}

});

test( "roughness-blinnPhong", function() {

	for( var i = 0; i < 1; i += 0.01 ) {
		var j = blinnExponentToRoughnessAlpha( roughnessAlphaToBlinnExponent( i ) );
		ok( j === i );
	}

});

test( "phongShininess-vrayGlossiness", function() {

	for( var i = 0; i < 1; i += 0.01 ) {
		var j = phongShininessToVrayPhongGlossiness( vrayPhongGlossinessToPhongShininess( i ) );
		ok( j === i );
	}
	
});

test( "blinnPhongExponent-vrayGlossiness", function() {

	for( var i = 0; i < 1; i += 0.01 ) {
		var j = blinnPhongExponentToVrayBlinnPhongGlossiness( vrayBlinnPhongGlossinessToBlinnPhongExponent( i ) );
		ok( j === i );
	}
	
});

test( "roughnessAlpha-vrayGlossiness", function() {

	for( var i = 0; i < 1; i += 0.01 ) {
		var j = roughnessAlphaToVrayGGXGlossiness( vrayGGXGlossinessToRoughnessAlpha( i ) );
		ok( j === i );
	}
	
});

test( "dielectricFresnel-F0", function() {

	for( var i = 0.1; i < 100; i += 0.1 ) {
		var j = f0ToDielectricRefractionIndex( dielectricRefractionIndexToF0( i ) );
		ok( j === i );
	}
	
});

