export default Wad;
declare class Wad {
    /**
     * @param {string} [label]
     */
    static stopAll(label?: string): void;
    /**
     * @param {number} volume
     */
    static setVolume(volume: number): void;
    /**
     * @typedef {object} DelayConfig
     * @property {number} [delayTime]
     * @property {number} [wet]
     * @property {number} [feedback]
     */
    /**
     * @typedef {object} Envelope
     * @property {number} [attack]
     * @property {number} [decay]
     * @property {number} [sustain]
     * @property {number} [hold]
     * @property {number} [release]
     */
    /**
     * @typedef {object} FilterConfig
     * @property {'lowpass'|'highpass'|'bandpass'|'lowshelf'|'highshelf'|'peaking'|'notch'|'allpass'} [type]
     * @property {number} [frequency]
     * @property {number} [q]
     * @property {FilterEnvConfig} [env]
     */
    /**
     * @typedef {object} FilterEnvConfig
     * @property {number} [frequency]
     * @property {number} [attack]
     */
    /**
     * @typedef {object} VibratoConfig
     * @property {'sine'|'sawtooth'|'square'|'triangle'} [shape]
     * @property {number} [magnitude]
     * @property {number} [speed]
     * @property {number} [attack]
     */
    /**
     * @typedef {object} TremoloConfig
     * @property {'sine'|'sawtooth'|'square'|'triangle'} [shape]
     * @property {number} [magnitude]
     * @property {number} [speed]
     * @property {number} [attack]
     */
    /**
     * @typedef {object} ReverbConfig
     * @property {number} [wet]
     * @property {string} [impulse]
     */
    /**
     * @typedef {object} WadConfig
     * @property {'sine'|'square'|'sawtooth'|'triangle'|'noise'} source - sine, square, sawtooth, triangle, or noise
     * @property {number} [volume] - From 0 to 1
     * @property {string|number} [pitch]
     * @property {number} [detune]
     * @property {Envelope} [env]
     * @property {object} [destination]
     * @property {number} [offset]
     * @property {boolean} [loop]
     * @property {object} [tuna]
     * @property {number} [rate]
     * @property {object} [sprite] - Each key is the name of a sprite. The value is a two-element array, containing the start and end time of that sprite, in seconds.
     * @property {FilterConfig|FilterConfig[]} [filter]
     * @property {VibratoConfig} [vibrato]
     * @property {TremoloConfig} [tremolo]
     * @property {number|array} [panning]
     * @property {'equalpower'|'HRTF'} [panningModel]
     * @property {string} [rolloffFactor]
     * @property {ReverbConfig} [reverb]
     * @property {DelayConfig} [delay]
     *
     */
    /**
     * @param {WadConfig} arg
     */
    constructor(arg: {
        /**
         * - sine, square, sawtooth, triangle, or noise
         */
        source: 'sine' | 'square' | 'sawtooth' | 'triangle' | 'noise';
        /**
         * - From 0 to 1
         */
        volume?: number;
        pitch?: string | number;
        detune?: number;
        env?: {
            attack?: number;
            decay?: number;
            sustain?: number;
            hold?: number;
            release?: number;
        };
        destination?: object;
        offset?: number;
        loop?: boolean;
        tuna?: object;
        rate?: number;
        /**
         * - Each key is the name of a sprite. The value is a two-element array, containing the start and end time of that sprite, in seconds.
         */
        sprite?: object;
        filter?: {
            type?: 'lowpass' | 'highpass' | 'bandpass' | 'lowshelf' | 'highshelf' | 'peaking' | 'notch' | 'allpass';
            frequency?: number;
            q?: number;
            env?: {
                frequency?: number;
                attack?: number;
            };
        } | {
            type?: 'lowpass' | 'highpass' | 'bandpass' | 'lowshelf' | 'highshelf' | 'peaking' | 'notch' | 'allpass';
            frequency?: number;
            q?: number;
            env?: {
                frequency?: number;
                attack?: number;
            };
        }[];
        vibrato?: {
            shape?: 'sine' | 'sawtooth' | 'square' | 'triangle';
            magnitude?: number;
            speed?: number;
            attack?: number;
        };
        tremolo?: {
            shape?: 'sine' | 'sawtooth' | 'square' | 'triangle';
            magnitude?: number;
            speed?: number;
            attack?: number;
        };
        panning?: number | any[];
        panningModel?: 'equalpower' | 'HRTF';
        rolloffFactor?: string;
        reverb?: {
            wet?: number;
            impulse?: string;
        };
        delay?: {
            delayTime?: number;
            wet?: number;
            feedback?: number;
        };
    });
    /** Set basic Wad properties **/
    source: "sawtooth" | "sine" | "square" | "triangle" | "noise";
    destination: any;
    volume: any;
    defaultVolume: any;
    playable: number;
    pitch: any;
    gain: any[];
    detune: number;
    offset: number;
    loop: boolean;
    tuna: any;
    rate: number;
    sprite: any;
    env: {
        attack: any;
        decay: any; /**
         * @param {WadConfig} arg
         */
        sustain: any;
        hold: any;
        release: any;
    };
    defaultEnv: {
        attack: any;
        decay: any; /**
         * @param {WadConfig} arg
         */
        sustain: any;
        hold: any;
        release: any;
    };
    userSetHold: boolean;
    filter: any;
    vibrato: {
        shape: any;
        speed: any;
        magnitude: any;
        attack: any;
    };
    tremolo: {
        shape: any;
        speed: any;
        magnitude: any;
        attack: any;
    };
    panning: {
        location: number[];
        type: string;
        panningModel: string;
    } | {
        location: any;
        type?: undefined;
        panningModel?: undefined;
    } | {
        location: number;
        type: string;
        panningModel?: undefined;
    };
    delay: {
        delayTime: any;
        maxDelayTime: any;
        feedback: any;
        wet: any;
    };
    reverb: {
        wet: any;
    };
    duration: number;
    decodedBuffer: any;
    /** the play() method will create the various nodes that are required for this Wad to play,
    set properties on those nodes according to the constructor arguments and play() arguments,
    plug the nodes into each other with plugEmIn(),
    then finally play the sound by calling playEnv() **/
    /**
     * @typedef {object} PlayArgs
     * @property {number} [volume]
     * @property {number} [wait]
     * @property {boolean} [loop]
     * @property {number} [offset]
     * @property {number} [rate]
     * @property {string|number} [pitch]
     * @property {string} [label]
     * @property {Envelope} [env]
     * @property {number|array} [panning]
     * @property {FilterConfig|FilterConfig[]} [filter]
     * @property {DelayConfig} [delay]
     */
    /**
     * @param {PlayArgs} [arg]
     * @returns {promise}
     */
    play(arg?: {
        volume?: number;
        wait?: number;
        loop?: boolean;
        offset?: number;
        rate?: number;
        pitch?: string | number;
        label?: string;
        env?: {
            attack?: number;
            decay?: number;
            sustain?: number;
            hold?: number;
            release?: number;
        };
        panning?: number | any[];
        filter?: {
            type?: 'lowpass' | 'highpass' | 'bandpass' | 'lowshelf' | 'highshelf' | 'peaking' | 'notch' | 'allpass';
            frequency?: number;
            q?: number;
            env?: {
                frequency?: number;
                attack?: number;
            };
        } | {
            type?: 'lowpass' | 'highpass' | 'bandpass' | 'lowshelf' | 'highshelf' | 'peaking' | 'notch' | 'allpass';
            frequency?: number;
            q?: number;
            env?: {
                frequency?: number;
                attack?: number;
            };
        }[];
        delay?: {
            delayTime?: number;
            wet?: number;
            feedback?: number;
        };
    }): Promise<any>;
    playOnLoad: boolean;
    playOnLoadArg: {
        volume?: number;
        wait?: number;
        loop?: boolean;
        offset?: number;
        rate?: number;
        pitch?: string | number;
        label?: string;
        env?: {
            attack?: number;
            decay?: number;
            sustain?: number;
            hold?: number;
            release?: number;
        };
        panning?: number | any[];
        filter?: {
            type?: 'lowpass' | 'highpass' | 'bandpass' | 'lowshelf' | 'highshelf' | 'peaking' | 'notch' | 'allpass';
            frequency?: number;
            q?: number;
            env?: {
                frequency?: number;
                attack?: number;
            };
        } | {
            type?: 'lowpass' | 'highpass' | 'bandpass' | 'lowshelf' | 'highshelf' | 'peaking' | 'notch' | 'allpass';
            frequency?: number;
            q?: number;
            env?: {
                frequency?: number;
                attack?: number;
            };
        }[];
        delay?: {
            delayTime?: number;
            wet?: number;
            feedback?: number;
        };
    };
    nodes: any[];
    soundSource: any;
    lastPlayedTime: number;
    playPromise: any;
    /** Change the volume of a wad at any time, including during playback **/
    /**
     * @param {number} volume
     * @param {number} [timeConstant]
     * @param {string} [label]
     */
    setVolume(volume: number, timeConstant?: number, label?: string): Wad;
    reverse(): void;
    /**
    Change the playback rate of a Wad during playback.
    inputSpeed is a value of 0 < speed, and is the rate of playback of the audio.
    E.g. if input speed = 2.0, the playback will be twice as fast
    **/
    /**
     * @param {number} inputSpeed
     */
    setRate(inputSpeed: number): Wad;
    /**
     * @param {string|number} pitch
     * @param {number} [timeConstant]
     * @param {string} [label]
     */
    setPitch(pitch: string | number, timeConstant?: number, label?: string): Wad;
    /**
     * @param {number} detune
     * @param {number} [timeConstant]
     * @param {string} [label]
     */
    setDetune(detune: number, timeConstant?: number, label?: string): Wad;
    /** Change the panning of a Wad at any time, including during playback **/
    /**
     * @param {number|array} panning
     * @param {number} [timeConstant]
     */
    setPanning(panning: number | any[], timeConstant?: number): Wad;
    /**
    Change the Reverb of a Wad at any time, including during playback.
    inputWet is a value of 0 < wetness/gain < 1
    **/
    /**
     * @param {number} inputWet
     */
    setReverb(inputWet: number): Wad;
    /**
    Change the Delay of a Wad at any time, including during playback.
    inputTime is a value of time > 0, and is the time in seconds between each delayed playback.
    inputWet is a value of gain 0 < inputWet < 1, and is Relative volume change between the original sound and the first delayed playback.
    inputFeedback is a value of gain 0 < inputFeedback < 1, and is Relative volume change between each delayed playback and the next.
    **/
    /**
     * @param {number} delayTime
     * @param {number} wet
     * @param {number} feedback
     */
    setDelay(inputTime: any, inputWet: any, inputFeedback: any): Wad;
    /**
     * @param {string} [label]
     */
    pause(label?: string): void;
    pauseTime: any;
    /**
     * @param {PlayArgs} [args]
     */
    unpause(arg: any): void;
    /** If multiple instances of a sound are playing simultaneously, stop() only can stop the most recent one **/
    /**
     * @param {string} label
     */
    stop(label: string): void;
    /** Method to allow users to setup external fx in the constructor **/
    constructExternalFx(arg: any, context: any): void;
    /** To be overrided by the user **/
    setUpExternalFxOnPlay(arg: any, context: any): void;
}
declare namespace Wad {
    export { Poly };
    export const allWads: Wad[];
    export { context as audioContext };
    export const listener: AudioListener;
    export const tuna: any;
}
declare class Poly {
    /**
     * @typedef {object} CompressorConfig
     * @property {number} [attack]
     * @property {number} [knee]
     * @property {number} [ratio]
     * @property {number} [release]
     * @property {number} [threshold]
     */
    /**
     * @typedef {object} AudioMeterConfig
     * @property {number} [clipLevel]
     * @property {number} [averaging]
     * @property {number} [clipLag]
     */
    /**
     * @typedef {object} RecorderConfig
     * @property {object} options
     * @property {function} onstop
     */
    /**
     * @typedef {object} PolyWadConfig
     * @property {number} [volume] - From 0 to 1
     * @property {number|array} [panning]
     * @property {FilterConfig|FilterConfig[]} [filter]
     * @property {DelayConfig} [delay]
     * @property {ReverbConfig} [reverb]
     * @property {object} [destination]
     * @property {object} [tuna]
     * @property {AudioMeterConfig} [audioMeter]
     * @property {CompressorConfig} [compressor]
     * @property {RecorderConfig} [recorder]
     */
    /**
     * @param {PolyWadConfig} arg
     */
    constructor(arg: {
        /**
         * - From 0 to 1
         */
        volume?: number;
        panning?: number | any[];
        filter?: {
            type?: "allpass" | "bandpass" | "highpass" | "highshelf" | "lowpass" | "lowshelf" | "notch" | "peaking";
            frequency?: number;
            q?: number;
            env?: {
                frequency?: number;
                attack?: number;
            };
        } | {
            type?: "allpass" | "bandpass" | "highpass" | "highshelf" | "lowpass" | "lowshelf" | "notch" | "peaking";
            frequency?: number;
            q?: number;
            env?: {
                frequency?: number;
                attack?: number;
            };
        }[];
        delay?: {
            delayTime?: number;
            wet?: number;
            feedback?: number;
        };
        reverb?: {
            wet?: number;
            impulse?: string;
        };
        destination?: object;
        tuna?: object;
        audioMeter?: {
            clipLevel?: number;
            averaging?: number;
            clipLag?: number;
        };
        compressor?: {
            attack?: number;
            knee?: number;
            ratio?: number;
            release?: number;
            threshold?: number;
        };
        recorder?: {
            options: object;
            onstop: Function;
        };
    });
    /**
     * @param {Wad} wad
     */
    add(wad: Wad): void;
    /**
     * @param {Wad} wad
     */
    remove(wad: Wad): void;
    /**
     * @param {PlayArgs} [arg]
     */
    play(arg?: {
        volume?: number;
        wait?: number;
        loop?: boolean;
        offset?: number;
        rate?: number;
        pitch?: string | number;
        label?: string;
        env?: {
            attack?: number;
            decay?: number;
            sustain?: number;
            hold?: number;
            release?: number;
        };
        panning?: number | any[];
        filter?: {
            type?: "allpass" | "bandpass" | "highpass" | "highshelf" | "lowpass" | "lowshelf" | "notch" | "peaking";
            frequency?: number;
            q?: number;
            env?: {
                frequency?: number;
                attack?: number;
            };
        } | {
            type?: "allpass" | "bandpass" | "highpass" | "highshelf" | "lowpass" | "lowshelf" | "notch" | "peaking";
            frequency?: number;
            q?: number;
            env?: {
                frequency?: number;
                attack?: number;
            };
        }[];
        delay?: {
            delayTime?: number;
            wet?: number;
            feedback?: number;
        };
    }): void;
    /**
     * @param {string} [label]
     */
    stop(label?: string): void;
    /**
     * @param {number} volume
     */
    setVolume(volume: number): void;
    /**
     * @param {string|number} pitch
     */
    setPitch(pitch: string | number): void;
    /**
     * @param {string|number} pitch
     */
    setPanning(panning: any): void;
}
import { context } from "./common";
import AudioListener from "./audio_listener";
//# sourceMappingURL=wad.d.ts.map