"use strict";

// ======================================================================================================== Detector

class Detector {
/*

	Detector tries to identify a periodic signal using a sophisticated autocorrelation method
	
	For frequencies above 100 Hz on an average modern CPU detection will need 3 msec or less.
	For lower frequencies it will be somewhat more.
	
	The first detection may take significantly longer (50..100 msec). 
	Subsequent detections are faster because they assume to see a similar frequency as the last time. 
	If there is a huge jump in frequency detection may take longer (typically 10..20 msec)
*/	

	constructor(reference) {

		this.reference	= reference;
		this.noteStrings= [ 			// a1 ~ 440 Hz = #48
			[							// ENGLISH
				                                                                   "A 0", "Bb 0", "B 0",
				"C 1", "C♯ 1", "D 1", "Eb 1", "E 1", "F 1", "F♯ 1", "G 1", "Ab 1", "A 1", "Bb 1", "B 1",
				"C 2", "C♯ 2", "D 2", "Eb 2", "E 2", "F 2", "F♯ 2", "G 2", "Ab 2", "A 2", "Bb 2", "B 2",
				"C 3", "C♯ 3", "D 3", "Eb 3", "E 3", "F 3", "F♯ 3", "G 3", "Ab 3", "A 3", "Bb 3", "B 3",
				"C 4", "C♯ 4", "D 4", "Eb 4", "E 4", "F 4", "F♯ 4", "G 4", "Ab 4", "A 4", "Bb 4", "B 4",
				"C 5", "C♯ 5", "D 5", "Eb 5", "E 5", "F 5", "F♯ 5", "G 5", "Ab 5", "A 5", "Bb 5", "B 5",
				"C 6", "C♯ 6", "D 6", "Eb 6", "E 6", "F 6", "F♯ 6", "G 6", "Ab 6", "A 6", "Bb 6", "B 6",
				"C 7", "C♯ 7", "D 7", "Eb 7", "E 7", "F 7", "F♯ 7", "G 7", "Ab 7", "A 7", "Bb 7", "B 7",
				"C 8",
			],
			[							// GERMAN  
				                                                                   "A ²", "B ²", "H ²",
				"C 1", "C♯ 1", "D 1", "Es 1", "E 1", "F 1", "F♯ 1", "G 1", "As 1", "A 1", "B 1", "H 1",
				"C  ", "C♯  ", "D  ", "Es  ", "E  ", "F  ", "F♯  ", "G  ", "As  ", "A  ", "B  ", "H  ",
				"c  ", "c♯  ", "d  ", "es  ", "e  ", "f  ", "f♯  ", "g  ", "as  ", "a  ", "b  ", "h  ",
				"c 1", "c♯ 1", "d 1", "es 1", "e 1", "f 1", "f♯ 1", "g 1", "as 1", "a 1", "b 1", "h 1",
				"c ²", "c♯ ²", "d ²", "es ²", "e ²", "f ²", "f♯ ²", "g ²", "as ²", "a ²", "b ²", "h ²",
				"c ³", "c♯ ³", "d ³", "es ³", "e ³", "f ³", "f♯ ³", "g ³", "as ³", "a ³", "b ³", "h ³",
				"c 4", "c♯ 4", "d 4", "es 4", "e 4", "f 4", "f♯ 4", "g 4", "as 4", "a 4", "b 4", "h 4",
				"c 5",
			],
		];
		
		this.notePositions= [                  102, 96, 96,
			90,	90,	84,	78,	78,	72,	72, 66, 60,	60,	54,	54,
			48,	48,	42,	36,	36,	30,	30, 96, 90,	90,	84,	84,
			78,	78,	72,	66,	66,	60,	60,	54,	48,	48,	42,	42,
			36,	36,	30,	24,	24,	18,	18,	12,	 6,	 6,	 0,	 0,
			-7,	-7,	30,	24,	24,	18,	18,	12,	 6,	 6,	 0,	 0,
			-7,	-7,	30,	24,	24,	18,	18,	12,	 6,	 6,	 0,	 0,
			-7,	-7,	30,	24,	24,	18,	18,	12,	 6,	 6,	 0,	 0,
			-7,
		];
		
		this.noteAlterations= [
												0,	-1,	0,
			0,	1,	0,	-1,	0,	0,	1,	0,	-1,	0,	-1,	0,
			0,	1,	0,	-1,	0,	0,	1,	0,	-1,	0,	-1,	0,
			0,	1,	0,	-1,	0,	0,	1,	0,	-1,	0,	-1,	0,
			0,	1,	0,	-1,	0,	0,	1,	0,	-1,	0,	-1,	0,
			0,	1,	0,	-1,	0,	0,	1,	0,	-1,	0,	-1,	0,
			0,	1,	0,	-1,	0,	0,	1,	0,	-1,	0,	-1,	0,
			0,	1,	0,	-1,	0,	0,	1,	0,	-1,	0,	-1,	0,
			0,
		]

		this.ui = {
			detectedNote:	$("#detectedNote"),
			pitch:			$("#pitch"),
			note:			$("#note"),
			noteSharp:		$("#noteSharp"),
			noteFlat:		$("#noteFlat"),
			noteName:		$("#noteName"),
			detune:			$("#detune"),
			detuneAmount:	$("#detuneAmount"),
			rms:			$("#rms"),
			
		}
		
		this.minCorrelation	= 0.8;  // correlations below this threshold are ignored
		this.goodCorrelation= 0.9;
		this.exact			= 1;	// tolerable deviation to show a note as "exact"

		this.minSignal		= 0.05;	// initial or trailing frame values below this level are considered to be noise 
									// and not taken into account for correlation finding
		this.setMinRMS		(3); 	// signals below this threshold are ignored (0..100)
		this.minSampleLevel	= 0.1;	// samples of the normalized signal below this threshold are skipped
		this.minValidSamples = 50;	// to accept a correlation it needs to be based on at least this number of valid samples
		this.minRises		= 2;	// to avoid getting trapped in a local maximum of correlations
									// we expect at least this number of rises in correlation before we accept it as "best"
		this.octaveMin		= 1.13;	// if the correlation of the lower octave is better by at least this factor
									// we assume the lower octave to be the correct match
		this.peakSignal		= 0;	// current peak value

		this.minOffset		= 5;	// initial starting position for match search if no previous freq is known
		
		this.transposition	= 0;	// note key
		
		this.buf			= new Float32Array(8192); // work buffer
		
		this.showDeviation(true);
		
		this.reset();

	}
	
