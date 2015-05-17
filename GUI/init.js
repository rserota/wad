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
    init          : {}, // an object that will be populated with initialization functions
    keys          : { // info about keys on the computer-keyboard
        record     : [91, 93],
        erase      : [16],
        microphone : [77],
        alpha      : [],
        beta       : [],
        gamma      : [],
        delta      : [],
        mode       : { // which keys are currently pressed down?
            record   : false,
            schedule : false,
            erase    : false
        }
    },
    rig           : 'midiRig88',

    instruments   : {
        alpha     : null,
        beta      : null,
        gamma     : null,
        mode      : 'gamma',
        pedalDown : false,
    },
}