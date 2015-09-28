// TODO, add Abbe number support
var microfacetDistribution = new TrowbridgeReitzDistribution( roughness, anisotropy, anisotropyRotation, anisotropyTangent );
var fresnel = new FresnelDielectric( 1, ior );
bsdfs.add( new MicrofacetReflection( reflectance, microfacetDistribution, fresnel ) )
bsdfs.add( new MicrofacetTransmission( transmittance, microfacetDistribution, 1, ior ) )