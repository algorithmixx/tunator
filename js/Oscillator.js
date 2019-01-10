"use strict";

// ======================================================================================================== Oscillator

class Oscillator {
/*
	Oscillator has a main tone generator which can produce chords with various wave shapes
	and a second (auxiliary) generator.
	The main generator can play melodies, let the tone drift away, produce vibrato,
	produce pairs of tones for pitch comparison etc.

				 /----> main osc [0] ---\
				/-----> main osc [1] ----\
	sweeper -->					  ...        -----+--> gainSum --\         /--> wave (scope)
				\----->	main osc [n] ----/                        \       /
															       +-----+----> gainMix -----> speakers
						second osc [1] --------------->-----------/

	The UI has a primary yellow area for the most important controls
	and an optional second yellow area for the sliders which control the harmonics of the main osc wave shape
*/

	constructor (mode,reference,freq,type,span,melody,rhythm) {

		this.custom = {
			harmonics	: [  0, 100, 50, 20, 10, 0, 0, 0, 0 ], // FFT real      part for default sound
			phases		: [  0,   0,  0,  0,  0, 0, 0, 0, 0 ], // FFT imaginary part for default sound
		}

		this.range			= { low:0, high:0 };		// lowest and highest tone of current chord

		// define initial settings for an oscillator audio node
		this.harmonics		= this.custom.harmonics.splice(0);
		this.phases			= this.custom.phases.splice(0);
		this.reference		= reference;			// in Hz
		this.setReference(reference);
		this.tones			= [0];					// offset in cents for each tone of a chord
		this.setFreq(freq);							// initial frequency in Hertz

		this.gainMix		= audioContext.createGain();	// mixer for main generator and auxiliary
		this.gainMix.connect(audioContext.destination);

		this.gainSum		= audioContext.createGain();	// a node to sum the partial chord tones of the main oscillator
		this.gainSum.connect(this.gainMix);

		this.aux			= null;					// auxiliary generator for comparisons
		this.auxDetune		= 0;					// the base detune of the auxiliary generator

		$("#oscType").val(type);
		this.setType(type);
		this.span			= span;					// basic time unit for the sweeper
		this.melody			= melody;
		this.rhythm			= rhythm;
		this.drift			= 0;					// in cents
		this.sweeper		= null;
		this.comparator		= [];
		this.pitchComparisons = [];
		this.paused			= false;

		// this.rand		= RandomMulberry32(315);			// set up a repeatable random generator with a certain seed

		this.setMode(mode);
	}

	showControl() {
		// show the yellow control area in the menu for the oscillator
		$('#generator').show();
		$("#toggleGenerator").css("background-color","lightgreen");
	}

	hideControl() {
		// hide the yellow control area in the menu for the oscillator
		$('#generator').hide();
		$("#toggleGenerator").css("background-color","");
	}

	toggleControl() {
		// show/hide the yellow control area in the menu for the oscillator
		if ($("#generator").is(":visible")) this.hideControl();
		else								this.showControl();
	}

	toggleHarmonics() {
		// show/hide the yelow slider area which controls the intensity and phase of harmonics
		$('#harmonics').toggle();
		$("#toggleHarmonics").css("background-color",$("#harmonics").is(":visible") ? "lightgreen":"");
		theLessons.adaptHeight();

	}

	toggleMain() {
		// switch the sound of the main oscillator on/off
		if (this.osc)	this.terminate();
		else			this.start();
	}

	toggleAux() {
		// switch the sound of the auxiliary oscillator on/off
		// the signals from main and aux oscialltor are added in a gain mixer node

		if (this.aux!=null) {
			this.aux.disconnect(this.gainMix);
			this.gainMix.gain.value=1;
			this.aux.stop();
			this.aux=null;
			$("#aux").css("background-color","");
		}
		else {
			this.aux=audioContext.createOscillator();
			this.aux.connect(this.gainMix);
			this.gainMix.gain.value=0.5;
			this.aux.frequency.value=this.reference;	// use same reference as main

			// if never used before: use a frequency similar to the main oscillator
			if (this.auxDetune==0) {
				if (this.osc) {
					// if main osc is active: take its detune
					this.auxDetune = this.aux.detune.value = this.osc[0].detune.value;
				}
				else {
					// use a fixed default (lower octave 'a')
					this.auxDetune = this.aux.detune.value = -1200;
				}
				this.changeAuxDetune(43);	// slightly off (+43 cents higher)
			}
			else {
				// start with previous frequency
				this.changeAuxDetune(0);
			}

			// use same wave form as main oscillator
			if (this.type=="custom") this.aux.setPeriodicWave(audioContext.createPeriodicWave(this.harmonics, this.phases));
			else this.aux.type=this.type;

			// now start sound generation
			this.aux.start();
			$("#aux").css("background-color","lightgreen");
		}
	}

