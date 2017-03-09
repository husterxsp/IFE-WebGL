varying vec3 vNormal;

// varying vec3 vPos;
// varying vec3 vViewPosition;

void main()
{
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    // 计算变换后的法向量
    vNormal = normalize(normalMatrix * normal);

    // vec4 mvPosition = (modelViewMatrix * vec4(position, 1.0 ));
    // vViewPosition = -mvPosition.xyz;
}