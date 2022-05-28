/**
 * 二维向量基本操作类
 */
 export class Vector2D extends Array {
    constructor(x = 1, y = 0) {
      super(x, y);
    }
  
    set x(v) {
      this[0] = v;
    }
  
    set y(v) {
      this[1] = v;
    }
  
    get x() {
      return this[0];
    }
  
    get y() {
      return this[1];
    }
    //获取向量的长度（向量的膜）
    get len() {
      //Math.hypot() 函数返回它的所有参数的平方和的平方根(x*x + y*y+...)
      return Math.hypot(this.x, this.y);
    }
    //获取向量的方向角（Math.atan2 的取值范围是 -π到π，负数表示在 x 轴下方，正数表示在 x 轴上方）
    get dir() {
      //Math.atan2() 返回从原点(0,0)到(x,y)点的线段与x轴正方向之间的平面角度(弧度值)Math.atan2(y,x)
      return Math.atan2(this.y, this.x);
    }
  
    copy() {
      return new Vector2D(this.x, this.y);
    }
    //向量相加
    add(v) {
      this.x += v.x;
      this.y += v.y;
      return this;
    }
    //向量相减
    sub(v) {
      this.x -= v.x;
      this.y -= v.y;
      return this;
    }
  
    scale(a) {
      this.x *= a;
      this.y *= a;
      return this;
    }
    //叉乘
    cross(v) {
      return this.x * v.y - v.x * this.y;
    }
    //点乘
    dot(v) {
      return this.x * v.x + v.y * this.y;
    }
  
    normalize() {
      return this.scale(1 / this.length);
    }
    
    //向量的旋转
    rotate(rad) {
      const c = Math.cos(rad),
        s = Math.sin(rad);
      const [x, y] = this;
  
      this.x = x * c + y * -s;
      this.y = x * s + y * c;
  
      return this;
    }
    //获取x坐标在x轴上的分量
    xAxisComponent(v){
        return v.len()*Math.cos(v.dir());//求领边
    }
    //获取y坐标在y轴上的分量
    yAxisComponent(v){
        return v.len()*Math.sin(v.dir());//求对边
    }
  }