	reset() {
		this.correlations	= new Array(4096);
		this.nextMinOffset	= this.minOffset;	// store the last match and start next matching process near to that offset
		this.lastDisplayTime = 0;
	}
	
	setMinRMS(rms) {
		// define the minimum real mean square energy which is needed to trigger a detection
		// signals below this value are regarded as silence
		
		this.minRMS=rms/100.;
		$("#minRMS").val(rms);
	}
	
	showDeviation(val) {
		this.withDeviation=val;
		if (!val) this.ui.detuneAmount.html("");
	}
	
	autoCorrelate( buf, sampleRate, tickOnly ) {
		// analyse a frame of samples: look for repetitive pattern; 
		// return frequency and rms
		// return -1 if volume is too low
		// return -2 if no pattern could be detected

		var that=theDetector;
		
		// find start and end of signal, first relative maximum, absolute peak and calculate mean value
		var start	= -1;
		var end		= 0;
		var peak	= 0;
		var peakPos	= 0;
		var mean	= 0;
		var relMax	= 0;

		var val,lastVal=1000;
		var rising=false;
		for (var i=0;i<buf.length;i++) {
			val = buf[i];
			if (val>=that.minSignal || val<=-that.minSignal) {
				if (start==-1) start=i;
				end=i;
			}
			if (relMax==0) {
				if (val>lastVal) rising=true;
				if (val<lastVal && rising) relMax=i-1;
				lastVal=val;
			}
			if (start>=0) mean+=val;
			if 		(val> peak) { peakPos=i; peak=val;  }
			else if (val<-peak) { peakPos=i; peak=-val; }
		}
		end++;  // the first sample to be ignored after end of signal
		
		if (start>0) {
			var x = start;
		}
		// if we do not have at least 10 usable samples or if we are only looking for ticks: quit
		if (tickOnly || end-start<10) {
			if (start>0) start=peakPos;
			return {freq:-1,rms:0,period:0,peak:peak,start:start,end:end};
		}		
		
		mean /= (buf.length-start+1);
		var adjust = 1./(peak+Math.abs(mean)); // magnification factor for normalization

		// calculate RMS (signal strength without DC component)
		// attenuate signal: subtract DC component, scale up to achieve a peak level close to +/- 1
		var rms	= 0;
		for (var i=start;i<end;i++) {
			this.buf[i]= buf[i] - mean;
			rms += this.buf[i]*this.buf[i];
			this.buf[i] *=adjust;
		}
		rms = Math.sqrt(rms/(end-start));
		
		// ignore frames which do not have enough energy, RETURN immediately
		if (rms<that.minRMS) {
			that.nextMinOffset=that.minOffset;
			return {freq:-1,rms:rms,period:0,peak:peak,start:start,end:end}; // not enough signal
		}		
		
		// framesize = 2048 ~ 43 msec at 48.000 Hz sampling rate
		// min frequency ~ 49 Hz (sub contra "G")
		// max frequency = 4000 Hz, which is a period of 11 samples;

		var lastCorrelation = 1;
		var vali, valo;

		var offset, maxOffset;
		
		// try two iterations to avoid false frequency doubles (octave jumps)
		// 	(a) find the first relative maximum of correlation
		// 	(b) try again near the half frequency (double period)
		// if the match at (b) is significantly better we accept the lower frequency

		var bestCorrelations= [that.minCorrelation,that.minCorrelation];	// best correlation for each iteration
		var bestOffsets		= [0,0]; 										// corresponding offsets
		var offsetStepsMax	= 4;
		for (var iter=0;iter<2;iter++) {
			if (iter==0) {
				// at 44100 samples/second a frequency of 4kHz (the maximum we want to detect) comprises 11 samples
				// so we start slightly below half of that period (so we do not miss the initial decrease of correlation)
				offset = that.nextMinOffset; // initial offset
				maxOffset = (end-start)/2;
			}
			else {
				// start the second iteration slightly before double period
				// and investigate a small range only
				if (bestOffsets[0]> 250) break; // do not look for very deep frequencies
				offset = Math.round(1.9 * bestOffsets[0] - 5);
				maxOffset = 2.1 * bestOffsets[0] + 5;
				if (maxOffset > (end-start/2)) maxOffset=(end-start) / 2;
			}

			var rises		= 0; 				// number of rising correlations after we have seen a decline
			var risen		= false; 			// true if we have seen sufficient consecutive rises
			var maxSamples	= (start+end)/2;	// the number of samples to compare
			var offsetSteps	= 1;				// sweep step size
			
			// move the offset stepwise until we have a relative maximum of the correlation
			for (; offset < maxOffset; offset+=offsetSteps) {

				// calculate mean sum of absolute differences
				var correlation = 0;
				var validSamples=0;
				for (var i=start; i<maxSamples; i++) {
					// we use only the parts of a signal which are above a certain threshold
					vali = this.buf[i];
					valo = this.buf[i+offset];
					if (Math.abs(vali)<0.05 || Math.abs(valo<0.05)) continue;
					validSamples++;
					correlation += Math.abs(vali-valo); // (vali-valo) is in the range of -2 to 2
				}
				// make sure we have at least some usable samples
				if (validSamples<that.minValidSamples) {
					if (offsetSteps<offsetStepsMax) offsetSteps++;
					continue;
				}
				
				// calculate and store correlation
				correlation = 1 - (correlation/validSamples);	// the correlation can be between -1 .. +1
				that.correlations[offset] = correlation; 			// needed for final interpolation

				// count the number of consecutive improvements of correlation
				if (correlation>lastCorrelation) {
					if (!risen && offsetSteps>1) {
						// make a single huge step to get near the expected maximum
						var jump = Math.floor(offset*0.8)-10; 
						// if (jump>0) offset +=jump;
						offsetSteps=1;  // from now on use small steps
						lastCorrelation=correlation;
						continue;
					}
					offsetSteps=1;
					if (++rises>=that.minRises) risen=true;
				}
				else {
					rises=0; // declining correlations
					if (offsetSteps<offsetStepsMax) offsetSteps++;  // use larger steps
				}
				
				// at the beginning the correlation will typically decrease
				// only after we have seen at least once a steady increase of correlations things start to become interesting
				// if we see another decrease afterwards and if we had a sufficiently positive correlation before we are done
				if (risen && bestCorrelations[iter]>that.minCorrelation && correlation<lastCorrelation) {
					that.correlations[offset+1]=-1;  // put a marker (for debugging) into the correlations array
					break;
				}

				// store current correlation for detection of increase/decrease at the next offset
				lastCorrelation=correlation;

				// if we are in a constant ascend and if we exceed the minimum threshold we may have
				// a new candidate for the best correlation observed so far
				if (((correlation>=this.goodCorrelation && rises>0) || rises>that.minRises) && correlation>bestCorrelations[iter]) {
					bestCorrelations[iter] = correlation;
					bestOffsets[iter] = offset;
				}
			}
						
			// stop if we did not find any good correlation in the first iteration
			if (iter== 0 && bestCorrelations[iter] <= that.minCorrelation) {
				that.nextMinOffset=that.minOffset;
				return {freq:-2,rms:rms,period:0,peak:peak,start:start,end:end};
			}

			// if we have a good result let us check also the lower octave
		}

		// now we have two good correlations
		// we pick the second one if it is significantly better
		
		var bestOffset=bestOffsets[0];
		if (bestCorrelations[1]>bestCorrelations[0]*that.octaveMin) {
			console.log("octave");
		}
		if (bestCorrelations[1]>bestCorrelations[0]*that.octaveMin) bestOffset=bestOffsets[1];
		
		// interpolating between the values to the left and right of the best offset.
		var shift=0;
		if (that.correlations[bestOffset+1]>0 && that.correlations[bestOffset-1]>0) {
			//interpolate
			shift = (that.correlations[bestOffset+1] - that.correlations[bestOffset-1])/that.correlations[bestOffset];  
		}
		else {
			// This should hardly occur: we have a good correlation and the adjacent offsets did not deliver
			// sufficient valid samples
			that.nextMinOffset=that.minOffset;
			return {freq:-2,rms:rms,period:0,peak:peak,start:start,end:end};
		}
		// start next search close to this offset
		that.nextMinOffset=Math.round(bestOffset/2.6);  // this finds upward jumps of 1 (octave+quint)
		var freq = sampleRate/(bestOffset+(8*shift));
		
		if (relMax+bestOffset*11<buf.length) {
			// for high frequencies we try to match relative peeks
			var expectedRelMax=relMax+Math.round(10*bestOffset+(8*shift));
			var bMax=0;
			for(var b=expectedRelMax-10;b<expectedRelMax+10;b++) {
				if (bMax==0 && buf[b]>buf[b-1]) bMax=1;
				if (bMax==1 && buf[b]<buf[b-1]) {
					bMax=b-1;
					break;
				}
			}
			if (bMax>2) {
				bestOffset=(bMax-relMax)/10.;
				freq = sampleRate/(bestOffset);
			}
		}
				
		// return frequency, period, peak, start, end and note number (semitones from "A")
		return {freq:freq,rms:rms,period:Math.round(bestOffset),peak:peak,start:start,end:end,note:theDetector.noteFromPitch(freq)};

	}
		
