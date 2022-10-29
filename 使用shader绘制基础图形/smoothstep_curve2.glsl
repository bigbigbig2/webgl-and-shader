#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float plot(vec2 st, float pct){
  return  smoothstep( pct-0.02, pct, st.y) -
          smoothstep( pct, pct+0.02, st.y);
}

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution;

    // 在st.x=0.1~0.9内平滑过渡（插值）
    float y = smoothstep(0.1,0.9,st.x);


    float pct = plot(st,y);
    vec3 color =pct*vec3(1.0,1.0,1.0);

    gl_FragColor = vec4(color,1.0);
}