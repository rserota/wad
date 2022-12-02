# WadJS ![npm](https://img.shields.io/npm/v/web-audio-daw) <a href="https://www.npmjs.com/package/web-audio-daw"><img alt="npm" src="https://img.shields.io/npm/dw/web-audio-daw"></a> 
#### A Javascript library for manipulating audio. It's like jQuery for your ears. 

![Wad Logo](/logo.png?raw=true)


## Table of Contents

1. [Installation](#installation)
1. [Introduction](#introduction)
1. [Panning](#panning)
1. [Filters](#filters)
1. [Microphone Input](#microphone-input)
1. [Configuring Reverb](#configuring-reverb)
1. [Audio Sprites](#audio-sprites)
1. [Logging](#logging)
1. [Sound Iterator](#sound-iterator)
1. [Tuna Effects](#tuna-effects)
1. [Audio Listener](#audio-listener)
1. [Play Labels](#play-labels)
1. [External Fx](#external-fx)
1. [Presets](#presets)
1. [Polywads](#polywads)
1. [Compression](#compression)
1. [Recording](#recording)
1. [Audio Meter](#audio-meter)
1. [Pitch Detection](#pitch-detection)
1. [MIDI Input](#midi-input)
1. [Access to the Audio Context](#access-to-the-audio-context)
1. [Cross-browser Compatibility](#cross-browser-compatibility)
1. [Acknowledgements](#acknowledgements)
1. [How to Contribute](#how-to-contribute)
1. [API Documentation](#api-documentation)
1. [Showcase](#showcase)



## Installation

To use WadJS in your project, simply include the script in your HTML file.
```html
<script src="https://unpkg.com/web-audio-daw"></script>
```

WadJS is also available as an npm module.

```sh
npm install web-audio-daw
```

```javascript
import Wad from 'web-audio-daw';
```


## Introduction


To do anything with WadJS, you'll first need to create a wad, which can represent anything that makes sound, such as an mp3 file, an oscillator, or even live microphone input.
The simplest use case is loading and playing a single audio file. 

```javascript
let bell = new Wad({source : 'https://www.myserver.com/audio/bell.mp3'});
bell.play();
bell.stop();
```

You can also create oscillators using the same syntax, by specifying 'sine', 'square', 'sawtooth', 'triangle', or 'noise' as the source.

```javascript
let saw = new Wad({source : 'sawtooth'});
saw.play();
```

The `Wad` constructor and the `play()` method both accept many optional arguments. Skim through the API documentation to learn more. 


## Panning
WadJS supports two types of panning: stereo-panning, and 3d-panning. Stereo-panning works the same way panning works in most audio software. With stereo panning, you can specify the left/right balance of the sound using a number between 1 and -1. A value of 1 means the sound is panned hard-right, and a value of -1 means the sound is panned hard-left. 

With 3d-panning, you don't directly set the left/right stereo balance. Rather, the panning setting describes the distance of the sound source from the audio listener. Any time you would pass in a panning parameter (either to the constructor, the <code>play()</code> method, or the <code>setPanning()</code> method), you can pass it in as a three element array to specify the X, Y, and Z location of the sound. You can set the panning to arbitrarily high or low values, but it will make the sound very quiet, since it's very far away.
When using 3d-panning, there are two different panning models that can be used. The HRTF panning model is higher quality, but the equalpower panning model is more performant. If not specified, the equalpower panning model is used. 


```javascript
var saw = new Wad({
    source        : 'sawtooth',
    panning       : [0, 1, 10],
    panningModel  : 'HRTF',
    rolloffFactor : 1 // other properties of the panner node can be specified in the constructor, or on play()
})
```

## Filters

The filter constructor argument can be passed an object or an array of objects. If an array is passed, the filters are applied in that order. Whichever form is passed to the constructor should also be passed to the play argument.

```javascript
filter: [
    {type : 'lowpass', frequency : 600, q : 1, env : {frequency : 800, attack : 0.5}},
    {type : 'highpass', frequency : 1000, q : 5}
]
```

## Microphone Input

You can also use microphone input as the source for a Wad. You can apply reverb or filters to the microphone input, but you cannot apply an envelope or filter envelope. If a Wad uses the microphone as the source, it will constantly stream the mic input through all applied effects (filters, reverb, etc) and out through your speakers or headphones as soon as you call the <code>play()</code> method on that Wad. Call the <code>stop()</code> method on a microphone Wad to disconnect your microphone from that Wad. You may experience problems with microphone feedback if you aren't using headphones.

```javascript
var voice = new Wad({
    source  : 'mic',
    reverb  : {
        wet : .4
    },
    filter  : {
        type      : 'highpass',
        frequency : 500
    },
    panning : -.2
})

// You must give your browser permission to use your microphone before calling play().
voice.play()
```

If `voice.play()` is called with no arguments, it uses the arguments from the constructor. However, if it is called with any arguments, all arguments from the constructor are discarded (except for source), and the arguments passed to <code>voice.play()</code> are used instead. 

## Configuring Reverb

In order to use reverb, you will need a server to send an impulse response. An impulse response is a small audio file, like a wav or mp3, that describes the acoustic characteristics of a physical space.   You can make your own impulse response, but it might be easier to just <a href="http://www.voxengo.com/impulses/">find one online</a>. There's also an impulse response included in the test folder that you can use. 

## Audio Sprites

If your project contains many short audio clips, you may be able to achieve better performance by loading them as a single, longer audio clip, and play sections from that longer clip as needed. 

```javascript 
var helloWorld = new Wad({
    source: 'https://www.myserver.com/audio/hello-world.wav',

    // add a key for each sprite 
    sprite: {
        hello : [0, .4], // the start and end time, in seconds
        world : [.4,1]
    }
});

// for each key on the sprite object in the constructor above, the wad that is created will have a key of the same name, with a play() method. 
helloWorld.hello.play();
helloWorld.world.play();

// you can still play the entire clip normally, if you want. 
helloWorld.play(); 

// if you hear clicks or pops from starting and stopping playback in the middle of the clip, you can try adding some attack and release to the envelope. 
helloWorld.hello.play({env:{attack: .1, release:.02}})

```

## Logging

WadJS can log various warnings and notices to the console, but these are disabled by default. To view these messages in the console, you can increase Wad's verbosity.

```javascript
Wad.logs.verbosity = 0 // WadJS will print nothing to your console. This is the default setting. 
Wad.logs.verbosity = 1 // View some notices and warnings, e.g. audio context started, midi devices connected, etc. These logs should not print more than once.
Wad.logs.verbosity = 2 // View all notices and warnings, including those from play() and stop(). These logs might print many times. 

```

## Sound Iterator

The `SoundIterator` object is used for playing sounds in a random order or repeatedly through a loop. It is good for footstep sounds, for example.

```javascript
var  iterator = new Wad.SoundIterator({
    files: [new Wad({source:'square'}), new Wad({source:'triangle'})], // Takes Wad objects, or files that would be passed to source. If it is passed a file that is not a Wad object, then it will create a generic Wad object with the passed file as the source.
    random: false, // either play a random order (true), or play in the order of the list (false)
    randomPlaysBeforeRepeat: 0, // This value says the amount of plays that need to happen before a sound can be repeated. This only works if the length of the iterator is 3 or more, and this value is max 1 less than the length of the sound list.
})
```

The methods are:

```javascript
iterator.play(args) // Plays the next sound in the list, or next random sound following the random rules. The passed args are the normal args that can be passed to Wad.play(). The function returns a Promise.
iterator.add(sound) // Pass in either a Wad object or an object that would be passed as a source in a new Wad. It returns the SoundIterator object to be chained.
iterator.remove(sound) // pass in the Wad instance you want to have removed from the iterator. Only Wad objects that were added as Wad objects can be removed.
```

## Tuna Effects

Tuna, everyone's favorite Web Audio effects library, is included in WadJS. This makes it super easy to add effects from Tuna to any Wad or PolyWad.

```javascript
let itBeTuna = new Wad({
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
```

For more information about the various Tuna effects and the arguments they take, <a href="https://github.com/Theodeus/tuna/wiki#the-nodes">check out the Tuna wiki</a>.


## Audio Listener

WadJS wraps the [AudioListener](<https://developer.mozilla.org/en-US/docs/Web/API/AudioListener>) to provide uniformity across browsers. The AudioListener is only useful when using 3D panning. You can use both the standard listener.positionX.value or the setPosition function to move the listener. The default position and orientation is: positionX=0, positionY=0, positionZ=0, forwardX=0, forwardY=0, forwardZ=-1, upX=0, upY=1, upZ=0.

- Wad.listener.setPosition(x,y,z) -> setPosition moves the listener to the specified coordinates. Take note that the web audio API has X move left and right, y move up and down, and z move forward and back. So if one is moving around a flat environment, then x and z will want to be used, and not X and Y.
- Wad.listener. setOrientation(forwardX, forwardY, forwardZ, upX, upY, upZ) -> This takes two [direction vectors.](<https://www.khanacademy.org/math/precalculus/x9e81a4f98389efdf:vectors/x9e81a4f98389efdf:component-form/a/vector-magnitude-and-direction-review>) Neither vector's coordinates have units. The first vector is the direction the user's nose is facing. The second vector is the direction of the top of the listener's head.
- Wad.listener.getPosition() -> returns a 3 element list of the user's positionX.value, positionY.value, and positionZ.value.
- Wad.listener.getOrientation() -> returns a six element array of: forwardX.value, forwardY.value, forwardZ.value, upX.value, upY.value, and upZ.value.
- To set or get a value directly, do: `listener.positionX.value`.

```javascript
Wad.listener.setPosition(1,0,0)
console.log(Wad.listener.positionX.value)
Wad.listener.forwardZ.value += 1
console.log(Wad.listener.getPosition()[0])
```


## Play Labels

When you call `stop()` on a Wad, it will only stop the most recently triggered note. If you want to retain control over multiple notes that played from the same Wad, you can label those notes when `play()` is called. When `stop()` is called, you can pass in a label argument to stop all currently sustained notes with that label. 

```javascript
saw.play({pitch : 'A4', label : 'A4'}) // The label can be any string, but using the same name as the note is often sensible.
saw.play({pitch : 'G4', label : 'G4'})
saw.stop('A4') // The first note will stop, but the second note will continue playing.
```



## External FX

Sometimes you might want to incorporate external libraries into Wad, for example FX or visualizers. You can override the constructExternalFx and setUpExternalFxOnPlay methods to add those nodes to the wad chain. In the following example the values are hardcoded, but they could easily have been passed as arguments to play.

```javascript
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
```


## Presets

If you'd like to use a pre-configured Wad, check out the presets.  They should give you a better idea of the sorts of sounds that you can create with WadJS.  For example, you can create a Wad using the preset 'hiHatClosed' like this:

```javascript
var hat = new Wad(Wad.presets.hiHatClosed);
```

## PolyWads

In many cases, it is useful to group multiple Wads together. This can be accomplished with a PolyWad, a multi-purpose object that can store other Wads and PolyWads. There are two main cases where you might want to group several Wads together. One case is when you want to make a complex instrument that uses multiple oscillators.  Other audio synthesis programs often have instruments that combine multiple oscillators, with names like 'TripleOscillator' or '3xOSC'.

```javascript
var sine     = new Wad({ source : 'sine' })
var square   = new Wad({ source : 'square' })
var triangle = new Wad({ source : 'triangle' })

var tripleOscillator = new Wad.Poly()

tripleOscillator.add(sine).add(square).add(triangle) // Many methods are chainable for convenience.

tripleOscillator.play({ pitch : 'G#2'})
tripleOscillator.setVolume(.5)
tripleOscillator.stop() // play(), stop(), and various setter methods can be called on a PolyWad just as they would be called on a regular Wad.

tripleOscillator.remove(triangle) // It's really just a double-oscillator at this point.
```

The second main case in which you would want to group several Wads together is to make a mixer track, where several Wads share a set of effects and filters.

```javascript
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
```

## Compression

If you want to make a song that sounds rich and modern, it often helps to compress the dynamic range of the song. A compressor will make the loudest parts of your song quieter, and the quietest parts louder.

```javascript
var compressor = new Wad.Poly({
    compressor : {
        attack    : .003 // The amount of time, in seconds, to reduce the gain by 10dB. This parameter ranges from 0 to 1.
        knee      : 30   // A decibel value representing the range above the threshold where the curve smoothly transitions to the "ratio" portion. This parameter ranges from 0 to 40.
        ratio     : 12   // The amount of dB change in input for a 1 dB change in output. This parameter ranges from 1 to 20.
        release   : .25  // The amount of time (in seconds) to increase the gain by 10dB. This parameter ranges from 0 to 1.
        threshold : -24  // The decibel value above which the compression will start taking effect. This parameter ranges from -100 to 0.
    }
})
```

## Recording

PolyWads can be created with a recorder, which can save the output of the PolyWad to an audio file. 

```javascript
    let voice = new Wad({source: 'mic'})
    let polywad = new Wad.Poly({
        recorder: {
            options: { mimeType : 'audio/webm' },
            onstop: function(event) {
                let blob = new Blob(this.recorder.chunks, { 'type' : 'audio/webm;codecs=opus' });
                window.open(URL.createObjectURL(blob));
            }
        }
    })
    polywad.add(voice)
    voice.play()
    polywad.recorder.start()
    // make some noise
    polywad.recorder.stop() // a new window should open, where you can download the file you just created

```

The `options` that are specified above get passed directly into the `MediaRecorder` constructor. The `onstop` method that is specified above is used to handle the `onstop` event of the `MediaRecorder`. 
Methods from the MediaRecorder (`start`, `stop`, `pause`, `resume`, `requestData`) have been aliased to `polywad.recorder` for convenience. The MediaRecorder itself can be accessed at `polywad.recorder.mediaRecorder`.
Read more about these [here](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder). 
The snippet above shows the default values for `options` and `onstop`, so that polywad could have been created simply like this:

```javascript
    let polywad = new Wad.Poly({ recorder: {} })
```

Alternatively, you can use the recorded audio as the source for a new Wad.

```javascript
    let recordings = [];
    let voice = new Wad({source: 'mic'});
    let polywad = new Wad.Poly({
        recorder: {
            options: { mimeType : 'audio/webm' },
            onstop: function(event) {
                let blob = new Blob(this.recorder.chunks, { 'type' : 'audio/webm;codecs=opus' });
                recordings.push(new Wad({source:URL.createObjectURL(blob)}))
            }
        }
    });
    polywad.add(voice);
    voice.play();
    polywad.recorder.start(); // make some noise
    polywad.recorder.stop(); 
    recordings[0] && recordings[0].play()

```

## Audio Meter

PolyWads can be created with an audio meter, which reports the volume level of the PolyWad's output, and can tell you if it's clipping.

```javascript

    var sawtooth = new Wad({source:'sawtooth', env:{hold:1, release:.2}})
    var triangle = new Wad({source:'triangle', env:{hold:1, release:.2}})
    var polywad = new Wad.Poly({
        audioMeter: {
            clipLevel: .98, // the level (0 to 1) that you would consider "clipping".
            averaging: .95, // how "smoothed" you would like the meter to be over time. Should be between 0 and less than 1.
            clipLag: 750, // how long you would like the "clipping" indicator to show after clipping has occured, in milliseconds.
        },
    })
    polywad.add(sawtooth).add(triangle)

    setInterval(function(){
        console.log("Volume: ", Math.round(polywad.audioMeter.volume * 1000))
        console.log("Clipping: ", polywad.audioMeter.checkClipping())
    }, 50)
    polywad.play()
```


## Pitch Detection

PolyWads can detect the frequency of their input. 

```javascript
var voice = new Wad({source : 'mic' }); // At this point, your browser will ask for permission to access your microphone.
var tuner = new Wad.Poly();
tuner.setVolume(0); // If you're not using headphones, you can eliminate microphone feedback by muting the output from the tuner.
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
```

## MIDI Input

WadJS can read MIDI data from MIDI instruments and controllers, and you can set handlers to respond to that data. When WadJS initializes, it tries to automatically detect any connected MIDI devices, and creates a reference to it in the array <code>Wad.midiInputs</code>. To handle MIDI data, assign a MIDI handler function to a MIDI device's <code>onmidimessage</code> property.  By default, Wad is configured to log MIDI messages to the console, which should be sufficient if you are quickly testing your devices. If you want to quickly set up a MIDI keyboard to play a Wad, assign a Wad of your choice (or any object with <code>play()</code> and <code>stop()</code> methods) to <code>Wad.midiInstrument</code>.

```javascript
Wad.midiInstrument = new Wad({source : 'sine'});
```

If you want to get creative with how WadJS handles MIDI data, I strongly encourage you to write your own MIDI handler functions. For example, note-on velocity (how hard you press a key when playing a note) usually modulates the volume of a note, but it might sound interesting if you configure note-on velocity to modulate the attack or filter frequency instead. 

```javascript
var midiMap = function(event){
    console.log(event.receivedTime, event.data);
}

Wad.assignMidiMap(midiMap)
```

If you have multiple MIDI devices that you would like to use simultaneously, you will need multiple MIDI handler functions. The second argument to <code>Wad.assignMidiMap</code> is used to specify the index of the MIDI device you would like to assign to. 

```javascript
    Wad.assignMidiMap(anotherMidiHandlerFunction, 1)  
    Wad.midiInputs[1].onmidimessage = anotherMidiHandlerFunction 
```

`Wad.assignMidiMap` can also accept success and failure callbacks as its third and fourth arguments, to handle cases where the MIDI device you are trying to assign to cannot be found. 

## Access to the Audio Context

When WadJS loads initially, it automatically creates an Audio Context. It shouldn't be necessary to access the Audio Context directly, but if you need it for some reason, it is exposed at <code>Wad.audioContext</code>. <span id="a-frame-integration">If you are using <a href="https://aframe.io/">A-Frame</a> in your application and WadJS detects an `<a-scene>` element on the page, WadJS will use A-Frame's Audio Context and Audio Listener, instead of creating its own.</span>

## Cross-Browser Compatibility

WadJS works best in Chrome, decently in Safari for iOS, and it works poorly in Firefox. I have not tested it in any other browsers. I would greatly appreciate contributions to help WadJS run optimally in any browser that supports Web Audio, especially mobile browsers.


## Acknowledgements

The synthesizer icon at the top of this readme was created by Anatolii Badii from Noun Project.

## How to Contribute

There are many ways that you can help make WadJS better, including testing it in different environments and raising issues. 
However, if you'd like to contribute code to WadJS, here are some tips and guidelines:

1. Fork the repo.
1. Add/edit source files in /src.
1. Build the project with `npm run build`, or build automatically after changes with `npm run watch`.
1. Webpack output is written to /build.
1. Follow the style rules in `.eslintrc` (use tabs and semicolons). You can check/fix your style with `npm run lint`.
1. WadJS does not have automated tests, but there is a manual testing page in `/test`. If you add or modify a feature in WadJS, please change the test page so that I can easily hear what you did. The test code is also built when your run `npm run build`. 
1. Submit a pull request. 


## API Documentation

### new Wad(args)

| Property                  | Type              | Default           | Description |
| ------------------------- | ----------------- | ----------------  | ----------- |
| args                      | object            | none (required)   | One big object with all of the arguments for creating this wad. |
| args.source               | string            | none (required)   | To make a wad that plays an audio clip, set this to the url for the audio file. To make a wad that plays an oscillator, set this to 'sine', 'square', 'sawtooth', 'triangle', or 'noise'. To create a wad that processes your microphone input, set this to 'mic'. |
| args.volume               | number            | 1                 | Peak volume can range from 0 to an arbitrarily large number, but you probably shouldn't set it higher than 1. |
| args.loop                 | boolean           | false             | If true, the audio will loop. This parameter only works for audio clips, and does nothing for oscillators. |
| args.useCache             | boolean           | true              | If false, the audio will be requested from the source URL without checking the audio cache. |
| args.rate                 | number            | 1                 | How fast the audio clip plays, relative to its normal speed. |
| args.offset               | number            | 0                 | Where in the audio clip playback begins, measured in seconds from the start of the audio clip. |
| args.pitch                | string or number  | 'A4'              | Set a default pitch on the constructor if you don't want to set the pitch on `play()`. Pass in a string to play a specific pitch (12-TET, A440), or pass in a number to play that frequency, in hertz. |
| args.detune               | number            | 0                 | Set a default detune on the constructor if you don't want to set detune on `play()`. Detune is measured in cents. 100 cents is equal to 1 semitone. |
| args.panning              | number or array   | 0                 | Placement of the sound source. Pass in a number to use stereo panning, or pass in a 3-element array to use 3D panning. Note that some browsers do not support stereo panning. |
| args.panningModel         | string            | 'equalpower'      | See [panning](#panning) section. |
| args.rolloffFactor        | number            | 1                 | |
| args.env                  | object            | see below         | This is the ADSR envelope - attack, decay, (hold), sustain, release. |
| args.env.attack           | number            | 0                 | Time in seconds from onset to peak volume.  Common values for oscillators may range from 0.05 to 0.3. |
| args.env.decay            | number            | 0                 | Time in seconds from peak volume to sustain volume. |
| args.env.sustain          | number            | 1                 | Sustain volume level. This is a percent of the peak volume, so sensible values are between 0 and 1. |
| args.env.hold             | number            | 3.14              | Time in seconds to maintain the sustain volume level. If set to -1, the sound will be sustained indefinitely until you manually call stop(). |
| args.env.release          | number            | 0                 | Time in seconds from the end of the hold period to zero volume, or from calling stop() to zero volume. |
| args.filter               | object or array   | none              | Pass an object to add a filter to this wad, or pass an array of objects to add multiple filters to this wad. |
| args.filter.type          | string            | 'lowpass'         | What type of filter is applied. Choose one of 'lowpass', 'highpass', 'bandpass', 'lowshelf', 'highshelf', 'peaking', 'notch', or 'allpass'. |
| args.filter.frequency     | number            | 600               | The frequency, in hertz, to which the filter is applied. |
| args.filter.q             | number            | 1                 | Q-factor.  No one knows what this does. The default value is 1. Sensible values are from 0 to 10. |
| args.filter.env           | object            | none              | The filter envelope. |
| args.filter.env.frequency | number            | 800               | If this is set, filter frequency will slide from filter.frequency to filter.env.frequency when a note is triggered. |
| args.filter.env.attack    | number            | 0.5               | Time in seconds for the filter frequency to slide from filter.frequency to filter.env.frequency. |
| args.reverb               | object            | none              | Add reverb to this wad. |
| args.reverb.wet           | number            | 1                 | The volume of the reverberations. |
| args.reverb.impulse       | string            | none              | A URL for an impulse response file. |
| args.delay                | object            | none              | Add delay to this wad. |
| args.delay.delayTime      | number            | 0.5               | Time in seconds between each delayed playback. |
| args.delay.wet            | number            | 0.25              | Relative volume change between the original sound and the first delayed playback. |
| args.delay.feedback       | number            | 0.25              | Relative volume change between each delayed playback and the next. |
| args.vibrato              | object            | none              | A vibrating pitch effect.  Only works for oscillators. |
| args.vibrato.shape        | string            | 'sine'            | Shape of the lfo waveform. Possible values are 'sine', 'sawtooth', 'square', and 'triangle'. |
| args.vibrato.magnitude    | number            | 3                 | How much the pitch changes. Sensible values are from 1 to 10. |
| args.vibrato.speed        | number            | 4                 | How quickly the pitch changes, in cycles per second.  Sensible values are from 0.1 to 10. |
| args.vibrato.attack       | number            | 0                 | Time in seconds for the vibrato effect to reach peak magnitude. |
| args.tremolo              | object            | none              | A vibrating volume effect. |
| args.tremolo.shape        | string            | 'sine'            | Shape of the lfo waveform. Possible values are 'sine', 'sawtooth', 'square', and 'triangle'. |
| args.tremolo.magnitude    | number            | 3                 | How much the volume changes. Sensible values are from 1 to 10. |
| args.tremolo.speed        | number            | 4                 | How quickly the volume changes, in cycles per second.  Sensible values are from 0.1 to 10. |
| args.tremolo.attack       | number            | 0                 | Time in seconds for the tremolo effect to reach peak magnitude. |
| args.tuna                 | object            | none              | Add effects from Tuna.js to this wad. Check out the Tuna.js documentation for more information. |


### Wad.prototype.play(args)

| Property                  | Type              | Default           | Description |
| ------------------------- | ----------------- | ----------------  | ----------- |
| args                      | object            | none              | One big object with all of the arguments for playing this wad. |
| args.volume               | number            | 1                 | This overrides the value for volume passed to the constructor, if it was set. |
| args.wait                 | number            | 0                 | Time in seconds between calling `play()` and actually triggering the note. |
| args.loop                 | boolean           | false             | This overrides the value for loop passed to the constructor, if it was set. |
| args.offset               | number            | 0                 | This overrides the value for offset passed to the constructor, if it was set. |
| args.rate                 | number            | 1                 | This overrides the value for rate passed to the constructor, if it was set. |
| args.pitch                | string            | 'A4'              | This overrides the value for pitch passed to the constructor, if it was set. |
| args.label                | string            | none              | A label that identifies this note. See 'play labels' for more information. |
| args.env                  | object            | See above         | This overrides the value for env passed to the constructor, if it was set. |
| args.panning              | number or array   | 0                 | This overrides the value for panning passed to the constructor, if it was set. |
| args.filter               | object or array   | none              | This overrides the value for filter passed to the constructor, if it was set. |
| args.delay                | object            | none              | This overrides the value for delay passed to the constructor, if it was set. |

If you intend to include a filter envelope or panning as an argument on `play()`, you should have set a filter envelope or panning when the wad was first instantiated. Pitches can be named by the note name, followed by the octave number. Possible values are from A0 to C8. Sharp and flat notes can be named enharmonically as either sharps or flats (G#2/Ab2). Check the Wad.pitches attribute for a complete mapping of note-names to frequencies.


The `play()` method returns a promise which resolves the wad itself, once the wad has finished playing. This makes it easy to play sounds sequentially in an async function.

```javascript
var tick = new Wad({source : 'https://www.myserver.com/audio/clockTick.wav'})
var tock = new Wad({source : 'https://www.myserver.com/audio/clockTock.wav'})

var tickTock = async function(){
    await tick.play()
    await tock.play()
    await tick.play()
    await tock.play()
}
tickTock();
```
The time it takes for the promise to resolve, in milliseconds, can be read on the wad at `tick.duration`. The `duration` property is calculated based on the wad's volume envelope (`env`), the duration of the audio file, and the `rate` parameter. Note that there are other ways to manipulate the duration of the sound (for example, `offset`) that can cause the `duration` parameter to be misleading. 

### Wad.prototype.stop(label)

| Property | Type    | Default | Description |
| -------- | ------ | -------- | ----------- |
| label    | string | none     | If you want to stop a note playing from this wad that is not the most recently triggered note, you can pass in the label of the notes you want to stop. |

### Wad.prototype.pause(label), Wad.prototype.unpause(args)

Audio clips (not oscillators) can be paused and unpaused during playback.

```javascript
fullSong.play()
fullSong.pause()
// wait...
fullSong.unpause()
```

The `pause` method accepts the same arguments as `stop`. The `unpause` method accepts the same arguments as `play`.


### Wad.prototype.setVolume(volume, timeConstant, label)

| Property     | Type   | Default         | Description |
| ------------ | ------ | --------------  | ----------- |
| volume       | number | none (required) | New volume setting. |
| timeConstant | string | none            | Time in seconds for 63% of the transition to complete. | 
| label        | string | none            | If you want to apply this change to a note playing from this wad that is not the most recently triggered note, you can pass in the label of the notes you want to stop. |

Change the volume of a wad at any time, even during playback.

### Wad.prototype.setPitch(pitch, timeConstant, label)

| Property     | Type   | Default         | Description |
| ------------ | ------ | --------------  | ----------- |
| pitch        | string | none (required) | New pitch setting. |
| timeConstant | string | none            | Time in seconds for 63% of the transition to complete. | 
| label        | string | none            | If you want to apply this change to a note playing from this wad that is not the most recently triggered note, you can pass in the label of the notes you want to stop. |

Change the pitch of a wad that uses an oscillator as its source at any time, even during playback.

### Wad.prototype.setDetune(detune, timeConstant, label)

| Property     | Type   | Default         | Description |
| ------------ | ------ | --------------  | ----------- |
| detune       | number | none (required) | New detune setting. |
| timeConstant | string | none            | Time in seconds for 63% of the transition to complete. | 
| label        | string | none            | If you want to apply this change to a note playing from this wad that is not the most recently triggered note, you can pass in the label of the notes you want to stop. |

Change the detune of a wad that uses an oscillator as its source at any time, even during playback.

### Wad.prototype.setPanning(panning, timeConstant)

| Property     | Type            | Default         | Description |
| ------------ | --------------- | --------------  | ----------- |
| panning      | object or array | none (required) | New detune setting. |
| timeConstant | string          | none            | Time in seconds for 63% of the transition to complete. | 

Change the panning of a wad at any time, even during playback.


### Wad.prototype.setRate(rate)

| Property  | Type    | Default         | Description       |
| --------- | ------  | --------------- | ----------------- |
| rate      | number  | none (required) | New rate setting. |

Change the rate of a wad that uses an audio clip as its source. 


### Wad.prototype.setReverb(wet)

| Property | Type    | Default         | Description             |
| -------- | ------  | --------------- | ----------------------- |
| wet      | number  | none (required) | New reverb.wet setting. |

Change the volume of the reverb of a wad.


### Wad.prototype.setDelay(delayTime, wet, feedback)

| Property  | Type   | Default  | Description |
| --------- | ------ | -------- | ----------- |
| delayTime | number | 0        | New delay.delayTime setting. |
| wet       | number | 0        | New delay.wet setting. |
| feedback  | number | 0        | New delay.feedback setting. |

Change the delay settings of a wad. 

### Wad.prototype.reverse()

Reverses a wad that uses an audio clip as its source.

### Wad.setVolume(volume)

| Property | Type    | Default         | Description                      |
| -------- | ------  | --------------- | -------------------------------  |
| volume   | number  | none (required) | New volume setting for all wads. |

### Wad.stopAll(label)

| Property | Type    | Default | Description                                                                   |
| -------- | ------  | ------- | ----------------------------------------------------------------------------  |
| label    | string  | none    | Stop all currently playing, or all currently playing wads with a given label. |

### new Wad.Poly(args)

| Property | Type    | Default | Description                                                                   |
| -------- | ------  | ------- | ----------------------------------------------------------------------------  |
| args        | object  | none    | One big object with all the arguments for creating this polywad.              |
| args.volume | number  | 1    | The default volume for this polywad.                             |
| args.panning | number or array  | 0  | The default panning for this polywad. See above.                             |
| args.filter | object  | none    | Filter(s) applied to this polywad. See above. 
| args.delay | object  | none    | Delay applied to this polywad. See above. 
| args.reverb | object  | none    | Reverb applied to this polywad. See above. 
| args.tuna   | object  | none    | Tuna effects applied to this polywad. See above, and/or read the Tuna docs. |                             |
| args.audioMeter   | object  | none    | Add a volume meter to this polywad that tells you if it's clipping. |                             |
| args.audioMeter.clipLevel   | number  | 0.98    | the level (0 to 1) that you would consider "clipping". |
| args.audioMeter.averaging   | number  | 0.95    | how "smoothed" you would like the meter to be over time. Should be between 0 and less than 1. |
| args.audioMeter.clipLag   | number  | 750 | how long you would like the "clipping" indicator to show after clipping has occured, in milliseconds. |
| args.compressor   | object  | none    | Add a compressor to this polywad. |                             |
| args.compressor.attack | number  | .003    | The amount of time, in seconds, to reduce the gain by 10dB. This parameter ranges from 0 to 1. |                             |
| args.compressor.knee | number  | 30    | A decibel value representing the range above the threshold where the curve smoothly transitions to the "ratio" portion. This parameter ranges from 0 to 40. |                             |
| args.compressor.ratio | number  | 12 | The amount of dB change in input for a 1 dB change in output. This parameter ranges from 1 to 20. |                             |
| args.compressor.release | number  | 0.25 | The amount of time (in seconds) to increase the gain by 10dB. This parameter ranges from 0 to 1. |                             |
| args.compressor.threshold | number  | -24 | The decibel value above which the compression will start taking effect. This parameter ranges from -100 to 0. |                             |
| args.recorder.options | object | ... | The options passed to the MediaRecorder constructor. |
| args.recorder.onstop | function | ... | The callback used to handle the onstop event from the MediaRecorder.

### Wad.Poly.prototype.add(wad)

| Property | Type                    | Default | Description                              |                            
| -------- | ----------------------- | ------- | ---------------------------------------- |
| wad      | object (wad or polywad) | none    | The wad you want to add to this polywad. |   

### Wad.Poly.prototype.remove(wad)

| Property | Type                    | Default | Description                              |                            
| -------- | ----------------------- | ------- | ---------------------------------------- |
| wad      | object (wad or polywad) | none    | The wad you want to remove from this polywad. |   

 
### Wad.Poly.prototype.play(args)

This method calls `play()` on all the wads inside this polywad. It accepts the same arguments as `Wad.prototype.play()`. 

### Wad.Poly.prototype.stop(label)

This method calls `stop()` on all the wads inside this polywad. It accepts the same arguments as `Wad.prototype.stop()`. 


### Wad.Poly.prototype.setVolume(volume)

Change the volume for this polywad (separate from the volume from of the individual wads it contains).

| Property | Type   | Default | Description                              |                            
| -------- | ------ | ------- | ---------------------------------------- |
| volume   | number | none    | The new volume setting for this polywad. |   


### Wad.Poly.prototype.setPitch(pitch)

This method sets the default pitch for each wad inside this polywad. 

| Property | Type   | Default | Description                              |                            
| -------- | ------ | ------- | ---------------------------------------- |
| volume   | number | none    | The new volume setting for this polywad. |   

### Wad.Poly.prototype.setPanning(panning, timeConstant)

| Property     | Type            | Default         | Description |
| ------------ | --------------- | --------------  | ----------- |
| panning      | number or array | none (required) | New panning setting. |
| timeConstant | string          | none            | Time in seconds for 63% of the transition to complete. | 

Change the panning of this polywad at any time, even during playback.

### Wad.Poly.prototype.updatePitch()

This method is used for pitch detection. After calling it, the polywad will calculate the frequency of its output, and write that information to `this.pitch` and `this.noteName`.


### Wad.Poly.prototype.stopUpdatingPitch()

This method stops the polywad from continuing to detect the pitch in real time. 

### Wad.assignMidiMap(midiMap, deviceIndex, success, failure)

This method is used to set up a MIDI event handler. 

| Property | Type   | Default | Description                              |                            
| -------- | ------ | ------- | ---------------------------------------- |
| midiMap   | function | none (required) | An event handler that describes what happens when your browser receives MIDI data. |
| deviceIndex | number | 0 | If you have more than one connected MIDI device, this argument lets you specify which one you want to handle events for. |
| success | function | none | A callback function that runs after successfully setting up the MIDI map. |
| failure | function | none | A callback function that runs after failing to set up the MIDI map. |


## Showcase

Here are some examples of music, games, and other projects that people have built with WadJS. 
If you'd like your work to be featured here, feel free to send me a link, or just create a pull request. 

Music by @Linsheng - https://lenshang.github.io/trigon.js/index.htm
    
Trombone.js by @bignimbus - https://github.com/bignimbus/trombone.js