	draw(signal,smoothedNote) {
		// refresh the box with the note name and detune amount

		var freq = signal.freq;
		this.ui.noteName.css("color", freq>0 ? "black":"lightgray");
		if (this.withDeviation) this.ui.detuneAmount.css("color", freq>0 ? "black":"lightgray");

		var peak = Math.round(signal.peak*100);
		var now=Date.now();
		if((peak>0 && peak>this.peakSignal) || now-this.lastDisplayTime>1000) {	// hold for 1 second
			this.peakSignal=peak;
			this.ui.rms.html(peak);
			this.lastDisplayTime=now;
		}	
		if (freq<0) return;
		
		this.ui.pitch.text(Math.round( freq * 10 ) / 10.);
		
		// display note name and octave (language dependent)
		var name = this.noteName(signal.note,false);
		if (name.length==1) name=name+"&nbsp;";
		var octave = Math.floor((signal.note+this.transposition+57.50)/12);
		if (theLang.lang=="de") {
			if 		(octave<=1) octave = "<sup><span style='font-size:50%'>&nbsp;"+octave+"</span></sup>";
			else if (octave>=4) octave = "<sup><span style='font-size:50%'>&nbsp;"+(octave-2)+"</span></sup>"
			else 				octave = "<sup><span style='font-size:50%'>&nbsp;</span></sup>";
		}
		else {
			octave = "<sup><span style='font-size:50%'>&nbsp;"+octave+"</span></sup>";
		}
		this.ui.noteName.html(name+octave);
		
		if (signal.note+this.transposition<=-26)	$("#system").css("backgroundImage","url('img/systemLow.png')");
		else 										$("#system").css("backgroundImage","url('img/system.png')");
		
		var pos=this.notePos(signal.note);
		if (pos.alt==1) {
			this.ui.noteSharp.css({top:pos.top});
			this.ui.noteSharp.show();
			this.ui.note.hide();
			this.ui.noteFlat.hide();
		}
		else if (pos.alt==-1) {
			this.ui.noteFlat.css({top:pos.top});
			this.ui.noteFlat.show();
			this.ui.note.hide();
			this.ui.noteSharp.hide();
		}
		else {
			this.ui.note.css({top:pos.top});
			this.ui.note.show();
			this.ui.noteFlat.hide();
			this.ui.noteSharp.hide();
		}
		
		if (this.withDeviation) {
			// var detune = Math.round(100 * (signal.note-Math.round(signal.note)));
			var detune = Math.round(100 * (smoothedNote-Math.round(smoothedNote)));
			if (detune >= -this.exact && detune <= this.exact) this.ui.detuneAmount.html("--");
			else if (detune<=-10) this.ui.detuneAmount.html(detune + " cents");
			else if (detune>=+10) this.ui.detuneAmount.html("&nbsp;"+detune + " cents");
			else if (detune>=  0) this.ui.detuneAmount.html("&nbsp;&nbsp;"+detune + " cents");
			else if (detune<   0) this.ui.detuneAmount.html("&nbsp;"+detune + " cents");
		}
	}

