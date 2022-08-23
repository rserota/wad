export default presets;
declare namespace presets {
    namespace hiHatClosed {
        const source: string;
        namespace env {
            const attack: number;
            const decay: number;
            const sustain: number;
            const hold: number;
            const release: number;
        }
        namespace filter {
            const type: string;
            const frequency: number;
            const q: number;
        }
    }
    namespace snare {
        const source_1: string;
        export { source_1 as source };
        export namespace env_1 {
            const attack_1: number;
            export { attack_1 as attack };
            const decay_1: number;
            export { decay_1 as decay };
            const sustain_1: number;
            export { sustain_1 as sustain };
            const hold_1: number;
            export { hold_1 as hold };
            const release_1: number;
            export { release_1 as release };
        }
        export { env_1 as env };
        export namespace filter_1 {
            const type_1: string;
            export { type_1 as type };
            const frequency_1: number;
            export { frequency_1 as frequency };
            const q_1: number;
            export { q_1 as q };
        }
        export { filter_1 as filter };
    }
    namespace hiHatOpen {
        const source_2: string;
        export { source_2 as source };
        export namespace env_2 {
            const attack_2: number;
            export { attack_2 as attack };
            const decay_2: number;
            export { decay_2 as decay };
            const sustain_2: number;
            export { sustain_2 as sustain };
            const hold_2: number;
            export { hold_2 as hold };
            const release_2: number;
            export { release_2 as release };
        }
        export { env_2 as env };
        export namespace filter_2 {
            const type_2: string;
            export { type_2 as type };
            const frequency_2: number;
            export { frequency_2 as frequency };
            const q_2: number;
            export { q_2 as q };
        }
        export { filter_2 as filter };
    }
    namespace ghost {
        const source_3: string;
        export { source_3 as source };
        export const volume: number;
        export namespace env_3 {
            const attack_3: number;
            export { attack_3 as attack };
            const decay_3: number;
            export { decay_3 as decay };
            const sustain_3: number;
            export { sustain_3 as sustain };
            const hold_3: number;
            export { hold_3 as hold };
            const release_3: number;
            export { release_3 as release };
        }
        export { env_3 as env };
        export namespace filter_3 {
            const type_3: string;
            export { type_3 as type };
            const frequency_3: number;
            export { frequency_3 as frequency };
            const q_3: number;
            export { q_3 as q };
            export namespace env_4 {
                const attack_4: number;
                export { attack_4 as attack };
                const frequency_4: number;
                export { frequency_4 as frequency };
            }
            export { env_4 as env };
        }
        export { filter_3 as filter };
        export namespace vibrato {
            const attack_5: number;
            export { attack_5 as attack };
            export const speed: number;
            export const magnitude: number;
        }
    }
    namespace piano {
        const source_4: string;
        export { source_4 as source };
        const volume_1: number;
        export { volume_1 as volume };
        export namespace env_5 {
            const attack_6: number;
            export { attack_6 as attack };
            const decay_4: number;
            export { decay_4 as decay };
            const sustain_4: number;
            export { sustain_4 as sustain };
            const hold_4: number;
            export { hold_4 as hold };
            const release_4: number;
            export { release_4 as release };
        }
        export { env_5 as env };
        export namespace filter_4 {
            const type_4: string;
            export { type_4 as type };
            const frequency_5: number;
            export { frequency_5 as frequency };
            const q_4: number;
            export { q_4 as q };
            export namespace env_6 {
                const attack_7: number;
                export { attack_7 as attack };
                const frequency_6: number;
                export { frequency_6 as frequency };
            }
            export { env_6 as env };
        }
        export { filter_4 as filter };
    }
}
//# sourceMappingURL=presets.d.ts.map