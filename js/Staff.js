class Staff {

	constructor() {
		this.width= $("#staff").width();
		this.height= $("#staff").height();
		
		this.notesY = [
			320,310,310,300,290,290,280,280,270,270,260,250,
			250,240,240,230,220,220,210,210,200,200,190,180,
			180,170,170,160,150,150,140,140,130,130,120,110,
			110,100,100, 90, 80, 80, 70, 70, 60, 60, 50, 40,
			 40, 30, 30, 20
		];
		this.channels = [
			"#ff0",
			"#f00",
			"#0f0",
			"#00f",
			"#0ff",
			"#f0f",
		];
		this.notes=[];
	}
	
	// -------------------------------------------------------
	drawStaff() {
		var width= $("#staff").width();
		var height= $("#staff").height();
		var ctx = document.getElementById("staff").getContext("2d");

		// clear area
		ctx.fillStyle="#fffff7";
		ctx.fillRect(0,0,width,height);

		// draw lines
		ctx.beginPath();
			ctx.strokeStyle="black";
			ctx.lineWidth=1;
			ctx.moveTo(10,260);
			ctx.lineTo(10,60);
			for (var y=300;y>=20;y-=20) {
				ctx.moveTo((y<=260&&y>=60) ? 10 : 75,y);
				if (y==160) continue;
				ctx.lineTo((y<=260&&y>=60) ? width-10 : width-75,y);
			}
		ctx.stroke();
	}

	// -------------------------------------------------------
	drawNote(data) {
		var velocity=0;
		if 		(data.message==144) {
			this.notes[data.channel]=data.note;
			velocity=data.velocity;
		}
		else if (data.message==128) {
			this.notes[data.channel]=null;
		}
		
		// clear staff
		this.drawStaff();
		
		// draw active notes
		var ctx = document.getElementById("staff").getContext("2d");

		for (var n=0;n<this.notes.length;n++) {
			var note = this.notes[n];
			if (note===null) continue;
			var y = this.notesY[note-33];
			ctx.beginPath();
			ctx.fillStyle=this.channels[n];
			ctx.ellipse(100,y,15,10,-0.33,0,Math.PI*2);
			ctx.fill();
			ctx.stroke();
		}

		if (velocity!=0) {
			var dynamic = ["pppp","ppp","pp","p","mp","mf","f","ff","fff","ffff","fffff"][Math.floor(velocity/12.7)];
			ctx.font = 'italic 24px serif';
			ctx.fillStyle= "black";
			ctx.fillText(dynamic,40,165);
		}
	}
	
}

var theStaff=new Staff();