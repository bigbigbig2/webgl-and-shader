/**
 * 两个圆，角度对应着色相的值，其中一个圆的半径对应饱和度S，另一个圆的半径对应明度V
 */

import {earcut} from './../common/lib/earcut.js'
function createShader (gl, type, source) {
    const shader = gl.createShader(type)
    
    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    return shader
}
  
  //生成webgl程序
function generateProgram(gl, vertex, fragment) {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertex)
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragment)
  
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
  
    gl.linkProgram(program);
    gl.useProgram(program)
  
    return program
}
  
/**
 * @type {HTMLCanvasElement}
 */
const canvas = document.querySelector("canvas");
  
const gl = canvas.getContext('webgl');
  
const generateCircle = (r, seg, x, y) => {
    const res = []
    for (let i = 0; i < seg; i++) {
      const angle = i * 2 * Math.PI / seg
      res.push([
        r * Math.cos(angle) + x,
        r * Math.sin(angle) + y,
      ])
    }
    return res
}
  
const vertex = `
  #define PI 3.1415926535897932384626433832795
  attribute vec2 position;
  varying vec4 vColor;
  
  vec3 rgb2hsv(vec3 c){
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
  }
  
  // 都是(0, 1)
  vec3 hsv2rgb(vec3 c){
    vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0), 6.0)-3.0)-1.0, 0.0, 1.0);
    rgb = rgb * rgb * (3.0 - 2.0 * rgb);
    return c.z * mix(vec3(1.0), rgb, c.y);
  }
  
  void main(){
    
    // 两个圆的圆心分别在 (-0.5, 0), (0.5, 0), 将其转到(0, 0)方便计算
    float x = position.x > 0.0 ? position.x - 0.5 : position.x + 0.5;
    float y = position.y;
  
    float hue = atan(position.y, x);
    if (0.0 > hue) {
      hue = PI * 2.0 + hue;
    }
  
    hue /= 2.0 * PI;
  
    float len = sqrt(x * x + y * y);
    // 判断是哪一个圆, 使用不同的颜色
    vec3 hsv = position.x > 0.0 ? vec3(hue, len, 1.0) : vec3(hue, 1.0, len);
    vec3 rgb = hsv2rgb(hsv);
    vColor = vec4(rgb, 1.0);
    gl_Position = vec4(position, 1.0, 1.0);
  }
`
  
const fragment = `
  precision mediump float;
  varying vec4 vColor;
  void main(){
    gl_FragColor = vColor;
  }
`
  
const program = generateProgram(gl, vertex, fragment)
  
const circle1 = generateCircle(0.4, 100, -0.5, 0)
const circle2 = generateCircle(0.4, 100, 0.5, 0)
  
function draw(program, circle) {
    const points = circle.flat()
    const cell = earcut(points)

    const position = new Float32Array(points)
    const cells = new Uint16Array(cell)

    const pointBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, pointBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, position, gl.STATIC_DRAW)

    const vPosition = gl.getAttribLocation(program, 'position')
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(vPosition)

    const cellsBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cellsBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cells, gl.STATIC_DRAW)

    gl.drawElements(gl.TRIANGLES, cell.length, gl.UNSIGNED_SHORT, 0)
}
  
draw(program, circle1)
draw(program, circle2)