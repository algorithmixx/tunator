"use strict";

// ======================================================================================================== Timeline

class Timeline {
	// The Timeline shows a sequence chart of detected pitches (88 notes from A0 .. C8)
	// The smoothing heuristic tries to eliminate single glitches
	
	constructor() {
		this.box= $("#timelineBox");
		this.tag= $("#timeline");
		this.canvas = document.getElementById( "timeline" ).getContext("2d");

		this.timeGrid=8;		// 8 units per segment ("measure")
		this.timeGroup=32;		// 4 segments per group
		this.lookAhead = 32;	// number of notes reserved for preview of playing instruction
		this.shift = 192;		// number of notes to shift left when the right border (at "lookAhead") is reached
		
		// arrays to store the sequence of events
		this.melSize=1000;
		this.mel=new Array(this.melSize).fill(1000);
		this.melSmooth=new Array(this.melSize).fill(1000);
		this.tones=new Array(this.melSize).fill([]);
		this.lastNoteDrawn=0;
		this.lastNoteAdded=0;
		this.begin=0;

		this.noteColors= ["#95ff00","#3bb307","#0ba28c","#0045fb","#8802e0","#961fac","#e21275","#ff1100","#ff5b00","#ff7f00","#ffae00","#ffff00",];
		this.setColoring($('#coloring option:selected').val());

		this.setWidth(-1);
		this.box.scrollLeft(this.size);
		this.setYScale(parseInt($('#yscale option:selected').text()));
		this.reset(false,8,32);
		this.scrollTo(-9);
	}
	
	show() {
		if (this.box.is(":visible")) return;

		this.box.show();
		$("#timelineControl").show();
		$("#toggleTimeline").css("background-color","lightgreen");
		this.drawNote(1000);
		this.scrollAdjust(this.lastNoteAdded);
		theLessons.adaptHeight();

	}
	
	hide() {
		if (!this.box.is(":visible")) return;

		this.box.hide();
		$("#timelineControl").hide();
		$("#toggleTimeline").css("background-color","");
		theLessons.adaptHeight();

	}
	
	toggle() {
		if (this.box.is(":visible")) this.hide();
		else this.show();
	}
	
	reset(rhythm,gridX,groupX) {
		this.begin=0;
		this.drawGrid(gridX,groupX);
		this.drawKeyboard();
		this.autoStopLimit=16;
		this.autoStop=0;
		if (rhythm) {
			this.mel.fill(-1);
			this.box.scrollTop(0);
			this.rhythmBeginTime=-99999;
		}
	}
	
	setHeight(semiTones) {
		this.box.height(semiTones*this.yScale);
		theLessons.adaptHeight();
	}

	setWidth(width) {
		if (width==-1)	width = Math.floor($(window).width())-48;
		this.canvas.clearRect(0,0,this.tag.width(),this.tag.height());
		var cv=document.getElementById( "timeline" );
		cv.width=width;
		this.stretch=4;
		this.rightMargin=160;  // must be divisible by stretch factor
		var size = this.tag.width()-this.rightMargin;
		size -= size % this.stretch;
		this.size=size/this.stretch; // number of note units which are stored
	}
	
	setYScale(val) {
		if (typeof val == "undefined") val=this.yScale;
		this.canvas.clearRect(0,0,this.stretch*this.size+this.rightMargin,88*this.yScale);
		this.yScale=val;
		var cv=document.getElementById( "timeline" );
		cv.height=88*this.yScale;
		this.drawGrid(this.timeGrid, this.timeGroup);
		this.drawKeyboard();
		this.drawNote(null);
		$("#yscale").val(val);
	}
	
	setColoring(coloring) {
		this.coloring=coloring;
	}
	
	addTick(val,offset) {
		// add one element (circular memory) at position "this.begin"
		var b = this.begin;
		this.mel[b]=val;
		this.melSmooth[b]=offset;
		this.begin = (b+1) % this.mel.length;		
	}
	
