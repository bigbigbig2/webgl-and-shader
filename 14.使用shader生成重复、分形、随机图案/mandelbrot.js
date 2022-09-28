const vertex = `
    attribute vec2 a_vertexPosition;
    attribute vec2 uv;
    varying vec2 vUv;

    void main() {
        gl_PointSize = 1.0;
        vUv = uv;
        gl_Position = vec4(a_vertexPosition,1.0,1.0);
    }
`;

const fragment = `
    #ifdef GL_ES
    precision mediump float;
    #endif

    varying vec2 vUv;
    uniform vec2 center;
    uniform float scale;
    uniform int iterations;

    vec3 palette(float t, vec3 c1, vec3 c2, vec3 c3, vec3 c4) {
        float x = 1.0 / 3.0;
        if (t < x) return mix(c1, c2, t/x);
        else if (t < 2.0 * x) return mix(c2, c3, (t - x)/x);
        else if (t < 3.0 * x) return mix(c3, c4, (t - 2.0*x)/x);
        return c4;
    }

    vec2 f(vec2 z, vec2 c) {
        return mat2(z, -z.y, z.x) * z + c;
    }

    void main(){
        vec2 uv = vUv;
        vec2 c = center + 4.0 * (uv - vec2(0.5)) / scale;
        vec2 z = vec2(0.0);
        bool escaped = false;
        int j;
        for (int i = 0; i < 65536; i++) {
            if(i > iterations) break;
            j = i;
            z = f(z, c);
            if (length(z) > 2.0) {
                escaped = true;
                break;
            }
        }

        gl_FragColor.rgb = escaped ? vec3(float(j)) / float(iterations) : vec3(0.0); 
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


const center = gl.getUniformLocation(program,'center');
gl.uniform2f(center,0.367, 0.303); 

const scale= gl.getUniformLocation(program,'scale');
gl.uniform1f(scale,1.0);

const iterations = gl.getUniformLocation(program,'iterations');
gl.uniform1i(iterations,256);


//根据webgl的坐标系
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
const cells = new Uint16Array([
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
gl.bufferData(gl.ARRAY_BUFFER, uv, gl.STATIC_DRAW);

//将 buffer 的数据绑定给顶点着色器的 position 变量。
const vUv = gl.getAttribLocation(program, 'uv');
gl.vertexAttribPointer(vUv, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(vUv);

//顶点索引
const cellBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cellBuffer);//将缓冲区对象绑定到target中gl.ARRAY_BUFFER这个“目标”表示缓冲区对象的用途
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cells, gl.STATIC_DRAW);

function update() {

    const factor = Math.max(0.1, Math.log(1));
    const tmpScale = (1+factor) % 10000;
    gl.uniform1f(scale,tmpScale);

    gl.uniform1i(iterations,factor*500);
    requestAnimationFrame(update);
  }
setTimeout(update, 2000);

//执行着色器程序完成绘制
gl.clear(gl.DEPTH_BUFFER_BIT);
gl.drawElements(gl.TRIANGLES, cells.length, gl.UNSIGNED_SHORT,0)



