#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution; //画布尺寸(宽，高)
uniform vec2 u_mouse; //鼠标位置（在屏幕中的那个位置）
uniform float u_time; //shader运行时间（加载后的秒数）

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    //坐标原点从左下角移动到屏幕中间
    st -= 0.5;
    //屏幕像素比，防止画出来的圆在拉伸屏幕宽度x时变型
    st.x*= u_resolution.x/u_resolution.y;
    //使用并行运算的思维思考：相当于屏幕上所有的点到st原点（圆心）的距离
    float r = length(st);
    float c = smoothstep(.3,0.3,r);
    gl_FragColor = vec4(vec3(c,c,c),1.0);
}