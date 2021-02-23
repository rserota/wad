import Tuna from 'tunajs';
import AudioListener from './audio_listener';
import {
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
	permissionsGranted,
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
} from './common';

let Wad = function(arg){
	/** Set basic Wad properties **/
	this.source        = arg.source;
	this.destination   = arg.destination || context.destination; // the last node the sound is routed to
	this.volume        = valueOrDefault(arg.volume, 1); // peak volume. min:0, max:1 (actually max is infinite, but ...just keep it at or below 1)
	this.defaultVolume = this.volume;
	this.playable      = 1; // if this is less than 1, this Wad is still waiting for a file to download before it can play
	this.pitch         = Wad.pitches[arg.pitch] || arg.pitch || 440;
	this.gain          = [];
	this.detune        = arg.detune || 0; // In Cents.
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
	this.duration = (this.env.attack + this.env.decay + this.env.hold + this.env.release) * (1/(this.rate)) * 1000;
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
						arg = arg || {};
						arg.env = arg.env || {};
						arg.env.hold = this.sprite[1] - this.sprite[0];
						arg.offset = this.sprite[0];

						return thatWad.play(arg);
					}
				};
			}
		}
	}
	////////////////////////////////////////////////////////////////////////////////////////////////////////
	else { arg.callback && arg.callback(this); }
	Wad.allWads.push(this);
};
Wad.allWads = [];
Wad.audioContext = context;
Wad.listener = new AudioListener(context);
if ( typeof Tuna != undefined ) {
	Wad.tuna = new Tuna(Wad.audioContext);
}

/** Method to allow users to setup external fx in the constructor **/
Wad.prototype.constructExternalFx = function(arg, context){
	//override me in your own code
};


/** To be overrided by the user **/
Wad.prototype.setUpExternalFxOnPlay = function(arg, context){
	//user does what is necessary here, and then maybe does something like:
	// this.nodes.push(externalFX)
};


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
		if ( permissionsGranted.micConsent ) {
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
			logMessage('You have not given your browser permission to use your microphone.');
			getConsent(this, arg).then(() =>{
				this.play(arg);
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
		this.lastPlayedTime = arg.exactTime - arg.offset;

		this.nodes.push(this.soundSource);


		/**  sets the volume envelope based on the play() arguments if present,
or defaults to the constructor arguments if the volume envelope is not set on play() **/
		setUpEnvOnPlay(this, arg);
		////////////////////////////////////////////////////////////////////////////////////////

		if ( this.soundSource.playbackRate ) {
			this.soundSource.playbackRate.value = arg.rate || this.rate;
			this.env.hold = this.env.hold * (1/this.soundSource.playbackRate.value);
		}

		/**  sets up the filter and filter envelope based on the play() argument if present,
or defaults to the constructor argument if the filter and filter envelope are not set on play() **/
		setUpFilterOnPlay(this, arg);
		///////////////////////////////////////////////////////////////////////////////////////////////////
		setUpTunaOnPlay(this, arg);

		this.setUpExternalFxOnPlay(arg, context);


		this.gain.unshift(context.createGain()); // sets up the gain node
		this.gain[0].label = arg.label;
		this.gain[0].soundSource = this.soundSource;
		this.nodes.push(this.gain[0]);

		if ( this.gain.length > 15 ) {
			this.gain.length = 15;
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
		if ( this.vibrato ) { setUpVibratoOnPlay(this, arg, Wad); }

		//sets up tremolo LFO
		if ( this.tremolo ) { setUpTremoloOnPlay(this, arg, Wad); }

		var thatWad = this;

		this.soundSource.onended = function(event){
			thatWad.playPromiseResolve(thatWad);
		};

		if ( !arg.unpause ) {
			this.playPromise = new Promise(function(resolve, reject){
				thatWad.playPromiseResolve = resolve;
			});
			return this.playPromise;
		}
	}

	if ( arg.callback ) { arg.callback(this); }

};

//////////////////////////////////////////////////////////////////////////////////////////


/** Change the volume of a wad at any time, including during playback **/
Wad.prototype.setVolume = function(volume, timeConstant, label){
	timeConstant = timeConstant || .01;
	if ( label ) {
		if ( this.gain.length > 0 ) {
			for ( let i = 0; i < this.gain.length; i++ ) {
				if ( this.gain[i].label === label ) {
					this.gain[i].gain.setValueAtTime(volume, context.currentTime);
				}
			}
		}
	}
	else {
		this.defaultVolume = volume;
		if ( this.gain.length > 0 ) { this.gain[0].gain.setValueAtTime(volume, context.currentTime); }
	}
	return this;
};

Wad.prototype.reverse = function(){
	if ( this.decodedBuffer ) {
		Array.prototype.reverse.call( this.decodedBuffer.getChannelData(0) );
		Array.prototype.reverse.call( this.decodedBuffer.getChannelData(1) );
	}
	else {
		logMessage("You tried to reverse something that isn't reversible")
	}
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
		logMessage('Sorry, but the wad does not contain a soundSource!');
	}

	return this;
};

Wad.prototype.setPitch = function(pitch, timeConstant, label){
	timeConstant = timeConstant || .01;
	if ( label ) {
		for ( let i = 0; i < this.gain.length; i++ ) {
			if ( this.gain[i].label === label ) {
				if ( pitch in Wad.pitches ) {
					this.gain[i].soundSource.frequency.setTargetAtTime(Wad.pitches[pitch], context.currentTime, timeConstant);
				}
				else {
					this.soundSource.frequency.settargetAtTime(pitch, context.currentTime, timeConstant);
				}
			}
		}
	}
	else {
		if ( pitch in Wad.pitches ) {
			if ( this.soundSource ) {
				this.soundSource.frequency.value = Wad.pitches[pitch];
			}
			this.pitch = Wad.pitches[pitch];
		}
		else {
			if ( this.soundSource ) {
				this.soundSource.frequency.value = pitch;
			}
			this.pitch = pitch;
		}
	}
	return this;
};

Wad.prototype.setDetune = function(detune, timeConstant, label){
	timeConstant = timeConstant || .01;
	if ( label ) {
		for ( let i = 0; i < this.gain.length; i++ ) {
			if ( this.gain[i].label === label ) {
				this.gain[i].soundSource.detune.setTargetAtTime(detune, context.currentTime, timeConstant);
			}
		}
	}
	else {
		this.soundSource.detune.setTargetAtTime(detune, context.currentTime, timeConstant);
	}
	return this;
};

/** Change the panning of a Wad at any time, including during playback **/
Wad.prototype.setPanning = function(panning, timeConstant, label){
	timeConstant = timeConstant || .01;
	if ( typeof panning === 'number' && !context.createStereoPanner ) {
		panning = [panning, 0, 0];
	}

	this.panning.location = panning;
	if ( isArray(panning) && this.panning.type === '3d' && this.panning.node ) {
		this.panning.node.setPosition(panning[0], panning[1], panning[2]);

	}
	else if ( typeof panning === 'number' && this.panning.type === 'stereo' && this.panning.node) {
		this.panning.node.pan.setTargetAtTime(panning, context.currentTime, timeConstant);
	}

	if ( isArray(panning) ) { this.panning.type = '3d'; }
	else if ( typeof panning === 'number' ) { this.panning.type = 'stereo'; }
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
		logMessage('Sorry, but the wad does not contain Reverb!');
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
		logMessage('Sorry, but the wad does not contain delay!', 2);
	}

	return this;
};


