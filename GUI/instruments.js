app.init.instruments = function(app){

    // Audio preloading/initialization/whatever goes here.
    app.instruments.delta.kick = new Wad({
        source : 'http://localhost:8000/GUI/audio/kick.mp3',
        // callback : function(that){that.play()}
    })
    // kick.play()
    app.instruments.delta.closedHihat = new Wad({
        source : 'http://localhost:8000/GUI/audio/hatClosed.wav'
    })

    app.instruments.delta.openHihat = new Wad({
        source : 'http://localhost:8000/GUI/audio/hatOpen.wav'
    })
    // var snare = new Wad({ source : 'noise', volume : 6, env : {attack : .001, decay : .01, sustain : .2, hold : .03, release : .02}, filter : {type : 'bandpass', frequency : 300, q : .180 }, delay : { delayTime : .05} })
    app.instruments.delta.snare = new Wad({
        source : 'http://localhost:8000/GUI/audio/snare.wav',
        delay  : {
            delayTime : .1,
            feedback  : .6,
            wet       : 0.01
        }
    })


    app.instruments.delta.cowbell = new Wad({
        source : 'http://localhost:8000/GUI/audio/cowbell.wav',
    })

    app.instruments.delta.crash   = new Wad({
        source : 'http://localhost:8000/GUI/audio/crash.wav'
    })
    app.instruments.delta.highTom = new Wad({
        source : 'http://localhost:8000/GUI/audio/highTom.wav'
    })
    app.instruments.delta.midTom  = new Wad({
        source : 'http://localhost:8000/GUI/audio/midTom.wav'
    })
    app.instruments.delta.lowTom  = new Wad({
                source : 'http://localhost:8000/GUI/audio/lowTom.wav'
    })


    Wad.prototype.constructExternalFx = function(arg, ctx) {
      // console.log('constructExternalFx called');
      this.tuna = new Tuna(ctx);
      this.chorus = arg.chorus;
    }

    Wad.prototype.setUpExternalFxOnPlay = function(arg, context) {
      // console.log('setUpExternalFxOnPlay called');
      if (arg.chorus) {
        var chorus = new this.tuna.Chorus({
          rate: arg.chorus.rate || this.chorus.rate,
          feedback: arg.chorus.feedback || this.chorus.feedback,
          delay: arg.chorus.delay || this.chorus.delay,
          bypass: arg.chorus.bypass || this.chorus.bypass
        });

        chorus.input.connect = chorus.connect.bind(chorus);
        this.nodes.push(chorus.input);
      }
    }

    // voice.play({
    //   chorus: {
    //       rate: 1.5,
    //       feedback: 0.2,
    //       delay: 0.0045,
    //       bypass: 0
    //     }  
    //   }
    // });


    app.instruments.voice = new Wad({ 
        source : 'mic',
        // filter : {
        //     type : 'highpass',
        //     frequency : 900
        // },
        // delay : {
        //     delayTime: 1,
        //     maxDelayTime: 20,
        //     feedback : 1,
        //     wet      : 1
        // },
        panning: 0,
        // reverb : { 
        //     impulse :'http://localhost:8000/widehall.wav',
        //     wet : .21
        // },

    })
    app.instruments.epsilon = app.instruments.voice

    app.instruments.alpha = new Wad({
        source  : 'sawtooth',
        env     : {
            hold    : 10,
            attack  : 0.02,
            release : 0.3,
            sustain : .6,
            decay   : .1
        },
        filter : {
            type : 'lowpass',
            frequency : 600,
            q : 1,
        }
    })
    app.instruments.alpha.pitchShiftCoarse = 0

    app.instruments.beta = new Wad({
        source : 'sawtooth',
        env    : {
            attack : .02,
            decay  : .2,
            sustain : .8,
            hold    : 10,
            release : .1
        },
        filter : { // slap
            type : 'lowpass',
            frequency : 1700,
            env : {
                attack : .4,
                frequency : 400
            }
        }
        // filter : { // pop
        //     type : 'lowpass',
        //     frequency : 700,
        //     q    : 3,
        //     env : {
        //         attack : .4,
        //         frequency : 1400
        //     }
        // }
    })
    app.instruments.beta.pitchShiftCoarse = 0

    app.instruments.gamma = new Wad({ 
        source : 'sine',
        env    : {
            hold: 10,
        }
    })
    app.instruments.gamma.pitchShiftCoarse = 0

    app.soundSources = new Wad.Poly({ 
        // recConfig : { 
        //     workerPath : '/src/Recorderjs/recorderWorker.js'
        // },
        reverb : { 
            impulse :'http://localhost:8000/GUI/audio/widehall.wav',
            wet : .11
        },
        // delay   : {
        //     delayTime : .3,  // Time in seconds between each delayed playback.
        //     wet       : .1, // Relative volume change between the original sound and the first delayed playback.
        //     feedback  : .45, // Relative volume change between each delayed playback and the next. 
        // },

        callback : function(that){
            that.add(app.instruments.delta.kick).add(app.instruments.delta.closedHihat).add(app.instruments.delta.openHihat).add(app.instruments.delta.snare).add(app.instruments.delta.cowbell).add(app.instruments.delta.crash).add(app.instruments.delta.highTom).add(app.instruments.delta.midTom).add(app.instruments.delta.lowTom).add(app.instruments.alpha).add(app.instruments.beta).add(app.instruments.gamma);
            app.preDest.add(that)
        }
    })

    // var lfo = new Wad({source:'sine', volume: 1.5, destination: mt.delay.feedbackNode.gain})
    // lfo.play({pitch: 1})
}