"use strict";

// ======================================================================================================== Analyser

class Analyser {
/*
	The Analyser offers an analyse() method which is expected to be called in regular intervals.
	When called it takes a frame (e.g. 2048 samples) from the current audio source and passes it to the
	Detector which tries to identify a periodic signal in the frame.
	Thereafter the Analyser shows the signal (using class Wave and/or Timeline).

	The Analyser stores the latest frame and can extract exactly one (or more) signal periods from that frame,
	thus creating a pattern sample. The Analyser can replay this sample in an endless loop.
	It can also use the pattern sample to extract its harmonics (fast Fourier trabsform) and pass them to the Oscillator class.

	Apart from finding periodic signals the Analyser can also be asked to care for aperiodic signals (sudden volume rises).
	This can be useful for rhythmic training. In that case the user typically will "tap" on the table to produce
	a significant rise in volume.
*/

	constructor() {

		this.analyserNode			= null;		// Media API analyser
		this.resetWaveTime();

		this.sampleLoop				= null;		// a loop frame which is constructed from periodic samples
		this.holdTime				= 300;		// milliseconds to hold the reference tone after micro signal has gone
		this.refToneInterval		= +4;		// difference between generated reference tone and detected tone (in semitones)

		this.toneBuffer				= null;
		this.noiseBuffer			= null;

		this.lastNote				= "none";	// last detected note
		this.lastSignal				= null;
		this.lastTapTime			= 0;		// time of last detected rhythm "tap" event (=significant raise in signal energy)
		this.minTapPeakLevel		= 0.05;		// the minimum signal level required for a "tap" detection (rhythmic analysis)
		this.tapDeadTime			= 20;		// minimum time distance (msec) between two tap events (when closer the second event is ignored)
		this.now					= Date.now();
		this.shallAnnounceNoteNames	= false;
		this.noteSpoken				= false;
		this.noteChangeTime			= 0;

		$("#sampling").hide();
	}

	resetWaveTime() {
		// reset and define the interval for refreshing the oscilloscope view
		this.lastWaveDrawingTime = 0;
		this.waveDrawingInterval = 500; 	// redraw wave form every 500 msec
	}

	showSampling(val) {
		// show or hide the menu which allows sample patterns to be taken and replayed in a loop
		if (val)	$('#sampling').show();
		else		$('#sampling').hide();
	}

	create(input,fftSize) {
		// create a Media API Analyser Node; must be called once before analyse() can be called
		// fftSize must pe a power of 2, typical values: 2048 or 4096
		// input is the Media AOI node which provides the audio stream data for the analyser

		this.analyserNode = audioContext.createAnalyser();
		this.fftSize=fftSize;
		this.analyserNode.fftSize = fftSize;
		this.buf = new Float32Array(fftSize);
		input.connect(this.analyserNode);
	}

