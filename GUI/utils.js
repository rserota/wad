app.init.utils = function(app){

    app.beatLen = ( 60 / app.bpm ) * 1000 // length of one beat in milliseconds 
    app.b = function(numBeats) { // returns length of n beats in seconds
        return ( numBeats * app.beatLen ) / 1000;
    }

}