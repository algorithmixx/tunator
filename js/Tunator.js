"use strict";

/*

	Tunator.js : A musical training tool which helps to improve intonation

	Various components (pitch detector, oscilloscope, timeline grid, sound generator)
	can be combined in different ways to form training lessons like
	* recognizing pitch differences
	* singing/playing intervals correctly
	* assisted playing (Tunator plays notes that correspond to detected pitch)

	To avoid acoustic feedback loops the user should wear headphones.

	WORK IN PROGRESS, Gero Scholz, 2019

*/
// ======================================================================================================== Tunator

class Tunator {
	//	Tunator controls audio sources and initiates the pitch detection process

	constructor() {
		if (!window.requestAnimationFrame) window.requestAnimationFrame = window.webkitRequestAnimationFrame;

		this.lang					= 1;				// 0 = ENGLISH, 1 = GERMAN

		this.toneFrameSize			= 2048;				// ~ 43 msec at 48.000 Hz sampling when looking for periodic signals
		this.toneDetectionRate		= 45;				// time period (msec) for detection of periodic signals
														// no overlap with frame duration
		// this.toneDetectionRate		= 500;				// test value

		this.tapFrameSize			= 4096;				// ~ 86 msec at 48.000 Hz sampling when looking for rhythmic events
		this.tapDetectionRate		= 68;				// time period (msec) for detection of rhythmic events
														// 68 msec = 20% overlap with frame duration

		this.frameSize				= this.toneFrameSize;
		this.setDetectionRate		( this.toneDetectionRate );

		this.isDetecting			= false;
		this.detectionTimer			= null;
		this.detectionStart 		= 0;				// timestamp of last detection start

		this.detectionSource		= "";				// the sound source used for detection
		this.speakerSource			= "";				// the sound source used for speakers / headphones
		this.microphoneTrack		= null;

		this.audioNode				= null;

		this.mode					= "";
		this.scoreVisible			= false;

		this.loadNoteNames();
	}

	configure(components) {
		// takes an array of components which shall be presented to the user
		// and applies default settings to all components

		$("#menu").hide();
		theOscillator.hideControl();
		theWave.hide();
		theTimeline.hide();
		theMidi.hide();
		$("#other").hide();

		$("#reference").val(443);
		theDetector.setReference(443);
		theDetector.showDeviation(true);
		theDetector.setTransposition(0);
		this.selectDetectionSource("");
		theAnalyser.announceNoteNames(false);

		if (components.includes("menu")) {
			$("#menu").show();
		}
		if (components.includes("osc")) {
			theOscillator.showControl();
			theOscillator.setDetune(-900);
			theOscillator.setMode("straight");
			theOscillator.setType("sine");
			this.selectAudio("oscillator");
		}
		if (components.includes("wave")) {
			theWave.show();
		}
		if (components.includes("timeline")) {
			theTimeline.show();
		}
		if (components.includes("midi")) {
			theMidi.show();
		}
		if (components.includes("micro")) {
			theTunator.selectDetectionSource("micro");
		}
	}

	setDetectionRate(rate) {
		// defie the detection cycle rate in msec
		this.detectionRate=rate;
		$("#rate").text(rate);
	}

	setMode(mode) {
		// select "rhythm mode" (experimental) or "intonation mode"

		if (this.mode!="") $("#"+this.mode).css("background-color","");
		if (mode==this.mode) {
			this.mode="";
			this.selectDetectionSource("");
			this.selectAudio("");
		}
		else {
			this.setDetectionRate (this.toneDetectionRate);
			this.frameSize		= this.toneFrameSize;
			if (theOscillator.getFreq()<10) {
				theOscillator.setDetune(-1200);
				theOscillator.setType("custom");
			}

			// $("#wave").show();
			$("#"+mode).css("background-color","lightgreen");
			this.mode=mode;
			if (mode=="rhythm") {
				// listen to "tap" noise
				this.frameSize= this.tapFrameSize;
				this.setDetectionRate(this.tapDetectionRate);
				theOscillator.setTempo(80,4 );
				this.selectDetectionSource("micro");
				this.selectAudio("oscillator");
				theWave.hide();
				theTimeline.show();
			}
			else if (mode=="intonation") {
				// listen to the microphone and play one or more tones with a certain interval related to the detected tone
				this.selectDetectionSource("micro");
				this.selectAudio("");
				this.selectAudio("oscillator");
				theOscillator.sweep(0,0);
				theOscillator.pause();
			}
		}
	}

