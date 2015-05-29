app.init.trackActions = function(app){
    
    var disconnectDelay = function(trackNum){
        app.loopTracks[trackNum].delay.delayNode.delayNode.disconnect();
        app.loopTracks[trackNum].delay.delayNode.feedbackNode.disconnect();
        app.loopTracks[trackNum].delay.delayNode.input.disconnect();

    }
    var reconnectDelay = function(trackNum){
        app.loopTracks[trackNum].delay.delayNode.delayNode.connect(app.loopTracks[trackNum].delay.delayNode.feedbackNode)
        app.loopTracks[trackNum].delay.delayNode.delayNode.connect(app.loopTracks[trackNum].delay.delayNode.wetNode)
        app.loopTracks[trackNum].delay.delayNode.feedbackNode.connect(app.loopTracks[trackNum].delay.delayNode.delayNode);
        app.loopTracks[trackNum].delay.delayNode.input.connect(app.loopTracks[trackNum].delay.delayNode.delayNode);
        app.loopTracks[trackNum].delay.delayNode.input.connect(app.loopTracks[trackNum].delay.delayNode.output);

    }
    var reset = function(trackNum){
        disconnectDelay(trackNum)
        setTimeout(function(){ reconnectDelay(trackNum) }, 100)
    }

    app.trackActions = { // 'track' as in 'mixer-track', not 'watch/observe'

        // I don't think 'selecting' a track needs to be a thing.
        // selectTrack : function(trackNum){
        //     console.log(app.$loopTracks[trackNum-1])
        // },
        recordToTrack : function(trackNum){
            if ( app.recordingTo == null ) { // start recording to this track
                console.log('recording to track ', trackNum)
                app.recordingTo = trackNum
                app.preDest.remove(app.soundSources)
                app.loopTracks[trackNum].add(app.soundSources)
                app.loopTracks[trackNum].state.recording = true;

            }
            else if ( app.recordingTo === trackNum ) { // stop recording on this track
                console.log('stopping recording to track ', trackNum)
                app.recordingTo = null
                app.loopTracks[trackNum].remove(app.soundSources)
                app.preDest.add(app.soundSources)
                app.loopTracks[trackNum].state.recording = false;
            }
            else if ( app.recordingTo !== trackNum ) { // stop recording on old track, start on this track
                console.log('stop rec on ', app.recordingTo, ', start on ', trackNum)
                app.loopTracks[app.recordingTo].remove(app.soundSources)
                app.loopTracks[app.recordingTo].state.recording = false;
                app.trackActions.updateTrackDOM(app.recordingTo)
                app.recordingTo = trackNum
                app.loopTracks[trackNum].add(app.soundSources)
                app.loopTracks[trackNum].state.recording = true;
            }
            app.trackActions.updateTrackDOM(trackNum)
        },
        eraseTrack : function(trackNum){
            disconnectDelay(trackNum)
            setTimeout(function(){ reconnectDelay(trackNum) }, 100)
        },
        muteTrack : function(trackNum){
            var track = app.loopTracks[trackNum]
            if ( track.state.muted === false ) {
                // console.log('it was not muted')
                track.output.gain.oldValue = track.output.gain.value
                track.output.gain.value = 0;
                track.state.muted = true
            }
            else if ( track.state.muted === true ) {
                // console.log('it was muted')
                track.output.gain.value = track.output.gain.oldValue
                track.state.muted = false
            }
            app.trackActions.updateTrackDOM(trackNum)
        },
        updateTrackDOM : function(trackNum){
            var track  = app.loopTracks[trackNum];
            var $track = $(app.$loopTracks[trackNum]);
            console.log(app.loopTracks[trackNum].state)

            if      ( track.state.recording === true ) {
                $track.find('i').addClass('recording')
            }
            else if ( track.state.recording === false ) {
                $track.find('i').removeClass('recording')
            }

            if      ( track.state.muted === true ) {
                $track.find('i').removeClass('fa-volume-up')
                $track.find('i').addClass('fa-volume-off')
            }
            else if ( track.state.muted === false ) {
                $track.find('i').addClass('fa-volume-up')
                $track.find('i').removeClass('fa-volume-off')

            }


        },
        resizeLoop : function(bpm, beatsPerBar, barsPerLoop){
            app.bpm         = bpm;
            app.beatsPerBar = beatsPerBar;
            app.barsPerLoop = barsPerLoop;
            app.beatLen     = ( 60 / app.bpm ) * 1000; // length of one beat in milliseconds 
            jade.render($('.beatBoxes')[0], 'beatBoxes', { barsPerLoop : app.barsPerLoop, beatsPerBar : app.beatsPerBar });
            app.$beatBoxes = $('.beatBox');
            for ( var i = 0; i < app.loopTracks.length; i++ ) {
                console.log(app.loopTracks[i].delay)
                app.loopTracks[i].delay.delayTime = app.b(app.beatsPerBar * app.barsPerLoop)
                app.loopTracks[i].delay.delayNode.delayNode.delayTime.value = app.b(app.beatsPerBar * app.barsPerLoop)
            }

        },
        schedule : {
            recordToTrack : function(){

            },
            muteTrack : function(trackNum){
                var track = app.loopTracks[trackNum]
                if ( track.state.muted === false ) {
                    // console.log('it was not muted')
                    track.output.gain.oldValue = track.output.gain.value
                    track.output.gain.value = 0;
                    track.state.muted = true
                }
                else if ( track.state.muted === true ) {
                    // console.log('it was muted')
                    track.output.gain.value = track.output.gain.oldValue
                    track.state.muted = false
                }
                app.trackActions.updateTrackDOM(trackNum)
            }
        }
    }
}