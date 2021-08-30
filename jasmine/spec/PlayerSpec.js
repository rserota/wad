describe("_common functions - ", function() {

	describe("createEnv", function() {

		it("should create an env object when passed valid arguments", function() {
			const validArgs = {
				env : {
					attack: .1,
					decay: .2,
					sustain: .9,
					hold: 2,
					release: 1,
				},
			}
			const constructedEnv = Wad.common.constructEnv(validArgs)
			console.log('??', constructedEnv);

		});

		it("should create an env object with defaults when arguments are missing", function() {

			const noEnv = {}
			const emptyEnv = {env:{}}
			const constructedEnv1 = Wad.common.constructEnv(noEnv)
			const constructedEnv2 = Wad.common.constructEnv(emptyEnv)
			console.log('??', constructedEnv1);
			console.log('??', constructedEnv2);

		});
  });
});
