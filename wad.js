

var Wad = (function(){
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    context = new AudioContext();
    navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia || navigator.getUserMedia

    var bufferSize = 2 * context.sampleRate,
    noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate),
    output = noiseBuffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }

    var whiteNoise = context.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;
    // whiteNoise.start(0);

    whiteNoise.connect(context.destination);

    var impulseURL = 'http://www.codecur.io/us/sendaudio/widehall.wav'
    var request = new XMLHttpRequest();
    request.open("GET", impulseURL, true);
    request.responseType = "arraybuffer";
    request.onload = function() {
        context.decodeAudioData(request.response, function (decodedBuffer){
            Wad.reverb = decodedBuffer
        })
    }
    request.send();
    




    var Wad = function(arg){
        this.source = arg.source;
        this.destination = arg.destination || context.destination
        this.volume = arg.volume || 1 // peak volume. min:0, max:1 (actually max is infinite, but ...just keep it at or below 1)
        this.defaultVolume = this.volume
        if(arg.pitch && arg.pitch in Wad.pitches){
            this.pitch = Wad.pitches[arg.pitch]
        }
        else{
            this.pitch = arg.pitch || 440
        }
        this.env = { //default envelope, if one is not specified on play
            attack : arg.env ? (arg.env.attack || 0) : 0, // time in seconds from onset to peak volume
            decay : arg.env ? (arg.env.decay || 0) : 0, // time in seconds from peak volume to sustain volume
            sustain : arg.env ? (arg.env.sustain || 1) : 1, // sustain volume level, as a percent of peak volume. min:0, max:1
            hold : arg.env ? (arg.env.hold || 9001) : 9001, // time in seconds to maintain sustain volume
            release : arg.env ? (arg.env.release || 0) : 0 // time in seconds from sustain volume to zero volume
        }
        this.defaultEnv = this.env
        

        if(!(this.source in {'sine':0, 'sawtooth':0, 'square':0, 'triangle':0, 'mic':0, 'noise':0})){
            /** fetch resources **/
            var request = new XMLHttpRequest();
            request.open("GET", this.source, true);
            request.responseType = "arraybuffer";
            var that = this
            request.onload = function() {
                context.decodeAudioData(request.response, function (decodedBuffer){
                    that.decodedBuffer = decodedBuffer
                })
            }
            request.send();
            //////////////////////
        }

        if(this.source === 'noise'){
            this.decodedBuffer = noiseBuffer
        }

        if (arg.filter){
            this.filter = {
                type : arg.filter.type,
                frequency : arg.filter.frequency,
                Q : arg.filter.q || 1
            } 
            if (arg.filter.env){
                this.filter.env = {
                    attack : arg.filter.env.attack,
                    frequency : arg.filter.env.frequency
                }
            }
            this.defaultFilter = this.filter
        }

        if (arg.reverb){
            this.reverb = {
                wet : arg.reverb.wet || 1
            }
        }

        if ('panning' in arg){
            this.panning = {
                location : arg.panning
            }
        }

        if (arg.vibrato){
            this.vibrato = {
                shape : arg.vibrato.shape || 'sine',
                speed : arg.vibrato.speed || 1,
                magnitude : arg.vibrato.magnitude || 5,
                attack : arg.vibrato.attack || 0
            }
        }
        if (arg.tremolo){
            this.tremolo= {
                shape : arg.tremolo.shape || 'sine',
                speed : arg.tremolo.speed || 1,
                magnitude : arg.tremolo.magnitude || 5,
                attack : arg.tremolo.attack || 1
            }
        }
        /** special handling for mic input **/
        if(this.source === 'mic'){
            var that = this
            navigator.getUserMedia({audio:true}, function(stream){
                console.log(that)
                that.nodes = []
                that.mediaStreamSource = context.createMediaStreamSource(stream)
                that.nodes.push(that.mediaStreamSource)
                that.gain = context.createGain()
                that.gain.gain.value = that.volume
                that.nodes.push(that.gain)

                if (that.filter){
                    that.filter.node = context.createBiquadFilter()
                    that.filter.node.type = that.filter.type
                    that.filter.node.frequency.value = that.filter.frequency
                    that.filter.node.Q.value = that.filter.q
                    that.nodes.push(that.filter.node)
                }

                if (that.reverb){
                    that.reverb.node = context.createConvolver()
                    that.reverb.node.buffer = Wad.reverb
                    that.reverb.gain = context.createGain()
                    that.reverb.gain.gain.value = that.reverb.wet

                    that.nodes.push(that.reverb.node)
                    that.nodes.push(that.reverb.gain)
                }
                that.nodes.push(context.destination)

                plugEmIn(that.nodes)
                
            });
        }
        /////////////////////////////////////

        // if (arg.lfo){
        //     this.lfo = {}
        //     if (arg.lfo.volume){
        //         this.lfo.volume = {
        //             source : arg.lfo.volume.source || 'sine',
        //             pitch : arg.lfo.volume.pitch || 1,
        //             volume : arg.lfo.volume.volume || 5,
        //             env : {
        //                 attack : arg.lfo.volume.attack || 0,
        //                 hold : this.env.hold
        //             }
        //         }

        //     }
        // }

        this.setVolume = function(volume){
            this.volume = volume;
            if(this.gain){this.gain.gain.value = volume};
        }

        var filterEnv = function(wad){
            wad.filter.node.frequency.linearRampToValueAtTime(wad.filter.frequency, context.currentTime)
            wad.filter.node.frequency.linearRampToValueAtTime(wad.filter.env.frequency, context.currentTime+wad.filter.env.attack)
        }

        var playEnv = function(wad){
            wad.gain.gain.linearRampToValueAtTime(0.0001, context.currentTime)
            wad.gain.gain.linearRampToValueAtTime(wad.volume, context.currentTime+wad.env.attack)
            wad.gain.gain.linearRampToValueAtTime(wad.volume*wad.env.sustain, context.currentTime+wad.env.attack+wad.env.decay)
            wad.gain.gain.linearRampToValueAtTime(0.0001, context.currentTime+wad.env.attack+wad.env.decay+wad.env.hold+wad.env.release)
            // wad.soundSource.stop(context.currentTime+wad.env.attack+wad.env.decay+wad.env.hold+wad.env.release)
            ///////////////////////////
            wad.soundSource.start(context.currentTime);
        }

        var plugEmIn = function(nodes){
            for (var i=1; i<nodes.length; i++){
                nodes[i-1].connect(nodes[i])
                if(nodes[i] instanceof ConvolverNode){
                    nodes[i-1].connect(nodes[i+2])
                }
            }
        }

        this.play = function(arg){
            this.nodes = []
            if(arg && arg.volume){this.volume = arg.volume}
            else {this.volume = this.defaultVolume}
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
                else {
                    this.soundSource.frequency.value = this.pitch
                }
            }
            else{
                this.soundSource = context.createBufferSource();
                this.soundSource.buffer = this.decodedBuffer;
                if(this.source === 'noise'){
                    this.soundSource.loop = true
                }  
            }

            if(arg && arg.env){
                this.env.attack = arg.env.attack || this.defaultEnv.attack
                this.env.decay = arg.env.decay || this.defaultEnv.decay
                this.env.sustain = arg.env.sustain || this.defaultEnv.sustain
                this.env.hold = arg.env.hold || this.defaultEnv.hold
                this.env.release = arg.env.release || this.defaultEnv.release 
            }
            else{
                this.env = this.defaultEnv
            }

            this.nodes.push(this.soundSource)

            if(arg && arg.filter && this.filter){
                this.filter.node = context.createBiquadFilter()
                this.filter.node.type = this.filter.type
                this.filter.node.frequency.value = arg.filter.frequency || this.filter.frequency
                this.filter.node.Q.value = arg.filter.q || this.filter.q
                if (arg.filter.env){
                    this.filter.env = {
                        attack : arg.filter.env.attack || this.defaultFilter.env.attack,
                        frequency : arg.filter.env.frequency || this.defaultFilter.env.frequency
                    }
                }
                else if (this.defaultFilter.env){
                    this.filter.env = this.defaultFilter.env
                }
                this.nodes.push(this.filter.node)            
            }
            else if(this.filter){
                if(this.defaultFilter.env){
                    this.filter.env = this.defaultFilter.env
                }
                this.filter.node = context.createBiquadFilter()
                this.filter.node.type = this.filter.type
                this.filter.node.frequency.value = this.filter.frequency
                this.filter.node.Q.value = this.filter.q
                this.nodes.push(this.filter.node)
            }

            this.gain = context.createGain()
            this.nodes.push(this.gain)

            if (this.reverb){
                this.reverb.node = context.createConvolver()
                this.reverb.node.buffer = Wad.reverb
                this.reverb.gain = context.createGain()
                this.reverb.gain.gain.value = this.reverb.wet

                this.nodes.push(this.reverb.node)
                this.nodes.push(this.reverb.gain)
            }

            if ((arg && arg.panning) || this.panning){
                this.panning.node = context.createPanner()
                var panning = (arg && arg.panning) ? arg.panning : this.panning.location
                this.panning.node.setPosition(panning, 0, 0)
                this.nodes.push(this.panning.node)
            }

            this.nodes.push(this.destination)

            plugEmIn(this.nodes)
            if(this.filter && this.filter.env){filterEnv(this)}
            playEnv(this)

            if (this.vibrato){
                this.vibrato.wad = new Wad({
                    source : this.vibrato.shape,
                    pitch : this.vibrato.speed,
                    volume : this.vibrato.magnitude,
                    env : {
                        attack : this.vibrato.attack
                    },
                    destination : this.soundSource.frequency
                })
                this.vibrato.wad.play()
            }

            if (this.tremolo){
                this.tremolo.wad = new Wad({
                    source : this.tremolo.shape,
                    pitch : this.tremolo.speed,
                    volume : this.tremolo.magnitude,
                    env : {
                        attack : this.tremolo.attack
                    },
                    destination : this.gain.gain
                })
                this.tremolo.wad.play()
            }
        }

    //If multiple instances of a sound are playing simultaneously, stopSound only can stop the most recent one
        this.stop = function(){
            if(!(this.source === 'mic')){
                this.gain.gain.linearRampToValueAtTime(.0001, context.currentTime+this.env.release)
                this.soundSource.stop(context.currentTime+this.env.release)             
            }
            else {
                this.mediaStreamSource.disconnect(0)
            }
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
