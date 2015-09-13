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
    panning       : 0,
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
        // switch to different instruments
        alpha      : [90],
        beta       : [88],
        gamma      : [67],
        delta      : [86],
        //////////////////////////////////
        drums      : {
            kick : 60,
            snare : 62,
            closedHihat : 64,
            openHihat : 63,
            crash : 65,
            highTom : 67,
            midTom : 69,
            lowTom : 71,
            cowbell : 72,
        },
        mode       : { // which keys are currently pressed down?
            record   : false,
            erase    : false,
            schedule : false,
        }
    },
    rig           : 'midiRig25',

    instruments   : {
        alpha     : null,
        beta      : null,
        gamma     : null,
        // delta is an object of drum samples
        delta     : {}, 
        epsilon   : null,
        mode      : 'alpha',
        pedalDown : false,
        micConfig : {
            volume  : .8,
            panning : 0,
            filter  : null,
            delay   : null,
        }
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