	add(val) {
		// insert a value a position "this.begin" (circular memory)
		
		if (val==1000) {
			if(++this.autoStop>this.autoStopLimit) return 1000;
		}
		else {
			this.autoStop=0;
			this.lastNoteAdded=val;
		}
		
		var b=this.begin;
		this.mel[b]=val;
		
		this.tones[b]=theOscillator.getChord();
		

		var dev;

		var last  = (b-1+this.mel.length)%this.mel.length; // previous
		var last2 = (b-2+this.mel.length)%this.mel.length;	// one before the previous
		
		// decision criterion is the deviation from the smoothed pitch
		dev = val - this.melSmooth[last];		
		
		var smoothedNote;
		
		if (dev> -0.6 && dev<0.6 && val!=1000) {
			// if the current note is close to the last one: apply (volatile) exponential smoothing
			smoothedNote = this.melSmooth[b] = 0.8*this.melSmooth[last] + 0.2 * val;
		}
		else {
			// we have a significant jump; believe in the new value
			smoothedNote = this.melSmooth[b]=val;

			// if we are at the beginning of a break and we have seen a smoothed value before: keep that value
			if (this.mel[last]!=1000 && val==1000 && this.melSmooth[last]!=1000) {
				// this.melSmooth[b]=this.melSmooth[last];
			}
			
			// if the last value also was a significant jump: ignore the smoothed value in between
			// as it is most likely a transition artefact
			if (this.melSmooth[last]!=1000 && this.melSmooth[last2]!=1000) {
				dev= this.melSmooth[last] - this.melSmooth[last2];
				var dev2 = this.melSmooth[b] - this.melSmooth[last2];
				if (dev<-0.3 || dev>0.3) {
					if (dev2>-0.3 && dev2 <0.3) {
						this.melSmooth[last] = this.melSmooth[last2];
					}
					else {
						this.melSmooth[last]=1000;
					}
				}
			}
		}

		/*
		console.log("t="+this.begin+"\tval="+val.toFixed(2)+"\tsmall dev="+dev.toFixed(2)
			+"\t   mel= "+this.mel[last2].toFixed(2) + " -- " +this.mel[last].toFixed(2) + " -- " + this.mel[b].toFixed(2)
			+"\tsmooth= "+this.melSmooth[last2].toFixed(2) + " -- " + this.melSmooth[last].toFixed(2) + " -- " + this.melSmooth[b].toFixed(2)
		);
		*/
		
		this.begin = (this.begin+1) % this.mel.length;		// next position (circular)
		
		return smoothedNote;
	}
	
	scrollTo(note) {
		this.box.scrollTop(this.yScale*(39-note));
	}
	
	drawRhythm() {
		if (!this.tag.is(":visible")) return;

		var cv = this.canvas;
		var lenMark = 4; // length of mark in pixels

		cv.beginPath();
			cv.lineWidth = 8;
			cv.strokeStyle = "#fff";
			cv.moveTo(0,y);
			cv.lineTo(this.size*this.stretch+lenMark,y);
		cv.stroke();
		
		for (var m=0;m<this.size;m++) {
			var mm = (this.begin+m)%(this.size);
			if (this.mel[mm]<0) break;
			var x= (this.mel[mm] % (this.size*this.stretch)) * this.stretch;
			var y= this.yScale + Math.floor(this.mel[mm] / this.size / this.stretch) * this.yScale;
			cv.beginPath();
				var dark=Math.max(0, 200-this.melSmooth[mm].peak*2000);
				cv.strokeStyle = "rgb("+dark+","+dark+","+dark+")";
				cv.moveTo(x,y-this.yScale*0.4);
				cv.lineTo(x,y+this.yScale*0.4);
			cv.stroke();
		}
	}

	drawGrid(gridX,groupX) {
		if (typeof gridX  =="undefined") gridX =this.timeGrid;
		if (typeof groupX =="undefined") groupX=this.timeGroup;
		this.timeGrid=gridX;
		this.timeGroup=groupX;
		this.drawNote(null);
		this.beginTime=-1;
	}
	
