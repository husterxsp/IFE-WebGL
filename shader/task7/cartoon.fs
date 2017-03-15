uniform vec3 uColor;
uniform vec3 uLightColor;
uniform vec3 uLightDirection;
uniform vec3 uAmbientColor;

varying vec3 vNormal;
// varying vec3 vViewPosition;

void main() {
    // 尝试用边缘检测，但是效果比较诡异。。
    // float edge = dot(normalize(cameraPosition - vViewPosition), vNormal);

    // 光线和法向量的点积，计算出光线和法向量的夹角余弦值cosθ
    float diffuse = dot(normalize(uLightDirection), vNormal);

    // diffuse 为1表示夹角为0°，即正对光源
    // diffuse小于0表示在背光面。
    if (diffuse > 0.8) {
        diffuse = 1.0;
    }
    else if (diffuse > 0.5) {
        diffuse = 0.6;
    }
    else if (diffuse > 0.2) {
        diffuse = 0.4;
    }
    else {
        diffuse = 0.2;
    }

    gl_FragColor = vec4(uColor * uLightColor * diffuse + uColor * uAmbientColor, 1.0);

}
