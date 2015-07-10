app.init.utils = function(app){

    app.beatLen = ( 60 / app.bpm ) * 1000 // length of one beat in milliseconds 
    app.b = function(numBeats) { // returns length of n beats in seconds
        return ( numBeats * app.beatLen ) / 1000;
    }
    // converts values from the range input (1-100) to sensible frequencies (20-5000)
    app.range2freq = function(freq){
        return Math.floor(Math.pow(freq, 1.8))
    }

}