	analyse( animationTime ) {
		// request a frame, trigger signal detection and care for showing the result

		var that=theAnalyser;

		// time stamps to monitor calling rhythm and time consumption
		that.past=that.now;
		that.now=Date.now();

		// request data buffer
		that.analyserNode.getFloatTimeDomainData( that.buf );

		// let the Detector find potential periodicity of the signal (in normal mode) or first signal raise (in "rhythm" mode)
		var signal = theDetector.autoCorrelate( that.buf, audioContext.sampleRate, theTunator.mode=="rhythm" );

		// show the amount of time that was necessary for detection (the calling period should be significantly larger)
		$("#loopTime").text(that.now-that.past);
		$("#detectTime").text(Date.now()-that.now);

		if (theTunator.mode=="rhythm") {
			// only consider the start of a signal (may even be non-periodic)
			if (signal.start>0 && signal.peak>that.minTapPeakLevel) {
				// calculate start time in msec (relative to the beginning of the detection process)
				var startTime = that.now+1000*signal.start/48000. - theTunator.detectionStart;
				// console.log((that.now-theTunator.detectionStart)+": "+startTime+" "+signal.peak);

				// if signal is strong enough: add signal to Timeline and show
				if (Math.abs(that.lastTapTime-startTime) > that.tapDeadTime) {
					// due to slightly overlapping frames we may see the same signal twice
					// therefore two signals closer than a certain time (20 msec) are considered to be the same signal
					// console.log (" ************ TICK");
					theTimeline.addTick(startTime, signal);
					that.lastTapTime=startTime;
				}
			}
			theTimeline.drawRhythm();
		}
		else if (signal.freq < 0) {

			// weg did not find a periodic signal

			if (theTunator.mode=="intonation") {
				if (that.lastNote!="none" && Date.now() - that.lastTapTime>that.holdTime) {
					theOscillator.pause();
					that.lastNote="none";
				}
			}

			theTimeline.add(1000);
			theTimeline.drawNote(1000);

			if (signal.freq<-1) theWave.drawNoise(that.buf);

			theDetector.draw(signal,null);	// keep last frequency, use grey color

			// unless we are already playing a loop sample: store the unrecognized pitch ("noise") so that we can use it for a loop sample
			if (signal.freq==-2 && theTunator.speakerSource!="sample") that.noiseBuffer=that.buf.slice();

			that.noteChangeTime=that.now;

		}

		else {
			// we found a periodic signal

			// add freq to timeline array (also calculates smoothed pitch)
			var smoothedNote = theTimeline.add(signal.note);
			var smoothedNoteCents = Math.round(100 * smoothedNote);
			var scaledNoteCents = 100 * Math.round(smoothedNote);

			// set oscillator to scaled note when in intonation mode (accompanied playing)
			if (theTunator.mode=="intonation") {
				if (that.lastNote=="none") theOscillator.resume();
				theOscillator.setDetune(scaledNoteCents,smoothedNoteCents);
				that.lastNote=scaledNoteCents;
			}

			// update detector ui: show note name, deviation, note system
			theDetector.draw(signal,smoothedNote);

			// draw the current wave form in regular intervals
			if (animationTime-that.lastWaveDrawingTime > that.waveDrawingInterval) {
				theWave.drawNote(that.buf,signal);
				that.lastWaveDrawingTime=animationTime;
			}

			// draw timeline
			theTimeline.drawNote(signal);

			// if we are not playing a loop sample
			if (theTunator.speakerSource!="sample") {

				//store the buffer so that we can use it for a loop sample (on the user´s request)
				that.toneBuffer=that.buf.slice();

				// speak the note name if we have had a stable new note for more than 1 second
				if (that.shallAnnounceNoteNames) {
					if (that.lastSignal!=null && Math.round(that.lastSignal.note)!=Math.round(signal.note)) {
						// we have a different note
						that.noteChangeTime=that.now;
						that.noteSpoken=false;
					}
					else if (!that.noteSpoken && (that.now-that.noteChangeTime>1000)) {
						theTunator.speakNoteName(Math.round(signal.note));
						that.noteSpoken=true;
					}
				}

				// store latest signal
				that.lastSignal=signal;
				that.lastTapTime=that.now;

			}

		}

		$("#loopTime").text(that.now-that.past);

	}