Wad.prototype.pause = function(label){
	this.pauseTime = context.currentTime;
	this.soundSource.onended = null;
	this.stop(label);

};
Wad.prototype.unpause = function(arg){
	arg = arg || {};
	arg.unpause = true;
	if ( this.pauseTime && (this.lastPlayedTime != null) ) {
		arg.offset = this.pauseTime - this.lastPlayedTime;
	}
	else { 
		logMessage('You tried to unpause a wad that was not played and paused, so it just played normally instead.', 2);
	}
	this.play(arg);
};

/** If multiple instances of a sound are playing simultaneously, stop() only can stop the most recent one **/
Wad.prototype.stop = function(label){
	if ( !( this.source === 'mic' ) ) {
		if ( !(this.gain && this.gain.length) ){
			logMessage('You tried to stop a Wad that never played. ', 2);
			logMessage(this, 2);
			return; // if the wad has never been played, there's no need to stop it
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
				this.soundSource.stop(context.currentTime + this.env.release);
			}
			catch(e){
				/*
					Safari for iOS (and maybe other browsers)
					can't seem to handle calling stop() on a soundSource that already had stop() scheduled.
					The spec says it should be fine, and cancel previous calls to stop, 
					but Safari is throwing an error -- InvalidStateError: The object is in an invalid state.
					I'm not really sure why this is happening, but at least we can manually run the ended event handler.
				*/
				logMessage(e,2);
				var that = this;
				setTimeout(function(){
					that.soundSource.dispatchEvent(new Event('ended'));
					that.soundSource.onended = null;
				}, this.env.release * 1000);
			}
		}
	}
	else if (permissionsGranted.micConsent ) {
		this.mediaStreamSource.disconnect(0);
	}
	else { logMessage('You have not given your browser permission to use your microphone.');}
	if ( this.tremolo ) {
		this.tremolo.wad.stop();
	}
};

Wad.stopAll = function(label){
	for ( var i = 0; i < Wad.allWads.length; i++ ) {
		Wad.allWads[i].stop(label);
	}
};
Wad.setVolume = function(volume){
	for ( var i = 0; i < Wad.allWads.length; i++ ) {
		Wad.allWads[i].setVolume(volume);
	}
};

export default Wad;
