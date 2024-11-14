//Bobby P.  Nov 8 2024

// let i;

let manager;

let a;

function setup() {
  createCanvas(windowWidth, windowHeight-120, P2D);
  colorMode(HSB)
  
  a = new abcd_control("title");
  a.udim = new udim3(0.3, 0.7, 0.3, 0.3)
  
  // i = new izhikevich(20,20, 0*25*2, 20, 20, 400, 400)
  
  // let button = createButton('button');
  // button.position(0, height-40);
  // createSlider(0,1);
  // createSelect();
  
  // let slider = createSlider(0,100)
  // slider.position(100,height-40)
  // let slider2 = createSlider(0,100)
  // slider2.position(100,height-40)
  
  // let sl = createSelect();
  // sl.position(200, height-40)
  // sl.option('option 1')
  // sl.option('option 2')
  
  manager = new Manager();
  
  //let inp = createInput()
  //inp.position(50,50)
  
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight-90, P2D);
  manager.resize();
}

function gridlines(){
  stroke(255); // Set line color to white
  fill(255); // Set text color to white
  textSize(12); // Small text size
  textAlign(CENTER, CENTER);
  
  // Draw vertical lines and labels
  for (let i = 1; i <= 9; i++) {
    let x = width * (i / 10);
    line(x, 0, x, height);
    text((i / 10).toFixed(1), x, height - 10); // Display fraction at the bottom
  }
  
  // Draw horizontal lines and labels
  for (let i = 1; i <= 9; i++) {
    let y = height * (i / 10);
    line(0, y, width, y);
    text((i / 10).toFixed(1), 10, y); // Display fraction on the left
  }
}

function draw() {
  background(0);
  
  //gridlines();
  
  manager.step();
  manager.render();
  
  //a.render(a.udim);
  
}
function mousePressed(){
  
  //allow fullscreen when debugging in the p5js web editor
  if(window.location.href.includes("p5js")) {
    var fs = fullscreen();
    if (!fs) {
      fullscreen(true) ;
    }
  }
  
  manager.mouseClick();
}
