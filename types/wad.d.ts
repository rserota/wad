export default Wad;
export type Envelope = {
    attack?: number;
    decay?: number;
    sustain?: number;
    hold?: number;
    release?: number;
};
export type FilterConfig = {
    type?: 'lowpass' | 'highpass' | 'bandpass' | 'lowshelf' | 'highshelf' | 'peaking' | 'notch' | 'allpass';
    frequency?: number;
    q?: number;
    env?: FilterEnvConfig;
};
export type FilterEnvConfig = {
    frequency?: number;
    attack?: number;
};
export type WadConfig = {
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
    env?: Envelope;
    destination?: object;
    offset?: number;
    loop?: boolean;
    tuna?: object;
    rate?: number;
    /**
     * - Each key is the name of a sprite. The value is a two-element array, containing the start and end time of that sprite, in seconds.
     */
    sprite?: object;
    filter?: FilterConfig | FilterConfig[];
};
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
 *
 */
declare class Wad {
    static stopAll(label: any): void;
    static setVolume(volume: any): void;
    /**
     *
     * @param {WadConfig} arg
     */
    constructor(arg: WadConfig);
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
        decay: any;
        sustain: any;
        hold: any;
        release: any;
    };
    defaultEnv: {
        attack: any;
        decay: any;
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
    play(arg: any): any;
    playOnLoad: boolean;
    playOnLoadArg: any;
    nodes: any[];
    soundSource: any;
    lastPlayedTime: number;
    playPromise: any;
    /** Change the volume of a wad at any time, including during playback **/
    setVolume(volume: any, timeConstant: any, label: any): Wad;
    reverse(): void;
    /**
    Change the playback rate of a Wad during playback.
    inputSpeed is a value of 0 < speed, and is the rate of playback of the audio.
    E.g. if input speed = 2.0, the playback will be twice as fast
    **/
    setRate(inputSpeed: any): Wad;
    setPitch(pitch: any, timeConstant: any, label: any): Wad;
    setDetune(detune: any, timeConstant: any, label: any): Wad;
    /** Change the panning of a Wad at any time, including during playback **/
    setPanning(panning: any, timeConstant: any): Wad;
    /**
    Change the Reverb of a Wad at any time, including during playback.
    inputWet is a value of 0 < wetness/gain < 1
    **/
    setReverb(inputWet: any): Wad;
    /**
    Change the Delay of a Wad at any time, including during playback.
    inputTime is a value of time > 0, and is the time in seconds between each delayed playback.
    inputWet is a value of gain 0 < inputWet < 1, and is Relative volume change between the original sound and the first delayed playback.
    inputFeedback is a value of gain 0 < inputFeedback < 1, and is Relative volume change between each delayed playback and the next.
    **/
    setDelay(inputTime: any, inputWet: any, inputFeedback: any): Wad;
    pause(label: any): void;
    pauseTime: any;
    unpause(arg: any): void;
    /** If multiple instances of a sound are playing simultaneously, stop() only can stop the most recent one **/
    stop(label: any): void;
    /** Method to allow users to setup external fx in the constructor **/
    constructExternalFx(arg: any, context: any): void;
    /** To be overrided by the user **/
    setUpExternalFxOnPlay(arg: any, context: any): void;
}
declare namespace Wad {
    export const allWads: any[];
    export { context as audioContext };
    export const listener: AudioListener;
    export const tuna: any;
}
import { context } from "./common";
import AudioListener from "./audio_listener";
//# sourceMappingURL=wad.d.ts.map