	detect(clearSample) {
		// start pitch detection

		if (theTunator.isDetecting) return;
		if (clearSample) {
			$("#sampleLoopSource").css("background-color","");
		}
		theAnalyser.resetWaveTime();
		// start detection; if the oscillator was started immediately before we assume that detection and oscillator
		// started at the very same moment
		theTunator.detectionStart=Date.now();
		if (typeof theOscillator.startTime != "undefined" && theTunator.detectionStart-theOscillator.startTime<100) {
			theTunator.detectionStart=theOscillator.startTime;
		}

		setTimeout(function() {
			if (theTunator.detectionTimer!=null) clearInterval(theTunator.detectionTimer);
			theTunator.detectionTimer=setInterval(
				function() {
					window.requestAnimationFrame( theAnalyser.analyse );
				},theTunator.detectionRate
			);
			theTunator.isDetecting = true;
		},20);

		if (theTunator.microphoneTrack!=null && typeof theTunator.microphoneTrack.getSettings().volume != "undefined") {
			setTimeout(function() {
				if (theTunator.microphoneTrack==null) return;
				var settings = theTunator.microphoneTrack.getSettings();
				var microGain = settings.volume.toFixed(2)*100;
				$("#microGain").text(microGain);
			},100);
		}
	}

	stopDetection() {
		// stop pitch detection and audio source (song, oscillator)

		var that=theTunator;
		if (!that.isDetecting) return;
		if (that.detectionTimer!=null) {
			// stop detection loop
			clearInterval(that.detectionTimer);
			that.detectionTimer=null;
			// window.requestAnimationFrame( theAnalyser.analyse );  // final repaint?
		}
		that.isDetecting = false;
	}

	stopAudio() {
		// stop the current audio source
		if (this.speakerSource=="") return;

		if (this.detectionSource==this.speakerSource) this.selectDetectionSource("");

		if (this.audioNode!=null) {
			if (this.audioNode==theOscillator) {
				theOscillator.terminate();
			}
			else {
				this.audioNode.stop();
				this.audioNode.disconnect(audioContext.destination);
			}
		}
		this.audioNode = null;
		this.speakerSource="";
	}

	selectDetectionSource(source) {
		// stop the detection process (toggle) and select a different source

		this.stopDetection();
		if (source!="" && source==this.detectionSource) source=""; // toggle behavior

		// remove button highlight
		if (this.detectionSource!="") $("#"+this.detectionSource+"Input").css("background-color","");
		this.microphoneTrack = null;

		if (source==this.detectionSource) {
			// toggle
			this.detectionSource="";
			return;
		}
		else {

			// select new source, highlight button
			this.detectionSource=source;
			$("#"+this.detectionSource+"Input").css("background-color","lightgreen");

			// if (this.speakerSource!="sample" && this.speakerSource!="") theTimeline.reset();
			theDetector.reset();

			if (source=="micro") {
				// get microphone stream, processing happens in gotStream()

				this.getUserMedia(
					{
						"audio": {
							"mandatory": {
								"googEchoCancellation": "false",
								"googAutoGainControl": "false",
								"googNoiseSuppression": "false",
								"googHighpassFilter": "false"
							},
							"optional": []
						},
					}, theTunator.gotStream
				);
			}

			else if (source=="audio") {
				// use the current audio source (oscillator, song)

				if (this.speakerSource=="song") {
					// get audio stream from a file (mp3, ogg, wav)
					theAnalyser.create(this.audioNode, this.frameSize);
					this.detect(true);
				}
				else if (this.speakerSource=="oscillator") {
					theAnalyser.create(theOscillator.gainMix,this.frameSize);  // connect the first tone of the chord
					this.detect(true);
				}
				else if (this.speakerSource=="sample" || this.speakerSource=="sampleLoop") {
					// use captured sample as input
					theAnalyser.create(this.audioNode, this.frameSize);
					this.detect(false);
				}
			}
		}
	}

