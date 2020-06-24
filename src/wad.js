import Tuna from 'tunajs';
import SoundIterator from './sound_iterator'
import AudioListener from './audio_listener'
import Polywad from './polywad'
	import {
		logStuff,
		logMessage,
		context,
		noiseBuffer,
		isArray,
		valueOrDefault,
		constructEnv,
		constructFilter,
		requestAudioFile,
		constructVibrato,
		constructTremolo,
		constructReverb,
		constructPanning,
		constructDelay,
		getConsent,
		setUpMic,
		setUpPanningOnPlay,
		setUpVibratoOnPlay,
		setUpTremoloOnPlay,
		setUpDelayOnPlay,
		setUpTunaOnPlay,
		plugEmIn,
		setUpEnvOnPlay,
		setUpFilterOnPlay,
		setUpReverbOnPlay,
		filterEnv,
		playEnv,
		setUpOscillator,
	} from './common'


var Wad = (function(){

    var Wad = function(arg){
/** Set basic Wad properties **/
        this.source        = arg.source;
        this.destination   = arg.destination || context.destination; // the last node the sound is routed to
        this.volume        = valueOrDefault(arg.volume, 1); // peak volume. min:0, max:1 (actually max is infinite, but ...just keep it at or below 1)
        this.defaultVolume = this.volume;
        this.playable      = 1; // if this is less than 1, this Wad is still waiting for a file to download before it can play
        this.pitch         = Wad.pitches[arg.pitch] || arg.pitch || 440;
        this.gain          = [];
        this.detune        = arg.detune || 0; // In Cents.
        this.globalReverb  = arg.globalReverb || false;
        this.offset        = arg.offset || 0;
        this.loop          = arg.loop   || false;
        this.tuna          = arg.tuna   || null;
        this.rate          = arg.rate   || 1;
        this.sprite        = arg.sprite || null;
        constructEnv(this, arg);
        constructFilter(this, arg);
        constructVibrato(this, arg);
        constructTremolo(this, arg);
        constructReverb(this, arg);
        this.constructExternalFx(arg, context);
        constructPanning(this, arg);
        constructDelay(this, arg);
        this.duration = (this.env.attack + this.env.decay + this.env.hold + this.env.release) * (1/(this.rate)) * 1000
////////////////////////////////


/** If the Wad's source is noise, set the Wad's buffer to the noise buffer we created earlier. **/
        if ( this.source === 'noise' ) {
            this.decodedBuffer = noiseBuffer;
        }
//////////////////////////////////////////////////////////////////////////////////////////////////


/** If the Wad's source is the microphone, the rest of the setup happens here. **/
        else if ( this.source === 'mic' ) {
            getConsent(this, arg);
        }
//////////////////////////////////////////////////////////////////////////////////


/** If the source is not a pre-defined value, assume it is a URL for an audio file, and grab it now. **/
        else if ( !( this.source in { 'sine' : 0, 'sawtooth' : 0, 'square' : 0, 'triangle' : 0 } ) ) {
            requestAudioFile(this, arg.callback);

            if ( this.sprite ) {
                var thatWad = this;
                for ( var sprite in this.sprite ) {
                    this[sprite] = {
                        sprite: this.sprite[sprite],
                        play: function(arg){
                            arg = arg || {}
                            arg.env = arg.env || {}
                            arg.env.hold = this.sprite[1] - this.sprite[0]
                            arg.offset = this.sprite[0]

                            return thatWad.play(arg)
                        }
                    }
                }
            }
        }
////////////////////////////////////////////////////////////////////////////////////////////////////////
        else { arg.callback && arg.callback(this) }
        Wad.allWads.push(this)
    };
    Wad.allWads = []
    Wad.micConsent = false
    Wad.audioContext = context
    Wad.listener = new AudioListener(context)
    if ( typeof Tuna != undefined ) {
        Wad.tuna = new Tuna(Wad.audioContext)
    }



/** Method to allow users to setup external fx in the constructor **/
    Wad.prototype.constructExternalFx = function(arg, context){
        //override me in your own code
    };


//////////////////////////////////////////////////////////////////////////////

/** To be overrided by the user **/
    Wad.prototype.setUpExternalFxOnPlay = function(arg, context){
        //user does what is necessary here, and then maybe does something like:
        // this.nodes.push(externalFX)
    };
///////////////////////////////////////////////////////////////


/** the play() method will create the various nodes that are required for this Wad to play,
set properties on those nodes according to the constructor arguments and play() arguments,
plug the nodes into each other with plugEmIn(),
then finally play the sound by calling playEnv() **/
    Wad.prototype.play = function(arg){
        arg = arg || { arg : null };
        if ( this.playable < 1 ) {
            this.playOnLoad    = true;
            this.playOnLoadArg = arg;
        }

        else if ( this.source === 'mic' ) {
            if ( Wad.micConsent ) {
                if ( arg.arg === null ) {
                    plugEmIn(this, arg);
                }
                else {
                    constructFilter(this, arg);
                    constructVibrato(this, arg);
                    constructTremolo(this, arg);
                    constructReverb(this, arg);
                    this.constructExternalFx(arg, context);
                    constructPanning(this, arg);
                    constructDelay(this, arg);
                    setUpMic(this, arg);
                    plugEmIn(this, arg);
                }
            }
            else { 
                logMessage('You have not given your browser permission to use your microphone.')
                getConsent(this, arg).then(function (that) {
                    that.play(arg);
                });
            }
        }

        else { // setup oscillators or audio clips
            this.nodes = [];
            if ( !arg.wait ) { arg.wait = 0; }
            if ( arg.volume ) { this.volume = arg.volume; }
            else { this.volume = this.defaultVolume; }
            arg.offset = arg.offset || this.offset || 0;


            if ( this.source in { 'sine' : 0, 'sawtooth' : 0, 'square' : 0, 'triangle' : 0 } ) {
                setUpOscillator(this, arg);
            }

            else {
                this.soundSource = context.createBufferSource();
                this.soundSource.buffer = this.decodedBuffer;
                if ( this.source === 'noise' || this.loop || arg.loop ) {
                    this.soundSource.loop = true;
                }
                
            }


            if ( this.soundSource.detune ) {
                this.soundSource.detune.value = arg.detune || this.detune;
            }

            if ( arg.wait === undefined ) {
                arg.wait = 0;
            }
            if (arg.exactTime === undefined) {
                arg.exactTime = context.currentTime + arg.wait;
            }
            this.lastPlayedTime = arg.exactTime - arg.offset

            this.nodes.push(this.soundSource);


    /**  sets the volume envelope based on the play() arguments if present,
    or defaults to the constructor arguments if the volume envelope is not set on play() **/
            setUpEnvOnPlay(this, arg);
    ////////////////////////////////////////////////////////////////////////////////////////

            if ( this.soundSource.playbackRate ) {
                this.soundSource.playbackRate.value = arg.rate || this.rate;
                this.env.hold = this.env.hold * (1/this.soundSource.playbackRate.value)
            }

    /**  sets up the filter and filter envelope based on the play() argument if present,
    or defaults to the constructor argument if the filter and filter envelope are not set on play() **/
            setUpFilterOnPlay(this, arg);
    ///////////////////////////////////////////////////////////////////////////////////////////////////
            setUpTunaOnPlay(this, arg);

            this.setUpExternalFxOnPlay(arg, context);


            this.gain.unshift(context.createGain()); // sets up the gain node
            this.gain[0].label = arg.label;
	    this.gain[0].soundSource = this.soundSource
            this.nodes.push(this.gain[0]);

            if ( this.gain.length > 15 ) {
                this.gain.length = 15
            }

            // sets up reverb
            if ( this.reverb ) { setUpReverbOnPlay(this, arg); }

    /**  sets panning based on the play() argument if present, or defaults to the constructor argument if panning is not set on play **/
            setUpPanningOnPlay(this, arg);
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


            setUpDelayOnPlay(this, arg);

            plugEmIn(this, arg);

            if ( this.filter && this.filter[0].env ) { filterEnv(this, arg); }
            playEnv(this, arg);

            //sets up vibrato LFO
            if ( this.vibrato ) { setUpVibratoOnPlay(this, arg); }

            //sets up tremolo LFO
            if ( this.tremolo ) { setUpTremoloOnPlay(this, arg); }

            var thatWad = this

            this.soundSource.onended = function(event){
                thatWad.playPromiseResolve(thatWad)
            }
    
            if ( !arg.unpause ) {
                this.playPromise = new Promise(function(resolve, reject){
                    thatWad.playPromiseResolve = resolve
                })
                return this.playPromise
            }
        }

        if ( arg.callback ) { arg.callback(this); }

    };

//////////////////////////////////////////////////////////////////////////////////////////


    /** Change the volume of a Wad at any time, including during playback **/
    Wad.prototype.setVolume = function(volume, timeConstant, label){
	timeConstant = timeConstant || .01
	if ( label ) {
	    if ( this.gain.length > 0 ) {
		for ( let i = 0; i < this.gain.length; i++ ) {
		    if ( this.gain[i].label === label ) {
			this.gain[i].gain.setValueAtTime(volume, context.currentTime)
		    }
		}
	    }
	}
	else {

	    this.defaultVolume = volume;
	    if ( this.gain.length > 0 ) { this.gain[0].gain.setValueAtTime(volume, context.currentTime) }
	}
	return this;
    };

    /**
    Change the playback rate of a Wad during playback.
    inputSpeed is a value of 0 < speed, and is the rate of playback of the audio.
    E.g. if input speed = 2.0, the playback will be twice as fast
    **/
    Wad.prototype.setRate = function(inputSpeed) {

        //Check/Save the input
        var speed;
        if(inputSpeed && inputSpeed > 0) speed = inputSpeed;
        else speed = 0;

        //Check if we have a soundsource (Though we always should)
        if(this.soundSource) {

            //Set the value
            this.soundSource.playbackRate.value = speed;
        }
        else {

            //Inform that there is no sound source on the current wad
            logMessage("Sorry, but the wad does not contain a soundSource!");
        }

        return this;
    };

    Wad.prototype.setPitch = function(pitch, timeConstant, label){
        timeConstant = timeConstant || .01
	if ( label ) {
	    for ( let i = 0; i < this.gain.length; i++ ) {
		if ( this.gain[i].label === label ) {
		    if ( pitch in Wad.pitches ) {
			this.gain[i].soundSource.frequency.setTargetAtTime(Wad.pitches[pitch], context.currentTime, timeConstant)
		    }
		    else {
			this.soundSource.frequency.settargetAtTime(pitch, context.currentTime, timeConstant)
		    }

		}
	    }
	    
	}
	else {
	    if ( pitch in Wad.pitches ) {
		if ( this.soundSource ) {
		    this.soundSource.frequency.value = Wad.pitches[pitch];
		}
		this.pitch = Wad.pitches[pitch]
	    }
	    else {
		if ( this.soundSource ) {
		    this.soundSource.frequency.value = pitch;
		}
		this.pitch = pitch
	    }
	}
        return this;
    };

    Wad.prototype.setDetune = function(detune, timeConstant, label){
        timeConstant = timeConstant || .01
	if ( label ) {
	    for ( let i = 0; i < this.gain.length; i++ ) {
		if ( this.gain[i].label === label ) {
		    this.gain[i].soundSource.detune.setTargetAtTime(detune, context.currentTime, timeConstant)
		}
	    }
	}
	else {
	    this.soundSource.detune.setTargetAtTime(detune, context.currentTime, timeConstant)
	}
	return this;
    };

    /** Change the panning of a Wad at any time, including during playback **/
    Wad.prototype.setPanning = function(panning, timeConstant, label){
        timeConstant = timeConstant || .01
        if ( typeof panning === 'number' && !context.createStereoPanner ) {
            panning = [panning, 0, 0]
        }

        this.panning.location = panning;
        if ( isArray(panning) && this.panning.type === '3d' && this.panning.node ) {
            this.panning.node.setPosition(panning[0], panning[1], panning[2]);

        }
        else if ( typeof panning === 'number' && this.panning.type === 'stereo' && this.panning.node) {
            this.panning.node.pan.setTargetAtTime(panning, context.currentTime, timeConstant)
        }

        if ( isArray(panning) ) { this.panning.type = '3d' }
        else if ( typeof panning === 'number' ) { this.panning.type = 'stereo' }
        return this;
    };

    /**
    Change the Reverb of a Wad at any time, including during playback.
    inputWet is a value of 0 < wetness/gain < 1
    **/
    Wad.prototype.setReverb = function(inputWet) {

        //Check/Save the input

        var wet;
        if(inputWet && inputWet > 0 && inputWet < 1) wet = inputWet;
        else if(inputWet >= 1) wet = 1;
        else wet = 0;

        //Check if we have delay
        if(this.reverb) {

            //Set the value
            this.reverb.wet = wet;

            //Set the node's value, if it exists
            if(this.reverb.node) {

                this.reverb.node.wet.gain.value = wet;
            }
        }
        else {

            //Inform that there is no reverb on the current wad
            logMessage("Sorry, but the wad does not contain Reverb!");
        }

        return this;
    };


    /**
    Change the Delay of a Wad at any time, including during playback.
    inputTime is a value of time > 0, and is the time in seconds between each delayed playback.
    inputWet is a value of gain 0 < inputWet < 1, and is Relative volume change between the original sound and the first delayed playback.
    inputFeedback is a value of gain 0 < inputFeedback < 1, and is Relative volume change between each delayed playback and the next.
    **/
    Wad.prototype.setDelay = function(inputTime, inputWet, inputFeedback){

        //Check/Save the input
        var time;
        if(inputTime && inputTime > 0) time = inputTime;
        else time = 0;

        var wet;
        if(inputWet && inputWet > 0 && inputWet < 1) wet = inputWet;
        else if(inputWet >= 1) wet = 1;
        else wet = 0;

        var feedback;
        if(inputFeedback && inputFeedback > 0 && inputFeedback < 1) feedback = inputFeedback;
        else if(inputFeedback >= 1) feedback = 1;
        else feedback = 0;

        //Check if we have delay
        if(this.delay) {

            //Set the value
            this.delay.delayTime = time;
            this.delay.wet = wet;
            this.delay.feedback = feedback;

            //Set the node's value, if it exists
            if(this.delay.delayNode) {

                this.delay.delayNode.delayNode.delayTime.value = time;
                this.delay.delayNode.wetNode.gain.value = wet;
                this.delay.delayNode.feedbackNode.gain.value = feedback;
            }
        }
        else {

            //Inform that there is no delay on the current wad
            logMessage("Sorry, but the wad does not contain delay!", 2);
        }

        return this;
    };


//////////////////////////////////////////////////////////////////////////////////////////
    Wad.prototype.pause = function(label){
        this.pauseTime = context.currentTime
        this.soundSource.onended = null
        this.stop(label)

    }
    Wad.prototype.unpause = function(arg){
        arg = arg || {}
        arg.unpause = true
        if ( this.pauseTime && (this.lastPlayedTime != null) ) {
            arg.offset = this.pauseTime - this.lastPlayedTime
        }
        else { 
            logMessage("You tried to unpause a wad that was not played and paused, so it just played normally instead.", 2)
        }
        this.play(arg)
    }

/** If multiple instances of a sound are playing simultaneously, stop() only can stop the most recent one **/
    Wad.prototype.stop = function(label){
        if ( !( this.source === 'mic' ) ) {
            if ( !(this.gain && this.gain.length) ){
                logMessage("You tried to stop a Wad that never played. ", 2)
                logMessage(this, 2)
                return // if the wad has never been played, there's no need to stop it
            }
            else if ( label ) {
                for ( var i = 0; i < this.gain.length; i++ ) {
                    if ( this.gain[i].label === label ) {
                        this.gain[i].gain.cancelScheduledValues(context.currentTime);
                        this.gain[i].gain.setValueAtTime(this.gain[i].gain.value, context.currentTime);
                        this.gain[i].gain.linearRampToValueAtTime(.0001, context.currentTime + this.env.release);


                    }
                }
            }
            else if ( !label ) {
                this.gain[0].gain.cancelScheduledValues(context.currentTime);
                this.gain[0].gain.setValueAtTime(this.gain[0].gain.value, context.currentTime);
                this.gain[0].gain.linearRampToValueAtTime(.0001, context.currentTime + this.env.release);
                try {
                    this.soundSource.stop(context.currentTime + this.env.release)
                }
                catch(e){
                    /*
                        Safari for iOS (and maybe other browsers)
                        can't seem to handle calling stop() on a soundSource that already had stop() scheduled.
                        The spec says it should be fine, and cancel previous calls to stop, 
                        but Safari is throwing an error -- InvalidStateError: The object is in an invalid state.
                        I'm not really sure why this is happening, but at least we can manually run the ended event handler.
                    */
                    logMessage(e,2)
                    var that = this
                    setTimeout(function(){
                        that.soundSource.dispatchEvent(new Event('ended'))
                        that.soundSource.onended = null
                    }, this.env.release * 1000)
                }
            }
        }
        else if (Wad.micConsent ) {
            this.mediaStreamSource.disconnect(0);
        }
        else { logMessage('You have not given your browser permission to use your microphone.')}
        if ( this.tremolo ) {
            this.tremolo.wad.stop()
        }
    };
////////////////////////////////////////////////////////////////////////////////////////////////////////////////



	Wad.Poly = Polywad


    Wad.SoundIterator = function(args){
        return new SoundIterator(args, Wad)
    }


    Wad.stopAll = function(label){
        for ( var i = 0; i < Wad.allWads.length; i++ ) {
            Wad.allWads[i].stop(label)
        }
    }
    Wad.setVolume = function(volume){
        for ( var i = 0; i < Wad.allWads.length; i++ ) {
            Wad.allWads[i].setVolume(volume)
        }
    }

/** If a Wad is created with reverb without specifying a URL for the impulse response,
grab it from the defaultImpulse URL **/
    Wad.defaultImpulse = 'https://www.codecur.io/audio/widehall.wav';

    // This method is deprecated.
    Wad.setGlobalReverb = function(arg){
        Wad.reverb                 = {};
        Wad.reverb.node            = context.createConvolver();
        Wad.reverb.gain            = context.createGain();
        Wad.reverb.gain.gain.value = arg.wet;
        var impulseURL             = arg.impulse || Wad.defaultImpulse;
        var request                = new XMLHttpRequest();
        request.open("GET", impulseURL, true);
        request.responseType = "arraybuffer";

        request.onload = function() {
            context.decodeAudioData(request.response, function (decodedBuffer){
                Wad.reverb.node.buffer = decodedBuffer;
            });
        };
        request.send();

    };
//////////////////////////////////////////////////////////////////////////////////////
//  Utility function to avoid javascript type conversion bug checking zero values   //


//////////////////////////////////////////////////////////////////////////////////////
/** This object is a mapping of note names to frequencies. **/
    Wad.pitches = {
        'A0'  : 27.5000,
        'A#0' : 29.1352,
        'Bb0' : 29.1352,
        'B0'  : 30.8677,
        'B#0' : 32.7032,
        'Cb1' : 30.8677,
        'C1'  : 32.7032,
        'C#1' : 34.6478,
        'Db1' : 34.6478,
        'D1'  : 36.7081,
        'D#1' : 38.8909,
        'Eb1' : 38.8909,
        'E1'  : 41.2034,
        'Fb1' : 41.2034,
        'E#1' : 43.6535,
        'F1'  : 43.6535,
        'F#1' : 46.2493,
        'Gb1' : 46.2493,
        'G1'  : 48.9994,
        'G#1' : 51.9131,
        'Ab1' : 51.9131,
        'A1'  : 55.0000,
        'A#1' : 58.2705,
        'Bb1' : 58.2705,
        'B1'  : 61.7354,
        'Cb2' : 61.7354,
        'B#1' : 65.4064,
        'C2'  : 65.4064,
        'C#2' : 69.2957,
        'Db2' : 69.2957,
        'D2'  : 73.4162,
        'D#2' : 77.7817,
        'Eb2' : 77.7817,
        'E2'  : 82.4069,
        'Fb2' : 82.4069,
        'E#2' : 87.3071,
        'F2'  : 87.3071,
        'F#2' : 92.4986,
        'Gb2' : 92.4986,
        'G2'  : 97.9989,
        'G#2' : 103.826,
        'Ab2' : 103.826,
        'A2'  : 110.000,
        'A#2' : 116.541,
        'Bb2' : 116.541,
        'B2'  : 123.471,
        'Cb3' : 123.471,
        'B#2' : 130.813,
        'C3'  : 130.813,
        'C#3' : 138.591,
        'Db3' : 138.591,
        'D3'  : 146.832,
        'D#3' : 155.563,
        'Eb3' : 155.563,
        'E3'  : 164.814,
        'Fb3' : 164.814,
        'E#3' : 174.614,
        'F3'  : 174.614,
        'F#3' : 184.997,
        'Gb3' : 184.997,
        'G3'  : 195.998,
        'G#3' : 207.652,
        'Ab3' : 207.652,
        'A3'  : 220.000,
        'A#3' : 233.082,
        'Bb3' : 233.082,
        'B3'  : 246.942,
        'Cb4' : 246.942,
        'B#3' : 261.626,
        'C4'  : 261.626,
        'C#4' : 277.183,
        'Db4' : 277.183,
        'D4'  : 293.665,
        'D#4' : 311.127,
        'Eb4' : 311.127,
        'E4'  : 329.628,
        'Fb4' : 329.628,
        'E#4' : 349.228,
        'F4'  : 349.228,
        'F#4' : 369.994,
        'Gb4' : 369.994,
        'G4'  : 391.995,
        'G#4' : 415.305,
        'Ab4' : 415.305,
        'A4'  : 440.000,
        'A#4' : 466.164,
        'Bb4' : 466.164,
        'B4'  : 493.883,
        'Cb5' : 493.883,
        'B#4' : 523.251,
        'C5'  : 523.251,
        'C#5' : 554.365,
        'Db5' : 554.365,
        'D5'  : 587.330,
        'D#5' : 622.254,
        'Eb5' : 622.254,
        'E5'  : 659.255,
        'Fb5' : 659.255,
        'E#5' : 698.456,
        'F5'  : 698.456,
        'F#5' : 739.989,
        'Gb5' : 739.989,
        'G5'  : 783.991,
        'G#5' : 830.609,
        'Ab5' : 830.609,
        'A5'  : 880.000,
        'A#5' : 932.328,
        'Bb5' : 932.328,
        'B5'  : 987.767,
        'Cb6' : 987.767,
        'B#5' : 1046.50,
        'C6'  : 1046.50,
        'C#6' : 1108.73,
        'Db6' : 1108.73,
        'D6'  : 1174.66,
        'D#6' : 1244.51,
        'Eb6' : 1244.51,
        'Fb6' : 1318.51,
        'E6'  : 1318.51,
        'E#6' : 1396.91,
        'F6'  : 1396.91,
        'F#6' : 1479.98,
        'Gb6' : 1479.98,
        'G6'  : 1567.98,
        'G#6' : 1661.22,
        'Ab6' : 1661.22,
        'A6'  : 1760.00,
        'A#6' : 1864.66,
        'Bb6' : 1864.66,
        'B6'  : 1975.53,
        'Cb7' : 1975.53,
        'B#6' : 2093.00,
        'C7'  : 2093.00,
        'C#7' : 2217.46,
        'Db7' : 2217.46,
        'D7'  : 2349.32,
        'D#7' : 2489.02,
        'Eb7' : 2489.02,
        'E7'  : 2637.02,
        'Fb7' : 2637.02,
        'E#7' : 2793.83,
        'F7'  : 2793.83,
        'F#7' : 2959.96,
        'Gb7' : 2959.96,
        'G7'  : 3135.96,
        'G#7' : 3322.44,
        'Ab7' : 3322.44,
        'A7'  : 3520.00,
        'A#7' : 3729.31,
        'Bb7' : 3729.31,
        'B7'  : 3951.07,
        'Cb8' : 3951.07,
        'B#7' : 4186.01,
        'C8'  : 4186.01
    };


    Wad.pitchesArray = [ // Just an array of note names. This can be useful for mapping MIDI data to notes.
        'C0',
        'C#0',
        'D0',
        'D#0',
        'E0',
        'F0',
        'F#0',
        'G0',
        'G#0',
        'A0',
        'A#0',
        'B0',
        'C1',
        'C#1',
        'D1',
        'D#1',
        'E1',
        'F1',
        'F#1',
        'G1',
        'G#1',
        'A1',
        'A#1',
        'B1',
        'C2',
        'C#2',
        'D2',
        'D#2',
        'E2',
        'F2',
        'F#2',
        'G2',
        'G#2',
        'A2',
        'A#2',
        'B2',
        'C3',
        'C#3',
        'D3',
        'D#3',
        'E3',
        'F3',
        'F#3',
        'G3',
        'G#3',
        'A3',
        'A#3',
        'B3',
        'C4',
        'C#4',
        'D4',
        'D#4',
        'E4',
        'F4',
        'F#4',
        'G4',
        'G#4',
        'A4',
        'A#4',
        'B4',
        'C5',
        'C#5',
        'D5',
        'D#5',
        'E5',
        'F5',
        'F#5',
        'G5',
        'G#5',
        'A5',
        'A#5',
        'B5',
        'C6',
        'C#6',
        'D6',
        'D#6',
        'E6',
        'F6',
        'F#6',
        'G6',
        'G#6',
        'A6',
        'A#6',
        'B6',
        'C7',
        'C#7',
        'D7',
        'D#7',
        'E7',
        'F7',
        'F#7',
        'G7',
        'G#7',
        'A7',
        'A#7',
        'B7',
        'C8'
    ];
//////////////////////////////////////////////////////////////
    Wad.assignMidiMap = function(midiMap, which, success, failure){
        var which = which || 0;
        navigator.requestMIDIAccess().then(function(){
            if ( Wad.midiInputs[which] ) {
                Wad.midiInputs[which].onmidimessage = midiMap;
                if  ( typeof success === 'function' ) { success() }
            }
            else if ( typeof failure === 'function' ) { failure() }

        })

    }
    Wad.midiInstrument = {
        play : function() { logMessage('playing midi')  },
        stop : function() { logMessage('stopping midi') }
    };
    Wad.midiInputs  = [];

    var midiMap = function(event){
        logMessage(event.receivedTime, event.data, 2);
        if ( event.data[0] === 144 ) { // 144 means the midi message has note data
            if ( event.data[2] === 0 ) { // noteOn velocity of 0 means this is actually a noteOff message
                logMessage("Playing note: ", 2)
                logMessage(Wad.pitchesArray[event.data[1]-12], 2);
                Wad.midiInstrument.stop(Wad.pitchesArray[event.data[1]-12]);
            }
            else if ( event.data[2] > 0 ) {
                logMessage("Stopping note: ", 2)
                logMessage(Wad.pitchesArray[event.data[1]-12], 2);
                Wad.midiInstrument.play({pitch : Wad.pitchesArray[event.data[1]-12], label : Wad.pitchesArray[event.data[1]-12], callback : function(that){
                }})
            }
        }
        else if ( event.data[0] === 176 ) { // 176 means the midi message has controller data
            logMessage('controller');
            if ( event.data[1] == 46 ) {
                if ( event.data[2] == 127 ) { Wad.midiInstrument.pedalMod = true; }
                else if ( event.data[2] == 0 ) { Wad.midiInstrument.pedalMod = false; }
            }
        }
        else if ( event.data[0] === 224 ) { // 224 means the midi message has pitch bend data
            logMessage('pitch bend');
        }
    };


    var onSuccessCallback = function(midiAccess){

        Wad.midiInputs = []
        var val = midiAccess.inputs.values();
        for ( var o = val.next(); !o.done; o = val.next() ) {
            Wad.midiInputs.push(o.value)
        }
        // Wad.midiInputs = [m.inputs.values().next().value];   // inputs = array of MIDIPorts
        logMessage('MIDI inputs: ')
        logMessage(Wad.midiInputs)
        // var outputs = m.outputs(); // outputs = array of MIDIPorts
        for ( var i = 0; i < Wad.midiInputs.length; i++ ) {
            Wad.midiInputs[i].onmidimessage = midiMap; // onmidimessage( event ), event.data & event.receivedTime are populated
        }
        // var o = m.outputs()[0];           // grab first output device
        // o.send( [ 0x90, 0x45, 0x7f ] );     // full velocity note on A4 on channel zero
        // o.send( [ 0x80, 0x45, 0x7f ], window.performance.now() + 1000 );  // full velocity A4 note off in one second.
    };
    var onErrorCallback = function(err){
        logMessage("Failed to get MIDI access", err);
    };

    if ( navigator && navigator.requestMIDIAccess ) {
        try {
            navigator.requestMIDIAccess().then(onSuccessCallback, onErrorCallback);
        }
        catch(err) {
            logMessage("Failed to get MIDI access", err);
        }
    }


    Wad.presets = {
        hiHatClosed : { source : 'noise', env : { attack : .001, decay : .008, sustain : .2, hold : .03, release : .01}, filter : { type : 'highpass', frequency : 400, q : 1 } },
        snare : { source : 'noise', env : {attack : .001, decay : .01, sustain : .2, hold : .03, release : .02}, filter : {type : 'bandpass', frequency : 300, q : .180 } },
        hiHatOpen : { source : 'noise', env : { attack : .001, decay : .008, sustain : .2, hold : .43, release : .01}, filter : { type : 'highpass', frequency : 100, q : .2 } },
        ghost : { source : 'square', volume : .3, env : { attack : .01, decay : .002, sustain : .5, hold : 2.5, release : .3 }, filter : { type : 'lowpass', frequency : 600, q : 7, env : { attack : .7, frequency : 1600 } }, vibrato : { attack : 8, speed : 8, magnitude : 100 } },
        piano : { source : 'square', volume : 1.4, env : { attack : .01, decay : .005, sustain : .2, hold : .015, release : .3 }, filter : { type : 'lowpass', frequency : 1200, q : 8.5, env : { attack : .2, frequency : 600 } } }
    };

    Wad.logs = logStuff

    return Wad;


})()

if(typeof module !== 'undefined' && module.exports) {
    module.exports = Wad;
}

export default Wad;

