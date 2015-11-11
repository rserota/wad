<h1>Wad</h1>


Wad is a Javascript library for manipulating audio using the new HTML5 Web Audio API.  It greatly simplifies the process of creating, playing, and manipulating audio, either for real-time playback, or at scheduled intervals.  Wad provides a simple interface to use many features one would find in a desktop DAW (digital audio workstation), but doesn't require the user to worry about sending XHR requests or setting up complex audio graphs.



<h2>Table of Contents</h2>

<ul>
    <li><a href='#live-demo'>Live Demo</a></li>
    <li><a href='#installation'>Installation</a></li>
    <li>
        <a href='#usage'>Usage</a>
        <ul>
            <li><a href='#constructor-arguments'>Constructor Arguments</a></li>
            <li><a href='#panning'>Panning</a></li>
            <li><a href='#filters'>Filters</a></li>
            <li><a href='#configuring-reverb'>Configuring Reverb</a></li>
            <li><a href='#tuna-effects'>Tuna Effects</a></li>
            <li>
                <a href='#play'>Play()</a>
                <ul>
                    <li><a href='#play-labels'>Play Labels</a></li>
                    <li><a href='#changing-settings-during-playback'>Changing Settings During Playback</a></li>
                </ul>
            </li>
            <li><a href='#microphone-input'>Microphone Input</a></li>
            <li>
                <a href='#polywads'>PolyWads</a>
                <ul>
                    <li><a href='#recording'>Recording</a></li>
                    <li><a href='#compression'>Compression</a></li>
                    <li><a href='#pitch-detection'>Pitch Detection</a></li>
                </ul>
            </li>
            <li><a href='#external-fx'>External FX</a></li>
            <li><a href='#presets'>Presets</a></li>
            <li><a href='#midi-input'>MIDI Input</a></li>
            <li><a href='#access-to-the-audio-context'>Access to the Audio Context</a></li>
        </ul>
    <li><a href='#how-to-contribute'>How To Contribute</a></li>
</ul>

<h2 id='live-demo'>Live Demo</h2>

To see a demo of an app that uses a small subset of the features in Wad.js, check <a href="http://codecur.io/us/projects/song-demo">this</a> out.

<h2>Installation</h2>

To use Wad.js in your project, simply include the script in your HTML file.

<pre><code>&lt;script src="path/to/build/wad.min.js"&gt;&lt;/script&gt;</pre></code>

Wad.js is also available as a bower package.

<pre><code>bower install wad</code></pre>



<h2>Usage</h2>


The simplest use case is loading and playing a single audio file.

<pre><code>
var bell = new Wad({source : 'http://www.myserver.com/audio/bell.wav'})
bell.play()
bell.stop()
</code></pre>


Behind the scenes, Wad sends an XMLHttpRequest to the source URL, so you will need a server running to respond to the request. You can't simply test it with local files, like you can with an HTML &lt;audio> tag.

You can also create oscillators using the same syntax, by specifying 'sine', 'square', 'sawtooth', or 'triangle' as the source.

<pre><code>var saw = new Wad({source : 'sawtooth'})</code></pre>

The peak volume can be set during the creation of a wad, or any time afterwards. The default value is 1.

<pre><code>var saw = new Wad({source : 'sawtooth', volume : .9})
saw.setVolume(0.5)</code></pre>


<h3>Constructor Arguments</h3>

The Wad constructor supports many optional arguments to modify your sound, from simple settings such as peak volume, to more powerful things like ADSR envelopes and filters.  If not set explicitly, the ADSR envelope will have the values shown below. Filters, LFOs, and reverb are not used unless they are set explicitly. Filter type can be specified as either 'lowpass', 'highpass', 'bandpass', 'lowshelf', 'highshelf', 'peaking', 'notch', or 'allpass'.

