import { Matrix4 } from "../common/lib/cuon-matrix.js";
/**
 * 透视投影第二个示例，通过平移来绘制左边的三角形
 * 投影矩阵：定义可视空间
 * 视图矩阵：定义观察者
 * 模型矩阵：对图形进行变换
 */
const vertex = `
    attribute vec4 a_position;
    uniform mat4 u_projMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ModelMatrix;
    attribute vec4 a_Color;
    varying vec4 v_Color;

    void main(){
        gl_Position = u_projMatrix * u_ViewMatrix * u_ModelMatrix * a_position;
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
    const gl = canvas.getContext('webgl');

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

    const verticesColors = new Float32Array([
        // 绿色在最后面
        0.0, 1.0, -4.0, 0.4, 1.0, 0.4,
        -0.5, -1.0, -4.0, 0.4, 1.0, 0.4,
        0.5, -1.0, -4.0, 1.0, 0.4, 0.4,
            // 黄色在中间
        0.0, 1.0, -2.0, 1.0, 1.0, 0.4,
        -0.5, -1.0, -2.0, 1.0, 1.0, 0.4,
        0.5, -1.0, -2.0, 1.0, 0.4, 0.4,
            // 蓝色在前面
        0.0, 1.0, 0.0, 0.4, 0.4, 1.0,
        -0.5, -1.0, 0.0, 0.4, 0.4, 1.0,
        0.5, -1.0, 0.0, 1.0, 0.4, 0.4,
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
    const u_projMatrix = gl.getUniformLocation(program, 'u_projMatrix');
    const u_ViewMatrix = gl.getUniformLocation(program, 'u_ViewMatrix');
    const u_ModelMatrix = gl.getUniformLocation(program, 'u_ModelMatrix');

    //创建矩阵以设置视点和视线
    const viewMatrix=new Matrix4(); //视图矩阵
    const projMatrix=new Matrix4(); //投影矩阵
    const moduleViewMatrix = new Matrix4(); //模型矩阵

    viewMatrix.setLookAt(0, 0, 5, 0, 0, -100, 0, 1, 0);//设置视点，视线，上方向（Y轴上方向）
    projMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100);
    moduleViewMatrix.setTranslate(0.75,0,0);//模型矩阵沿着x轴移动0.75

    gl.uniformMatrix4fv(u_ModelMatrix,false,moduleViewMatrix.elements);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
    gl.uniformMatrix4fv(u_projMatrix, false, projMatrix.elements);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES,0,9); //绘制右边一侧的三角形

    //为另一侧的三角形重新计算模型矩阵
    moduleViewMatrix.setTranslate(-0.75,0,0);
    //重新传递给顶点着色器
    gl.uniformMatrix4fv(u_ModelMatrix,false,moduleViewMatrix.elements);
    gl.drawArrays(gl.TRIANGLES,0,9); //绘制左边一侧的三角形

}
main();

