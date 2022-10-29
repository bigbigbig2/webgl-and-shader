#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float plot(vec2 st, float pct){
    //思想也类似于之前的大圆切小圆
  return  smoothstep( pct-0.02, pct, st.y) -
          smoothstep( pct, pct+0.02, st.y);
}

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution;

    float y = pow(st.x,5.0);


    float pct = plot(st,y);
    vec3 color = pct*vec3(1.0, 1.0, 1.0);

    gl_FragColor = vec4(color,1.0);
}