	start() {
		// create a new main oscillator based on the current settings
		// effectively we need an oscillator node for each tone of a chord
		// note that multiple start/stop calls are not permitted for OscillatorNode objects

		this.terminate();	// stop in case the oscillator is running

		// one Media API oscillator node for each tone of a chord
		this.osc=[];
		for (var t=0;t<this.tones.length;t++) {
			this.osc.push(audioContext.createOscillator());
		}

		// set frequency and wave form
		this.setReference(this.reference);		// reference freq for "A" (~ 440 .. 444 Hz)
		this.setDetune(this.detune);			// initial pitch in cents relative to "A"
		this.setType(this.type);

		// add the chord tones in the gainSum node
		this.gainSum.gain.value= 1.0 / this.tones.length;
		for (var t=0;t<this.tones.length;t++) this.osc[t].connect(this.gainSum);

		// start the oscillator for each tone, note starting time
		this.startTime=Date.now();
		for (var t=0;t<this.tones.length;t++) this.osc[t].start(0);

		this.time=0;							// define time relative to the starting time
		this.sweep(this.span,this.drift);		// start sweeping (vibrato, drift, melody)
	}

	terminate() {
		// destroy the main oscillator nodes
		if (this.osc) {

			// clear sweeping interval timeout
			if (this.sweeper) {
				clearTimeout(this.sweeper);
				this.sweeper=null;
			}

			// clear comparator interval timeout
			for (var comp of this.comparator) clearTimeout(comp);
			this.comparator=[];
			$("#comparison").html("&nbsp;");

			// in case the oscillator was paused: resume
			this.resume();

			// stop the oscillator nodes
			for (var t=0;t<this.tones.length;t++) {
				this.osc[t].stop();
			}

			// mark oscillator as terminated
			this.osc=null;
			this.setDetune(this.detune); // marks oscillator as inactive in the control area
		}
	}

	pause() {
		// temporarily disable the main oscillator by setting its detune value to a very low value
		// this is better than turning the volume down because it dies not cause abrupt transitions
		if (this.osc && !this.paused) {
			this.lastDetune= this.detune;	// store current detune for later resume
			this.setDetune(-1000000); // set to very low frequency
			this.paused=true;
		}
	}

	resume() {
		// continue the main oscillation after a pause()
		if (this.osc && this.paused) {
			this.setDetune(this.lastDetune);
			this.paused=false;
		}
	}

