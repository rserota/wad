/*below is the es6. It was transpiled to es5 from:
https://babeljs.io/en/repl
search for:
// start of ES5
to get there

export default class SoundIterator{
    static defaultArgs = {
        files: [], // either sound files or Wad audio objects
        random: false, // either play a random order (true), or play in the order of the list (false)
        randomPlaysBeforeRepeat: 0, // This value says the amount of plays that need to happen before a sound can be repeated. This only works if the length of the iterator is 3 or more, and this value is max 1 less than the length of the sound list.
    }

    constructor(args, Wad){
        this.Wad = Wad //passed in from the Wad object that creates this iterator
        args = Object.assign({}, SoundIterator.defaultArgs, args)
        this.files = args.files
        this.sounds = this.files.map(f=>f.play ? f : new Wad({source:f})) // checks if the item in the list is a wad or not.
        this.randomSounds = this.sounds.slice() //creates a list of sounds that can be mutated if there are random sounds
        this.random = args.random
        this.randomPlaysBeforeRepeat = this.sounds.length > 3 && args.randomPlaysBeforeRepeat < this.sounds.length-1 ? args.randomPlaysBeforeRepeat : 0
        this.index = 0 // keeps track of what item in the list is playing
        this.waitingSounds = [] //has a list of the sounds that are waiting from randomPlaysBeforeRepeat
    }

    play(args={}){
        if(!this.sounds.length) return 0
        if(this.random){
            const soundIndex = Math.floor(Math.random()*this.randomSounds.length)
            const sound = this.randomSounds[soundIndex]
            this.index = this.sounds.indexOf(sound)
            this.waitingSounds = this.waitingSounds.filter(soundObj=>{
                soundObj.plays -= 1
                if(soundObj.plays < 1){
                    this.randomSounds.push(soundObj.sound)
                    return null
                }
                return true
            })
            if(this.randomPlaysBeforeRepeat){
                this.randomSounds.splice(soundIndex, 1)
                this.waitingSounds.push({plays: this.randomPlaysBeforeRepeat, sound: sound})
            }
            return sound.play(args)
        } else {
            const playingSound = this.sounds[this.index] ? this.sounds[this.index].play(args) : undefined
            this.index += 1
            if(this.index >= this.sounds.length){
                this.index = 0
            }
            return playingSound    
        }
    }

    add(sound){
        if(!sound.play){
            sound = new this.Wad({source: sound})
        }
        this.sounds.push(sound)
        this.randomSounds.push(sound)
        return this
    }

    remove(sound){
        const soundIndex = this.sounds.indexOf(sound)
        if(soundIndex === -1){
            throw new Error(`That sound does not exist: ${sound}`)
        }
        this.sounds.splice(soundIndex, 1)
        const randomSoundIndex = this.randomSounds.indexOf(sound)
        if(randomSoundIndex === -1){
            this.waitingSounds = this.waitingSounds.filter(obj => obj.sound === sound ? false : true)
        } else {
            this.randomSounds.splice(randomSoundIndex, 1)
        }
        return this
    }
}
*/

// start of ES5
'use strict';

function _instanceof(left, right) { if (right != null && typeof Symbol !== 'undefined' && right[Symbol.hasInstance]) { return right[Symbol.hasInstance](left); } else { return left instanceof right; } }

function _classCallCheck(instance, Constructor) { if (!_instanceof(instance, Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var SoundIterator =
/*#__PURE__*/
function () {
	function SoundIterator(args, Wad) {
		_classCallCheck(this, SoundIterator);

		this.Wad = Wad; //passed in from the Wad object that creates this iterator

		args = Object.assign({}, SoundIterator.defaultArgs, args);
		this.files = args.files;
		this.sounds = this.files.map(function (f) {
			return f.play ? f : new Wad({
				source: f
			});
		}); // checks if the item in the list is a wad or not.

		this.randomSounds = this.sounds.slice(); //creates a list of sounds that can be mutated if there are random sounds

		this.random = args.random;
		this.randomPlaysBeforeRepeat = this.sounds.length > 3 && args.randomPlaysBeforeRepeat < this.sounds.length - 1 ? args.randomPlaysBeforeRepeat : 0;
		this.index = 0; // keeps track of what item in the list is playing

		this.waitingSounds = []; //has a list of the sounds that are waiting from randomPlaysBeforeRepeat
	}

	_createClass(SoundIterator, [{
		key: 'play',
		value: function play() {
			var _this = this;

			var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
			if (!this.sounds.length) return 0;

			if (this.random) {
				var soundIndex = Math.floor(Math.random() * this.randomSounds.length);
				var sound = this.randomSounds[soundIndex];
				this.index = this.sounds.indexOf(sound);
				this.waitingSounds = this.waitingSounds.filter(function (soundObj) {
					soundObj.plays -= 1;

					if (soundObj.plays < 1) {
						_this.randomSounds.push(soundObj.sound);

						return null;
					}

					return true;
				});

				if (this.randomPlaysBeforeRepeat) {
					this.randomSounds.splice(soundIndex, 1);
					this.waitingSounds.push({
						plays: this.randomPlaysBeforeRepeat,
						sound: sound
					});
				}

				return sound.play(args);
			} else {
				var playingSound = this.sounds[this.index] ? this.sounds[this.index].play(args) : undefined;
				this.index += 1;

				if (this.index >= this.sounds.length) {
					this.index = 0;
				}

				return playingSound;
			}
		}
	}, {
		key: 'add',
		value: function add(sound) {
			if (!sound.play) {
				sound = new this.Wad({
					source: sound
				});
			}

			this.sounds.push(sound);
			this.randomSounds.push(sound);
			return this;
		}
	}, {
		key: 'remove',
		value: function remove(sound) {
			var soundIndex = this.sounds.indexOf(sound);

			if (soundIndex === -1) {
				throw new Error('That sound does not exist: '.concat(sound));
			}

			this.sounds.splice(soundIndex, 1);
			var randomSoundIndex = this.randomSounds.indexOf(sound);

			if (randomSoundIndex === -1) {
				this.waitingSounds = this.waitingSounds.filter(function (obj) {
					return obj.sound === sound ? false : true;
				});
			} else {
				this.randomSounds.splice(randomSoundIndex, 1);
			}

			return this;
		}
	}]);

	return SoundIterator;
}();

_defineProperty(SoundIterator, 'defaultArgs', {
	files: [],
	// either sound files or Wad audio objects
	random: false,
	// either play a random order (true), or play in the order of the list (false)
	randomPlaysBeforeRepeat: 0 // This value says the amount of plays that need to happen before a sound can be repeated. This only works if the length of the iterator is 3 or more, and this value is max 1 less than the length of the sound list.

});
export default SoundIterator;
