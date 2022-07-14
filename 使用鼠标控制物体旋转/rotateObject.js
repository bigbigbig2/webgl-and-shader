import { Matrix4 } from './../common/lib/cuon-matrix.js';

const vertex = `
    attribute vec4 a_Position;
    attribute vec4 a_TexCoord;
    uniform mat4 u_MvpMatrix;
    varying vec2 v_TexCoord;
    void main(){
        gl_Position = u_MvpMatrix *a_Position;
        v_TexCoord = a_TexCoord;
    }
`

const fragment = `
    precision mediump float;
    uniform sampler2D u_Sampler;
    varying vec2 v_TexCoord;
    void main(){
        gl_FragColor = texCoords(u_Sampler, v_TexCoord);
    }
`


function main(){
    
    initShaders();
    var n = initBuffer(gl);
    if( n < 0){
        console.log('Failed to set the vertex information');
        return;
    }

    //清除颜色缓冲区并开启深度缓冲区
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    //获取u_MvpMatrix变量的存储地
    var u_MvpMatrix = gl.getUniformLocation(program,'u_MvpMatrix');
    if (!u_MvpMatrix) { 
        console.log('Failed to get the storage location of uniform variable');
        return;
    }

    // 计算视图矩阵
    var viewProjMatrix = new Matrix4();
    viewProjMatrix.setPerspective(30.0, canvas.width / canvas.height, 1.0, 100.0); //透视投影
    viewProjMatrix.lookAt(3.0, 3.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);//观察者

    //注册事件响应函数，鼠标移动事件响应函数：实现了使用鼠标旋转三维物体的逻辑
    var currentAngle = [0.0, 0.0]; // 当前旋转角度([x-axis, y-axis] degrees)
    initEventHandlers(canvas, currentAngle);

    // 配置纹理图片
    if (!initTextures(gl)) {
        console.log('Failed to intialize the texture.');
        return;
    }

    //绘制过程函数
    var tick = function() {  
        draw(gl, n, viewProjMatrix, u_MvpMatrix, currentAngle);
        requestAnimationFrame(tick, canvas);
    };
    tick();



}

function initShaders(){
    const canvas = document.querySelector('canvas');
    const gl = canvas.getContext('webgl');
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader,vertex);
    gl.shaderSource(fragmentShader,fragment);

    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);

    const program = gl.createProgram();
    gl.attachShader(program,vertexShader);
    gl.attachShader(program,fragmentShader);

    gl.linkProgram(program);
    gl.useProgram(program);

    return {canvas,gl,program};
}
function initBuffer(gl){
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3
    var vertices = new Float32Array([   // 顶点坐标
        1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,    // v0-v1-v2-v3 front
        1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,    // v0-v3-v4-v5 right
        1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
        -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,    // v1-v6-v7-v2 left
        -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,    // v7-v4-v3-v2 down
        1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0     // v4-v7-v6-v5 back
    ]);

    var texCoords = new Float32Array([   // 纹理坐标
        1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v0-v1-v2-v3 front
        0.0, 1.0,   0.0, 0.0,   1.0, 0.0,   1.0, 1.0,    // v0-v3-v4-v5 right
        1.0, 0.0,   1.0, 1.0,   0.0, 1.0,   0.0, 0.0,    // v0-v5-v6-v1 up
        1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v1-v6-v7-v2 left
        0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0,    // v7-v4-v3-v2 down
        0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0     // v4-v7-v6-v5 back
    ]);

    // 顶点索引
    var indices = new Uint8Array([
        0, 1, 2,   0, 2, 3,    // front
        4, 5, 6,   4, 6, 7,    // right
        8, 9,10,   8,10,11,    // up
        12,13,14,  12,14,15,    // left
        16,17,18,  16,18,19,    // down
        20,21,22,  20,22,23     // back
    ]);

    // 创建一个缓冲区对象（保持索引数据）
    var indexBuffer = gl.createBuffer();
    if (!indexBuffer) {
        return -1;
    }
    

    // 将顶点信息写入缓冲区对象
    if (!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position')) return -1; // 顶点坐标
    if (!initArrayBuffer(gl, texCoords, 2, gl.FLOAT, 'a_TexCoord')) return -1;// 纹理坐标

    // 解除绑定缓冲区对象
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // 将索引数据写入缓冲区对象
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length;

}

function initEventHandlers(canvas, currentAngle) {
    var dragging = false;         // 是否拖动鼠标
    var lastX = -1, lastY = -1;   // 鼠标最后的位置
  
    canvas.onmousedown = function(ev) {   // 鼠标被按下
      var x = ev.clientX, y = ev.clientY; //按下鼠标时的屏幕坐标
      // 如果鼠标在 <canvas> 中，则开始拖动
      var rect = ev.target.getBoundingClientRect();
      if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
        lastX = x; lastY = y;
        dragging = true;
      }
    };
  
    canvas.onmouseup = function(ev) { dragging = false;  }; //释放鼠标
  
    canvas.onmousemove = function(ev) { // 移动鼠标
      var x = ev.clientX, y = ev.clientY;
      if (dragging) {
        var factor = 100/canvas.height; // 旋转比
        var dx = factor * (x - lastX);
        var dy = factor * (y - lastY);
        // 将 x 轴旋转角度限制为 -90 到 90 度
        currentAngle[0] = Math.max(Math.min(currentAngle[0] + dy, 90.0), -90.0);
        currentAngle[1] = currentAngle[1] + dx;
      }
      lastX = x, lastY = y;
    };
  }

var g_MvpMatrix = new Matrix4(); // MVP矩阵
function draw(){
    // 计算模型视图投影矩阵并传递给u_MvpMatrix
    g_MvpMatrix.set(viewProjMatrix);
    g_MvpMatrix.rotate(currentAngle[0], 1.0, 0.0, 0.0); // Rotation around x-axis
    g_MvpMatrix.rotate(currentAngle[1], 0.0, 1.0, 0.0); // Rotation around y-axis
    gl.uniformMatrix4fv(u_MvpMatrix, false, g_MvpMatrix.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);     // Clear buffers
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);   // Draw the cube
}

function initArrayBuffer(gl, data, num, type, attribute) {
    // Create a buffer object
    var buffer = gl.createBuffer();
    if (!buffer) {
      console.log('Failed to create the buffer object');
      return false;
    }
    // Write date into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    // Assign the buffer object to the attribute variable
    var a_attribute = gl.getAttribLocation(gl.program, attribute);
    if (a_attribute < 0) {
      console.log('Failed to get the storage location of ' + attribute);
      return false;
    }
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    // Enable the assignment to a_attribute variable
    gl.enableVertexAttribArray(a_attribute);
  
    return true;
  }
    


function initTextures(gl){

}

function loadTexture(){

}