	selectAudio(source) {
		// select a source for current audio output
		// if the the selected source is identical with the current source, just stop (toggle behavior)
		// else start the new output source


		if ((source=="sample" || source=="sampleLoop") &&
			(theAnalyser.sampleLoop==null || theAnalyser.sampleLoop.length==0)) {
			alert("There is no sample stored currently. Play a tone it make sure it gets detected. "+
				"Then use the button '1' or 'N' to store a single wave or a group of waves as a sample. "+
				"Afterwards the 'loop' button will have a yellow color indicating that it has a sample to play.");
			return;
		}

		// remove button highlight
		if (this.speakerSource!="") {
			$("#"+this.speakerSource+"Source").css("background-color","");
			if (this.speakerSource=="sample" || this.speakerSource=="sampleLoop") {
				if(theAnalyser.sampleLoop!=null && theAnalyser.sampleLoop.length>0) {
					$("#"+this.speakerSource+"Source").css("background-color","lightyellow");
				}
			}
		}
		if (source==this.speakerSource) {
			// stop current source (toggle)
			this.stopAudio();
			if (this.detectionSource=="audio") this.selectDetectionSource("");
			return;
		}
		else {
			// switch to different source

			this.stopAudio();

			// select new source, highlight button
			this.speakerSource=source;
			$("#"+this.speakerSource+"Source").css("background-color","lightgreen");

			if (source=="oscillator") {
				// start the oscillator
				this.audioNode=theOscillator;
				if (this.detectionSource!="micro") {
					this.selectDetectionSource("");
					this.selectDetectionSource("audio");
				}
				theOscillator.start();
			}
			else if (source=="song") {
				// get audio stream from a file (mp3, ogg, wav)
				var song = $("#song option:selected").text();
				this.loadAudio("songs/"+song);
			}
			else if (source=="sample" || source=="sampleLoop") {
				// use a captured sample loop
				if (theAnalyser.sampleLoop!=null && theAnalyser.sampleLoop.length>0) {
					this.createNode("sample",theAnalyser.sampleLoop.length,source=="sampleLoop");
					if (this.detectionSource!="micro") {
						this.selectDetectionSource("");
						this.selectDetectionSource("audio");
					}
				}
			}
		}
	}

	createNode(type,size,loop) {
		// create a MediaAPI audio node, connect and start

		this.audioNode = audioContext.createBufferSource();
		this.audioNode.loop=loop;
		this.audioNode.buffer = audioContext.createBuffer(1, size, audioContext.sampleRate);
		this.audioNodeBuffer = this.audioNode.buffer.getChannelData(0);
		if (type=="sample") {
			theAnalyser.fillFromSampleLoop(this.audioNodeBuffer);
		}
		this.audioNode.connect(audioContext.destination); // connect audio file also to speaker
		this.audioNode.start(0);

	}

	songChanged() {
		// stop and load a new song if we are currently playing a song
		if(this.source=="song") {
			this.source="";
			this.selectDetectionSource("song");
		}
	}

	loadNoteNames() {
		// create a buffer with the spoken note names
		var request = new XMLHttpRequest();
		request.open("GET", "mp3/noteNames.mp3", true);
		request.responseType = "arraybuffer";
		request.onload = function() {
			audioContext.decodeAudioData( request.response,	function(buffer) {
				theTunator.noteNames = [ buffer.getChannelData(0),buffer.getChannelData(1) ];
			});
		}
		request.send();
	}

