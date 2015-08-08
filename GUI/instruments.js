app.init.instruments = function(app){

    // Audio preloading/initialization/whatever goes here.
    app.instruments.kick = new Wad({
        source : 'http://localhost:8000/GUI/audio/kick.mp3',
        // callback : function(that){that.play()}
    })
    // kick.play()
    app.instruments.hat = new Wad(Wad.presets.hiHatClosed)

    app.instruments.hatOpen = new Wad({
        source : 'http://localhost:8000/GUI/audio/hatOpen.wav'
    })
    // var snare = new Wad({ source : 'noise', volume : 6, env : {attack : .001, decay : .01, sustain : .2, hold : .03, release : .02}, filter : {type : 'bandpass', frequency : 300, q : .180 }, delay : { delayTime : .05} })
    app.instruments.snare = new Wad({
        source : 'http://localhost:8000/GUI/audio/snare.wav',
        delay  : {
            delayTime : .1,
            feedback  : .6,
            wet       : 0.01
        }
    })


    // var crash = new Wad({})
    // var highTom = new Wad({})
    // var midTom = new Wad({})
    // var lowTom = new Wad({})
    app.instruments.cowbell = new Wad({
        source : 'http://localhost:8000/GUI/audio/cowbell.wav',
    })


    app.instruments.piano = new Wad({source:'sine', volume:.8, env:{attack:.005, decay:.2, sustain:.8, hold:4, release:.3}, filter : {type:'lowpass', frequency:700}})

    // var bass = new Wad({})



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
        filter : {
            type : 'highpass',
            frequency : 900
        },
        // delay : {
        //     delayTime: 1,
        //     maxDelayTime: 20,
        //     feedback : 1,
        //     wet      : 1
        // },
        panning: -1,
        // reverb : { 
        //     impulse :'http://localhost:8000/widehall.wav',
        //     wet : .21
        // },

    })


    app.instruments.alpha = new Wad({
        source  : 'sawtooth',
        env     : {
            hold    : 5,
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
            hold    : 5,
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

    app.instruments.gamma = new Wad({ source : 'sine' })
    app.instruments.gamma.pitchShiftCoarse = 0

    app.instruments.delta = app.instruments.piano
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
            that.add(app.instruments.kick).add(app.instruments.hat).add(app.instruments.hatOpen).add(app.instruments.snare).add(app.instruments.cowbell).add(app.instruments.alpha).add(app.instruments.beta).add(app.instruments.delta);
            app.preDest.add(that)
        }
    })

    // var lfo = new Wad({source:'sine', volume: 1.5, destination: mt.delay.feedbackNode.gain})
    // lfo.play({pitch: 1})
}