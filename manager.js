//Bobby P.  Nov 10 2024

function labeledInput(label, posx, posy, defaultValue=""){
  let inp = createInput(defaultValue);
  let div = createDiv(label);
  
  inp.udim = new udim3(posx, posy, 0.14, 0.02, 0, 0.5, "yy");
  div.udim = new udim3(posx, posy, 0.1, 0.02, 1.1, 0.5, "yy");
  div.style("text-align: right;")
  
  return [inp, div]
  
}
function labeledSlider(label, posx, posy, w, h, smin, smax, sstep, initValue){
  
  //create two divs - one for the label, and the other that automatically updates when the slider is changed
  
  let labeldiv = createDiv();
  let valuediv = createDiv();
  
  let slider = createSlider(smin, smax, sstep);
  
  slider.udim = new udim3(posx, posy, w, h, 0, 0.5, "yy");
  labeldiv.udim = new udim3(posx, posy, w, h, 1.1, 0.5, "yy");
  valuediv.udim = new udim3(posx, posy, w, h, -1.1, 0.5, "yy");
  
  labeldiv.style("text-align: right;")
  valuediv.style("text-align: left;")
  
  slider.value(initValue);
  valuediv.html(initValue);
  
  slider.input(() => valuediv.html(slider.value()))
  valuediv.html(slider.value())
  labeldiv.html(label)
  
  return [slider, valuediv, labeldiv]
  
}

class Manager{
  
  /*
  
  default settings:
  
  10x10 neurons
  paused
  no input signal
  
  Buttons, graphs, settings:
  
  Restart network
  
  Pause/play network
  
  (
  a value range
  b value range
  c value range
  d value range
  ) -> for excitatory and inhibitory neurons 
  
  size of model
    
  external signal
    waveform (dropdown):
      sine, sawtooth, square, DC
    amplitude
    axis of curve
  
  thalamic input
    amplitude min
    amplitude max
  
  connectivity rule (dropdown);
    global, neighbours, local
  
  excitatory connectivity strength min
  excitatory connectivity strength max
  inhibitory connectivity strength min
  inhibitory connectivity strength max
  
  reconnect network
  
  amount of inhibitory neurons
  
  inhibitory neuron placement (grouped, random, evenly spaced)
  
  graphs:
  average activation over time & input signal on same graph
  FFT of average activation over time

  clear data button
  
  
  
  */
  
  constructor(){
    
    //udim constructor: posx, posy, sizex, sizey, anchorx, anchory, sizeconstraint
    
    this.paused = false;
    
    this.model = new izhikevich(3,3,0,0,0,0,0)
    this.model.udim = new udim3(0.5, 0.5, 0.4, 0.4, 0.5, 0.5, 'yy');
    
    let graphs = {}
    graphs.averageVoltage = new lineGraph(this.model.average_voltage_history, "Average network voltage");
    graphs.averageVoltage.udim = new udim3(0.5, 0.99, 0.5, 0.23, 0.5, 1)
    
    let objects = {}
    objects.togglePlayback = createButton("Pause")
    objects.togglePlayback.udim = new udim3(0.1, 0.1, 0.08, 0.05, 0.5, 1) 
    objects.togglePlayback.mousePressed(() => {
      this.paused = !this.paused;
      objects.togglePlayback.html(this.paused ? "Play" : "Pause")
    })
    
    objects.restartModel = createButton("Restart")
    objects.restartModel.udim = new udim3(0.2, 0.1, 0.08, 0.05, 0.5, 1)
    objects.restartModel.mousePressed(() => {
      this.restartNetwork();
    });
    
    objects.autoUpdateParams = createCheckbox("auto-update a,b,c,d", true)
    objects.autoUpdateParams.udim = new udim3(0.65, 0.1, 0.2, 0.05, 0, 0.5)
    
    objects.connectivityType = createSelect();
    objects.connectivityType.udim = new udim3(0.2, 0.2, 0.12, 0.05);
    objects.connectivityType.option("Global", 'global')
    objects.connectivityType.option("Inverse sq.", 'invsq')
    objects.connectivityType.option("Adjacency", 'adj');
    objects.connectivityType.selected("Global");
    objects.connectivityType.changed(() => {
      this.updateNetworkConnectivity();
    });
    
    objects.connectivityDiv = createDiv("Connectivity:")
    //justify-content -> x-axis
    //align-items -> y-axis
    objects.connectivityDiv.style("display: flex; justify-content: center; align-items: center;")
    objects.connectivityDiv.udim = new udim3(0.08, 0.2, 0.04, 0.07);
    
    let controls = {}
    controls.excitatory = new abcd_control(
      "Excitatory neuron response parameters +/- 10%", 
      0.02, 0.2, -55, 5);
    controls.excitatory.udim = new udim3(0.95, 0.15, 0.3, 0.2, 1, 0);
    controls.inhibitory = new abcd_control(
      "Inhibitory neuron response parameters +/- 10%", 
      0.06, 0.22, -65, 2);
    controls.inhibitory.udim = new udim3(0.95, 0.4, 0.3, 0.2, 1, 0);
    controls.inhibitory.hue = 20;
    // //settings for excitatory neurons
    // [objects.a_input, objects.a_div] = 
    //   labeledInput("a range", 0.7, 0.2);
    // [objects.b_input, objects.b_div] = 
    //   labeledInput("b range", 0.88, 0.2);   
    // [objects.c_input, objects.c_div] = 
    //   labeledInput("c range", 0.7, 0.25);
    // [objects.d_input, objects.d_div] = 
    //   labeledInput("d range", 0.88, 0.25);
    
    //settings for inhibitory neurons
    
    [objects.inhibitory_input, objects.in_div, objects.in_slider]  = 
      labeledSlider("% Inhibitory neurons", 
                    0.15, 0.25, 0.3, 0.02, 0, 100, 1, 0);
    objects.inhibitory_input.mouseReleased(() => {this.restartNetwork();});
    
    [objects.dimension_input, objects.dimension_div, objects.dimension_slider]  = 
      labeledSlider("side length", 0.15, 0.3, 0.3, 0.02, 1, 50, 1, 3);
    objects.dimension_input.mouseReleased(() => {this.restartNetwork();});
    
    //input voltage
    this.theta = 0
    
    objects.signalDiv = createDiv("Input Waveform:")
    objects.signalDiv.udim = new udim3(0.08, 0.4, 0.1, 0.05);
    objects.signalDiv.style("display: flex; justify-content: center; align-items: center;")
    
    objects.inputWaveform = createSelect();
    objects.inputWaveform.udim = new udim3(0.2, 0.4, 0.12, 0.05);
    objects.inputWaveform.option("Sine", 'sine')
    objects.inputWaveform.option("Sawtooth", 'saw')
    objects.inputWaveform.option("Square", 'sq');
    objects.inputWaveform.selected("Global");
    objects.inputWaveform.changed(() => {
      this.updateNetworkConnectivity();
    });
    
    
    [objects.inputAmplitude, objects.inputAmplitude_d, objects.inputAmplitude_s]  = 
      labeledSlider("Amplitude", 0.15, 0.45, 0.3, 0.02, 0, 20, 1, 0);
  
    [objects.inputFrequency, objects.inputFrequency_d, objects.inputFrequency_s]  = 
      labeledSlider("Frequency", 0.15, 0.5, 0.3, 0.02, 5, 50, 1, 10);
    
    graphs.signalInput = new lineGraph([], "")
    graphs.signalInput.udim = graphs.averageVoltage.udim;
    graphs.signalInput.layered = true;
    graphs.signalInput.hue = 40
    
    
    this.graphs = graphs;
    this.objects = objects;
    this.controls = controls;
    this.resize()
    
    this.restartNetwork();
  }
  