	drawKeyboard() {
						//	C		C#		D		D#		E		F		F#		G		Ab		A		Bb		B
		var keyRelPos	=[	0	,	0.08,	1/7.,	0.24,	2/7.,	3/7.,	0.50,	4/7.,	0.67,	5/7.,	0.83,	6/7.	];
		var keyRelWidth	=[	1/7.,	0.09,	1/7.,	0.09,	1/7.,	1/7.,	0.09,	1/7.,	0.09,	1/7.,	0.09,	1/7.	];

		var keyPos=[];		// y position of a key
		var keyWidth=[];	// y height of a key
		for(var k=0;k<97;k++) {  // 8 octaves, starting with C0
			var octave = Math.floor(k/12);
			keyPos.push(Math.round(12*this.yScale*(8.08-octave-keyRelPos[k%12])));
			keyWidth.push(Math.round(12*this.yScale * keyRelWidth[k%12]));
		}
		this.yToNote=[];
		for(var k=keyPos.length-1;k>=1;k--) {
			for(var y=keyPos[k];y<keyPos[k-1];y++) this.yToNote.push(k-57);
		}


		var cv = this.canvas;
		for (var n=-48;n<40;n++) {

			// keyboard
			var y  = (40-n)*this.yScale;
			var yn = keyPos[n+57];
			var yh = keyWidth[n+57];
			cv.beginPath();
				cv.lineWidth=1;
				if ([0,2,4,5,7,9,11].includes((n+57)%12)) {
					if ((n+57)%12==0) {
						cv.fillStyle = "#eee";
						cv.fillRect(this.size*this.stretch+70,yn-yh,80,yh);				
					}
					cv.strokeStyle = "#222";
					cv.rect(this.size*this.stretch+70,yn-yh,80,yh);
				}
				else {
					cv.strokeStyle = "#000";
					cv.fillStyle = "#222";
					cv.fillRect(this.size*this.stretch+70,yn-yh,50,yh);
				}
			cv.stroke();

			// note name
			cv.fillStyle = "#000";
			cv.fillText(theDetector.noteName(n,true), this.stretch*this.size+20,y-this.yScale/2+5);
		}
	}
	
	drawNote(signal) {
		// draw the series of inserted notes
		
		if (signal!=null && !this.tag.is(":visible")) return;

		var note = (signal==null || signal==1000) ? 1000 : Math.round(signal.note);
		var cv = this.canvas;
		
		// clear area
		cv.clearRect(0,0,this.stretch*this.size,88*this.yScale);

		// horizontal lines and note name highlight
		var x,y;
		cv.font = "bold 16px Arial";
		// 88 notes from A2(=-48) to c5 (=39)
		for (var n=-48;n<=40;n++) {
			y = (40-n)*this.yScale;
			// colored line per note
			cv.beginPath();
				cv.strokeStyle = this.noteColors[(n+52)%12];  // 12 different colors
				cv.lineWidth=1;
				cv.moveTo(0,y);
				cv.lineTo(this.size*this.stretch,y);
			cv.stroke();
			// gray octave separators
			if ((n-3)%12==0) {
				cv.beginPath();
					cv.strokeStyle = "#000";
					cv.lineWidth=1;
					cv.moveTo(this.size*this.stretch+10,y);
					cv.lineTo(this.size*this.stretch+45,y);
				cv.stroke();
			}

			// note name highlight
			if (n==40) break;
			if (n==this.lastNoteDrawn) {
				cv.fillStyle = "black";
				cv.fillText(theDetector.noteName(n,true), this.stretch*this.size+20,y-this.yScale/2+5);
			}
			if (n==note) {
				cv.fillStyle = "red";
				cv.fillText(theDetector.noteName(n,true), this.stretch*this.size+20,y-this.yScale/2+5);	
			}
		}
		this.lastNoteDrawn=note;

		
		// vertical ticks
		cv.lineWidth=1;
		var n=0;
		var grid = this.timeGroup/this.timeGrid;
		for (var x=this.size*this.stretch;x>=0;x-=this.stretch*this.timeGrid) {
			cv.beginPath();
				cv.strokeStyle= (n%grid==0) ? "#555" : "#bbb";
				cv.moveTo(x,0);
				cv.lineTo(x,88*this.yScale);
			cv.stroke();
			n++;
		}
		
		// detected note background, osc note (green), smoothed pitch (red)
		var x = this.stretch * (this.size-this.lookAhead-this.shift+this.begin%this.shift);
		for (var m=0;m<this.size;m++) {
			x -= this.stretch;
			if (x<0) break;
			var mm = (this.begin+this.mel.length-1-m) % this.mel.length;
			if (this.melSmooth[mm]==1000) continue;
			y = this.yScale * (39.5-this.melSmooth[mm]);
			// grey background: detected note
			cv.beginPath();
				cv.lineWidth = 4;
				cv.strokeStyle = "#d0d0d0";
				var yy=y-y%this.yScale;
				cv.moveTo(x,yy);
				cv.lineTo(x,yy+this.yScale-1);
			cv.stroke();
			// thick green line: oscillator note
			cv.beginPath();
				cv.lineWidth = 4;
				cv.strokeStyle = "#afa";
				for(var tone of this.tones[mm]) {
					var yy= (39.25-Math.round(tone/100))*this.yScale;
					cv.moveTo(x,yy);
					cv.lineTo(x,yy+(this.yScale/2-1));
				}
			cv.stroke();
			
			// detected pitch
			if (this.coloring=="PR" || this.coloring=="SM") {
				// medium red line: smoothed pitch (precise and smoothed coloring)
				cv.beginPath();
					cv.lineWidth = 4;
					cv.strokeStyle = "#f44";
					cv.moveTo(x,y-2);
					cv.lineTo(x,y+2);			
				cv.stroke();
			}
			else if (this.coloring=="SI" || this.coloring=="SH") {
				// red note: smoothed pitch (simple coloring)
				cv.beginPath();
					cv.lineWidth = 4;
					if (this.coloring=="SH")	cv.strokeStyle = this.shadingColor(Math.round(this.melSmooth[mm])-this.melSmooth[mm]);
					else						cv.strokeStyle = "#f44";
					y = this.yScale * (39.25-Math.round(this.melSmooth[mm]));
					cv.moveTo(x,y);
					cv.lineTo(x,y+(this.yScale/2-1));
				cv.stroke();				
			}

			// thin blue line: exact pitch (precise coloring only)
			if (this.coloring=="PR") {
				cv.beginPath();
					cv.strokeStyle = "blue";
					cv.lineWidth = 1;
					if (this.mel[mm]==1000) continue;
					y = this.yScale * (39.5-this.mel[mm]);
					cv.moveTo(x,y);
					cv.lineTo(x+this.stretch,y);
				cv.stroke();
			}
		}
		
		if (note!=1000) {	
			this.scrollAdjust(note);
		}

	}

