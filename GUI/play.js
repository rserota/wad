var coolSound;

function soundOn (){

if(typeof coolSound !== 'undefined') coolSound.stop();

var p = document.getElementById('WADsynth');
var params = [];
var settings = {};
for (var i = 0; i < p.length; i++){
if (p[i].value) params.push(p[i].value);
}

console.log(params + " " + params.length);

settings = {
    source : params[0],
    volume : parseFloat(params[1]),
    pitch : params[2]+params[3],
    panning : parseFloat(params[4]),
    env : {
        attack : parseFloat(params[5]),
        decay : parseFloat(params[6]),
        sustain : parseFloat(params[7]),
        hold : parseFloat(params[8]),
        release : parseFloat(params[9])
    },
    filter : {
        type : params[10],
        frequency : parseFloat(params[11]),
        q : parseFloat(params[12]),
        env : {
            frequency : parseFloat(params[13]),
            attack : parseFloat(params[14])
        }
    },
    /*reverb : {
     wet : 1, // Volume of the reverberations.
     impulse : 'http://www.myServer.com/path/to/impulse.wav' // A URL for an impulse response file, if you do not want to use the default impulse response.
     },*/
    vibrato : {
        shape : params[15],
        magnitude : parseFloat(params[16]),
        speed : parseFloat(params[17]),
        attack : parseFloat(params[18])
    },
    tremolo : {
        shape : params[19],
        magnitude : parseFloat(params[20]),
        speed : parseFloat(params[21]),
        attack : parseFloat(params[22])
    }
}

console.log(settings);
coolSound = new Wad(settings);
coolSound.play();
}

function soundOff () {
    coolSound.stop();
}

function changeValue(n, slider){
    //slider = name attribute of input tag
    document.getElementById(slider).innerHTML = n;
}
