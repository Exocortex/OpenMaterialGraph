// Layered

var layers = [
	new Layer( bsdf1, weight1 ),
	new Layer( bsdf2, weight2 ),
	...
	]
bsdfs.add( new WeightedBlend( layers ), blendMode = [ additive, normalized, clamped ] ) );

// Scaled

bsdfs.add( new Scaled( bsdf, color ) );

// FresnelBlend

bsdfs.add( new FresnelBlend( ior, weight, overBSDF, baseBSDF ) );