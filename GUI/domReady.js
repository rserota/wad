app.init.dom = function(app){
    
    $(document).ready(function(){

        // $metronome = $('#metronome')
        var beatBoxes = [
            $('.b1'),
            $('.b2'),
            $('.b3'),
            $('.b4'),
            $('.b5'),
            $('.b6'),
            $('.b7'),
            $('.b8'),
            $('.b9'),
            $('.b10'),
            $('.b11'),
            $('.b12'),
            $('.b13'),
            $('.b14'),
            $('.b15'),
            $('.b16'),
        ]
        app.$loopTracks = $('.loop-track')

        var start;
        var animateFrame = function(){
            var now = performance.now()
            var progressInBeat = ( ( ( now - start ) % app.beatLen ) / app.beatLen )
            var progressInLoop = ( ( ( now - start ) % ( app.beatLen * 16 ) ) / ( app.beatLen * 16 ) )
            // console.log(Math.floor(progressInLoop / 0.0625) + 1)
            app.prevBeat = app.curBeat
            app.curBeat = Math.floor(progressInLoop / 0.0625) + 1
            if ( app.curBeat < app.prevBeat ) {
                console.log('fire!')
            }
            if      ( Math.floor(progressInLoop / 0.0625) > 0 ) {
                beatBoxes[ Math.floor(progressInLoop / 0.0625) ].addClass('on')
                beatBoxes[ Math.floor(progressInLoop / 0.0625) - 1 ].removeClass('on')
            }
            else if ( Math.floor(progressInLoop / 0.0625) === 0 ) {
                beatBoxes[0].addClass('on')
                beatBoxes[15].removeClass('on')
            }

            // $metronome.css('transform', 'rotate(' + (( progressInBeat * 360 ) - 90 ) + 'deg)')

            requestAnimationFrame(animateFrame)
        }



        $('#start').on('click', function(){
            $('.beatBox').removeClass('on')
            $(this).text('Restart')
            start = performance.now() -16000
            animateFrame()
        })


        $('#micOn').on('click', function(){
            if ( $(this).hasClass('micOn') ) {
                $(this).removeClass('micOn')
                $(this).text('Mic On')
                app.instruments.voice.stop()
            }
            else {
                $(this).addClass('micOn')
                $(this).text('Mic Off')
                app.instruments.voice.play()
            }
        })

        $(document).on('keyup', function(e){
           if ( app.keys.record.indexOf(e.which) > -1 ){
               app.keys.mode.record = false;
               console.log(app.keys.mode)
           } 
        })

        $(document).on('keydown', function(e){
            console.log(e)
            // if ( e.which === 32 || e.metaKey === true ) { e.preventDefault(); }
            if ( app.keys.record.indexOf(e.which) > -1 ){
                app.keys.mode.record = true;
               console.log(app.keys.mode)
            }

            if ( e.which >= 49 && e.which <= 56 ) { //pressed a number key for multi-track mixer
                e.preventDefault();

                if ( app.keys.mode.schedule === false ) {

                    if ( app.keys.mode.record === true ) {
                        app.trackActions.recordToTrack(e.which - 49)
                    }
                    else if ( app.keys.mode.record === false) {
                        console.log('mute!')
                        app.trackActions.muteTrack(e.which - 49)
                    }

                }
            }
        })

        $('.note').on('mousedown', function(){
            console.log('hi')
            app.instruments.alpha.play()
        })
        $('.note').on('mouseup', function(){
            app.instruments.alpha.stop()
        })


    })
}