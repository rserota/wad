import Tuna from 'tunajs';
import Polywad from './polywad';
import { pitches } from './pitches';
import _ from 'lodash';


let audioContext = window.AudioContext || window.webkitAudioContext;

/* keys are URLs for audio files. values are promises that resolve to the decoded audio */
let audioCache = {};

let logStats = {
	verbosity: 0,
	suppressedLogs: 0
};

let logMessage = function(message, logLevel){
	logLevel = logLevel || 1;
	if ( logStats.verbosity >= logLevel ) {
		console.log(message);
	} 
	else { logStats.suppressedLogs++; }
};
    
let aScene = document.querySelector('a-scene');
let context;
if ( aScene && aScene.audioListener && aScene.audioListener.context){
	context = aScene.audioListener.context;
	logMessage('An A-Frame scene has been detected.');
}
else {
	context = new audioContext();
}

let unlock = function(){
	logMessage('unlock', 2);
	if ( context.state === 'suspended' ) {
		logMessage('suspended', 2);
		context.resume();
	}
	else if ( context.state === 'running' ) {
		logMessage('The audio context is running.', 2);
		logMessage(context, 2);
		window.removeEventListener('click', unlock);
		window.removeEventListener('touchstart', unlock);
		window.removeEventListener('touchend', unlock);
	}
};
window.addEventListener('click', unlock);
window.addEventListener('touchstart', unlock);
window.addEventListener('touchend', unlock);
// create a wrapper for old versions of `getUserMedia`
let getUserMedia = (function(window) {
	if (window.navigator.mediaDevices && window.navigator.mediaDevices.getUserMedia) {
		// Browser supports promise based `getUserMedia`
		return window.navigator.mediaDevices.getUserMedia.bind(window.navigator.mediaDevices);
	}
	let navigatorGetUserMedia = window.navigator.getUserMedia || window.navigator.webkitGetUserMedia || window.navigator.mozGetUserMedia;
	if (navigatorGetUserMedia) {
		// Browser supports old `getUserMedia` with callbacks.
		return function(constraints) {
			return new Promise(function(resolve, reject) {
				navigatorGetUserMedia.call(window.navigator, constraints, resolve, reject);
			});
		};
	}
    
	return function() {
		if ( window.location.hostname !== 'localhost' && window.location.protocol === 'http:' ) {
			throw "The user's microphone can only be accessed via HTTPS or localhost. This page seems to be running on plain HTTP."
		}
		throw 'getUserMedia is unsupported. ';
	};
}(window));
    
if (getUserMedia) { logMessage('Your browser supports getUserMedia.'); }
else { logMessage('Your browser does not support getUserMedia.'); }


/** Pre-render a noise buffer instead of generating noise on the fly. **/
let noiseBuffer = (function(){
	// the initial seed
	Math.seed = 6;
	Math.seededRandom = function(max, min){
		max = max || 1;
		min = min || 0;
		Math.seed = ( Math.seed * 9301 + 49297 ) % 233280;
		var rnd = Math.seed / 233280;

		return min + rnd * (max - min);
	};
	var bufferSize = 2 * context.sampleRate;
	var noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
	var output = noiseBuffer.getChannelData(0);
	for ( var i = 0; i < bufferSize; i++ ) {
		output[i] = Math.seededRandom() * 2 - 1;
	}
	return noiseBuffer;
})();


/** Set up the default ADSR envelope. **/
let constructEnv = function(arg){
	return { //default envelope, if one is not specified on play
		attack   : _.get(arg, 'env.attack', 0),    // time in seconds from onset to peak volume
		decay    : _.get(arg, 'env.decay', 0),    // time in seconds from peak volume to sustain volume
		sustain  : _.get(arg, 'env.sustain', 1),    // sustain volume level, as a percentage of the max
		hold     : _.get(arg, 'env.hold', 3.14159),    // time in seconds to maintain sustain volume
		release  : _.get(arg, 'env.release', 0),    // time in seconds from release to zero volume
	};
};


/** Set up the default filter and filter envelope. **/
let constructFilter = function(arg){

	if ( !arg.filter ) { return null; }

	else if ( _.isArray(arg.filter) ) {
		return arg.filter.map(function(filterArg){
			return {
				type : filterArg.type || 'lowpass',
				frequency : filterArg.frequency || 600,
				q : filterArg.q || 1,
				env : filterArg.env || null,
			};
		});
	}
	else {
		return [{
			type : arg.filter.type || 'lowpass',
			frequency : arg.filter.frequency || 600,
			q : arg.filter.q || 1,
			env : arg.filter.env ||null,
		}];
	}
};


