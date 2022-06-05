const vertex = `
    attribute vec4 a_position;
    uniform mat4 u_ModelMatrix;
    attribute vec4 a_Color;
    varying vec4 v_Color;
    attribute vec4 a_Normal;    // 法向量
    uniform vec3 u_LightColor;    // 光线颜色
    uniform vec3 u_LightDirection;    // 光线方向

    void main(){
        gl_Position = u_ModelMatrix * a_position;
        // 对法向量进行归一化
        vec3 normal = normalize(vec3(a_Normal));
        // 计算光线方向与法向量的点积
        float dotResult = max(dot(u_LightDirection, normal), 0.0);
        // 计算漫反射光的颜色
        vec3 diffuse = u_LightColor * a_Color.rgb * dotResult;
        v_Color = vec4(diffuse, a_Color.a);
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

    const normals = new Float32Array([
        0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,
        1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,
        0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,
        -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,
        0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,
        0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,
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

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
    //从缓冲区中取出数据

    //读取顶点数据给顶点着色器
    const v_position = gl.getAttribLocation(program,'a_position');
    gl.vertexAttribPointer(v_position,3,gl.FLOAT,false,FSIZE*6,0);
    gl.enableVertexAttribArray(v_position);

    //读取颜色数据传递给顶点着色器
    const v_color = gl.getAttribLocation(program,'a_Color');
    gl.vertexAttribPointer(v_color,3,gl.FLOAT,false,FSIZE*6,FSIZE*3);
    gl.enableVertexAttribArray(v_color);

    const v_Normal = gl.getAttribLocation(program, 'a_Normal');
    gl.vertexAttribPointer(v_Normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(v_Normal);


    const u_LightColor = gl.getUniformLocation(program, 'u_LightColor');
    const u_LightDirection = gl.getUniformLocation(program, 'u_LightDirection');

    gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);    // 将光线颜色设置为黄色
    const lightDirection = new Vector3([0.5, 3.0, 4.0]);    // 光线方向（世界坐标系下）
    lightDirection.normalize();    // 归一化
    gl.uniform3fv(u_LightDirection, lightDirection.elements);

    //设置视点和可视空间
    const u_ModelMatrix = gl.getUniformLocation(program, "u_ModelMatrix");//获取模型矩阵的地址
    const mvpMatrix = new Matrix4();
    mvpMatrix.setPerspective(30,canvas.width/canvas.height,1,100);//设置正射投影矩阵
    mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0); //设置观察者
    gl.uniformMatrix4fv(u_ModelMatrix,false,mvpMatrix.elements); //将模型视图矩阵传递给u_MoeelMatrix

    // 设置背景色并开启隐藏面消除
    gl.clearColor(0.0,0.0,0.0,1.0);
    
    //清空颜色缓冲区和深度缓冲区
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER);
    gl.enable(gl.DEPTH_TEST);
    //绘制
    gl.drawElements(gl.TRIANGLES,indices.length, gl.UNSIGNED_BYTE, 0);


    
