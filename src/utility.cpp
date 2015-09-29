// from PBRT
Float TrowbridgeReitzDistribution::RoughnessToAlpha(Float roughness) {
    roughness = std::max(roughness, (Float)1e-3);
    Float x = std::log(roughness);
    return 1.62142f + 0.819955f * x + 0.1734f * x * x + 0.0171201f * x * x * x +
           0.000640711f * x * x * x * x;
}