/** If the Wad uses an audio file as the source, request it from the server, 
or use a cached copy if available.
Don't let the Wad play until all necessary files have been downloaded. **/
let requestAudioFile = function(that, callback){
	that.playable--;
	let decodedBufferPromise;
	if ( !that.useCache || !audioCache[that.source] ) {
		decodedBufferPromise = fetch(that.source).then((response)=>{
			return response.arrayBuffer()
		}).then((response)=>{
			return context.decodeAudioData(response)
		})
		if ( that.useCache ) {
			audioCache[that.source] = decodedBufferPromise
		}
	}
	else {
		decodedBufferPromise = audioCache[that.source]
	}

	decodedBufferPromise.then((decodedBuffer)=>{
		that.decodedBuffer = decodedBuffer;
		if ( that.env.hold === 3.14159 ) { // audio buffers should not use the default hold
			that.defaultEnv.hold = that.decodedBuffer.duration * ( 1 / that.rate );
			that.env.hold = that.decodedBuffer.duration * ( 1 / that.rate );
		}
		that.duration = that.env.hold * 1000;

		if ( callback ) { callback(that); }
		that.playable++;
		if ( that.playOnLoad ) { that.play(that.playOnLoadArg); }
	});
};

/** Set up the vibrato LFO **/
let constructVibrato = function(arg){
	if ( arg.vibrato ) {
		return {
			shape     : _.get(arg, 'vibrato.shape', 'sine'),
			speed     : _.get(arg, 'vibrato.speed', 1),
			magnitude : _.get(arg, 'vibrato.magnitude', 5),
			attack    : _.get(arg, 'vibrato.attack', 0),
		};
	}
	else { return null; }
};


/** Set up the tremolo LFO **/
let constructTremolo = function(arg){
	if ( arg.tremolo ) {
		return {
			shape     : _.get(arg, 'tremolo.shape', 'sine'),
			speed     : _.get(arg, 'tremolo.speed', 1),
			magnitude : _.get(arg, 'tremolo.magnitude', 5),
			attack    : _.get(arg, 'tremolo.attack', 1)
		};
	}
	else { return null; }
};

/** Grab the reverb impulse response file from a server.
You may want to change Wad.defaultImpulse to serve files from your own server.
Check out http://www.voxengo.com/impulses/ for free impulse responses. **/
let defaultImpulse = 'https://frivolous.biz/audio/widehall.wav';

let constructReverb = function(that, arg){
	if ( arg.reverb ) {
		var impulseURL = arg.reverb.impulse || defaultImpulse;
		var request = new XMLHttpRequest();
		request.open('GET', impulseURL, true);
		request.responseType = 'arraybuffer';
		that.playable--;
		request.onload = function(){
			context.decodeAudioData(request.response, function (decodedBuffer){

				that.reverb.buffer = decodedBuffer;
				that.playable++;
				if ( that.playOnLoad ) { that.play(that.playOnLoadArg); }
				if ( that instanceof Polywad ) { that.setUp(arg); }
				if ( that.source === 'mic' && that.reverb && that.reverb.buffer && that.reverb.node && !that.reverb.node.buffer ) { // I think this is only relevant when calling play() with args on a mic
					that.reverb.node.convolver.buffer = that.reverb.buffer;
				}

			});
		};
		request.send();
		return { wet : _.get(arg, 'reverb.wet', 1) };
	}
	else {
		return null;
	}
};

let constructPanning = function(arg){
	let panning = null;
	if ( 'panning' in arg ) {
		panning = { location : arg.panning };
		if ( typeof(arg.panning) === 'number' ) {
			panning.type = 'stereo';
		}

		else {
			panning.type = '3d';
			panning.panningModel   = arg.panningModel || 'equalpower';
			panning.distanceModel  = arg.distanceModel; 
			panning.maxDistance    = arg.maxDistance; 
			panning.rolloffFactor  = arg.rolloffFactor;
			panning.refDistance    = arg.refDistance;
			panning.coneInnerAngle = arg.coneInnerAngle;
			panning.coneOuterAngle = arg.coneOuterAngle;
			panning.coneOuterGain  = arg.coneOuterGain;
		}
	}

	else {
		panning = {
			location : 0,
			type     : 'stereo',
		};
	}
	if ( panning.type === 'stereo' && !context.createStereoPanner ) {
		logMessage('Your browser does not support stereo panning. Falling back to 3D panning.');
		panning = {
			location     : [0,0,0],
			type         : '3d',
			panningModel : 'equalpower',
		};
	}
	return panning;
};