	sweep(span,drift) {
		// start a frequency sweep process for the main oscillator; this can be
		// * a continuous sweep (vibrato, drift)
		// * a group of tones to be compared
		// * a sequence of discrete semitone steps (melody)

		var that=this;

		// clear current sweep (if it exists)
		if (that.sweeper!=null) clearTimeout(that.sweeper);

		// if pitch comparison was active: set the detune value back to the reference value for comparisons
		for (var comp of this.comparator) clearTimeout(comp);
		this.comparator=[];
		if (that.pitchComparisons.length>0) {
			that.setDetune(that.pitchComparisons[0].base);
			that.pitchComparisons=[];
		}

		if (that.mode.substr(0,7)=="compare") {							// create a group of tone pairs for comparison

			// insert some space into the timeline
			for(var t=0;t<50;t++) theTimeline.add(1000);

			// create a series of comparisons (pitch pairs)
			that.pitchComparisons= [];
			var minDev,maxDev,changeHarmonics,changeBase,changeOctave;
			if (that.mode=="compare (easy)") 		{
				minDev=25;		maxDev=40;		changeOctave=0;		changeBase=false;	changeHarmonics=false;
			}
			if (that.mode=="compare (medium)") 		{
				minDev=15;		maxDev=25;		changeOctave=0;		changeBase=true;	changeHarmonics=true;
			}
			if (that.mode=="compare (difficult)")	{
				minDev=4; 		maxDev=15;		changeOctave=0;		changeBase=true;	changeHarmonics=true;
			}
			if (that.mode=="compare (difficult -8)")	{
				minDev=4; 		maxDev=15;		changeOctave=-1;	changeBase=true;	changeHarmonics=true;
			}
			if (that.mode=="compare (difficult +8)")	{
				minDev=4; 		maxDev=15;		changeOctave=+1;	changeBase=true;	changeHarmonics=true;
			}
			if (that.mode=="compare (hard)")	{
				minDev=1; 		maxDev= 4;		changeOctave=0;		changeBase=true;	changeHarmonics=true;
			}
			if (that.mode=="compare (hard -8)")	{
				minDev=1; 		maxDev= 4;		changeOctave=-1;	changeBase=true;	changeHarmonics=true;
			}
			if (that.mode=="compare (hard +8)")	{
				minDev=1; 		maxDev= 4;		changeOctave=+1;	changeBase=true;	changeHarmonics=true;
			}
			var base = this.detune;
			for (var c=0;c<10;c++) {
				var dev= Math.ceil(minDev+ Math.random()*(maxDev-minDev+1));
				if (Math.random()>0.5) dev = -dev;
				that.pitchComparisons.push({
					base:base,
					dev:dev+1200*changeOctave,
					changeHarmonics:changeHarmonics,
				});
				if (changeBase) base+=(Math.round(10*(0.5-Math.random()))*100);
			}

			// start with the comparisons (cycle forever)
			that.comparisonInx= -1;
			var duration=1400;			// 1000 msec tone1, 400 msec space, 1400 msec tone2, 1400 msec pause
			var spacing=400;
			that.compare(duration,spacing);
		}
		else {
			// other sweeping modes
			that.span	= span;
			that.drift	= drift;
			that.time	= 0;
			if (span==0) return;
			if (that.osc && that.span>0) that.sweepStep();
		}
	}

	randomInt(min,max) {
		// return a random number between min and (max-1)
		return Math.round(min+Math.random()*(max-min));
	}

	compare(duration,spacing) {
		// produces an endless loop of comparisons
		// progress to the next comparison in the list (wrap around)
		// 1. produce the first tone (duration-spacing)
		// 2. very short pause (spacing)
		// 3. produce the second tone (duration)
		// 4. make a pause (duration)
		// 5. trigger the next comparison

		var that=this;
		that.comparisonInx = (that.comparisonInx+1) % that.pitchComparisons.length;

		// produce base tone, then stop
		that.setDetune(that.pitchComparisons[that.comparisonInx].base);
		if (that.mode.match(/difficult|hard/)) that.setType("triangle");
		$("#comparison").html("&nbsp;");

		that.comparator=[];
		// produce first tone for some time
		that.comparator.push(setTimeout(
			function () {
				that.pause();
			}
			,duration-spacing
		));

		// after a short moment switch to the next tone
		that.comparator.push(setTimeout(
			function () {
				that.resume();
				that.setType("custom");
				if (that.pitchComparisons[that.comparisonInx].changeHarmonics) {
					that.randomHarmonics();
					that.randomPhases();
				}
				var dev=that.pitchComparisons[that.comparisonInx].dev;
				that.changeDetune(dev);
				if (dev>0)	dev -= Math.round(dev/1200.)*1200; // ignore octave
				else 		dev -= Math.round(dev/1200.)*1200; // ignore octave
				$("#comparison").text(dev>0?"+":dev<0?"-":"=");
			}
			,duration
		));

		// play that tone for some time, then reset tone and pause
		that.comparator.push(setTimeout(
			function () {
				that.setDetune(that.pitchComparisons[that.comparisonInx].base);
				that.pause();
			}
			,2*duration
		));

		// start next cycle
		that.comparator.push(setTimeout(
			function () {
				that.resume();
				that.compare(duration,spacing);
			}
			,3*duration
		));
	}

