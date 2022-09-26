import { Matrix4 } from "../common/lib/cuon-matrix.js";

const vertex = `
    attribute vec4 a_position;
    uniform mat4 u_projMatrix;
    attribute vec4 a_Color;
    varying vec4 v_Color;

    void main(){
        gl_Position = u_projMatrix * a_position;
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

function main(){
    const canvas = document.getElementById('webgl');
    var nf = document.getElementById('nearFzar')
    var gl = canvas.getContext('webgl');

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

    var FSIZE = verticesColors.BYTES_PER_ELEMENT ; 
    //从缓冲区中取出顶点数据并传递给顶点着色器
    const vPosition = gl.getAttribLocation(program,'a_position');
    gl.vertexAttribPointer(vPosition,3,gl.FLOAT,false,FSIZE*6,0);
    gl.enableVertexAttribArray(vPosition);
    //从缓冲区中取出颜色数据并传递给顶点着色器
    const vColor = gl.getAttribLocation(program,'a_Color');
    gl.vertexAttribPointer(vColor,3,gl.FLOAT,false,FSIZE*6,FSIZE*3);
    gl.enableVertexAttribArray(vColor);
    //获取u_projMatrix变量的存储位置
    var u_projMatrix = gl.getUniformLocation(program, 'u_projMatrix');

    //创建矩阵以设置视点和视线
    var projMatrix=new Matrix4();

    //注册键盘事件响应函数
    document.onkeydown=function(ev){
        keydown(ev,gl,u_projMatrix,projMatrix)
    }
    draw(gl,u_projMatrix,projMatrix,nf);


}

//视点与进远裁剪面的距离
var g_near = 0.0 ,g_far=0.5;
function keydown(ev,gl,u_projMatrix,projMatrix,nf){
    switch(ev.keyCode){
        case 39:g_near +=0.01;break; //右
        case 37:g_near -=0.01;break; //左
        case 38:g_far +=0.01;break; //上
        case 40:g_far -=0.01;break; //下
        default: return //按下其他键
    }
    draw(gl,u_projMatrix,projMatrix,nf)
}

function draw(gl,u_projMatrix,projMatrix){
    //使用矩阵设置可视空间
    projMatrix.setOrtho(-1,1,-1,1,g_near,g_far);

    //将投影矩阵传递给u_projMatrix（顶点着色器的）
    gl.uniformMatrix4fv(u_projMatrix,false,projMatrix.elements);

    gl.clear(gl.COLOR_BUFFER_BIT);
    //显示当前near和far的值
    // nf.innerHTML='near:'+Math.round(g_near*100)/100+',far:'+Math.round(g_far*100)/100;

    gl.drawArrays(gl.TRIANGLES,0,9);
}


main();

// gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawArrays(gl.TRIANGLES,0,9);