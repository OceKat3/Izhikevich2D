//user interface dimension
class udim{
  
  constructor(x, y){
    this.x = x;
    this.y = y;
  }
  
}

function translateUdim(u){
  translate(u.x * width, u.y*height);
}

//user interface translation interface with position, scale, and anchor point

class udim3{
  
  constructor(xpos=0, ypos=0, xscale=0.2, yscale=0.2, anchorx=0.5, anchory=0.5, constraint='xy'){
    
    this.pos = new udim(xpos, ypos)
    this.size = new udim(xscale, yscale)
    this.anchor = new udim(anchorx, anchory)
    
    this.sizeConstraint = constraint
    
  }
  
  //capitalized because this function name has already been registered by p5js
  Translate(){
    const [x, y, ...rest] = this.toCornerSize()
    translate(x, y)
  }
  
  Rect(){
    
    push();
    rect(...(this.toCornerSize()));
    pop();
  }
  
  //returns an array/tuple. expected use with the decomposition operator ...arr
  toCornerSize(){
    let netSizeX = this.size.x * (this.sizeConstraint[0]=='x' ? width : height)
    let netSizeY = this.size.y * (this.sizeConstraint[1]=='x' ? width : height)
    return [
      this.pos.x * width - netSizeX * this.anchor.x,
      this.pos.y * height - netSizeY * this.anchor.y,
      netSizeX,
      netSizeY
    ];
    
  }
  
  transformObject(obj){
    
    const [posx, posy, sx, sy] = this.toCornerSize();
    
    obj.position(posx, posy);
    obj.size(sx, sy);
    
  }
  
  isPointInside(x, y){
    
    const [px, py, sx, sy] = this.toCornerSize();
    
    return (x > px && y > py && x < px+sx && y < py+sy)
    
  }
  
}

function udim3FromPixels(px, py, psizex, psizey, ax, ay){
  return new udim3(px/width, py/height, psizex/width, psizey/height, ax, ay)
}

