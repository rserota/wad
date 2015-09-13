// This file handles most of the DOM manipulation and event handling.
// DOM manipulation for tooltips is handled separately. 
app.init.dom = function(app){
    
    $(document).ready(function(){
        jade.render($('.beatBoxes')[0], 'beatBoxes', { barsPerLoop : app.barsPerLoop, beatsPerBar : app.beatsPerBar })
        // $metronome = $('#metronome')
        app.$beatBoxes = $('.beatBox')
        app.$loopTracks = $('.loop-track')

        var start;
        var animateFrame = function(){ // recursive RAF callback
            var now = performance.now()
            var beatsPerLoop = app.beatsPerBar * app.barsPerLoop
            var progressInBeat = ( ( ( now - start ) % app.beatLen ) / app.beatLen )
            var progressInLoop = ( ( ( now - start ) % ( app.beatLen * beatsPerLoop ) ) / ( app.beatLen * beatsPerLoop ) )
            // console.log(Math.floor(progressInLoop / 0.0625) + 1)
            app.prevBeat = app.curBeat
            app.curBeat = Math.floor(progressInLoop / ( 1/beatsPerLoop )) + 1
            if ( app.curBeat < app.prevBeat ) {
                // console.log('fire!')
            }
            if      ( Math.floor(progressInLoop / ( 1/beatsPerLoop )) > 0 ) {
                $(app.$beatBoxes[ Math.floor(progressInLoop / ( 1/beatsPerLoop )) ]).addClass('on')
                $(app.$beatBoxes[ Math.floor(progressInLoop / ( 1/beatsPerLoop )) - 1 ]).removeClass('on')
            }
            else if ( Math.floor(progressInLoop / ( 1/beatsPerLoop )) === 0 ) {
                var end = app.$beatBoxes.length - 1
                $(app.$beatBoxes[0]).addClass('on')
                $(app.$beatBoxes[end]).removeClass('on')
            }


            app.rafID = requestAnimationFrame(animateFrame)
        }

        var startAnimation = function(){            
            $('.beatBox').removeClass('on')
            $('#start').find('i').removeClass('fa-play-circle-o')
            $('#start').find('i').addClass('fa-undo')
            start = performance.now() - ( app.beatLen * app.beatsPerBar * ( app.barsPerLoop - 1 ) )
            cancelAnimationFrame(app.rafID)
            animateFrame()
        }
        $('#start').on('click', startAnimation)

        var toggleMic = function(){
            if ( !($('#ban').hasClass('fa-ban')) ) {
                $('#ban').addClass('fa-ban')
                app.instruments.voice.stop()
            }
            else {
                $('#ban').removeClass('fa-ban')
                app.instruments.voice.play(app.instruments.micConfig)
            }
            
        }


        $('#micOn').on('click', toggleMic)

        $(document).on('keyup', function(e){
           if ( app.keys.record.indexOf(e.which) > -1 ){
               app.keys.mode.record = false;
               // console.log(app.keys.mode)
           }
           if ( app.keys.erase.indexOf(e.which) > -1 ){
               app.keys.mode.erase = false;
               console.log(app.keys.mode)
           }  
        })


        var preventDefaultKeys = {
            32 : null, // space
            9  : null, // tab
            17 : null, // control
            18 : null, // alt
            13 : null, // enter
            20 : null, // caps lock
            27 : null, // escape
            33 : null, // page up
            34 : null, // page down
            35 : null, // end
            36 : null, // home
            37 : null, // left
            38 : null, // up
            39 : null, // right
            40 : null, // down
            46 : null, // delete
            91 : null, // left meta
            92 : null, // right meta
            93 : null, // right meta

        }


        

        $(document).on('keydown', function(e){
            // console.log(e)
            /* Handle modal keys (record, erase, etc) */
            if ( e.which in preventDefaultKeys ) {
                // console.log('nope!')
                e.preventDefault();
            }
            if ( app.keys.record.indexOf(e.which) > -1 ) {
                app.keys.mode.record = true;
               // console.log(app.keys.mode)
            }
            else if ( app.keys.erase.indexOf(e.which) > -1 ) {
                app.keys.mode.erase = true;
               // console.log(app.keys.mode)
            }
            ///////////////////////////////////////////
            if ( app.keys.microphone.indexOf(e.which) > -1 ) {
                toggleMic();
            }
            if ( app.keys.animate.indexOf(e.which) > -1 ) {
                startAnimation();
            }
            if ( app.keys.alpha.indexOf(e.which) > -1 ) {
                app.instruments.mode = 'alpha';
            }
            if ( app.keys.beta.indexOf(e.which) > -1 ) {
                app.instruments.mode = 'beta';
            }
            if ( app.keys.gamma.indexOf(e.which) > -1 ) {
                app.instruments.mode = 'gamma';
            }
            if ( app.keys.delta.indexOf(e.which) > -1 ) {
                app.instruments.mode = 'delta';
            }
            if ( e.which >= 49 && e.which <= 56 ) { //pressed a number key for multi-track mixer
                e.preventDefault();

                if ( app.keys.mode.schedule === false ) { // immediate mode

                    if ( app.keys.mode.record === true ) {
                        app.trackActions.recordToTrack(e.which - 49)
                    }
                    else if ( app.keys.mode.erase === true ) {
                        app.trackActions.eraseTrack(e.which - 49)
                    }
                    else if ( app.keys.mode.record === false) {
                        // console.log('mute!')f
                        app.trackActions.muteTrack(e.which - 49)
                    }

                }

                else if ( app.keys.mode.schedule === true ) {
                    if ( app.keys.mode.record === true ) {
                        app.trackActions.schedule.recordToTrack(e.which - 49)
                    }
                    else if ( app.keys.mode.record === false) {
                        // console.log('mute!')
                        app.trackActions.schedule.muteTrack(e.which - 49)
                    }
                }

            }
        })

// test code //
        $('.note').on('mousedown', function(event){
            var whichNote = +$(this).attr('data-note')
            var whichInstrument = $('#instrumentsModal .tab-pane.active').attr('id')
            if ( whichInstrument !== 'delta') {
                // console.log(Wad.pitchesArray[48 + whichNote + app.instruments[whichInstrument].pitchShiftCoarse])
                
                app.instruments[whichInstrument].play({pitch : Wad.pitchesArray[48 + whichNote + app.instruments[whichInstrument].pitchShiftCoarse] })
            }
            else {
                var whichDrum = $(':focus')
                if ( whichDrum.attr('name') ) {
                    // console.log(whichDrum[0].name)
                    app.instruments.delta[whichDrum.attr('name').split('-vol')[0]].play()
                    setTimeout(function(){whichDrum[0].focus()},10)
                }
            }
        })
        $('.note').on('mouseup', function(){
            var whichInstrument = $('#instrumentsModal .tab-pane.active').attr('id')
            if ( whichInstrument !== 'delta') {
                app.instruments[whichInstrument].stop()
            }
            else {
                // console.log('delta')
            }
        })
///////////////



        // set the label for a range input to match the value of that range input
        $('.settings-modal input[type="range"]').on('change', function(){
            var thisName = $(this).attr('name')
            if ( thisName === 'filter-frequency' ) {
                $(this).closest('.tab-pane').find('[for="filter-frequency"]').text(app.range2freq($(this).val()))    
            }
            else if ( thisName === 'filter-env-frequency' ) {
                $(this).closest('.tab-pane').find('[for="filter-env-frequency"]').text(app.range2freq($(this).val()))    
            }
            else {   
                $(this).closest('.tab-pane, #configModal').find('[for="' + thisName + '"]').text($(this).val())
            }
            // console.log(thisName)

        })

        // set the text box to say the key they pressed, even for non-printing keys
        $('.controls-settings input').on('keydown', function(e){
            $(this).attr('data-which', e.which)
            if ( e.which === 16 ) {
                $(this).val('shift')
            }
            else if ( e.which === 32 ) {
                $(this).val('space')
            }
            else if ( e.which === 8 ) {
                $(this).val('delete')
            }
            else if ( e.which === 9 ) {
                $(this).val('tab')
            }
            else if ( e.which === 17 ) {
                $(this).val('control')
            }
            else if ( e.which === 18 ) {
                $(this).val('alt')
            }
            else if ( e.which === 27 ) {
                $(this).val('escape')
            }
            else if ( e.which === 91 ) {
                $(this).val('left meta')  
            }
            else if ( e.which === 92 ) {
                $(this).val('right meta')
            }
            else if ( e.which === 93 ) {
                $(this).val('right meta')
            }
            else {
                $(this).val('')
            }
        })
        $('#configModal [name="save"]').on('click', function(){
            var bpm         = $('[name="bpm"]').val()
            var beatsPerBar = $('[name="beats-per-bar"]').val()
            var barsPerLoop = $('[name="bars-per-loop"]').val()


            app.keys.record     = [+$('[name="record"]').attr('data-which')]
            app.keys.erase      = [+$('[name="erase"]').attr('data-which')]
            app.keys.microphone = [+$('[name="microphone"]').attr('data-which')]
            app.keys.animate    = [+$('[name="animate"]').attr('data-which')]
            app.keys.alpha      = [+$('[name="alpha"]').attr('data-which')]
            app.keys.beta       = [+$('[name="beta"]').attr('data-which')]
            app.keys.gamma      = [+$('[name="gamma"]').attr('data-which')]
            app.keys.delta      = [+$('[name="delta"]').attr('data-which')]

            // app.keys.mode.schedule = $('.schedule-mode').val() ? true : false

            // console.log(bpm,beatsPerBar,barsPerLoop)
            app.trackActions.resizeLoop(bpm, beatsPerBar, barsPerLoop)
        })
        $('#configModal [type="reset"]').on('click', function(){
            var bpm         = $('[name="bpm"]').prop('defaultValue')
            var beatsPerBar = $('[name="beats-per-bar"]').prop('defaultValue')
            var barsPerLoop = $('[name="bars-per-loop"]').prop('defaultValue')

            $('label[for="bpm"]').text(bpm)
            $('label[for="beats-per-bar"]').text(beatsPerBar)
            $('label[for="bars-per-loop"]').text(barsPerLoop)

        })


        var oscillators = {
            alpha : null,
            beta  : null,
            gamma : null,
        }
        var setInstruments = function($whichInst){
            var whichInst = app.instruments[$whichInst.attr('id')]
            // console.log($whichInst)
            if ( $whichInst.attr('id') === 'delta' ) {
                app.instruments.delta.kick.defaultVolume        = $('[name="kick-vol"]').val()
                app.instruments.delta.snare.defaultVolume       = $('[name="snare-vol"]').val()
                app.instruments.delta.closedHihat.defaultVolume = $('[name="closedHihat-vol"]').val()
                app.instruments.delta.openHihat.defaultVolume   = $('[name="openHihat-vol"]').val()
                app.instruments.delta.crash.defaultVolume       = $('[name="crash-vol"]').val()
                app.instruments.delta.highTom.defaultVolume     = $('[name="highTom-vol"]').val()
                app.instruments.delta.midTom.defaultVolume      = $('[name="midTom-vol"]').val()
                app.instruments.delta.lowTom.defaultVolume      = $('[name="lowTom-vol"]').val()
                app.instruments.delta.cowbell.defaultVolume     = $('[name="cowbell-vol"]').val()
                // console.log(app.instruments.delta)
            }
            else if ( $whichInst.attr('id') === 'epsilon' ) {
                if ( whichInst.gain ) {
                    app.instruments.micConfig.volume      = +$whichInst.find('[name="volume"]').val()
                }
                if ( whichInst.panning.node ) {
                    app.instruments.micConfig.panning     = +$whichInst.find('[name="panning"]').val()
                }

                if ( $whichInst.find('[name="filter-toggle"]').prop('checked') ) {
                    console.log('hi')
                    app.instruments.micConfig.filter = [{
                        type      : $whichInst.find('[name="filter-type"]').val(),
                        frequency : app.range2freq(+$whichInst.find('[name="filter-frequency"]').val()),
                        q         : +$whichInst.find('[name="filter-q"]').val(),
                    }]

                }
                else {
                    app.instruments.micConfig.filter = null
                    app.instruments.epsilon.filter = null
                }

                if ( $whichInst.find('[name="delay-toggle"]').prop('checked')) {
                    app.instruments.micConfig.delay = {
                        delayTime : +$whichInst.find('[name="delay-time"]').val(),
                        maxDelayTime : 2.1,
                        feedback : +$whichInst.find('[name="delay-feedback"]').val(),
                        wet : +$whichInst.find('[name="delay-wet-level"]').val()
                    }
                }
                else {
                    app.instruments.micConfig.delay = null
                }
                if ( Wad.micConsent ) {
                    toggleMic()
                    toggleMic()
                }
            }

            // else, it must be an oscillator-based instrument
            else if ( $whichInst.attr('id') in oscillators ) {

                whichInst.source             =  $whichInst.find('[name="waveform"]').val()
                whichInst.defaultVolume      = +$whichInst.find('[name="volume"]').val()
                whichInst.panning.location   = +$whichInst.find('[name="panning"]').val()
                whichInst.detune             = +$whichInst.find('[name="pitch-shift-fine"]').val()
                whichInst.pitchShiftCoarse   = +$whichInst.find('[name="pitch-shift-coarse"]').val()
                whichInst.defaultEnv.attack  = +$whichInst.find('[name="volume-attack"]').val()
                whichInst.defaultEnv.decay   = +$whichInst.find('[name="volume-decay"]').val()
                whichInst.defaultEnv.sustain = +$whichInst.find('[name="volume-sustain"]').val()
                whichInst.defaultEnv.release = +$whichInst.find('[name="volume-release"]').val()
                if ( $whichInst.find('[name="filter-toggle"]').prop('checked') ) {
                    whichInst.filter = [{
                        type      : $whichInst.find('[name="filter-type"]').val(),
                        frequency : app.range2freq(+$whichInst.find('[name="filter-frequency"]').val()),
                        q         : +$whichInst.find('[name="filter-q"]').val(),
                    }]

                    if ( $whichInst.find('[name="filter-env-toggle"]').prop('checked') ) {
                        whichInst.filter[0].env = {
                            frequency : app.range2freq(+$whichInst.find('[name="filter-env-frequency"]').val()),
                            attack    : +$whichInst.find('[name="filter-env-attack"]').val(),
                        }
                    }
                    else {
                        whichInst.filter[0].env = null
                    }
                }
                else {
                    whichInst.filter = null
                    $whichInst.find('[name="filter-env-toggle"]').prop('checked', false)
                    $whichInst.find('[name="filter-env-frequency"]').prop('disabled', true)
                    $whichInst.find('[name="filter-env-attack"]').prop('disabled', true)
                }

                if ( $whichInst.find('[name="delay-toggle"]').prop('checked')) {
                    whichInst.delay = {
                        delayTime : +$whichInst.find('[name="delay-time"]').val(),
                        maxDelayTime : 2.1,
                        feedback : +$whichInst.find('[name="delay-feedback"]').val(),
                        wet : +$whichInst.find('[name="delay-wet-level"]').val()
                    }
                }
                else {
                    whichInst.delay = null
                }
                if ( $whichInst.find('[name="vibrato-toggle"]').prop('checked')) {
                    whichInst.vibrato = {
                        shape : $whichInst.find('[name="vibrato-waveform"]').val(),
                        speed : +$whichInst.find('[name="vibrato-speed"]').val(),
                        magnitude : +$whichInst.find('[name="vibrato-magnitude"]').val(),
                        attack : +$whichInst.find('[name="vibrato-attack"]').val(),
                    }
                }
                else {
                    whichInst.vibrato = null
                }

                if ( $whichInst.find('[name="tremolo-toggle"]').prop('checked')) {
                    whichInst.tremolo = {
                        shape : $whichInst.find('[name="tremolo-waveform"]').val(),
                        speed : +$whichInst.find('[name="tremolo-speed"]').val(),
                        magnitude : +$whichInst.find('[name="tremolo-magnitude"]').val(),
                        attack : +$whichInst.find('[name="tremolo-attack"]').val(),
                    }
                }
                else {
                    whichInst.tremolo = null
                }
            }
        }
        $('#instrumentsModal input, #instrumentsModal select').on('change', function(){

            var $whichInst = $(this).closest('.tab-pane.active')
            setInstruments($whichInst)

        })
        $('#instrumentsModal [type="reset"]').on('click', function(){

            var $ranges = $('#instrumentsModal').find('[type="range"]');
            [].forEach.call($ranges, function(el){
                var which  = $(el).attr('name')
                var defVal = $(el)[0].defaultValue
                var whichInst = '#' + $(el).closest('.tab-pane').attr('id')
                var $whichInst = $(el).closest('.tab-pane')
                if ( which.search('frequency') > 0 ) {
                    $(whichInst + ' label[for="' + which + '"]').text(app.range2freq(defVal))
                }
                else {
                    // console.log(which, ' ', defVal, $('.tab-pane.active label[for="' + which + '"]'))

                    $(whichInst + ' label[for="' + which + '"]').text(defVal)
                }
                setTimeout(function(){
                    setInstruments($whichInst)
                },20)
            })
            // var $whichInst = $('#instrumentsModal .tab-pane.active')

            app.keys.drums = {
                kick : 60,
                snare : 62,
                closedHihat : 64,
                openHihat : 63,
                crash : 65,
                highTom : 67,
                midTom : 69,
                lowTom : 71,
                cowbell : 72,
            }

        })

        // disable controls for effects that are not in use.
        $('#instrumentsModal [type="checkbox"]').on('change', function(){
            $(this).closest('.settings-section').find('[type="range"], select').prop('disabled', !$(this).prop('checked'))

        })


        $('.drums-settings [type="text"]').on('click', function(){
            app.listenForMIDI = true
        })
        $('.drums-settings [type="text"]').on('midi', function(event, midiEvent){
            // console.log('!',midiEvent.data)
            $(this).val(Wad.pitchesArray[midiEvent.data[1]-12])
            app.keys.drums[$(this).attr('name')] = midiEvent.data[1]
        })

        $('.drums-settings [type="text"]').on('blur', function(){
            app.listenForMIDI = false
        });

        [].forEach.call($('#instrumentsModal .tab-pane'), function(el){
            setInstruments($(el))
        })
        $('#instrumentsModal [type="reset"]').trigger('click')

    })
}