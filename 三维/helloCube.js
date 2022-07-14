const vertex = `
    attribute vec4 a_position;
    uniform mat4 u_ModelMatrix;
    attribute vec4 a_Color;
    varying vec4 v_Color;

    void main(){
        gl_Position = u_ModelMatrix * a_position;
        gl_PointSize = 1.0;
        v_Color = a_Color;
    }
`
const fragment = `
    precision mediump float;
    varying vec4 v_Color;

    void main(){
        gl_FragColor = v_Color;
    }
`

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
        // 顶点坐标           颜色
        1.0,  1.0,  1.0,     1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,     1.0,  0.0,  1.0,
        -1.0, -1.0,  1.0,     1.0,  0.0,  0.0,
        1.0, -1.0,  1.0,     1.0,  1.0,  0.0,
        1.0, -1.0, -1.0,     0.0,  1.0,  0.0,
        1.0,  1.0, -1.0,     0.0,  1.0,  1.0,
        -1.0,  1.0, -1.0,     0.0,  0.0,  1.0,
        -1.0, -1.0, -1.0,     0.0,  0.0,  0.0,
    ]);
    //可以调用三角剖分库来将上面顶点生成下来索引
    const indices = new Uint8Array([
        0, 1, 2,   0, 2, 3, // 前
        0, 3, 4,   0, 4, 5, // 右
        0, 5, 6,   0, 6, 1, // 上
        1, 6, 7,   1, 7, 2, // 左
        7, 4, 3,   7, 3, 2, // 下
        4, 7, 6,   4, 6, 5, // 后
    ]);

    
    //创建缓冲区并将数据存入缓冲区
    const vertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

    //将索引数据写入缓冲区即可
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    const FSIZE = verticesColors.BYTES_PER_ELEMENT;
    //从缓冲区中取出数据

    //读取顶点数据给顶点着色器
    const v_position = gl.getAttribLocation(program,'a_position');
    gl.vertexAttribPointer(v_position,3,gl.FLOAT,false,FSIZE*6,0);
    gl.enableVertexAttribArray(v_position);

    //读取颜色数据传递给顶点着色器
    const v_color = gl.getAttribLocation(program,'a_Color');
    gl.vertexAttribPointer(v_color,3,gl.FLOAT,false,FSIZE*6,FSIZE*3);
    gl.enableVertexAttribArray(v_color);

    //设置背景色并开启隐藏面消除
    // gl.clearColor(0.0,0.0,0.0,1.0);
    gl.enable(gl.DEPTH_TEST);

    //设置视点和可视空间
    const u_ModelMatrix = gl.getUniformLocation(program, "u_ModelMatrix");//获取模型矩阵的地址
    const mvpMatrix = new Matrix4();
    mvpMatrix.setPerspective(30,1,1,100);//定义矩阵投影矩阵
    mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0); //设置观察者
    gl.uniformMatrix4fv(u_ModelMatrix,false,mvpMatrix.elements); //将模型视图矩阵传递给u_MoeelMatrix

    //清空颜色缓冲区和深度缓冲区
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER);
    //绘制
    gl.drawElements(gl.TRIANGLES,indices.length, gl.UNSIGNED_BYTE, 0);


    