let constructDelay = function(arg){
	if ( arg.delay ) {
		return {
			delayTime    : _.get(arg, 'delay.delayTime', .5),
			maxDelayTime : _.get(arg, 'delay.maxDelayTime', 2),
			feedback     : _.get(arg, 'delay.feedback', .25),
			wet          : _.get(arg, 'delay.wet', .25),
		};
	}
	else { return null; }
};

let permissionsGranted = { micConsent: false };
/** Special initialization and configuration for microphone Wads **/
let getConsent = function(that, arg) {
	that.nodes             = [];
	that.mediaStreamSource = null;
	that.gain              = null;
	return getUserMedia({audio: true, video: false}).then(function(stream) {
		that.mediaStreamSource = context.createMediaStreamSource(stream);
		permissionsGranted.micConsent = true;
		setUpMic(that, arg);
		return that;
	}).catch(function(error) { logMessage('Error setting up microphone input: ', error); }); // This is the error callback.
};

let setUpMic = function(that, arg){
	that.nodes           = [];
	that.gain            = context.createGain();
	that.gain.gain.value = _.get(arg, 'volume', that.volume);
	that.nodes.push(that.mediaStreamSource);
	that.nodes.push(that.gain);
  

	if ( that.filter || arg.filter ) { createFilters(that, arg); }

	if ( that.reverb || arg.reverb ) { setUpReverbOnPlay(that, arg); }

	constructPanning(that, arg);
	setUpPanningOnPlay(that, arg);

	if ( that.delay || arg.delay ) {
		setUpDelayOnPlay(that, arg);
	}
	setUpTunaOnPlay(that, arg);
	that.setUpExternalFxOnPlay(arg, context);
};


/** When a note is played, these two functions will schedule changes in volume and filter frequency,
as specified by the volume envelope and filter envelope **/
let filterEnv = function(wad, arg){
	wad.filter.forEach(function (filter, index){
		filter.node.frequency.linearRampToValueAtTime(filter.frequency, arg.exactTime);
		filter.node.frequency.linearRampToValueAtTime(filter.env.frequency, arg.exactTime + filter.env.attack);
	});
};

let playEnv = function(wad, arg){
	let loop = arg.loop || arg.loop;
	let hold;
	if ( wad.env.hold === -1 || (loop && !wad.userSetHold && !(arg.env && arg.env.hold) ) ){
		hold = 999;
	}
	else { hold = wad.env.hold; }
	wad.gain[0].gain.linearRampToValueAtTime(0.0001, arg.exactTime);
	wad.gain[0].gain.linearRampToValueAtTime(wad.volume, arg.exactTime + wad.env.attack + 0.00001);
	wad.gain[0].gain.linearRampToValueAtTime(wad.volume * wad.env.sustain, arg.exactTime + wad.env.attack + wad.env.decay + 0.00002);
	wad.gain[0].gain.linearRampToValueAtTime(wad.volume * wad.env.sustain, arg.exactTime + wad.env.attack + wad.env.decay + hold + 0.00003);
	wad.gain[0].gain.linearRampToValueAtTime(0.0001, arg.exactTime + wad.env.attack + wad.env.decay + hold + wad.env.release + 0.00004);
	// offset is only used by BufferSourceNodes. OscillatorNodes should safely ignore the offset.
	wad.soundSource.start(arg.exactTime, arg.offset);
	if ( !wad.soundSource.playbackRate ) { // audio clips naturally stop themselves at the end of the buffer's duration
		wad.soundSource.stop(arg.exactTime + wad.env.attack + wad.env.decay + hold + wad.env.release + 0.00005);
	}
};


/** When all the nodes are set up for this Wad, this function plugs them into each other,
with special handling for nodes with custom interfaces (e.g. reverb, delay). **/
let plugEmIn = function(that, arg){
	let destination = ( arg && arg.destination ) || that.destination;
	let lastStop;
	for ( let i = 1; i < that.nodes.length; i++ ) {
		let from;
		let to;
		if ( that.nodes[i-1].interface === 'custom' ) {
			from = that.nodes[i-1].output;
		}
		else { // assume native interface
			from = that.nodes[i-1];
		}
		if ( that.nodes[i].interface === 'custom' ) {
			to = that.nodes[i].input;
		}
		else { // assume native interface
			to = that.nodes[i];
		}
		from.connect(to);
	}
	if ( that.nodes[that.nodes.length-1].interface === 'custom') {
		lastStop = that.nodes[that.nodes.length-1].output;
	}
	else { // assume native interface
		lastStop = that.nodes[that.nodes.length-1];
	}
	lastStop.connect(destination);

};


