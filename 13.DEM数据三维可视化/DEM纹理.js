import  {Matrix4,Vector3}  from './../common/lib/cuon-matrix.js';


const vertex = `
  attribute vec4 a_Position;
  attribute vec4 a_Color;
  uniform mat4 u_MvpMatrix;
  varying vec4 v_Color;
  varying vec4 v_position;
  void main(){
    v_position = a_Position;
    gl_Position = u_MvpMatrix * a_Position;
    v_Color = a_Color;
    
  }
`

const fragment = `
  precision mediump float;
  uniform vec2 u_RangeX;
  uniform vec2 u_RangeY;
  uniform sampler2D u_Sampler;
  varying vec4 v_position;
  varying vec4 v_Color;
  void main(){
    vec2 v_TexCoord = vec2((v_position.x-u_RangeX[0]) / (u_RangeX[1]-u_RangeX[0]), 1.0-(v_position.y-u_RangeY[0]) / (u_RangeY[1]-u_RangeY[0]));
    gl_FragColor = texture2D(u_Sampler, v_TexCoord);
  }
`

const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl'); 

function initShaders(gl, type, source){
  const shader = gl.createShader(type)
  
  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  return shader
}
  //生成webgl程序
function generateProgram(gl, vertex, fragment) {
  const vertexShader = initShaders(gl, gl.VERTEX_SHADER, vertex)
  const fragmentShader = initShaders(gl, gl.FRAGMENT_SHADER, fragment)

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  gl.linkProgram(program);
  gl.useProgram(program);

  return program
}

const program = generateProgram(gl, vertex, fragment)

function main(){
  const demFile = document.getElementById("demFile");
  if(!demFile){
    console.log("Faild to get demFile elmented");
    return;
  }
  //加载文件后的事件
  demFile.addEventListener("change", function(event){
    if(typeof FileReader == 'undefined'){
      console.log("你的电脑不支持FileReader接口");
      return;
    }
    //读取文件事件
    const render = new FileReader();
    //FileReader.onload 文件读取成功
    render.onload = function(){
      //FileReader.result返回文件读取的内容
      if(render.result){
        const terrain = new Terrain();
        if(!readDEMFile(render.result,terrain)){
          console.log("文件格式有误，不能读取该文件");
        }
        //绘制函数
        onDraw(gl, canvas, terrain);
      }
    }
    const input = event.target;
    render.readAsText(input.files[0]); //将获取的内容转为字符串读取
  })


  // 指定清空<canvas>的颜色
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // 开启深度测试
  gl.enable(gl.DEPTH_TEST);

  //清空颜色和深度缓冲区
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}
//定义一个矩形体：混合构造函数原型模式
function Cuboid(minX, maxX, minY, maxY, minZ, maxZ) {
  this.minX = minX;
  this.maxX = maxX;
  this.minY = minY;
  this.maxY = maxY;
  this.minZ = minZ;
  this.maxZ = maxZ;
}

Cuboid.prototype = {
  constructor: Cuboid,
  CenterX: function () {
    return (this.minX + this.maxX) / 2.0;
  },
  CenterY: function () {
    return (this.minY + this.maxY) / 2.0;
  },
  CenterZ: function () {
    return (this.minZ + this.maxZ) / 2.0;
  },
  LengthX: function () {
    return (this.maxX - this.minX);
  },
  LengthY: function () {
    return (this.maxY - this.minY);
  }
}

//定义DEM
function Terrain() {
}
Terrain.prototype = {
  constructor: Terrain,
  setWH: function (col, row) {
    this.col = col;
    this.row = row;
  }
}

var currentAngle = [0.0, 0.0]; // 绕X轴Y轴的旋转角度 ([x-axis, y-axis])
var curScale = 1.0;   //当前的缩放比例
let initTexSuccess = false; //纹理图像是否加载完成

//将顶点数据存到缓冲区，然后取出传递到着色器重
function initArrayBuffer(gl, data, num, type, attribute) {
  //创建一缓冲区对象
  const buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  //写入数据到缓冲区对象中
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  // 将缓冲区对象分配给属性变量
  const a_attribute = gl.getAttribLocation(program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  // 启用对 a_attribute 变量的分配
  gl.enableVertexAttribArray(a_attribute);

  return true;
}


function onDraw(gl, canvas, terrain) {
  // 设置顶点位置
  //var cuboid = new Cuboid(399589.072, 400469.072, 3995118.062, 3997558.062, 732, 1268); 
  let n = initVertexBuffers(gl, terrain);
  if (n < 0) {
    console.log('Failed to set the positions of the vertices');
    return;
  }

  //设置纹理
  if (!initTextures(gl, terrain)) {
    console.log('Failed to intialize the texture.');
    return;
  }

  //注册鼠标事件
  initEventHandlers(canvas);

  //绘制函数
  const tick = function () {
    if(initTexSuccess){
      //设置MVP矩阵
      setMVPMatrix(gl, canvas, terrain.cuboid);

      //清空颜色和深度缓冲区
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      //绘制矩形体
      gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);
      //gl.drawArrays(gl.Points, 0, n);
    }
    //请求浏览器调用tick
    requestAnimationFrame(tick);
  };

  //开始绘制
  tick();
}

