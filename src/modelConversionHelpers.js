
// source: https://en.wikipedia.org/wiki/Blinn%E2%80%93Phong_shading_model#Description
function phongShininessToBlinnExponent( float phongShininess ) {
	return phongShininess * 4;
}
// dervied
function blinnPhongExponentToPhongShininess( float blinnPhongExponent ) {
	return blinnPhongExponent / 4;
}

// NOTEL roughnessAlpha needs to be squared before passing it into the GGX/GTR distribution
// source: http://computergraphics.stackexchange.com/questions/1515/what-is-the-accepted-method-of-converting-shininess-to-roughness-and-vice-versa
function roughnessAlphaToBlinnExponent( float gtrRoughness ) {
	return ( 2.0 / Math.pow( gtrRoughness, 2 ) ) - 2;
}
// source: http://simonstechblog.blogspot.de/2011/12/microfacet-brdf.html
function blinnExponentToRoughnessAlpha( float blinnExponent ) {
	return Math.sqrt( 2 / ( roughnessAlpha + 2 );
}

// source: Vlado
function vrayPhongGlossinessToPhongShininess( vrayGlossiness ) {
	return 1.0 / Math.pow( Math.max( 1 - vrayGlossiness, 1e-4 ), 3.5 ) - 1.0;
}
// source: Vlado
function vrayBlinnPhongGlossinessToBlinnPhongExponent( vrayGlossiness ) {
	return 1.0 / Math.pow( Math.max( 1 - vrayGlossiness, 1e-4 ), 3.5 ) - 1.0;
}
// derived
function phongShininessToVrayPhongGlossiness( phongShininess ) { // assuming V-Ray Phong shader
	return 1 - Math.pow( 1 / ( phongShininess + 1 ), 1.0 / 3.5 );
}
// derived
function blinnPhongExponentToVrayBlinnPhongGlossiness( blinnPhongExponent ) { // assuming V-Ray Blinn shader
	return 1 - Math.pow( 1 / ( blinnPhongExponent + 1 ), 1.0 / 3.5 );
}

// source: Vlado
function vrayGGXGlossinessToRoughnessAlpha( vrayGlossiness ) {
	return Math.pow( Math.max( 1 - vrayGlossiness, 1e-4 ), 2 );
}
// derived
function roughnessAlphaToVrayGGXGlossiness( roughnessAlpha ) { // assuming a V-Ray GGX shader
	return 1.0 - Math.sqrt( roughnessAlpha );
}


// for Clara.io to match our roughness with V-Ray's Blinn shader we want:
var vrayGlossiness = blinnPhongExponentToVrayGlossiness( roughnessAlphaToBlinnExponent( roughnessAlpha ) );


// unknown mappings:

// appleseed glosiness to blinn-phong exponent
// source: https://github.com/appleseedhq/appleseed/blob/master/src/appleseed/renderer/modeling/bsdf/microfacetbrdf.cpp#L440
function glossiness_to_blinn_exponent( glossiness ) {
	return 100.0 * Math.pow( glossiness, 3 ) + 9900.0 * Math.pow( glossiness, 30 );
}

// PBRT roughness to alpha for GTR & Beckmann:
function roughToAlpha(rough) {
	rough = Math.max(rough, 1e-3);
	var x = Math.log(rough);
 	return 1.62142 + 0.819955*x + 0.1734*x*x + 0.0171201*x*x*x + 0.000640711*x*x*x*x;
}
