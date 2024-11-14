//Bobby P.  Nov 9 2024
//Original model by Eugene M. Izhikevich.
//https://www.izhikevich.org/publications/spikes.pdf

function rand_arr(size, mn, mx){
  
  var arr = []
  
  for(i=0; i<size; i++){
    arr[i] = random(mn, mx);
  }
  
  return arr
  
}

class izhikevich{
  
  constructor(dimx, dimy, num_inhib, cornerx, cornery, w, h){
    
    this.cornerx = cornerx
    this.cornery = cornery
    this.w = w
    this.h = h
    
    this.dimx = dimx
    this.dimy = dimy
    
    this.num_inhib = num_inhib
    
    this.voltage_history = []
    
    this.voltages = [] //mV
    this.voltage_history = []
    this.average_voltage_history = []
    this.average_recovery_history = []
    this.inputSignalHistory = []
    this.recoveries = []
    
    this.connections = []
    
    this.a = []
    this.b = []
    this.c = []
    this.d = []
    
    for(let i = 0; i < dimx*dimy; i++){
      
      let inhibitory = i > dimx*dimy - num_inhib
      
      this.a[i] = inhibitory ? random(0.02,0.1) : 0.02
      this.b[i] = inhibitory ? random(0.20,0.25) : 0.2
      this.c[i] = inhibitory ? -65 : random(-65,-50)
      this.d[i] = inhibitory ? 2 : random(2,8)
      
      this.voltages[i] = -65
      this.voltage_history[i] = []
      this.recoveries[i] = this.b[i] * this.voltages[i]
      
    }
    
    this.createGlobalConnectivity()
    
  }
  //a,b,c,d -> excitatory, a,b,c,d -> inhibitory, 
  updateParameters(ae,be,ce,de,ai,bi,ci,di, range_ex, range_in){
    
    for(let i = 0; i < this.dimx*this.dimy; i++){
      
      let inhibitory = i > this.dimx*this.dimy - this.num_inhib
      
      let r = inhibitory ? 
          random(1-range_in, 1+range_in) : 
          random(1-range_ex, 1+range_ex)
      
      this.a[i] = inhibitory ? r*ai : r*ae
      this.b[i] = inhibitory ? r*bi : r*be
      this.c[i] = inhibitory ? r*ci : r*ce
      this.d[i] = inhibitory ? r*di : r*de
      
      // this.voltages[i] = -65
      // this.voltage_history[i] = []
      // this.recoveries[i] = this.b[i] * this.voltages[i]
      
    }
    
  }
  
  setTransform(posx, posy, sizex, sizey){
    
    this.cornerx = posx;
    this.cornery = posy;
    this.w = sizex;
    this.h = sizey;
    
  }
  
  //returns the connectivity weight from the index of the firing neuron to the index of the recieving neuron
  getConnection(recieving, firing){
    
    // randomSeed(firing*firing*firing + recieving*this.dimx*this.dimy + sin(firing)*100 + tan(recieving/this.dimx))
    if (firing > this.dimx*this.dimy - this.num_inhib){
      //inhibitory neuron
      return random(-1,0)
    }else{
      //excitatory neuron
      return random(0,0.5)
    }
    
  }
  getLocalConnection(recieving, firing){
    var dim = this.dimx
    var rx = recieving/dim
    var ry = recieving%dim
    var fx = firing/dim
    var fy = firing%dim
    
    return 2/max((dist(rx,ry,fx,fy)*3, 1))
  }
  
  step(external_input=0){
    
    this.inputSignalHistory.push(external_input)
    if(this.inputSignalHistory.length > 500) 
      this.inputSignalHistory = this.inputSignalHistory.slice(-500)
    
    var dt = 1; //milliseconds
    
    var fired_indices = new Set()
    //var fired_indices = []
    
    //the index after which all neurons are inhibitory
    var inhibitoryIndex = this.dimx*this.dimy - this.num_inhib;
    
    let average_voltage = 0
    let average_recovery = 0
    
    for(let x = 0; x < this.dimx*this.dimy; x++){
      average_voltage += this.voltages[x]
      average_recovery += this.recoveries[x]
      if(this.voltages[x] >= 35){
        fired_indices.add(x)
        this.voltages[x] = this.c[x]
        this.recoveries[x] = this.recoveries[x] + this.d[x]
      }
    }
    average_voltage /= (this.dimx*this.dimy);
    average_recovery /= (this.dimx*this.dimy);
    this.average_voltage_history.push(average_voltage)
    
    if(this.average_voltage_history.length > 500) 
      this.average_voltage_history = this.average_voltage_history.slice(-500)
    
    this.average_recovery_history.push(average_recovery)
    if(this.average_recovery_history.length > 500) 
      this.average_recovery_history = this.average_recovery_history.slice(-500)
    
    for(let i = 0; i < this.dimx*this.dimy; i++){
      if(fired_indices.has(i)) {continue;}
      
      var v = this.voltages[i]
      var u = this.recoveries[i]
      
      if(v >= 35){continue;}
      
      
      // var x = i / this.dimx;
      // var y = i % this.dimx;
      
      //thalamic input
      var I = random(0,5)
      
      
      for(let fired of fired_indices){
        I += this.connections[i + fired*this.dimx*this.dimy]
        if(v+I>=35){break;}
      }
      
      v += (dt/2) * (0.04*v*v + 5*v + 140 - u + I + external_input)
      v += (dt/2) * (0.04*v*v + 5*v + 140 - u + I + external_input)
      //run update twice for numeric stability? According to the original paper
      
      u += (dt) * this.a[i] * (this.b[i] * v - u)
      
      v = min(v,40)
      
      this.voltages[i] = v
      this.recoveries[i] = u
      
      this.voltage_history[i].push(v)
      
      if(this.voltage_history[i].length > 400) 
        this.voltage_history[i] = this.voltage_history[i].slice(-400)
      
    }
    
    this.prev_fired_indices = fired_indices
    
  }
  
