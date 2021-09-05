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
		}

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
});
