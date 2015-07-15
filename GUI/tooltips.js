// This file declares the text of the tooltips, and does related DOM manipulation to set tooltips on elements that need them. 
app.init.tooltips = function(app){
    var tooltips = {
        waveform               : "The shape of the sound wave. This is very important for determining the timbre of the instrument.",
        volume                 : "The peak volume of the instrument. An instrument with its volume set to 1 is at max volume, and an instrument with its volume set to 0 is completely silent.",
        panning                : "The left/right stereo balance of the instrument. Setting panning to -1 causes the instrument to only play out of the left speaker. Setting panning to 1 causes the instrument to only play out of the right speaker. If panning is left at 0, the instrument will play at the same volume from both speakers.",
        'pitch-shift-coarse'   : "Notes played from this instrument are pitch-shifted up or down by this many semitones. +12 shifts the pitch up a full octave. -12 shifts the pitch down a full octave.",
        'pitch-shift-fine'     : "Notes played from this instrument are pitch-shifted up or down by this many cents. 100 cents = 1 semitone.",
        'volume-envelope'      : "The volume envelope changes the volume of a note over the course of its duration.",
        'volume-attack'        : "Time, in seconds, from the onset of a note to peak volume.",
        'volume-decay'         : "Time, in seconds, from peak volume to sustain volume.",
        'volume-sustain'       : "Sustain volume level. This is a percent of the peak volume.",
        'volume-release'       : "Time, in seconds, from releasing a note to zero volume.",
        'filter'               : "Filters modify the instrument by removing certain frequencies from the sound. Uncheck the box next to \"Filter\" if you don't want to use a filter at all.",
        'filter-type'          : "A low-pass filter removes high frequencies from the instrument, allowing low frequencies to 'pass' through. A high-pass filter does the opposite. A quick internet search can tell you what the other filters do.",
        'filter-frequency'     : "The frequency, in hertz, to which the filter is applied.",
        'filter-q'             : "Q-factor, also known as resonance. This affects how steep the cutoff is beyond the filter frequency.",
        'filter-env'           : "The filter envelope changes the frequency of the filter applied to a note over the course of the note's duration. This does nothing if a filter is not set.",
        'filter-env-frequency' : "The filter frequency will transition from the starting value (set above) to this value, over the course of each note's duration.",
        'filter-env-attack'    : "Time, in seconds, for the filter frequency to transition from the starting value to the final value.",
        delay                  : "A delay effect causes each note to play repeatedly at progressively lower volume, like an echo.",
        'delay-time'           : "Time, in seconds, between each delayed playback",
        'delay-wet-level'      : "Relative volume change between the original sound and the first delayed playback. 2.0 is double volume, and 5.0 is half volume.",
        'delay-feedback'       : "Relative volume change between each delayed playback and the next. 2.0 is double volume, and 0.5 is half volume.",
        vibrato                : "A vibrating pitch effect.",
        'vibrato-waveform'     : "The shape of the vibrato waveform.",
        'vibrato-magnitude'    : "How much the pitch changes.",
        'vibrato-speed'        : "How quickly the pitch changes, in hertz.",
        'vibrato-attack'       : "Time, in seconds, for the vibrato effect to reach peak magnitude.",
        tremolo                : "A vibrating volume effect.",
        'tremolo-waveform'     : "The shape of the tremolo waveform.",
        'tremolo-magnitude'    : "How much the volume changes.",
        'tremolo-speed'        : "How quickly the volume changes, in hertz.",
        'tremolo-attack'       : "Time, in seconds, for the tremolo effect to reach peak magnitude.",


    }
     


    $(document).ready(function(){
        for ( var tooltip in tooltips ) {
            $('[data-tooltip="' + tooltip + '"]').attr('title', tooltips[tooltip])
        }

        $('[data-toggle="tooltip"]').tooltip()
    })
}