  show(){
    
    stroke(0,0,0,0)
    strokeWeight(1)
    
    for(let x = 0; x < this.dimx; x++){
      for(let y = 0; y < this.dimy; y++){
        
        let i = x + y*this.dimx;
        
        // if(this.prev_fired_indices && this.prev_fired_indices.has(i)){
        //   stroke(255)
        // }else{
        //   stroke(0)
        // }
        
        let v = this.voltages[i]
        
        v = map(v, -100, 60, 0, 255)
        
        let inhibitory = i > (this.dimx*this.dimy - this.num_inhib)
        if(inhibitory){
          fill(v,255,v)
          stroke(v,255,v)
        }else{
          fill(255-v,255,v)
          stroke(255-v,255,v)
        }
        
        
        
        rect(
          map(x, 0, this.dimx, this.cornerx, this.cornerx+this.w),
          map(y, 0, this.dimy, this.cornery, this.cornery+this.h),
          this.w/this.dimx,
          this.h/this.dimy
        )
        
      }
    }
    
    if(mouseX < this.cornerx+this.w && mouseX > this.cornerx && 
       mouseY < this.cornery+this.h && mouseY > this.cornery
      ){
      
      let x = floor(map(mouseX, this.cornerx, this.cornerx+this.w, 0, this.dimx))
      let y = floor(map(mouseY, this.cornery, this.cornery+this.h, 0, this.dimy))
      
      let i = x + y*this.dimx
      
      let g = new lineGraph(this.voltage_history[i], "Voltage over time");
      
      
      
      g.setLabels("time (ms)","voltage (mV)")
      
      g.draw(mouseX,mouseY,400,150)
    }
    
  }
  
  mouseClick(){
    
    if(mouseX < this.cornerx+this.w && mouseX > this.cornerx && 
       mouseY < this.cornery+this.h && mouseY > this.cornery
      ){
      
      let x = floor(map(mouseX, this.cornerx, this.cornerx+this.w, 0, this.dimx))
      let y = floor(map(mouseY, this.cornery, this.cornery+this.h, 0, this.dimy))
      
      let i = x + y*this.dimx
      
      this.voltages[i] = 40
      
    }
  }
  
  createLocalConnectivity(){
    
    this.connections = []
    
    let dimx = this.dimx;
    let dimy = this.dimy;
    for(let recv = 0; recv < dimx*dimy; recv++){
      for(let firing = 0; firing < dimx*dimy; firing++){
        
        let i = recv + firing*dimx*dimy
        
        let inhibitory = firing > (dimx*dimy - this.num_inhib)
        
        let rx = recv/dimx
        let ry = recv%dimx
        let fx = firing/dimx
        let fy = firing%dimx
        
        let x = rx-fx
        let y = ry-fy
        
        this.connections[i] = ((abs(x)<=1&&abs(y)<=1) ? (inhibitory ? -2 : 2) : 0)
        
        // this.connections[i] = random(0,1) * 
        //   (inhibitory?-1:1)/max((dist(rx,ry,fx,fy)*3, 1))
        
      }
    }
  }
  createGlobalConnectivity(){
    
    this.connections = []
    
    let dimx = this.dimx;
    let dimy = this.dimy;
    for(let recv = 0; recv < dimx*dimy; recv++){
      for(let firing = 0; firing < dimx*dimy; firing++){
        
        let i = recv + firing*dimx*dimy
        
        let inhibitory = firing > (dimx*dimy - this.num_inhib)
        
        this.connections[i] = inhibitory ? random(-1,0) : random(0,0.5)
        
      }
    }
  }
  createDistanceConnectivity(){
    let dimx = this.dimx;
    let dimy = this.dimy;
    for(let recv = 0; recv < dimx*dimy; recv++){
      for(let firing = 0; firing < dimx*dimy; firing++){
        
        let i = recv + firing*dimx*dimy
        
        let inhibitory = firing > (dimx*dimy - this.num_inhib)
        
        let rx = recv/dimx
        let ry = recv%dimx
        let fx = firing/dimx
        let fy = firing%dimx
        
        let x = rx-fx
        let y = ry-fy
        
        let dist_sq = (x*x + y*y)
        let invsq = 1 / max(1, dist_sq)
        
        this.connections[i] = (inhibitory ? -2 : 2) * invsq
        
        // this.connections[i] = random(0,1) * 
        //   (inhibitory?-1:1)/max((dist(rx,ry,fx,fy)*3, 1))
        
      }
    }
  }
  mousePressed(){
    
    
    
  }
  
}

