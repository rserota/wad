
var Wad = (function(){

/** Let's do the vendor-prefix dance. **/
    var audioContext = window.AudioContext || window.webkitAudioContext;
    var context = new audioContext();
    navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia || navigator.getUserMedia
/////////////////////////////////////////


/** Pre-render a noise buffer instead of generating noise on the fly. **/
    var noiseBuffer = (function(){
        var bufferSize = 2 * context.sampleRate;
        var noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
        var output = noiseBuffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        return noiseBuffer
    })()
/////////////////////////////////////////////////////////////////////////


/** Grab the reverb impulse response file from a server.
You may want to change this URL to serve files from your own server.
Check out http://www.voxengo.com/impulses/ for free impulse responses. **/

////////////////////////////////////////////////////////////////////////

    var constructEnv = function(that, arg){   
        that.env = { //default envelope, if one is not specified on play
            attack : arg.env ? (arg.env.attack || 0) : 0, // time in seconds from onset to peak volume
            decay : arg.env ? (arg.env.decay || 0) : 0, // time in seconds from peak volume to sustain volume
            sustain : arg.env ? (arg.env.sustain || 1) : 1, // sustain volume level, as a percent of peak volume. min:0, max:1
            hold : arg.env ? (arg.env.hold || 9001) : 9001, // time in seconds to maintain sustain volume
            release : arg.env ? (arg.env.release || 0) : 0 // time in seconds from sustain volume to zero volume
        }
        that.defaultEnv = that.env
    }

    var constructFilter = function(that, arg){   
        if (arg.filter){
            that.filter = {
                type : arg.filter.type,
                frequency : arg.filter.frequency,
                Q : arg.filter.q || 1
            } 
            if (arg.filter.env){
                that.filter.env = {
                    attack : arg.filter.env.attack,
                    frequency : arg.filter.env.frequency
                }
            }
            that.defaultFilter = that.filter
        }
    }

    var requestAudioFile = function(that, callback){
        var request = new XMLHttpRequest();
        request.open("GET", that.source, true);
        request.responseType = "arraybuffer";
        that.playable--
        request.onload = function() {
            context.decodeAudioData(request.response, function (decodedBuffer){
                that.decodedBuffer = decodedBuffer
                if(callback){callback()}
                that.playable++
                if (that.playOnLoad){that.play(that.playOnLoadArg)}
            })
        }
        request.send();
    }

    var constructVibrato = function(that, arg){
        if (arg.vibrato){
            that.vibrato = {
                shape : arg.vibrato.shape || 'sine',
                speed : arg.vibrato.speed || 1,
                magnitude : arg.vibrato.magnitude || 5,
                attack : arg.vibrato.attack || 0
            }
        }
    }

    var constructTremolo = function(that, arg){
        if (arg.tremolo){
            that.tremolo= {
                shape : arg.tremolo.shape || 'sine',
                speed : arg.tremolo.speed || 1,
                magnitude : arg.tremolo.magnitude || 5,
                attack : arg.tremolo.attack || 1
            }
        }
    }

    var setUpMic = function(that, arg){
        navigator.getUserMedia({audio:true}, function(stream){
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
                that.reverb.node.buffer = that.reverb.buffer
                that.reverb.gain = context.createGain()
                that.reverb.gain.gain.value = that.reverb.wet
                that.nodes.push(that.reverb.node)
                that.nodes.push(that.reverb.gain)
            }

            if (that.panning){
                that.panning.node = context.createPanner()
                that.panning.node.setPosition(that.panning.location, 0, 0)
                that.nodes.push(that.panning.node)
            }

            that.nodes.push(context.destination)            
        });
    }


    var Wad = function(arg){
/** Set basic Wad properties **/
        this.source = arg.source;
        this.destination = arg.destination || context.destination // the last node the sound is routed to
        this.volume = arg.volume || 1 // peak volume. min:0, max:1 (actually max is infinite, but ...just keep it at or below 1)
        this.defaultVolume = this.volume
        this.playable = 1 // if this is less than 1, this Wad is still waiting for a file to download before it can play

        this.pitch = Wad.pitches[arg.pitch] || arg.pitch || 440

        constructEnv(this, arg)

        constructFilter(this, arg)

        //this.vibrato = constructVibrato(arg.vibrato)

        constructVibrato(this, arg)

        constructTremolo(this, arg)

        if (arg.reverb){
            this.reverb = {
                wet : arg.reverb.wet || 1

            }

            var impulseURL = arg.reverb.impulse || Wad.defaultImpulse
            var request = new XMLHttpRequest();
            request.open("GET", impulseURL, true);
            request.responseType = "arraybuffer";
            this.playable--
            var that = this
            request.onload = function() {
                context.decodeAudioData(request.response, function (decodedBuffer){
                    that.reverb.buffer = decodedBuffer
                    that.playable++
                    if (that.playOnLoad){that.play(that.playOnLoadArg)}

                })
            }
            request.send();
        }

        if ('panning' in arg){
            this.panning = {
                location : arg.panning
            }
        }
        
        else {
            this.panning = { location : 0 }
        }
////////////////////////////////


/** If the Wad's source is noise, set the Wad's buffer to the noise buffer we created earlier. **/
        if(this.source === 'noise'){
            this.decodedBuffer = noiseBuffer
        }
//////////////////////////////////////////////////////////////////////////////////////////////////


/** If the Wad's source is the microphone, the rest of the setup happens here. **/
        else if(this.source === 'mic'){
            setUpMic(this, arg)
        }
//////////////////////////////////////////////////////////////////////////////////        


/** If the source is not a pre-defined value, assume it is a URL for an audio file, and grab it now. **/
        else if(!(this.source in {'sine':0, 'sawtooth':0, 'square':0, 'triangle':0})){
            requestAudioFile(this, arg.callback)
        }
////////////////////////////////////////////////////////////////////////////////////////////////////////
    }


/** When a note is played, these two functions will schedule changes in volume and filter frequency,
as specified by the volume envelope and filter envelope **/
    var filterEnv = function(wad, arg){
        wad.filter.node.frequency.linearRampToValueAtTime(wad.filter.frequency, context.currentTime + arg.wait)
        wad.filter.node.frequency.linearRampToValueAtTime(wad.filter.env.frequency, context.currentTime+wad.filter.env.attack + arg.wait)
    }

    var playEnv = function(wad, arg){
        wad.gain.gain.linearRampToValueAtTime(0.0001, context.currentTime + arg.wait)
        wad.gain.gain.linearRampToValueAtTime(wad.volume, context.currentTime+wad.env.attack + arg.wait)
        wad.gain.gain.linearRampToValueAtTime(wad.volume*wad.env.sustain, context.currentTime+wad.env.attack+wad.env.decay + arg.wait)
        wad.gain.gain.linearRampToValueAtTime(0.0001, context.currentTime+wad.env.attack+wad.env.decay+wad.env.hold+wad.env.release + arg.wait)
        wad.soundSource.start(context.currentTime + arg.wait);
        wad.soundSource.stop(context.currentTime+wad.env.attack+wad.env.decay+wad.env.hold+wad.env.release + arg.wait)
    }
////////////////////////////////////////////////////////////////////////////////////////////////////


/** When all the nodes are set up for this Wad, this function plugs them into each other,
with special handling for reverb (ConvolverNode). **/
    var plugEmIn = function(nodes){
        for (var i=1; i<nodes.length; i++){
            nodes[i-1].connect(nodes[i])
            if(nodes[i] instanceof ConvolverNode){
                nodes[i-1].connect(nodes[i+2])
            }
        }
    }
/////////////////////////////////////////////////////////////////////////////////////////

    var setUpOscillator = function(that, arg){
        that.soundSource = context.createOscillator()
        that.soundSource.type = that.source
        if(arg && arg.pitch){
            if(arg.pitch in Wad.pitches){
                that.soundSource.frequency.value = Wad.pitches[arg.pitch]
            }
            else{
                that.soundSource.frequency.value = arg.pitch
            }
        }
        else {
            that.soundSource.frequency.value = that.pitch
        }
    }

    var setUpEnvOnPlay = function(that, arg){
        if(arg && arg.env){
            that.env.attack = arg.env.attack || that.defaultEnv.attack
            that.env.decay = arg.env.decay || that.defaultEnv.decay
            that.env.sustain = arg.env.sustain || that.defaultEnv.sustain
            that.env.hold = arg.env.hold || that.defaultEnv.hold
            that.env.release = arg.env.release || that.defaultEnv.release 
        }
        else{
            that.env = that.defaultEnv
        }
    }

    var setUpFilterOnPlay = function(that, arg){
        if(arg && arg.filter && that.filter){
            that.filter.node = context.createBiquadFilter()
            that.filter.node.type = that.filter.type
            that.filter.node.frequency.value = arg.filter.frequency || that.filter.frequency
            that.filter.node.Q.value = arg.filter.q || that.filter.q
            if (arg.filter.env){
                that.filter.env = {
                    attack : arg.filter.env.attack || that.defaultFilter.env.attack,
                    frequency : arg.filter.env.frequency || that.defaultFilter.env.frequency
                }
            }
            else if (that.defaultFilter.env){
                that.filter.env = that.defaultFilter.env
            }
            that.nodes.push(that.filter.node)            
        }
        else if(that.filter){
            if(that.defaultFilter.env){
                that.filter.env = that.defaultFilter.env
            }
            that.filter.node = context.createBiquadFilter()
            that.filter.node.type = that.filter.type
            that.filter.node.frequency.value = that.filter.frequency
            that.filter.node.Q.value = that.filter.q
            that.nodes.push(that.filter.node)
        }
    }

    var setUpReverbOnPlay = function(that, arg){


        that.reverb.node = context.createConvolver()
        that.reverb.node.buffer = that.reverb.buffer
        that.reverb.gain = context.createGain()
        that.reverb.gain.gain.value = that.reverb.wet
        that.nodes.push(that.reverb.node)
        that.nodes.push(that.reverb.gain)
    }

    var setUpPanningOnPlay = function(that, arg){
        if ((arg && arg.panning) || that.panning){
            that.panning.node = context.createPanner()
            var panning = (arg && arg.panning) ? arg.panning : that.panning.location
            that.panning.node.setPosition(panning, 0, 0)
            that.nodes.push(that.panning.node)
        }
    }

    var setUpVibratoOnPlay = function(that, arg){
        that.vibrato.wad = new Wad({
            source : that.vibrato.shape,
            pitch : that.vibrato.speed,
            volume : that.vibrato.magnitude,
            env : {
                attack : that.vibrato.attack
            },
            destination : that.soundSource.frequency
        })
        that.vibrato.wad.play()
    }

    var setUpTremoloOnPlay = function(that, arg){
        that.tremolo.wad = new Wad({
            source : that.tremolo.shape,
            pitch : that.tremolo.speed,
            volume : that.tremolo.magnitude,
            env : {
                attack : that.tremolo.attack
            },
            destination : that.gain.gain
        })
        that.tremolo.wad.play()
    }

/** the play() method will create the various nodes that are required for this Wad to play,
set properties on those nodes according to the constructor arguments and play() arguments,
plug the nodes into each other with plugEmIn(),
then finally play the sound by calling playEnv() **/
    Wad.prototype.play = function(arg){

        if(this.playable < 1){
            this.playOnLoad = true
            this.playOnLoadArg = arg
        }

        else if(this.source === 'mic'){
            plugEmIn(this.nodes)
        }

        else{
            this.nodes = []
            if(arg && !arg.wait){arg.wait = 0}
            if(!arg){var arg = {wait: 0}}
            if(arg && arg.volume){this.volume = arg.volume}
            else {this.volume = this.defaultVolume}

            if(this.source in {'sine':0, 'sawtooth':0, 'square':0, 'triangle':0}){            
                setUpOscillator(this, arg)
            }

            else{
                this.soundSource = context.createBufferSource();
                this.soundSource.buffer = this.decodedBuffer;
                if(this.source === 'noise'){
                    this.soundSource.loop = true
                }  
            }

            this.nodes.push(this.soundSource)


    /**  sets the volume envelope based on the play() arguments if present,
    or defaults to the constructor arguments if the volume envelope is not set on play() **/
            setUpEnvOnPlay(this, arg)
    ////////////////////////////////////////////////////////////////////////////////////////


    /**  sets up the filter and filter envelope based on the play() argument if present,
    or defaults to the constructor argument if the filter and filter envelope are not set on play() **/
            setUpFilterOnPlay(this, arg)
    ///////////////////////////////////////////////////////////////////////////////////////////////////


            this.gain = context.createGain() // sets up the gain node
            this.nodes.push(this.gain)

            if (this.reverb){ // sets up reverb
                setUpReverbOnPlay(this, arg)
            }

    /**  sets panning based on the play() argument if present, or defaults to the constructor argument if panning is not set on play **/
            setUpPanningOnPlay(this, arg)
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


            this.nodes.push(this.destination)

            plugEmIn(this.nodes) 

            if(this.filter && this.filter.env){ filterEnv(this) }
            playEnv(this, arg)

            if (this.vibrato){ //sets up vibrato LFO
                setUpVibratoOnPlay(this, arg)
            }

            if (this.tremolo){ //sets up tremolo LFO
                setUpTremoloOnPlay(this, arg)
            }
        }
    }
//////////////////////////////////////////////////////////////////////////////////////////


    Wad.prototype.setVolume = function(volume){
        this.volume = volume;
        if(this.gain){this.gain.gain.value = volume};
    }

    Wad.prototype.setPanning = function(panning){
        this.panning.node.setPosition(panning, 0, 0)
    }


/** If multiple instances of a sound are playing simultaneously, stop() only can stop the most recent one **/
    Wad.prototype.stop = function(){
        if(!(this.source === 'mic')){
            this.gain.gain.linearRampToValueAtTime(.0001, context.currentTime+this.env.release)
            this.soundSource.stop(context.currentTime+this.env.release)             
        }
        else {
            this.mediaStreamSource.disconnect(0)
        }
    }
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    Wad.defaultImpulse = 'http://www.codecur.io/us/sendaudio/widehall.wav'


/** This object is a mapping of note names to frequencies. **/ 
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
//////////////////////////////////////////////////////////////


    Wad.presets = {
        "high-hat-closed" : {source : 'noise', env : { hold : .06}, filter : { type : 'highpass', frequency : 400}}
    }

    return Wad
    
})()