	scrollAdjust(note) {
		// auto scroll into view

		var visibleHigh = this.yToNote[Math.floor(this.box.scrollTop())];
		var visibleRange= Math.floor(this.box.height() / this.yScale);
		var visibleLow  = this.yToNote[Math.ceil(this.box.scrollTop()+this.box.height())];
		var highestNote = this.tones[this.begin].length>0 ? Math.max(note,theOscillator.range.high) : note;
		var lowestNote  = this.tones[this.begin].length>0 ? Math.min(note,theOscillator.range.low) : note;
		var border = 3;
		if (visibleRange<7) border=Math.floor(0.5*(visibleRange-1));
		
		if (highestNote-lowestNote >= visibleRange) {
			if 		(note==lowestNote ) highestNote=note+visibleRange-1;
			else if (note==highestNote) lowestNote=note-visibleRange+1;
			else if (note-lowestNote<=visibleRange ) highestNote=lowestNote+visibleRange-1;
			else if (highestNote-note<=visibleRange) lowestNote=highestNote-visibleRange+1;
			else {
				lowestNote  = note-visibleRange/2+1;
				highestNote = note+visibleRange/2-1;
			}
			if (visibleHigh <= highestNote) { 	// must scroll up
				this.box.scrollTop((39-highestNote)*this.yScale); // scroll to see highest note
			}
			else if (visibleLow>=lowestNote) {	// must scroll down
				this.box.scrollTop((39-visibleRange-lowestNote)*this.yScale);
			}
		}
		else if (visibleHigh <= highestNote) { 	// must scroll up
			this.box.scrollTop((39-border-highestNote)*this.yScale); // scroll to see highest note
		}
		else if (visibleLow>=lowestNote) {	// must scroll down
			this.box.scrollTop((39+border-visibleRange-lowestNote)*this.yScale);
		}
	}

	shadingColor(val) {
		// returns a value between "#ff4" (val>0.3) and "#4ff" (val<-0.3); val==0 return "#4f4"
		if (typeof this.shading == "undefined") {
			this.shading=[
				"#0613A1","#0B29A5","#0F3FA9","#1455AD","#196AB1","#1E80B4","#2495B8","#29AABC","#2FBFC0",
				"#35C4B4","#3BC7A8","#41CB9C","#48CF92","#4ED388","#55D77E","#5CDA76","#64DE6E","#6EE26B",
				"#83E673","#97EA7A","#AAED82","#BCF18B","#CEF593","#DEF99C","#EDFDA5"];
		}
		val=Math.round(15-val*30);
		if (val<0) return this.shading[0];
		if(val>=24) return this.shading[24];
		return this.shading[val];
	}
	
	clicked(event) {
		var note = 39 - Math.floor(event.offsetY/theTimeline.yScale);
		theOscillator.setDetune(note*100);
		console.log(theDetector.noteName(note,true));
		
	}
	
}
