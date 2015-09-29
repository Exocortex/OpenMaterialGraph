var microfacetDistribution = GetDistribution( roughnessModel, roughness, anisotropy, anisotropyRotation, anisotropyTangent );
var fresnel = new FresnelConductor( 1, ior, kappa );
bsdfs.add( new MicrofacetReflection( 1, microfacetDistribution, fresnel ) );