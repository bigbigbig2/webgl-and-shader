//编写两个着色器
const vertex = `
    attribute vec2 a_vertexPosition;
    attribute vec2 uv;
    varying vec2 vUv;
    void main() {
        gl_PointSize = 1.0;
        vUv = uv;
        gl_Position = a_vertexPosition;
    }
`;

const fragment = `
    precision mediump float;
    varying vec2 vUv;
    uniform float rows;
    void main(){
        vec2 st = fract(vUv * rows);  //获得重复的 rows 行 rows 列的值st,fract获取一个数的小数部分
        float d1 = step(st.x, 0.9);
        float d2 = step(0.1, st.y);
        gl_FragColor.rgb = mix(vec3(0.8), vec3(1.0), d1 * d2); 
        gl_FragColor.a = 1.0;
    }
`;


const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl'); 

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertex);
gl.compileShader(vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragment);
gl.compileShader(fragmentShader);

//创建webgl程序
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);


//获取rows的存储地址，然后赋值给它
const rows = gl.getUniformLocation(program,'rows');
gl.uniform1f(rows,64);  //每一行设置64个网格

const positions = new Float32Array([
    -1, -1, 
    -1, 1, 
    1, 1, 
    1, -1,
]);

const uv = new Float32Array([
    0, 0,
    0, 1, 
    1, 1,
    1, 0,
])

//顶点索引。WebGL 只能渲染经过三角剖分之后的多边形。将这个矩形画布剖分成两个三角形，这两个三角形的顶点下标分别是 (0, 1, 2) 和 (2, 0, 3)。
const cells = new Float32Array([
    0, 1, 2,
    2, 0, 3
])

//顶点坐标
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);//将缓冲区对象绑定到target中gl.ARRAY_BUFFER这个“目标”表示缓冲区对象的用途
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

//将 buffer 的数据绑定给顶点着色器的 position 变量。
const vPosition = gl.getAttribLocation(program, 'a_vertexPosition');
gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(vPosition);

//纹理坐标
const uvBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);//将缓冲区对象绑定到target中gl.ARRAY_BUFFER这个“目标”表示缓冲区对象的用途
gl.bufferData(gl.ARRAY_BUFFER, uvBuffer, gl.STATIC_DRAW);

//将 buffer 的数据绑定给顶点着色器的 position 变量。
const vUv = gl.getAttribLocation(program, 'uv');
gl.vertexAttribPointer(vUv, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(vUv);

//顶点索引
const cellBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cellBuffer);//将缓冲区对象绑定到target中gl.ARRAY_BUFFER这个“目标”表示缓冲区对象的用途
gl.bufferData(gl.ARRAY_BUFFER, cellBuffer, gl.STATIC_DRAW);



//执行着色器程序完成绘制
gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawElements(gl.LINES, cells.length, gl.UNSIGNED_SHORT,0)