//配置纹理
function initTextures(gl, terrain) {
  var u_RangeX = gl.getUniformLocation(program, 'u_RangeX');
  var u_RangeY = gl.getUniformLocation(program, 'u_RangeY');
  if (!u_RangeX || !u_RangeY) {
    console.log('Failed to get the storage location of u_RangeX or u_RangeY');
    return;
  }
  gl.uniform2f(u_RangeX, terrain.cuboid.minX, terrain.cuboid.maxX);
  gl.uniform2f(u_RangeY, terrain.cuboid.minY, terrain.cuboid.maxY);

  //创建一个image对象
  var image = new Image();
  if (!image) {
    console.log('Failed to create the image object');
    return false;
  }
  //图像加载的响应函数 
  image.onload = function () {
    if (loadTexture(gl, image)) {
      initTexSuccess = true;
    }
  };

  //浏览器开始加载图像
  image.src = 'tex.jpg';

  return true;

}

function loadTexture(gl, image) {
  var texture = gl.createTexture(); //创建纹理对象
  if(!texture) {
    console.log("创建纹理对象失败");
    return false;
  }

  //激活纹理单元
  gl.activeTexture(gl.TEXTURE0);
  //绑定纹理对象
  gl.bindTexture(gl.TEXTURE_2D, texture);
  //配置纹理参数
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  //配置纹理图像（将图像分配给纹理对象）
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // 将0号单元纹理传递给着色器中的取样器变量 
  var u_Sampler = gl.getUniformLocation(program, 'u_Sampler');
  if (!u_Sampler) {
    console.log('Failed to get the storage location of u_Sampler');
    return false;
  }
  gl.uniform1i(u_Sampler, 0);

  return true;
}

//读取DEM点数据并传递给了terrain对象
function readDEMFile(result, terrain) {
  var stringlines = result.split("\n");
  if (!stringlines || stringlines.length <= 0) {
    return false;
  }

  //读取头信息
  var subline = stringlines[0].split("\t");
  if (subline.length != 6) {
    return false;
  }
  var col = parseInt(subline[4]);       //DEM宽
  var row = parseInt(subline[5]);      //DEM高
  var verticeNum = col * row;
  if (verticeNum + 1 > stringlines.length) {
    return false;
  }
  terrain.setWH(col, row);

  //读取点信息
  var ci = 0;
  terrain.verticesColors = new Float32Array(verticeNum * 6);
  for (var i = 1; i < stringlines.length; i++) {
    if (!stringlines[i]) {
      continue;
    }

    var subline = stringlines[i].split(',');
    if (subline.length != 9) {
      continue;
    }

    for (var j = 0; j < 6; j++) {
      terrain.verticesColors[ci] = parseFloat(subline[j]);
      ci++;
    }
  }

  if (ci !== verticeNum * 6) {
    return false;
  }

  //包围盒
  var minX = terrain.verticesColors[0];
  var maxX = terrain.verticesColors[0];
  var minY = terrain.verticesColors[1];
  var maxY = terrain.verticesColors[1];
  var minZ = terrain.verticesColors[2];
  var maxZ = terrain.verticesColors[2];
  for (var i = 0; i < verticeNum; i++) {
    minX = Math.min(minX, terrain.verticesColors[i * 6]);
    maxX = Math.max(maxX, terrain.verticesColors[i * 6]);
    minY = Math.min(minY, terrain.verticesColors[i * 6 + 1]);
    maxY = Math.max(maxY, terrain.verticesColors[i * 6 + 1]);
    minZ = Math.min(minZ, terrain.verticesColors[i * 6 + 2]);
    maxZ = Math.max(maxZ, terrain.verticesColors[i * 6 + 2]);
  }

  terrain.cuboid = new Cuboid(minX, maxX, minY, maxY, minZ, maxZ);

  return true;
}