	setReference(reference) {
		theOscillator.setReference(reference);	// align the standard oscillator
		this.reference	= reference;
	}
	
	setTransposition(transposition) {
		this.transposition=transposition;
	}
	
	noteName(noteNr,withOctave) {
		// expecting a note number (a = 44x Hz = 0 )
		var note = Math.round(noteNr + 48 + this.transposition) ; // we might want to show a transposed note name
		if (note<0 || note>=this.noteStrings[0].length) return "";
		var name = this.noteStrings[theLang.lang=="de"?1:0][note];
		if (withOctave) return name;
		else 			return name.replace(/ .*/,'');
	}
	
	naturalNoteName(noteNr,withOctave) {
		if (this.transposition==0) return this.noteName(noteNr,withOctave);
		var transposition=this.transposition;
		this.transposition=0;
		var name= this.noteName(noteNr,withOctave);
		this.transposition=transposition;
		return name;
	}
	
	noteFromPitch( freq ) {
		return 12 * (Math.log( freq / this.reference )/Math.log(2) );
	}
	
	noteNameFromPitch ( freq ) {
		return this.noteName(Math.round(this.noteFromPitch(freq)));
	}

	frequencyFromNote( note ) {
		return this.reference * Math.pow(2,(note-69)/12);
	}

	notePos(note) {
		var n = Math.round(note+48+this.transposition);
		var top = this.notePositions[n];
		var alt = this.noteAlterations[n];
		return {top:top,alt:alt};
	}
}

