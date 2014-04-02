var coolSound = {};

function play(params){

if(coolSound) coolSound.stop();

coolSound = new Wad({
    source : 'sawtooth',
    volume : 1.0,
    pitch : 'A4',
    panning : -5,
    env : {
        attack : 0.0,
        decay : 0.0,
        sustain : 1.0,
        hold : 9001,
        release : 0
    },
    filter : {
        type : 'lowpass',
        frequency : 600,
        q : 1
        env : {
            frequency : 800,
            attack : 0.5
        }
    },
    /*reverb : {
        wet : 1, // Volume of the reverberations.
        impulse : 'http://www.myServer.com/path/to/impulse.wav' // A URL for an impulse response file, if you do not want to use the default impulse response.
    },*/
    vibrato : {
        shape : 'sine',
        magnitude : 3,
        speed : 4,
        attack : 0
    },
    tremolo : {
        shape : 'sine',
        magnitude : 3,
        speed : 4,
        attack : 0
    }
})

coolSound.play();
}

function stop(){
    coolSound.stop();
}