//注册鼠标事件
function initEventHandlers(canvas) {
  var dragging = false;         // Dragging or not
  var lastX = -1, lastY = -1;   // Last position of the mouse

  //鼠标按下
  canvas.onmousedown = function (ev) {
    var x = ev.clientX;
    var y = ev.clientY;
    // Start dragging if a moue is in <canvas>
    var rect = ev.target.getBoundingClientRect();
    if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
      lastX = x;
      lastY = y;
      dragging = true;
    }
  };

  //鼠标离开时
  canvas.onmouseleave = function (ev) {
    dragging = false;
  };

  //鼠标释放
  canvas.onmouseup = function (ev) {
    dragging = false;
  };

  //鼠标移动
  canvas.onmousemove = function (ev) {
    var x = ev.clientX;
    var y = ev.clientY;
    if (dragging) {
      var factor = 100 / canvas.height; // The rotation ratio
      var dx = factor * (x - lastX);
      var dy = factor * (y - lastY);
      currentAngle[0] = currentAngle[0] + dy;
      currentAngle[1] = currentAngle[1] + dx;
    }
    lastX = x, lastY = y;
  };

  //鼠标缩放
  canvas.onmousewheel = function (event) {
    if (event.wheelDelta > 0) {
      curScale = curScale * 1.1;
    } else {
      curScale = curScale * 0.9;
    }
  };
}

//设置MVP矩阵
function setMVPMatrix(gl, canvas, cuboid) {
  // 获取存储mvp矩阵的内存地址
  var u_MvpMatrix = gl.getUniformLocation(program, 'u_MvpMatrix');
  if (!u_MvpMatrix) {
    console.log('Failed to get the storage location of u_MvpMatrix');
    return;
  }

  //模型矩阵
  var modelMatrix = new Matrix4();
  modelMatrix.scale(curScale, curScale, curScale);
  modelMatrix.rotate(currentAngle[0], 1.0, 0.0, 0.0); // Rotation around x-axis 
  modelMatrix.rotate(currentAngle[1], 0.0, 1.0, 0.0); // Rotation around y-axis 
  modelMatrix.translate(-cuboid.CenterX(), -cuboid.CenterY(), -cuboid.CenterZ());

  //投影矩阵
  var fovy = 60;
  var near = 1;
  var projMatrix = new Matrix4();
  projMatrix.setPerspective(fovy, canvas.width / canvas.height, 1, 10000);

  //计算lookAt()函数初始视点的高度
  var angle = fovy / 2 * Math.PI / 180.0;
  var eyeHight = (cuboid.LengthY() * 1.2) / 2.0 / angle;

  //视图矩阵  
  var viewMatrix = new Matrix4();  // View matrix   
  viewMatrix.lookAt(0, 0, eyeHight, 0, 0, 0, 0, 1, 0);

  //MVP矩阵
  var mvpMatrix = new Matrix4();
  mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);

  //将MVP矩阵传输到着色器的uniform变量u_MvpMatrix
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
}

//
function initVertexBuffers(gl, terrain) {
  //DEM的一个网格是由两个三角形组成的
  //      0------1            1
  //      |                   |
  //      |                   |
  //      col       col------col+1    
  let col = terrain.col;
  let row = terrain.row;

  var indices = new Uint16Array((row - 1) * (col - 1) * 6); //存储索引数据
  var ci = 0;
  for (var yi = 0; yi < row - 1; yi++) {
  //for (var yi = 0; yi < 10; yi++) {
    for (var xi = 0; xi < col - 1; xi++) {
      indices[ci * 6] = yi * col + xi;
      indices[ci * 6 + 1] = (yi + 1) * col + xi;
      indices[ci * 6 + 2] = yi * col + xi + 1;
      indices[ci * 6 + 3] = (yi + 1) * col + xi;
      indices[ci * 6 + 4] = (yi + 1) * col + xi + 1;
      indices[ci * 6 + 5] = yi * col + xi + 1;
      ci++;
    }
  }  

  //
  var verticesColors = terrain.verticesColors;
  var FSIZE = verticesColors.BYTES_PER_ELEMENT;   //数组中每个元素的字节数

  // 创建缓冲区对象
  var vertexColorBuffer = gl.createBuffer();//顶点坐标与颜色值
  var indexBuffer = gl.createBuffer();
  if (!vertexColorBuffer || !indexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // 将缓冲区对象绑定到目标
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  // 向缓冲区对象写入数据
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

  //获取着色器中attribute变量a_Position的地址 
  var a_Position = gl.getAttribLocation(program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  // 将缓冲区对象分配给a_Position变量
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);

  // 连接a_Position变量与分配给它的缓冲区对象
  gl.enableVertexAttribArray(a_Position);

  //获取着色器中attribute变量a_Color的地址 
  var a_Color = gl.getAttribLocation(program, 'a_Color');
  if (a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }
  // 将缓冲区对象分配给a_Color变量
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  // 连接a_Color变量与分配给它的缓冲区对象
  gl.enableVertexAttribArray(a_Color);

  // 将顶点索引写入到缓冲区对象
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
 
  return indices.length;
}

main()
