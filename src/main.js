import SoundIterator from './sound_iterator';
import Polywad from './polywad';
import presets from './presets';
import {
	logStuff,
	pitches,
	pitchesArray,
} from './common';
import {
	midiMap,
	assignMidiMap,
	midiInputs,
	midiInstrument,
} from './midi';
import WebAudioDAW from './wad.js';


let Wad = WebAudioDAW;
Wad.Poly = Polywad;
Wad.SoundIterator = function(args){ return new SoundIterator(args, Wad); };

/** If a Wad is created with reverb without specifying a URL for the impulse response,
grab it from the defaultImpulse URL **/
Wad.pitches = pitches;
Wad.pitchesArray = pitchesArray;

Wad.midiMap = midiMap;
Wad.assignMidiMap = assignMidiMap;
Wad.midiInstrument = midiInstrument;
Wad.midiInputs = midiInputs;
Wad.presets = presets;
Wad.logs = logStuff;


if(typeof module !== 'undefined' && module.exports) { module.exports = Wad; }

export default Wad;