	sweepStep() {
		// define a frequency change to be executed after some wait time
		// rhythm can be 1,2,4,8,16 for note time values or 0.1..0.99 for percentage or 0 for legato

		var that	= theOscillator;

		var duration= that.span;
		var units=0;

		if (that.drift>0) {
			// continuous variation
			var delta;
			for(;;) {
				delta = Math.random();
				if (Math.random()>0.2) break;
			}
			if (Math.random()>0.5)	that.changeDetune(that.drift*delta);
			else 					that.changeDetune(-that.drift*delta);
		}
		else {
			// discrete variation: play the next tone of the melody sequence


			that.resume();
			that.changeDetune(that.melody[that.time]*100);

			// calculate note duration
			units = that.rhythm[that.time % that.rhythm.length];
			if 		(units == 1) duration *= 4;
			if 		(units == 2) duration *= 2;
			if 		(units == 3) duration *= 3;
			if	 	(units == 4) duration *= 1;
			if	 	(units == 6) duration *= 1.5;
			if 		(units == 8) duration *= 0.5;
			if 		(units ==16) duration *= 0.25;

			// time progression (melody)
			that.time = ( that.time + 1 ) % that.melody.length;

		}
		// trigger the next pause to shorten the note
		if (units!=0) setTimeout( function() { that.pause(); } , units < 1 ? duration * units : duration*0.85 );

		// trigger the next sweep step after the given duration
		that.sweeper=setTimeout( function() { that.sweepStep(); }, duration );
	}

	setReference(reference) {
		// set the reference frequency for note 'a' ( ~ 440 Hz)
		this.reference=reference;
		if (this.osc) {
			for (var t=0;t<this.tones.length;t++) {
				this.osc[t].frequency.value=this.reference;
			}
		}
	}

	setGainPercent(gain) {
		// set gain of the main osc output to a percentage of the max. possible gain without distortion
		if (this.osc) {
			this.gainSum.gain.value= gain / 100. / this.tones.length;
		}
	}

	setChord(chord) {
		// take a comma separated representation of an array holding (arab or roman) numbers like e.g. "0,3,7" or "0.1"
		// the numbers define RELATIVE detune values (in semi-notes) : [ val0, val1, val2, ..]
		// which build a chord. Often the first values will be 0 (i.e. it will produce the base note);
		//
		// a number like 7 or -7 defines a CHROMATIC interval of +7 or -7 steps (quint)
		// a number like 107 or -107 defines a PURE (integer ratio) interval of a quint
		// a number like 0.1 defines 10 cents of deviation
		// a number between 0.0001 and 0.0099 has a special effect: it produces no tone if the base detune value
		// of a chord is close enough to the correct pitch of the note scale; if the pitch is greater or smallertone
		// by more than number*100 cents it will produce a semitone above or below the base note
		// example: 0.0030 will remain quiet as long as the base note differs by less than 30 cents
		// from the correct scale pitch; if the difference is greater it will produce a neighboring semitone

		var tones = chord.split(",");
		var mustStart=false;
		if (tones.length!=this.tones.length) {
			if (this.osc) {
				this.terminate();
				mustStart=true;
			}
		}
		this.tones=[];
		this.delta=0;
		for(var tone of chord.split(",")) {
			if (tone.charAt(1)==".") {
				this.tones.push(parseFloat(tone)*100);
			}
			else {
				tone=parseInt(tone);
				if (Math.abs(tone)>100) tone = theOscillator.getRatio(tone);
				this.tones.push(tone*100);  // cents
			}
		}
		if (mustStart) this.start();	// create new number of oscillators
		else this.setDetune(this.detune);	// adapt pitches of existing chord tones
	}

	getChord() {
		// return an array of detune values in cents for the current chord of the main oscillator
		if (!this.osc) return [];
		var chord=[];
		for(var t=0;t<this.tones.length;t++) {
			chord.push(this.osc[t].detune.value);
		}
		return chord;
	}

	getRatio(val) {
		// translate a number like 104 into a pure interval ratio (4 semitones ==> 1.25 = 5 / 4)
		// a negative number translates down
		// returns a detune value in cents which corresponds to the result
		var ratio=1;
		switch(Math.abs(val)) {
			case +102: ratio=  9./ 8.; break;
			case +103: ratio=  6./ 5.; break;
			case +104: ratio=  5./ 4.; break;
			case +105: ratio=  4./ 3.; break;
			case +107: ratio=  3./ 2.; break;
			case +108: ratio=  8./ 5.; break;
			case +109: ratio=  5./ 3.; break;
			case +110: ratio=  7./ 4.; break;
			case +111: ratio= 15./ 8.; break;
		}
		if (val<0) ratio = 1. / ratio;
		return Math.log(ratio) / Math.log(2) * 12;
	}

