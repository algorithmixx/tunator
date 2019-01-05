"use strict";

// ======================================================================================================== Lessons

class Lessons {
	//	the Lessons describe tasks to be performed by the user
	
	constructor() {
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
		var height=window.innerHeight-$("#instructionBox").position().top-18;
		if (height<200) height=200;
		$("#instructionBox").height(height);	
	}
	
	expand(id) {
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
		// if no ID is passed the last text will be refreshed (useful if languge changed)

		if (typeof id == "undefined") id = this.currentLessonId;
		else this.currentLessonId = id;
		
		// convert numeric id to id text
		if (parseInt(id)==id && id<this.lessons) {
			id=this.lessons[parseInt(id)].id;
		}
		
		// set select box
		$("#lessons").val(id);
		
		if (id=="USER-MODE") 	{
			this.clear();
			theTunator.configure(["menu","micro","osc","wave","timeline"]);
			$("#other").show();
			theTunator.selectAudio("");
			return;
		}
		
		if (id=="TUNATOR") {
			theTunator.configure(["micro"]);
			theDetector.showDeviation(false);
			this.show(id,this.expand("lesson-"+id));
		}
		
		else if (id=="WHAT-NOTE-1") {
			theTunator.configure(["micro"]);
			theDetector.showDeviation(false);			
			this.show(id,this.expand("lesson-"+id));
		}
			
		else if (id=="WHAT-NOTE-2") {
			theTunator.configure(["menu","micro"]);
			theTimeline.setYScale(30);
			theTimeline.setHeight(12);
			this.show(id,this.expand("lesson-"+id));
		}
			
		else if (id=="TRANSPOSITION") {
			theTunator.configure(["menu","micro"]);
			theTimeline.setYScale(30);
			theTimeline.setHeight(12);
			this.show(id,this.expand("lesson-"+id));
		}
		
		else if (id=="GENERATOR") {
			theTunator.configure(["menu","osc","wave"]);
			this.show(id,this.expand("lesson-"+id));
		}
		
		else if (id=="COMPARE") {
			theTunator.configure(["menu","osc"]);
			theOscillator.showControl();
			theOscillator.setDetune(0);
			theOscillator.setMode("compare (easy)");
			theOscillator.setType("custom");
			this.show(id,this.expand("lesson-"+id));			
		}

		else if (id=="ASSISTED") {
			theTunator.configure(["menu","osc","timeline"]);
			theTimeline.setHeight(9);
			theTunator.setMode("intonation");
			theAnalyser.speakNoteNames(true);
			this.show(id,this.expand("lesson-"+id));
		}

		else if (id=="SAMPLING") {
			theTunator.configure(["menu","micro","wave"]);
			this.show(id,this.expand("lesson-"+id));
		}

		else if (id=="RHYTHM") {
			theTunator.configure(["menu","osc","timeline"]);
			theTimeline.setHeight(5);
			theTunator.setMode("rhythm");
			this.show(id,this.expand("lesson-"+id));
		}

		else if (id=="MORE") {
			theTunator.configure(["menu",]);
			this.show(id,this.expand("lesson-"+id));
		}

		else if (id=="ABOUT") {
			theTunator.configure([]);
			this.show(id,this.expand("lesson-"+id));
		}
		
		else {
			theTunator.configure([]);
			this.show(id,theLang.tr("noLessonFound"));
		}
	}
	
	clear() {
		$("#instruction").hide();
		$("#instruction").html("");		
	}
	
	show(id,instruction) {		
		// find lesson, get its title
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
	
		if (demo=="chord-3-III") {			
			theOscillator.setChord("0,4,7");
			theOscillator.start();
			setTimeout(function() {	theOscillator.pause(); },1500);
			setTimeout(function() {	theOscillator.setChord("0,104,107"); theOscillator.resume(); },2000);
			setTimeout(function() {	theOscillator.terminate(); theOscillator.setChord("0"); },3500);
		}

		else if (demo=="wanderingPitch") {
			theOscillator.setDetune(-900);
			theOscillator.setMode("wandering");
			theOscillator.start();
			setTimeout(function() {	theOscillator.terminate(); theOscillator.setMode("straight"); theOscillator.setDetune(-1200);},4500);
		}
			
	}
}
