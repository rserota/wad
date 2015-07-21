app.init.midiRigs = function(app){

    Wad.midiInstrument = app.instruments.piano


    var midiRigs = {

        // using octave shift, so lowest note is [144, 60, 1]
        // I need to make sure that the keyboard is shifted up one octave.
        midiRig25 : function(event){
            // console.log(event.receivedTime, event.data)
            if ( event.data[0] === 177 && event.data[1] === 49 ) {
                app.instruments.alpha.play({pitch : Wad.pitchesArray[event.data[2]+24], env : { hold : .2 }})
            }

            if ( event.data[0] === 128 && event.data[1] === 48 && event.data[2] === 0 ) { app.instruments.mode = 'alpha' }
            if ( event.data[0] === 128 && event.data[1] === 49 && event.data[2] === 0 ) { app.instruments.mode = 'beta'  }
            if ( event.data[0] === 128 && event.data[1] === 50 && event.data[2] === 0 ) { app.instruments.mode = 'gamma' }
            if ( event.data[0] === 128 && event.data[1] === 51 && event.data[2] === 0 ) { app.instruments.mode = 'delta' }

            if      ( app.instruments.mode === 'alpha' ) {

                if ( event.data[0] === 128 && event.data[1] >= 60 ) { // stop note.
                    app.instruments.alpha.stop(Wad.pitchesArray[event.data[1]-12])
                }

                else if ( event.data[0] === 144 && event.data[1] >= 60 ) { // note data
                    if ( app.instruments.pedalDown === true ) {
                        app.instruments.alpha.play({pitch : Wad.pitchesArray[event.data[1]-12], label : Wad.pitchesArray[event.data[1]-12], detune : app.detune, panning: app.panning, volume : 2.5 })
                    }
                    else {
                        app.instruments.alpha.play({
                            volume  : .5,
                            pitch   : Wad.pitchesArray[event.data[1]-12], 
                            label   : Wad.pitchesArray[event.data[1]-12], 
                            detune  : app.detune,
                            panning : app.panning,
                            env     : {
                                attack  : .4,
                                sustain : 1,
                                decay   : 0
                            } 
                        })
                    }
                }
                else if ( event.data[0] === 224 ) { // 224 means the midi message has pitch bend data
                    console.log('pitch bend')
                    console.log( ( event.data[2] - 64 ) * ( 100 / 64 ) )
                    app.instruments.alpha.setDetune( ( event.data[2] - 64 ) * ( 100 / 64 ) * 12 )
                    app.detune =    ( event.data[2] - 64 ) * ( 100 / 64 ) * 12
                    // console.log(app.detune)
                }
                else if ( event.data[0] === 176 && event.data[1] === 22 ) {
                    console.log(event.data[2])
                    app.panning = ( ( event.data[2] - 64 ) * ( 10 / 64 ) ) / 10
                    app.instruments.alpha.setPanning(app.panning)
                    console.log('panning: ', app.panning)
                }
                if      ( event.data[0] === 176 && event.data[1] === 64 && event.data[2] === 127 ) { // pedal data
                    app.instruments.pedalDown = true
                    console.log(app.instruments.pedalDown)
                }
                else if ( event.data[0] === 176 && event.data[1] === 64 && event.data[2] === 0 ) {
                    app.instruments.pedalDown = false
                    console.log(app.instruments.pedalDown)
                }
            }

            else if ( app.instruments.mode === 'beta' ) {
                if ( event.data[0] === 128 && event.data[1] >= 60 ) { // stop note.
                    app.instruments.beta.stop(Wad.pitchesArray[event.data[1]-48])
                }
                if ( event.data[0] === 144 && event.data[1] >= 60 ) { // note data
                    if ( app.instruments.pedalDown === false ) {
                        app.instruments.beta.play({
                            pitch   : Wad.pitchesArray[event.data[1]-48], 
                            label   : Wad.pitchesArray[event.data[1]-48], 
                            detune  : app.detune,
                            panning : app.panning,
                            env : {
                                release : .5
                            },
                            filter : { // slap
                                type : 'lowpass',
                                frequency : 1700,
                                env : {
                                    attack : .3,
                                    frequency : 400
                                }
                            } 
                        })
                    }
                    else if ( app.instruments.pedalDown === true ) {
                        app.instruments.beta.play({
                            volume : 2.2,
                            panning : app.panning,
                            pitch : Wad.pitchesArray[event.data[1]-48], 
                            label : Wad.pitchesArray[event.data[1]-48], 
                            detune : app.detune,
                            env : {
                                attack : .02,
                                decay  : .02,
                                sustain : .5,
                                release : .4
                            },
                            filter : { // pop
                                type : 'lowpass',
                                frequency : 1700,
                                q : 1.5,
                                env : {
                                    attack : .1,
                                    frequency : 400
                                }
                            }
                        })
                    }
                    else if ( event.data[0] === 176 && event.data[1] === 22 ) {
                        app.panning = ( ( event.data[2] - 64 ) * ( 10 / 64 ) ) / 10
                        app.instruments.beta.setPanning(app.panning)
                        console.log('panning: ', app.panning)
                    }
                }

                if      ( event.data[0] === 176 && event.data[1] === 64 && event.data[2] === 127 ) { // pedal data
                    app.instruments.pedalDown = true
                    console.log(app.instruments.pedalDown)
                }
                else if ( event.data[0] === 176 && event.data[1] === 64 && event.data[2] === 0 ) {
                    app.instruments.pedalDown = false
                    console.log(app.instruments.pedalDown)
                }

                else if ( event.data[0] === 224 ) { // 224 means the midi message has pitch bend data
                    console.log('pitch bend')
                    console.log( ( event.data[2] - 64 ) * ( 100 / 64 ) )
                    app.instruments.beta.setDetune( ( event.data[2] - 64 ) * ( 100 / 64 ) * 2 )
                    app.detune =    ( event.data[2] - 64 ) * ( 100 / 64 ) * 2
                    // console.log(app.detune)
                }        
            }


            else if ( app.instruments.mode === 'delta' ) {
                // console.log('delta') 
                if ( event.data[0] === 144 && event.data[1] >= 60 ) { // stop note.
                    if      ( event.data[1] === 60 ) { console.log() }
                //     else if ( event.data[1] === 61 ) { foo.play({ volume : , env : { attack : } }); }
                //     else if ( event.data[1] === 62 ) { foo.play({ volume : , env : { attack : } }); }
                //     else if ( event.data[1] === 63 ) { foo.play({ volume : , env : { attack : } }); }
                //     else if ( event.data[1] === 64 ) { foo.play({ volume : , env : { attack : } }); }
                //     else if ( event.data[1] === 65 ) { foo.play({ volume : , env : { attack : } }); }
                //     else if ( event.data[1] === 66 ) { foo.play({ volume : , env : { attack : } }); }
                //     else if ( event.data[1] === 67 ) { foo.play({ volume : , env : { attack : } }); }
                //     else if ( event.data[1] === 68 ) { foo.play({ volume : , env : { attack : } }); }
                //     else if ( event.data[1] === 69 ) { foo.play({ volume : , env : { attack : } }); }
                //     else if ( event.data[1] === 70 ) { foo.play({ volume : , env : { attack : } }); }
                //     else if ( event.data[1] === 71 ) { foo.play({ volume : , env : { attack : } }); }
                    else if ( event.data[1] === 72 ) {
                        // console.log('data: ', ( event.data[2] * ( .2 / 127 ) + 1 ) )
                        app.instruments.hat.play({
                            volume : ( event.data[2] * ( .2 / 127 ) + 1 ),
                            env : {
                                attack : ( event.data[2] * ( .01 / 127 ) * .8 )
                            },
                            filter : {
                                frequency : ( event.data[2] * ( 100 / 127 ) * 8 ) + 300,
                                q         : ( event.data[2] * ( 10 / 127 ) * .7 )
                            },
                            panning : app.panning
                        }); 
                    }
                    else if ( event.data[1] === 73 ) { app.instruments.hatOpen.play({ volume : 1 }); }
                    else if ( event.data[1] === 74 ) { app.instruments.kick.play({ volume : .81 }); }
                //     else if ( event.data[1] === 75 ) { foo.play({ volume : , env : { attack : } }); }
                    else if ( event.data[1] === 76 ) {
                        if ( app.instruments.pedalDown === false ) { app.instruments.snare.play({ volume : 1 })}
                        else {  
                            app.instruments.snare.play({ 
                                volume : 1,
                                env    : {
                                    attack : .01
                                },
                                delay  : {
                                    wet : .9
                                } 
                            }); 
                        }
                    }
                    else if ( event.data[1] === 77 ) { app.instruments.cowbell.play({ volume : 2.7, panning: app.panning }); }
                    // else if ( event.data[1] === 79 ) { lowTom.play({ volume : 1 }); }
                //     else if ( event.data[1] === 78 ) { foo.play({ volume : , env : { attack : } }); }
                    // else if ( event.data[1] === 81 ) { midTom.play({ volume : 1 }); }
                //     else if ( event.data[1] === 80 ) { foo.play({ volume : , env : { attack : } }); }
                    // else if ( event.data[1] === 83 ) { highTom.play({ volume : 1 }); }
                //     else if ( event.data[1] === 82 ) { foo.play({ volume : , env : { attack : } }); }
                    // else if ( event.data[1] === 84 ) { crash.play({ volume : 1 }); }
                }

                else if ( event.data[0] === 176 && event.data[1] === 22 ) {
                    app.panning = ( ( event.data[2] - 64 ) * ( 10 / 64 ) ) / 10
                    // cowbell.setPanning(app.panning)
                    console.log('panning: ', app.panning)
                }
                if      ( event.data[0] === 176 && event.data[1] === 64 && event.data[2] === 127 ) { // pedal data
                    app.instruments.pedalDown = true
                    console.log(app.instruments.pedalDown)
                }
                else if ( event.data[0] === 176 && event.data[1] === 64 && event.data[2] === 0 ) {
                    app.instruments.pedalDown = false
                    console.log(app.instruments.pedalDown)
                }
            }

            else if ( app.instruments.mode === 'gamma' ) {
                // console.log('delta') 
                if ( event.data[0] === 128 && event.data[1] >= 60 ) { // stop note.
                    app.instruments.gamma.stop(Wad.pitchesArray[event.data[1]-12])
                }

                else if ( event.data[0] === 144 && event.data[1] >= 60 ) { // note data
                    app.instruments.gamma.play({pitch : Wad.pitchesArray[event.data[1]-12], label : Wad.pitchesArray[event.data[1]-12], detune : app.detune, panning: app.panning, volume : 2.5 })
                }
            }
        },


        /** A simple rig for a full-size piano-keyboard. **/
        midiRig88 : function(event){
            // console.log(event.receivedTime, event.data)
            if ( event.data[0] === 128 ) {
                Wad.midiInstrument.stop(Wad.pitchesArray[event.data[1]-12])
            }
            else if ( event.data[0] === 144 ) { // 144 means the midi message has note data

                if ( event.data[2] === 0 ) { // noteOn velocity of 0 means this is actually a noteOff message
                    // console.log('|| stopping note: ', Wad.pitchesArray[event.data[1]-12])
                    Wad.midiInstrument.stop(Wad.pitchesArray[event.data[1]-12])
                }
                else if ( event.data[2] > 0 ) {
                    // console.log('> playing note: ', Wad.pitchesArray[event.data[1]-12])
                    var detune = ( event.data[2] - 64 ) * ( 100 / 64 ) * 12
                    Wad.midiInstrument.play({pitch : Wad.pitchesArray[event.data[1]-12], label : Wad.pitchesArray[event.data[1]-12], detune : app.detune, callback : function(that){
                    }})
                }
            }
            else if ( event.data[0] === 176 ) { // 176 means the midi message has controller data
                console.log('controller')
                if ( event.data[1] == 64 ) {
                    if ( event.data[2] == 127 ) { looper.add(mt) ; console.log('on')}
                    else if ( event.data[2] == 0 ) { looper.remove(mt); console.log('off')}
                }
            }
            else if ( event.data[0] === 224 ) { // 224 means the midi message has pitch bend data
                console.log('pitch bend')
                console.log( ( event.data[2] - 64 ) * ( 100 / 64 ) )
                Wad.midiInstrument.setDetune( ( event.data[2] - 64 ) * ( 100 / 64 ) * 12 )
                app.detune = ( event.data[2] - 64 ) * ( 100 / 64 ) * 12
            }
        }
    }



    if ( Wad.midiInputs[0] ) { Wad.midiInputs[0].onmidimessage = midiRigs[app.rig] }
    else { 
        setTimeout(function(){ 
            if ( Wad.midiInputs[0] ) { Wad.midiInputs[0].onmidimessage = midiRigs[app.rig] }
            else { console.log('No MIDI devices detected.')}
            }, 1000)
    }

}
