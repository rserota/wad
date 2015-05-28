app.init.loopTracks = function(app){
    for ( var i=0; i<app.numLoopTracks; i++ ) {

        var loopTrack = new Wad.Poly({
            // reverb : {
            //     wet : .8,
            //     impulse : 'http://localhost:8000/widehall.wav'
            // },
            delay : {
                delayTime: app.b(app.beatsPerBar * app.barsPerLoop),
                maxDelayTime: 40,
                feedback : 1,
                wet      : 1
            },
            // recConfig : { 
            //     workerPath : '/src/Recorderjs/recorderWorker.js'
            // },
            // filter : {
            //     type : 'lowpass',
            //     frequency : 1300
            // }
        })
        loopTrack.state = {
            muted     : false, 
            recording : false,
            scheduled : { // state is scheduled to change to at the start of each loop
                muted     : false,
                recording : false,
            }
        }
        app.preDest.add(loopTrack)
        app.loopTracks.push(loopTrack)
    }
}