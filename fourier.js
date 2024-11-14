//Bobby P.  Nov 10 2024
/*

data: indexed array of time-series data

timescale: specify what units the indices of the data are. For example, if data is indexed over milliseconds, timescale is 1/1000

Fmin, Fmax, Fstep: determine the range of frequencies the fft should scan through

Returns indexed array {frequency : amplitude}

*/

function dft(data, timescale, Fmin, Fmax, Fstep){
  
  let out = []
  
  for(let omega = Fmin; omega < Fmax; omega += Fstep){
    
    let sum_imag = 0;
    let sum_real = 0;
    
    for(let n = 0; n < data.length; n++){
      
      let theta = omega * PI * 2 * timescale
      sum_imag += data[n] * sin(theta)
      sum_real += data[n] * cos(theta)
      
    }
    
    out[omega] = sqrt(sq(sum_imag)+sq(sum_real))
    
  }
  
}