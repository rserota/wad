var Wad = (function(){

    window.AudioContext = window.AudioContext || window.webkitAudioContext
    context = new AudioContext()

    var Wad = function(arg){
        this.source = arg.source
        this.volume = arg.volume || 1 // peak volume. min:0, max:1 (actually max is infinite, but ...just keep it at or below 1)
        this.env = {
            attack : arg.env ? (arg.env.attack || 0) : 0, // time in seconds from onset to peak volume
            decay : arg.env ? (arg.env.decay || 0) : 0, // time in seconds from peak volume to sustain volume
            sustain : arg.env ? (arg.env.sustain || 1) : 1, // sustain volume level, as a percent of peak volume. min:0, max:1
            hold : arg.env ? (arg.env.hold || 9001) : 9001, // time in seconds to maintain sustain volume
            release : arg.env ? (arg.env.release || 0) : 0 // time in seconds from sustain volume to zero volume
        }
        

        if(!(this.source in {'sine':0, 'sawtooth':0, 'square':0, 'triangle':0})){
            /** fetch resources **/
            var request = new XMLHttpRequest();
            request.open("GET", this.source, true)
            request.responseType = "arraybuffer"
            var that = this
            request.onload = function() {
                context.decodeAudioData(request.response, function onSuccess(decodedBuffer){
                    that.decodedBuffer = decodedBuffer
                })
            }
            request.send();
            //////////////////////
        }

        if (arg.filter){
            this.filter = context.createBiquadFilter()
            this.filter.type = arg.filter.type
            this.filter.frequency.value = arg.filter.frequency
            this.filter.Q.value = arg.filter.q || 1
        }

        this.setVolume = function(volume){
            this.volume = volume
        }

        var playEnv = function(wad){
            wad.gain.gain.linearRampToValueAtTime(0.0001, context.currentTime)
            wad.gain.gain.linearRampToValueAtTime(wad.volume, context.currentTime+wad.env.attack)
            wad.gain.gain.linearRampToValueAtTime(wad.volume*wad.env.sustain, context.currentTime+wad.env.attack+wad.env.decay)
            wad.gain.gain.linearRampToValueAtTime(0.0001, context.currentTime+wad.env.attack+wad.env.decay+wad.env.hold+wad.env.release)
            wad.soundSource.stop(context.currentTime+wad.env.attack+wad.env.decay+wad.env.hold+wad.env.release)
            ///////////////////////////
            wad.soundSource.start(context.currentTime)
        }

        this.nodes = []
        var plugEmIn = function(nodes){
            for (var i=1; i<nodes.length; i++){
                nodes[i-1].connect(nodes[i])
            }
        }

        this.play = function(arg){
            if(arg && arg.volume){this.volume = arg.volume}
            if(this.source in {'sine':0, 'sawtooth':0, 'square':0, 'triangle':0}){            
                this.soundSource = context.createOscillator()
                this.soundSource.type = this.source
                if(arg && arg.pitch){
                    if(arg.pitch in Wad.pitches){
                        this.soundSource.frequency.value = Wad.pitches[arg.pitch]
                    }
                    else{
                        this.soundSource.frequency.value = arg.pitch
                    }
                }
            }
            else{
                this.soundSource = context.createBufferSource()
                this.soundSource.buffer = that.decodedBuffer  
            }

            if(arg && arg.env){
                this.env.attack = arg.env.attack || this.env.attack
                this.env.decay = arg.env.decay || this.env.decay
                this.env.sustain = arg.env.sustain || this.env.sustain
                this.env.hold = arg.env.hold || this.env.hold
                this.env.release = arg.env.release || this.env.release 
            }

            this.nodes = []
            this.nodes.push(this.soundSource)

            if (this.filter){
                this.nodes.push(this.filter)
            }

            this.gain = context.createGain()
            this.nodes.push(this.gain)

            this.nodes.push(context.destination)

            plugEmIn(this.nodes)

            playEnv(this)
        }

    //If multiple instances of a sound are playing simultaneously, stopSound only can stop the most recent one
        this.stop = function(){
            this.gain.gain.linearRampToValueAtTime(.0001, context.currentTime+this.env.release)
            this.soundSource.stop(context.currentTime+this.env.release)
        }
    }

    Wad.pitches = {
        'A0' :27.5000, 
        'A#0' :29.1352,
        'Bb0' :29.1352,
        'B0' :30.8677,
        'C1' :32.7032,
        'C#1' :34.6478,
        'Db1' :34.6478,
        'D1' :36.7081,
        'D#1' :38.8909,
        'Eb1' :38.8909,
        'E1' :41.2034,
        'F1' :43.6535,
        'F#1' :46.2493,
        'Gb1' :46.2493,
        'G1' :48.9994,
        'G#1' :51.9131,
        'Ab1' :51.9131,
        'A1' :55.0000,
        'A#1' :58.2705,
        'Bb1' :58.2705,
        'B1' :61.7354,
        'C2' :65.4064,
        'C#2' :69.2957,
        'Db2' :69.2957,
        'D2' :73.4162,
        'D#2' :77.7817,
        'Eb2' :77.7817,
        'E2' :82.4069,
        'F2' :87.3071,
        'F#2' :92.4986,
        'Gb2' :92.4986,
        'G2' :97.9989,
        'G#2' :103.826,
        'Ab2' :103.826,
        'A2' :110.000,
        'A#2' :116.541,
        'Bb2' :116.541,
        'B2' :123.471,
        'C3' :130.813,
        'C#3' :138.591,
        'Db3' :138.591,
        'D3' :146.832,
        'D#3' :155.563,
        'Eb3' :155.563,
        'E3' :164.814,
        'F3' :174.614,
        'F#3' :184.997,
        'Gb3' :184.997,
        'G3' :195.998,
        'G#3' :207.652,
        'Ab3' :207.652,
        'A3' :220.000,
        'A#3' :233.082,
        'Bb3' :233.082,
        'B3' :246.942,
        'C4' :261.626,
        'C#4' :277.183,
        'Db4' :277.183,
        'D4' :293.665,
        'D#4' :311.127,
        'Eb4' :311.127,
        'E4' :329.628,
        'F4' :349.228,
        'F#4' :369.994,
        'Gb4' :369.994,
        'G4' :391.995,
        'G#4' :415.305,
        'Ab4' :415.305,
        'A4' :440.000,
        'A#4' :466.164,
        'Bb4' :466.164,
        'B4' :493.883,
        'C5' :523.251,
        'C#5' :554.365,
        'Db5' :554.365,
        'D5' :587.330,
        'D#5' :622.254,
        'Eb5' :622.254,
        'E5' :659.255,
        'F5' :698.456,
        'F#5' :739.989,
        'Gb5' :739.989,
        'G5' :783.991,
        'G#5' :830.609,
        'Ab5' :830.609,
        'A5' :880.000,
        'A#5' :932.328,
        'Bb5' :932.328,
        'B5' :987.767,
        'C6' :1046.50,
        'C#6' :1108.73,
        'Db6' :1108.73,
        'D6' :1174.66,
        'D#6' :1244.51,
        'Eb6' :1244.51,
        'E6' :1318.51,
        'F6' :1396.91,
        'F#6' :1479.98,
        'Gb6' :1479.98,
        'G6' :1567.98,
        'G#6' :1661.22,
        'Ab6' :1661.22,
        'A6' :1760.00,
        'A#6' :1864.66,
        'Bb6' :1864.66,
        'B6' :1975.53,
        'C7' :2093.00,
        'C#7' :2217.46,
        'Db7' :2217.46,
        'D7' :2349.32,
        'D#7' :2489.02,
        'Eb7' :2489.02,
        'E7' :2637.02,
        'F7' :2793.83,
        'F#7' :2959.96,
        'Gb7' :2959.96,
        'G7' :3135.96,
        'G#7' :3322.44,
        'Ab7' :3322.44,
        'A7' :3520.00,
        'A#7' :3729.31,
        'Bb7' :3729.31,
        'B7' :3951.07,
        'C8' :4186.01
    }
    return Wad
})()