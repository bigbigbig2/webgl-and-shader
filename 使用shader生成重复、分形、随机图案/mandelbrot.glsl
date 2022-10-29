#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

vec2 f(vec2 z, vec2 c) {
        return mat2(z, -z.y, z.x) * z + c;
}

vec3 palette(float t, vec3 c1, vec3 c2, vec3 c3, vec3 c4) {
        float x = 1.0 / 3.0;
        if (t < x) return mix(c1, c2, t/x);
        else if (t < 2.0 * x) return mix(c2, c3, (t - x)/x);
        else if (t < 3.0 * x) return mix(c3, c4, (t - 2.0*x)/x);
        return c4;
}

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    vec2 center = vec2(0.5,0.5);
    vec2 scale = 1;
    int iterations = 256;

    vec2 c = center + 4.0 * (uv - vec2(0.5)) / scale;
    vec2 z = vec2(0.0);
    bool escaped = false;
    int j;
    for (int i = 0; i < 65536; i++) {
        if(i > iterations) break;
        j = i;
        z = f(z, c);
        if (length(z) > 2.0) {
            escaped = true;
            break;
        }
    }

    gl_FragColor.rgb = escaped ? vec3(float(j)) / float(iterations) : vec3(0.0); 
    gl_FragColor.a = 1.0;

}