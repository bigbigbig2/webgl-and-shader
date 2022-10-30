function main() {
    const image = new Image();
    image.src = "./test.png" 
    image.onload = function() {
      render(image);
    };
}
  
function render(image) {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  const canvas = document.querySelector("#canvas");
  const gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }

  //将创建顶点着色容器、webgl程序等一步封装完成至linkProgram
  const program = webglUtils.createProgramFromScripts(gl, ["vertex-shader-2d", "fragment-shader-2d"]);

  const positionLocation = gl.getAttribLocation(program, "a_position");
  const texcoordLocation = gl.getAttribLocation(program, "a_texCoord");
  const samplerImage = gl.getUniformLocation(program, "u_image");
  const textureSizeLocation = gl.getUniformLocation(program, "u_textureSize");
  const kernelLocation = gl.getUniformLocation(program, "u_kernel[0]");
  const kernelWeightLocation = gl.getUniformLocation(program, "u_kernelWeight");
  

  //创建一个顶点缓冲区对象，用来存储三个二维的裁剪空间点
  const positionBuffer = gl.createBuffer();
  //将该缓冲区对象绑定到WebGL 系统中已经存在的“目标 ”(target）上（指定该对象将用来存储什么数据）
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  //设置一个和图片长宽高的矩形，并将其存到顶点缓冲区中
  // console.log(image.width, image.height)
  setRectangle(gl, 0, 0, image.width, image.height);

  //给矩形提供纹理坐标,并将其存储到另一个顶点缓冲区中
  const texcoordBuffer = gl.createBuffer(); //在创建一个顶点缓冲区
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  //传递纹理坐标给顶点着色器：一个矩形，两个三角形，6个点
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0.0,  0.0,
      1.0,  0.0,
      0.0,  1.0,
      0.0,  1.0,
      1.0,  0.0,
      1.0,  1.0,
  ]), gl.STATIC_DRAW);

  const gaussianBlur3 = [
    1, 1, 1,
    1, 1, 1,
    1, 1, 1
  ];

  

  const texture = gl.createTexture();// 创建纹理对象
  gl.bindTexture(gl.TEXTURE_2D, texture);//绑定纹理对象，选纹理类型

  // 配置参数
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);//配置水平填充
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  //将图像分配给纹理对象
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  // gl.activeTexture(gl.TEXTURE0); //激活0号纹理单元
  // gl.uniform1i(samplerImage,0);

  // lookup uniforms
  var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  

  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);


  gl.useProgram(program);

  gl.enableVertexAttribArray(positionLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  //将缓冲区中的数据取出传递给顶点着色器中的a_position
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);



  gl.enableVertexAttribArray(texcoordLocation);


  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  //将缓冲区中的数据取出传递给顶点着色器中的a_texCoord
  gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);

  //向unifor变量赋值
  gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
  gl.uniform2f(textureSizeLocation, image.width, image.height);
  gl.uniform1fv(kernelLocation, gaussianBlur3);
  gl.uniform1f(kernelWeightLocation, computeKernelWeight(gaussianBlur3));

  // 以三角形为图元绘图
  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  var count = 6;
  gl.drawArrays(primitiveType, offset, count);
}

function computeKernelWeight(kernel) {
  var weight = kernel.reduce(function(prev, curr) {
      return prev + curr;
  });
  return weight <= 0 ? 1 : weight;
}

function setRectangle(gl, x, y, width, height) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
  //将矩形纹理坐标存到缓冲区对象中（两个三角形)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      x1, y1,
      x2, y1,
      x1, y2,
      x1, y2,
      x2, y1,
      x2, y2,
  ]), gl.STATIC_DRAW);
}

main();


// This is needed if the images are not on the same domain
// NOTE: The server providing the images must give CORS permissions
// in order to be able to use the image with WebGL. Most sites
// do NOT give permission.
// See: https://webglfundamentals.org/webgl/lessons/webgl-cors-permission.html
function requestCORSIfNotSameOrigin(img, url) {
  if ((new URL(url, window.location.href)).origin !== window.location.origin) {
    img.crossOrigin = "";
  }
}
