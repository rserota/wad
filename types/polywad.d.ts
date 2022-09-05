export default Polywad;
declare class Polywad {
    constructor(arg: any);
    isSetUp: boolean;
    playable: number;
    reverb: {
        wet: any;
    };
    setUp(arg: any): void;
    wads: any[];
    input: any;
    nodes: any[];
    destination: any;
    volume: any;
    gain: any;
    output: any;
    tuna: any;
    audioMeter: any;
    recorder: any;
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
    updatePitch(): void;
    pitch: number;
    noteName: string;
    rafID: number;
    stopUpdatingPitch(): void;
    /**
     * @param {number} volume
     */
    setVolume(volume: number): Polywad;
    /**
     * @param {string|number} pitch
     */
    setPitch(pitch: string | number): void;
    /**
     * @param {number|array} panning
     * @param {number} [timeConstant]
     */
    setPanning(panning: number | any[], timeConstant?: number): void;
    /**
     * @param {PlayArgs} [arg]
     */
    play(arg?: PlayArgs): Polywad;
    playOnLoad: boolean;
    playOnLoadArg: PlayArgs;
    stop(arg: any): void;
    add(wad: any): Polywad;
    remove(wad: any): Polywad;
    constructExternalFx(arg: any, context: any): void;
}
//# sourceMappingURL=polywad.d.ts.map