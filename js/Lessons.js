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
		result=result.replace(/DEMO\[\[([^|]+)[|]([^\]]+)\]\]/g,'<button class="demo" onclick="theLessons.demo(\'$1\')">$2</button>');
		result=result.replace(/WP\[\[([^|]+)[|]([^\]]+)\]\]/g,'<a target="link" href="https://'+theLang.lang+'.wikipedia.org/wiki/$1">$2</a>');
		result=result.replace(/LINK\[\[([^|]+)[|]([^\]]+)\]\]/g,'<a target="link" href="$1">$2</a>');
		result=result.replace(/IMG\[\[([^|]+)[|]([^\]]+)\]\]/g,'<img src="$1" style="float:right;margin-left:20px;margin-bottom:10px;$2"/>');
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
			theTunator.configure(["menu","micro","osc","wave","timeline"]);
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
			theOscillator.showControl();
			theOscillator.setDetune(0);
			theOscillator.setMode("compare (easy)");
			theOscillator.setType("custom");
			this.show(id,this.expand("lesson-"+id));
		}

		else if (id=="ASSISTED") {
			// setting for assisted playing ("intomation mode")
			theTunator.configure(["menu","osc","timeline"]);
			theTimeline.setHeight(9);
			theTunator.setMode("intonation");
			theAnalyser.speakNoteNames(true);
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

	}
}