<pre><code>
var saw = new Wad({
    source  : 'sawtooth',
    volume  : 1.0,   // Peak volume can range from 0 to an arbitrarily high number, but you probably shouldn't set it higher than 1.
    loop    : false, // If true, the audio will loop. This parameter only works for audio clips, and does nothing for oscillators. 
    pitch   : 'A4',  // Set a default pitch on the constuctor if you don't want to set the pitch on <code>play()</code>.
    detune  : 0,     // Set a default detune on the constructor if you don't want to set detune on <code>play()</code>. Detune is measured in cents. 100 cents is equal to 1 semitone.
    panning : -.5,    // Horizontal placement of the sound source. Possible values are from 1 to -1.

    env     : {      // This is the ADSR envelope.
        attack  : 0.0,  // Time in seconds from onset to peak volume.  Common values for oscillators may range from 0.05 to 0.3.
        decay   : 0.0,  // Time in seconds from peak volume to sustain volume.
        sustain : 1.0,  // Sustain volume level. This is a percent of the peak volume, so sensible values are between 0 and 1.
        hold    : 3.14, // Time in seconds to maintain the sustain volume level. If this is not set to a lower value, oscillators must be manually stopped by calling their stop() method.
        release : 0     // Time in seconds from the end of the hold period to zero volume, or from calling stop() to zero volume.
    },
    filter  : {
        type      : 'lowpass', // What type of filter is applied.
        frequency : 600,       // The frequency, in hertz, to which the filter is applied.
        q         : 1,         // Q-factor.  No one knows what this does. The default value is 1. Sensible values are from 0 to 10.
        env       : {          // Filter envelope.
            frequency : 800, // If this is set, filter frequency will slide from filter.frequency to filter.env.frequency when a note is triggered.
            attack    : 0.5  // Time in seconds for the filter frequency to slide from filter.frequency to filter.env.frequency
        }
    },
    reverb  : {
        wet     : 1,                                            // Volume of the reverberations.
        impulse : 'http://www.myServer.com/path/to/impulse.wav' // A URL for an impulse response file, if you do not want to use the default impulse response.
    },
    delay   : {
        delayTime : .5,  // Time in seconds between each delayed playback.
        wet       : .25, // Relative volume change between the original sound and the first delayed playback.
        feedback  : .25, // Relative volume change between each delayed playback and the next. 
    },
    vibrato : { // A vibrating pitch effect.  Only works for oscillators.
        shape     : 'sine', // shape of the lfo waveform. Possible values are 'sine', 'sawtooth', 'square', and 'triangle'.
        magnitude : 3,      // how much the pitch changes. Sensible values are from 1 to 10.
        speed     : 4,      // How quickly the pitch changes, in cycles per second.  Sensible values are from 0.1 to 10.
        attack    : 0       // Time in seconds for the vibrato effect to reach peak magnitude.
    },
    tremolo : { // A vibrating volume effect.
        shape     : 'sine', // shape of the lfo waveform. Possible values are 'sine', 'sawtooth', 'square', and 'triangle'.
        magnitude : 3,      // how much the volume changes. Sensible values are from 1 to 10.
        speed     : 4,      // How quickly the volume changes, in cycles per second.  Sensible values are from 0.1 to 10.
        attack    : 0       // Time in seconds for the tremolo effect to reach peak magnitude.
    },
    tuna   : {
        Chorus : {
            intensity: 0.3,  //0 to 1
            rate: 4,         //0.001 to 8
            stereoPhase: 0, //0 to 180
            bypass: 0
        }
    }
})
</code></pre>


<h3>Panning</h3>
Wad.js supports two types of panning: stereo-panning, and 3d-panning. Stereo-panning works the same way panning works in most audio software. With stereo panning, you can specify the left/right balance of the sound using a number between 1 and -1. A value of 1 means the sound is panned hard-right, and a value of -1 means the sound is panned hard-left. 

With 3d-panning, you don't directly set the left/right stereo balance. Rather, the panning setting describes the distance of the sound source from the audio listener. Any time you would pass in a panning parameter (either to the constructor, the <code>play()</code> method, or the <code>setPanning()</code> method), you can pass it in as a three element array to specify the X, Y, and Z location of the sound. You can set the panning to arbitrarily high or low values, but it will make the sound very quiet, since it's very far away.
When using 3d-panning, there are two different panning models that can be used. The HRTF panning model is higher quality, but the equalpower panning model is more performant. If not specified, the equalpower panning model is used. 


<pre><code>
var saw = new Wad({
    source       : 'sawtooth',
    panning      : [0, 1, 10],
    panningModel : 'HRTF'
})
</code></pre>

<h3>Filters</h3>

The filter constructor argument can be passed an object or an array of objects. If an array is passed, the filters are applied in that order. Whichever form is passed to the constructor should also be passed to the play argument.

<pre><code>
filter: [
    {type : 'lowpass', frequency : 600, q : 1, env : {frequency : 800, attack : 0.5}},
    {type : 'highpass', frequency : 1000, q : 5}
]
</code></pre>

<h3 id='configuring-reverb'>Configuring Reverb</h3>

