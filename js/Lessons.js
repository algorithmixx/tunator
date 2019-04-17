"use strict";

// ======================================================================================================== Lessons

class Lessons {
/*
	Lessons describe tasks to be performed by the user
*/

	constructor() {
		// the list of lesson IDs
		this.lessons = [
			{id: "TUNATOR"			},
			{id: "WHAT-NOTE-1"		},
			{id: "WHAT-NOTE-2"		},
			{id: "TRANSPOSITION"	},
			{id: "GENERATOR"		},
			{id: "COMPARE"			},
			{id: "ASSISTED"			},
			{id: "CHORDS"			},
			{id: "SAMPLING"			},
			{id: "RHYTHM"			},
			{id: "MORE"				},
			{id: "USER-MODE"		},
			{id: "ABOUT"			},
		];
		this.currentLessonId = "";
	}

	loadList() {
		// load the lesson titles from LangDef.js
		//
		var selection="";
		var l=0;
		for (var lesson of this.lessons) {
			lesson.title=theLang.tr("lesson-title-"+lesson.id);
			if (l++==1 || lesson.id=="USER-MODE") selection+="<option value=''>----------------------------------------------------------</option>";
			selection+="<option value='"+lesson.id+"'>"+lesson.title+"</option>";
		}
		$("#lessons").html(selection);
	}

	adaptHeight() {
		// adapt the height of the area where the lesson text is displayed so that the browser´s window height is optimally used

		var height=window.innerHeight-$("#instructionBox").position().top-18;
		if (height<200) height=200;
		$("#instructionBox").height(height);
	}