	captureSample(n) {
		// capture one cycle of a repetitive pattern (1) or as many repetitions as possible (2)
		// or just take the last frame with periodicity (3) or the last noise frame (4)

		var that=theAnalyser;

		if (n==4) {
			// use the last noise buffer as a loop frame

			if (that.noiseBuffer==null) return;

			theTunator.stopDetection();

			var size=that.noiseBuffer.length;
			that.sampleLoop = new Float32Array(size);
			for(var b=0;b<that.noiseBuffer.length;b++) that.sampleLoop[b] = that.noiseBuffer[b];
		}
		else {
			// use the last tone buffer (or a part of it) as loop frame

			if (that.toneBuffer==null) return;

			theTunator.stopDetection();

			var start=0;
			var length=that.toneBuffer.length;

			if (n<3) {

				// find a good point for triggering: ignore initial period of weak signal or silence
				// we start at a point where we have at least 30% of the peak signal

				var threshold=0.3;
				var repeats=1;
				var crossing=-1;
				for( ; threshold>0;threshold-=0.05) {
					start=0;
					for (var b=0;b<that.toneBuffer.length-1;b++) {
						if (that.toneBuffer[b]<=0 && that.toneBuffer[b+1]>0) crossing=b;
						if (Math.abs(that.toneBuffer[b])>that.lastSignal.peak*threshold) {
							start=b;
							break;
						}
					}
					if (Math.abs(that.toneBuffer[start])>that.lastSignal.peak*threshold) break;
				}
				// from there we advance to the previous or next zero crossing from negative to positive values
				if (crossing>0) {
					start=crossing; // wel already had such a crossing
				}
				else {
					// we look for the next crossing
					for(;start<length-1;start++) {
						if (that.toneBuffer[start]<=0 && that.toneBuffer[start+1]>0) break;
					}
				}

				// find an end position with sufficient signal strength
				// = exclude a potentially long period of no signal at the end of he frame
				var end;
				for( ; threshold>0;threshold-=0.05) {
					end=that.toneBuffer.length-1;
					for (var b=end;b>start+that.lastSignal.period+20;b--) {
						if (Math.abs(that.toneBuffer[b])>that.lastSignal.peak*threshold) {
							end=b;
							break;
						}
					}
					if (Math.abs(that.toneBuffer[end])>that.lastSignal.peak*threshold) break;
				}

				// now we have a range which can be used to extract one or more periods
				var period=that.lastSignal.period;	// take a single period

				// if the number of usable samples is less than one period: quit
				if (end-start+1 < period) {
					that.sampleLoop = null;
					return;
				}

				if (n==2 && period>0) {
					// take as many periods as possible
					repeats = Math.floor((end-start+1)/period);
				}

				// calculate the number of samples that match the given number of repetitions of the period
				length=period*repeats;	// this is what we would expect

				// fine tuning: find smoothest transition for wrap around near the calculated length
				var startBuffer = that.toneBuffer[start];
				var pos=start+length;
				var delta1=Math.abs(that.toneBuffer[pos]-startBuffer);
				var length1=length;
				// extend the range by up to 30% of one period
				for (var n=1;n<period*0.3;n++) {
					// check neighborhood
					if (Math.abs(that.toneBuffer[pos+n]-startBuffer)<delta1) {
						delta1=Math.abs(that.toneBuffer[pos+n]-startBuffer);
						length1=pos+n-start;
					}
					else break;
				}
				var delta2=Math.abs(that.toneBuffer[pos]-startBuffer);
				var length2=length;
				// shrink the range by up to 30% of one period
				for (var n=1;n<period*0.3;n++) {
					// check neighborhood
					if (Math.abs(that.toneBuffer[pos-n]-startBuffer)<delta2) {
						delta2=Math.abs(that.toneBuffer[pos-n]-startBuffer);
						length2=pos-n-start;
					}
					else break;
				}
				// now take the best fitting interval length
				length = (delta1<=delta2) ? length1 : length2;
				// console.log("sample loop period alignment from "+repeats+" * "+that.lastSignal.period+" = "+(period*repeats)+" to "+length);
			}

			var size=Math.floor(that.toneBuffer.length/length)*length;

			if (size<=0) {
				that.sampleLoop = null;
				return;
			}

			// transfer the samples from the toneBuffer to the sampleLoop
			that.sampleLoop = new Float32Array(size);
			for(var b=0;b<size;b++) that.sampleLoop[b] = that.toneBuffer[start+ (b%length)];
		}

		// highlight tel "loop" button to indiocate that a sample was successfully selected
		$("#sampleLoopSource").css("background-color","lightyellow");

		// use the sample loop data for detection and play it voa the speakers
		theTunator.selectAudio("");
		theTunator.selectDetectionSource("");
		theTunator.selectAudio("sample");
	}

	fillFromSampleLoop(buf) {
		// fill the passed buffer with the sample loop data
		for (var b=0;b<buf.length;b++) {
			buf[b]=this.sampleLoop[b];
		}
	}

	announceNoteNames(val) {
		// activate or deactivate the announcements of note names
		this.shallAnnounceNoteNames=val;
		$("#announceNoteNames").css("background-color",val ? "lightgreen" : "");
	}

	toggleAnnounceNoteNames() {
		this.announceNoteNames(!this.shallAnnounceNoteNames);
	}

	fft() {
		// perform fast Fourier analysis for the sample loop updateAuxInterval
		// and return two arrays with real and imaginary values

		this.captureSample(1);
		if (!this.sampleLoop) return null;
		var size = this.sampleLoop.length;
		if (size<=0) return [[],[]];

		var inputreal = new Array(size);
		for(var v=0;v<size;v++) inputreal[size-1-v]=this.sampleLoop[v];
		var inputimag = new Array(size); inputimag.fill(0);
		var refoutreal = new Array(size);
		var refoutimag = new Array(size);
		naiveDft(inputreal, inputimag, refoutreal, refoutimag, false);

		// var actualoutreal = inputreal.slice();
		// var actualoutimag = inputimag.slice();
		// transform(actualoutreal, actualoutimag);

		return [refoutreal,refoutimag];

		//		document.write("fftsize=" + size + "  logerr=" +
		//			log10RmsErr(refoutreal, refoutimag, actualoutreal, actualoutimag).toFixed(1) + "\n");
	}

}