/** Initialize and configure an oscillator node **/
let setUpOscillator = function(that, arg){
	arg = arg || {};
	that.soundSource = context.createOscillator();
	that.soundSource.type = that.source;
	if ( arg.pitch ) {
		if ( arg.pitch in pitches ) {
			that.soundSource.frequency.value = pitches[arg.pitch];
		}
		else {
			that.soundSource.frequency.value = arg.pitch;
		}
	}
	else {
		that.soundSource.frequency.value = that.pitch;
	}
};

/** Set the ADSR volume envelope according to play() arguments, or revert to defaults **/
let setUpEnvOnPlay = function(that, arg){ //_
	if ( arg && arg.env ) {
		that.env.attack  = _.get(arg, 'env.attack', that.defaultEnv.attack);
		that.env.decay   = _.get(arg, 'env.decay', that.defaultEnv.decay);
		that.env.sustain = _.get(arg,'env.sustain', that.defaultEnv.sustain);
		that.env.hold    = _.get(arg, 'env.hold', that.defaultEnv.hold);
		that.env.release = _.get(arg, 'env.release', that.defaultEnv.release);
	}
	else {
		that.env = {
			attack  : that.defaultEnv.attack,
			decay   : that.defaultEnv.decay,
			sustain : that.defaultEnv.sustain,
			hold    : that.defaultEnv.hold,
			release : that.defaultEnv.release
		};
	}

};


/** Set the filter and filter envelope according to play() arguments, or revert to defaults **/

let createFilters = function(that, arg){
	if ( arg.filter && !_.isArray(arg.filter) ) {
		arg.filter = [arg.filter];
	}
	that.filter.forEach(function (filter, i) {
		filter.node                 = context.createBiquadFilter();
		filter.node.type            = filter.type;
		filter.node.frequency.value = ( arg.filter && arg.filter[i] ) ? ( arg.filter[i].frequency || filter.frequency ) : filter.frequency;
		filter.node.Q.value         = ( arg.filter && arg.filter[i] ) ? ( arg.filter[i].q         || filter.q )         : filter.q;
		if ( ( arg.filter && arg.filter[i].env || that.filter[i].env ) && !( that.source === 'mic' ) ) {
			filter.env = {
				attack    : ( arg.filter && arg.filter[i].env && arg.filter[i].env.attack )    || that.filter[i].env.attack,
				frequency : ( arg.filter && arg.filter[i].env && arg.filter[i].env.frequency ) || that.filter[i].env.frequency
			};
		}

		that.nodes.push(filter.node);
	});
};

let setUpFilterOnPlay = function(that, arg){
	if ( arg && arg.filter && that.filter ) {
		if ( !_.isArray(arg.filter) ) arg.filter = [arg.filter];
		createFilters(that, arg);
	}
	else if ( that.filter ) {
		createFilters(that, that);
	}
};

/** Initialize and configure a convolver node for playback **/
let setUpReverbOnPlay = function(that, arg){
	var reverbNode = {
		interface : 'custom',
		input : context.createGain(),
		convolver : context.createConvolver(),
		wet : context.createGain(),
		output : context.createGain()
	};
	reverbNode.convolver.buffer = that.reverb.buffer;
	reverbNode.wet.gain.value   = that.reverb.wet;

	reverbNode.input.connect(reverbNode.convolver);
	reverbNode.input.connect(reverbNode.output);
	reverbNode.convolver.connect(reverbNode.wet);
	reverbNode.wet.connect(reverbNode.output);

	that.reverb.node = reverbNode;
	that.nodes.push(that.reverb.node);
};


/** Initialize and configure a panner node for playback **/
let setUpPanningOnPlay = function(that, arg){
	var panning = arg && arg.panning; // can be zero provided as argument
	if (typeof panning === 'undefined') { panning = that.panning.location; }

	if (typeof panning  === 'number' && context.createStereoPanner ) {
		that.panning.node = context.createStereoPanner();
		that.panning.node.pan.value = panning;
		that.panning.type = 'stereo';
	}
	else {
		that.panning.node = context.createPanner();
		if ( typeof panning === 'number' ) {
			that.panning.node.setPosition(panning, 0, 0);
		}
		else { // assume 3d panning, specified in a 3-element array. 
			that.panning.node.setPosition(panning[0], panning[1], panning[2]);
		}
		that.panning.node.panningModel = arg.panningModel || that.panningModel || 'equalpower';
		that.panning.type = '3d';

		that.panning.node.distanceModel  = arg.distanceModel  || that.distanceModel  || that.panning.node.distanceModel;
		that.panning.node.maxDistance    = arg.maxDistance    || that.maxDistance    || that.panning.node.maxDistance;
		that.panning.node.rolloffFactor  = arg.rolloffFactor  || that.rolloffFactor  || that.panning.node.rolloffFactor;
		that.panning.node.refDistance    = arg.refDistance    || that.refDistance    || that.panning.node.refDistance;
		that.panning.node.coneInnerAngle = arg.coneInnerAngle || that.coneInnerAngle || that.panning.node.coneInnerAngle;
		that.panning.node.coneOuterAngle = arg.coneOuterAngle || that.coneOuterAngle || that.panning.node.coneOuterAngle;
		that.panning.node.coneOuterGain  = arg.coneOuterGain  || that.coneOuterGain  || that.panning.node.coneOuterGain;
	}

	that.nodes.push(that.panning.node);

};


