//Bobby P.  Nov 8 2024

class lineGraph{
  
  /*
  
  By default, the line graph will map the indices of the Y array to the xrange. 
  
  If i remember to code it, Supplying an X table will override that behaviour.
  
  before displaying a graph, either call automaticRange() or supply an X and Y range to xrange and/or yrange. 
  
  e.g. xrange = [min, max]
  
  
  
  */
  
  constructor(Y, title){
    
    this.Y = Y
    
    this.title = title
    
    this.xlabel = "X"
    this.ylabel = "Y"
    
    this.margin = 0.11
    
    this.automaticRange();
    
    this.hue = 100
    
  }
  
  setLabels(xlabel, ylabel){
    this.xlabel = xlabel
    this.ylabel = ylabel
  }
  
  automaticRange(){
    //if(this.Y.length == 0) {return}
    
    this.yrange = [min(...this.Y), max(...this.Y)];
  }
  automaticRangeInclusive(){
    //prevent range shrinking if the old yrange is larger than the new range
     this.yrange = [
       min(...this.Y, this.yrange[0]), 
       max(...this.Y, this.yrange[1])
     ];
  }
  
  draw(posx, posy, sizex, sizey){
    
    //Border and background
    stroke(40);
    strokeWeight(1);
    fill(0);
    rect(posx-1, posy-1, sizex+2, sizey+2);
    
    
    textSize(min(sizex,sizey) * this.margin * 0.6 + 1);
    
    //title
    textAlign(CENTER, TOP);
    fill(255)
    stroke(0,0,0,0)
    text(this.title, posx + sizex/2, posy)
    
    //x and y axes
    push();
    translate(posx, posy+sizey/2);
    rotate(-PI/2);
    text(this.ylabel, 0,0)
    pop();
    
    textAlign(CENTER,BOTTOM)
    text(this.xlabel, posx+sizex/2, posy+sizey)
    
    let innerBLx = posx + sizex*this.margin
    let innerBLy = posy + sizey*(1-this.margin)
    let innerTRx = posx + sizex
    let innerTRy = posy + sizey*this.margin
    let length = this.Y.length
    
    this.overlay(posx, posy, sizex, sizey)
    
    //range and domain
    stroke(0,0)
    //range
    fill(255)
    textAlign(RIGHT, BOTTOM);
    text(this.yrange[0].toPrecision(3), innerBLx, innerBLy)
    textAlign(RIGHT, TOP);
    text(this.yrange[1].toPrecision(3), innerBLx, innerTRy+10)
    
    
    //domain
    textAlign(CENTER, TOP);
    text(0, innerBLx, innerBLy)
    textAlign(RIGHT, TOP);
    text(length, innerTRx, innerBLy)
    
  }
  
  //only draws the actual linegraph component
  overlay(posx, posy, sizex, sizey){
    
    //graph data
    
    let prev_y = this.Y[0]
    let length = this.Y.length
    
    if (length <= 1){
      text("no data to show", posx+sizex/2, posy+sizey/2);
    }
    
    let innerBLx = posx + sizex*this.margin
    let innerBLy = posy + sizey*(1-this.margin)
    let innerTRx = posx + sizex
    let innerTRy = posy + sizey*this.margin
    
    stroke(this.hue,100,255)
    strokeWeight(1);
    
    for(let i = 1; i < length; i++){
      let y = this.Y[i]
      line(
        map(i-1, 0, length, innerBLx, innerTRx),
        map(prev_y, ...this.yrange, innerBLy, innerTRy),
        map(i, 0, length, innerBLx, innerTRx),
        map(y, ...this.yrange, innerBLy, innerTRy),
      );

      prev_y = y;
      
    }
    
  }
  
}