// TODO: add support for Abbe Number
bsdfs.add( new LambertianReflection( diffuseColor ) );

var microfacetDistribution = GetDistribution( roughnessModel, roughness, anisotropy, anisotropyRotation, anisotropyTangent );
var fresnel = new FresnelDielectric( 1, ior );
bsdfs.add( new MicrofacetReflection( reflectanceColor, microfacetDistribution, fresnel ) )
bsdfs.add( new MicrofacetTransmission( transmittanceColor, microfacetDistribution, 1, ior ) )