/** Initialize and configure a vibrato LFO Wad for playback **/
let setUpVibratoOnPlay = function(that, arg, Wad){
	that.vibrato.wad = new Wad({
		source : that.vibrato.shape,
		pitch  : that.vibrato.speed,
		volume : that.vibrato.magnitude,
		env    : {
			attack : that.vibrato.attack
		},
		destination : that.soundSource.frequency
	});
	that.vibrato.wad.play();
};


/** Initialize and configure a tremolo LFO Wad for playback **/
let setUpTremoloOnPlay = function(that, arg, Wad){
	that.tremolo.wad = new Wad({
		source : that.tremolo.shape,
		pitch  : that.tremolo.speed,
		volume : that.tremolo.magnitude,
		env    : {
			attack : that.tremolo.attack,
			hold   : 10
		},
		destination : that.gain[0].gain
	});
	that.tremolo.wad.play();
};

let setUpDelayOnPlay = function(that, arg){
	if ( that.delay ) {
		if ( !arg.delay ) { arg.delay = {}; }
		//create the nodes we’ll use
		var delayNode = { // the custom delay node
			interface    : 'custom',
			input        : context.createGain(),
			output       : context.createGain(),
			delayNode    : context.createDelay(that.delay.maxDelayTime), // the native delay node inside the custom delay node.
			feedbackNode : context.createGain(),
			wetNode      : context.createGain(),
		};

		//set some decent values
		delayNode.delayNode.delayTime.value = _.get(arg, 'delay.delayTime', that.delay.delayTime);
		delayNode.feedbackNode.gain.value   = _.get(arg, 'delay.feedback', that.delay.feedback);
		delayNode.wetNode.gain.value        = _.get(arg, 'delay.wet', that.delay.wet);


		//set up the routing
		delayNode.input.connect(delayNode.delayNode);
		delayNode.input.connect(delayNode.output);
		delayNode.delayNode.connect(delayNode.feedbackNode);
		delayNode.delayNode.connect(delayNode.wetNode);
		delayNode.feedbackNode.connect(delayNode.delayNode);
		delayNode.wetNode.connect(delayNode.output);
		that.delay.delayNode = delayNode;

		that.nodes.push(delayNode);
	}
};

let constructCompressor = function(that, arg){
	that.compressor = context.createDynamicsCompressor();
	that.compressor.attack.value    = _.get(arg, 'compressor.attack', that.compressor.attack.value);
	that.compressor.knee.value      = _.get(arg, 'compressor.knee', that.compressor.knee.value);
	that.compressor.ratio.value     = _.get(arg, 'compressor.ratio', that.compressor.ratio.value);
	that.compressor.release.value   = _.get(arg, 'compressor.release', that.compressor.release.value);
	that.compressor.threshold.value = _.get(arg, 'compressor.threshold', that.compressor.threshold.value);
	that.nodes.push(that.compressor);
};

let tuna = new Tuna(context);
let setUpTunaOnPlay = function(that, arg){
	if ( !( that.tuna || arg.tuna ) ) { return; }
	let tunaConfig = {};
	if ( that.tuna ) {
		for ( let key in that.tuna ) {
			tunaConfig[key] = that.tuna[key];
		}
	}

	// overwrite settings from `this` with settings from arg
	if ( arg.tuna ) {
		for ( let key in arg.tuna ) {
			tunaConfig[key] = arg.tuna[key];
		}
	}
	for ( let key in tunaConfig) {
		let tunaEffect = new tuna[key](tunaConfig[key]);
		that.nodes.push(tunaEffect);
	}
};

export {
	logStats,
	logMessage,
	audioCache,
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
	constructCompressor,
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
	createFilters,
};
