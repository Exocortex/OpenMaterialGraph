float3 omg_node_gamma(
	float3 inputColor,
	float gamma
	)
{
    return power( diffuseColor, gamma );
}