	setDetune(detune,realDetune) {
		// set the main oscillator´s detune values
		// "realDetune" allows to define a threshold which mutes the tone if its deviation is below that value
		this.detune= detune;
		if (this.osc) {
			var tone;
			for(var t=0;t<this.tones.length;t++) {
				tone=this.tones[t];
				if (typeof realDetune!="undefined" && tone!=0 && Math.abs(tone)<1) {
					if (Math.abs(realDetune-detune) >  100 * tone) {
						// set detune to a VERY low value if the difference is too large
						// effectively muting the sound to 0 (without stopping the oscillator)
						tone= -90000;
					}
					else tone= 0;
				}
				if (this.detune<-153000)this.osc[t].detune.value=-153000;
				else					this.osc[t].detune.value=this.detune+tone;
			}
		}
		if (detune==-1000000)	{
			// a special value to indicate the oscialltor is "off" without really terminating it
			$("#oscFreq").val("--");
			$("#oscNote").html("--");
		}
		else {
			var freq = this.getFreq();
			$("#oscFreq").val(freq.toFixed(2));		// show main oscillator frequency

			// show note names and calculate lowest/highest tone of chord
			if (freq>3) {
				// normal frequencies above 3 Hz are considered to be tones/notes
				var chord="";
				if (this.osc) {
					// if osc is active show note names of the current chord
					for(var t=0;t<this.tones.length;t++) {
						if (chord!="") chord += " - ";
						var tone=this.osc[t].detune.value/100;
						chord += theDetector.naturalNoteName(tone);
						if (t==0 || tone<this.range.low ) this.range.low  = tone;
						if (t==0 || tone>this.range.high) this.range.high = tone;
					}
				}
				else {
					// if osc is terminated show notes of chord in parethesis
					var tone = this.detune/100;
					chord = "<i>("+theDetector.naturalNoteName(tone)+")</i>";
					this.range.low  = tone;
					this.range.high = tone;
				}
				// if the note is very close to the exact value of a note: just show its name
				// else put ~ symbols ~ around the chord
				var clean=Math.abs(detune)%100;
				if (clean<=5 || clean >= 95)	$("#oscNote").html(chord);
				else							$("#oscNote").html("~ " +chord+" ~");
			}
			else {
				// very low frequencies (below 3 Hz) are considered to be BPM for rhythm
				// because we use a symmetric square signal we get two impulses per second
				var bpm = Math.round(freq*120.);
				$("#oscNote").html(bpm + " BPM");
			}

		}
	}

	changeDetune(cents) {
		// set detune value (cents) for the main oscillator
		this.setDetune(this.detune+cents);
	}

	setAuxDetune(val) {
		// set detune value (cents) for the second oscillator
		if (this.aux) {
			this.aux.detune.value=this.auxDetune+parseInt(val);
			// show delta in semitones
			$("#aux").attr("title",Math.round(this.reference*Math.pow(2,this.aux.detune.value/1200)))+" Hz";
		}
	}

	changeAuxDetune(delta) {
		// change the detune of the second generator by some cents
		this.auxDetune= this.aux.detune.value + delta;
		this.setAuxDetune(0);
		$('#auxDetune').val(0);

	}

	updateAuxInterval() {
		// calculate and show in the UI the current distance between the two oscillators
		if (this.aux) {
			if (this.osc==null) {
				var note = this.aux.detune.value;
				var dev = (note+4800)%100;
				if (dev>=50) dev=-1*(100-dev);
				else dev="+"+dev;
				$("#auxInterval").html("<b><big>"+theDetector.noteName(note/100.,true)+"</big></b> &nbsp; ("+dev+" ct.)");
			}
			else {
				var pureIntervals = [-1200,-884,-814,-702,-498,-386,-316,0,316,386,498,702,814,884,1200];
				var pureNames  = ["-VIII","-VI","-vi","-v","-iv","-III","-iii","","iii","III","IV","V","vi","VI","VIII"];
				var interval=this.aux.detune.value-this.osc[0].detune.value;
				var text=interval+" cts.";
				for (var p=0;p<pureIntervals.length;p++) {
					if (Math.abs(pureIntervals[p]-interval) <= 50) {
						var delta = Math.round(interval - pureIntervals[p]);
						text = pureNames[p] + " "+(delta>=0 ? "+" : "")+delta+" cts.";
					}
				}
				$("#auxInterval").html(text);
			}
			setTimeout(function() { $("#auxInterval").html(""); }, 1200);
		}
	}

