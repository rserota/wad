var app = { 
    recordingTo   : null,
    bpm           : 120, // beats per minute
    beatsPerBar   : 4,
    barsPerLoop   : 4,
    numLoopTracks : 8,
    trackActions  : {},
    soundSources  : {},
    preDest       : new Wad.Poly(),
    loopTracks    : [],
    panning       : 0, // change to 2-d panning
    detune        : 0,
    curBeat       : 1,
    prevBeat      : 1,
    rafID         : null, // request animation frame ID
    init          : {}, // an object that will be populated with initialization functions
    keys          : { // info about keys on the computer-keyboard
        record     : [32],
        erase      : [16],
        microphone : [77],
        animate    : [190],
        alpha      : [90],
        beta       : [88],
        gamma      : [67],
        delta      : [86],
        mode       : { // which keys are currently pressed down?
            record   : false,
            erase    : false,
            schedule : false,
        }
    },
    rig           : 'midiRig88',

    instruments   : {
        alpha     : null,
        beta      : null,
        gamma     : null,
        delta     : [null], // delta is an array of drum samples
        mode      : 'gamma',
        pedalDown : false,
    },
    schedule      : [ // scheduled actions. This is not relevant in the default 'immediate action' mode.
        { record : false, mute : false },
        { record : false, mute : false },
        { record : false, mute : false },
        { record : false, mute : false },
        { record : false, mute : false },
        { record : false, mute : false },
        { record : false, mute : false },
        { record : false, mute : false },
    ]
}