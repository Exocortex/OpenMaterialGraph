float oren_nayar( float m2, float nDotV, float nDotL, float vDotH ) {
	float termA = 1.0 - 0.5 * m2 / (m2 + 0.33);
	float Cosri = 2.0 * vDotH - 1.0 - nDotV * nDotL;
	float termB = 0.45 * m2 / (m2 + 0.09) * Cosri * ( Cosri >= 0.0 ? min( 1.0, nDotL / nDotV ) : nDotL );
	return 1.0 / PI * ( nDotL * termA + termB );
}

float3 omg_bsfd_diffuse(
	float3 diffuseColor,
	float roughness,
	float sheen			// TODO
	)
{
    return diffuseColor * oren_nayar( N, roughness );
}
