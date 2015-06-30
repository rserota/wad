app.init.tooltips = function(app){
    var waveformTooltip = "The shape of the sound wave. " +
        "This is very important for determining the timbre of the instrument."

    $(document).ready(function(){

        $('[data-tooltip="waveform"]').attr('title',waveformTooltip)
    })
}