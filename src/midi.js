import {
	logMessage,
} from './common';

import { pitchesArray } from './pitches';

let assignMidiMap = function(midiMap, which, success, failure){
	which = which || 0;
	navigator.requestMIDIAccess().then(function(){
		if ( midiInputs[which] ) {
			midiInputs[which].onmidimessage = midiMap;
			if  ( typeof success === 'function' ) { success(); }
		}
		else if ( typeof failure === 'function' ) { failure(); }
	});
};
let midiInstrument = {
	play : function() { logMessage('playing midi');  },
	stop : function() { logMessage('stopping midi'); }
};

let midiInputs  = [];

let midiMap = function(event){
	logMessage(event.receivedTime, event.data, 2);
	if ( event.data[0] === 144 ) { // 144 means the midi message has note data
		if ( event.data[2] === 0 ) { // noteOn velocity of 0 means this is actually a noteOff message
			logMessage('Playing note: ', 2);
			logMessage(pitchesArray[event.data[1]-12], 2);
			midiInstrument.stop(pitchesArray[event.data[1]-12]);
		}
		else if ( event.data[2] > 0 ) {
			logMessage('Stopping note: ', 2);
			logMessage(pitchesArray[event.data[1]-12], 2);
			midiInstrument.play({pitch : pitchesArray[event.data[1]-12], label : pitchesArray[event.data[1]-12] });
		}
	}
	else if ( event.data[0] === 176 ) { // 176 means the midi message has controller data
		logMessage('controller');
		if ( event.data[1] == 46 ) {
			if ( event.data[2] == 127 ) { midiInstrument.pedalMod = true; }
			else if ( event.data[2] == 0 ) { midiInstrument.pedalMod = false; }
		}
	}
	else if ( event.data[0] === 224 ) { // 224 means the midi message has pitch bend data
		logMessage('pitch bend');
	}
};


let onSuccessCallback = function(midiAccess){

	midiInputs = [];
	var val = midiAccess.inputs.values();
	for ( var o = val.next(); !o.done; o = val.next() ) {
		midiInputs.push(o.value);
	}
	// Wad.midiInputs = [m.inputs.values().next().value];   // inputs = array of MIDIPorts
	logMessage('MIDI inputs: ');
	logMessage(midiInputs);
	// var outputs = m.outputs(); // outputs = array of MIDIPorts
	for ( var i = 0; i < midiInputs.length; i++ ) {
		midiInputs[i].onmidimessage = midiMap; // onmidimessage( event ), event.data & event.receivedTime are populated
	}
	// var o = m.outputs()[0];           // grab first output device
	// o.send( [ 0x90, 0x45, 0x7f ] );     // full velocity note on A4 on channel zero
	// o.send( [ 0x80, 0x45, 0x7f ], window.performance.now() + 1000 );  // full velocity A4 note off in one second.
};
let onErrorCallback = function(err){
	logMessage('Failed to get MIDI access', err);
};

if ( navigator && navigator.requestMIDIAccess ) {
	try {
		navigator.requestMIDIAccess().then(onSuccessCallback, onErrorCallback);
	}
	catch(err) {
		logMessage('Failed to get MIDI access', err);
	}
}

export {
	midiMap,
	assignMidiMap,
	midiInstrument,
	midiInputs,
};