	getFreq() {
		// get the frequenciy in Hz for the current detune value of the main oscillator
		return this.reference*Math.pow(2,this.detune/1200);
	}

	setFreq(freq) {
		// set frequency in Hertz for the main oscillator
		var ratio=freq/this.reference;
		this.setDetune(Math.log(ratio)/Math.log(2)*1200);
	}

	setTempo(bpm,group) {
		// use the main oscillator as a very simple metronome, setting its BPM (beats per minute)
		this.setType("square");
		this.setMode("straight");
		this.setFreq(bpm/120.);
		var grid=Math.round(1920./bpm);
		theTimeline.reset(true,grid,grid*group);
		$("#oscNote").html(bpm + " BPM");
	}

	changeFreqRatio(ratio) {
		// change the main oscillators frequncy by a given ratio factor
		this.setFreq(this.getFreq()*ratio);
	}

	setType(type) {
		// set the wave type of the main oscilator (sine, triagle, swatooth, rectangle, custom harmonics)
		this.type=type;
		if (this.osc) {
			for (var t=0;t<this.tones.length;t++) {
				if (type=="custom") this.osc[t].setPeriodicWave(audioContext.createPeriodicWave(this.harmonics, this.phases));
				else 				this.osc[t].type=this.type;
			}
		}
		if (type=="custom") {
			for(var h=1;h<this.harmonics.length&&h<=8;h++) {
				$("#h"+h).val(this.harmonics[h]);
				$("#p"+h).val(this.phases[h]);
			}
		}
		$("#oscType").val(type);
	}

	setHarmonic(harm,val) {
		// set a single harmonic value of the main oscillator (real part)
		if (harm<0)	this.harmonics=val.slice(0);
		else 		this.harmonics[harm]=val;
		this.setType("custom");
	}

	setPhase(harm,val) {
		// set a single harmonic value of the main oscillator (imaginary part)
		if (harm<0) this.phases=val.slice(0);
		else		this.phases[harm]=val;
		this.setType("custom");
	}

	randomHarmonics() {
		// set all harmonics to random values (real part)
		for (var h=1;h<this.harmonics.length;h++) {
			this.harmonics[h]=300 / h * Math.random();
		}
		this.setType("custom");
	}

	randomPhases() {
		// set all harmonics to random values (iamginary part)
		for (var p=1;p<this.phases.length;p++) {
			this.phases[p]=300 / p * Math.random();
		}
		this.setType("custom");
	}

