(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module unless amdModuleId is set
    define([], function () {
      return (root['Wad'] = factory());
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    root['Wad'] = factory();
  }
}(this, function () {

(function(window){

  var WORKER_PATH = 'recorderWorker.js';

  var Recorder = function(source, cfg){
    var config = cfg || {};
    var bufferLen = config.bufferLen || 4096;
    var numChannels = config.numChannels || 2;
    this.context = source.context;
    this.node = (this.context.createScriptProcessor ||
                 this.context.createJavaScriptNode).call(this.context,
                 bufferLen, numChannels, numChannels);
    var worker = new Worker(config.workerPath || WORKER_PATH);
    worker.postMessage({
      command: 'init',
      config: {
        sampleRate: this.context.sampleRate,
        numChannels: numChannels
      }
    });
    var recording = false,
      currCallback;

    this.node.onaudioprocess = function(e){
      if (!recording) return;
      var buffer = [];
      for (var channel = 0; channel < numChannels; channel++){
          buffer.push(e.inputBuffer.getChannelData(channel));
      }
      worker.postMessage({
        command: 'record',
        buffer: buffer
      });
    }

    this.configure = function(cfg){
      for (var prop in cfg){
        if (cfg.hasOwnProperty(prop)){
          config[prop] = cfg[prop];
        }
      }
    }

    this.record = function(){
      recording = true;
    }

    this.stop = function(){
      recording = false;
    }

    this.clear = function(){
      worker.postMessage({ command: 'clear' });
    }

    this.getBuffer = function(cb) {
      currCallback = cb || config.callback;
      worker.postMessage({ command: 'getBuffer' })
    }

    this.exportWAV = function(cb, type){
      currCallback = cb || config.callback;
      type = type || config.type || 'audio/wav';
      if (!currCallback) throw new Error('Callback not set');
      worker.postMessage({
        command: 'exportWAV',
        type: type
      });
    }

    worker.onmessage = function(e){
      var blob = e.data;
      currCallback(blob);
    }

    source.connect(this.node);
    this.node.connect(this.context.destination);    //this should not be necessary
  };

  Recorder.forceDownload = function(blob, filename){
    var url = (window.URL || window.webkitURL).createObjectURL(blob);
    var link = window.document.createElement('a');
    link.href = url;
    link.download = filename || 'output.wav';
    var click = document.createEvent("Event");
    click.initEvent("click", true, true);
    link.dispatchEvent(click);
  }

  window.Recorder = Recorder;

})(window);;/*
    Copyright (c) 2012 DinahMoe AB & Oskar Eriksson

    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation
    files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy,
    modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software
    is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
    DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
    OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function(window) {
    var userContext,
        userInstance,
        pipe = function(param, val) {
            param.value = val;
        },
        Super = Object.create(null, {
            activate: {
                writable: true,
                value: function(doActivate) {
                    if (doActivate) {
                        this.input.disconnect();
                        this.input.connect(this.activateNode);
                        if (this.activateCallback) {
                            this.activateCallback(doActivate);
                        }
                    } else {
                        this.input.disconnect();
                        this.input.connect(this.output);
                    }
                }
            },
            bypass: {
                get: function() {
                    return this._bypass;
                },
                set: function(value) {
                    if (this._lastBypassValue === value) {
                        return;
                    }
                    this._bypass = value;
                    this.activate(!value);
                    this._lastBypassValue = value;
                }
            },
            connect: {
                value: function(target) {
                    this.output.connect(target);
                }
            },
            disconnect: {
                value: function(target) {
                    this.output.disconnect(target);
                }
            },
            connectInOrder: {
                value: function(nodeArray) {
                    var i = nodeArray.length - 1;
                    while (i--) {
                        if (!nodeArray[i].connect) {
                            return console.error("AudioNode.connectInOrder: TypeError: Not an AudioNode.", nodeArray[i]);
                        }
                        if (nodeArray[i + 1].input) {
                            nodeArray[i].connect(nodeArray[i + 1].input);
                        } else {
                            nodeArray[i].connect(nodeArray[i + 1]);
                        }
                    }
                }
            },
            getDefaults: {
                value: function() {
                    var result = {};
                    for (var key in this.defaults) {
                        result[key] = this.defaults[key].value;
                    }
                    return result;
                }
            },
            automate: {
                value: function(property, value, duration, startTime) {
                    var start = startTime ? ~~(startTime / 1000) : userContext.currentTime,
                        dur = duration ? ~~(duration / 1000) : 0,
                        _is = this.defaults[property],
                        param = this[property],
                        method;

                    if (param) {
                        if (_is.automatable) {
                            if (!duration) {
                                method = "setValueAtTime";
                            } else {
                                method = "linearRampToValueAtTime";
                                param.cancelScheduledValues(start);
                                param.setValueAtTime(param.value, start);
                            }
                            param[method](value, dur + start);
                        } else {
                            param = value;
                        }
                    } else {
                        console.error("Invalid Property for " + this.name);
                    }
                }
            }
        }),
        FLOAT = "float",
        BOOLEAN = "boolean",
        STRING = "string",
        INT = "int";

    if (typeof module !== "undefined" && module.exports) {
        module.exports = Tuna;
    } else if (typeof define === "function") {
        window.define("Tuna", definition);
    } else {
        window.Tuna = Tuna;
    }

    function definition() {
        return Tuna;
    }

    function Tuna(context) {
        if (!(this instanceof Tuna)) {
            return new Tuna(context);
        }
        if (!window.AudioContext) {
            window.AudioContext = window.webkitAudioContext;
        }
        if (!context) {
            console.log("tuna.js: Missing audio context! Creating a new context for you.");
            context = window.AudioContext && (new window.AudioContext());
        }
        if (!context) {
            throw new Error("Tuna cannot initialize because this environment does not support web audio.");
        }
        connectify(context);
        userContext = context;
        userInstance = this;
    }

    function connectify(context) {
        if (context.__connectified__ === true) return;

        var gain = context.createGain(),
            proto = Object.getPrototypeOf(Object.getPrototypeOf(gain)),
            oconnect = proto.connect;

        proto.connect = shimConnect;
        context.__connectified__ = true; // Prevent overriding connect more than once

        function shimConnect() {
            var node = Array.prototype.shift.apply(arguments);
            node = Super.isPrototypeOf ? (Super.isPrototypeOf(node) ? node.input : node) : (node.input || node);
            arguments = Array.prototype.slice.call(arguments);
            arguments.unshift(node);
            oconnect.apply(this, arguments);
            return node;
        }
    }

    function dbToWAVolume(db) {
        return Math.max(0, Math.round(100 * Math.pow(2, db / 6)) / 100);
    }

    function fmod(x, y) {
        // http://kevin.vanzonneveld.net
        // *     example 1: fmod(5.7, 1.3);
        // *     returns 1: 0.5
        var tmp, tmp2, p = 0,
            pY = 0,
            l = 0.0,
            l2 = 0.0;

        tmp = x.toExponential().match(/^.\.?(.*)e(.+)$/);
        p = parseInt(tmp[2], 10) - (tmp[1] + "").length;
        tmp = y.toExponential().match(/^.\.?(.*)e(.+)$/);
        pY = parseInt(tmp[2], 10) - (tmp[1] + "").length;

        if (pY > p) {
            p = pY;
        }

        tmp2 = (x % y);

        if (p < -100 || p > 20) {
            // toFixed will give an out of bound error so we fix it like this:
            l = Math.round(Math.log(tmp2) / Math.log(10));
            l2 = Math.pow(10, l);

            return (tmp2 / l2).toFixed(l - p) * l2;
        } else {
            return parseFloat(tmp2.toFixed(-p));
        }
    }

    function sign(x) {
        if (x === 0) {
            return 1;
        } else {
            return Math.abs(x) / x;
        }
    }

    function tanh(n) {
        return (Math.exp(n) - Math.exp(-n)) / (Math.exp(n) + Math.exp(-n));
    }

    function initValue(userVal, defaultVal) {
        return userVal === undefined ? defaultVal : userVal;
    }

    Tuna.prototype.Bitcrusher = function(properties) {
        if (!properties) {
            properties = this.getDefaults();
        }
        this.bufferSize = properties.bufferSize || this.defaults.bufferSize.value;

        this.input = userContext.createGain();
        this.activateNode = userContext.createGain();
        this.processor = userContext.createScriptProcessor(this.bufferSize, 1, 1);
        this.output = userContext.createGain();

        this.activateNode.connect(this.processor);
        this.processor.connect(this.output);

        var phaser = 0,
            last = 0,
            input, output, step, i, length;
        this.processor.onaudioprocess = function(e) {
            input = e.inputBuffer.getChannelData(0),
            output = e.outputBuffer.getChannelData(0),
            step = Math.pow(1 / 2, this.bits);
            length = input.length;
            for (i = 0; i < length; i++) {
                phaser += this.normfreq;
                if (phaser >= 1.0) {
                    phaser -= 1.0;
                    last = step * Math.floor(input[i] / step + 0.5);
                }
                output[i] = last;
            }
        };

        this.bits = properties.bits || this.defaults.bits.value;
        this.normfreq = initValue(properties.normfreq, this.defaults.normfreq.value);
        this.bypass = properties.bypass || false;
    };
    Tuna.prototype.Bitcrusher.prototype = Object.create(Super, {
        name: {
            value: "Bitcrusher"
        },
        defaults: {
            writable: true,
            value: {
                bits: {
                    value: 4,
                    min: 1,
                    max: 16,
                    automatable: false,
                    type: INT
                },
                bufferSize: {
                    value: 4096,
                    min: 256,
                    max: 16384,
                    automatable: false,
                    type: INT
                },
                bypass: {
                    value: false,
                    automatable: false,
                    type: BOOLEAN
                },
                normfreq: {
                    value: 0.1,
                    min: 0.0001,
                    max: 1.0,
                    automatable: false,
                    type: FLOAT
                }
            }
        },
        bits: {
            enumerable: true,
            get: function() {
                return this.processor.bits;
            },
            set: function(value) {
                this.processor.bits = value;
            }
        },
        normfreq: {
            enumerable: true,
            get: function() {
                return this.processor.normfreq;
            },
            set: function(value) {
                this.processor.normfreq = value;
            }
        }
    });

    Tuna.prototype.Cabinet = function(properties) {
        if (!properties) {
            properties = this.getDefaults();
        }
        this.input = userContext.createGain();
        this.activateNode = userContext.createGain();
        this.convolver = this.newConvolver(properties.impulsePath ||
            "../impulses/impulse_guitar.wav");
        this.makeupNode = userContext.createGain();
        this.output = userContext.createGain();

        this.activateNode.connect(this.convolver.input);
        this.convolver.output.connect(this.makeupNode);
        this.makeupNode.connect(this.output);

        this.makeupGain = initValue(properties.makeupGain, this.defaults
            .makeupGain);
        this.bypass = properties.bypass || false;
    };
    Tuna.prototype.Cabinet.prototype = Object.create(Super, {
        name: {
            value: "Cabinet"
        },
        defaults: {
            writable: true,
            value: {
                makeupGain: {
                    value: 1,
                    min: 0,
                    max: 20,
                    automatable: true,
                    type: FLOAT
                },
                bypass: {
                    value: false,
                    automatable: false,
                    type: BOOLEAN
                }
            }
        },
        makeupGain: {
            enumerable: true,
            get: function() {
                return this.makeupNode.gain;
            },
            set: function(value) {
                this.makeupNode.gain.value = value;
            }
        },
        newConvolver: {
            value: function(impulsePath) {
                return new userInstance.Convolver({
                    impulse: impulsePath,
                    dryLevel: 0,
                    wetLevel: 1
                });
            }
        }
    });

    Tuna.prototype.Chorus = function(properties) {
        if (!properties) {
            properties = this.getDefaults();
        }
        this.input = userContext.createGain();
        this.attenuator = this.activateNode = userContext.createGain();
        this.splitter = userContext.createChannelSplitter(2);
        this.delayL = userContext.createDelay();
        this.delayR = userContext.createDelay();
        this.feedbackGainNodeLR = userContext.createGain();
        this.feedbackGainNodeRL = userContext.createGain();
        this.merger = userContext.createChannelMerger(2);
        this.output = userContext.createGain();

        this.lfoL = new userInstance.LFO({
            target: this.delayL.delayTime,
            callback: pipe
        });
        this.lfoR = new userInstance.LFO({
            target: this.delayR.delayTime,
            callback: pipe
        });

        this.input.connect(this.attenuator);
        this.attenuator.connect(this.output);
        this.attenuator.connect(this.splitter);
        this.splitter.connect(this.delayL, 0);
        this.splitter.connect(this.delayR, 1);
        this.delayL.connect(this.feedbackGainNodeLR);
        this.delayR.connect(this.feedbackGainNodeRL);
        this.feedbackGainNodeLR.connect(this.delayR);
        this.feedbackGainNodeRL.connect(this.delayL);
        this.delayL.connect(this.merger, 0, 0);
        this.delayR.connect(this.merger, 0, 1);
        this.merger.connect(this.output);

        this.feedback = initValue(properties.feedback, this.defaults.feedback
            .value);
        this.rate = initValue(properties.rate, this.defaults.rate.value);
        this.delay = initValue(properties.delay, this.defaults.delay.value);
        this.depth = initValue(properties.depth, this.defaults.depth.value);
        this.lfoR.phase = Math.PI / 2;
        this.attenuator.gain.value = 0.6934; // 1 / (10 ^ (((20 * log10(3)) / 3) / 20))
        this.lfoL.activate(true);
        this.lfoR.activate(true);
        this.bypass = properties.bypass || false;
    };
    Tuna.prototype.Chorus.prototype = Object.create(Super, {
        name: {
            value: "Chorus"
        },
        defaults: {
            writable: true,
            value: {
                feedback: {
                    value: 0.4,
                    min: 0,
                    max: 0.95,
                    automatable: false,
                    type: FLOAT
                },
                delay: {
                    value: 0.0045,
                    min: 0,
                    max: 1,
                    automatable: false,
                    type: FLOAT
                },
                depth: {
                    value: 0.7,
                    min: 0,
                    max: 1,
                    automatable: false,
                    type: FLOAT
                },
                rate: {
                    value: 1.5,
                    min: 0,
                    max: 8,
                    automatable: false,
                    type: FLOAT
                },
                bypass: {
                    value: false,
                    automatable: false,
                    type: BOOLEAN
                }
            }
        },
        delay: {
            enumerable: true,
            get: function() {
                return this._delay;
            },
            set: function(value) {
                this._delay = 0.0002 * (Math.pow(10, value) * 2);
                this.lfoL.offset = this._delay;
                this.lfoR.offset = this._delay;
                this._depth = this._depth;
            }
        },
        depth: {
            enumerable: true,
            get: function() {
                return this._depth;
            },
            set: function(value) {
                this._depth = value;
                this.lfoL.oscillation = this._depth * this._delay;
                this.lfoR.oscillation = this._depth * this._delay;
            }
        },
        feedback: {
            enumerable: true,
            get: function() {
                return this._feedback;
            },
            set: function(value) {
                this._feedback = value;
                this.feedbackGainNodeLR.gain.value = this._feedback;
                this.feedbackGainNodeRL.gain.value = this._feedback;
            }
        },
        rate: {
            enumerable: true,
            get: function() {
                return this._rate;
            },
            set: function(value) {
                this._rate = value;
                this.lfoL.frequency = this._rate;
                this.lfoR.frequency = this._rate;
            }
        }
    });

    Tuna.prototype.Compressor = function(properties) {
        if (!properties) {
            properties = this.getDefaults();
        }
        this.input = userContext.createGain();
        this.compNode = this.activateNode = userContext.createDynamicsCompressor();
        this.makeupNode = userContext.createGain();
        this.output = userContext.createGain();

        this.compNode.connect(this.makeupNode);
        this.makeupNode.connect(this.output);

        this.automakeup = initValue(properties.automakeup, this.defaults
            .automakeup
            .value);
        this.makeupGain = properties.makeupGain || this.defaults.makeupGain
            .value;
        this.threshold = initValue(properties.threshold, this.defaults.threshold
            .value);
        this.release = properties.release || this.defaults.release.value;
        this.attack = initValue(properties.attack, this.defaults.attack
            .value);
        this.ratio = properties.ratio || this.defaults.ratio.value;
        this.knee = initValue(properties.knee, this.defaults.knee.value);
        this.bypass = properties.bypass || false;
    };
    Tuna.prototype.Compressor.prototype = Object.create(Super, {
        name: {
            value: "Compressor"
        },
        defaults: {
            writable: true,
            value: {
                threshold: {
                    value: -20,
                    min: -60,
                    max: 0,
                    automatable: true,
                    type: FLOAT
                },
                release: {
                    value: 250,
                    min: 10,
                    max: 2000,
                    automatable: true,
                    type: FLOAT
                },
                makeupGain: {
                    value: 1,
                    min: 1,
                    max: 100,
                    automatable: true,
                    type: FLOAT
                },
                attack: {
                    value: 1,
                    min: 0,
                    max: 1000,
                    automatable: true,
                    type: FLOAT
                },
                ratio: {
                    value: 4,
                    min: 1,
                    max: 50,
                    automatable: true,
                    type: FLOAT
                },
                knee: {
                    value: 5,
                    min: 0,
                    max: 40,
                    automatable: true,
                    type: FLOAT
                },
                automakeup: {
                    value: false,
                    automatable: false,
                    type: BOOLEAN
                },
                bypass: {
                    value: false,
                    automatable: false,
                    type: BOOLEAN
                }
            }
        },
        computeMakeup: {
            value: function() {
                var magicCoefficient = 4,
                    // raise me if the output is too hot
                    c = this.compNode;
                return -(c.threshold.value - c.threshold.value /
                        c.ratio.value) /
                    magicCoefficient;
            }
        },
        automakeup: {
            enumerable: true,
            get: function() {
                return this._automakeup;
            },
            set: function(value) {
                this._automakeup = value;
                if (this._automakeup) this.makeupGain = this.computeMakeup();
            }
        },
        threshold: {
            enumerable: true,
            get: function() {
                return this.compNode.threshold;
            },
            set: function(value) {
                this.compNode.threshold.value = value;
                if (this._automakeup) this.makeupGain = this.computeMakeup();
            }
        },
        ratio: {
            enumerable: true,
            get: function() {
                return this.compNode.ratio;
            },
            set: function(value) {
                this.compNode.ratio.value = value;
                if (this._automakeup) this.makeupGain = this.computeMakeup();
            }
        },
        knee: {
            enumerable: true,
            get: function() {
                return this.compNode.knee;
            },
            set: function(value) {
                this.compNode.knee.value = value;
                if (this._automakeup) this.makeupGain = this.computeMakeup();
            }
        },
        attack: {
            enumerable: true,
            get: function() {
                return this.compNode.attack;
            },
            set: function(value) {
                this.compNode.attack.value = value / 1000;
            }
        },
        release: {
            enumerable: true,
            get: function() {
                return this.compNode.release;
            },
            set: function(value) {
                this.compNode.release = value / 1000;
            }
        },
        makeupGain: {
            enumerable: true,
            get: function() {
                return this.makeupNode.gain;
            },
            set: function(value) {
                this.makeupNode.gain.value = dbToWAVolume(value);
            }
        }
    });

    Tuna.prototype.Convolver = function(properties) {
        if (!properties) {
            properties = this.getDefaults();
        }
        this.input = userContext.createGain();
        this.activateNode = userContext.createGain();
        this.convolver = userContext.createConvolver();
        this.dry = userContext.createGain();
        this.filterLow = userContext.createBiquadFilter();
        this.filterHigh = userContext.createBiquadFilter();
        this.wet = userContext.createGain();
        this.output = userContext.createGain();

        this.activateNode.connect(this.filterLow);
        this.activateNode.connect(this.dry);
        this.filterLow.connect(this.filterHigh);
        this.filterHigh.connect(this.convolver);
        this.convolver.connect(this.wet);
        this.wet.connect(this.output);
        this.dry.connect(this.output);

        this.dryLevel = initValue(properties.dryLevel, this.defaults.dryLevel
            .value);
        this.wetLevel = initValue(properties.wetLevel, this.defaults.wetLevel
            .value);
        this.highCut = properties.highCut || this.defaults.highCut.value;
        this.buffer = properties.impulse ||
            "../impulses/ir_rev_short.wav";
        this.lowCut = properties.lowCut || this.defaults.lowCut.value;
        this.level = initValue(properties.level, this.defaults.level.value);
        this.filterHigh.type = "lowpass";
        this.filterLow.type = "highpass";
        this.bypass = properties.bypass || false;
    };
    Tuna.prototype.Convolver.prototype = Object.create(Super, {
        name: {
            value: "Convolver"
        },
        defaults: {
            writable: true,
            value: {
                highCut: {
                    value: 22050,
                    min: 20,
                    max: 22050,
                    automatable: true,
                    type: FLOAT
                },
                lowCut: {
                    value: 20,
                    min: 20,
                    max: 22050,
                    automatable: true,
                    type: FLOAT
                },
                dryLevel: {
                    value: 1,
                    min: 0,
                    max: 1,
                    automatable: true,
                    type: FLOAT
                },
                wetLevel: {
                    value: 1,
                    min: 0,
                    max: 1,
                    automatable: true,
                    type: FLOAT
                },
                level: {
                    value: 1,
                    min: 0,
                    max: 1,
                    automatable: true,
                    type: FLOAT
                }
            }
        },
        lowCut: {
            get: function() {
                return this.filterLow.frequency;
            },
            set: function(value) {
                this.filterLow.frequency.value = value;
            }
        },
        highCut: {
            get: function() {
                return this.filterHigh.frequency;
            },
            set: function(value) {
                this.filterHigh.frequency.value = value;
            }
        },
        level: {
            get: function() {
                return this.output.gain;
            },
            set: function(value) {
                this.output.gain.value = value;
            }
        },
        dryLevel: {
            get: function() {
                return this.dry.gain
            },
            set: function(value) {
                this.dry.gain.value = value;
            }
        },
        wetLevel: {
            get: function() {
                return this.wet.gain;
            },
            set: function(value) {
                this.wet.gain.value = value;
            }
        },
        buffer: {
            enumerable: false,
            get: function() {
                return this.convolver.buffer;
            },
            set: function(impulse) {
                var convolver = this.convolver,
                    xhr = new XMLHttpRequest();
                if (!impulse) {
                    console.log("Tuna.Convolver.setBuffer: Missing impulse path!");
                    return;
                }
                xhr.open("GET", impulse, true);
                xhr.responseType = "arraybuffer";
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                        if (xhr.status < 300 && xhr.status > 199 || xhr.status === 302) {
                            userContext.decodeAudioData(xhr.response, function(buffer) {
                                convolver.buffer = buffer;
                            }, function(e) {
                                if (e) console.log("Tuna.Convolver.setBuffer: Error decoding data" + e);
                            });
                        }
                    }
                };
                xhr.send(null);
            }
        }
    });

    Tuna.prototype.Delay = function(properties) {
        if (!properties) {
            properties = this.getDefaults();
        }
        this.input = userContext.createGain();
        this.activateNode = userContext.createGain();
        this.dry = userContext.createGain();
        this.wet = userContext.createGain();
        this.filter = userContext.createBiquadFilter();
        this.delay = userContext.createDelay();
        this.feedbackNode = userContext.createGain();
        this.output = userContext.createGain();

        this.activateNode.connect(this.delay);
        this.activateNode.connect(this.dry);
        this.delay.connect(this.filter);
        this.filter.connect(this.feedbackNode);
        this.feedbackNode.connect(this.delay);
        this.feedbackNode.connect(this.wet);
        this.wet.connect(this.output);
        this.dry.connect(this.output);

        this.delayTime = properties.delayTime || this.defaults.delayTime.value;
        this.feedback = initValue(properties.feedback, this.defaults.feedback.value);
        this.wetLevel = initValue(properties.wetLevel, this.defaults.wetLevel.value);
        this.dryLevel = initValue(properties.dryLevel, this.defaults.dryLevel.value);
        this.cutoff = properties.cutoff || this.defaults.cutoff.value;
        this.filter.type = "lowpass";
        this.bypass = properties.bypass || false;
    };
    Tuna.prototype.Delay.prototype = Object.create(Super, {
        name: {
            value: "Delay"
        },
        defaults: {
            writable: true,
            value: {
                delayTime: {
                    value: 100,
                    min: 20,
                    max: 1000,
                    automatable: false,
                    type: FLOAT
                },
                feedback: {
                    value: 0.45,
                    min: 0,
                    max: 0.9,
                    automatable: true,
                    type: FLOAT
                },
                cutoff: {
                    value: 20000,
                    min: 20,
                    max: 20000,
                    automatable: true,
                    type: FLOAT
                },
                wetLevel: {
                    value: 0.5,
                    min: 0,
                    max: 1,
                    automatable: true,
                    type: FLOAT
                },
                dryLevel: {
                    value: 1,
                    min: 0,
                    max: 1,
                    automatable: true,
                    type: FLOAT
                }
            }
        },
        delayTime: {
            enumerable: true,
            get: function() {
                return this.delay.delayTime;
            },
            set: function(value) {
                this.delay.delayTime.value = value / 1000;
            }
        },
        wetLevel: {
            enumerable: true,
            get: function() {
                return this.wet.gain;
            },
            set: function(value) {
                this.wet.gain.value = value;
            }
        },
        dryLevel: {
            enumerable: true,
            get: function() {
                return this.dry.gain;
            },
            set: function(value) {
                this.dry.gain.value = value;
            }
        },
        feedback: {
            enumerable: true,
            get: function() {
                return this.feedbackNode.gain;
            },
            set: function(value) {
                this.feedbackNode.gain.value = value;
            }
        },
        cutoff: {
            enumerable: true,
            get: function() {
                return this.filter.frequency;
            },
            set: function(value) {
                this.filter.frequency.value = value;
            }
        }
    });

    Tuna.prototype.Filter = function(properties) {
        if (!properties) {
            properties = this.getDefaults();
        }
        this.input = userContext.createGain();
        this.activateNode = userContext.createGain();
        this.filter = userContext.createBiquadFilter();
        this.output = userContext.createGain();

        this.activateNode.connect(this.filter);
        this.filter.connect(this.output);

        this.frequency = properties.frequency || this.defaults.frequency
            .value;
        this.Q = properties.resonance || this.defaults.Q.value;
        this.filterType = initValue(properties.filterType, this.defaults
            .filterType
            .value);
        this.gain = initValue(properties.gain, this.defaults.gain.value);
        this.bypass = properties.bypass || false;
    };
    Tuna.prototype.Filter.prototype = Object.create(Super, {
        name: {
            value: "Filter"
        },
        defaults: {
            writable: true,
            value: {
                frequency: {
                    value: 800,
                    min: 20,
                    max: 22050,
                    automatable: true,
                    type: FLOAT
                },
                Q: {
                    value: 1,
                    min: 0.001,
                    max: 100,
                    automatable: true,
                    type: FLOAT
                },
                gain: {
                    value: 0,
                    min: -40,
                    max: 40,
                    automatable: true,
                    type: FLOAT
                },
                bypass: {
                    value: false,
                    automatable: false,
                    type: BOOLEAN
                },
                filterType: {
                    value: "lowpass",
                    automatable: false,
                    type: STRING
                }
            }
        },
        filterType: {
            enumerable: true,
            get: function() {
                return this.filter.type;
            },
            set: function(value) {
                this.filter.type = value;
            }
        },
        Q: {
            enumerable: true,
            get: function() {
                return this.filter.Q;
            },
            set: function(value) {
                this.filter.Q.value = value;
            }
        },
        gain: {
            enumerable: true,
            get: function() {
                return this.filter.gain;
            },
            set: function(value) {
                this.filter.gain.value = value;
            }
        },
        frequency: {
            enumerable: true,
            get: function() {
                return this.filter.frequency;
            },
            set: function(value) {
                this.filter.frequency.value = value;
            }
        }
    });

    Tuna.prototype.MoogFilter = function(properties) {
        if (!properties) {
            properties = this.getDefaults();
        }
        this.bufferSize = properties.bufferSize || this.defaults.bufferSize
            .value;

        this.input = userContext.createGain();
        this.activateNode = userContext.createGain();
        this.processor = userContext.createScriptProcessor(this.bufferSize,
            1,
            1);
        this.output = userContext.createGain();

        this.activateNode.connect(this.processor);
        this.processor.connect(this.output);

        var in1, in2, in3, in4, out1, out2, out3, out4;
        in1 = in2 = in3 = in4 = out1 = out2 = out3 = out4 = 0.0;
        var input, output, f, fb, i, length;
        this.processor.onaudioprocess = function(e) {
            input = e.inputBuffer.getChannelData(0),
                output = e.outputBuffer.getChannelData(0),
                f = this.cutoff * 1.16,
                inputFactor = 0.35013 * (f * f) * (f * f);
            fb = this.resonance * (1.0 - 0.15 * f * f);
            length = input.length;
            for (i = 0; i < length; i++) {
                input[i] -= out4 * fb;
                input[i] *= inputFactor;
                out1 = input[i] + 0.3 * in1 + (1 - f) * out1; // Pole 1
                in1 = input[i];
                out2 = out1 + 0.3 * in2 + (1 - f) * out2; // Pole 2
                in2 = out1;
                out3 = out2 + 0.3 * in3 + (1 - f) * out3; // Pole 3
                in3 = out2;
                out4 = out3 + 0.3 * in4 + (1 - f) * out4; // Pole 4
                in4 = out3;
                output[i] = out4;
            }
        };

        this.cutoff = initValue(properties.cutoff, this.defaults.cutoff
            .value);
        this.resonance = initValue(properties.resonance, this.defaults.resonance
            .value);
        this.bypass = properties.bypass || false;
    };
    Tuna.prototype.MoogFilter.prototype = Object.create(Super, {
        name: {
            value: "MoogFilter"
        },
        defaults: {
            writable: true,
            value: {
                bufferSize: {
                    value: 4096,
                    min: 256,
                    max: 16384,
                    automatable: false,
                    type: INT
                },
                bypass: {
                    value: false,
                    automatable: false,
                    type: BOOLEAN
                },
                cutoff: {
                    value: 0.065,
                    min: 0.0001,
                    max: 1.0,
                    automatable: false,
                    type: FLOAT
                },
                resonance: {
                    value: 3.5,
                    min: 0.0,
                    max: 4.0,
                    automatable: false,
                    type: FLOAT
                }
            }
        },
        cutoff: {
            enumerable: true,
            get: function() {
                return this.processor.cutoff;
            },
            set: function(value) {
                this.processor.cutoff = value;
            }
        },
        resonance: {
            enumerable: true,
            get: function() {
                return this.processor.resonance;
            },
            set: function(value) {
                this.processor.resonance = value;
            }
        }
    });

    Tuna.prototype.Overdrive = function(properties) {
        if (!properties) {
            properties = this.getDefaults();
        }
        this.input = userContext.createGain();
        this.activateNode = userContext.createGain();
        this.inputDrive = userContext.createGain();
        this.waveshaper = userContext.createWaveShaper();
        this.outputDrive = userContext.createGain();
        this.output = userContext.createGain();

        this.activateNode.connect(this.inputDrive);
        this.inputDrive.connect(this.waveshaper);
        this.waveshaper.connect(this.outputDrive);
        this.outputDrive.connect(this.output);

        this.ws_table = new Float32Array(this.k_nSamples);
        this.drive = initValue(properties.drive, this.defaults.drive.value);
        this.outputGain = initValue(properties.outputGain, this.defaults
            .outputGain
            .value);
        this.curveAmount = initValue(properties.curveAmount, this.defaults
            .curveAmount
            .value);
        this.algorithmIndex = initValue(properties.algorithmIndex, this
            .defaults
            .algorithmIndex.value);
        this.bypass = properties.bypass || false;
    };
    Tuna.prototype.Overdrive.prototype = Object.create(Super, {
        name: {
            value: "Overdrive"
        },
        defaults: {
            writable: true,
            value: {
                drive: {
                    value: 1,
                    min: 0,
                    max: 1,
                    automatable: true,
                    type: FLOAT,
                    scaled: true
                },
                outputGain: {
                    value: 1,
                    min: 0,
                    max: 1,
                    automatable: true,
                    type: FLOAT,
                    scaled: true
                },
                curveAmount: {
                    value: 0.725,
                    min: 0,
                    max: 1,
                    automatable: false,
                    type: FLOAT
                },
                algorithmIndex: {
                    value: 0,
                    min: 0,
                    max: 5,
                    automatable: false,
                    type: INT
                }
            }
        },
        k_nSamples: {
            value: 8192
        },
        drive: {
            get: function() {
                return this.inputDrive.gain;
            },
            set: function(value) {
                this._drive = value;
            }
        },
        curveAmount: {
            get: function() {
                return this._curveAmount;
            },
            set: function(value) {
                this._curveAmount = value;
                if (this._algorithmIndex === undefined) {
                    this._algorithmIndex = 0;
                }
                this.waveshaperAlgorithms[this._algorithmIndex]
                    (this._curveAmount,
                        this.k_nSamples, this.ws_table);
                this.waveshaper.curve = this.ws_table;
            }
        },
        outputGain: {
            get: function() {
                return this.outputDrive.gain;
            },
            set: function(value) {
                this._outputGain = dbToWAVolume(value);
            }
        },
        algorithmIndex: {
            get: function() {
                return this._algorithmIndex;
            },
            set: function(value) {
                this._algorithmIndex = value;
                this.curveAmount = this._curveAmount;
            }
        },
        waveshaperAlgorithms: {
            value: [
                function(amount, n_samples, ws_table) {
                    amount = Math.min(amount, 0.9999);
                    var k = 2 * amount / (1 - amount),
                        i, x;
                    for (i = 0; i < n_samples; i++) {
                        x = i * 2 / n_samples - 1;
                        ws_table[i] = (1 + k) * x / (1 + k * Math.abs(x));
                    }
                },
                function(amount, n_samples, ws_table) {
                    var i, x, y;
                    for (i = 0; i < n_samples; i++) {
                        x = i * 2 / n_samples - 1;
                        y = ((0.5 * Math.pow((x + 1.4), 2)) - 1) * y >= 0 ? 5.8 : 1.2;
                        ws_table[i] = tanh(y);
                    }
                },
                function(amount, n_samples, ws_table) {
                    var i, x, y, a = 1 - amount;
                    for (i = 0; i < n_samples; i++) {
                        x = i * 2 / n_samples - 1;
                        y = x < 0 ? -Math.pow(Math.abs(x), a + 0.04) : Math.pow(x, a);
                        ws_table[i] = tanh(y * 2);
                    }
                },
                function(amount, n_samples, ws_table) {
                    var i, x, y, abx, a = 1 - amount > 0.99 ? 0.99 : 1 - amount;
                    for (i = 0; i < n_samples; i++) {
                        x = i * 2 / n_samples - 1;
                        abx = Math.abs(x);
                        if (abx < a) y = abx;
                        else if (abx > a) y = a + (abx - a) / (1 + Math.pow((abx - a) / (1 - a), 2));
                        else if (abx > 1) y = abx;
                        ws_table[i] = sign(x) * y * (1 / ((a + 1) / 2));
                    }
                },
                function(amount, n_samples, ws_table) { // fixed curve, amount doesn't do anything, the distortion is just from the drive
                    var i, x;
                    for (i = 0; i < n_samples; i++) {
                        x = i * 2 / n_samples - 1;
                        if (x < -0.08905) {
                            ws_table[i] = (-3 / 4) * (1 - (Math.pow((1 - (Math.abs(x) - 0.032857)), 12)) + (1 / 3) * (Math.abs(x) -
                                0.032847)) + 0.01;
                        } else if (x >= -0.08905 && x < 0.320018) {
                            ws_table[i] = (-6.153 * (x * x)) + 3.9375 * x;
                        } else {
                            ws_table[i] = 0.630035;
                        }
                    }
                },
                function(amount, n_samples, ws_table) {
                    var a = 2 + Math.round(amount * 14),
                        // we go from 2 to 16 bits, keep in mind for the UI
                        bits = Math.round(Math.pow(2, a - 1)),
                        // real number of quantization steps divided by 2
                        i, x;
                    for (i = 0; i < n_samples; i++) {
                        x = i * 2 / n_samples - 1;
                        ws_table[i] = Math.round(x * bits) / bits;
                    }
                }
            ]
        }
    });

    Tuna.prototype.Phaser = function(properties) {
        if (!properties) {
            properties = this.getDefaults();
        }
        this.input = userContext.createGain();
        this.splitter = this.activateNode = userContext.createChannelSplitter(2);
        this.filtersL = [];
        this.filtersR = [];
        this.feedbackGainNodeL = userContext.createGain();
        this.feedbackGainNodeR = userContext.createGain();
        this.merger = userContext.createChannelMerger(2);
        this.filteredSignal = userContext.createGain();
        this.output = userContext.createGain();
        this.lfoL = new userInstance.LFO({
            target: this.filtersL,
            callback: this.callback
        });
        this.lfoR = new userInstance.LFO({
            target: this.filtersR,
            callback: this.callback
        });

        var i = this.stage;
        while (i--) {
            this.filtersL[i] = userContext.createBiquadFilter();
            this.filtersR[i] = userContext.createBiquadFilter();
            this.filtersL[i].type = "allpass";
            this.filtersR[i].type = "allpass";
        }
        this.input.connect(this.splitter);
        this.input.connect(this.output);
        this.splitter.connect(this.filtersL[0], 0, 0);
        this.splitter.connect(this.filtersR[0], 1, 0);
        this.connectInOrder(this.filtersL);
        this.connectInOrder(this.filtersR);
        this.filtersL[this.stage - 1].connect(this.feedbackGainNodeL);
        this.filtersL[this.stage - 1].connect(this.merger, 0, 0);
        this.filtersR[this.stage - 1].connect(this.feedbackGainNodeR);
        this.filtersR[this.stage - 1].connect(this.merger, 0, 1);
        this.feedbackGainNodeL.connect(this.filtersL[0]);
        this.feedbackGainNodeR.connect(this.filtersR[0]);
        this.merger.connect(this.output);

        this.rate = initValue(properties.rate, this.defaults.rate.value);
        this.baseModulationFrequency = properties.baseModulationFrequency || this.defaults.baseModulationFrequency.value;
        this.depth = initValue(properties.depth, this.defaults.depth.value);
        this.feedback = initValue(properties.feedback, this.defaults.feedback.value);
        this.stereoPhase = initValue(properties.stereoPhase, this.defaults.stereoPhase.value);

        this.lfoL.activate(true);
        this.lfoR.activate(true);
        this.bypass = properties.bypass || false;
    };
    Tuna.prototype.Phaser.prototype = Object.create(Super, {
        name: {
            value: "Phaser"
        },
        stage: {
            value: 4
        },
        defaults: {
            writable: true,
            value: {
                rate: {
                    value: 0.1,
                    min: 0,
                    max: 8,
                    automatable: false,
                    type: FLOAT
                },
                depth: {
                    value: 0.6,
                    min: 0,
                    max: 1,
                    automatable: false,
                    type: FLOAT
                },
                feedback: {
                    value: 0.7,
                    min: 0,
                    max: 1,
                    automatable: false,
                    type: FLOAT
                },
                stereoPhase: {
                    value: 40,
                    min: 0,
                    max: 180,
                    automatable: false,
                    type: FLOAT
                },
                baseModulationFrequency: {
                    value: 700,
                    min: 500,
                    max: 1500,
                    automatable: false,
                    type: FLOAT
                }
            }
        },
        callback: {
            value: function(filters, value) {
                for (var stage = 0; stage < 4; stage++) {
                    filters[stage].frequency.value = value;
                }
            }
        },
        depth: {
            get: function() {
                return this._depth;
            },
            set: function(value) {
                this._depth = value;
                this.lfoL.oscillation = this._baseModulationFrequency * this._depth;
                this.lfoR.oscillation = this._baseModulationFrequency * this._depth;
            }
        },
        rate: {
            get: function() {
                return this._rate;
            },
            set: function(value) {
                this._rate = value;
                this.lfoL.frequency = this._rate;
                this.lfoR.frequency = this._rate;
            }
        },
        baseModulationFrequency: {
            enumerable: true,
            get: function() {
                return this._baseModulationFrequency;
            },
            set: function(value) {
                this._baseModulationFrequency = value;
                this.lfoL.offset = this._baseModulationFrequency;
                this.lfoR.offset = this._baseModulationFrequency;
                this._depth = this._depth;
            }
        },
        feedback: {
            get: function() {
                return this._feedback;
            },
            set: function(value) {
                this._feedback = value;
                this.feedbackGainNodeL.gain.value = this._feedback;
                this.feedbackGainNodeR.gain.value = this._feedback;
            }
        },
        stereoPhase: {
            get: function() {
                return this._stereoPhase;
            },
            set: function(value) {
                this._stereoPhase = value;
                var newPhase = this.lfoL._phase + this._stereoPhase *
                    Math.PI /
                    180;
                newPhase = fmod(newPhase, 2 * Math.PI);
                this.lfoR._phase = newPhase;
            }
        }
    });

    Tuna.prototype.PingPongDelay = function(properties) {
        if (!properties) {
            properties = this.getDefaults();
        }
        this.input = userContext.createGain();
        this.wetLevel = userContext.createGain();
        this.stereoToMonoMix = userContext.createGain();
        this.feedbackLevel = userContext.createGain();
        this.output = userContext.createGain();
        this.delayLeft = userContext.createDelay();
        this.delayRight = userContext.createDelay();

        this.activateNode = userContext.createGain();
        this.splitter = userContext.createChannelSplitter(2);
        this.merger = userContext.createChannelMerger(2);

        this.activateNode.connect(this.splitter);
        this.splitter.connect(this.stereoToMonoMix, 0, 0);
        this.splitter.connect(this.stereoToMonoMix, 1, 0);
        this.stereoToMonoMix.gain.value = .5;
        this.stereoToMonoMix.connect(this.wetLevel);
        this.wetLevel.connect(this.delayLeft);
        this.feedbackLevel.connect(this.delayLeft);
        this.delayLeft.connect(this.delayRight);
        this.delayRight.connect(this.feedbackLevel);
        this.delayLeft.connect(this.merger, 0, 0);
        this.delayRight.connect(this.merger, 0, 1);
        this.merger.connect(this.output);
        this.activateNode.connect(this.output);

        this.delayTimeLeft = properties.delayTimeLeft !== undefined ? properties.delayTimeLeft : this.defaults.delayTimeLeft.value;
        this.delayTimeRight = properties.delayTimeRight !== undefined ? properties.delayTimeRight : this.defaults.delayTimeRight.value;
        this.feedbackLevel.gain.value = properties.feedback !== undefined ? properties.feedback : this.defaults.feedback.value;
        this.wetLevel.gain.value = properties.wetLevel !== undefined ? properties.wetLevel : this.defaults.wetLevel.value;
        this.bypass = properties.bypass || false;
    };
    Tuna.prototype.PingPongDelay.prototype = Object.create(Super, {
        name: {
            value: "PingPongDelay"
        },
        delayTimeLeft: {
            enumerable: true,
            get: function() {
                return this._delayTimeLeft;
            },
            set: function(value) {
                this._delayTimeLeft = value;
                this.delayLeft.delayTime.value = value / 1000;
            }
        },
        delayTimeRight: {
            enumerable: true,
            get: function() {
                return this._delayTimeRight;
            },
            set: function(value) {
                this._delayTimeRight = value;
                this.delayRight.delayTime.value = value / 1000;
            }
        },
        defaults: {
            writable: true,
            value: {
                delayTimeLeft: {
                    value: 200,
                    min: 1,
                    max: 10000,
                    automatable: false,
                    type: INT
                },
                delayTimeRight: {
                    value: 400,
                    min: 1,
                    max: 10000,
                    automatable: false,
                    type: INT
                },
                feedback: {
                    value: 0.3,
                    min: 0,
                    max: 1,
                    automatable: false,
                    type: FLOAT
                },
                wetLevel: {
                    value: 0.5,
                    min: 0,
                    max: 1,
                    automatable: false,
                    type: FLOAT
                }
            }
        }
    });

    Tuna.prototype.Tremolo = function(properties) {
        if (!properties) {
            properties = this.getDefaults();
        }
        this.input = userContext.createGain();
        this.splitter = this.activateNode = userContext.createChannelSplitter(
                2),
            this.amplitudeL = userContext.createGain(), this.amplitudeR =
            userContext.createGain(), this.merger = userContext.createChannelMerger(
                2), this.output = userContext.createGain();
        this.lfoL = new userInstance.LFO({
            target: this.amplitudeL.gain,
            callback: pipe
        });
        this.lfoR = new userInstance.LFO({
            target: this.amplitudeR.gain,
            callback: pipe
        });

        this.input.connect(this.splitter);
        this.splitter.connect(this.amplitudeL, 0);
        this.splitter.connect(this.amplitudeR, 1);
        this.amplitudeL.connect(this.merger, 0, 0);
        this.amplitudeR.connect(this.merger, 0, 1);
        this.merger.connect(this.output);

        this.rate = properties.rate || this.defaults.rate.value;
        this.intensity = initValue(properties.intensity, this.defaults.intensity
            .value);
        this.stereoPhase = initValue(properties.stereoPhase, this.defaults
            .stereoPhase
            .value);

        this.lfoL.offset = 1 - (this.intensity / 2);
        this.lfoR.offset = 1 - (this.intensity / 2);
        this.lfoL.phase = this.stereoPhase * Math.PI / 180;

        this.lfoL.activate(true);
        this.lfoR.activate(true);
        this.bypass = properties.bypass || false;
    };
    Tuna.prototype.Tremolo.prototype = Object.create(Super, {
        name: {
            value: "Tremolo"
        },
        defaults: {
            writable: true,
            value: {
                intensity: {
                    value: 0.3,
                    min: 0,
                    max: 1,
                    automatable: false,
                    type: FLOAT
                },
                stereoPhase: {
                    value: 0,
                    min: 0,
                    max: 180,
                    automatable: false,
                    type: FLOAT
                },
                rate: {
                    value: 5,
                    min: 0.1,
                    max: 11,
                    automatable: false,
                    type: FLOAT
                }
            }
        },
        intensity: {
            enumerable: true,
            get: function() {
                return this._intensity;
            },
            set: function(value) {
                this._intensity = value;
                this.lfoL.offset = 1 - this._intensity / 2;
                this.lfoR.offset = 1 - this._intensity / 2;
                this.lfoL.oscillation = this._intensity;
                this.lfoR.oscillation = this._intensity;
            }
        },
        rate: {
            enumerable: true,
            get: function() {
                return this._rate;
            },
            set: function(value) {
                this._rate = value;
                this.lfoL.frequency = this._rate;
                this.lfoR.frequency = this._rate;
            }
        },
        stereoPhase: {
            enumerable: true,
            get: function() {
                return this._rate;
            },
            set: function(value) {
                this._stereoPhase = value;
                var newPhase = this.lfoL._phase + this._stereoPhase *
                    Math.PI /
                    180;
                newPhase = fmod(newPhase, 2 * Math.PI);
                this.lfoR.phase = newPhase;
            }
        }
    });

    Tuna.prototype.WahWah = function(properties) {
        if (!properties) {
            properties = this.getDefaults();
        }
        this.input = userContext.createGain();
        this.activateNode = userContext.createGain();
        this.envelopeFollower = new userInstance.EnvelopeFollower({
            target: this,
            callback: function(context, value) {
                context.sweep = value;
            }
        });
        this.filterBp = userContext.createBiquadFilter();
        this.filterPeaking = userContext.createBiquadFilter();
        this.output = userContext.createGain();

        //Connect AudioNodes
        this.activateNode.connect(this.filterBp);
        this.filterBp.connect(this.filterPeaking);
        this.filterPeaking.connect(this.output);

        //Set Properties
        this.init();
        this.automode = initValue(properties.enableAutoMode, this.defaults
            .automode
            .value);
        this.resonance = properties.resonance || this.defaults.resonance
            .value;
        this.sensitivity = initValue(properties.sensitivity, this.defaults
            .sensitivity
            .value);
        this.baseFrequency = initValue(properties.baseFrequency, this.defaults
            .baseFrequency
            .value);
        this.excursionOctaves = properties.excursionOctaves || this.defaults
            .excursionOctaves
            .value;
        this.sweep = initValue(properties.sweep, this.defaults.sweep.value);

        this.activateNode.gain.value = 2;
        this.envelopeFollower.activate(true);
        this.bypass = properties.bypass || false;
    };
    Tuna.prototype.WahWah.prototype = Object.create(Super, {
        name: {
            value: "WahWah"
        },
        defaults: {
            writable: true,
            value: {
                automode: {
                    value: true,
                    automatable: false,
                    type: BOOLEAN
                },
                baseFrequency: {
                    value: 0.5,
                    min: 0,
                    max: 1,
                    automatable: false,
                    type: FLOAT
                },
                excursionOctaves: {
                    value: 2,
                    min: 1,
                    max: 6,
                    automatable: false,
                    type: FLOAT
                },
                sweep: {
                    value: 0.2,
                    min: 0,
                    max: 1,
                    automatable: false,
                    type: FLOAT
                },
                resonance: {
                    value: 10,
                    min: 1,
                    max: 100,
                    automatable: false,
                    type: FLOAT
                },
                sensitivity: {
                    value: 0.5,
                    min: -1,
                    max: 1,
                    automatable: false,
                    type: FLOAT
                }
            }
        },
        activateCallback: {
            value: function(value) {
                this.automode = value;
            }
        },
        automode: {
            get: function() {
                return this._automode;
            },
            set: function(value) {
                this._automode = value;
                if (value) {
                    this.activateNode.connect(this.envelopeFollower.input);
                    this.envelopeFollower.activate(true);
                } else {
                    this.envelopeFollower.activate(false);
                    this.activateNode.disconnect();
                    this.activateNode.connect(this.filterBp);
                }
            }
        },
        filterFreqTimeout: {
            value: 0
        },
        setFilterFreq: {
            value: function() {
                try {
                    this.filterBp.frequency.value = this._baseFrequency + this._excursionFrequency * this._sweep;
                    this.filterPeaking.frequency.value = this._baseFrequency + this._excursionFrequency * this._sweep;
                } catch (e) {
                    clearTimeout(this.filterFreqTimeout);
                    //put on the next cycle to let all init properties be set
                    this.filterFreqTimeout = setTimeout(function() {
                        this.setFilterFreq();
                    }.bind(this), 0);
                }
            }
        },
        sweep: {
            enumerable: true,
            get: function() {
                return this._sweep.value;
            },
            set: function(value) {
                this._sweep = Math.pow(value > 1 ? 1 : value <
                    0 ? 0 :
                    value,
                    this._sensitivity);
                this.setFilterFreq();
            }
        },
        baseFrequency: {
            enumerable: true,
            get: function() {
                return this._baseFrequency;
            },
            set: function(value) {
                this._baseFrequency = 50 * Math.pow(10, value *
                    2);
                this._excursionFrequency = Math.min(userContext
                    .sampleRate /
                    2,
                    this.baseFrequency * Math.pow(2, this._excursionOctaves)
                );
                this.setFilterFreq();
            }
        },
        excursionOctaves: {
            enumerable: true,
            get: function() {
                return this._excursionOctaves;
            },
            set: function(value) {
                this._excursionOctaves = value;
                this._excursionFrequency = Math.min(userContext
                    .sampleRate /
                    2,
                    this.baseFrequency * Math.pow(2, this._excursionOctaves)
                );
                this.setFilterFreq();
            }
        },
        sensitivity: {
            enumerable: true,
            get: function() {
                return this._sensitivity;
            },
            set: function(value) {
                this._sensitivity = Math.pow(10, value);
            }
        },
        resonance: {
            enumerable: true,
            get: function() {
                return this._resonance;
            },
            set: function(value) {
                this._resonance = value;
                this.filterPeaking.Q = this._resonance;
            }
        },
        init: {
            value: function() {
                this.output.gain.value = 1;
                this.filterPeaking.type = "peaking";
                this.filterBp.type = "bandpass";
                this.filterPeaking.frequency.value = 100;
                this.filterPeaking.gain.value = 20;
                this.filterPeaking.Q.value = 5;
                this.filterBp.frequency.value = 100;
                this.filterBp.Q.value = 1;
            }
        }
    });

    Tuna.prototype.EnvelopeFollower = function(properties) {
        if (!properties) {
            properties = this.getDefaults();
        }
        this.input = userContext.createGain();
        this.jsNode = this.output = userContext.createScriptProcessor(
            this.buffersize,
            1, 1);

        this.input.connect(this.output);

        this.attackTime = initValue(properties.attackTime, this.defaults
            .attackTime
            .value);
        this.releaseTime = initValue(properties.releaseTime, this.defaults
            .releaseTime
            .value);
        this._envelope = 0;
        this.target = properties.target || {};
        this.callback = properties.callback || function() {};
    };
    Tuna.prototype.EnvelopeFollower.prototype = Object.create(Super, {
        name: {
            value: "EnvelopeFollower"
        },
        defaults: {
            value: {
                attackTime: {
                    value: 0.003,
                    min: 0,
                    max: 0.5,
                    automatable: false,
                    type: FLOAT
                },
                releaseTime: {
                    value: 0.5,
                    min: 0,
                    max: 0.5,
                    automatable: false,
                    type: FLOAT
                }
            }
        },
        buffersize: {
            value: 256
        },
        envelope: {
            value: 0
        },
        sampleRate: {
            value: 44100
        },
        attackTime: {
            enumerable: true,
            get: function() {
                return this._attackTime;
            },
            set: function(value) {
                this._attackTime = value;
                this._attackC = Math.exp(-1 / this._attackTime *
                    this.sampleRate /
                    this.buffersize);
            }
        },
        releaseTime: {
            enumerable: true,
            get: function() {
                return this._releaseTime;
            },
            set: function(value) {
                this._releaseTime = value;
                this._releaseC = Math.exp(-1 / this._releaseTime *
                    this.sampleRate /
                    this.buffersize);
            }
        },
        callback: {
            get: function() {
                return this._callback;
            },
            set: function(value) {
                if (typeof value === "function") {
                    this._callback = value;
                } else {
                    console.error("tuna.js: " + this.name +
                        ": Callback must be a function!");
                }
            }
        },
        target: {
            get: function() {
                return this._target;
            },
            set: function(value) {
                this._target = value;
            }
        },
        activate: {
            value: function(doActivate) {
                this.activated = doActivate;
                if (doActivate) {
                    this.jsNode.connect(userContext.destination);
                    this.jsNode.onaudioprocess = this.returnCompute(
                        this);
                } else {
                    this.jsNode.disconnect();
                    this.jsNode.onaudioprocess = null;
                }
            }
        },
        returnCompute: {
            value: function(instance) {
                return function(event) {
                    instance.compute(event);
                };
            }
        },
        compute: {
            value: function(event) {
                var count = event.inputBuffer.getChannelData(0)
                    .length,
                    channels = event.inputBuffer.numberOfChannels,
                    current, chan, rms, i;
                chan = rms = i = 0;
                if (channels > 1) { //need to mixdown
                    for (i = 0; i < count; ++i) {
                        for (; chan < channels; ++chan) {
                            current = event.inputBuffer.getChannelData(chan)[i];
                            rms += (current * current) / channels;
                        }
                    }
                } else {
                    for (i = 0; i < count; ++i) {
                        current = event.inputBuffer.getChannelData(0)[i];
                        rms += (current * current);
                    }
                }
                rms = Math.sqrt(rms);

                if (this._envelope < rms) {
                    this._envelope *= this._attackC;
                    this._envelope += (1 - this._attackC) * rms;
                } else {
                    this._envelope *= this._releaseC;
                    this._envelope += (1 - this._releaseC) *
                        rms;
                }
                this._callback(this._target, this._envelope);
            }
        }
    });

    Tuna.prototype.LFO = function(properties) {
        //Instantiate AudioNode
        this.output = userContext.createScriptProcessor(256, 1, 1);
        this.activateNode = userContext.destination;

        //Set Properties
        this.frequency = initValue(properties.frequency, this.defaults.frequency
            .value);
        this.offset = initValue(properties.offset, this.defaults.offset.value);
        this.oscillation = initValue(properties.oscillation, this.defaults
            .oscillation
            .value);
        this.phase = initValue(properties.phase, this.defaults.phase.value);
        this.target = properties.target || {};
        this.output.onaudioprocess = this.callback(properties.callback ||
            function() {});
        this.bypass = properties.bypass || false;
    };
    Tuna.prototype.LFO.prototype = Object.create(Super, {
        name: {
            value: "LFO"
        },
        bufferSize: {
            value: 256
        },
        sampleRate: {
            value: 44100
        },
        defaults: {
            value: {
                frequency: {
                    value: 1,
                    min: 0,
                    max: 20,
                    automatable: false,
                    type: FLOAT
                },
                offset: {
                    value: 0.85,
                    min: 0,
                    max: 22049,
                    automatable: false,
                    type: FLOAT
                },
                oscillation: {
                    value: 0.3,
                    min: -22050,
                    max: 22050,
                    automatable: false,
                    type: FLOAT
                },
                phase: {
                    value: 0,
                    min: 0,
                    max: 2 * Math.PI,
                    automatable: false,
                    type: FLOAT
                }
            }
        },
        frequency: {
            get: function() {
                return this._frequency;
            },
            set: function(value) {
                this._frequency = value;
                this._phaseInc = 2 * Math.PI * this._frequency *
                    this.bufferSize /
                    this.sampleRate;
            }
        },
        offset: {
            get: function() {
                return this._offset;
            },
            set: function(value) {
                this._offset = value;
            }
        },
        oscillation: {
            get: function() {
                return this._oscillation;
            },
            set: function(value) {
                this._oscillation = value;
            }
        },
        phase: {
            get: function() {
                return this._phase;
            },
            set: function(value) {
                this._phase = value;
            }
        },
        target: {
            get: function() {
                return this._target;
            },
            set: function(value) {
                this._target = value;
            }
        },
        activate: {
            value: function(doActivate) {
                if (!doActivate) {
                    this.output.disconnect(userContext.destination);
                } else {
                    this.output.connect(userContext.destination);
                }
            }
        },
        callback: {
            value: function(callback) {
                var that = this;
                return function() {
                    that._phase += that._phaseInc;
                    if (that._phase > 2 * Math.PI) {
                        that._phase = 0;
                    }
                    callback(that._target, that._offset +
                        that._oscillation *
                        Math.sin(that._phase));
                };
            }
        }
    });

    Tuna.toString = Tuna.prototype.toString = function() {
        return "Please visit https://github.com/Theodeus/tuna/wiki for instructions on how to use Tuna.js";
    };
})(this);
;

/** Let's do the vendor-prefix dance. **/
    var audioContext = window.AudioContext || window.webkitAudioContext;
    var context      = new audioContext();
    var MediaStreamHelper = {
        /*
	        The browser have to support Promises if the browser supports only the deprecated version of getUserMedia.
	        There is a polyfill for Promises!
          Example:
	          MediaStreamHelper.initialize(window);
	          getUserMedia({audio: true}).then(function(stream) {}).catch(function(error) {});
	*/
		    UNSUPPORT: false,
		    SUPPORT_STANDARD_VERSION: 1,
		    SUPPORT_DEPRECATED_VERSION: 2,
		    isGetUserMediaSupported: function isGetUserMediaSupported(window) {
				    if(window.navigator.mediaDevices.getUserMedia) return this.SUPPORT_STANDARD_VERSION;
				    else if(window.navigator.getUserMedia) return this.SUPPORT_DEPRECATED_VERSION;
				    else
					    return this.UNSUPPORT;
			    },
		    initialize: function initializeMediaStreamHelper(window) {
				    window.navigator.mediaDevices = window.navigator.mediaDevices || {};
				    window.navigator.getUserMedia = window.navigator.getUserMedia || window.navigator.webkitGetUserMedia || window.navigator.mozGetUserMedia;

				    var howIsItSupported = this.isGetUserMediaSupported(window);
				    if(howIsItSupported != this.UNSUPPORT)
				    {
					    window.getUserMedia = howIsItSupported == this.SUPPORT_STANDARD_VERSION ?
						    window.navigator.mediaDevices.getUserMedia.bind(window.navigator.mediaDevices) :
						    function(constraints) {
								    return new Promise(function(resolve, reject) {
										    window.navigator.getUserMedia(constraints, resolve, reject);
									    });
							    };
				    }
			    }
	    };
    MediaStreamHelper.initialize(window);
    if(window.getUserMedia) console.log("Your browser supports getUserMedia.");
    else
        console.log("Your browser does not support getUserMedia.");
/////////////////////////////////////////

var Wad = (function(){

/** Pre-render a noise buffer instead of generating noise on the fly. **/
    var noiseBuffer = (function(){
        // the initial seed
        Math.seed = 6;
        Math.seededRandom = function(max, min){
            max = max || 1;
            min = min || 0;
            Math.seed = ( Math.seed * 9301 + 49297 ) % 233280;
            var rnd = Math.seed / 233280;

            return min + rnd * (max - min);
        }
        var bufferSize = 2 * context.sampleRate;
        var noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
        var output = noiseBuffer.getChannelData(0);
        for ( var i = 0; i < bufferSize; i++ ) {
            output[i] = Math.seededRandom() * 2 - 1;
        }
        return noiseBuffer;
    })()
/////////////////////////////////////////////////////////////////////////

/** a lil hack. just be glad it isn't on Object.prototype. **/
    var isArray = function(object){
        return Object.prototype.toString.call(object) === '[object Array]';
    }

/** Set up the default ADSR envelope. **/
    var constructEnv = function(that, arg){
        that.env = { //default envelope, if one is not specified on play
            attack  : arg.env ? valueOrDefault(arg.env.attack,  1) : 0,    // time in seconds from onset to peak volume
            decay   : arg.env ? valueOrDefault(arg.env.decay,   0) : 0,    // time in seconds from peak volume to sustain volume
            sustain : arg.env ? valueOrDefault(arg.env.sustain, 1) : 1,    // sustain volume level, as a percent of peak volume. min:0, max:1
            hold    : arg.env ? valueOrDefault(arg.env.hold, 3.14159) : 3.14159, // time in seconds to maintain sustain volume
            release : arg.env ? valueOrDefault(arg.env.release, 0) : 0     // time in seconds from sustain volume to zero volume
        };
        that.defaultEnv = {
            attack  : arg.env ? valueOrDefault(arg.env.attack,  1) : 0,    // time in seconds from onset to peak volume
            decay   : arg.env ? valueOrDefault(arg.env.decay,   0) : 0,    // time in seconds from peak volume to sustain volume
            sustain : arg.env ? valueOrDefault(arg.env.sustain, 1) : 1,    // sustain volume level, as a percent of peak volume. min:0, max:1
            hold    : arg.env ? valueOrDefault(arg.env.hold, 3.14159) : 3.14159, // time in seconds to maintain sustain volume
            release : arg.env ? valueOrDefault(arg.env.release, 0) : 0     // time in seconds from sustain volume to zero volume
        };
    }
/////////////////////////////////////////


/** Set up the default filter and filter envelope. **/
    var constructFilter = function(that, arg){

        if ( !arg.filter ) { arg.filter = null; }

        else if ( isArray(arg.filter) ) {
            that.filter = arg.filter.map(function(filterArg){
                return {
                    type : filterArg.type || 'lowpass',
                    frequency : filterArg.frequency || 600,
                    q : filterArg.q || 1,
                    env : filterArg.env || null,
                }
            });
        }
        else {
            that.filter  = [{
                type : arg.filter.type || 'lowpass',
                frequency : arg.filter.frequency || 600,
                q : arg.filter.q || 1,
                env : arg.filter.env ||null,
            }];
        }
    }
//////////////////////////////////////////////////////


/** If the Wad uses an audio file as the source, request it from the server.
Don't let the Wad play until all necessary files have been downloaded. **/
    var requestAudioFile = function(that, callback){
        var request = new XMLHttpRequest();
        request.open("GET", that.source, true);
        request.responseType = "arraybuffer";
        that.playable--;
        request.onload = function(){
            context.decodeAudioData(request.response, function (decodedBuffer){
                that.decodedBuffer = decodedBuffer;
                if ( that.env.hold === 3.14159 ) { // audio buffers should not use the default hold
                    that.env.hold = that.decodedBuffer.duration + 1
                }
                if ( callback ) { callback(that); }
                that.playable++;
                if ( that.playOnLoad ) { that.play(that.playOnLoadArg); }
            })
        };
        request.send();
    };
//////////////////////////////////////////////////////////////////////////

/** Set up the vibrato LFO **/
    var constructVibrato = function(that, arg){
        if ( arg.vibrato ) {
            that.vibrato = {
                shape     : valueOrDefault(arg.vibrato.shape, 'sine'),
                speed     : valueOrDefault(arg.vibrato.speed, 1),
                magnitude : valueOrDefault(arg.vibrato.magnitude, 5),
                attack    : valueOrDefault(arg.vibrato.attack, 0)
            };
        }
        else { that.vibrato = null; }
    };
//////////////////////////////


/** Set up the tremolo LFO **/
    var constructTremolo = function(that, arg){
        if ( arg.tremolo ) {
            that.tremolo = {
                shape     : valueOrDefault(arg.tremolo.shape, 'sine'),
                speed     : valueOrDefault(arg.tremolo.speed, 1),
                magnitude : valueOrDefault(arg.tremolo.magnitude, 5),
                attack    : valueOrDefault(arg.tremolo.attack, 1)
            };
        }
        else { that.tremolo = null; }
    };
//////////////////////////////

/** Grab the reverb impulse response file from a server.
You may want to change Wad.defaultImpulse to serve files from your own server.
Check out http://www.voxengo.com/impulses/ for free impulse responses. **/
    var constructReverb = function(that, arg){
        if ( arg.reverb ) {
            that.reverb = { wet : valueOrDefault(arg.reverb.wet, 1) };
            var impulseURL = arg.reverb.impulse || Wad.defaultImpulse;
            var request = new XMLHttpRequest();
            request.open("GET", impulseURL, true);
            request.responseType = "arraybuffer";
            that.playable--;
            request.onload = function(){
                context.decodeAudioData(request.response, function (decodedBuffer){

                    that.reverb.buffer = decodedBuffer;
                    that.playable++;
                    if ( that.playOnLoad ) { that.play(that.playOnLoadArg); }
                    if ( that instanceof Wad.Poly ) { that.setUp(arg); }
                    if ( that.source === 'mic' && that.reverb && that.reverb.buffer && that.reverb.node && !that.reverb.node.buffer ) { // I think this is only relevant when calling play() with args on a mic
                        that.reverb.node.convolver.buffer = that.reverb.buffer;
                    }

                })
            };
            request.send();
        }
        else {
            that.reverb = null;
        }
    };

    var constructPanning = function(that, arg){
        if ( 'panning' in arg ) {
            that.panning = { location : arg.panning };
            if ( typeof(arg.panning) === "number" ) {
                that.panning.type = 'stereo';
            }

            else {
                that.panning.type = '3d'
                that.panning.panningModel = arg.panningModel || 'equalpower';
            }
        }

        else {
            that.panning = {
                location : 0,
                type     : 'stereo',
            };
        }
        if ( that.panning.type === 'stereo' && !context.createStereoPanner ) {
            console.log("Your browser does not support stereo panning. Falling back to 3D panning.")
            that.panning = {
                location     : [0,0,0],
                type         : '3d',
                panningModel : 'equalpower',
            }
        }
    };
//////////////////////////////////////////////////////////////////////////////
    var constructDelay = function(that, arg){
        if ( arg.delay ) {
            that.delay = {
                delayTime    : valueOrDefault(arg.delay.delayTime, .5),
                maxDelayTime : valueOrDefault(arg.delay.maxDelayTime, 2),
                feedback     : valueOrDefault(arg.delay.feedback, .25),
                wet          : valueOrDefault(arg.delay.wet, .25)
            };
        }
        else { that.delay = null; }
    };
/** Special initialization and configuration for microphone Wads **/
    var getConsent = function(that, arg) {
        that.nodes             = [];
        that.mediaStreamSource = null;
        that.gain              = null;
        getUserMedia({audio: true, video: false}).then(function(stream) {
            // console.log('got stream')
            that.mediaStreamSource = context.createMediaStreamSource(stream);
            Wad.micConsent = true
            setUpMic(that, arg);
        }).catch(function(error) { console.log('Error setting up microphone input: ', error); }); // This is the error callback.
    };
////////////////////////////////////////////////////////////////////

    var setUpMic = function(that, arg){
        that.nodes           = [];
        that.gain            = context.createGain();
        that.gain.gain.value = valueOrDefault(arg.volume,that.volume);
        that.nodes.push(that.mediaStreamSource);
        that.nodes.push(that.gain);
        // console.log('that ', arg)

        if ( that.filter || arg.filter ) { createFilters(that, arg); }

        if ( that.reverb || arg.reverb ) { setUpReverbOnPlay(that, arg); }

        constructPanning(that, arg);
        setUpPanningOnPlay(that, arg);

        if ( that.delay || arg.delay ) {
            setUpDelayOnPlay(that, arg);
        }
        setUpTunaOnPlay(that, arg)
        that.setUpExternalFxOnPlay(arg, context);
    }

    var Wad = function(arg){
/** Set basic Wad properties **/
        this.source        = arg.source;
        this.destination   = arg.destination || context.destination; // the last node the sound is routed to
        this.volume        = valueOrDefault(arg.volume, 1); // peak volume. min:0, max:1 (actually max is infinite, but ...just keep it at or below 1)
        this.defaultVolume = this.volume;
        this.playable      = 1; // if this is less than 1, this Wad is still waiting for a file to download before it can play
        this.pitch         = Wad.pitches[arg.pitch] || arg.pitch || 440;
        this.detune        = arg.detune || 0 // In Cents.
        this.globalReverb  = arg.globalReverb || false;
        this.gain          = [];
        this.loop          = arg.loop || false;
        this.tuna          = arg.tuna || null;
        constructEnv(this, arg);
        constructFilter(this, arg);
        constructVibrato(this, arg);
        constructTremolo(this, arg);
        constructReverb(this, arg);
        this.constructExternalFx(arg, context);
        constructPanning(this, arg);
        constructDelay(this, arg);
////////////////////////////////


/** If the Wad's source is noise, set the Wad's buffer to the noise buffer we created earlier. **/
        if ( this.source === 'noise' ) {
            this.decodedBuffer = noiseBuffer;
        }
//////////////////////////////////////////////////////////////////////////////////////////////////


/** If the Wad's source is the microphone, the rest of the setup happens here. **/
        else if ( this.source === 'mic' ) {
            getConsent(this, arg);
        }
//////////////////////////////////////////////////////////////////////////////////


/** If the Wad's source is an object, assume it is a buffer from a recorder. There's probably a better way to handle this. **/
        else if ( typeof this.source == 'object' ) {
            var newBuffer = context.createBuffer(2, this.source[0].length, context.sampleRate);
            newBuffer.getChannelData(0).set(this.source[0]);
            newBuffer.getChannelData(1).set(this.source[1]);
            this.decodedBuffer = newBuffer;
        }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/** If the source is not a pre-defined value, assume it is a URL for an audio file, and grab it now. **/
        else if ( !( this.source in { 'sine' : 0, 'sawtooth' : 0, 'square' : 0, 'triangle' : 0 } ) ) {
            requestAudioFile(this, arg.callback);
        }
////////////////////////////////////////////////////////////////////////////////////////////////////////
        else { arg.callback && arg.callback(this) }
    };
    Wad.micConsent = false
    Wad.audioContext = context
    if ( window.Tuna != undefined ) {
        Wad.tuna = new Tuna(Wad.audioContext)
    }

/** When a note is played, these two functions will schedule changes in volume and filter frequency,
as specified by the volume envelope and filter envelope **/
    var filterEnv = function(wad, arg){
        wad.filter.forEach(function (filter, index){
            filter.node.frequency.linearRampToValueAtTime(filter.frequency, arg.exactTime);
            filter.node.frequency.linearRampToValueAtTime(filter.env.frequency, arg.exactTime + filter.env.attack);
        });
    };

    var playEnv = function(wad, arg){
        wad.gain[0].gain.linearRampToValueAtTime(0.0001, arg.exactTime);
        wad.gain[0].gain.linearRampToValueAtTime(wad.volume, arg.exactTime + wad.env.attack + 0.00001);
        wad.gain[0].gain.linearRampToValueAtTime(wad.volume * wad.env.sustain, arg.exactTime + wad.env.attack + wad.env.decay + 0.00002);
        wad.gain[0].gain.linearRampToValueAtTime(wad.volume * wad.env.sustain, arg.exactTime + wad.env.attack + wad.env.decay + wad.env.hold + 0.00003);
        wad.gain[0].gain.linearRampToValueAtTime(0.0001, arg.exactTime + wad.env.attack + wad.env.decay + wad.env.hold + wad.env.release + 0.00004);
        wad.soundSource.start(arg.exactTime);
        wad.soundSource.stop(arg.exactTime + wad.env.attack + wad.env.decay + wad.env.hold + wad.env.release);
    };

////////////////////////////////////////////////////////////////////////////////////////////////////


/** When all the nodes are set up for this Wad, this function plugs them into each other,
with special handling for nodes with custom interfaces (e.g. reverb, delay). **/
    var plugEmIn = function(that, arg){
        // console.log('nodes? ', that.nodes)
        var destination = ( arg && arg.destination ) || that.destination;
        for ( var i = 1; i < that.nodes.length; i++ ) {
            if ( that.nodes[i-1].interface === 'custom' ) {
                var from = that.nodes[i-1].output;
            }
            else { // assume native interface
                var from = that.nodes[i-1];
            }
            if ( that.nodes[i].interface === 'custom' ) {
                var to = that.nodes[i].input
            }
            else { // assume native interface
                var to = that.nodes[i]
            }
            from.connect(to);
        }
        if ( that.nodes[that.nodes.length-1].interface === 'custom') {
            var lastStop = that.nodes[that.nodes.length-1].output;
        }
        else { // assume native interface
            var lastStop = that.nodes[that.nodes.length-1];
        }
        lastStop.connect(destination);

        /** Global reverb is super deprecated, and should be removed at some point. **/
        if ( Wad.reverb && that.globalReverb ) {
            that.nodes[that.nodes.length - 1].connect(Wad.reverb.node);
            Wad.reverb.node.connect(Wad.reverb.gain);
            Wad.reverb.gain.connect(destination);
        }
        /**************************************************************************/
    };
/////////////////////////////////////////////////////////////////////////////////////////


/** Initialize and configure an oscillator node **/
    var setUpOscillator = function(that, arg){
        arg = arg || {};
        that.soundSource = context.createOscillator();
        that.soundSource.type = that.source;
        if ( arg.pitch ) {
            if ( arg.pitch in Wad.pitches ) {
                that.soundSource.frequency.value = Wad.pitches[arg.pitch];
            }
            else {
                that.soundSource.frequency.value = arg.pitch;
            }
        }
        else {
            that.soundSource.frequency.value = that.pitch;
        }
        that.soundSource.detune.value = arg.detune || that.detune;
    };
///////////////////////////////////////////////////

/** Set the ADSR volume envelope according to play() arguments, or revert to defaults **/
    var setUpEnvOnPlay = function(that, arg){
        if ( arg && arg.env ) {
            that.env.attack  = valueOrDefault(arg.env.attack, that.defaultEnv.attack);
            that.env.decay   = valueOrDefault(arg.env.decay, that.defaultEnv.decay);
            that.env.sustain = valueOrDefault(arg.env.sustain, that.defaultEnv.sustain);
            that.env.hold    = valueOrDefault(arg.env.hold, that.defaultEnv.hold);
            that.env.release = valueOrDefault(arg.env.release, that.defaultEnv.release);
        }
        else {
            that.env = {
                attack  : that.defaultEnv.attack,
                decay   : that.defaultEnv.decay,
                sustain : that.defaultEnv.sustain,
                hold    : that.defaultEnv.hold,
                release : that.defaultEnv.release
            };
        }
    };
//////////////////////////////////////////////////////////////////////////////////


/** Set the filter and filter envelope according to play() arguments, or revert to defaults **/

    var createFilters = function(that, arg){
        if ( arg.filter && !isArray(arg.filter) ) {
            arg.filter = [arg.filter];
        }
        that.filter.forEach(function (filter, i) {
            filter.node                 = context.createBiquadFilter();
            filter.node.type            = filter.type;
            filter.node.frequency.value = ( arg.filter && arg.filter[i] ) ? ( arg.filter[i].frequency || filter.frequency ) : filter.frequency;
            filter.node.Q.value         = ( arg.filter && arg.filter[i] ) ? ( arg.filter[i].q         || filter.q )         : filter.q;
            if ( ( arg.filter && arg.filter[i].env || that.filter[i].env ) && !( that.source === "mic" ) ) {
                filter.env = {
                    attack    : ( arg.filter && arg.filter[i].env && arg.filter[i].env.attack )    || that.filter[i].env.attack,
                    frequency : ( arg.filter && arg.filter[i].env && arg.filter[i].env.frequency ) || that.filter[i].env.frequency
                };
            }

            that.nodes.push(filter.node);
        })
    };

    var setUpFilterOnPlay = function(that, arg){
        if ( arg && arg.filter && that.filter ) {
            if ( !isArray(arg.filter) ) arg.filter = [arg.filter]
            createFilters(that, arg)
        }
        else if ( that.filter ) {
            createFilters(that, that);
        }
    };
///////////////////////////////////////////////////////////////////////////////////////////////

/** Initialize and configure a convolver node for playback **/
    var setUpReverbOnPlay = function(that, arg){
        var reverbNode = {
            interface : 'custom',
            input : context.createGain(),
            convolver : context.createConvolver(),
            wet : context.createGain(),
            output : context.createGain()
        }
        reverbNode.convolver.buffer = that.reverb.buffer;
        reverbNode.wet.gain.value   = that.reverb.wet;

        reverbNode.input.connect(reverbNode.convolver);
        reverbNode.input.connect(reverbNode.output);
        reverbNode.convolver.connect(reverbNode.wet);
        reverbNode.wet.connect(reverbNode.output);

        that.reverb.node = reverbNode;
        that.nodes.push(that.reverb.node);
    };
//////////////////////////////////////////////////////////////


/** Initialize and configure a panner node for playback **/
    var setUpPanningOnPlay = function(that, arg){
        var panning = arg && arg.panning; // can be zero provided as argument
        if (typeof panning === 'undefined') { panning = that.panning.location; }

        if (typeof panning  === 'number') {
            that.panning.node = context.createStereoPanner();
            that.panning.node.pan.value = panning;
            that.panning.type = 'stereo';
        }
        else {
            that.panning.node = context.createPanner();
            that.panning.node.setPosition(panning[0], panning[1], panning[2]);
            that.panning.node.panningModel = arg.panningModel || that.panningModel || 'equalpower';
            that.panning.type = '3d';
        }

        that.nodes.push(that.panning.node);

    };
///////////////////////////////////////////////////////////


/** Initialize and configure a vibrato LFO Wad for playback **/
    var setUpVibratoOnPlay = function(that, arg){
        that.vibrato.wad = new Wad({
            source : that.vibrato.shape,
            pitch  : that.vibrato.speed,
            volume : that.vibrato.magnitude,
            env    : {
                attack : that.vibrato.attack
            },
            destination : that.soundSource.frequency
        });
        that.vibrato.wad.play();
    };
///////////////////////////////////////////////////////////////


/** Initialize and configure a tremolo LFO Wad for playback **/
    var setUpTremoloOnPlay = function(that, arg){
        that.tremolo.wad = new Wad({
            source : that.tremolo.shape,
            pitch  : that.tremolo.speed,
            volume : that.tremolo.magnitude,
            env    : {
                attack : that.tremolo.attack,
                hold   : 10
            },
            destination : that.gain[0].gain
        });
        that.tremolo.wad.play();
    };
///////////////////////////////////////////////////////////////

    var setUpDelayOnPlay = function(that, arg){
        if ( that.delay ) {
            if ( !arg.delay ) { arg.delay = {}; }
            //create the nodes we’ll use
            var delayNode = { // the custom delay node
                interface    : 'custom',
                input        : context.createGain(),
                output       : context.createGain(),
                delayNode    : context.createDelay(that.delay.maxDelayTime), // the native delay node inside the custom delay node.
                feedbackNode : context.createGain(),
                wetNode      : context.createGain(),
            }

            //set some decent values
            delayNode.delayNode.delayTime.value = valueOrDefault(arg.delay.delayTime, that.delay.delayTime);
            delayNode.feedbackNode.gain.value   = valueOrDefault(arg.delay.feedback, that.delay.feedback);
            delayNode.wetNode.gain.value        = valueOrDefault(arg.delay.wet, that.delay.wet);


            //set up the routing
            delayNode.input.connect(delayNode.delayNode);
            delayNode.input.connect(delayNode.output);
            delayNode.delayNode.connect(delayNode.feedbackNode);
            delayNode.delayNode.connect(delayNode.wetNode);
            delayNode.feedbackNode.connect(delayNode.delayNode);
            delayNode.wetNode.connect(delayNode.output);
            that.delay.delayNode = delayNode;

            that.nodes.push(delayNode)
        }
    };

/** **/
    var constructCompressor = function(that, arg){
        that.compressor = context.createDynamicsCompressor();
        that.compressor.attack.value    = valueOrDefault(arg.compressor.attack, that.compressor.attack.value);
        that.compressor.knee.value      = valueOrDefault(arg.compressor.knee, that.compressor.knee.value);
        that.compressor.ratio.value     = valueOrDefault(arg.compressor.ratio, that.compressor.ratio.value);
        that.compressor.release.value   = valueOrDefault(arg.compressor.release, that.compressor.release.value);
        that.compressor.threshold.value = valueOrDefault(arg.compressor.threshold, that.compressor.threshold.value);
        that.nodes.push(that.compressor);
    };
    var setUpTunaOnPlay = function(that, arg){
        if ( !( that.tuna || arg.tuna ) ) { return }
        var tunaConfig = {}
        if ( that.tuna ) {
            for ( var key in that.tuna ) {
                tunaConfig[key] = that.tuna[key]
            }
        }

        // overwrite settings from `this` with settings from arg
        if ( arg.tuna ) {
            for ( var key in arg.tuna ) {
                tunaConfig[key] = arg.tuna[key]
            }
        }
        console.log('tunaconfig: ', tunaConfig)
        for ( var key in tunaConfig) {
            console.log(key)
            var tunaEffect = new Wad.tuna[key](tunaConfig[key])
            that.nodes.push(tunaEffect)
        }
        // console.log(that.nodes)
    }
///

/** Method to allow users to setup external fx in the constructor **/
    Wad.prototype.constructExternalFx = function(arg, context){
        //override me in your own code
    };


//////////////////////////////////////////////////////////////////////////////

/** To be overrided by the user **/
    Wad.prototype.setUpExternalFxOnPlay = function(arg, context){
        //user does what is necessary here, and then maybe does something like:
        // this.nodes.push(externalFX)
    };
///////////////////////////////////////////////////////////////


/** the play() method will create the various nodes that are required for this Wad to play,
set properties on those nodes according to the constructor arguments and play() arguments,
plug the nodes into each other with plugEmIn(),
then finally play the sound by calling playEnv() **/
    Wad.prototype.play = function(arg){
        arg = arg || { arg : null };
        if ( this.playable < 1 ) {
            this.playOnLoad    = true;
            this.playOnLoadArg = arg;
        }

        else if ( this.source === 'mic' ) {
            if ( Wad.micConsent ) {
                if ( arg.arg === null ) {
                    plugEmIn(this, arg);
                }
                else {
                    constructFilter(this, arg);
                    constructVibrato(this, arg);
                    constructTremolo(this, arg);
                    constructReverb(this, arg);
                    this.constructExternalFx(arg, context);
                    constructPanning(this, arg);
                    constructDelay(this, arg);
                    setUpMic(this, arg);
                    plugEmIn(this, arg);
                }
            }
            else { console.log('You have not given your browser permission to use your microphone.')}
        }

        else {
            this.nodes = [];
            if ( !arg.wait ) { arg.wait = 0; }
            if ( arg.volume ) { this.volume = arg.volume; }
            else { this.volume = this.defaultVolume; }

            if ( this.source in { 'sine' : 0, 'sawtooth' : 0, 'square' : 0, 'triangle' : 0 } ) {
                setUpOscillator(this, arg);
            }

            else {
                this.soundSource = context.createBufferSource();
                this.soundSource.buffer = this.decodedBuffer;
                if ( this.source === 'noise' || this.loop || arg.loop ) {
                    this.soundSource.loop = true;
                }
            }

            if (arg.exactTime === undefined) {
                arg.exactTime = context.currentTime + arg.wait;
            }

            this.nodes.push(this.soundSource);


    /**  sets the volume envelope based on the play() arguments if present,
    or defaults to the constructor arguments if the volume envelope is not set on play() **/
            setUpEnvOnPlay(this, arg);
    ////////////////////////////////////////////////////////////////////////////////////////


    /**  sets up the filter and filter envelope based on the play() argument if present,
    or defaults to the constructor argument if the filter and filter envelope are not set on play() **/
            setUpFilterOnPlay(this, arg);
    ///////////////////////////////////////////////////////////////////////////////////////////////////
            setUpTunaOnPlay(this, arg);

            this.setUpExternalFxOnPlay(arg, context);


            this.gain.unshift(context.createGain()); // sets up the gain node
            this.gain[0].label = arg.label;
            this.nodes.push(this.gain[0]);

            if ( this.gain.length > 15 ) {
                this.gain.length = 15
            }

            // sets up reverb
            if ( this.reverb ) { setUpReverbOnPlay(this, arg); }

    /**  sets panning based on the play() argument if present, or defaults to the constructor argument if panning is not set on play **/
            setUpPanningOnPlay(this, arg);
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


            setUpDelayOnPlay(this, arg);

            plugEmIn(this, arg);

            if ( this.filter && this.filter[0].env ) { filterEnv(this, arg); }
            playEnv(this, arg);

            //sets up vibrato LFO
            if ( this.vibrato ) { setUpVibratoOnPlay(this, arg); }

            //sets up tremolo LFO
            if ( this.tremolo ) { setUpTremoloOnPlay(this, arg); }
        }
        if ( arg.callback ) { arg.callback(this); }
        return this;
    };

//////////////////////////////////////////////////////////////////////////////////////////


    /** Change the volume of a Wad at any time, including during playback **/
    Wad.prototype.setVolume = function(volume){
        this.defaultVolume = volume;
        if ( this.gain.length > 0 ) { this.gain[0].gain.value = volume; }
        return this;
    };

    /**
    Change the playback speed of a Wad during playback.
    inputSpeed is a value of 0 < speed, and is the rate of playback of the audio.
    E.g. if input speed = 2.0, the playback will be twice as fast
    **/
    Wad.prototype.setSpeed = function(inputSpeed) {

        //Check/Save the input
        var speed;
        if(inputSpeed && inputSpeed > 0) speed = inputSpeed;
        else speed = 0;

        //Check if we have a soundsource (Though we always should)
        if(this.soundSource) {

            //Set the value
            this.soundSource.playbackRate.value = speed;
        }
        else {

            //Inform that there is no delay on the current wad
            console.log("Sorry, but the wad does not contain a soundSource!");
        }

        return this;
    };

    Wad.prototype.setDetune = function(detune){
        this.soundSource.detune.value = detune;
        return this;
    };

    /** Change the panning of a Wad at any time, including during playback **/
    Wad.prototype.setPanning = function(panning){
        this.panning.location = panning;
        if ( isArray(panning) && this.panning.type === '3d' && this.panning.node ) {
            this.panning.node.setPosition(panning[0], panning[1], panning[2]);

        }
        else if ( typeof panning === 'number' && this.panning.type === 'stereo' && this.panning.node) {
            this.panning.node.pan.value = panning;
        }

        if ( isArray(panning) ) { this.panning.type = '3d' }
        else if ( typeof panning === 'number' ) { this.panning.type = 'stereo' }
        return this;
    };

    /**
    Change the Reverb of a Wad at any time, including during playback.
    inputWet is a value of 0 < wetness/gain < 1
    **/
    Wad.prototype.setReverb = function(inputWet) {

        //Check/Save the input

        var wet;
        if(inputWet && inputWet > 0 && inputWet < 1) wet = inputWet;
        else if(inputWet >= 1) wet = 1;
        else wet = 0;

        //Check if we have delay
        if(this.reverb) {

            //Set the value
            this.reverb.wet = wet;

            //Set the node's value, if it exists
            if(this.reverb.node) {

                this.reverb.node.wet.gain.value = wet;
            }
        }
        else {

            //Inform that there is no reverb on the current wad
            console.log("Sorry, but the wad does not contain Reverb!");
        }

        return this;
    };


    /**
    Change the Delay of a Wad at any time, including during playback.
    inputTime is a value of time > 0, and is the time in seconds between each delayed playback.
    inputWet is a value of gain 0 < inputWet < 1, and is Relative volume change between the original sound and the first delayed playback.
    inputFeedback is a value of gain 0 < inputFeedback < 1, and is Relative volume change between each delayed playback and the next.
    **/
    Wad.prototype.setDelay = function(inputTime, inputWet, inputFeedback){

        //Check/Save the input
        var time;
        if(inputTime && inputTime > 0) time = inputTime;
        else time = 0;

        var wet;
        if(inputWet && inputWet > 0 && inputWet < 1) wet = inputWet;
        else if(inputWet >= 1) wet = 1;
        else wet = 0;

        var feedback;
        if(inputFeedback && inputFeedback > 0 && inputFeedback < 1) feedback = inputFeedback;
        else if(inputFeedback >= 1) feedback = 1;
        else feedback = 0;

        //Check if we have delay
        if(this.delay) {

            //Set the value
            this.delay.delayTime = time;
            this.delay.wet = wet;
            this.delay.feedback = feedback;

            //Set the node's value, if it exists
            if(this.delay.delayNode) {

                this.delay.delayNode.delayNode.delayTime.value = time;
                this.delay.delayNode.wetNode.gain.value = wet;
                this.delay.delayNode.feedbackNode.gain.value = feedback;
            }
        }
        else {

            //Inform that there is no delay on the current wad
            console.log("Sorry, but the wad does not contain delay!");
        }

        return this;
    };


//////////////////////////////////////////////////////////////////////////////////////////


/** If multiple instances of a sound are playing simultaneously, stop() only can stop the most recent one **/
    Wad.prototype.stop = function(label){
        if ( !( this.source === 'mic' ) ) {
            if ( label ) {
                for ( var i = 0; i < this.gain.length; i++ ) {
                    if ( this.gain[i].label === label ) {
                        this.gain[i].gain.cancelScheduledValues(context.currentTime);
                        this.gain[i].gain.setValueAtTime(this.gain[i].gain.value, context.currentTime);
                        this.gain[i].gain.linearRampToValueAtTime(.0001, context.currentTime + this.env.release);
                    }
                }
            }
            if ( !label ) {
                this.gain[0].gain.cancelScheduledValues(context.currentTime);
                this.gain[0].gain.setValueAtTime(this.gain[0].gain.value, context.currentTime);
                this.gain[0].gain.linearRampToValueAtTime(.0001, context.currentTime + this.env.release);
            }
        }
        else if (Wad.micConsent ) {
            this.mediaStreamSource.disconnect(0);
        }
        else { console.log('You have not given your browser permission to use your microphone.')}
        if ( this.tremolo ) {
            this.tremolo.wad.stop()
        }
    };
////////////////////////////////////////////////////////////////////////////////////////////////////////////////



    var buflen = 2048;
    var buf = new Uint8Array( buflen );
    var MINVAL = 134;  // 128 == zero.  MINVAL is the "minimum detected signal" level.

    var noteFromPitch = function( frequency ) {
        var noteNum = 12 * (Math.log( frequency / 440 )/Math.log(2) );
        return Math.round( noteNum ) + 69;
    }

    var frequencyFromNoteNumber = function( note ) {
        return 440 * Math.pow(2,(note-69)/12);
    }

    var centsOffFromPitch = function( frequency, note ) {
        return Math.floor( 1200 * Math.log( frequency / frequencyFromNoteNumber( note ))/Math.log(2) );
    }


    function autoCorrelate( buf, sampleRate ) {
        var MIN_SAMPLES = 4;    // corresponds to an 11kHz signal
        var MAX_SAMPLES = 1000; // corresponds to a 44Hz signal
        var SIZE = 1000;
        var best_offset = -1;
        var best_correlation = 0;
        var rms = 0;
        var foundGoodCorrelation = false;

        if (buf.length < (SIZE + MAX_SAMPLES - MIN_SAMPLES))
            return -1;  // Not enough data

        for ( var i = 0; i < SIZE; i++ ) {
            var val = ( buf[i] - 128 ) / 128;
            rms += val * val;
        }
        rms = Math.sqrt(rms/SIZE);
        if (rms<0.01)
            return -1;

        var lastCorrelation=1;
        for (var offset = MIN_SAMPLES; offset <= MAX_SAMPLES; offset++) {
            var correlation = 0;

            for (var i=0; i<SIZE; i++) {
                correlation += Math.abs(((buf[i] - 128)/128)-((buf[i+offset] - 128)/128));
            }
            correlation = 1 - (correlation/SIZE);
            if ((correlation>0.9) && (correlation > lastCorrelation))
                foundGoodCorrelation = true;
            else if (foundGoodCorrelation) {
                // short-circuit - we found a good correlation, then a bad one, so we'd just be seeing copies from here.
                return sampleRate/best_offset;
            }
            lastCorrelation = correlation;
            if (correlation > best_correlation) {
                best_correlation = correlation;
                best_offset = offset;
            }
        }
        if (best_correlation > 0.01) {
            // console.log("f = " + sampleRate/best_offset + "Hz (rms: " + rms + " confidence: " + best_correlation + ")")
            return sampleRate/best_offset;
        }
        return -1;
    //  var best_frequency = sampleRate/best_offset;
    }


    Wad.Poly = function(arg){
        if ( !arg ) { arg = {}; }
        this.isSetUp  = false;
        this.playable = 1;

        if ( arg.reverb ) {
            constructReverb(this, arg); // We need to make sure we have downloaded the impulse response before continuing with the setup.
        }
        else {
            this.setUp(arg);
        }
    };

    Wad.Poly.prototype.setUp = function(arg){ // Anything that needs to happen before reverb is set up can go here.
        this.wads              = [];
        this.input             = context.createAnalyser();
        this.input.fftSize     = 2048
        this.nodes             = [this.input];
        this.destination       = arg.destination || context.destination; // the last node the sound is routed to
        this.volume            = arg.volume || 1;
        this.output            = context.createGain();
        this.output.gain.value = this.volume;
        this.tuna              = arg.tuna || null;

        if ( !( typeof Recorder === 'undefined' ) && arg.recConfig ) { // Recorder should be defined, unless you're running the unconcatenated source version and forgot to include recorder.js.
            this.rec               = new Recorder(this.output, arg.recConfig);
            this.rec.recordings    = [];

            var that = this;
            var getRecorderBufferCallback = function( buffers ) {
                that.rec.createWadArg.source = buffers;
                that.rec.recordings.unshift(new Wad(that.rec.createWadArg));
            };
            this.rec.createWad = function(arg){
                this.createWadArg = arg || { env : { hold : 9001 } };
                this.getBuffer(getRecorderBufferCallback);
            };
        }

        this.globalReverb = arg.globalReverb || false; // deprecated

        constructFilter(this, arg);
        if ( this.filter ) { createFilters(this, arg); }

        if ( this.reverb ) { setUpReverbOnPlay(this, arg); }

        this.constructExternalFx(arg, context);

        constructPanning(this, arg);
        setUpPanningOnPlay(this, arg);
        if ( arg.compressor ) { constructCompressor(this, arg); }

        constructDelay(this, arg);
        setUpDelayOnPlay(this, arg);
        setUpTunaOnPlay(this, arg);
        this.nodes.push(this.output);
        plugEmIn(this, arg);
        this.isSetUp = true;
        if ( arg.callback ) { arg.callback(this); }
    }

/**
    The MIT License (MIT)

Copyright (c) 2014 Chris Wilson
**/
    Wad.Poly.prototype.updatePitch = function( time ) {
        this.input.getByteTimeDomainData( buf );
        var ac = autoCorrelate( buf, context.sampleRate );

        if ( ac !== -1 && ac !== 11025 && ac !== 12000 ) {
            var pitch = ac;
            this.pitch = Math.floor( pitch ) ;
            var note = noteFromPitch( pitch );
            this.noteName = Wad.pitchesArray[note - 12];
            // Detune doesn't seem to work.
            // var detune = centsOffFromPitch( pitch, note );
            // if (detune == 0 ) {
            //     this.detuneEstimate = 0;
            // } else {

            //     this.detuneEstimate = detune
            // }
        }
        var that = this;
        that.rafID = window.requestAnimationFrame( function(){ that.updatePitch() } );
    }

    Wad.Poly.prototype.stopUpdatingPitch = function(){
        cancelAnimationFrame(this.rafID)
    }

    Wad.Poly.prototype.setVolume = function(volume){
        if ( this.isSetUp ) {
            this.output.gain.value = volume;
        }
        else {
            console.log('This PolyWad is not set up yet.');
        }
        return this;
    }

    Wad.Poly.prototype.play = function(arg){
        if ( this.isSetUp ) {
            if ( this.playable < 1 ) {
                this.playOnLoad    = true;
                this.playOnLoadArg = arg;
            }
            else {
                if ( arg && arg.volume ) {
                    this.output.gain.value = arg.volume; // if two notes are played with volume set as a play arg, does the second one overwrite the first? maybe input should be an array of gain nodes, like regular wads.
                    arg.volume = undefined; // if volume is set, it should change the gain on the polywad's gain node, NOT the gain nodes for individual wads inside the polywad.
                }
                for ( var i = 0; i < this.wads.length; i++ ) {
                    this.wads[i].play(arg);
                }
            }
        }
        else {
            console.log('This PolyWad is not set up yet.');
        }
        return this;
    };

    Wad.Poly.prototype.stop = function(arg){
        if ( this.isSetUp ) {
            for ( var i = 0; i < this.wads.length; i++ ) {
                this.wads[i].stop(arg);
            }
        }
    };

    Wad.Poly.prototype.add = function(wad){
        if ( this.isSetUp ) {
            wad.destination = this.input;
            this.wads.push(wad);
            if ( wad instanceof Wad.Poly ) {
                wad.output.disconnect(0);
                wad.output.connect(this.input);
            }
        }
        else {
            console.log('This PolyWad is not set up yet.');
        }
        return this;
    };



    Wad.Poly.prototype.remove = function(wad){
        if ( this.isSetUp ) {
            for ( var i = 0; i < this.wads.length; i++ ) {
                if ( this.wads[i] === wad ) {
                    this.wads[i].destination = context.destination;
                    this.wads.splice(i,1);
                    if ( wad instanceof Wad.Poly ) {
                        wad.output.disconnect(0);
                        wad.output.connect(context.destination);
                    }
                }
            }
        }
        return this;
    };

    Wad.Poly.prototype.constructExternalFx = function(arg, context){

    };

/** If a Wad is created with reverb without specifying a URL for the impulse response,
grab it from the defaultImpulse URL **/
    Wad.defaultImpulse = 'http://www.codecur.io/us/sendaudio/widehall.wav';

    // This method is deprecated.
    Wad.setGlobalReverb = function(arg){
        Wad.reverb                 = {};
        Wad.reverb.node            = context.createConvolver();
        Wad.reverb.gain            = context.createGain();
        Wad.reverb.gain.gain.value = arg.wet;
        var impulseURL             = arg.impulse || Wad.defaultImpulse;
        var request                = new XMLHttpRequest();
        request.open("GET", impulseURL, true);
        request.responseType = "arraybuffer";

        request.onload = function() {
            context.decodeAudioData(request.response, function (decodedBuffer){
                Wad.reverb.node.buffer = decodedBuffer;
            });
        };
        request.send();

    };
//////////////////////////////////////////////////////////////////////////////////////
//  Utility function to avoid javascript type conversion bug checking zero values   //

    var valueOrDefault = function(value, def) {
        var val = (value == null) ? def : value;
        return val;
    };

//////////////////////////////////////////////////////////////////////////////////////
/** This object is a mapping of note names to frequencies. **/
    Wad.pitches = {
        'A0'  : 27.5000,
        'A#0' : 29.1352,
        'Bb0' : 29.1352,
        'B0'  : 30.8677,
        'B#0'  : 32.7032,
        'Cb1'  : 30.8677,
        'C1'  : 32.7032,
        'C#1' : 34.6478,
        'Db1' : 34.6478,
        'D1'  : 36.7081,
        'D#1' : 38.8909,
        'Eb1' : 38.8909,
        'E1'  : 41.2034,
        'Fb1'  : 41.2034,
        'E#1'  : 43.6535,
        'F1'  : 43.6535,
        'F#1' : 46.2493,
        'Gb1' : 46.2493,
        'G1'  : 48.9994,
        'G#1' : 51.9131,
        'Ab1' : 51.9131,
        'A1'  : 55.0000,
        'A#1' : 58.2705,
        'Bb1' : 58.2705,
        'B1'  : 61.7354,
        'Cb2'  : 61.7354,
        'B#1'  : 65.4064,
        'C2'  : 65.4064,
        'C#2' : 69.2957,
        'Db2' : 69.2957,
        'D2'  : 73.4162,
        'D#2' : 77.7817,
        'Eb2' : 77.7817,
        'E2'  : 82.4069,
        'Fb2'  : 82.4069,
        'E#2'  : 87.3071,
        'F2'  : 87.3071,
        'F#2' : 92.4986,
        'Gb2' : 92.4986,
        'G2'  : 97.9989,
        'G#2' : 103.826,
        'Ab2' : 103.826,
        'A2'  : 110.000,
        'A#2' : 116.541,
        'Bb2' : 116.541,
        'B2'  : 123.471,
        'Cb3'  : 123.471,
        'B#2'  : 130.813,
        'C3'  : 130.813,
        'C#3' : 138.591,
        'Db3' : 138.591,
        'D3'  : 146.832,
        'D#3' : 155.563,
        'Eb3' : 155.563,
        'E3'  : 164.814,
        'Fb3'  : 164.814,
        'E#3'  : 174.614,
        'F3'  : 174.614,
        'F#3' : 184.997,
        'Gb3' : 184.997,
        'G3'  : 195.998,
        'G#3' : 207.652,
        'Ab3' : 207.652,
        'A3'  : 220.000,
        'A#3' : 233.082,
        'Bb3' : 233.082,
        'B3'  : 246.942,
        'Cb4'  : 246.942,
        'B#3'  : 261.626,
        'C4'  : 261.626,
        'C#4' : 277.183,
        'Db4' : 277.183,
        'D4'  : 293.665,
        'D#4' : 311.127,
        'Eb4' : 311.127,
        'E4'  : 329.628,
        'Fb4'  : 329.628,
        'E#4'  : 349.228,
        'F4'  : 349.228,
        'F#4' : 369.994,
        'Gb4' : 369.994,
        'G4'  : 391.995,
        'G#4' : 415.305,
        'Ab4' : 415.305,
        'A4'  : 440.000,
        'A#4' : 466.164,
        'Bb4' : 466.164,
        'B4'  : 493.883,
        'Cb5'  : 493.883,
        'B#4'  : 523.251,
        'C5'  : 523.251,
        'C#5' : 554.365,
        'Db5' : 554.365,
        'D5'  : 587.330,
        'D#5' : 622.254,
        'Eb5' : 622.254,
        'E5'  : 659.255,
        'Fb5'  : 659.255,
        'E#5'  : 698.456,
        'F5'  : 698.456,
        'F#5' : 739.989,
        'Gb5' : 739.989,
        'G5'  : 783.991,
        'G#5' : 830.609,
        'Ab5' : 830.609,
        'A5'  : 880.000,
        'A#5' : 932.328,
        'Bb5' : 932.328,
        'B5'  : 987.767,
        'Cb6'  : 987.767,
        'B#5'  : 1046.50,
        'C6'  : 1046.50,
        'C#6' : 1108.73,
        'Db6' : 1108.73,
        'D6'  : 1174.66,
        'D#6' : 1244.51,
        'Eb6' : 1244.51,
        'Fb6'  : 1318.51,
        'E6'  : 1318.51,
        'E#6'  : 1396.91,
        'F6'  : 1396.91,
        'F#6' : 1479.98,
        'Gb6' : 1479.98,
        'G6'  : 1567.98,
        'G#6' : 1661.22,
        'Ab6' : 1661.22,
        'A6'  : 1760.00,
        'A#6' : 1864.66,
        'Bb6' : 1864.66,
        'B6'  : 1975.53,
        'Cb7'  : 1975.53,
        'B#6'  : 2093.00,
        'C7'  : 2093.00,
        'C#7' : 2217.46,
        'Db7' : 2217.46,
        'D7'  : 2349.32,
        'D#7' : 2489.02,
        'Eb7' : 2489.02,
        'E7'  : 2637.02,
        'Fb7'  : 2637.02,
        'E#7'  : 2793.83,
        'F7'  : 2793.83,
        'F#7' : 2959.96,
        'Gb7' : 2959.96,
        'G7'  : 3135.96,
        'G#7' : 3322.44,
        'Ab7' : 3322.44,
        'A7'  : 3520.00,
        'A#7' : 3729.31,
        'Bb7' : 3729.31,
        'B7'  : 3951.07,
        'Cb8' : 3951.07,
        'B#7'  : 4186.01,
        'C8'  : 4186.01
    };


    Wad.pitchesArray = [ // Just an array of note names. This can be useful for mapping MIDI data to notes.
        'C0',
        'C#0',
        'D0',
        'D#0',
        'E0',
        'F0',
        'F#0',
        'G0',
        'G#0',
        'A0',
        'A#0',
        'B0',
        'C1',
        'C#1',
        'D1',
        'D#1',
        'E1',
        'F1',
        'F#1',
        'G1',
        'G#1',
        'A1',
        'A#1',
        'B1',
        'C2',
        'C#2',
        'D2',
        'D#2',
        'E2',
        'F2',
        'F#2',
        'G2',
        'G#2',
        'A2',
        'A#2',
        'B2',
        'C3',
        'C#3',
        'D3',
        'D#3',
        'E3',
        'F3',
        'F#3',
        'G3',
        'G#3',
        'A3',
        'A#3',
        'B3',
        'C4',
        'C#4',
        'D4',
        'D#4',
        'E4',
        'F4',
        'F#4',
        'G4',
        'G#4',
        'A4',
        'A#4',
        'B4',
        'C5',
        'C#5',
        'D5',
        'D#5',
        'E5',
        'F5',
        'F#5',
        'G5',
        'G#5',
        'A5',
        'A#5',
        'B5',
        'C6',
        'C#6',
        'D6',
        'D#6',
        'E6',
        'F6',
        'F#6',
        'G6',
        'G#6',
        'A6',
        'A#6',
        'B6',
        'C7',
        'C#7',
        'D7',
        'D#7',
        'E7',
        'F7',
        'F#7',
        'G7',
        'G#7',
        'A7',
        'A#7',
        'B7',
        'C8'
    ];
//////////////////////////////////////////////////////////////

    Wad.midiInstrument = {
        play : function() { console.log('playing midi')  },
        stop : function() { console.log('stopping midi') }
    };
    Wad.midiInputs  = [];

    midiMap = function(event){
        console.log(event.receivedTime, event.data);
        if ( event.data[0] === 144 ) { // 144 means the midi message has note data
            // console.log('note')
            if ( event.data[2] === 0 ) { // noteOn velocity of 0 means this is actually a noteOff message
                console.log('|| stopping note: ', Wad.pitchesArray[event.data[1]-12]);
                Wad.midiInstrument.stop(Wad.pitchesArray[event.data[1]-12]);
            }
            else if ( event.data[2] > 0 ) {
                console.log('> playing note: ', Wad.pitchesArray[event.data[1]-12]);
                Wad.midiInstrument.play({pitch : Wad.pitchesArray[event.data[1]-12], label : Wad.pitchesArray[event.data[1]-12], callback : function(that){
                }})
            }
        }
        else if ( event.data[0] === 176 ) { // 176 means the midi message has controller data
            console.log('controller');
            if ( event.data[1] == 46 ) {
                if ( event.data[2] == 127 ) { Wad.midiInstrument.pedalMod = true; }
                else if ( event.data[2] == 0 ) { Wad.midiInstrument.pedalMod = false; }
            }
        }
        else if ( event.data[0] === 224 ) { // 224 means the midi message has pitch bend data
            console.log('pitch bend');
        }
    };


    var onSuccessCallback = function(midiAccess){
        // console.log('inputs: ', m.inputs)

        Wad.midiInputs = []
        var val = midiAccess.inputs.values();
        for ( var o = val.next(); !o.done; o = val.next() ) {
            Wad.midiInputs.push(o.value)
        }
        // Wad.midiInputs = [m.inputs.values().next().value];   // inputs = array of MIDIPorts
        console.log('MIDI inputs: ', Wad.midiInputs)
        // var outputs = m.outputs(); // outputs = array of MIDIPorts
        for ( var i = 0; i < Wad.midiInputs.length; i++ ) {
            Wad.midiInputs[i].onmidimessage = midiMap; // onmidimessage( event ), event.data & event.receivedTime are populated
        }
        // var o = m.outputs()[0];           // grab first output device
        // o.send( [ 0x90, 0x45, 0x7f ] );     // full velocity note on A4 on channel zero
        // o.send( [ 0x80, 0x45, 0x7f ], window.performance.now() + 1000 );  // full velocity A4 note off in one second.
    };
    var onErrorCallback = function(err){
        console.log("uh-oh! Something went wrong!  Error code: " + err.code );
    };

    if ( navigator && navigator.requestMIDIAccess ) {
        try {
            navigator.requestMIDIAccess().then(onSuccessCallback, onErrorCallback);
        }
        catch(err) {
            var text = "There was an error on this page.\n\n";
            text += "Error description: " + err.message + "\n\n";
            text += "Click OK to continue.\n\n";
            console.log(text);
        }
    }


    Wad.presets = {
        hiHatClosed : { source : 'noise', env : { attack : .001, decay : .008, sustain : .2, hold : .03, release : .01}, filter : { type : 'highpass', frequency : 400, q : 1 } },
        snare : { source : 'noise', env : {attack : .001, decay : .01, sustain : .2, hold : .03, release : .02}, filter : {type : 'bandpass', frequency : 300, q : .180 } },
        hiHatOpen : { source : 'noise', env : { attack : .001, decay : .008, sustain : .2, hold : .43, release : .01}, filter : { type : 'highpass', frequency : 100, q : .2 } },
        ghost : { source : 'square', volume : .3, env : { attack : .01, decay : .002, sustain : .5, hold : 2.5, release : .3 }, filter : { type : 'lowpass', frequency : 600, q : 7, env : { attack : .7, frequency : 1600 } }, vibrato : { attack : 8, speed : 8, magnitude : 100 } },
        piano : { source : 'square', volume : 1.4, env : { attack : .01, decay : .005, sustain : .2, hold : .015, release : .3 }, filter : { type : 'lowpass', frequency : 1200, q : 8.5, env : { attack : .2, frequency : 600 } } }
    };
    return Wad;

})()

if(typeof module !== 'undefined' && module.exports) {
    module.exports = Wad;
}

return Wad;

}));
