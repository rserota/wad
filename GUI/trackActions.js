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
    app.reset = function(trackNum){
        disconnectDelay(trackNum)
        // app.bar()
        setTimeout(function(){ reconnectDelay(trackNum) }, 100)
    }

    app.trackActions = { // 'track' as in 'mixer-track', not 'watch/observe'

        selectTrack : function(trackNum){
            console.log(app.$loopTracks[trackNum-1])
        },
        recordToTrack : function(trackNum){
            if ( app.recordingTo === null ) {
                app.recordingTo = trackNum
                // move nodes, record on this track
            }
            else if ( app.recordingTo === trackNum) {
                app.recordingTo = null;
            }
        },
        eraseTrack : function(trackNum){

        },
        muteTrack : function(trackNum){

        },
    }
}