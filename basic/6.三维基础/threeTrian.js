import { Matrix4 } from "../common/lib/cuon-matrix.js";
const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl');

const vertex = `
    attribute vec4 a_position;
    uniform mat4 v_ViewMatrix;
    uniform mat4 u_ModelMatrix;
    attribute vec4 a_Color;
    varying vec4 v_Color;

    void main(){
        gl_Position = v_ViewMatrix * u_ModelMatrix * a_position;
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
const viewMatrix=new Matrix4();
viewMatrix.setLookAt(0.20, 0.25, 0.25, 0, 0, 0, 0, 1, 0);
console.log(viewMatrix);
const v_ViewMatrix = gl.getUniformLocation(program, 'v_ViewMatrix');
//将视图矩阵传给u_ViewMatrix
gl.uniformMatrix4fv(v_ViewMatrix, false, viewMatrix.elements);

//模型矩阵
const u_ModelMatrix = gl.getUniformLocation(program, 'u_ModelMatrix');
const modelMatrix = new Matrix4();
modelMatrix.setRotate(-10, 0, 0, 1); //尧Z轴旋转l10度
gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

var FSIZE = verticesColors.BYTES_PER_ELEMENT ; 
//从缓冲区中取出顶点数据并传递给顶点着色器
const vPosition = gl.getAttribLocation(program,'a_position');
gl.vertexAttribPointer(vPosition,3,gl.FLOAT,false,FSIZE*6,0);
gl.enableVertexAttribArray(vPosition);
//从缓冲区中取出颜色数据并传递给顶点着色器
const vColor = gl.getAttribLocation(program,'a_Color');
gl.vertexAttribPointer(vColor,3,gl.FLOAT,false,FSIZE*6,FSIZE*3);
gl.enableVertexAttribArray(vColor);

gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawArrays(gl.TRIANGLES,0,9);