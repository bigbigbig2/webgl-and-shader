const canvas = document.querySelector('canvas');
var gl = canvas.getContext('webgl');

const vertex = `
    attribute vec4 a_position;
    uniform mat4 u_moduleViewMatrix;
    attribute vec4 a_Color;
    varying vec4 v_Color;

    void main(){
        gl_Position = u_moduleViewMatrix * a_position;
        gl_PointSize = 1.0;
        v_Color = a_Color;
        
    }
`

const fragment = `
    precision mediump float;
    varying vec4 v_Color;

    void main(){
        gl_FragColor =v_Color;
    }
`
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

var verticesColors = new Float32Array([
    // 坐标                 颜色
    0.0, 0.5, -0.4,0.4, 1.0, 0.4,
    -0.5, -0.5, -0.4,0.4, 1.0, 0.4,
    0.5, -0.5, -0.4,1.0, 0.4, 0.4,
    0.5, 0.4, -0.2,1.0, 0.4, 0.4,
    -0.5, 0.4, -0.2,1.0, 1.0, 0.4,
    0.0, -0.6, -0.2,1.0, 1.0, 0.4,
    0.0, 0.5, 0.0,0.4, 0.4, 1.0,
    -0.5, -0.5, 0.0, 0.4, 0.4, 1.0,
    0.5, -0.5, 0.0,1.0, 0.4, 0.4,
]);

//创建缓冲区对象
const vertexPositionBuffer=gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
//将点数据和颜色数据同时存入一个缓冲区
gl.bufferData(gl.ARRAY_BUFFER,verticesColors,gl.STATIC_DRAW)


//创建视图矩阵(视点、视线和上方向)
var moduleViewMatrix=new Matrix4();
moduleViewMatrix.setLookAt(0.20, 0.25, 0.25, 0, 0, 0, 0, 1, 0);
var v_moduleViewMatrix = gl.getUniformLocation(program, 'u_moduleViewMatrix'); //获取视图模型矩阵的地址
gl.uniformMatrix4fv(v_moduleViewMatrix, false, moduleViewMatrix.elements);

//从缓冲区中取出顶点数据并传递给顶点着色器
var FSIZE = verticesColors.BYTES_PER_ELEMENT ; 

const vPosition = gl.getAttribLocation(program,'a_position');
gl.vertexAttribPointer(vPosition,3,gl.FLOAT,false,FSIZE*6,0);
gl.enableVertexAttribArray(vPosition);

//从缓冲区中取出颜色数据并传递给顶点着色器
const vColor = gl.getAttribLocation(program,'a_Color');
gl.vertexAttribPointer(vColor,3,gl.FLOAT,false,FSIZE*6,FSIZE*3);
gl.enableVertexAttribArray(vColor);

gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawArrays(gl.TRIANGLES,0,9);

var g_eyeX=0.20,g_eyeY=0.25,g_eyeZ=0.25;//默认视点

function keydown(ev,gl,v_moduleViewMatrix,moduleViewMatrix){
    if(ev.keyCode == 39){ //按下右建
        g_eyeX +=0.01;
    }else if(ev.keyCode == 37){
        g_eyeX -=0.01; //按下左键
    }else{ //按下的是其他建
        return;
    }
    draw(gl,v_moduleViewMatrix,moduleViewMatrix);
}

function draw(gl,v_moduleViewMatrix,moduleViewMatrix){
    //设置视点和视线
    moduleViewMatrix.setLookAt(g_eyeX,g_eyeX,g_eyeZ,0,0,0,0,1,0);
    //将视图矩阵传递给v_moduleViewMatrix变量
    gl.uniformMatrix4fv(v_moduleViewMatrix, false, moduleViewMatrix.elements);

    //清空颜色缓冲
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES,0,9);
}

//注册键盘事件响应函数
document.onkeydown = function(ev){
    keydown(ev,gl,v_moduleViewMatrix,moduleViewMatrix);
}
// draw(gl,v_moduleViewMatrix,moduleViewMatrix);