// ***************************************************************************************************
//
//	hereafter we include a set of library functions to perform FFT ...
//
// ***************************************************************************************************

/*
 * Free FFT and convolution (JavaScript)
 *
 * Copyright (c) 2017 Project Nayuki. (MIT License)
 * https://www.nayuki.io/page/free-small-fft-in-multiple-languages
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 * - The above copyright notice and this permission notice shall be included in
 *   all copies or substantial portions of the Software.
 * - The Software is provided "as is", without warranty of any kind, express or
 *   implied, including but not limited to the warranties of merchantability,
 *   fitness for a particular purpose and noninfringement. In no event shall the
 *   authors or copyright holders be liable for any claim, damages or other
 *   liability, whether in an action of contract, tort or otherwise, arising from,
 *   out of or in connection with the Software or the use or other dealings in the
 *   Software.
 */

"use strict";


/*
 * Computes the discrete Fourier transform (DFT) of the given complex vector, storing the result back into the vector.
 * The vector can have any length. This is a wrapper function.
 */
function transform(real, imag) {
	var n = real.length;
	if (n != imag.length)
		throw "Mismatched lengths";
	if (n == 0)
		return;
	else if ((n & (n - 1)) == 0)  // Is power of 2
		transformRadix2(real, imag);
	else  // More complicated algorithm for arbitrary sizes
		transformBluestein(real, imag);
}


/*
 * Computes the inverse discrete Fourier transform (IDFT) of the given complex vector, storing the result back into the vector.
 * The vector can have any length. This is a wrapper function. This transform does not perform scaling, so the inverse is not a true inverse.
 */
function inverseTransform(real, imag) {
	transform(imag, real);
}


/*
 * Computes the discrete Fourier transform (DFT) of the given complex vector, storing the result back into the vector.
 * The vector's length must be a power of 2. Uses the Cooley-Tukey decimation-in-time radix-2 algorithm.
 */
function transformRadix2(real, imag) {
	// Length variables
	var n = real.length;
	if (n != imag.length)
		throw "Mismatched lengths";
	if (n == 1)  // Trivial transform
		return;
	var levels = -1;
	for (var i = 0; i < 32; i++) {
		if (1 << i == n)
			levels = i;  // Equal to log2(n)
	}
	if (levels == -1)
		throw "Length is not a power of 2";

	// Trigonometric tables
	var cosTable = new Array(n / 2);
	var sinTable = new Array(n / 2);
	for (var i = 0; i < n / 2; i++) {
		cosTable[i] = Math.cos(2 * Math.PI * i / n);
		sinTable[i] = Math.sin(2 * Math.PI * i / n);
	}

	// Bit-reversed addressing permutation
	for (var i = 0; i < n; i++) {
		var j = reverseBits(i, levels);
		if (j > i) {
			var temp = real[i];
			real[i] = real[j];
			real[j] = temp;
			temp = imag[i];
			imag[i] = imag[j];
			imag[j] = temp;
		}
	}

	// Cooley-Tukey decimation-in-time radix-2 FFT
	for (var size = 2; size <= n; size *= 2) {
		var halfsize = size / 2;
		var tablestep = n / size;
		for (var i = 0; i < n; i += size) {
			for (var j = i, k = 0; j < i + halfsize; j++, k += tablestep) {
				var l = j + halfsize;
				var tpre =  real[l] * cosTable[k] + imag[l] * sinTable[k];
				var tpim = -real[l] * sinTable[k] + imag[l] * cosTable[k];
				real[l] = real[j] - tpre;
				imag[l] = imag[j] - tpim;
				real[j] += tpre;
				imag[j] += tpim;
			}
		}
	}

	// Returns the integer whose value is the reverse of the lowest 'bits' bits of the integer 'x'.
	function reverseBits(x, bits) {
		var y = 0;
		for (var i = 0; i < bits; i++) {
			y = (y << 1) | (x & 1);
			x >>>= 1;
		}
		return y;
	}
}

