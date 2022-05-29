const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl');

const vertex = `
  attribute vec2 position;

  uniform float u_rotation;
  uniform float u_time;
  uniform float u_duration;
  uniform float u_scale;
  uniform vec2 u_dir;

  varying float vP;

  void main() {
    float p = min(1.0, u_time / u_duration);
    float rad = u_rotation + 3.14 * 10.0 * p;
    float scale = u_scale * p * (2.0 - p);
    vec2 offset = 2.0 * u_dir * p * p;
    mat3 translateMatrix = mat3(
      1.0, 0.0, 0.0,
      0.0, 1.0, 0.0,
      offset.x, offset.y, 1.0
    );
    mat3 rotateMatrix = mat3(
      cos(rad), sin(rad), 0.0,
      -sin(rad), cos(rad), 0.0,
      0.0, 0.0, 1.0
    );
    mat3 scaleMatrix = mat3(
      scale, 0.0, 0.0,
      0.0, scale, 0.0,
      0.0, 0.0, 1.0
    );
    gl_PointSize = 1.0;
    vec3 pos = translateMatrix * rotateMatrix * scaleMatrix * vec3(position, 1.0);
    gl_Position = vec4(pos, 1.0);
    vP = p;
  }
`;

const fragment = `
  precision mediump float;
  
  uniform vec4 u_color;

  varying float vP;

  void main()
  {
    gl_FragColor.xyz = u_color.xyz;
    gl_FragColor.a = (1.0 - vP) * u_color.a;
  }    
`;

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertex);
gl.compileShader(vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragment);
gl.compileShader(fragmentShader);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

//仅使用一个三角形来实现，通过将三角形进行平移，旋转，缩放来实现
const position = new Float32Array([
  -1, -1,
  0, 1,
  1, -1,
]);
const bufferId = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
gl.bufferData(gl.ARRAY_BUFFER, position, gl.STATIC_DRAW);

const vPosition = gl.getAttribLocation(program, 'position');
gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(vPosition);

/**
 * 随机创建一个三角形的信息
 * 其中的参数包括颜色 u_color、初始旋转角度 u_rotation、初始大小 u_scale、初始时间 u_time、动画持续时间 u_diration、运动方向 u_dir 和创建时间 startTime
 * @returns 随机三角形
 */
function randomTriangles() {
  const u_color = [Math.random(), Math.random(), Math.random(), 1.0]; // 随机颜色
  const u_rotation = Math.random() * Math.PI; // 初始旋转角度
  const u_scale = Math.random() * 0.05 + 0.03; // 初始大小
  const u_time = 0;//初始时间 u_time
  const u_duration = 3.0; // 持续3秒钟

  const rad = Math.random() * Math.PI * 2;
  const u_dir = [Math.cos(rad), Math.sin(rad)]; // 运动方向
  const startTime = performance.now();

  return {u_color, u_rotation, u_scale, u_time, u_duration, u_dir, startTime};
}

/**
 * 通过设置设置uniform将什么一系列变量传递到着色器中
 */
function setUniforms(gl, {u_color, u_rotation, u_scale, u_time, u_duration, u_dir}) {
  let loc = gl.getUniformLocation(program, 'u_color');
  gl.uniform4fv(loc, u_color);

  loc = gl.getUniformLocation(program, 'u_rotation');
  gl.uniform1f(loc, u_rotation);

  loc = gl.getUniformLocation(program, 'u_scale');
  gl.uniform1f(loc, u_scale);

  loc = gl.getUniformLocation(program, 'u_time');
  gl.uniform1f(loc, u_time);

  loc = gl.getUniformLocation(program, 'u_duration');
  gl.uniform1f(loc, u_duration);

  loc = gl.getUniformLocation(program, 'u_dir');
  gl.uniform2fv(loc, u_dir);
}

/**
 * 用requestAnimationFrame实现动画
 * 每调用一个update函数生成随机数个三角形
 * 然后依次修改所有三角形的u_time属性，通过setUniforms方法将修改的属性更新到shader变量中
 * 这样，我们就可以在shader中读取变量的值进行处理了。
 */
let triangles = [];
function update() {  
  for(let i = 0; i < 5 * Math.random(); i++) {
    triangles.push(randomTriangles());
  }
  gl.clear(gl.COLOR_BUFFER_BIT);
  // 对每个三角形重新设置u_time
  triangles.forEach((triangle) => {
    triangle.u_time = (performance.now() - triangle.startTime) / 1000;
    setUniforms(gl, triangle);
    gl.drawArrays(gl.TRIANGLES, 0, position.length / 2);
  });
  // 移除已经结束动画的三角形
  triangles = triangles.filter((triangle) => {
    return triangle.u_time <= triangle.u_duration;
  });
  requestAnimationFrame(update);
}

requestAnimationFrame(update);