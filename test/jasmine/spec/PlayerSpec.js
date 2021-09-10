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
			expect(constructedEnv1).toEqual(defaultArgs.env)
			expect(constructedEnv2).toEqual(defaultArgs.env)
			console.log('??', constructedEnv2);

		});
	});

	describe('createFilter', function() {
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

			console.log('cons filter', constructedFilters);
		});

		it('returns null if filter is not defined', function() {
			const noFilter = {foo:'bar'};
			const constructedWithoutFilter = Wad._common.constructFilter(noFilter);
			expect(constructedWithoutFilter).toBe(null);
		});

		it('returns a filter with default paramters when arguments are missing', function(){
			const defaultFilter = Wad._common.constructFilter({filter:{}});
			expect(defaultFilter[0]).toEqual(defaultFilterArgs);
		});
	});
});
