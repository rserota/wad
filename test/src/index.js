import Wad from '../../build/wad.js';
window.Wad = Wad;

Wad.logs.verbosity = 1;
var ignition = new Wad({source:'./ignition.mp3'});
document.getElementById('ignition').addEventListener('click', async function(){
	// await ignition.play()
	await ignition.play();
	console.log('ignition');
	await ignition.play();
	console.log('ignition');
	await ignition.play();
	console.log('ignition');

});
document.getElementById('ignition-faster').addEventListener('click', async function(){
	await ignition.play({ rate: 2.0, });
	console.log('fast ignition');
	await ignition.play({ rate: 2.0, });
	console.log('fast ignition');
	await ignition.play({ rate: 2.0, });
	console.log('fast ignition');
});
document.getElementById('ignition-slower').addEventListener('click', async function(){
	await ignition.play({
		rate: 0.5,
	});
	console.log('slow ignition');
	await ignition.play({
		rate: 0.5,
	});
	console.log('slow ignition');
});
var helloMan = new Wad({
	source: './hello-man.wav',
	sprite: {
		hello: [0, .4],
		man  : [.4,1]
	}
});
document.getElementById('sprite-a').addEventListener('click', async function(){
	await helloMan.hello.play({env:{release:.02}});
	await helloMan.hello.play({rate: 1.1, volume:1.2, env:{release:.02}});
});
document.getElementById('sprite-b').addEventListener('click', async function(){
	await helloMan.man.play({env:{attack: .1, release:.02}});
	await helloMan.man.play({env:{attack: .1, release:.02}});
});
document.getElementById('sprite-ab').addEventListener('click', async function(){
	await helloMan.play({env:{attack: .1, release:.02}});
	await helloMan.play({env:{attack: .1, release:.02}});
});

var longClip = new Wad({source:'./do-re-mi.wav'});
document.getElementById('full-song').addEventListener('click', function(){
	longClip.play().then(function(thatWad){
		console.log('Clip finished.');
	});
});
document.getElementById('pause-full-song').addEventListener('click', function(){
	longClip.pause();
});
document.getElementById('unpause-full-song').addEventListener('click', function(){
	longClip.unpause();
});
document.getElementById('stop-full-song').addEventListener('click', function(){
	longClip.stop();
});
document.getElementById('reverse-full-song').addEventListener('click', function(){
	longClip.reverse();
});

var sine = new Wad({source:'sine', env: {attack: .07, hold: 1.5, release: .6}});

document.getElementById('sine').addEventListener('click', async function(){
	await sine.play();
	await sine.play();
});
document.getElementById('sine-left').addEventListener('click', async function(){
	await sine.play({panning: -1, label: 'left'});
	await sine.play({panning: -1, label: 'left'});
});
document.getElementById('sine-right').addEventListener('click', async function(){
	await sine.play({panning: 1, label: 'right'});
	await sine.play({panning: 1, label: 'right'});
});

document.getElementById('detune').addEventListener('click', function(){
	sine.setDetune(100);
});
document.getElementById('detune-left').addEventListener('click', function(){
	sine.setDetune(100, null, 'left');
});
document.getElementById('detune-right').addEventListener('click', function(){
	sine.setDetune(100, null, 'right');
});


document.getElementById('dampen').addEventListener('click', function(){
	sine.setVolume(.1);
});
document.getElementById('dampen-left').addEventListener('click', function(){
	sine.setVolume(.1, null, 'left');
});
document.getElementById('dampen-right').addEventListener('click', function(){
	sine.setVolume(.1, null, 'right');
});

document.getElementById('pan').addEventListener('click', function(){
	sine.setPanning(1);
});
document.getElementById('set-pitch').addEventListener('click', function(){
	sine.setPitch('B3');
});
document.getElementById('stop').addEventListener('click', function(){
	sine.stop();
});


var sawtooth = new Wad({source:'sawtooth', env:{hold:1, release:.2}});
var triangle = new Wad({source:'triangle', env:{hold:1, release:.2}});

var volumeDisplay = document.getElementById('polywad-volume');
var clippingDisplay = document.getElementById('polywad-clipping');
let displayAudioMeter = function(thatWad){
	thatWad.add(sawtooth).add(triangle);
	setInterval(function(){
		volumeDisplay.innerText = Math.round(thatWad.audioMeter.volume * 1000);
		clippingDisplay.innerText = thatWad.audioMeter.checkClipping();
	}, 50);
};
window.polywad = new Wad.Poly({
	volume: .5,
	reverb  : {
		wet     : 1,                                            
		impulse : '/widehall.wav' 
	},
	recorder: true,
	audioMeter: {
		clipLevel: .98,
		averaging: .95,
		clipLag: 750,
	},
	callback: displayAudioMeter
});


document.getElementById('polywad').addEventListener('click', function(){
	polywad.play();
});
document.getElementById('polywad-set-pitch').addEventListener('click', function(){
	polywad.setPitch('B3');
});

document.getElementById('stop').addEventListener('click', function(){
	sine.stop();
});
document.getElementById('polywad-stop').addEventListener('click', function(){
	polywad.stop();
});

