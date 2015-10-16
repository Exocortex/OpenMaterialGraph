// source: https://en.wikipedia.org/wiki/Blinn%E2%80%93Phong_shading_model#Description
function phongShininessToBlinnExponent( float phongShininess ) {
	return phongShininess * 4;
}
// dervied
function blinnPhongExponentToPhongShininess( float blinnPhongExponent ) {
	return blinnPhongExponent * 0.25;
}

// NOTEL roughnessAlpha needs to be squared before passing it into the GGX/GTR distribution
// source: http://computergraphics.stackexchange.com/questions/1515/what-is-the-accepted-method-of-converting-shininess-to-roughness-and-vice-versa
function roughnessAlphaToBlinnExponent( float gtrRoughness ) {
	return ( 2.0 / Math.pow( gtrRoughness, 2 ) ) - 2;
}
// source: http://simonstechblog.blogspot.de/2011/12/microfacet-brdf.html
function blinnExponentToRoughnessAlpha( float blinnExponent ) {
	return Math.sqrt( 2 / ( roughnessAlpha + 2 ) );
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
	var g = Math.max( 1 - vrayGlossiness, 1e-4 );
	return g*g;
}
// derived
function roughnessAlphaToVrayGGXGlossiness( roughnessAlpha ) { // assuming a V-Ray GGX shader
	return 1.0 - Math.sqrt( roughnessAlpha );
}


// XG conversions
float maxShininess = 8192.0;
float gloss = Math.clamp( shininess / maxShininess, 0.0, 1.0 );
float roughness = Math.clamp( sqrt( 8.0 / ( shininess + 7.0 ) ), 0.0, 1.0 );

// source: http://simonstechblog.blogspot.ca/2011/12/microfacet-brdf.html

// reflection at normal incident, n is dielectric refraction index
// source: http://www.codinglabs.net/article_physically_based_rendering_cook_torrance.aspx
function dielectricRefractionIndicesToF0( n1, n2 ) {
	var omn = ( n1 - n2 ) / ( n1 + n2 );
	return omn * omn;
}

function dielectricRefractionIndexToF0( n ) {
	return dielectricRefractionIndicesToF0( 1.0, n );
}

// derived via wolfram alpha: solve( a = (( 1-n ) / (1+n))^2, n )
function f0ToDielectricRefractionIndex( f0 ) {
	return ( Math.sqrt( f0 ) + 1 ) / ( 1 - Math.sqrt( f0 ) );
}

// use Schlick to calculate Fresnel curve
function dielectricFresnelReflectance( f0, light, half ) {
	return f0 + ( 1 - f0 ) * Math.pow( 1 - light.dot( half ) ), 5 );
}

// source: http://jcgt.org/published/0003/04/03/paper.pdf
function nkToEdgeTint( n, k ) {
	var np1 = n + 1, nm1 = n - 1;
	var kk = k*k;
	var r = ( nm1*nm1 + kk ) / ( np1*np1 + kk );
	var sqrt_r = Math.sqrt( r );
	var t = ( 1 + sqrt_r ) / ( 1 - sqrt_r );
	var g = ( t - n ) / ( t - ( 1 - r ) / ( 1 + r ) );
	return { r: r, g: g };
}

// source: http://jcgt.org/published/0003/04/03/paper.pdf
function edgeTintToNK( r, g ) {
	var sqrt_r = Math.sqrt( r );
	var n = g * ( 1 - r ) / ( 1 + r ) + ( 1 - g ) * ( 1 + sqrt_r ) / ( 1 - sqrt_r );
	var np1 = n + 1, nm1 = n - 1;
	var k = Math.sqrt( 1 / ( 1 - r ) * ( np1*np1 + nm1*nm1 ) );
	return { n: n, k: k };
}

// for Clara.io to match our GGX roughness with V-Ray's Blinn shader we want:
var vrayGlossiness = blinnPhongExponentToVrayBlinnPhongGlossiness( roughnessAlphaToBlinnExponent( roughnessAlpha ) );
var vrayFresnel = f0ToDielectricRefractionIndex( specular * 0.2 );

// for Clara.io's standard blinn phong exponent to V-Ray's Blin shader
var vrayGlossiness = blinnPhongExponentToVrayBlinnPhongGlossiness( blinnPhongExponent );
var vrayFresnel = 0;

// V-Ray's blinn phong exponent to Clara.io's GGX roughness
var gtrRoughness = blinnExponentToRoughnessAlpha( vrayBlinnPhongGlossinessToBlinnPhongExponent( vrayBlinnPhongGlossiness ) );
var specular = 5 * dielectricRefractionIndexToF0( vrayFresnel );


// unknown mappings:

// appleseed glosiness to blinn-phong exponent
// source: https://github.com/appleseedhq/appleseed/blob/master/src/appleseed/renderer/modeling/bsdf/microfacetbrdf.cpp#L440
function glossiness_to_blinn_exponent( glossiness ) {
	return 100.0 * Math.pow( glossiness, 3 ) + 9900.0 * Math.pow( glossiness, 30 );
}

// PBRT roughness to alpha for GTR & Beckmann:
function roughnessToAlpha(rough) {
	rough = Math.max(rough, 1e-3);
	var x = Math.log(rough);
 	return 1.62142 + 0.819955*x + 0.1734*x*x + 0.0171201*x*x*x + 0.000640711*x*x*x*x;
}