/*
 * Computes the discrete Fourier transform (DFT) of the given complex vector, storing the result back into the vector.
 * The vector can have any length. This requires the convolution function, which in turn requires the radix-2 FFT function.
 * Uses Bluestein's chirp z-transform algorithm.
 */
function transformBluestein(real, imag) {
	// Find a power-of-2 convolution length m such that m >= n * 2 + 1
	var n = real.length;
	if (n != imag.length)
		throw "Mismatched lengths";
	var m = 1;
	while (m < n * 2 + 1)
		m *= 2;

	// Trignometric tables
	var cosTable = new Array(n);
	var sinTable = new Array(n);
	for (var i = 0; i < n; i++) {
		var j = i * i % (n * 2);  // This is more accurate than j = i * i
		cosTable[i] = Math.cos(Math.PI * j / n);
		sinTable[i] = Math.sin(Math.PI * j / n);
	}

	// Temporary vectors and preprocessing
	var areal = newArrayOfZeros(m);
	var aimag = newArrayOfZeros(m);
	for (var i = 0; i < n; i++) {
		areal[i] =  real[i] * cosTable[i] + imag[i] * sinTable[i];
		aimag[i] = -real[i] * sinTable[i] + imag[i] * cosTable[i];
	}
	var breal = newArrayOfZeros(m);
	var bimag = newArrayOfZeros(m);
	breal[0] = cosTable[0];
	bimag[0] = sinTable[0];
	for (var i = 1; i < n; i++) {
		breal[i] = breal[m - i] = cosTable[i];
		bimag[i] = bimag[m - i] = sinTable[i];
	}

	// Convolution
	var creal = new Array(m);
	var cimag = new Array(m);
	convolveComplex(areal, aimag, breal, bimag, creal, cimag);

	// Postprocessing
	for (var i = 0; i < n; i++) {
		real[i] =  creal[i] * cosTable[i] + cimag[i] * sinTable[i];
		imag[i] = -creal[i] * sinTable[i] + cimag[i] * cosTable[i];
	}
}


/*
 * Computes the circular convolution of the given real vectors. Each vector's length must be the same.
 */
function convolveReal(x, y, out) {
	var n = x.length;
	if (n != y.length || n != out.length)
		throw "Mismatched lengths";
	convolveComplex(x, newArrayOfZeros(n), y, newArrayOfZeros(n), out, newArrayOfZeros(n));
}


/*
 * Computes the circular convolution of the given complex vectors. Each vector's length must be the same.
 */
function convolveComplex(xreal, ximag, yreal, yimag, outreal, outimag) {
	var n = xreal.length;
	if (n != ximag.length || n != yreal.length || n != yimag.length
			|| n != outreal.length || n != outimag.length)
		throw "Mismatched lengths";

	xreal = xreal.slice();
	ximag = ximag.slice();
	yreal = yreal.slice();
	yimag = yimag.slice();
	transform(xreal, ximag);
	transform(yreal, yimag);

	for (var i = 0; i < n; i++) {
		var temp = xreal[i] * yreal[i] - ximag[i] * yimag[i];
		ximag[i] = ximag[i] * yreal[i] + xreal[i] * yimag[i];
		xreal[i] = temp;
	}
	inverseTransform(xreal, ximag);

	for (var i = 0; i < n; i++) {  // Scaling (because this FFT implementation omits it)
		outreal[i] = xreal[i] / n;
		outimag[i] = ximag[i] / n;
	}
}


function newArrayOfZeros(n) {
	var result = [];
	for (var i = 0; i < n; i++)
		result.push(0);
	return result;
}

function naiveDft(inreal, inimag, outreal, outimag, inverse) {
	var n = inreal.length;
	if (n != inimag.length || n != outreal.length || n != outimag.length)
		throw "Mismatched lengths";

	var coef = (inverse ? 2 : -2) * Math.PI;
	for (var k = 0; k < n; k++) {  // For each output element
		var sumreal = 0;
		var sumimag = 0;
		for (var t = 0; t < n; t++) {  // For each input element
			var angle = coef * (t * k % n) / n;  // This is more accurate than t * k
			sumreal += inreal[t] * Math.cos(angle) - inimag[t] * Math.sin(angle);
			sumimag += inreal[t] * Math.sin(angle) + inimag[t] * Math.cos(angle);
		}
		outreal[k] = sumreal;
		outimag[k] = sumimag;
	}
}