In order to use reverb, you will need a server to send an impulse response via XmlHttpRequest. An impulse response is a small audio file, like a wav or mp3, that describes the acoustic characteristics of a physical space.  By default, Wad.js serves a sample impulse response that you can use freely.  However, it is recommended that you use your own impulse response. To use your own impulse response, pass a URL to an impulse response file as an argument to the constructor, as shown above. You can also modify the attribute Wad.defaultImpulse to change the default impulse response. You can make your own impulse response, but it might be easier to just <a href="http://www.voxengo.com/impulses/">find one online</a>.

<h3 id='tuna-effects'>Tuna Effects</h3>

Tuna, everyone's favorite Web Audio effects library, is included in Wad.js. This makes it super easy to add effects from Tuna to any Wad or PolyWad.

<pre><code>
var letItBeTuna = new Wad({
    source : 'sine',
    tuna   : {
        Overdrive : {
            outputGain: 0.5,         //0 to 1+
            drive: 0.7,              //0 to 1
            curveAmount: 1,          //0 to 1
            algorithmIndex: 0,       //0 to 5, selects one of our drive algorithms
            bypass: 0
        },
        Chorus : {
            intensity: 0.3,  //0 to 1
            rate: 4,         //0.001 to 8
            stereoPhase: 0,  //0 to 180
            bypass: 0
        }
    }
})
</pre></code>

For more information about the various Tuna effects and the arguments they take, <a href="https://github.com/Theodeus/tuna/wiki#the-nodes">check out the Tuna wiki</a>.

<h3 id='play-arguments'>Play()</h3>

