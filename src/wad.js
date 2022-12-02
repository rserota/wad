import Tuna from 'tunajs';
import AudioListener from './audio_listener';
import {
	logMessage,
	context,
	noiseBuffer,
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
import _ from 'lodash';




class Wad {

	/**
	 * @param {string} [label] - Stop all currently playing wads, or all currently playing wads with a given label.
	 */
	static stopAll(label){
		for ( var i = 0; i < Wad.allWads.length; i++ ) {
			Wad.allWads[i].stop(label);
		}
	}

	/**
	 * @param {number} volume - New volume setting for all wads.
	 */
	static setVolume(volume){
		for ( var i = 0; i < Wad.allWads.length; i++ ) {
			Wad.allWads[i].setVolume(volume);
		}
	}

	/**
	 * @typedef {object} DelayConfig
	 * @property {number} [delayTime] - Time in seconds between each delayed playback.
	 * @property {number} [wet] - Relative volume change between the original sound and the first delayed playback.
	 * @property {number} [feedback] - Relative volume change between each delayed playback and the next.
	 */

	/**
	 * @typedef {object} Envelope 
	 * @property {number} [attack] - Time in seconds from onset to peak volume. Common values for oscillators may range from 0.05 to 0.3.
	 * @property {number} [decay] - Time in seconds from peak volume to sustain volume.
	 * @property {number} [sustain] - Sustain volume level. This is a percent of the peak volume, so sensible values are between 0 and 1.
	 * @property {number} [hold] - Time in seconds to maintain the sustain volume level. If set to -1, the sound will be sustained indefinitely until you manually call stop().
	 * @property {number} [release] - Time in seconds from the end of the hold period to zero volume, or from calling stop() to zero volume.
	 */

	/**
	 * @typedef {object} FilterConfig
	 * @property {'lowpass'|'highpass'|'bandpass'|'lowshelf'|'highshelf'|'peaking'|'notch'|'allpass'} [type] - Default is 'lowpass'
	 * @property {number} [frequency] - The frequency, in hertz, to which the filter is applied.
	 * @property {number} [q] - Q-factor. No one knows what this does. The default value is 1. Sensible values are from 0 to 10.
	 * @property {FilterEnvConfig} [env] - The filter envelope.
	 */

	/**
	 * @typedef {object} FilterEnvConfig
	 * @property {number} [frequency] - If this is set, filter frequency will slide from filter.frequency to filter.env.frequency when a note is triggered.
	 * @property {number} [attack] - Time in seconds for the filter frequency to slide from filter.frequency to filter.env.frequency.
	 */

	/**
	 * @typedef {object} VibratoConfig
	 * @property {'sine'|'sawtooth'|'square'|'triangle'} [shape] - Shape of the lfo waveform. 
	 * @property {number} [magnitude] - How much the pitch changes. Sensible values are from 1 to 10.
	 * @property {number} [speed] - How quickly the pitch changes, in cycles per second. Sensible values are from 0.1 to 10.
	 * @property {number} [attack] - Time in seconds for the vibrato effect to reach peak magnitude.
	 */

	/**
	 * @typedef {object} TremoloConfig
	 * @property {'sine'|'sawtooth'|'square'|'triangle'} [shape] - Shape of the lfo waveform. 
	 * @property {number} [magnitude] - How much the volume changes. Sensible values are from 1 to 10.
	 * @property {number} [speed] - How quickly the volume changes, in cycles per second. Sensible values are from 0.1 to 10.
	 * @property {number} [attack] - Time in seconds for the tremolo effect to reach peak magnitude.
	 */

	/**
	 * @typedef {object} ReverbConfig
	 * @property {number} [wet] - The volume of the reverberations.
	 * @property {string} [impulse] - A URL for an impulse response file.
	 */

	/**
	 * @typedef {object} WadConfig
	 * @property {'sine'|'square'|'sawtooth'|'triangle'|'noise'} source - sine, square, sawtooth, triangle, or noise
	 * @property {number} [volume] - From 0 to 1
	 * @property {string|number} [pitch] - Set a default pitch on the constructor if you don't want to set the pitch on play(). Pass in a string like 'c#3' to play a specific pitch, or pass in a number to play that frequency, in hertz.
	 * @property {number} [detune] - Detune is measured in cents. 100 cents is equal to 1 semitone.
	 * @property {Envelope} [env]- A set of parameters that describes how a sound's volume changes over time.
	 * @property {object} [destination] - The last node the sound is routed to.
	 * @property {number} [offset] - Where in the audio clip playback begins, measured in seconds from the start of the audio clip.
	 * @property {boolean} [loop] - If true, the audio will loop. This parameter only works for audio clips, and does nothing for oscillators.
	 * @property {object} [tuna] - Add effects from Tuna.js to this wad. Check out the Tuna.js documentation for more information.
	 * @property {number} [rate] - Where in the audio clip playback begins, measured in seconds from the start of the audio clip.
	 * @property {object} [sprite] - Each key is the name of a sprite. The value is a two-element array, containing the start and end time of that sprite, in seconds. 
	 * @property {FilterConfig|FilterConfig[]} [filter] - Pass an object to add a filter to this wad, or pass an array of objects to add multiple filters to this wad.
	 * @property {VibratoConfig} [vibrato] - A vibrating pitch effect. Only works for oscillators.
	 * @property {TremoloConfig} [tremolo] - A vibrating volume effect.
	 * @property {number|array} [panning] - Placement of the sound source. Pass in a number to use stereo panning, or pass in a 3-element array to use 3D panning. Note that some browsers do not support stereo panning.
	 * @property {'equalpower'|'HRTF'} [panningModel] - Defaults to 'equalpower'
	 * @property {string} [rolloffFactor]
	 * @property {ReverbConfig} [reverb] - Add reverb to this wad.
	 * @property {DelayConfig} [delay] - Add delay to this wad.
	 * @property {boolean} [useCache] - If false, the audio will be requested from the source URL without checking the audioCache.
	 * 
	 */

	/**
	 * @param {WadConfig} arg - One big object.
	 */
	constructor(arg){
		/** Set basic Wad properties **/
		this.source        = arg.source;
		this.useCache      = _.get(arg, 'useCache', true);
		this.destination   = arg.destination || context.destination; // the last node the sound is routed to
		this.volume        = _.get(arg, 'volume', 1); // peak volume. min:0, max:1 (actually max is infinite, but ...just keep it at or below 1)
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

		this.env = constructEnv(arg);
		this.defaultEnv = constructEnv(arg);
		this.userSetHold = !!(arg.env && arg.env.hold); //_
		this.filter = constructFilter(arg);
		this.vibrato = constructVibrato(arg);
		this.tremolo = constructTremolo(arg);
		this.panning = constructPanning(arg);
		this.delay = constructDelay(arg);
		this.reverb = constructReverb(this, arg); // has side-effects
		this.duration = (this.env.attack + this.env.decay + this.env.hold + this.env.release) * (1/(this.rate)) * 1000;
		this.constructExternalFx(arg, context);

		/** If the Wad's source is noise, set the Wad's buffer to the noise buffer we created earlier. **/
		if ( this.source === 'noise' ) {
			this.decodedBuffer = noiseBuffer;
		}

		/** If the Wad's source is the microphone, the rest of the setup happens here. **/
		else if ( this.source === 'mic' ) {
			getConsent(this, arg);
		}

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
		else { arg.callback && arg.callback(this); }

		Wad.allWads.push(this);
	}
	

	/** the play() method will create the various nodes that are required for this Wad to play,
	set properties on those nodes according to the constructor arguments and play() arguments,
	plug the nodes into each other with plugEmIn(),
	then finally play the sound by calling playEnv() **/
	
	/**
	 * @typedef {object} PlayArgs
	 * @property {number} [volume] - This overrides the value for volume passed to the constructor, if it was set.
	 * @property {number} [wait] - Time in seconds between calling play() and actually triggering the note.
	 * @property {boolean} [loop] - This overrides the value for loop passed to the constructor, if it was set.
	 * @property {number} [offset] - This overrides the value for offset passed to the constructor, if it was set.
	 * @property {number} [rate] - This overrides the value for rate passed to the constructor, if it was set.
	 * @property {string|number} [pitch] - This overrides the value for pitch passed to the constructor, if it was set.
	 * @property {string} [label] - A label that identifies this note. 
	 * @property {Envelope} [env] - This overrides the values for the envelope passed to the constructor, if it was set.
	 * @property {number|array} [panning] - This overrides the value for panning passed to the constructor. 
	 * @property {FilterConfig|FilterConfig[]} [filter] - This overrides the values for filters passed to the constructor.
	 * @property {DelayConfig} [delay] - This overrides the values for delay passed to the constructor, if it was set.
	 */

	/**
	 * @param {PlayArgs} [arg]
	 * @returns {promise} 
	 */
	play(arg){
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
					this.filter = constructFilter(arg);
					this.vibrato = constructVibrato(arg);
					this.tremolo = constructTremolo(arg);
					this.reverb = constructReverb(arg);
					this.panning = constructPanning(arg);
					this.delay = constructDelay(arg);
					this.constructExternalFx(arg, context);
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

			if ( this.soundSource.playbackRate ) {
				this.soundSource.playbackRate.value = arg.rate || this.rate;
				this.env.hold = this.env.hold * (1/this.soundSource.playbackRate.value);
			}

			/**  sets up the filter and filter envelope based on the play() argument if present,
	or defaults to the constructor argument if the filter and filter envelope are not set on play() **/
			setUpFilterOnPlay(this, arg);
			setUpTunaOnPlay(this, arg);

			this.setUpExternalFxOnPlay(arg, context);

			this.gain.unshift(context.createGain()); // sets up the gain node
			this.gain[0].label = arg.label;
			this.gain[0].soundSource = this.soundSource;
			this.nodes.push(this.gain[0]);

			if ( this.gain.length > 15 ) {
				this.gain.length = 15;
			}

			if ( this.reverb ) { setUpReverbOnPlay(this, arg); }

			/**  sets panning based on the play() argument if present, or defaults to the constructor argument if panning is not set on play **/
			setUpPanningOnPlay(this, arg);

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

	}



	/** Change the volume of a wad at any time, including during playback **/
	/**
	 * @param {number} volume - New volume setting.
	 * @param {number} [timeConstant] - Time in seconds for 63% of the transition to complete.
	 * @param {string} [label] - If you want to apply this change to a note playing from this wad that is not the most recently triggered note, you can pass in the label of the notes you want to stop.
	 * @returns {Wad} 
	 */
	setVolume(volume, timeConstant, label){
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
	}

	reverse(){
		if ( this.decodedBuffer ) {
			Array.prototype.reverse.call( this.decodedBuffer.getChannelData(0) );
			Array.prototype.reverse.call( this.decodedBuffer.getChannelData(1) );
		}
		else {
			logMessage('You tried to reverse something that isn\'t reversible');
		}
	}

		
	/**
	Change the playback rate of a Wad during playback.
	inputSpeed is a value of 0 < speed, and is the rate of playback of the audio.
	E.g. if input speed = 2.0, the playback will be twice as fast
	**/

	/**
	 * @param {number} inputSpeed - The new rate setting.
	 * @returns {Wad}
	 */
	setRate(inputSpeed) {

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
	}

	/**
	 * @param {string|number} pitch - The new pitch setting. 
	 * @param {number} [timeConstant] - Time in seconds for 63% of the transition to complete.
	 * @param {string} [label] - If you want to apply this change to a note playing from this wad that is not the most recently triggered note, you can pass in the label of the notes you want to affect.
	 * @returns {Wad} 
	 */
	setPitch(pitch, timeConstant, label){
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
	}

	/**
	 * @param {number} detune - The new detune setting
	 * @param {number} [timeConstant] - Time in seconds for 63% of the transition to complete.
	 * @param {string} [label] - If you want to apply this change to a note playing from this wad that is not the most recently triggered note, you can pass in the label of the notes you want to affect.
	 * @returns {Wad} 
	 */
	setDetune(detune, timeConstant, label){
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
	}

	/** Change the panning of a Wad at any time, including during playback **/
	/**
	 * @param {number|array} panning - The new panning setting.
	 * @param {number} [timeConstant] - Time in seconds for 63% of the transition to complete.
	 * @returns {Wad}
	 */
	setPanning(panning, timeConstant){
		timeConstant = timeConstant || .01;
		if ( typeof panning === 'number' && !context.createStereoPanner ) {
			panning = [panning, 0, 0];
		}

		this.panning.location = panning;
		if ( _.isArray(panning) && this.panning.type === '3d' && this.panning.node ) {
			this.panning.node.setPosition(panning[0], panning[1], panning[2]);

		}
		else if ( typeof panning === 'number' && this.panning.type === 'stereo' && this.panning.node) {
			this.panning.node.pan.setTargetAtTime(panning, context.currentTime, timeConstant);
		}

		if ( _.isArray(panning) ) { this.panning.type = '3d'; }
		else if ( typeof panning === 'number' ) { this.panning.type = 'stereo'; }
		return this;
	}

	/**
	Change the Reverb of a Wad at any time, including during playback.
	inputWet is a value of 0 < wetness/gain < 1
	**/
	/**
	 * @param {number} inputWet - The new wet setting for the reverb.
	 * @returns {Wad} 
	 */
	setReverb(inputWet) {

		//Check/Save the input

		var wet;
		if(inputWet && inputWet > 0 && inputWet < 1) wet = inputWet;
		else if(inputWet >= 1) wet = 1;
		else wet = 0;

		//Check if we have reverb
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
	}


	/**
	Change the Delay of a Wad at any time, including during playback.
	inputTime is a value of time > 0, and is the time in seconds between each delayed playback.
	inputWet is a value of gain 0 < inputWet < 1, and is Relative volume change between the original sound and the first delayed playback.
	inputFeedback is a value of gain 0 < inputFeedback < 1, and is Relative volume change between each delayed playback and the next.
	**/
	/**
	 * @param {number} delayTime - The new delayTime setting.
	 * @param {number} wet - The new wet setting.
	 * @param {number} feedback - The new feedback setting. 
	 * @returns {Wad} 
	 */
	setDelay(inputTime, inputWet, inputFeedback){

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
	}


	/**
	 * @param {string} [label] - If you want to pause a note playing from this wad that is not the most recently triggered note, you can pass in the label of the notes you want to pause.
	 */
	pause(label){
		this.pauseTime = context.currentTime;
		this.soundSource.onended = null;
		this.stop(label);

	}

	/**
	 * @param {PlayArgs} [args] - The same args as play()
	 */
	unpause(arg){
		arg = arg || {};
		arg.unpause = true;
		if ( this.pauseTime && (this.lastPlayedTime != null) ) {
			arg.offset = this.pauseTime - this.lastPlayedTime;
		}
		else { 
			logMessage('You tried to unpause a wad that was not played and paused, so it just played normally instead.', 2);
		}
		this.play(arg);
	}

	/** If multiple instances of a sound are playing simultaneously, stop() only can stop the most recent one **/

	/**
	 * @param {string} [label] - If you want to stop a note playing from this wad that is not the most recently triggered note, you can pass in the label of the notes you want to stop.
	 */
	stop(label){
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
	}


	/** Method to allow users to setup external fx in the constructor **/
	constructExternalFx(arg, context){
		//override me in your own code
	}

	/** To be overrided by the user **/
	setUpExternalFxOnPlay(arg, context){
		//user does what is necessary here, and then maybe does something like:
		// this.nodes.push(externalFX)
	}

}

/*
 * Due to the structure of the project (the PolyWad class is a static method of the Wad class),
 * The typedefs for PolyWad appear here, instead of in polywad.js. 
 */

Wad.Poly = class{

	/**
	 * @typedef {object} CompressorConfig
	 * @property {number} [attack] - The amount of time, in seconds, to reduce the gain by 10dB. This parameter ranges from 0 to 1.
	 * @property {number} [knee] - A decibel value representing the range above the threshold where the curve smoothly transitions to the "ratio" portion. This parameter ranges from 0 to 40.
	 * @property {number} [ratio] - The amount of dB change in input for a 1 dB change in output. This parameter ranges from 1 to 20.
	 * @property {number} [release] - The amount of time (in seconds) to increase the gain by 10dB. This parameter ranges from 0 to 1.
	 * @property {number} [threshold] - The decibel value above which the compression will start taking effect. This parameter ranges from -100 to 0.
	 */

	/**
	 * @typedef {object} AudioMeterConfig
	 * @property {number} [clipLevel] - the level (0 to 1) that you would consider "clipping".
	 * @property {number} [averaging] - how "smoothed" you would like the meter to be over time. Should be between 0 and less than 1.
	 * @property {number} [clipLag] - how long you would like the "clipping" indicator to show after clipping has occured, in milliseconds.
	 */

	/**
	 * @typedef {object} RecorderConfig
	 * @property {object} options - The options passed to the MediaRecorder constructor.
	 * @property {function} onstop - The callback used to handle the onstop event from the MediaRecorder.
	 */

	/**
	 * @typedef {object} PolyWadConfig
	 * @property {number} [volume] - From 0 to 1
	 * @property {number|array} [panning] - The default panning for this polywad.
	 * @property {FilterConfig|FilterConfig[]} [filter] - Filter(s) applied to this polywad.
	 * @property {DelayConfig} [delay] - Delay applied to this polywad.
	 * @property {ReverbConfig} [reverb] - Reverb applied to this polywad.
	 * @property {object} [destination]
	 * @property {object} [tuna] - Tuna effects applied to this polywad. Check out the tuna docs for more info. 
	 * @property {AudioMeterConfig} [audioMeter] - Add a volume meter to this polywad that tells you if it's clipping.
	 * @property {CompressorConfig} [compressor] - Add a compressor to this polywad.
	 * @property {RecorderConfig} [recorder] - Record the output of this polywad to a buffer or a file.
	 */

	/**
	 * @param {PolyWadConfig} arg 
	 */
	constructor(arg){}

	/**
	 * @param {Wad} wad - The wad or polywad to add.
	 */
	add(wad){}

	/**
	 * @param {Wad} wad - The wad or polywad to remove.
	 */
	remove(wad){}

	/**
	 * @param {PlayArgs} [arg] - Same arguments as Wad.prototype.play()
	 */
	play(arg){}

	/**
	 * @param {string} [label] - If you want to stop a note that is not the most recently played one, pass in a label to stop only those notes.
	 */
	stop(label){}

	/**
	 * @param {number} volume - The new volume setting.
	 */
	setVolume(volume){}

	/**
	 * @param {string|number} pitch - The new pitch setting.
	 */
	setPitch(pitch){}

	/**
	 * @param {string|number} panning - The new panning setting. 
	 */
	setPanning(panning){}
};

/**
 * @type {Wad[]}
 */
Wad.allWads = [];

/**
 * @type {object}
 */
Wad.audioContext = context;
Wad.listener = new AudioListener(context);
if ( typeof Tuna != undefined ) {
	Wad.tuna = new Tuna(Wad.audioContext);
}










export default Wad;