	setMode(mode) {
		// set the operating mode
		// straight tone, drift, vibrato, pitch comparisons, fixed and random melodies

		this.mode=mode;
		$("#oscMode").val(mode);

		for (var comp of this.comparator) clearTimeout(comp);
		this.comparator=[];

		if 		(mode=="straight") {
			this.melody = [0];
			this.rhythm = [0];
			this.sweep(0,0);
		}
		else if	(mode.substr(0,7)=="compare") {
			this.melody = [0];
			this.rhythm = [0];
			if (this.osc) this.sweep(0,0); // sweeper will behave differently in pitch comparison mode
		}
		else if (mode=="drifting") {
			this.melody = [0];
			this.rhythm = [0];
			this.sweep(2000,20);  // change freq by -20..-5 or +5..+20 cent every 2 seconds
		}
		else if (mode=="wandering") {
			this.melody = [0];
			this.rhythm = [0];
			this.sweep(200,20);  // change freq by -20..-5 or +5..+20 cent every 200 msec
		}
		else if (mode=="vibrato") {
			this.melody = [0.125,-0.125,-0.125,0.125];
			this.rhythm = [0];
			this.sweep(55,0);
		}
		else if (mode=="24 semitones") {
			this.melody = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1];
			this.rhythm = [0.9];
			this.sweep(250,0);
		}
		else if (mode=="48 semitones") {
			this.melody = [
				 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
				-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1
			];
			this.rhythm = [0.9];
			this.sweep(250,0);
		}
		else if (mode=="major scale") {
			this.melody = [2,2,1,2,2,2,1,2,2,1,2,2,2,1,-1,-2,-2,-2,-1,-2,-2,-1,-2,-2,-2,-1,-2,-2];
			// this.melody = [2,2,1,2,-2,-1,-2,-2];
			this.rhythm = [0.9];
			//this.sweep(500,0);
			this.sweep(150,0);
		}
		else if (mode=="major scale slow") {
			this.melody = [2,2,1,2,2,2,1,2,2,1,2,2,2,1,-1,-2,-2,-2,-1,-2,-2,-1,-2,-2,-2,-1,-2,-2];
			this.rhythm = [0.99];
			this.sweep(2000,0);
		}
		else if (mode=="major scale slow 1 octave") {
			this.melody = [2,2,1,2,2,2,1,-1,-2,-2,-2,-1,-2,-2];
			this.rhythm = [0.99];
			this.sweep(2000,0);
		}
		else if (mode=="tune: Herbstwind") {
			this.melody = [
				 0, 0,-5, 0,	 5, 0, 2,	 2, 1, 2,-3,	-2, 2,	-4, 0,-5, 0,	 5, 0, 2,	 2, 1, 2,-3,	-2,-2];
			this.rhythm = [
				 8, 8, 8, 8,	 8, 8, 4,	 8, 8, 8, 8,	 4, 4,	 8, 8, 8, 8,	 8, 8, 4,	 8, 8, 8, 8,	 4, 4];
			this.sweep(700,0);
		}
		else if (mode=="tune: Amen") {
			this.melody = [
				 5, 7,	 -2,-1,-2,-2,+2,	 +2,+3,		+90,-88,-2,	 5, 2,-2,-1,  	 -2, 3,-1,	 1,-5,-3,-2,-2,	 2,-7];
			this.rhythm = [
				 2, 2,	  4, 8, 4, 8, 4,	  3, 4,		 4, 4,	2,	 4, 8, 4, 8,	 4, 2, 4,	 4, 8, 4, 8, 4,	 2, 2];
			this.sweep(400,0);
		}
		else if (mode=="random: 1 octave, 40%") {
			// relative frequency of intervals
			var cumul = [100,100,100,100,100,0,100,50,100,20,20,100];
			this.randomMelody(cumul,24);
			this.rhythm = [0.4];
			this.sweep(7000,0);
		}
		else if (mode=="random: 1 octave, 90%") {
			// relative frequency of intervals
			var cumul = [100,100,100,100,100,0,100,50,100,20,20,100];
			this.randomMelody(cumul,24);
			this.rhythm = [0.9];
			this.sweep(7000,0);
		}
	}

	randomMelody(cumul,size) {
		// produce a sequence of pitches for a random melody

		// calculate threshold levels
		var sum=cumul[0];
		for (var c=1;c<cumul.length;c++) {
			sum+=cumul[c];
			cumul[c]+=cumul[c-1];
		}
		for (var c=0;c<cumul.length;c++) cumul[c]/=sum;

		// add tone by tone to the melody
		var noteMin=0,noteMax=12;
		var note=0, lastNote=0;
		this.melody=[];
		for (var m=0;m<size-1;m++) {
			for(var r=0;r<20;r++) {
				// pick an interval according to the cumulated frequencies
				var rnum = Math.random();
				var delta=0;
				for(var c=0;c<cumul.length;c++) {
					if (cumul[c]>=rnum) {
						delta=c;
						break;
					}
				}
				if (Math.random()<0.5) {
					// can we jump downwards?
					if (lastNote-delta >= noteMin) {
						this.melody[m] = -delta;
						note-=delta;
						lastNote=note;
						break;
					}
				}
				else {
					// can we jump upwards?
					if (lastNote+delta <= noteMax) {
						this.melody[m] = delta;
						note+=delta;
						lastNote=note;
						break;
					}
				}
			}
		}
		// close the loop
		this.melody[size-1]= -lastNote;
	}
}
