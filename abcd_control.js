//Bobby P. Nov 13, 2024
//designed specifically to use abcd values for the Izhikevich model of spiking neurons

const a_min = 0
const a_max = 0.1
const b_min = 0.1
const b_max = 0.3
const c_min = -80
const c_max = 0
const d_min = 1
const d_max = 10

class abcd_control{
  
  constructor(title, a = 0.1,b = 0.2,c = -60,d = 4){
    this.a = a
    this.b = b
    this.c = c
    this.d = d
    this.title = title
    this.hue = 220;
    
  }
  
  render(udim){
    
    const [posx, posy, sx, sy] = udim.toCornerSize();
    
   
    
    //display the adsr chart
    //see https://en.wikipedia.org/wiki/Envelope_(music)
    
    stroke(40);
    strokeWeight(1);
    fill(0);
    udim.Rect();
    
    line(posx+sx/2, posy, posx+sx/2, posy+sy)
    
    stroke(this.hue,200,120)
    strokeWeight(1);
    fill(this.hue,150,20)
    
    let x1 = map(this.a, a_min, a_max, posx, posx+sx/2)
    let y1 = map(this.c, c_min, c_max, posy+sy, posy)
    
    let x2 = map(this.b, b_min, b_max, posx+sx/2, posx+sx)
    let y2 = map(this.d, d_min, d_max, posy+sy, posy)
    
    
    beginShape();
    
    vertex(posx,posy);
    
    for(let x = posx; x < posx+sx; x+=2.111){ //decimal place reduces integer degenerate cases in graph
      let y;
      if(x < x1){
        
        let percent = map(x, posx, x1, 0, 1)
        let y_percent = (1 - percent)**3
        y = map(y_percent, 0, 1, y1, posy)
        
      }else if(x1 < x && x < x2){
        
        let percent = map(x, x1, x2, 0, 1)
        let y_percent = sqrt(max(percent, 0))
        y = map(y_percent, 0, 1, y1, y2)
        
      }else{  
        
        let percent = map(x, x2, posx+sx, 0, 1)
        let y_percent = percent
        y = map(y_percent, 0, 1, y2, posy)
        
      }
      y = constrain(y, posy, posy+sy)
      vertex(x,y)
    }
    
    vertex(posx+sx, posy+sy)
    vertex(posx, posy+sy)
    
    endShape(CLOSE);
    
    circle(x1, y1, 15)
    circle(x2, y2, 15)
    
    fill(0,0);
    stroke(40);
    strokeWeight(1)
    rect(posx,posy,sx,sy)
    
     //user input
    if(udim.isPointInside(mouseX, mouseY)){
      stroke(140);
      rect(posx,posy,sx,sy)
      
      if(mouseIsPressed){

        if(mouseX < posx+sx/2){
          //x1 -> a
          this.a = map(mouseX, posx, posx+sx/2, a_min, a_max)
          //y1 -> c
          this.c = map(mouseY, posy+sy, posy, c_min, c_max)
        }else{
          //x2 -> b
          this.b = map(mouseX, posx+sx/2, posx+sx, b_min, b_max)
          //y2 -> d
          this.d = map(mouseY, posy+sy, posy, d_min, d_max)
        }
        
      }
    }
    
    this.a = constrain(this.a, a_min, a_max)
    this.b = constrain(this.b, b_min, b_max)
    this.c = constrain(this.c, c_min, c_max)
    this.d = constrain(this.d, d_min, d_max)
    
    
    //display text
    
    stroke(0)
    textSize(14)
    fill(255);
    
    textAlign(LEFT, BOTTOM)
    text(this.title, posx, posy)
    
    textAlign(LEFT, TOP)
    text(`a = ${round(this.a, 3)}    b = ${round(this.b, 3)}    c = ${round(this.c, 0)}    d = ${round(this.d, 2)}`,
         posx, posy+sy)
    
    textAlign(CENTER, BOTTOM)
    text("a", posx+sx*0.25, posy+sy)
    text("b", posx+sx*0.75, posy+sy)
    textAlign(LEFT, BOTTOM)
    text("c", posx, posy+sy/2)
    textAlign(RIGHT, BOTTOM)
    text("d", posx+sx, posy+sy/2)
    
    
    
  }
  
  values(){
    return [this.a, this.b, this.c, this.d];
  }
  
  position(){
    
  }
  size(){
    
  }
  
}