/* eslint-disable no-undef */
describe('_common functions - ', function() {

	describe('createEnv', function() {
		const defaultArgs = {
			env : {
				attack: 0,
				decay: 0,
				sustain: 1,
				hold: 3.14159,
				release: 0,
			},
		};
		const validArgs = {
			env : {
				attack: .1,
				decay: .2,
				sustain: .9,
				hold: 2,
				release: 1,
			}
		};

		it('should create an env object when passed valid arguments', function() {
			const constructedEnv = Wad._common.constructEnv(validArgs);
			expect(constructedEnv).toEqual(validArgs.env);
		});

		it('should create an env object with defaults when arguments are missing', function() {

			const noEnv = {};
			const emptyEnv = {env:{}};
			const constructedEnv1 = Wad._common.constructEnv(noEnv);
			const constructedEnv2 = Wad._common.constructEnv(emptyEnv);
			expect(constructedEnv1).toEqual(defaultArgs.env);
			expect(constructedEnv2).toEqual(defaultArgs.env);

		});
	});

	describe('constructFilter', function() {
		const defaultFilterArgs = {type: 'lowpass', q:1, frequency:600, env: null};

		it('should create an array with a single filter when passed an object', function() {
			const constructedFilter = Wad._common.constructFilter({filter:defaultFilterArgs});

			expect(constructedFilter.length).toBe(1);
			expect(constructedFilter[0]).toEqual(defaultFilterArgs);
		});

		it('should create an array with multiple filters when passed an array', function() {

			const validFilterArgs = {
				type: 'highpass',
				q: 1.5,
				frequency: 880,
				env: {
					frequency: 680,
					attack: 0.5,
				}
			};

			const constructedFilters = Wad._common.constructFilter({filter:[defaultFilterArgs, validFilterArgs]});
			expect(constructedFilters.length).toBe(2);
			expect(constructedFilters[0]).toEqual(defaultFilterArgs);
			expect(constructedFilters[1]).toEqual(validFilterArgs);

		});

		it('returns null if filter is not defined', function() {
			const noFilter = {source:'sine'};
			const constructedWithoutFilter = Wad._common.constructFilter(noFilter);
			expect(constructedWithoutFilter).toBe(null);
		});

		it('returns a filter with default paramters when arguments are missing', function(){
			const defaultFilter = Wad._common.constructFilter({filter:{}});
			expect(defaultFilter[0]).toEqual(defaultFilterArgs);
		});
	});

	describe('constructVibrato', function() {

		const defaultArgs = {
			vibrato : {
				shape: 'sine',
				speed: 1,
				magnitude: 5,
				attack: 0,
			},
		};

		const validArgs = {
			vibrato : {
				shape: 'sawtooth',
				speed: 2,
				magnitude: 3,
				attack: 2,
			},
		};

		it('should create a vibrato object when passed valid arguments', function() {
			const constructedVibrato = Wad._common.constructVibrato(validArgs);
			expect(constructedVibrato).toEqual(validArgs.vibrato);
		});

		it('should create a vibrato object with defaults when arguments are missing', function() {
			const noVibrato = {};
			const emptyVibrato = {vibrato:{}};
			const constructedWithEmptyVibrato = Wad._common.constructVibrato(emptyVibrato);
			const constructedWithNoVibrato = Wad._common.constructVibrato(noVibrato);
			expect(constructedWithEmptyVibrato ).toEqual(defaultArgs.vibrato);
			expect(constructedWithNoVibrato).toEqual(null);
		});
	});

	describe('constructTremolo', function() {
		const defaultArgs = {
			tremolo : {
				shape: 'sine',
				speed: 1,
				magnitude: 5,
				attack: 1,
			},
		};
		const validArgs = {
			tremolo : {
				shape: 'sawtooth',
				speed: 2,
				magnitude: 3,
				attack: 2,
			},
		};

		it('should create a tremolo object when passed valid arguments', function() {
			const constructedTremolo = Wad._common.constructTremolo(validArgs);
			expect(constructedTremolo).toEqual(validArgs.tremolo);
		});

		it('should create a tremolo object with defaults when arguments are missing', function() {
			const noTremolo = {};
			const emptyTremolo = {tremolo:{}};
			const constructedWithEmptyTremolo = Wad._common.constructTremolo(emptyTremolo);
			const constructedWithNoTremolo = Wad._common.constructTremolo(noTremolo);
			expect(constructedWithEmptyTremolo ).toEqual(defaultArgs.tremolo);
			expect(constructedWithNoTremolo).toEqual(null);

		});
	});

	describe('constructReverb', function() {
		const defaultArgs = {
			reverb : { wet: 1 },
		};

		const validArgs = {
			reverb : { wet: .6 },
		};

		it('should create a reverb object when passed valid arguments', function() {
			const constructedReverb = Wad._common.constructReverb({}, validArgs);
			expect(constructedReverb).toEqual(validArgs.reverb);
		});

		it('should create a reverb object with defaults when arguments are missing', function() {
			const noReverb = {};
			const emptyReverb = {reverb:{}};
			const constructedWithEmptyReverb = Wad._common.constructReverb({}, emptyReverb);
			const constructedWithNoReverb = Wad._common.constructReverb({}, noReverb);
			expect(constructedWithEmptyReverb ).toEqual(defaultArgs.reverb);
			expect(constructedWithNoReverb).toEqual(null);
		});
	});

	describe('constructPanning', function() {
		it('should create a stereo panning object when passsed a number', function() {
			const numberPanning = Wad._common.constructPanning({panning:-4});
			expect(numberPanning).toEqual({location:-4,type:'stereo'});
		});

		it('should create a 3d panning object when passsed an array ', function() {
			const arrayPanning = Wad._common.constructPanning({panning:[-4,1,3]});

			expect(arrayPanning).toEqual({
				location:[-4,1,3],
				type:'3d',
				panningModel:'equalpower',
				distanceModel: undefined,
				maxDistance: undefined,
				rolloffFactor: undefined,
				refDistance: undefined,
				coneInnerAngle: undefined,
				coneOuterAngle: undefined,
				coneOuterGain: undefined,
			});
		});

		it('should create a panning object with defaults when arguments are missing', function() {
			const defaultPanning = Wad._common.constructPanning({});

			expect(defaultPanning).toEqual({
				location : 0,
				type     : 'stereo',
			});
		});
	});



});