  updateNetworkConnectivity(){
    let v = this.objects.connectivityType.value();
    if(v == 'global'){
      this.model.createGlobalConnectivity();
    }else if(v == 'invsq'){
      this.model.createDistanceConnectivity();
    }else{
      this.model.createLocalConnectivity();
    }
  }
  
  updateNetworkParameters(){
    this.model.updateParameters(
      ...(this.controls.excitatory.values()),
      ...(this.controls.inhibitory.values()),
      0.1,
      0.1
    )
  }
  
  restartNetwork(){
    let dim = this.objects.dimension_input.value();
    let percent_inhib = this.objects.inhibitory_input.value();
    
    this.model = new izhikevich(dim,dim,0,0,0,0,0);
    this.model.udim = new udim3(0.5, 0.5, 0.4, 0.4, 0.5, 0.5, 'yy');
    this.model.num_inhib = round(dim*dim*percent_inhib/100);
    this.updateNetworkParameters()
    this.updateNetworkConnectivity()
    
    this.resize();
  }
  
  resize(){
    
    
    //update the size of the model
    
    this.model.setTransform(...(this.model.udim.toCornerSize()))
    
    for (let idx in this.objects){
      //get the DOM object / p5.Element
      let obj = this.objects[idx]
      
      obj.udim.transformObject(obj)
    }
    
  }
  
  getInputVoltage(theta){
    let waveform = this.objects.inputWaveform.value()
    let amplitude = this.objects.inputAmplitude.value();
    let frequency = this.objects.inputFrequency.value();
    let inp;
    if(waveform == "sine"){
      inp = sin(2 * PI * theta * frequency) * amplitude;
    }else if(waveform == "saw"){
      let p = (1 / frequency)
      inp = (theta % p) / p * 2 - 1;
      inp *= amplitude;
    }else{ //sq -> square
      inp = Math.sign(sin(2 * PI * theta * frequency)) * amplitude;
    }
    return inp;
  }
  
  step(){
    
    //this.resize()
    if (this.paused) {return;}
    
    this.theta += 1/1000; //one millisecond per frame
    
    let inp = this.getInputVoltage(this.theta);
    
    this.model.step(inp);
    
    this.graphs.averageVoltage.Y = this.model.average_voltage_history
    this.graphs.averageVoltage.automaticRangeInclusive()
    
    this.graphs.signalInput.Y = this.model.inputSignalHistory;
    this.graphs.signalInput.automaticRange()

    if (this.objects.autoUpdateParams.checked()){
      this.updateNetworkParameters()
    }
  }
  
  render(){
    
    for(let idx in this.graphs){
      let graph = this.graphs[idx]
      if(graph.layered){
        graph.overlay(...(graph.udim.toCornerSize()))
      }else{
        graph.draw(...(graph.udim.toCornerSize()));
      }
    }
    
    for(let idx in this.controls){
      let control = this.controls[idx]
      control.render(control.udim);
    }
    this.model.show();
    
  }
  
  mouseClick(){
    
    this.model.mouseClick();
    
  }
  
}