var app = { 
    recordingTo   : null,
    bpm           : 100,
    numLoopTracks : 8,
    trackActions  : {},
    soundSources  : {},
    preDest       : new Wad.Poly(),
    loopTracks    : [],
    panning       : [0, 0, 4], // change to 2-d panning
    detune        : 0,
    curBeat       : 1,
    prevBeat      : 1,
    init          : {},
    rig           : 'midiRig88',
    instruments   : {
        alpha     : null,
        beta      : null,
        gamma     : null,
        mode      : 'gamma',
        pedalDown : false,
    },
}