import  Matrix4  from './../common/lib/cuon-matrix.js';

const vertex = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    uniform mat4 u_MvpMatrix;
    uniform bool u_Clicked;
    varying vec4 v_Color;
    void main(){
        gl_Position = u_MvpMatrix * a_Position;
        if (u_Clicked){
            v_Color = vec4(1.0, 0.0, 0.0, 1.0);
        }else{
            v_Color = a_Color;
        }
    }
`

const fragment = `
    precision mediump float;
    varying vec4 v_Color;
    void main(){
        gl_FragColor = v_Color;
    }
`

const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl'); 

/**
 * 
 * @param {webgl上下文} gl 
 * @param {着色器容器类型} type 
 * @param {着色器代码片段} source 
 * @returns 
 */
function initShaders(gl, type, source){
    const shader = gl.createShader(type)
    
    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    return shader
}

/**
 * 生成webglProgram
 * @param {webgl上下文} gl 
 * @param {顶点着色器片段} vertex 
 * @param {片元着色器片段} fragment 
 * @returns 
 */
function generateProgram(gl, vertex, fragment) {
    const vertexShader = initShaders(gl, gl.VERTEX_SHADER, vertex)
    const fragmentShader = initShaders(gl, gl.FRAGMENT_SHADER, fragment)

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);
    gl.useProgram(program)

    return program
}

const program = generateProgram(gl, vertex, fragment)
const ANGLE_STEP = 20.0; // 旋转角度（度/秒）

function main() {
  const n = initVertexBuffers(gl);
 
  // 设置清除颜色并启用深度测试
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // 获取着色器中变量的存储位置并赋值给js变量
  const u_MvpMatrix = gl.getUniformLocation(program, 'u_MvpMatrix');
  const u_Clicked = gl.getUniformLocation(program, 'u_Clicked');
  

  // 计算视图投影矩阵（初始的）
  const viewProjMatrix = new Matrix4();
  viewProjMatrix.setPerspective(30.0, canvas.width / canvas.height, 1.0, 100.0);
  viewProjMatrix.lookAt(0.0, 0.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

  gl.uniform1i(u_Clicked, 0); // 设置为false

  let currentAngle = 0.0; //初始角度
  // 注册事件处理程序
  canvas.onmousedown = (ev)=>{   // 按下鼠标左键
    const x = ev.clientX
    const y = ev.clientY;
    const rect = ev.target.getBoundingClientRect();

    if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
      // 如果按下的位置在 <canvas> 内，检查它是否在对象上方
      const x_in_canvas = x - rect.left, y_in_canvas = rect.bottom - y;
      let picked = check(gl, n, x_in_canvas, y_in_canvas, currentAngle, u_Clicked, viewProjMatrix, u_MvpMatrix);
      if (picked) alert('The cube was selected! ');
    }
  }

  const tick = function() {   // 开始绘制
    currentAngle = animate(currentAngle);
    draw(gl, n, currentAngle, viewProjMatrix, u_MvpMatrix);
    requestAnimationFrame(tick, canvas);
  };
  tick();
}

function initVertexBuffers(gl) {
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3
  const vertices = new Float32Array([   // Vertex coordinates
     1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,    // v0-v1-v2-v3 front
     1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,    // v0-v3-v4-v5 right
     1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
    -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,    // v1-v6-v7-v2 left
    -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,    // v7-v4-v3-v2 down
     1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0     // v4-v7-v6-v5 back
  ]);

  const colors = new Float32Array([   // Colors
    0.2, 0.58, 0.82,   0.2, 0.58, 0.82,   0.2,  0.58, 0.82,  0.2,  0.58, 0.82, // v0-v1-v2-v3 front
    0.5,  0.41, 0.69,  0.5, 0.41, 0.69,   0.5, 0.41, 0.69,   0.5, 0.41, 0.69,  // v0-v3-v4-v5 right
    0.0,  0.32, 0.61,  0.0, 0.32, 0.61,   0.0, 0.32, 0.61,   0.0, 0.32, 0.61,  // v0-v5-v6-v1 up
    0.78, 0.69, 0.84,  0.78, 0.69, 0.84,  0.78, 0.69, 0.84,  0.78, 0.69, 0.84, // v1-v6-v7-v2 left
    0.32, 0.18, 0.56,  0.32, 0.18, 0.56,  0.32, 0.18, 0.56,  0.32, 0.18, 0.56, // v7-v4-v3-v2 down
    0.73, 0.82, 0.93,  0.73, 0.82, 0.93,  0.73, 0.82, 0.93,  0.73, 0.82, 0.93, // v4-v7-v6-v5 back
   ]);

  // Indices of the vertices
  const indices = new Uint8Array([
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
  ]);


  initArrayBuffer(gl, vertices, gl.FLOAT, 3, 'a_Position')
  initArrayBuffer(gl, colors, gl.FLOAT, 3, 'a_Color')

  // 创建一个缓冲区对象
  const indexBuffer = gl.createBuffer();
  
  // 将索引数据写入缓冲区对象
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return indices.length;
}

function check(gl, n, x, y, currentAngle, u_Clicked, viewProjMatrix, u_MvpMatrix) {
  let picked = false;
  gl.uniform1i(u_Clicked, 1);  // 将 true 传递给 u_Clicked
  draw(gl, n, currentAngle, viewProjMatrix, u_MvpMatrix); // 将物体重绘为红色
  // 读取点击位置的像素
  let pixels = new Uint8Array(4); // 用于存储像素值的数组
  gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

  if (pixels[0] == 255) // 如果 R(pixels[0]) 为 255，则鼠标在立方体上
    picked = true;

  gl.uniform1i(u_Clicked, 0);  // 将 false 传递给 u_Clicked（重绘为原来的颜色）
  draw(gl, n, currentAngle, viewProjMatrix, u_MvpMatrix); // 绘制
  
  return picked;
}

const g_MvpMatrix = new Matrix4(); // Mvp矩阵
function draw(gl, n, currentAngle, viewProjMatrix, u_MvpMatrix) {
  // 计算MVP矩阵并传递给u_MvpMatrix
  g_MvpMatrix.set(viewProjMatrix); 
  g_MvpMatrix.rotate(currentAngle, 1.0, 0.0, 0.0); // Rotate appropriately
  g_MvpMatrix.rotate(currentAngle, 0.0, 1.0, 0.0);
  g_MvpMatrix.rotate(currentAngle, 0.0, 0.0, 1.0);
  gl.uniformMatrix4fv(u_MvpMatrix, false, g_MvpMatrix.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);     // 清除缓冲区
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);   // 重绘绘制
}

let last = Date.now(); // 上次调用此函数的时间
function animate(angle) {
  let now = Date.now();  
  let elapsed = now - last; //计算经过的时间
  last = now;
  // 更新当前旋转角度（根据经过时间调整）
  let newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  return newAngle % 360;
}

function initArrayBuffer (gl, data, type, num, attribute) {
  // 创建一个缓冲区对象
  const buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  const a_attribute = gl.getAttribLocation(program, attribute);

  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  gl.enableVertexAttribArray(a_attribute);

  return true;
}

main();