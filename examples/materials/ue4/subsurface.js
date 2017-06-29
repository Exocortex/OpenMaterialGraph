The two components of subsurface lighting are a wrap-around N dot H term and a light backscattering term, which shows up when the light is on the other side of an SSS object. Both of these are masked by translucent self shadowing from exponential shadow maps.

The Opacity channel of the material takes on a slightly different meaning when the material is using subsurface scattering and the MLM_Subsurface shading model. Since these types of surfaces are completely opaque, the Opacity, in this case, controls how dense the material is when it scatters light as well as:

How much the normal affects the subsurface lighting, a more opaque material gets more normal influence.
How far lighting makes it through the material due to self-shadowing, a smaller opacity causes light to travel further.
How soft the shadow is on the material, a smaller opacity results in softer shadows, but softness is clamped.
Be sure to set the Opacity for any subsurface materials to a reasonable value, e.g. 0.1. The default opacity is 1, which does not produce a very convincing subsurface-type effect.