The <code>play()</code> method also accepts many optional arguments, such as volume, wait, pitch, envelope, panning, and filter. If you intend to include a filter envelope or panning as an argument on <code>play()</code>, you should have set a filter envelope or panning when the Wad was first instantiated. Pitches can be named by the note name, followed by the octave number. Possible values are from A0 to C8. Sharp and flat notes can be named enharmonically as either sharps or flats (G#2/Ab2). Check the Wad.pitches attribute for a complete mapping of note-names to frequencies.

<pre><code>
var saw = new Wad({source : 'sawtooth'})
saw.play({
    volume  : 0.8,
    wait    : 0,     // Time in seconds between calling play() and actually triggering the note.
    loop    : false, // This overrides the value for loop on the constructor, if it was set. 
    pitch   : 'A4',  // A4 is 440 hertz.
    label   : 'A',   // A label that identifies this note.
    env     : {hold : 9001},
    panning : [1, -1, 10],
    filter  : {frequency : 900},
    delay   : {delayTime : .8}
})
</code></pre>


If you like, you can also select a pitch by frequency.

<code>saw.play({pitch : 440})</code>

<h4 id='play-labels'>Play Labels</h4>

When you call <code>stop()</code> on a Wad, it will only stop the most recently triggered note. If you want to retain control over multiple notes that played from the same Wad, you can label those notes when <code>play()</code> is called. When <code>stop()</code> is called, you can pass in a label argument to stop all currently sustained notes with that label. 

<pre><code>
saw.play({pitch : 'A4', label : 'A4'}) // The label can be any string, but using the same name as the note is often sensible.
saw.play({pitch : 'G4', label : 'G4'})
saw.stop('A4') // The first note will stop, but the second note will continue playing.
</code></pre>


<h4 id='play-setters'>Changing Settings During Playback</h4>

If you want to change an attribute of a Wad during playback, you can use the relevant setter method for that attribute.

<pre><code>
saw.play()
saw.setPanning(-2)
</code></pre>


<h3 id='mic'>Microphone Input</h3>

You can also use microphone input as the source for a Wad. You can apply reverb or filters to the microphone input, but you cannot apply an envelope or filter envelope. If a Wad uses the microphone as the source, it will constantly stream the mic input through all applied effects (filters, reverb, etc) and out through your speakers or headphones as soon as you call the <code>play()</code> method on that Wad. Call the <code>stop()</code> method on a microphone Wad to disconnect your microphone from that Wad. You may experience problems with microphone feedback if you aren't using headphones.

<pre><code>
var voice = new Wad({
    source  : 'mic',
    reverb  : {
        wet : .4
    }
    filter  : {
        type      : 'highpass',
        frequency : 700
    },
    panning : -.2
}

// You must give your browser permission to use your microphone before calling play().
voice.play()
</code></pre>

If <code>voice.play()</code> is called with no arguments, it uses the arguments from the constructor. However, if it is called with any arguments, all arguments from the constructor are discarded (except for source), and the arguments passed to <code>voice.play()</code> are used instead. 

<h3>PolyWads</h3>

In many cases, it is useful to group multiple Wads together. This can be accomplished with a PolyWad, a multi-purpose object that can store other Wads and PolyWads. There are two main cases where you might want to group several Wads together. One case is when you want to make a complex instrument that uses multiple oscillators.  Other audio synthesis programs often have instruments that combine multiple oscillators, with names like 'TripleOscillator' or '3xOSC'.

<pre><code>
var sine     = new Wad({ source : 'sine' })
var square   = new Wad({ source : 'square' })
var triangle = new Wad({ source : 'triangle' })

var tripleOscillator = new Wad.Poly()

tripleOscillator.add(sine).add(square).add(triangle) // Many methods are chainable for convenience.

tripleOscillator.play({ pitch : 'G#2'})
tripleOscillator.setVolume(.5)
tripleOscillator.stop() // play(), stop(), and various setter methods can be called on a PolyWad just as they would be called on a regular Wad.

tripleOscillator.remove(triangle) // It's really just a double-oscillator at this point.
</code></pre>

The second main case in which you would want to group several Wads together is to make a mixer track, where several Wads share a set of effects and filters.

<pre><code>
var mixerTrack = new Wad.Poly({
    filter  : {
        type      : 'lowpass',
        frequency : 700,
        q         : 3
    },
    panning : 1
})

mixerTrack.add(tripleOscillator).add(triangle)
tripleOscillator.play({ pitch : 'Eb3'}) // This note is filtered and panned.
</code></pre>

<h4>Recording</h4>

A PolyWad can be used to record the output produced by the Wads it contains.

<pre><code>
var sine = new Wad({source : 'sine'})
var mixerTrack = new Wad.Poly({
    recConfig : { // The Recorder configuration object. The only required property is 'workerPath'.
        workerPath : '/src/Recorderjs/recorderWorker.js' // The path to the Recorder.js web worker script.
    }
})
mixerTrack.add(sine)

mixerTrack.rec.record()             // Start recording output from this PolyWad.
sine.play({pitch : 'C3'})           // Make some noise!
mixerTrack.rec.stop()               // Take a break.
mixerTrack.rec.record()             // Append to the same recording buffer.
sine.play({pitch : 'G3'})
mixerTrack.rec.stop()
mixerTrack.rec.createWad()          // This method accepts the same arguments as the Wad constructor, except that the 'source' is implied, so it's fine to call this method with no arguments. 
mixerTrack.rec.recordings[0].play() // The most recent recording is unshifted to the front of this array.
mixerTrack.rec.clear()              // Clear the recording buffer when you're done with it, so you can record something else.
</code></pre>

Wad.js uses Recorder.js for recording (the 'createWad()' method and the 'recordings' array are the only extensions that I've added). For more comprehensive documentation about the recorder object, <a href='https://github.com/mattdiamond/Recorderjs'>check out the Recorder.js documentation</a>. 

Note that the minified version of Wad.js has Recorder.js concatenated to it, but the source version does not. If you want to tinker with recording in the source version, you will need to include recorder.js separately. Whichever version you use, recorderWorker.js is always a separate file, and its location must be specified in the recConfig object. 

<h4>Compression</h4>

If you want to make a song that sounds rich and modern, it often helps to compress the dynamic range of the song. A compressor will make the loudest parts of your song quieter, and the quietest parts louder.

<pre><code>
var compressor = new Wad.Poly({
    compressor : {
        attack    : .003 // The amount of time, in seconds, to reduce the gain by 10dB. This parameter ranges from 0 to 1.
        knee      : 30   // A decibel value representing the range above the threshold where the curve smoothly transitions to the "ratio" portion. This parameter ranges from 0 to 40.
        ratio     : 12   // The amount of dB change in input for a 1 dB change in output. This parameter ranges from 1 to 20.
        release   : .25  // The amount of time (in seconds) to increase the gain by 10dB. This parameter ranges from 0 to 1.
        threshold : -24  // The decibel value above which the compression will start taking effect. This parameter ranges from -100 to 0.
    }
})
</code></pre>


<h4>Pitch Detection</h4>

PolyWads can detect the frequency of their input. 

<pre><code>
var voice = new Wad({source : 'mic' }); // At this point, your browser will ask for permission to access your microphone.
var tuner = new Wad.Poly();
tuner.add(voice);

voice.play(); // You must give your browser permission to access your microphone before calling play().

tuner.updatePitch() // The tuner is now calculating the pitch and note name of its input 60 times per second. These values are stored in <code>tuner.pitch</code> and <code>tuner.noteName</code>.

var logPitch = function(){
    console.log(tuner.pitch, tuner.noteName)
    requestAnimationFrame(logPitch)
};
logPitch();
// If you sing into your microphone, your pitch will be logged to the console in real time.

tuner.stopUpdatingPitch(); // Stop calculating the pitch if you don't need to know it anymore.

</code></pre>

<h3 id='exfx'>External FX</h3>

Sometimes you might want to incorporate external libraries into Wad, for example FX or visualizers. You can override the constructExternalFx and setUpExternalFxOnPlay methods to add those nodes to the wad chain. In the following example the values are hardcoded, but they could easily have been passed as arguments to play.

<pre><code>
//For example to add a Tuna chorus you would put this somewhere in your own code, and also include the Tuna library:

var tuna;
Wad.prototype.constructExternalFx = function(arg, context){
    this.tuna   = new Tuna(context);
    this.chorus = arg.chorus;
};

Wad.prototype.setUpExternalFxOnPlay = function(arg, context){
    var chorus = new tuna.Chorus({
        rate     : arg.chorus.rate     || this.chorus.rate,
        feedback : arg.chorus.feedback || this.chorus.feedback,
        delay    : arg.chorus.delay    || this.chorus.delay,
        bypass   : arg.chorus.bypass   || this.chorus.bypass
    });
    chorus.input.connect = chorus.connect.bind(chorus) // we do this dance because tuna exposes its input differently.
    this.nodes.push(chorus.input) // you would generally want to do this at the end unless you are working with something that does not modulate the sound (i.e, a visualizer)
};
</code></pre>


<h3>Presets</h3>

If you'd like to use a pre-configured Wad, check out the presets.  They should give you a better idea of the sorts of sounds that you can create with Wad.js.  For example, you can create a Wad using the preset 'hiHatClosed' like this:

<pre><code>var hat = new Wad(Wad.presets.hiHatClosed);</code></pre>

<h3 id='midi'>MIDI Input</h3>

Wad.js can read MIDI data from MIDI instruments and controllers, and you can set handlers to respond to that data. When Wad.js initializes, it tries to automatically detect any connected MIDI devices, and creates a reference to it in the array <code>Wad.midiInputs</code>. To handle MIDI data, assign a MIDI handler function to a MIDI device's <code>onmidimessage</code> property.  By default, Wad is configured to log MIDI messages to the console, which should be sufficient if you are quickly testing your devices. If you want to quickly set up a MIDI keyboard to play a Wad, assign a Wad of your choice (or any object with <code>play()</code> and <code>stop()</code> methods) to <code>Wad.midiInstrument</code>.

<pre><code>Wad.midiInstrument = new Wad({source : 'sine'});</code></pre>


If you want to get creative with how Wad.js handles MIDI data, I strongly encourage you to write your own MIDI handler functions. For example, note-on velocity (how hard you press a key when playing a note) usually modulates the volume of a note, but it might sound interesting if you configure note-on velocity to modulate the attack or filter frequency instead. You could configure the right half of your keyboard to play a guitar, and configure the left half of your keyboard to play a bass. If you want to take that a step further, you can use a sustain pedal to toggle between slap and pop sounds on the bass, if you're into that style of music. Or maybe you'd like to map the lowest octave on your keyboard to a drum kit, and use a sustain pedal to play the kick-drum. You can do almost anything, if you're clever. Wad.js simply maps MIDI data to function calls, so your MIDI device can do anything that you can accomplish with Javascript. You can send MIDI data through websockets for some kind of WAN concert, or set up a Twitter bot that automatically tells your friends what key you've been playing in. If you can design a really cool and creative MIDI rig, I'd love to hear about it, and might include it in Wad.js.

<pre><code>
Wad.midiInputs[0].onmidimessage = function(event){
    console.log(event.receivedTime, event.data);
};
Wad.midiInputs[1].onmidimessage = anotherMidiHandlerFunction // If you have multiple MIDI devices that you would like to use simultaneously, you will need multiple MIDI handler functions.
</code></pre>

<h3 id="access-to-the-audio-context">Access to the Audio Context</h3>

When Wad.js loads initially, it automatically creates an Audio Context. It shouldn't be necessary to access the Audio Context directly, but if you need it for some reason, it is exposed at <code>Wad.audioContext</code>.

<h2>How To Contribute</h2>

I've put a lot of work into this project, but there's still plenty of room for improvement, both in terms of bugfixes and feature additions. Please feel free to fork this repo and submit pull requests.


<h3>Cross-Browser Compatibility</h3>

I tried to future-proof Wad.js by using standards-compliant methods, but the cross-browser compatibility is still not great. It works best in Chrome, decently in Safari for iOS, and it works poorly in Firefox. I have not tested it in any other browsers. I would greatly appreciate contributions to help Wad.js run optimally in any browser that supports Web Audio, especially mobile browsers.

