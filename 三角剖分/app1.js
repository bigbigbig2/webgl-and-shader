import {earcut} from './../common/lib/earcut.js';

const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl');

const vertex = `
    attribute vec2 position;

    void main() {
        gl_Position = vec4(position,1.0,1.0);
        gl_PointSize = 1.0;
    }
`
const fragment = `
    precision mediump float;

    void main(){
        gl_FragColor = vec4(1.0,0.0,0.0,1.0);
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

const vertices = [
    [-0.7, 0.5],
    [-0.4, 0.3],
    [-0.25, 0.71],
    [-0.1, 0.56],
    [-0.1, 0.13],
    [0.4, 0.21],
    [0, -0.6],
    [-0.3, -0.3],
    [-0.6, -0.3],
    [-0.45, 0.0],
];
/**
 * Earcut 库只接受扁平化的定点数据，先用了数组的 flat 方法将顶点扁平化，
 * earcut返回的是一个顶点数据索引的数组[1, 0, 9, 9, 8, 7, 7, 6, 5, 4, 3, 2, 2, 1, 9, 9, 7, 5, 4, 2, 9, 9, 5, 4]
 * 1表示vertices中下标为1的顶点，即点 (-0.4, 0.3)，每三个值可以构成一个三角形，所以 1、0、9 表示由 (-0.4, 0.3)、(-0.7, 0.5) 和 (-0.45, 0.0) 构成的三角形
 */
const points = vertices.flat();
const triangle = earcut(points);

/**
 * 然后将顶点和相应的索引推到缓冲区中
 */
const position = new Float32Array(points);
const cells = new Uint16Array(triangle);

const pointBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER,pointBuffer);
gl.bufferData(gl.ARRAY_BUFFER,position,gl.STATIC_DRAW);

const cellBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,cellBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,cells,gl.STATIC_DRAW);

const vPosition = gl.getAttribLocation(program,'position');
gl.vertexAttribPointer(vPosition,2,gl.FLOAT,false,0,0);
gl.enableVertexAttribArray(vPosition);

gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawElements(gl.LINE_STRIP, cells.length, gl.UNSIGNED_SHORT, 0);


