export namespace logStats {
    const verbosity: number;
    const suppressedLogs: number;
}
export function logMessage(message: any, logLevel: any): void;
export let audioCache: {};
export let context: any;
/** Pre-render a noise buffer instead of generating noise on the fly. **/
export let noiseBuffer: any;
/** Set up the default ADSR envelope. **/
export function constructEnv(arg: any): {
    attack: any;
    decay: any;
    sustain: any;
    hold: any;
    release: any;
};
/** Set up the default filter and filter envelope. **/
export function constructFilter(arg: any): any;
/** If the Wad uses an audio file as the source, request it from the server,
or use a cached copy if available.
Don't let the Wad play until all necessary files have been downloaded. **/
export function requestAudioFile(that: any, callback: any): void;
/** Set up the vibrato LFO **/
export function constructVibrato(arg: any): {
    shape: any;
    speed: any;
    magnitude: any;
    attack: any;
};
/** Set up the tremolo LFO **/
export function constructTremolo(arg: any): {
    shape: any;
    speed: any;
    magnitude: any;
    attack: any;
};
export function constructReverb(that: any, arg: any): {
    wet: any;
};
export function constructPanning(arg: any): {
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
export function constructDelay(arg: any): {
    delayTime: any;
    maxDelayTime: any;
    feedback: any;
    wet: any;
};
export function constructCompressor(that: any, arg: any): void;
/** Special initialization and configuration for microphone Wads **/
export function getConsent(that: any, arg: any): any;
export namespace permissionsGranted {
    const micConsent: boolean;
}
export function setUpMic(that: any, arg: any): void;
/** Initialize and configure a panner node for playback **/
export function setUpPanningOnPlay(that: any, arg: any): void;
/** Initialize and configure a vibrato LFO Wad for playback **/
export function setUpVibratoOnPlay(that: any, arg: any, Wad: any): void;
/** Initialize and configure a tremolo LFO Wad for playback **/
export function setUpTremoloOnPlay(that: any, arg: any, Wad: any): void;
export function setUpDelayOnPlay(that: any, arg: any): void;
export function setUpTunaOnPlay(that: any, arg: any): void;
/** When all the nodes are set up for this Wad, this function plugs them into each other,
with special handling for nodes with custom interfaces (e.g. reverb, delay). **/
export function plugEmIn(that: any, arg: any): void;
/** Set the ADSR volume envelope according to play() arguments, or revert to defaults **/
export function setUpEnvOnPlay(that: any, arg: any): void;
export function setUpFilterOnPlay(that: any, arg: any): void;
/** Initialize and configure a convolver node for playback **/
export function setUpReverbOnPlay(that: any, arg: any): void;
/** When a note is played, these two functions will schedule changes in volume and filter frequency,
as specified by the volume envelope and filter envelope **/
export function filterEnv(wad: any, arg: any): void;
export function playEnv(wad: any, arg: any): void;
/** Initialize and configure an oscillator node **/
export function setUpOscillator(that: any, arg: any): void;
/** Set the filter and filter envelope according to play() arguments, or revert to defaults **/
export function createFilters(that: any, arg: any): void;
//# sourceMappingURL=common.d.ts.map