	expand(id) {
		// replace the proprietory MARK DOWN SYNTAX EXTENSIONS by their HTML equivalent
		var markup =  theLang.tr(id).replace(/§/g,'`');
		var parsed = new commonmark.Parser().parse(markup); // parsed is a 'Node' tree
		var result =new commonmark.HtmlRenderer().render(parsed); // result is a String
		result=result.replace(/DEMO\[\[([^|]+)[|]([^\]]*)\]\]/g,'<button class="demo" onclick="theLessons.demo(\'$1\')">$2</button>');
		result=result.replace(/WP\[\[([^|]+)[|]([^\]]*)\]\]/g,'<a target="link" href="https://'+theLang.lang+'.wikipedia.org/wiki/$1">$2</a>');
		result=result.replace(/LINK\[\[([^|]+)[|]([^\]]*)\]\]/g,'<a target="link" href="$1">$2</a>');
		result=result.replace(/IMG\[\[([^|]+)[|]([^\]]*)\]\]/g,'<img src="$1" style="float:right;margin-left:20px;margin-bottom:10px;$2"/>');
		return result;
	}

	set(id) {
		// display the text of the lesson with the given ID
		// the ID can be a symbolic name or a sequence number
		// if no ID is passed the last text will be refreshed (useful if language was changed)

		if (typeof id == "undefined") id = this.currentLessonId;
		else this.currentLessonId = id;

		// convert numeric id to id text
		if (parseInt(id)==id && id<this.lessons) {
			id=this.lessons[parseInt(id)].id;
		}

		// set the active element in the lesson select box
		$("#lessons").val(id);

		// configure Tunator individually for each lesson

		if (id=="USER-MODE") 	{
			// show everything, no lesson text, let the user fiddle with the elements of the program
			this.clear();
			theTunator.configure(["menu","micro","osc","wave","timeline","midi"]);
			$("#other").show();
			theTunator.selectAudio("");
			return;
		}

		if (id=="TUNATOR") {
			// introduction, minimal set of UI elements
			theTunator.configure(["micro"]);
			theDetector.showDeviation(false);
			this.show(id,this.expand("lesson-"+id));
		}

		else if (id=="WHAT-NOTE-1") {
			// same minimal set of UI elements
			theTunator.configure(["micro"]);
			theDetector.showDeviation(false);
			this.show(id,this.expand("lesson-"+id));
		}

		else if (id=="WHAT-NOTE-2") {
			// offering menu control, oscilloscope and timeline in addition
			theTunator.configure(["menu","micro"]);
			theTimeline.setYScale(30);
			theTimeline.setHeight(12);
			this.show(id,this.expand("lesson-"+id));
		}

		else if (id=="TRANSPOSITION") {
			// same as before
			theTunator.configure(["menu","micro"]);
			theTimeline.setYScale(30);
			theTimeline.setHeight(12);
			this.show(id,this.expand("lesson-"+id));
		}

		else if (id=="GENERATOR") {
			// in addition open the sound generator
			theTunator.configure(["menu","osc","wave"]);
			this.show(id,this.expand("lesson-"+id));
		}

		else if (id=="COMPARE") {
			// setting for pitch comparison
			theTunator.configure(["menu","osc"]);
			theOscillator.setDetune(0);
			theOscillator.setMode("compare (easy)");
			theOscillator.setType("custom");
			theTunator.selectAudio("oscillator"); // disable
			this.show(id,this.expand("lesson-"+id));
		}

		else if (id=="ASSISTED") {
			// setting for assisted playing ("intonation mode")
			theTunator.configure(["menu","osc","timeline"]);
			theTimeline.setHeight(9);
			theTunator.setMode("intonation");
			theAnalyser.announceNoteNames(true);
			this.show(id,this.expand("lesson-"+id));
		}

		else if (id=="CHORDS") {
			// setting for chord progression
			theTunator.configure(["menu","timeline"]);
			theOscillator.showControl();
			theOscillator.setDetune(-2100);
			theOscillator.setMode("straight");
			theOscillator.setType("custom");
			theTimeline.setYScale(15);
			theTimeline.setHeight(26);
			this.show(id,this.expand("lesson-"+id));
		}

		else if (id=="SAMPLING") {
			// learning to use sample loops
			theTunator.configure(["menu","micro","wave"]);
			this.show(id,this.expand("lesson-"+id));
		}

		else if (id=="RHYTHM") {
			// experimenting with rhythm (under development)
			theTunator.configure(["menu","osc","timeline"]);
			theTimeline.setHeight(5);
			theTunator.setMode("rhythm");
			this.show(id,this.expand("lesson-"+id));
		}

		else if (id=="MORE") {
			// special menu (mainly for debugging / developers)
			theTunator.configure(["menu",]);
			this.show(id,this.expand("lesson-"+id));
		}

		else if (id=="ABOUT") {
			// about Tunator
			theTunator.configure([]);
			this.show(id,this.expand("lesson-"+id));
		}

		else {
			// error: invalid lesson ID
			theTunator.configure([]);
			this.show(id,theLang.tr("noLessonFound"));
		}
	}

	clear() {
		// clear lesson text
		$("#instruction").hide();
		$("#instruction").html("");
	}

	show(id,instruction) {
		// find a lesson text ("instruction"), get its title, add navigation buttons at the end
		var title="";
		var n=0;
		for (var les of this.lessons) {
			if (les.id==id) {
				title=les.title;
				break;
			}
			n++;
		}

		// find next lesson
		var back="";
		if (n>0) {
			back =
				"<button onclick='theLessons.set(\""+this.lessons[n-1].id+"\");'>"+
				"<span style='display:inline-block;background:#fec;font-size:125%'>"+
				this.lessons[n-1].title+
				"</span></button>"+
				" &nbsp; &lArr; &nbsp; ";
		}

		var continuation="";
		if (n+1<this.lessons.length) {
			continuation=
				" &nbsp; &rArr; &nbsp; <button onclick='theLessons.set(\""+this.lessons[n+1].id+"\");'>"+
				"<span style='display:inline-block;background:#fec;font-size:125%'>"+
				this.lessons[n+1].title+
				"</span></button>";
		}

		$("#instruction").show();
		$("#instruction").html("<h2>"+title+"</h2>"+instruction+"<p/><hr>"+back+theLang.tr("selectLesson")+continuation);
		$("#instruction").toggle(title!="");
		$("#instructionBox").scrollTop(0);

	}

	demo(demo) {
		// a set of special demonstrations which can be executed by their "demo" name

		if (demo=="chord-3-III") {
			// play a tripel chord in tempered scale system and in perfect pitch ratios
			theOscillator.setChord("0,4,7");
			theOscillator.start();
			setTimeout(function() {	theOscillator.pause(); },1500);
			setTimeout(function() {	theOscillator.setChord("0,104,107"); theOscillator.resume(); },2000);
			setTimeout(function() {	theOscillator.terminate(); theOscillator.setChord("0"); },3500);
		}

		else if (demo=="wanderingPitch") {
			// produce some seconds of a sound that changes pitch around the note "c"
			theOscillator.setDetune(-900);
			theOscillator.setMode("wandering");
			theOscillator.start();
			setTimeout(function() {	theOscillator.terminate(); theOscillator.setMode("straight"); theOscillator.setDetune(-1200);},4500);
		}

		else if (demo.substr(0,11)=="basicChange") {
			// ...
			var t=1000;
			var d=30;
			var D = 0.5;
			var o=theOscillator;
			var n=3;
			theTunator.selectAudio("oscillator");
			o.useToneGains(true);
			var mute = demo.substr(-1);
			o.muteChord([]);

			// play two ticks of the muted tone or of highest tone (if none is muted)
			var startTone= "24";
			if 		(mute=="A") startTone="7";
			else if (mute=="T") startTone="4";
			else if (mute=="B") startTone="-12";

			o.setChord(startTone,[10]); o.pause();
			theTunator.selectDetectionSource('micro');
			for (var nn=n-1;nn>0;nn--) {
				setTimeout(function() { o.resume();	}, nn*t);
				setTimeout(function() {	o.pause();	}, nn*t+100);
			}

			setTimeout(function() {	o.muteChord([mute=="B",mute=="T",mute=="A",mute=="S"]); }, n*t-d);

			//----------------------------------------------------------------------------------

			setTimeout(function() {	o.resume();o.setChord(	"-12,  4,  7, 12", [ 80 ]			);},n*t);	n+=2;	setTimeout(function() {	o.pause();	},  n*t-d);

			setTimeout(function() {	o.resume(),o.setChord(	" -7,  5,  9, 12", [ 60 ]			);},n*t);	n+=2;	setTimeout(function() {	o.pause();	},  n*t-d);

			setTimeout(function() {	o.resume(),o.setChord(	" -5,  4,  7, 12", [ 60, 80, 60, 80]);},n*t);	n+=1;	setTimeout(function() {	o.pause();	},  n*t-d);
			setTimeout(function() {	o.resume(),o.setChord(	" -5,  2,  7, 11", 					);},n*t);	n+=1;	setTimeout(function() {	o.pause();	},  n*t-d);

			setTimeout(function() {	o.resume(),o.setChord(	"-12,  4,  7, 12", [ 50 ]			);},n*t);	n+=2;	setTimeout(function() {	o.pause();	},	(n-0.3)*t-d);

			//----------------------------------------------------------------------------------

			setTimeout(function() {	o.resume(),o.setChord(	"-12,  0,  4,  7", [ 80 ]			);},n*t);	n+=2;	setTimeout(function() {	o.pause();	}, n*t-d);

			setTimeout(function() {	o.resume(),o.setChord(	" -7,  0,  5,  9", [100, 40, 60, 60]);},n*t);	n+=1;	setTimeout(function() {	o.pause();	}, n*t-d);
			setTimeout(function() {	o.resume(),o.setChord(	" -8,  0,  5,  9", 					);},n*t);	n+=1;	setTimeout(function() {	o.pause();	}, n*t-d);

			setTimeout(function() {	o.resume(),o.setChord(	"-10,  0,  5,  9", [ 80,100, 60, 60]);},n*t);	n+=1;	setTimeout(function() {	o.pause();	}, n*t-d);
			setTimeout(function() {	o.resume(),o.setChord(	" -5, -1,  5,  7", 					);},n*t);	n+=1;	setTimeout(function() {	o.pause();	}, n*t-d);

			setTimeout(function() {	o.resume(),o.setChord(	"-12,  0,  4,  7", [ 40 ]			);},n*t);	n+=3;	setTimeout(function() {	o.pause();	}, n*t-d);

			//----------------------------------------------------------------------------------
			setTimeout(function() {
				o.terminate();
				o.setChord("0");
				o.muteChord([]);
				o.useToneGains(false);
				theTunator.selectDetectionSource("");
				theTunator.selectAudio("");
			},n*t);
		}
		else if (demo=="basicChange2") {
			// ...
			theOscillator.setChord("100,116,119,124");
			theOscillator.start();
			setTimeout(function() {	theOscillator.pause(); },1400);
			setTimeout(function() {	theOscillator.setChord("105,117,121,124"); theOscillator.resume(); },1500);
			setTimeout(function() {	theOscillator.terminate(); theOscillator.setChord("0"); },2900);
		}

	}
}
