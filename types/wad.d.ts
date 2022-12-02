export default Wad;
declare class Wad {
    /**
     * @param {string} [label] - Stop all currently playing wads, or all currently playing wads with a given label.
     */
    static stopAll(label?: string): void;
    /**
     * @param {number} volume - New volume setting for all wads.
     */
    static setVolume(volume: number): void;
    /**
     * @typedef {object} DelayConfig
     * @property {number} [delayTime] - Time in seconds between each delayed playback.
     * @property {number} [wet] - Relative volume change between the original sound and the first delayed playback.
     * @property {number} [feedback] - Relative volume change between each delayed playback and the next.
     */
    /**
     * @typedef {object} Envelope
     * @property {number} [attack] - Time in seconds from onset to peak volume. Common values for oscillators may range from 0.05 to 0.3.
     * @property {number} [decay] - Time in seconds from peak volume to sustain volume.
     * @property {number} [sustain] - Sustain volume level. This is a percent of the peak volume, so sensible values are between 0 and 1.
     * @property {number} [hold] - Time in seconds to maintain the sustain volume level. If set to -1, the sound will be sustained indefinitely until you manually call stop().
     * @property {number} [release] - Time in seconds from the end of the hold period to zero volume, or from calling stop() to zero volume.
     */
    /**
     * @typedef {object} FilterConfig
     * @property {'lowpass'|'highpass'|'bandpass'|'lowshelf'|'highshelf'|'peaking'|'notch'|'allpass'} [type] - Default is 'lowpass'
     * @property {number} [frequency] - The frequency, in hertz, to which the filter is applied.
     * @property {number} [q] - Q-factor. No one knows what this does. The default value is 1. Sensible values are from 0 to 10.
     * @property {FilterEnvConfig} [env] - The filter envelope.
     */
    /**
     * @typedef {object} FilterEnvConfig
     * @property {number} [frequency] - If this is set, filter frequency will slide from filter.frequency to filter.env.frequency when a note is triggered.
     * @property {number} [attack] - Time in seconds for the filter frequency to slide from filter.frequency to filter.env.frequency.
     */
    /**
     * @typedef {object} VibratoConfig
     * @property {'sine'|'sawtooth'|'square'|'triangle'} [shape] - Shape of the lfo waveform.
     * @property {number} [magnitude] - How much the pitch changes. Sensible values are from 1 to 10.
     * @property {number} [speed] - How quickly the pitch changes, in cycles per second. Sensible values are from 0.1 to 10.
     * @property {number} [attack] - Time in seconds for the vibrato effect to reach peak magnitude.
     */
    /**
     * @typedef {object} TremoloConfig
     * @property {'sine'|'sawtooth'|'square'|'triangle'} [shape] - Shape of the lfo waveform.
     * @property {number} [magnitude] - How much the volume changes. Sensible values are from 1 to 10.
     * @property {number} [speed] - How quickly the volume changes, in cycles per second. Sensible values are from 0.1 to 10.
     * @property {number} [attack] - Time in seconds for the tremolo effect to reach peak magnitude.
     */
    /**
     * @typedef {object} ReverbConfig
     * @property {number} [wet] - The volume of the reverberations.
     * @property {string} [impulse] - A URL for an impulse response file.
     */
    /**
     * @typedef {object} WadConfig
     * @property {'sine'|'square'|'sawtooth'|'triangle'|'noise'} source - sine, square, sawtooth, triangle, or noise
     * @property {number} [volume] - From 0 to 1
     * @property {string|number} [pitch] - Set a default pitch on the constructor if you don't want to set the pitch on play(). Pass in a string like 'c#3' to play a specific pitch, or pass in a number to play that frequency, in hertz.
     * @property {number} [detune] - Detune is measured in cents. 100 cents is equal to 1 semitone.
     * @property {Envelope} [env]- A set of parameters that describes how a sound's volume changes over time.
     * @property {object} [destination] - The last node the sound is routed to.
     * @property {number} [offset] - Where in the audio clip playback begins, measured in seconds from the start of the audio clip.
     * @property {boolean} [loop] - If true, the audio will loop. This parameter only works for audio clips, and does nothing for oscillators.
     * @property {object} [tuna] - Add effects from Tuna.js to this wad. Check out the Tuna.js documentation for more information.
     * @property {number} [rate] - Where in the audio clip playback begins, measured in seconds from the start of the audio clip.
     * @property {object} [sprite] - Each key is the name of a sprite. The value is a two-element array, containing the start and end time of that sprite, in seconds.
     * @property {FilterConfig|FilterConfig[]} [filter] - Pass an object to add a filter to this wad, or pass an array of objects to add multiple filters to this wad.
     * @property {VibratoConfig} [vibrato] - A vibrating pitch effect. Only works for oscillators.
     * @property {TremoloConfig} [tremolo] - A vibrating volume effect.
     * @property {number|array} [panning] - Placement of the sound source. Pass in a number to use stereo panning, or pass in a 3-element array to use 3D panning. Note that some browsers do not support stereo panning.
     * @property {'equalpower'|'HRTF'} [panningModel] - Defaults to 'equalpower'
     * @property {string} [rolloffFactor]
     * @property {ReverbConfig} [reverb] - Add reverb to this wad.
     * @property {DelayConfig} [delay] - Add delay to this wad.
     * @property {boolean} [useCache] - If false, the audio will be requested from the source URL without checking the audioCache.
     *
     */
    /**
     * @param {WadConfig} arg - One big object.
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
        /**
         * - Set a default pitch on the constructor if you don't want to set the pitch on play(). Pass in a string like 'c#3' to play a specific pitch, or pass in a number to play that frequency, in hertz.
         */
        pitch?: string | number;
        /**
         * - Detune is measured in cents. 100 cents is equal to 1 semitone.
         */
        detune?: number;
        /**
         * - A set of parameters that describes how a sound's volume changes over time.
         */
        env?: {
            /**
             * - Time in seconds from onset to peak volume. Common values for oscillators may range from 0.05 to 0.3.
             */
            attack?: number;
            /**
             * - Time in seconds from peak volume to sustain volume.
             */
            decay?: number;
            /**
             * - Sustain volume level. This is a percent of the peak volume, so sensible values are between 0 and 1.
             */
            sustain?: number;
            /**
             * - Time in seconds to maintain the sustain volume level. If set to -1, the sound will be sustained indefinitely until you manually call stop().
             */
            hold?: number;
            /**
             * - Time in seconds from the end of the hold period to zero volume, or from calling stop() to zero volume.
             */
            release?: number;
        };
        /**
         * - The last node the sound is routed to.
         */
        destination?: object;
        /**
         * - Where in the audio clip playback begins, measured in seconds from the start of the audio clip.
         */
        offset?: number;
        /**
         * - If true, the audio will loop. This parameter only works for audio clips, and does nothing for oscillators.
         */
        loop?: boolean;
        /**
         * - Add effects from Tuna.js to this wad. Check out the Tuna.js documentation for more information.
         */
        tuna?: object;
        /**
         * - Where in the audio clip playback begins, measured in seconds from the start of the audio clip.
         */
        rate?: number;
        /**
         * - Each key is the name of a sprite. The value is a two-element array, containing the start and end time of that sprite, in seconds.
         */
        sprite?: object;
        /**
         * - Pass an object to add a filter to this wad, or pass an array of objects to add multiple filters to this wad.
         */
        filter?: {
            /**
             * - Default is 'lowpass'
             */
            type?: 'lowpass' | 'highpass' | 'bandpass' | 'lowshelf' | 'highshelf' | 'peaking' | 'notch' | 'allpass';
            /**
             * - The frequency, in hertz, to which the filter is applied.
             */
            frequency?: number;
            /**
             * - Q-factor. No one knows what this does. The default value is 1. Sensible values are from 0 to 10.
             */
            q?: number;
            /**
             * - The filter envelope.
             */
            env?: {
                /**
                 * - If this is set, filter frequency will slide from filter.frequency to filter.env.frequency when a note is triggered.
                 */
                frequency?: number;
                /**
                 * - Time in seconds for the filter frequency to slide from filter.frequency to filter.env.frequency.
                 */
                attack?: number;
            };
        } | {
            /**
             * - Default is 'lowpass'
             */
            type?: 'lowpass' | 'highpass' | 'bandpass' | 'lowshelf' | 'highshelf' | 'peaking' | 'notch' | 'allpass';
            /**
             * - The frequency, in hertz, to which the filter is applied.
             */
            frequency?: number;
            /**
             * - Q-factor. No one knows what this does. The default value is 1. Sensible values are from 0 to 10.
             */
            q?: number;
            /**
             * - The filter envelope.
             */
            env?: {
                /**
                 * - If this is set, filter frequency will slide from filter.frequency to filter.env.frequency when a note is triggered.
                 */
                frequency?: number;
                /**
                 * - Time in seconds for the filter frequency to slide from filter.frequency to filter.env.frequency.
                 */
                attack?: number;
            };
        }[];
        /**
         * - A vibrating pitch effect. Only works for oscillators.
         */
        vibrato?: {
            /**
             * - Shape of the lfo waveform.
             */
            shape?: 'sine' | 'sawtooth' | 'square' | 'triangle';
            /**
             * - How much the pitch changes. Sensible values are from 1 to 10.
             */
            magnitude?: number;
            /**
             * - How quickly the pitch changes, in cycles per second. Sensible values are from 0.1 to 10.
             */
            speed?: number;
            /**
             * - Time in seconds for the vibrato effect to reach peak magnitude.
             */
            attack?: number;
        };
        /**
         * - A vibrating volume effect.
         */
        tremolo?: {
            /**
             * - Shape of the lfo waveform.
             */
            shape?: 'sine' | 'sawtooth' | 'square' | 'triangle';
            /**
             * - How much the volume changes. Sensible values are from 1 to 10.
             */
            magnitude?: number;
            /**
             * - How quickly the volume changes, in cycles per second. Sensible values are from 0.1 to 10.
             */
            speed?: number;
            /**
             * - Time in seconds for the tremolo effect to reach peak magnitude.
             */
            attack?: number;
        };
        /**
         * - Placement of the sound source. Pass in a number to use stereo panning, or pass in a 3-element array to use 3D panning. Note that some browsers do not support stereo panning.
         */
        panning?: number | any[];
        /**
         * - Defaults to 'equalpower'
         */
        panningModel?: 'equalpower' | 'HRTF';
        rolloffFactor?: string;
        /**
         * - Add reverb to this wad.
         */
        reverb?: {
            /**
             * - The volume of the reverberations.
             */
            wet?: number;
            /**
             * - A URL for an impulse response file.
             */
            impulse?: string;
        };
        /**
         * - Add delay to this wad.
         */
        delay?: {
            /**
             * - Time in seconds between each delayed playback.
             */
            delayTime?: number;
            /**
             * - Relative volume change between the original sound and the first delayed playback.
             */
            wet?: number;
            /**
             * - Relative volume change between each delayed playback and the next.
             */
            feedback?: number;
        };
        /**
         * - If false, the audio will be requested from the source URL without checking the audioCache.
         */
        useCache?: boolean;
    });
    /** Set basic Wad properties **/
    source: "sawtooth" | "sine" | "square" | "triangle" | "noise";
    useCache: any;
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
        /**
         * @typedef {object} TremoloConfig
         * @property {'sine'|'sawtooth'|'square'|'triangle'} [shape] - Shape of the lfo waveform.
         * @property {number} [magnitude] - How much the volume changes. Sensible values are from 1 to 10.
         * @property {number} [speed] - How quickly the volume changes, in cycles per second. Sensible values are from 0.1 to 10.
         * @property {number} [attack] - Time in seconds for the tremolo effect to reach peak magnitude.
         */
        /**
         * @typedef {object} ReverbConfig
         * @property {number} [wet] - The volume of the reverberations.
         * @property {string} [impulse] - A URL for an impulse response file.
         */
        /**
         * @typedef {object} WadConfig
         * @property {'sine'|'square'|'sawtooth'|'triangle'|'noise'} source - sine, square, sawtooth, triangle, or noise
         * @property {number} [volume] - From 0 to 1
         * @property {string|number} [pitch] - Set a default pitch on the constructor if you don't want to set the pitch on play(). Pass in a string like 'c#3' to play a specific pitch, or pass in a number to play that frequency, in hertz.
         * @property {number} [detune] - Detune is measured in cents. 100 cents is equal to 1 semitone.
         * @property {Envelope} [env]- A set of parameters that describes how a sound's volume changes over time.
         * @property {object} [destination] - The last node the sound is routed to.
         * @property {number} [offset] - Where in the audio clip playback begins, measured in seconds from the start of the audio clip.
         * @property {boolean} [loop] - If true, the audio will loop. This parameter only works for audio clips, and does nothing for oscillators.
         * @property {object} [tuna] - Add effects from Tuna.js to this wad. Check out the Tuna.js documentation for more information.
         * @property {number} [rate] - Where in the audio clip playback begins, measured in seconds from the start of the audio clip.
         * @property {object} [sprite] - Each key is the name of a sprite. The value is a two-element array, containing the start and end time of that sprite, in seconds.
         * @property {FilterConfig|FilterConfig[]} [filter] - Pass an object to add a filter to this wad, or pass an array of objects to add multiple filters to this wad.
         * @property {VibratoConfig} [vibrato] - A vibrating pitch effect. Only works for oscillators.
         * @property {TremoloConfig} [tremolo] - A vibrating volume effect.
         * @property {number|array} [panning] - Placement of the sound source. Pass in a number to use stereo panning, or pass in a 3-element array to use 3D panning. Note that some browsers do not support stereo panning.
         * @property {'equalpower'|'HRTF'} [panningModel] - Defaults to 'equalpower'
         * @property {string} [rolloffFactor]
         * @property {ReverbConfig} [reverb] - Add reverb to this wad.
         * @property {DelayConfig} [delay] - Add delay to this wad.
         * @property {boolean} [useCache] - If false, the audio will be requested from the source URL without checking the audioCache.
         *
         */
        /**
         * @param {WadConfig} arg - One big object.
         */
        hold: any;
        release: any;
    };
    defaultEnv: {
        attack: any;
        decay: any;
        sustain: any;
        /**
         * @typedef {object} TremoloConfig
         * @property {'sine'|'sawtooth'|'square'|'triangle'} [shape] - Shape of the lfo waveform.
         * @property {number} [magnitude] - How much the volume changes. Sensible values are from 1 to 10.
         * @property {number} [speed] - How quickly the volume changes, in cycles per second. Sensible values are from 0.1 to 10.
         * @property {number} [attack] - Time in seconds for the tremolo effect to reach peak magnitude.
         */
        /**
         * @typedef {object} ReverbConfig
         * @property {number} [wet] - The volume of the reverberations.
         * @property {string} [impulse] - A URL for an impulse response file.
         */
        /**
         * @typedef {object} WadConfig
         * @property {'sine'|'square'|'sawtooth'|'triangle'|'noise'} source - sine, square, sawtooth, triangle, or noise
         * @property {number} [volume] - From 0 to 1
         * @property {string|number} [pitch] - Set a default pitch on the constructor if you don't want to set the pitch on play(). Pass in a string like 'c#3' to play a specific pitch, or pass in a number to play that frequency, in hertz.
         * @property {number} [detune] - Detune is measured in cents. 100 cents is equal to 1 semitone.
         * @property {Envelope} [env]- A set of parameters that describes how a sound's volume changes over time.
         * @property {object} [destination] - The last node the sound is routed to.
         * @property {number} [offset] - Where in the audio clip playback begins, measured in seconds from the start of the audio clip.
         * @property {boolean} [loop] - If true, the audio will loop. This parameter only works for audio clips, and does nothing for oscillators.
         * @property {object} [tuna] - Add effects from Tuna.js to this wad. Check out the Tuna.js documentation for more information.
         * @property {number} [rate] - Where in the audio clip playback begins, measured in seconds from the start of the audio clip.
         * @property {object} [sprite] - Each key is the name of a sprite. The value is a two-element array, containing the start and end time of that sprite, in seconds.
         * @property {FilterConfig|FilterConfig[]} [filter] - Pass an object to add a filter to this wad, or pass an array of objects to add multiple filters to this wad.
         * @property {VibratoConfig} [vibrato] - A vibrating pitch effect. Only works for oscillators.
         * @property {TremoloConfig} [tremolo] - A vibrating volume effect.
         * @property {number|array} [panning] - Placement of the sound source. Pass in a number to use stereo panning, or pass in a 3-element array to use 3D panning. Note that some browsers do not support stereo panning.
         * @property {'equalpower'|'HRTF'} [panningModel] - Defaults to 'equalpower'
         * @property {string} [rolloffFactor]
         * @property {ReverbConfig} [reverb] - Add reverb to this wad.
         * @property {DelayConfig} [delay] - Add delay to this wad.
         * @property {boolean} [useCache] - If false, the audio will be requested from the source URL without checking the audioCache.
         *
         */
        /**
         * @param {WadConfig} arg - One big object.
         */
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
     * @property {number} [volume] - This overrides the value for volume passed to the constructor, if it was set.
     * @property {number} [wait] - Time in seconds between calling play() and actually triggering the note.
     * @property {boolean} [loop] - This overrides the value for loop passed to the constructor, if it was set.
     * @property {number} [offset] - This overrides the value for offset passed to the constructor, if it was set.
     * @property {number} [rate] - This overrides the value for rate passed to the constructor, if it was set.
     * @property {string|number} [pitch] - This overrides the value for pitch passed to the constructor, if it was set.
     * @property {string} [label] - A label that identifies this note.
     * @property {Envelope} [env] - This overrides the values for the envelope passed to the constructor, if it was set.
     * @property {number|array} [panning] - This overrides the value for panning passed to the constructor.
     * @property {FilterConfig|FilterConfig[]} [filter] - This overrides the values for filters passed to the constructor.
     * @property {DelayConfig} [delay] - This overrides the values for delay passed to the constructor, if it was set.
     */
    /**
     * @param {PlayArgs} [arg]
     * @returns {promise}
     */
    play(arg?: {
        /**
         * - This overrides the value for volume passed to the constructor, if it was set.
         */
        volume?: number;
        /**
         * - Time in seconds between calling play() and actually triggering the note.
         */
        wait?: number;
        /**
         * - This overrides the value for loop passed to the constructor, if it was set.
         */
        loop?: boolean;
        /**
         * - This overrides the value for offset passed to the constructor, if it was set.
         */
        offset?: number;
        /**
         * - This overrides the value for rate passed to the constructor, if it was set.
         */
        rate?: number;
        /**
         * - This overrides the value for pitch passed to the constructor, if it was set.
         */
        pitch?: string | number;
        /**
         * - A label that identifies this note.
         */
        label?: string;
        /**
         * - This overrides the values for the envelope passed to the constructor, if it was set.
         */
        env?: {
            /**
             * - Time in seconds from onset to peak volume. Common values for oscillators may range from 0.05 to 0.3.
             */
            attack?: number;
            /**
             * - Time in seconds from peak volume to sustain volume.
             */
            decay?: number;
            /**
             * - Sustain volume level. This is a percent of the peak volume, so sensible values are between 0 and 1.
             */
            sustain?: number;
            /**
             * - Time in seconds to maintain the sustain volume level. If set to -1, the sound will be sustained indefinitely until you manually call stop().
             */
            hold?: number;
            /**
             * - Time in seconds from the end of the hold period to zero volume, or from calling stop() to zero volume.
             */
            release?: number;
        };
        /**
         * - This overrides the value for panning passed to the constructor.
         */
        panning?: number | any[];
        /**
         * - This overrides the values for filters passed to the constructor.
         */
        filter?: {
            /**
             * - Default is 'lowpass'
             */
            type?: 'lowpass' | 'highpass' | 'bandpass' | 'lowshelf' | 'highshelf' | 'peaking' | 'notch' | 'allpass';
            /**
             * - The frequency, in hertz, to which the filter is applied.
             */
            frequency?: number;
            /**
             * - Q-factor. No one knows what this does. The default value is 1. Sensible values are from 0 to 10.
             */
            q?: number;
            /**
             * - The filter envelope.
             */
            env?: {
                /**
                 * - If this is set, filter frequency will slide from filter.frequency to filter.env.frequency when a note is triggered.
                 */
                frequency?: number;
                /**
                 * - Time in seconds for the filter frequency to slide from filter.frequency to filter.env.frequency.
                 */
                attack?: number;
            };
        } | {
            /**
             * - Default is 'lowpass'
             */
            type?: 'lowpass' | 'highpass' | 'bandpass' | 'lowshelf' | 'highshelf' | 'peaking' | 'notch' | 'allpass';
            /**
             * - The frequency, in hertz, to which the filter is applied.
             */
            frequency?: number;
            /**
             * - Q-factor. No one knows what this does. The default value is 1. Sensible values are from 0 to 10.
             */
            q?: number;
            /**
             * - The filter envelope.
             */
            env?: {
                /**
                 * - If this is set, filter frequency will slide from filter.frequency to filter.env.frequency when a note is triggered.
                 */
                frequency?: number;
                /**
                 * - Time in seconds for the filter frequency to slide from filter.frequency to filter.env.frequency.
                 */
                attack?: number;
            };
        }[];
        /**
         * - This overrides the values for delay passed to the constructor, if it was set.
         */
        delay?: {
            /**
             * - Time in seconds between each delayed playback.
             */
            delayTime?: number;
            /**
             * - Relative volume change between the original sound and the first delayed playback.
             */
            wet?: number;
            /**
             * - Relative volume change between each delayed playback and the next.
             */
            feedback?: number;
        };
    }): Promise<any>;
    playOnLoad: boolean;
    playOnLoadArg: {
        /**
         * - This overrides the value for volume passed to the constructor, if it was set.
         */
        volume?: number;
        /**
         * - Time in seconds between calling play() and actually triggering the note.
         */
        wait?: number;
        /**
         * - This overrides the value for loop passed to the constructor, if it was set.
         */
        loop?: boolean;
        /**
         * - This overrides the value for offset passed to the constructor, if it was set.
         */
        offset?: number;
        /**
         * - This overrides the value for rate passed to the constructor, if it was set.
         */
        rate?: number;
        /**
         * - This overrides the value for pitch passed to the constructor, if it was set.
         */
        pitch?: string | number;
        /**
         * - A label that identifies this note.
         */
        label?: string;
        /**
         * - This overrides the values for the envelope passed to the constructor, if it was set.
         */
        env?: {
            /**
             * - Time in seconds from onset to peak volume. Common values for oscillators may range from 0.05 to 0.3.
             */
            attack?: number;
            /**
             * - Time in seconds from peak volume to sustain volume.
             */
            decay?: number;
            /**
             * - Sustain volume level. This is a percent of the peak volume, so sensible values are between 0 and 1.
             */
            sustain?: number;
            /**
             * - Time in seconds to maintain the sustain volume level. If set to -1, the sound will be sustained indefinitely until you manually call stop().
             */
            hold?: number;
            /**
             * - Time in seconds from the end of the hold period to zero volume, or from calling stop() to zero volume.
             */
            release?: number;
        };
        /**
         * - This overrides the value for panning passed to the constructor.
         */
        panning?: number | any[];
        /**
         * - This overrides the values for filters passed to the constructor.
         */
        filter?: {
            /**
             * - Default is 'lowpass'
             */
            type?: 'lowpass' | 'highpass' | 'bandpass' | 'lowshelf' | 'highshelf' | 'peaking' | 'notch' | 'allpass';
            /**
             * - The frequency, in hertz, to which the filter is applied.
             */
            frequency?: number;
            /**
             * - Q-factor. No one knows what this does. The default value is 1. Sensible values are from 0 to 10.
             */
            q?: number;
            /**
             * - The filter envelope.
             */
            env?: {
                /**
                 * - If this is set, filter frequency will slide from filter.frequency to filter.env.frequency when a note is triggered.
                 */
                frequency?: number;
                /**
                 * - Time in seconds for the filter frequency to slide from filter.frequency to filter.env.frequency.
                 */
                attack?: number;
            };
        } | {
            /**
             * - Default is 'lowpass'
             */
            type?: 'lowpass' | 'highpass' | 'bandpass' | 'lowshelf' | 'highshelf' | 'peaking' | 'notch' | 'allpass';
            /**
             * - The frequency, in hertz, to which the filter is applied.
             */
            frequency?: number;
            /**
             * - Q-factor. No one knows what this does. The default value is 1. Sensible values are from 0 to 10.
             */
            q?: number;
            /**
             * - The filter envelope.
             */
            env?: {
                /**
                 * - If this is set, filter frequency will slide from filter.frequency to filter.env.frequency when a note is triggered.
                 */
                frequency?: number;
                /**
                 * - Time in seconds for the filter frequency to slide from filter.frequency to filter.env.frequency.
                 */
                attack?: number;
            };
        }[];
        /**
         * - This overrides the values for delay passed to the constructor, if it was set.
         */
        delay?: {
            /**
             * - Time in seconds between each delayed playback.
             */
            delayTime?: number;
            /**
             * - Relative volume change between the original sound and the first delayed playback.
             */
            wet?: number;
            /**
             * - Relative volume change between each delayed playback and the next.
             */
            feedback?: number;
        };
    };
    nodes: any[];
    soundSource: any;
    lastPlayedTime: number;
    playPromise: any;
    /** Change the volume of a wad at any time, including during playback **/
    /**
     * @param {number} volume - New volume setting.
     * @param {number} [timeConstant] - Time in seconds for 63% of the transition to complete.
     * @param {string} [label] - If you want to apply this change to a note playing from this wad that is not the most recently triggered note, you can pass in the label of the notes you want to stop.
     * @returns {Wad}
     */
    setVolume(volume: number, timeConstant?: number, label?: string): Wad;
    reverse(): void;
    /**
    Change the playback rate of a Wad during playback.
    inputSpeed is a value of 0 < speed, and is the rate of playback of the audio.
    E.g. if input speed = 2.0, the playback will be twice as fast
    **/
    /**
     * @param {number} inputSpeed - The new rate setting.
     * @returns {Wad}
     */
    setRate(inputSpeed: number): Wad;
    /**
     * @param {string|number} pitch - The new pitch setting.
     * @param {number} [timeConstant] - Time in seconds for 63% of the transition to complete.
     * @param {string} [label] - If you want to apply this change to a note playing from this wad that is not the most recently triggered note, you can pass in the label of the notes you want to affect.
     * @returns {Wad}
     */
    setPitch(pitch: string | number, timeConstant?: number, label?: string): Wad;
    /**
     * @param {number} detune - The new detune setting
     * @param {number} [timeConstant] - Time in seconds for 63% of the transition to complete.
     * @param {string} [label] - If you want to apply this change to a note playing from this wad that is not the most recently triggered note, you can pass in the label of the notes you want to affect.
     * @returns {Wad}
     */
    setDetune(detune: number, timeConstant?: number, label?: string): Wad;
    /** Change the panning of a Wad at any time, including during playback **/
    /**
     * @param {number|array} panning - The new panning setting.
     * @param {number} [timeConstant] - Time in seconds for 63% of the transition to complete.
     * @returns {Wad}
     */
    setPanning(panning: number | any[], timeConstant?: number): Wad;
    /**
    Change the Reverb of a Wad at any time, including during playback.
    inputWet is a value of 0 < wetness/gain < 1
    **/
    /**
     * @param {number} inputWet - The new wet setting for the reverb.
     * @returns {Wad}
     */
    setReverb(inputWet: number): Wad;
    /**
    Change the Delay of a Wad at any time, including during playback.
    inputTime is a value of time > 0, and is the time in seconds between each delayed playback.
    inputWet is a value of gain 0 < inputWet < 1, and is Relative volume change between the original sound and the first delayed playback.
    inputFeedback is a value of gain 0 < inputFeedback < 1, and is Relative volume change between each delayed playback and the next.
    **/
    /**
     * @param {number} delayTime - The new delayTime setting.
     * @param {number} wet - The new wet setting.
     * @param {number} feedback - The new feedback setting.
     * @returns {Wad}
     */
    setDelay(inputTime: any, inputWet: any, inputFeedback: any): Wad;
    /**
     * @param {string} [label] - If you want to pause a note playing from this wad that is not the most recently triggered note, you can pass in the label of the notes you want to pause.
     */
    pause(label?: string): void;
    pauseTime: any;
    /**
     * @param {PlayArgs} [args] - The same args as play()
     */
    unpause(arg: any): void;
    /** If multiple instances of a sound are playing simultaneously, stop() only can stop the most recent one **/
    /**
     * @param {string} [label] - If you want to stop a note playing from this wad that is not the most recently triggered note, you can pass in the label of the notes you want to stop.
     */
    stop(label?: string): void;
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
     * @property {number} [attack] - The amount of time, in seconds, to reduce the gain by 10dB. This parameter ranges from 0 to 1.
     * @property {number} [knee] - A decibel value representing the range above the threshold where the curve smoothly transitions to the "ratio" portion. This parameter ranges from 0 to 40.
     * @property {number} [ratio] - The amount of dB change in input for a 1 dB change in output. This parameter ranges from 1 to 20.
     * @property {number} [release] - The amount of time (in seconds) to increase the gain by 10dB. This parameter ranges from 0 to 1.
     * @property {number} [threshold] - The decibel value above which the compression will start taking effect. This parameter ranges from -100 to 0.
     */
    /**
     * @typedef {object} AudioMeterConfig
     * @property {number} [clipLevel] - the level (0 to 1) that you would consider "clipping".
     * @property {number} [averaging] - how "smoothed" you would like the meter to be over time. Should be between 0 and less than 1.
     * @property {number} [clipLag] - how long you would like the "clipping" indicator to show after clipping has occured, in milliseconds.
     */
    /**
     * @typedef {object} RecorderConfig
     * @property {object} options - The options passed to the MediaRecorder constructor.
     * @property {function} onstop - The callback used to handle the onstop event from the MediaRecorder.
     */
    /**
     * @typedef {object} PolyWadConfig
     * @property {number} [volume] - From 0 to 1
     * @property {number|array} [panning] - The default panning for this polywad.
     * @property {FilterConfig|FilterConfig[]} [filter] - Filter(s) applied to this polywad.
     * @property {DelayConfig} [delay] - Delay applied to this polywad.
     * @property {ReverbConfig} [reverb] - Reverb applied to this polywad.
     * @property {object} [destination]
     * @property {object} [tuna] - Tuna effects applied to this polywad. Check out the tuna docs for more info.
     * @property {AudioMeterConfig} [audioMeter] - Add a volume meter to this polywad that tells you if it's clipping.
     * @property {CompressorConfig} [compressor] - Add a compressor to this polywad.
     * @property {RecorderConfig} [recorder] - Record the output of this polywad to a buffer or a file.
     */
    /**
     * @param {PolyWadConfig} arg
     */
    constructor(arg: {
        /**
         * - From 0 to 1
         */
        volume?: number;
        /**
         * - The default panning for this polywad.
         */
        panning?: number | any[];
        /**
         * - Filter(s) applied to this polywad.
         */
        filter?: {
            /**
             * - Default is 'lowpass'
             */
            type?: "allpass" | "bandpass" | "highpass" | "highshelf" | "lowpass" | "lowshelf" | "notch" | "peaking";
            /**
             * - The frequency, in hertz, to which the filter is applied.
             */
            frequency?: number;
            /**
             * - Q-factor. No one knows what this does. The default value is 1. Sensible values are from 0 to 10.
             */
            q?: number;
            /**
             * - The filter envelope.
             */
            env?: {
                /**
                 * - If this is set, filter frequency will slide from filter.frequency to filter.env.frequency when a note is triggered.
                 */
                frequency?: number;
                /**
                 * - Time in seconds for the filter frequency to slide from filter.frequency to filter.env.frequency.
                 */
                attack?: number;
            };
        } | {
            /**
             * - Default is 'lowpass'
             */
            type?: "allpass" | "bandpass" | "highpass" | "highshelf" | "lowpass" | "lowshelf" | "notch" | "peaking";
            /**
             * - The frequency, in hertz, to which the filter is applied.
             */
            frequency?: number;
            /**
             * - Q-factor. No one knows what this does. The default value is 1. Sensible values are from 0 to 10.
             */
            q?: number;
            /**
             * - The filter envelope.
             */
            env?: {
                /**
                 * - If this is set, filter frequency will slide from filter.frequency to filter.env.frequency when a note is triggered.
                 */
                frequency?: number;
                /**
                 * - Time in seconds for the filter frequency to slide from filter.frequency to filter.env.frequency.
                 */
                attack?: number;
            };
        }[];
        /**
         * - Delay applied to this polywad.
         */
        delay?: {
            /**
             * - Time in seconds between each delayed playback.
             */
            delayTime?: number;
            /**
             * - Relative volume change between the original sound and the first delayed playback.
             */
            wet?: number;
            /**
             * - Relative volume change between each delayed playback and the next.
             */
            feedback?: number;
        };
        /**
         * - Reverb applied to this polywad.
         */
        reverb?: {
            /**
             * - The volume of the reverberations.
             */
            wet?: number;
            /**
             * - A URL for an impulse response file.
             */
            impulse?: string;
        };
        destination?: object;
        /**
         * - Tuna effects applied to this polywad. Check out the tuna docs for more info.
         */
        tuna?: object;
        /**
         * - Add a volume meter to this polywad that tells you if it's clipping.
         */
        audioMeter?: {
            /**
             * - the level (0 to 1) that you would consider "clipping".
             */
            clipLevel?: number;
            /**
             * - how "smoothed" you would like the meter to be over time. Should be between 0 and less than 1.
             */
            averaging?: number;
            /**
             * - how long you would like the "clipping" indicator to show after clipping has occured, in milliseconds.
             */
            clipLag?: number;
        };
        /**
         * - Add a compressor to this polywad.
         */
        compressor?: {
            /**
             * - The amount of time, in seconds, to reduce the gain by 10dB. This parameter ranges from 0 to 1.
             */
            attack?: number;
            /**
             * - A decibel value representing the range above the threshold where the curve smoothly transitions to the "ratio" portion. This parameter ranges from 0 to 40.
             */
            knee?: number;
            /**
             * - The amount of dB change in input for a 1 dB change in output. This parameter ranges from 1 to 20.
             */
            ratio?: number;
            /**
             * - The amount of time (in seconds) to increase the gain by 10dB. This parameter ranges from 0 to 1.
             */
            release?: number;
            /**
             * - The decibel value above which the compression will start taking effect. This parameter ranges from -100 to 0.
             */
            threshold?: number;
        };
        /**
         * - Record the output of this polywad to a buffer or a file.
         */
        recorder?: {
            /**
             * - The options passed to the MediaRecorder constructor.
             */
            options: object;
            /**
             * - The callback used to handle the onstop event from the MediaRecorder.
             */
            onstop: Function;
        };
    });
    /**
     * @param {Wad} wad - The wad or polywad to add.
     */
    add(wad: Wad): void;
    /**
     * @param {Wad} wad - The wad or polywad to remove.
     */
    remove(wad: Wad): void;
    /**
     * @param {PlayArgs} [arg] - Same arguments as Wad.prototype.play()
     */
    play(arg?: {
        /**
         * - This overrides the value for volume passed to the constructor, if it was set.
         */
        volume?: number;
        /**
         * - Time in seconds between calling play() and actually triggering the note.
         */
        wait?: number;
        /**
         * - This overrides the value for loop passed to the constructor, if it was set.
         */
        loop?: boolean;
        /**
         * - This overrides the value for offset passed to the constructor, if it was set.
         */
        offset?: number;
        /**
         * - This overrides the value for rate passed to the constructor, if it was set.
         */
        rate?: number;
        /**
         * - This overrides the value for pitch passed to the constructor, if it was set.
         */
        pitch?: string | number;
        /**
         * - A label that identifies this note.
         */
        label?: string;
        /**
         * - This overrides the values for the envelope passed to the constructor, if it was set.
         */
        env?: {
            /**
             * - Time in seconds from onset to peak volume. Common values for oscillators may range from 0.05 to 0.3.
             */
            attack?: number;
            /**
             * - Time in seconds from peak volume to sustain volume.
             */
            decay?: number;
            /**
             * - Sustain volume level. This is a percent of the peak volume, so sensible values are between 0 and 1.
             */
            sustain?: number;
            /**
             * - Time in seconds to maintain the sustain volume level. If set to -1, the sound will be sustained indefinitely until you manually call stop().
             */
            hold?: number;
            /**
             * - Time in seconds from the end of the hold period to zero volume, or from calling stop() to zero volume.
             */
            release?: number;
        };
        /**
         * - This overrides the value for panning passed to the constructor.
         */
        panning?: number | any[];
        /**
         * - This overrides the values for filters passed to the constructor.
         */
        filter?: {
            /**
             * - Default is 'lowpass'
             */
            type?: "allpass" | "bandpass" | "highpass" | "highshelf" | "lowpass" | "lowshelf" | "notch" | "peaking";
            /**
             * - The frequency, in hertz, to which the filter is applied.
             */
            frequency?: number;
            /**
             * - Q-factor. No one knows what this does. The default value is 1. Sensible values are from 0 to 10.
             */
            q?: number;
            /**
             * - The filter envelope.
             */
            env?: {
                /**
                 * - If this is set, filter frequency will slide from filter.frequency to filter.env.frequency when a note is triggered.
                 */
                frequency?: number;
                /**
                 * - Time in seconds for the filter frequency to slide from filter.frequency to filter.env.frequency.
                 */
                attack?: number;
            };
        } | {
            /**
             * - Default is 'lowpass'
             */
            type?: "allpass" | "bandpass" | "highpass" | "highshelf" | "lowpass" | "lowshelf" | "notch" | "peaking";
            /**
             * - The frequency, in hertz, to which the filter is applied.
             */
            frequency?: number;
            /**
             * - Q-factor. No one knows what this does. The default value is 1. Sensible values are from 0 to 10.
             */
            q?: number;
            /**
             * - The filter envelope.
             */
            env?: {
                /**
                 * - If this is set, filter frequency will slide from filter.frequency to filter.env.frequency when a note is triggered.
                 */
                frequency?: number;
                /**
                 * - Time in seconds for the filter frequency to slide from filter.frequency to filter.env.frequency.
                 */
                attack?: number;
            };
        }[];
        /**
         * - This overrides the values for delay passed to the constructor, if it was set.
         */
        delay?: {
            /**
             * - Time in seconds between each delayed playback.
             */
            delayTime?: number;
            /**
             * - Relative volume change between the original sound and the first delayed playback.
             */
            wet?: number;
            /**
             * - Relative volume change between each delayed playback and the next.
             */
            feedback?: number;
        };
    }): void;
    /**
     * @param {string} [label] - If you want to stop a note that is not the most recently played one, pass in a label to stop only those notes.
     */
    stop(label?: string): void;
    /**
     * @param {number} volume - The new volume setting.
     */
    setVolume(volume: number): void;
    /**
     * @param {string|number} pitch - The new pitch setting.
     */
    setPitch(pitch: string | number): void;
    /**
     * @param {string|number} panning - The new panning setting.
     */
    setPanning(panning: string | number): void;
}
import { context } from "./common";
import AudioListener from "./audio_listener";
//# sourceMappingURL=wad.d.ts.map