	speakNoteName(note) {
		// announce a note by speaking its name
		var n = note+9;
		n = n%12;
		if (n<0)n+=12;

		var len=0.7 * audioContext.sampleRate; //	(700 msec)
		var node =audioContext.createBufferSource();
		node.connect(audioContext.destination);
		node.buffer=audioContext.createBuffer(2, len, audioContext.sampleRate);
		var begin=len * n;
		var buffer=new Float32Array(len);
		for(var s=0;s<len;s++) buffer[s]=theTunator.noteNames[0][begin+s];
		node.buffer.copyToChannel(buffer,0);
		for(var s=0;s<len;s++) buffer[s]=theTunator.noteNames[1][begin+s];
		node.buffer.copyToChannel(buffer,1);

		// reduce volume of oscillator while speaking
		theOscillator.setGainPercent(50);
		node.start(0);
		setTimeout(function() { theOscillator.setGainPercent(100); }, 700 );
	}

	loadAudio(url) {
		// load an audio file (mp3)
		var request = new XMLHttpRequest();
		request.open("GET", url, true);
		request.responseType = "arraybuffer";
		var that=this;
		request.onload = function() {
			that.audioNode = audioContext.createBufferSource();
			audioContext.decodeAudioData( request.response,
				function(buffer) {
					var that=theTunator;
					that.audioNode.buffer = buffer;
					that.audioNode.connect(audioContext.destination);
					if (that.detectionSource!="micro") {
						that.selectDetectionSource("");
						that.selectDetectionSource("audio");
					}
					that.audioNode.start(0);
				}
			);
		}
		request.send();
	}

	gotStream(stream) {
		// A callbacj function which creates an AudioNode from the stream.
		mediaStreamSource = audioContext.createMediaStreamSource(stream);

		theTunator.microphoneTrack = stream.getAudioTracks()[0];
		theTunator.microphoneTrack.applyConstraints({autoGainControl:false});

		// Connect it to the destination.
		theAnalyser.create(mediaStreamSource,theTunator.frameSize);

		theTunator.detect(true);
	}

	error() {
		alert('Stream generation failed.');
	}

	getUserMedia(dictionary, callback) {
		// acquire the user media from the browser
		try {
			navigator.getUserMedia =
				MediaDevices.getUserMedia ||
				navigator.getUserMedia ||
				navigator.webkitGetUserMedia ||
				navigator.mozGetUserMedia;
			navigator.getUserMedia(dictionary, callback, theTunator.error);
		} catch (e) {
			alert('getUserMedia threw exception :' + e);
		}
	}

	changeOscDetune(delta) {
		// change the oscillators frequency (detune amount in cents as compared to a  = 0 ~ 440 Hz)
		var detune= theOscillator.detune+delta;
		theOscillator.setDetune(detune,Math.round(detune/100)*100);
	}

	setOscHarmonic(harm,value) {
		// set a single harmonic (real part) of the main oscillator
		theOscillator.setHarmonic(harm,parseInt(value));
	}

	setOscPhase(harm,value) {
		// set a single harmonic (imaginary part) of the main oscillator
		theOscillator.setPhase(harm,parseInt(value));
	}

	changeChord() {
		// update the chord setting of the main oscillator
		theOscillator.setChord($("#chord option:selected").val());
	}

