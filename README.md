<h1>Wad</h1>


Wad is a Javascript library for manipulating audio using the new HTML5 Audio API.  It greatly simplifies the process of creating, playing, and manipulating audio, either for real-time playback, or at scheduled intervals.  Wad provides a simple interface to use many features one would find in a desktop DAW (digital audio workstation), but doesn't require the user to worry about sending XHR requests or setting up complex audio graphs.  



<h2>Usage</h2>


The simplest use case is loading and playing a single audio file.  

<pre><code>var bell = new Wad({source : 'http://www.myserver.com/audio/bell.wav'})
bell.play()
bell.stop()</code></pre>


Behind the scenes, Wad sends an XMLHttpRequest to the source URL, so you will need a server running to respond to the request. You can't simply test it with local files, like you can with an HTML &lt;audio> tag.  

You can also create oscillators using the same syntax, by specifying 'sine', 'square', 'sawtooth', or 'triangle' as the source.

<pre><code>var saw = new Wad({source : 'sawtooth'})</code></pre>

The peak volume can be set during the creation of a wad, or any time afterwards. The default value is 1.

<pre><code>var saw = new Wad({source : 'sawtooth', volume : .9})
saw.setVolume(0.5)</code></pre>


<h3>Constructor Arguments</h3>

The Wad constructor supports many optional arguments to modify your sound, from simple settings such as peak volume, to more powerful things like ADSR envelopes and filters.  If not set explicitly, the ADSR envelope will have the values shown below. Filters, LFOs, and reverb are not used unless they are set explicitly. Filter type can be specified as either 'lowpass', 'highpass', 'bandpass', 'lowshelf', 'highshelf', 'peaking', 'notch', or 'allpass'.

<pre><code>var saw = new Wad({
  source : 'sawtooth',
  volume : 1.0, // Peak volume can range from 0 to an arbitrarily high number, but you probably shouldn't set it higher than 1.
  env : {
    attack : 0.0, // Time in seconds from onset to peak volume.  Common values for oscillators may range from 0.05 to 0.3.
    decay : 0.0, // Time in seconds from peak volume to sustain volume.
    sustain : 1.0, // Sustain volume level. This is a percent of the peak volume, so sensible values are between 0 and 1.
    hold : 9001, // Time in seconds to maintain the sustain volume level. If this is not set to a lower value, oscillators must be manually stopped by calling their stop() method.  
    release : 0 // Time in seconds from the end of the hold period to zero volume, or from calling stop() to zero volume.  
  },
  filter : {
    type : 'lowpass', // What type of filter is applied.
    frequency : 600, // The frequency, in hertz, to which the filter is applied.
    q : 1 // Q-factor.  No one knows what this does. The default value is 1. Sensible values are from 0 to 10.
    env : { // Filter envelope.
      frequency : 800, If this is set, filter frequency will slide from filter.frequency to filter.env.frequency when a note is triggered.
      attack : 0.5 // Time in seconds for the filter frequency to slide from filter.frequency to filter.env.frequency
  },
  reverb : {
    wet : 1 // Volume of the reverberations.  
  }
})</code></pre>

<h3>Configuring Reverb</h3>

In order to use reverb, you will need a server to send an impulse response via XmlHttpRequest. An impulse response is a small audio file, like a wav or mp3, that describes the acoustic characteristics of a physical space.  By default, Wad.js serves a sample impulse response that you can use freely.  However, it is recommended that you use your own impulse response. Modify the variable 'impulseURL' at the top of Wad.js to serve an impulse response from a different URL. You can make your own impulse response, but it might be easier to just <a href="http://www.voxengo.com/impulses/">find one online</a>.

<h3>Play Arguments</h3>

The <code>play()</code> method also accepts optional arguments: volume, pitch, envelope, and filter. Pitches can be named by the note name, followed by the octave number. Possible values are from A0 to C8. Sharp and flat notes can be named enharmonically as either sharps or flats (G#2/Ab2), but don't try to be pedantic. There is no mapping for C## or Fb. Check the Wad.pitches attribute for a complete mapping of note-names to frequencies.   

<pre><code>var saw = new Wad({source : 'sawtooth'})
saw.play({
  volume : 0.8,
  pitch : 'A4', // A4 is 440 hertz.
  env : {hold : 9001},
  filter : {frequency : 900}
}) </code></pre>


If you like, you can also select a pitch by frequency.

<code>saw.play({pitch : 440})</code>



To Do
---


Panning

Arbitrary LFO's

Microphone input







