"use strict";

// ======================================================================================================== Wave

class Wave {
/*
	Wave provides an oscilloscope-like view of a signal shape
*/

	constructor(width,height) {
		this.width=width;
		this.height=height;
		this.tag=$("#wave");
		this.canvas = document.getElementById( "wave" ).getContext("2d");
		this.drawAxis();
	}

	show() {
		// show the blue wave area
		if (this.tag.is(":visible")) return;

		this.tag.show();
		$("#toggleWave").css("background-color","lightgreen");
		theAnalyser.showSampling(true);
		theLessons.adaptHeight();
	}

	hide() {
		// hide the blue wave area
		if (!this.tag.is(":visible")) return;

		this.tag.hide();
		$("#toggleWave").css("background-color","");
		theAnalyser.showSampling(false);
		theLessons.adaptHeight();
	}

	toggle() {
		// show/hide the blue wave area
		if (this.tag.is(":visible"))	this.hide();
		else							this.show();
	}

	drawAxis(type,length,noteNum) {
		// draw axis with note names or with time scale
		this.canvas.clearRect(0,0,this.width,this.height);

		// axis
		this.canvas.beginPath();
		this.canvas.strokeStyle = "blue";
		this.canvas.moveTo(0,0);
		this.canvas.lineTo(0,this.height);
		this.canvas.moveTo(this.width,0);
		this.canvas.lineTo(this.width,this.height);
		this.canvas.moveTo(0,this.height/2);
		this.canvas.lineTo(this.width,this.height/2);
		this.canvas.stroke();

		this.canvas.beginPath();
		if (type =="notes") {
			this.canvas.fillStyle = "black";
			this.canvas.font = "10px Arial";
			var peak=0;
			for(var n =0;n<49;n++) {
				if ([28,30,33,35,37,40,42,45,47].includes(n)) continue;
				var tick = 998./Math.pow(1.059463094359,n);
				this.canvas.moveTo(tick,this.height/2-5);
				this.canvas.lineTo(tick,this.height/2+5);
				this.canvas.fillText(theDetector.noteName(n-26,false), tick-4,this.height/2+20);
			}
		}
		else {
			this.canvas.font = "10px Arial";
			var mark=0;
			for(var tick=0;tick<length;tick+=23.5) {
				this.canvas.fillStyle = "black";
				this.canvas.fillText(""+mark, tick-4,this.height/2+20);
				mark++;
				this.canvas.fillStyle = "red";
				this.canvas.moveTo(tick,this.height/2);
				this.canvas.lineTo(tick,this.height/2+5);
			}
			for(var tick=0;tick<length;tick+=64,mark++) {
				this.canvas.fillStyle = "black";
				this.canvas.fillText(""+(tick*2), tick-10,this.height/2-30);
				this.canvas.fillStyle = "green";
				this.canvas.moveTo(tick,this.height/2-15);
				this.canvas.lineTo(tick,this.height/2);
			}
		}

		this.canvas.stroke();

	}

	drawNoise(buf) {
		// draw aperiodic signal

		if (!this.tag.is(":visible")) return;

		this.drawAxis("time",buf.length,0);

		// scale buffer to fill the vertical axis
		var peak=0;
		for (var s=0;s<buf.length;s++) if (Math.abs(buf[s])>peak) peak=Math.abs(buf[s]);
		var scale=1.0/peak*(this.height-10)/2;
		var centerY = this.height/2;

		this.canvas.beginPath();
		this.canvas.moveTo(0,centerY-scale*buf[0]);
		this.canvas.strokeStyle = "#bbf";
		var fac= buf.length/this.width;
		for (var i=1; i<this.width; i++) {
			this.canvas.lineTo(i,centerY-scale*buf[Math.round(i*fac)]);
		}
		this.canvas.stroke();
	}

	drawNote(buf,signal) {
		// draw a periodic signal

		if (!this.tag.is(":visible")) return;

		this.drawAxis("notes",buf.length,signal.note);

		// wave

		// find the steepest zero line crossing within the first period
		var crossing=0;
		var delta=0;
		var b=signal.start;
		for (var n=0;n<signal.period;n++,b++) {
			if (buf[b]<0 && buf[b+1]>=0) {
				if (buf[b+1]-buf[b] > delta) {
					delta=buf[b+1]-buf[b];
					crossing=b;
				}
			}
		}
		// look near the end if we got a higher signal level there
		var scale=0.95/signal.peak;

		var y=[];
		var fac = 500.0 / this.width;  // zoom into the wave
		for (var i=0; i<this.width; i++) {
			y.push(this.height/2-scale*(buf[Math.round(crossing+i*fac)]*(this.height-10)/2));
		}

		// draw full frame
		this.canvas.beginPath();
			this.canvas.moveTo(0,this.height/2+(buf[0]*(this.height-10)/2));
			this.canvas.strokeStyle = "#ccc";
			fac= buf.length/this.width;
			var b;
			for (var i=1; i<this.width; i++) {
				b=Math.round(i*fac)+crossing;
				if (b>=buf.length) break;
				this.canvas.lineTo(i,this.height/2-scale*(buf[b]*(this.height-10)/2));
			}
		this.canvas.stroke();

		// draw magnified portion of detected tone
		this.canvas.beginPath();
		this.canvas.strokeStyle = "black";
		this.canvas.lineWidth = 3;
		this.canvas.moveTo(0,y[0]);
		for (var i=1; i<this.width; i++) {
			if (i>=y.length) break;
			this.canvas.lineTo(i,y[i]);
			// this.canvas.lineTo(i,this.height/2-(buf[Math.round(crossing+i*fac)]*(this.height-10)/2));
		}

		this.canvas.fillText("max signal = "+Math.round(signal.peak*100)+" %", 5,this.height-10);
		this.canvas.stroke();

		// asterisks

		var tick = 998./Math.pow(1.059463094359,Math.round( signal.note ) + 26);
		this.canvas.beginPath();
			this.canvas.fillStyle = "red";
			this.canvas.font = "bold 24px Arial";
			this.canvas.fillText("*", tick-4,this.height/2-5);
			this.canvas.fillText("*", tick-4,this.height/2-15);
			this.canvas.fillText("*", tick-4,this.height/2-25);
			this.canvas.font = "10px Arial";
			this.canvas.fillStyle = "black";
		this.canvas.stroke();

		this.canvas.lineWidth = 1;

	}

}