	fft() {
		// extract FFT parameters from current audio sample and use them to configure the harmonics of the oscillator
		// so that it produces a waveform similar to the sample loop data

		var bins = theAnalyser.fft();
		if (bins==null) {
			alert(
				"No current signal detected. "+
				"You need to sing or play a tone and press this button while the sound is detected. "+
				"A sample of the current signal will be analysed (fast Fourier transform) and the derived settings "+
				"will be used to shape the signal generator so that it sounds similarly."
			);
			return;
		}
		var real = [], imag=[];
		for(var b=1;b<bins[0].length/2;b++) {
			if (Math.abs(bins[0][b])<0.1) continue;
			real.push({bin:b,val:bins[0][b]});
			if (Math.abs(bins[1][b])<0.1) continue;
			imag.push({bin:b,val:bins[1][b]});
		}
		var base=real[0].bin;
		// first element is DC offset (always 0)
		var len = (real.length>=imag.length) ? real.length : imag.length;
		var oscReal= new Array(len+1), oscImag=new Array(len+1);
		oscReal.fill(0,0,len+1);
		oscImag.fill(0,0,len+1);
		for(var h=0;h<len;h++) {
			if (h<real.length) oscReal[h+1]= real[h].val;
			if (h<imag.length) oscImag[h+1]= imag[h].val;
		}
		theOscillator.setHarmonic(-1,oscReal);
		theOscillator.setPhase(-1,oscImag);

		// console.log(real);
	}

	changeTransposition() {
		// set the transposition which will be used by Osciallator and Timeline when displaying note names
		theDetector.setTransposition(parseInt($("#transposition option:selected").val()));
		theTimeline.setYScale();
	}

	toggleScore(val) {
		var file="Interval1";

		var that=theTunator;
		if (val==0) that.scoreVisible = !that.scoreVisible;
		else that.scoreVisible = (val>0);
		$("#pdfScore").prop("src","./score/"+file+".pdf");
		$("#midiAudio").prop("src","./score/"+file+".mid");
		if (that.scoreVisible)	{
			$("#scoreBox").show();
			$("#score").css("background-color","lightgreen");
		}
		else {
			$("#scoreBox").hide();
			$("#score").css("background-color","");
		}
	}

	setLanguage(lang) {
		// set the user language; refresh HTML tags and lesson titles and current lesson text
		theLang.load(lang);
		theLessons.loadList();
		theLessons.set();
	}

	introConfirmed() {
		// a callback which is called after the user confirmed the initial dialog
		// only after this happened we can activate (resume) the audio context.
		audioContext.resume();
		$('#intro').hide();
		theLessons.adaptHeight();
	}

}

// ======================================================================================================== MAIN

// the MAIN ENTRY POINT for Tunator

// define one object instance for each class

var theCmdLine;
var theLangDef;
var theLang;
var theLang;
var theTunator;
var theAnalyser;
var theDetector;
var theWave;
var theTimeline;
var theOscillator;
var theLessons;

window.AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext = null;
var mediaStreamSource = null;

window.onload = function() {

	// create the objects, check command line arguments

	theLang				= new Lang();
	theCmdLine			= new CmdLine(location.search);

	audioContext = new AudioContext();

	theAnalyser			= new Analyser();

	var referenceFreq	= 443;						// used for the detector and the oscillator
	theDetector			= new Detector(referenceFreq);
	theTimeline			= new Timeline();
	theWave				= new Wave(1024,160);		// width and height of window for audio wave signal

	var oscFreq			= referenceFreq*0.5;		// initial frequency in Hz
	theOscillator		= new Oscillator("straight",referenceFreq,oscFreq, 'custom', 0, [0], [0] );

	theTunator			= new Tunator();
	theLessons			= new Lessons();

	// setup the desired language
	var lang			= (navigator.language || navigator.userLanguage).replace(/-.*/,"");
	var lang			= theCmdLine.getString("lang","L",lang);
	theTunator.setLanguage(lang);

	// bring up initial (or requested) lesson
	var initialLesson = theCmdLine.getString("lesson","l","");
	if (initialLesson == "")	theLessons.set("TUNATOR");
	else						theLessons.set(initialLesson,initialLesson);

	// adpat dimensions of the elements to the browser window size
	$(window).resize(function() {
		theLessons.adaptHeight();
		theTimeline.setWidth(-1);
		theTimeline.drawGrid();
		theTimeline.drawKeyboard();
	});

	// load the intro button which demands a first user interaction
	// due to security policies ONLY AFTERWARDS the audioContext CAN (and will) be activated via resume()
	$("#intro").height($(window).innerHeight()).focus();

}
