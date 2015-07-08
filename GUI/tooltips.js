// This file declares the text of the tooltips, and does related DOM manipulation to set tooltips on elements that need them. 
app.init.tooltips = function(app){
    var tooltips = {
        waveform             : "The shape of the sound wave. This is very important for determining the timbre of the instrument.",
        volume               : "The peak volume of the instrument. An instrument with its volume set to 1 is at max volume, and an instrument with its volume set to 0 is completely silent.",
        panning              : "The left/right stereo balance of the instrument. Setting panning to -1 causes the instrument to only play out of the left speaker. Setting panning to 1 causes the instrument to only play out of the right speaker. If panning is left at 0, the instrument will play at the same volume from both speakers.",
        'pitch-shift-coarse' : "Notes played from this instrument are pitch-shifted up or down by this many semitones. +12 shifts the pitch up a full octave. -12 shifts the pitch down a full octave.",
        'pitch-shift-fine'   : "Notes played from this instrument are pitch-shifted up or down by this many cents. 100 cents = 1 semitone.",
        'volume-attack'      : "Time, in seconds, from the onset of a note to peak volume.",
        'volume-decay'       : "Time, in seconds, from peak volume to sustain volume.",
        'volume-sustain'     : "Sustain volume level. This is a percent of the peak volume."
        'volume-release'     : "Time, in seconds, from releasing a note to zero volume."

    }
     


    $(document).ready(function(){
        for ( var tooltip in tooltips ) {
            $('[data-tooltip="' + tooltip + '"]').attr('title', tooltips[tooltip])
        }
    })
}