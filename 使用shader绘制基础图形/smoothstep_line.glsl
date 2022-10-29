#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;


float plot(vec2 st) {
    //也就是在st.y-st.x=0.01~0时线性插值0~1
    return smoothstep(0.01, 0.0, abs(st.y - st.x));
}

void main() {
	vec2 st = gl_FragCoord.xy/u_resolution;

    //绘制线段
    float pct = plot(st);
    
    vec3 color = pct*vec3(1.0,1.0,1.0);

	gl_FragColor = vec4(color,1.0);
}
