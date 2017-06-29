float roughnessToGlossiness( float roughness ) {
	return 1.0 - roughness;
}

float average( color c ) {
	return ( c[0] + c[1] + c[2] ) / 3.0;
}

float f0ToDielectricRefractionIndex( float f0 ) {
	return ( sqrt( f0 ) + 1 ) / ( 1 - sqrt( f0 ) );
}

closure color glossy( vector n, float roughness, float eta, float au, float av ) {

	return microfacet_ggx( n, roughness, eta, "trace_reflections", 1 );
	//return vray_blinn( n, roughnessToGlossiness( roughness ), au, av, "trace_reflections", 1 );

}

color DielectricFresnel_Schlick( color F0, vector negI, vector n ) {

	float fresnel = pow( 1.0 - dot( negI, n ), 5.0 );
	return mix( F0, color( 1.0 ), fresnel );

}