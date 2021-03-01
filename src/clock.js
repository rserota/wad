
export default class Clock {
	constructor(beatLength, beatsPerLoop){
		this.hooks = [];
		this.rafId = null;
		this.curBeat = null;
		this.beatLength = beatLength;
		this.beatsPerLoop = beatsPerLoop;

	}
	start(){
		this.rafId = requestAnimationFrame(this.update.bind(this));
	}
	stop(){
		cancelAnimationFrame(this.rafId);
	}
	update(){
		const beat = Math.floor(performance.now() / this.beatLength);
		const beatInBar = (beat % this.beatsPerLoop)+1;
		if ( beat != this.curBeat ) {
			this.curBeat = beat;
			for ( let hook of Object.values(this.hooks) ){
				if ( typeof hook === 'function' ) {
					hook({beat, beatInBar});
				}
			}
		}

		this.rafId = requestAnimationFrame(this.update.bind(this));
	}

}
