/*This module wraps the audio listener to create a uniform interface between browsers, mainly Safari and other browsers:
https://developer.mozilla.org/en-US/docs/Web/API/AudioListener
*/

class AudioParam{
	// this is a wrapper for Safari if the browser does not support listener.positionX or the other properties
	constructor(value, setFunc){
		this._setFunc = setFunc;
		this.AudioParamautomationRate = 'a-rate';
		this.defaultValue = value;
		this.maxValue = 3.4028234663852886e+38;
		this.minValue = -3.4028234663852886e+38;
		this._value = this.defaultValue;
	}

	get value(){
		return this._value;
	}

	set value(v){
		this._setFunc(v);
		this._value = v;
	}
}

export default class AudioListener{
	constructor(context){
		this._listener = context.listener;
		window.listener = this._listener;
		this.positionX = this._listener.positionX || new AudioParam(0, v=>this._listener.setPosition(v, this.positionY.value, this.positionZ.value));
		this.positionY = this._listener.positionY || new AudioParam(0, v=>this._listener.setPosition(this.positionX.value, v, this.positionZ.value));
		this.positionZ = this._listener.positionZ || new AudioParam(0, v=>this._listener.setPosition(this.positionX.value, this.positionY.value, v));
		this.forwardX = this._listener.forwardX || new AudioParam(0, v=>this._listener.setOrientation(v, this.forwardY.value, this.forwardZ.value, this.upX.value, this.upY.value, this.upZ.value));
		this.forwardY = this._listener.ForwardY || new AudioParam(0, v=>this._listener.setOrientation(this.forwardX.value, v, this.forwardZ.value, this.upX.value, this.upY.value, this.upZ.value));
		this.forwardZ = this._listener.forwardZ || new AudioParam(-1, v=>this._listener.setOrientation(this.forwardX.value, this.forwardY.value, v, this.upX.value, this.upY.value, this.upZ.value));
		this.upX = this._listener.upZ || new AudioParam(0, v=>this._listener.setOrientation(this.forwardX.value, this.forwardY.value, this.forwardZ.value, v, this.upY.value, this.upZ.value));
		this.upY = this._listener.upY || new AudioParam(1, v=>this._listener.setOrientation(this.forwardX.value, this.forwardY.value, this.forwardZ.value, this.upX.value, v, this.upZ.value));
		this.upZ = this._listener.upZ || new AudioParam(0, v=>this._listener.setOrientation(this.forwardX.value, this.forwardY.value, this.forwardZ.value, this.upX.value, this.upY.value, v));
	}

	setPosition(x, y, z){
		this.positionX.value = x;
		this.positionY.value = y;
		this.positionZ.value = z;
	}

	getPosition(){
		return [this.positionX.value, this.positionY.value, this.positionZ.value];
	}

	setOrientation(forwardX, forwardY, forwardZ, upX, upY, upZ){
		this.forwardX.value = forwardX;
		this.forwardY.value = forwardY;
		this.forwardZ.value = forwardZ;
		this.upX.value = upX;
		this.upY.value = upY;
		this.upZ.value = upZ;
	}

	getOrientation(){
		return [this.forwardX.value, this.forwardY.value, this.forwardZ.value, this.upX.value, this.upY.value, this.upZ.value];
	}
}