var rafId;
var logPitch = function(){
	console.log(tuner.pitch, tuner.noteName);
	rafId = requestAnimationFrame(logPitch);
};
document.getElementById('mic-consent').addEventListener('click', function(){
	window.voice = new Wad({
		source  : 'mic',
		// reverb  : {
		//     wet : .4
		// },
		// filter  : {
		//     type      : 'highpass',
		//     frequency : 700
		// },
		// panning : -.2
	});

	window.tuner = new Wad.Poly({
		recorder: {
			onstop: function(){
				let blob = new Blob(this.recorder.chunks, { 'type' : 'audio/webm;codecs=opus' });
				window.recordedAudio = new Wad({source:URL.createObjectURL(blob)})
			}
		},
	});
	// tuner.setVolume(0) // mute the tuner to avoid feedback
	tuner.add(voice);


});

document.getElementById('mic-play').addEventListener('click', function(){
	console.log('Play mic');
	voice.play();
});
document.getElementById('mic-stop').addEventListener('click', function(){
	console.log('Stop mic');
	voice.stop();
});
document.getElementById('mic-record').addEventListener('click', function(){
	console.log('record mic');
	tuner.recorder.start();
});
document.getElementById('mic-record-stop').addEventListener('click', function(){
	console.log('stop recording mic');
	tuner.recorder.stop();
});
document.getElementById('detect-pitch').addEventListener('click', function(){
	tuner.updatePitch();
	logPitch();
});
document.getElementById('stop-detect-pitch').addEventListener('click', function(){
	tuner.stopUpdatingPitch();
	cancelAnimationFrame(rafId);
});


var tunaConfig = {
	source: 'sawtooth',
	env: {
		attack: .1,
		hold: 2,
		release: .4
	},
	filter: {
		type: 'lowpass',
		frequency: 700
	}
};
var withoutTuna = new Wad(tunaConfig);

tunaConfig.tuna = {
	Chorus : {
		intensity: 0.3,  //0 to 1
		rate: 4,         //0.001 to 8
		stereoPhase: 0, //0 to 180
		bypass: 0
	}
}; 

var withTuna = new Wad(tunaConfig);

tunaConfig.tuna = {
	Phaser: {
		rate: 1.2,                     //0.01 to 8 is a decent range, but higher values are possible
		depth: 0.3,                    //0 to 1
		feedback: 0.2,                 //0 to 1+
		stereoPhase: 30,               //0 to 180
		baseModulationFrequency: 700,  //500 to 1500
		bypass: 0
	}
};
var tunaPhaser = new Wad(tunaConfig);

document.getElementById('no-tuna').addEventListener('click', function(){
	withoutTuna.play();
});
document.getElementById('tuna-chorus').addEventListener('click', function(){
	withTuna.play();
});
document.getElementById('tuna-phaser').addEventListener('click', function(){
	tunaPhaser.play();
});

//SoundIterator

var iterator = new Wad.SoundIterator({files: [
	new Wad({source: 'sawtooth', volume: 0.5, env:{hold:1}}),
	new Wad({source: 'square', volume: 0.5, env:{hold:1}}),
	new Wad({source: 'sine', volume: 0.5, env:{hold:1}}),
]});

document.getElementById('play-next-nonrandom-sound').addEventListener('click', function(){
	iterator.random = false;
	iterator.play();
});

document.getElementById('play-next-random-sound').addEventListener('click', function(){
	iterator.random = true;
	iterator.randomPlaysBeforeRepeat = 0;
	iterator.play();
});

document.getElementById('play-next-sound-with-1-randomPlaysBeforeRepeat').addEventListener('click', function(){
	iterator.random = true;
	iterator.randomPlaysBeforeRepeat = 1;
	iterator.play();
});

var newSound = new Wad({source:'triangle', volume: 0.5, env:{hold:1}});

document.getElementById('add-sound').addEventListener('click', function(){
	iterator.add(newSound);
});

document.getElementById('remove-sound').addEventListener('click', function(){
	iterator.remove(newSound);
});

// AudioListener

var listenerReferenceSound = new Wad({
	source: './ignition.mp3',
	panning: [0,0,0]
});
var listener = Wad.listener;

document.getElementById('listener-move-left').addEventListener('click', function(){
	listener.setPosition(listener.positionX.value-1, listener.positionY.value, listener.positionZ.value);
	listenerReferenceSound.play();
});

document.getElementById('listener-move-right').addEventListener('click', function(){
	listener.positionX.value += 1;
	listenerReferenceSound.play();
});

document.getElementById('listener-position').addEventListener('click', function(){
	alert('The listener is at: ' + JSON.stringify(listener.getPosition()));
});

document.getElementById('listener-face-left').addEventListener('click', function(){
	listener.setOrientation(-1, 0, 0, listener.upX.value, listener.upY.value, listener.upZ.value);
	listenerReferenceSound.play();
});

document.getElementById('listener-face-forward').addEventListener('click', function(){
	listener.setOrientation(0, 0, -1, listener.upX.value, listener.upY.value, listener.upZ.value);
	listenerReferenceSound.play();
});

document.getElementById('listener-face-right').addEventListener('click', function(){
	listener.forwardX.value = 1;
	listener.forwardY.value = 0;
	listener.forwardZ.value = 0;
	listenerReferenceSound.play();
});

document.getElementById('listener-orientation').addEventListener('click', function(){
	alert('The listener is at: ' + JSON.stringify(listener.getOrientation()));
});



