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
        // app.bar()
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
            }
            else if ( app.recordingTo === trackNum ) { // stop recording on this track
                console.log('stopping recording to track ', trackNum)
                app.recordingTo = null
                app.loopTracks[trackNum].remove(app.soundSources)
                app.preDest.add(app.soundSources)
            }
            else if ( app.recordingTo !== trackNum ) { // stop recording on old track, start on this track
                console.log('stop rec on ', app.recordingTo, ', start on ', trackNum)
                app.loopTracks[app.recordingTo].remove(app.soundSources)
                app.recordingTo = trackNum
                app.loopTracks[trackNum].add(app.soundSources)
            }
        },
        eraseTrack : function(trackNum){
            disconnectDelay(trackNum)
            setTimeout(function(){ reconnectDelay(trackNum) }, 100)
        },
        muteTrack : function(trackNum){

        },
    }
}