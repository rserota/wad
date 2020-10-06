import SoundIterator from './sound_iterator';
import Polywad from './polywad';
import presets from './presets';
import {
	pitches,
	pitchesArray,
} from './pitches';
import {
	midiMap,
	assignMidiMap,
	midiInputs,
	midiInstrument,
} from './midi';
import WebAudioDAW from './wad.js';
import { logStats } from './common';


let Wad = WebAudioDAW;
Wad.Poly = Polywad;
Wad.SoundIterator = function(args){ return new SoundIterator(args, Wad); };
Wad.pitches = pitches;
Wad.pitchesArray = pitchesArray;
Wad.midiMap = midiMap;
Wad.assignMidiMap = assignMidiMap;
Wad.midiInstrument = midiInstrument;
Wad.midiInputs = midiInputs;
Wad.presets = presets;
Wad.logs = logStats;


if(typeof module !== 'undefined' && module.exports) { module.exports = Wad; }

export default Wad;

