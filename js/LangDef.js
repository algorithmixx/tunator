"use strict";

var	LangDef = {

	trt : {											//============================ "title" attributes to be added to a tag with the given "id"

		createdBy: {
			en: "created by Gero Scholz (gero.scholz(at)gmail.com)",
			de: "enwickelt von Gero Scholz (gero.scholz/at)gmail.com",
			es: "",
		},
													// detector control area
		detector: {
			en: "settings for tone detection",
			de: "Einstellungen für die Tonerkennung (Detektor)",
			es: "",
		},
		reference: {
			en: "reference frequency (in Hz) for note 'a', default=443 Hz",
			de: "Bezugsfrequenz für den Kammerton 'a', Default=443 Hz",
			es: "",
		},
		transposition: {
			en: "transposition used for display of note names; default = 'C notation' = no transposition",
			de: "verwendete Transposition für die Anzeige von Notennnamen; default = 'C notation' = keine Transposition",
			es: "",
		},
		pitch: {
			en: "detected frequency",
			de: "erkannte Frequenz",
			es: "",
		},
		rms: {
			en: "signal strenth (0..100)",
			de: "Signalstärke (0..100)",
			es: "",
		},
		peak: {
			en: "highest value within the last second",
			de: "Spitzenwert innerhalb der letzten Sekunde",
			es: "",
		},
		hz: {
			en: "Hertz (periods per second)",
			de: "Hertz (Schwingungen pro Sekunde)",
			es: "Hertz",
		},
		speakName: {
			en: "after a tone is stable for some time: speak its note name",
			de: "wenn ein Ton für einige Zeit stabil ist: Sage den Notennamen an",
			es: "",
		},
										// detected note display area
		detectedNote: {
			en: "name of the detected note",
			de: "Name der erkannten Note",
			es: "",
		},

	},

	trh : {											//============================ HTML content to be added to a tag with the given "id"

		intro: {
			en: "Tunator wants to access your microphone.<p/>Make sure your browser accepts this.<p/>Then click to accept or press any key ...",
			de: "Tunator möchte das Mikrofon benutzen.<p/>Stelle sicher, dass der Browser den Zugriff erlaubt.<p/>Klicke dann hier oder drücke irgendeine Taste ...",
			es : "",
		},


		chooseLesson: {
			en: "Choose a lesson!",
			de: "Wähle eine Lektion aus!",
			es: "",
		},
		peak: {
			en: "peak",
			de: "Peak",
			es: "",
		},
		hz: {
			en: "Hz",
			de: "Hz",
			es: "Hz",
		},
		speakName: {
			en: "tell note",
			de: "Note sagen",
			es: "",
		},
	},

	trx : {											//============================ text content to be associated with the given "id"

		"selectLesson": {
			en: "select lesson",
			de: "Lektion wählen",
			es: "",
		},

		"noLessonFound": {
			en: "There is no lesson with this title",
			de: "Es gibt keine Lektion mit diesem Namen",
			es: "",
		},

		"lesson-title-TUNATOR": {					// ##########################################################################################################################################
			en: "Getting started with <i>Tunator</i>",
			de: "Einführung in <i>Tunator</i>",
			es: "",
		},
		"lesson-TUNATOR": {
 /*-----------------------------------------------------------------------------------------*/   en:`

*Tunator* is about intonation - the art of perfect pitch.

IMG[[https://image.freepik.com/vektoren-kostenlos/classical-piano-gezeichnet_1058-98.jpg|width:300px]]
On a well-tuned piano you simply press a key
and you will hear the correct sound. But with many instruments - and with your singing voice - things are more complicated.
How do you know what note you are singing? Is your pitch "correct" or is it a little bit "off"?
DEMO[[wanderingPitch|Wandering pitch - where is the correct **C** ?]]

When notes sound together they form **chords**. Chords can be intonated differently. DEMO[[chord-3-III|Click and listen carefully!]]

* The first chord you hear  is *chromatic*. The frequency ratios between the lower an the higher tones are §1 : 1.26 : 1.498§.
* The second chord played is *perfect* or *pure* which means that the ratios are based on simple integer numbers: §4 : 5 : 6§.

Mathematically §1.26§ is quite close to §5/4 (1.25)§ but when listening carefully you can feel this difference.
The chromatic chord has small vibrations, the perfect chord sounds clearer and more stable.
It is a matter of listening habits and taste which one you prefer.
Read more on WP[[Scale_(music)|musical scale systems]] and WP[[Interval (music)|intervals]] if you like...

### Now sing or play a tone!

If you see a *large letter* with the name of the note in the **empty gray box** everything works fine.
Next to it you also see the musical representation of the note within the staff lines.
Try to keep the note stable for two seconds and check the *peak level* in the **green box**. Any number
greater than 10 is fine. If your number is smaller: sing louder or move closer to the microphone.

*If you do not see a large note letter*

* You must allow this website to access your microphone. Check your browser settings!
* Your browser must support the media API. Make sure that you are using the latest version of your browser.
* On older Apple devices (like ipad 2) the browser (Safari) does not support the media API - sorry.
* The microphone of your device must be active and its signal must be strong enough.
A certain signal strength (peak value > 10) is necessary for successful detection.
Check your microphone driver settings if you do not get a signal at all or if your signal is too weak.

### Begin with the first lesson!
*Tunator* offers a number of different **lessons**. Lessons can be selected in the *gray area* at the screen top.
Or simply press the button below to start the first lesson.
`/*-----------------------------------------------------------------------------------------*/ , de:`

Bei *Tunator* geht es um Intonation - die Kunst der perfekten Tonhöhe.

IMG[[https://image.freepik.com/vektoren-kostenlos/classical-piano-gezeichnet_1058-98.jpg|width:300px]]
Bei einem gut gestimmten Klavier drückt man einfach eine Taste und es erklingt der richtige Ton.
Aber bei vielen Instrumenten - und bei der Singstimme - ist es komplizierter.
Woher weißt du, welche Note du singst? Ist die Tonhöhe "richtig" oder liegst du ein wenig "daneben"?
DEMO[[wanderingPitch|Tonhöhe auf Wanderschaft - wo ist das richtige **C** ?]]

Wenn Noten zusammen erklingen, bilden sie **Akkorde**. Akkorde können unterschiedlich intoniert werden.
DEMO[[chord-3-III|Klick und hör genau zu!]]

* Der erste Akkord, den man hört, ist *chromatisch*. Die Frequenzverhältnisse zwischen den niedrigeren und höheren Tönen sind §1 : 1.26 : 1.498§.
* Der zweite Akkord ist *perfekt* oder *rein*, was bedeutet, dass die Verhältnisse auf einfachen Ganzzahlen basieren: §4 : 5 : 6§.

Mathematisch gesehen liegt §1.26§ ziemlich nahe an §5/4 (1.25)§, aber wenn man genau hinhört, kann man dennoch den Unterschied spüren.
Der chromatische Akkord hat kleine Vibrationen, der perfekte Akkord klingt klarer und stabiler.
Es kommt auf die Hörgewohnheiten und den Geschmack an, welche Variante du bevorzugst.
Lies mehr über WP[[Tonleiter|Tonleitern]] und WP[[Intervall (Musik)#Stimmungen|Intervalle]] wenn du es genauer wissen willst...

### Jetzt sing oder spiel einen Ton!

Wenn ein *großer Buchstabe* mit dem Namen der Note in der **leeren grauen Box** erscheint, funktioniert alles gut.
Daneben siehst du auch die musikalische Darstellung der Note innerhalb der Notenlinien.
Versuche die Note zwei Sekunden lang stabil zu halten und überprüfe den *Peak* (=Spitzenwert der Lautstärke) in der **grünen Box**.
Ein Wert größer als 10 ist in Ordnung. Wenn die Zahl kleiner ist: Sing lauter oder nähere dich dem Mikrofon.

*Wenn kein Notenbuchstabe erscheint ...*

* Du musst dieser Website den Zugriff auf das Mikrofon gestatten. Überprüfe die Browsereinstellungen!
* Dein Browser muss das Media-API unterstützen. Stellen sicher, dass du die neueste Version deines Browsers verwendest.
* Auf älteren Apple-Geräten (wie ipad 2) unterstützt der Browser (Safari) das Media-API nicht - sorry.
* Das Mikrofon deines Gerätes muss aktiv sein und das Signal muss stark genug sein.
Für eine erfolgreiche Erkennung ist eine Mindestlautstärke (Peak > 10) nötig.
Überprüfe die Mikrofon-Treibereinstellungen, wenn du überhaupt kein Signal erhältst oder wenn es zu schwach ist.

### Beginne mit der ersten Lektion!
*Tunator* bietet eine Reihe von verschiedenen **Lektionen**. Die Lektionen können im *grauen Bereich* am oberen Bildschirmrand ausgewählt werden.
Oder drücke einfach den nachfolgenden Knopf, um die erste Lektion zu starten.

`/*-----------------------------------------------------------------------------------------*/ , es:`
`,
		},


		"lesson-title-WHAT-NOTE-1": {				// ##########################################################################################################################################
			en: "1. What note is it?",
			de: "1. Welche Note ist das?",
			es: "",
		},
		"lesson-WHAT-NOTE-1": {
 /*-----------------------------------------------------------------------------------------*/   en:`

### Sing a tone, try to find your "personal" tone.

IMG[[img/male-singer-portrait-silhouette.jpg|width:300px]]
Your personal tone is the most "natural" tone that your body wants to produce.
Raise its pitch and lower it so that you feel the "center" of your naturally preferred tone.

*Tunator* detects its pitch and displays the name of the correspondig note in the gray area.
**Remember the name of your personal tone**.

You should also think of a song that starts exactly with that tone.
Thinking of that song will help you to find your personal tone again and again.

* Is your personal tone a "Bb/A#"? Then you may find it easy to sing the
LINK[[https://www.youtube.com/watch?v=LQCooL_q91k&start=65|Prisoner's Choir of Nabucco]].
It begins with the sequence **§a#-g#-f#-c#-c#'-c#'§**. But these are rather strange notes...
You better look for a different song ;-)
* Maybe your personal tone is an "A". Then
LINK[[https://www.youtube.com/watch?v=A_MjCqQoLLA&start=55|Hey Jude (from The Beatles)]]
might become your song. The second (*heavy*) note is an "A". And there is an additional advantage: it starts with
a "C" - which will help you to find other notes via intervals.

After you stop singing you will still see the note name (in gray color).
*Right now we are not dealing with subtle differences in pitch. We are happy if the letter does not flicker.*
*This means that you are closer than 50 ct (= 50% of a semitone) to the ideal pitch of your note.*

### Sing, whistle, blow different tones quite loud. Then calm down, close your eyes and try to reproduce your "natural tone".
Have you been successful? Did you think of "your" song beginning?
Most people do not recognize absolute pitch (see this LINK[[https://www.sciencedaily.com/releases/2013/06/130611122011.htm|article]]).

If you tell someone to sing a **C** he will not know what to do.
But if you are able to reproduce one single tone and you know its note name you have a stable platform for the identification
of other tones because you can use intervals that refer to your principal tone.

Many people have a basic understanding of intervals (relative pitch). Also, recognizing intervals can be trained.
Let us start from your personal tone and sing a **C**

### Start with your principal tone and change pitch until you have a **C**
Learn to understand the interval which takes you from you personal tone to the **C**
If your naturally preferred tone was an **A** for example, you must go up a minor third from there to reach the 'c'.


### Try to produce a stable **C**. Avoid **C#** or **H** (**B** in English notation).

Again, try several times with closed eyes. Can you reproduce the **C** even if you made some wild noise in between?

### Click the checkbox in the green area which is called "tell me" and sing again.

If you keep the note stable enough over some time (=for more than one second) the speakers will tell you the name
of the note. You should use (open) headphones from here on to avoid acoustic feed-back.

### Practice with closed eyes until you can sing (or play) **C - E - G**  ( = a simple major triple chord)
You should *hear all three note names spoken.* If you cannot hear a note's name do not open your eyes.
Instead try to shift your pitch a little bit up or down until you hear the name being spoken. Remember such corrections.

### Aim to produce the same three notes in other sequences, like **G - E - C** or **E - G - C**
`/*-----------------------------------------------------------------------------------------*/ , de:`
### Sing einen Ton, versuche deinen "persönlichen" Ton zu finden.

IMG[[img/male-singer-portrait-silhouette.jpg|width:300px]]
Dein persönlicher Ton ist der "natürlichste" Ton, den dein Körper erzeugen will.
Erhöhe und senke die Tonhöhe mehrfach, bis du das "Zentrum" deines natürlichsten (bevorzugten) Tons spürst.

*Tunator* erkennt die Tonhöhe und zeigt den Namen der entsprechenden Note im grauen Bereich an.
**Merke dir den Namen deines persönlichen Tons**.

Du solltest dir auch einen Song vorstellen, der genau mit diesem Ton beginnt.
Die Erinnerung an diesen Song wird dir helfen, deinen persönlichen Ton immer wieder zu finden.

* Ist dein persönlicher Ton ein "Bb/A#"? Dann ist es vielleicht einfach für dich, den Anfang des
LINK[[https://www.youtube.com/watch?v=LQCooL_q91k&start=65|Gefangenenchors aus Verdis Nabucco]]] zu singen.
Er beginnt mit der Tonfolge **§a#-g#-f#-f#-c#-c#'-c#'§**. Aber das sind ziemlich seltsame Noten, oder?
Du suchst vielleicht besser nach einem anderen Lied ;-)
* Ist dein persönlicher Ton ein "A"? Dann könnte
LINK[[https://www.youtube.com/watch?v=A_MjCqQoLLA&start=55|Hey Jude (von den Beatles)]]
dein Lied werden. Die zweite (*schwere*) Note ist ein "A". Und es gibt noch einen weiteren Vorteil:
Der Song beginnt mit einem "C" - das dir helfen wird, andere Noten über Intervalle zu finden.

Nachdem du aufgehört hast zu singen, siehst du immer noch den Namen der Note (in grauer Farbe).
*Im Moment befassen wir uns nicht mit subtilen Unterschieden in der Tonhöhe. Wir freuen uns, wenn der Notenname nicht flackert.*
*Das bedeutet, dass du dich näher als 50 ct (= 50% eines Halbtons) an der idealen Tonhöhe deiner naürlichen Note befindest.*

### Sing, pfeife oder spiele verschiedene Töne ganz laut. Dann beruhige dich, schließe die  Augen und versuche, wieder deinen "natürlichen Ton" zu singen.
Warst du erfolgreich? Hast du an "dein" Lied gedacht?
Die meisten Menschen erkennen die absolute Tonhöhe nicht (siehe diesen
LINK[[https://www.sciencedaily.com/releases/2013/06/130611122011.htm|Artikel]]).

Wenn du jemandem sagst, dass er ein **C** singen soll, wird er nicht wissen, was er tun soll.
Aber wenn du in der Lage bist, einen einzelnen Ton zu reproduzieren und den Namen der Note kennst, hast du
eine stabile Plattform für die Identifizierung von anderen Tönen, weil du Intervalle verwenden kannst,
die sich auf deinen persönlichen Ton beziehen.

Viele Menschen haben ein grundlegendes Verständnis von Intervallen (relative Tonhöhe).
Auch kann das Erkennen von Intervallen trainiert werden.
Lass uns von deinem persönlichen Ton ausgehend ein **C** singen.

### Beginne mit deinem persönlichen Ton und ändere die Höhe, bis du ein **C** hast.
Lerne das Intervall zu verstehen, das dich von deinem persönlichen Ton zum **C** führt.
Wenn dein natürlich bevorzugter Ton zum Beispiel ein **A** war, musst du von dort aus eine kleine Terz nach oben gehen,
um das **C** zu erreichen.

### Versuche, ein stabiles **C** zu erzeugen. Vermeide das **C#** oder das **H** (**B** in englischer Schreibweise).

Versuche es mehrmals mit geschlossenen Augen. Kannst du das **C** reproduzieren,
auch wenn du zwischen durch wilden Lärm produziert hast?

### Klicke auf das Kontrollkästchen im grünen Bereich, das "tell me" heißt, und singe erneut.

Wenn du die Note über einen längeren Zeitraum (=für mehr als eine Sekunde) stabil genug hältst,
wird ihr Name über den Lautsprecher angesagt.
Du solltest von nun an (offene) Kopfhörer verwenden, um akustische Rückkopplungen zu vermeiden.

### Übe mit geschlossenen Augen, bis du einen einfachen Dur-Dreiklang singen kannst: **C - E - G** .
Du solltest *alle drei gesprochenen Notennamen hören.* Wenn du den Namen einer bestimmten Note nicht hören kannst,
öffne nicht die Augen. Versuche stattdessen, deine Tonhöhe ein wenig nach oben oder unten zu verschieben, bis du den Namen hörst.
Präge dir solche Korrekturen gut ein.

### Dein Ziel ist es, die gleichen drei Noten in anderer Reihenfolge zu erzeugen, wie etwa **G - E - C** oder **E - G - C**.
`/*-----------------------------------------------------------------------------------------*/ , es:`
`,
		},


		"lesson-title-WHAT-NOTE-2": {				// ##########################################################################################################################################
			en: "2. What note is it, precisely?",
			de: "2. Um welche Note handelt es sich genau?",
			es: "",
		},
		"lesson-WHAT-NOTE-2": {
 /*-----------------------------------------------------------------------------------------*/   en:`
<h4>Play or sing your preferred tone!</h4>
Below the note name in the gray box you now see the deviation (in cents) from the correct pitch.
The numbers can change quite fast. It is not easy to keep a tone absolutely stable.
<p>
<h4>Click on the timeline symbol (third icon in the menu)</h4>
You will see a large grid in the center of the screen which shows how your pitch changed over time.
Make another sound and you will see the timeline move.
<p>
Note the small box at the right end of the menu. It allows you to change the vertical resolution
of the timeline and the degree of details ist shows. By default it highlights the current note and shows
a thick red line which is a smoothed average value of your pitch. You can see more details or you can simplify
the presentation.
<p>
You can resize the window height of the timeline grid by dragging its BOTTOM RIGHT CORNER up or down.

<h4>Analyse your tone!</h4>

Did you start your note with a "t" or stop it with your tongue?
Try to sing without attack (i.e. only on the air, without using your tongue at the beginning)
and do not stop your note with the tongue. Just take your breath away and keep pitch.

<img style="float:right" src="img/glitches.png">
The example at the right shows the note "c" being played (major gray block with thick red line and blue dashes).
The blue dashes show the exact pitch every 50 msec. The thick red line is a smoothed average. It follows lazily the blue dashes.
<p>
<ol>
<li>Initial glitch: The note was started too low: effectively an "h" ("b" in English) was produced instead of a "c".
<li>The pitch entered the note from its bottom (lower part of the gray box, -50 cent .. -10 cent).
<li>The pitch stabilized near the center. It was a little too low in general (-10 cents). Now the blue dashes are above
and below the red line which is almost horizontal.
<li>Finally the pitch jumped up by ~ 60 cents so that even the next higher note was touched for a very short moment (thin gray area
at c# level).
<li>The note ended above its correct pitch, close to the next higher note. Probably the tension of mouth, lips or breast
had increased while the flow of air stopped.
</ol>
<div style="clear:both"></div>
<ul>
<li>If you see glitches at the beginning of your note: Create an imagination of the note before you start to produce the tone!
<li>If you see glitches at the end of your note: Take away breath without altering the attitude of your lips or chest.
</ul>

<h4>Produce a sequence of the same note!</h4>
<img style="float:right" src="img/sameTone.png">
Can you do better than this example?
<div style="clear:both"></div>

<h4>Play a chord sequence up and down, like c - e - g - e - c !</h4>
<img style="float:right" src="img/ceg-1.png">
Here is another example:
<ol>
<li>The first note was started without sufficient tension (initial bottom glitch)
<li>Altough the "e" looks very low the <i>relative</i> pitch (interval: major third) was not so bad because the initial note
had already been significantly too low.
<li>The "g" looks "ok" - although it is more like the peak of a mountain than a stable platform. But the interval from the
very low "e" to the average "g" was too large.
<li>Good news with the "e" on the downwards path: it is exactly the same (wrong) "e" as its brother in the climbing phase.
The short red dot at the beginning of the note is not so crucial. Small transitory glitches can not always be avoided (when singing).
<li>The final note is still too low but a little bit better than the initial "c". It often happens that in a sequence like
"c-e-g-e-c" the final note is slightly higher than the first note. <i>Tunator</i> shows you what happened and makes you aware
of such typical problems.
`/*-----------------------------------------------------------------------------------------*/ , de:`
`/*-----------------------------------------------------------------------------------------*/ , es:`
`,
		},


		"lesson-title-TRANSPOSITION": {				// ##########################################################################################################################################
			en: "3. The mysteries of transposition",
			de: "3. Das Geheimnis des Transponierens",
			es: "",
		},
		"lesson-TRANSPOSITION": {
 /*-----------------------------------------------------------------------------------------*/   en:`

If you sing a tone with ~ 130 Hz <i>Tunator</i> will tell you that it is a "c". Go ahead and try it out!
A tone of ~ 260 Hz would also be detected as a "c", but one octave higher.
<p/>
If a composer wants an oboe to play a "c" he will put a black oval into the THIRD SPACE of a standard note system.
Or he might place the oval ON THE FIRST LINE BELOW the system if he wants the "c" to be one octave lower.
Musicians all over the world have learnt that an oval in the the third space or on the first line below the system
is called a "c". If an oboist sees a "c" he will use a certain tension of his lips (embrochure)
and a certain finger setting and if everything is fine his instrument will produce a frequency of ~260Hz (or ~520 Hz).
<p/>
If an oboe and a trumpet player read and play the same written "c", however, their instruments WILL NOT PRODUCE THE SAME TONE.
What comes out of the trumpet will be <b>two semitones lower</b>. This means that the trumpet produces a frequency
of only ~230 Hz. A trumpet is said to be a "transposing" instrument. The transposition is defined
as THE DIFFERENCE IN SEMITONES between the sound that comes out of the instrument and the note
which the player reads and "plays". If the notated note is higher than the sound an instrument transposes downwards.
If the sound is higher it transposes upwards.
<p>
Luckily, many instruments (like a harp, a violin, a piano, an oboe, a flute or a guitar) are non-transposing.
Formally speaking you could say that they have a transposition of 0 semitones. Which means that their sound
corresponds exactly to the written notes.
<p/>
A typical Bb-trumpet has a transposition of -2, a french horn has -7, a saxophone could have -9 or -2 depending on
its type. Very high instruments like the piccolo flute transpose by +12 semitones. Often a note name is used to describe
the transposition characteristic of a an instrument. The note used corresponds to the INTERVAL starting from C.
Thus, a "c" means no transposition, a "Bb" means -2 semitones, an "F" means -7 semitones, an "Eb" is -9.
<p/>
If a composer wants the same physical frequency to be produced by instruments with different transpositions he must
COMPENSATE for their individual transpositions.
This means, that he has to write a "d" for a Bb-instrument (like the trumpet) and a "g" for "F"-instruments
like the English Horn or the French Horn. In addition he could use different "clefs" -- but that is another story.
<p/>
If a conductor asks his trumpet players to play a "c"-sound they will have to think of a written "d" to produce the
expected tone. If some of the players are in doubt what to do the conductor might tell them: "play your notated "d"!".

<h4>Now change the transposition of <i>Tunator</i> and get confused ;-)</h4>
The green box next to the detected note (which currently shows "==") allows you to change the transposition.
Select "Bb notation" and sing a tone with <b>~ 260 Hz</b>. Although you are singing the same tone as before
the note will now be called a "d" by <i>Tunator</i>.
<p/>
If you are playing a transposing instrument <i>you should use the transposition settings</i>. Thus you tell <i>Tunator</i>
to name the notes in the "language" you are familiar with.

<h4>Base tone of an instrument</h4>
Wind instruments have a so-called base tone. This is the frequency that corresponds to the length of the
instrument (all flaps closed, no valves activated). Sometimes (but not always)
the natural name of the note for this frequency defines the transposition of that instrument, i.e. the base
note is called "c" in scores for this instrument. For example a trumpet being played without
any buttons pressed produces a "Bb". This note is written as a "c" in music scores for trumpets.
<p/>
A score for a french horn is written in "F" and indeed, the longer part of a double french horn
has an "F" as its base tone. The shorter part, however, has a "Bb" as its base tone. But horn players are trained
to read in "F", regardless which part of their double horn they are using. In fact they often switch between the
two parts of their instrument because some tones sound more beautifully on one of them.

<h4>Notations with the "wrong" transposition</h4>
Sometimes a musician will be confronted with a score that does not match his reading habits.
A clarinet player might look at a score for "clarinet in A" but he wants to play with his standard Bb-clarinet.
The composer wrote the score for A-clarinet (transposition = -3) so he used a "G" when he wanted the sound of an "E".
On a "Bb-clarinet" playing a "G" would produce an "F", however. So the player has to subtract one semitone
from all written notes while he is playing. The ability to do this is called "transposing".
Being able to transpose is quite useful for some instruments, most prominently for french horn players
as (for historical reasons) they often get notes in various transpositions. On the other hand, a flute player
will probably never have the necessity to transpose in his whole life because the flute is a "C"-instrument
and all notes for flute a written in "c"-notation.

<h4>Reference frequency</h4>
You may also want to adjust the base reference frequency ("a") from its default value (443 Hz) to some other value
like 440 Hz.
`/*-----------------------------------------------------------------------------------------*/ , de:`
`/*-----------------------------------------------------------------------------------------*/ , es:`
`,
		},


		"lesson-title-GENERATOR": {					// ##########################################################################################################################################
			en: "4. The sound generator",
			de: "4. Der Sound-Generator",
			es: "",
		},
		"lesson-GENERATOR": {
 /*-----------------------------------------------------------------------------------------*/   en:`

<i>Tunator</i> has a powerful sound generator. Let´s have a look at it!

Currently the generator is playing a pure sine wave with 263.41 Hz.
Relative to our default reference of 443 Hz a frequency of ~260 Hz is a tempered "c".
The frequency and the name "c" are shown in the
<span style="background:#ffc">yellow box (generator control area)</span>.
<br/>
Click on the wave symbol <b>[~]</b> in the yellow area if the sound starts bothering you.
If you stop the generator the "c" will be shown in <i>parenthesis</i>.
<p/>
<i>Tunator</i> detects the sound and shows the result: The note "c" as a large letter in the gray area and
the measured frequency (263.3	 Hz .. 263.6 Hz)
are displayed in the <span style="background:#cfc">green box (detector area)</span>.
The measured frequency may deviate a little bit from the generated
frequency - but the error is so small that it can be neglected.
<p/>

<h4>Look at the oscillogram</h4>
It shows a time span of ~ 43 msec (= 2048 / 48000 seconds) in gray color. A magnified version (~ 10 msec)
is shown in solid black. A frequency of ~260 Hz has a period of ~ 4msec. Therefore we see ~ 2,5 cycles
of the sine wave in black color.
The current note (c) is highlighted with three red stars after the first wave in black color.

<h4>Now change the frequency in steps of semitones or in finer steps
	using the "++","+","-","--" buttons in the yellow area</h4>

Watch the three red starts shift. Watch how the name of the detected note changes. If you use "+" or "-" you will
see that the deviation in "cents" in the gray area with the note letter also changes.
Open the timeline view if you like and watch the change of pitch over time!
In the yellow generator control area you will see tilde symbols around the note: "~c~".
They indicate that the frequency produced by the generator "almost" matches the shown note.
Instead of using the "+"/"-" you can also enter a desired frequency directly. If you hae the timneline
open you can click somewhere in the time line to change the generator frequency in half-tone steps.<p/>

<h4>Try different signal shapes (wave types)</h4>
Use "triangle" instead of "sine" and listen how the sound changes although the note and the pitch are still the same.
The acoustic spectrum of a sound is defined by its harmonics.
<p/>
Click on "custom" and on the button with the triple wave symbol <b>[&apid;]</b> directly below it.
This opens a group of sliders which control the intensity and the phase of the first eight harmonics.
The custom wave type sounds similar to an organ because it is a "rich wave form" composed of the base tone and
some overtones (harmonics, mutiples of the base tone).
Feel free to play with the sliders: See and listen how the sound changes. The differences will be more remarkable
at lower notes. In principle it is possible to produce any desired shape. But the mathematics behind (Fourier synthesis)
are not easy to understand.
<p/>
For the remaining part of this lesson we recommend to use the "custom" wave type.

<h4>Try the "vibrato"</h4>
By default the generator is in "straight mode" which means that it plays a steady tone of constant frequency.
The selection box for the generator mode offers lots of other options - which we will use in later lessons.
For the moment, just try "vibrato". Now the frequency changes periodically (about 4 times per second)
around the central value of a "c" (by +/- 12 cts). Switch back to "straight mode".

<h4>Look at the chord section. Select "I + III" instead of "I"!</h4>
By default the generator plays a single tone. But it can also play two or more notes together (chords).
ROMAN numbers stand for PURE CHORDS (=JUST INTONATION) whereas ARAB NUMBERS stand for TEMPERED CHORDS.
If you select "I+III" (=base tone and a major third interval above) the two tones will have a frequency ratio
of exactly 3:4. If you select "1+3" the ratio will be 1:1.2599 which is almost the same.
But not exactly. You can hear the difference quit well if you switch between these chords.
In case you ever heard that <b>a major third interval should be played a "little smaller"</b>
than normal - this is the explanation. The diference between 1.26 and 1.25 (less than 1%) may not sound large.
But it is clearly perceivable by the human ear. If you try "i+iii" (third minor in just intonation) and compare it
to 1+3_ you will notice a similar difference - but in the other direction: a minor third should be played
somewhat "larger".
<p/>
Try also with I+III+V and 1+3+5. The perfect intonation (roman numbers) sounds much clearer whereas
the tempered intonation produces a "spatial" effect which in essence is some kind of "vibrato" BETWEEN the tones
of the chord. It is a matter of taste and hearing habits whether one prefers the perfect integer ratios
or the tempered chord. When playing with wind instrument most people like to produce just intonation.
<p/>
Listen to 1+3+5 carefully. Can you hear how the highest note fades away and returns almost every second?
The energy of the three waves gets added and due to the minimal differences in their frequency ratio they can
partly extinguish each other from time to time. You can see this effect happen in the oscillogram:
the amplitude and the shape of the waves change periodically, they seem to "breath".
`/*-----------------------------------------------------------------------------------------*/ , de:`
`/*-----------------------------------------------------------------------------------------*/ , es:`
`,
		},


		"lesson-title-COMPARE": {					// ##########################################################################################################################################
			en: "5. Comparing two tones",
			de: "5. Zwei Töne miteinander vergleichen",
			es: "",
		},
		"lesson-COMPARE": {
 /*-----------------------------------------------------------------------------------------*/   en:`

When musicians play together they have to tune their instruments. Otherwise the sound would be rough and unsatisfactory
when they play together. "Tuning" means that an "a" shall match exactly a certain reference frequency on all instruments.
Ideally all other notes on the different instruments will then also be "in tune". We will see later that this is
not the case in reality. Nevertheless it is a good idea to have at least ONE note that sounds in tune on all
instruments.
<p/>
By convention the "a"-sound is used for this purpose. If a group of wind instruments play together they will prefer
to use a "Bb" as a common reference note as this is the physical base tone for many wind instruments.
Which means that the players do not have to press flaps or keys/valves to produce a "Bb". If you remember what
we explained about transpositions you will have in mind that in the notation of such instruments the sounding "Bb"
will typically be written as a "c". So they will play a "c" (in their minds), effectively producing a "Bb".
F-Instruments will play a (written) "F" which means that they also produce the sound of a "Bb". A saxophone in "Eb"
will have to play a "g" to produce the "Bb". If wind instruments play together with string instruments
they tune on an "a" which means that a trumpet player thinks of a "B" ("H" in German notation), a french horn player
thinks of an "E".
<p/>
The reference frequency for an "a" is defined by the conductor;
it is chosen in a way that all instruments are capable to be tuned to that frequency. A common value
nowadays is 442 or 443 Hz.
<p/>
Many instruments change their base pitch due to physical reasons when their temperature changes.
Typically their pitch becomes higher when they get warmer. The tension of strings also changes with temperature
and over time.
A cold wind instrument becomes warmer by the flow of the breath of the player.
On a hot stage the difference might even be a semitone! This means that it does not make much sense to
tune a set of "cold" instruments.
<p/>
When players tune their instruments they listen to the reference tone (normally being played by the oboe),
produce their own tone for a short moment and try to decide very quickly which one is lower or higher.
This needs some practice. Of course you can - and should - repeat the process if you noticed a difference
but generally speaking players should be very fast in detecting pitch differences.
As soon as they got their instrument correctly tuned they
should remain silent so that the other players can do their job. Typically there is a rule in an orchestra
for the sequence of the instrument groups during the tuning process. Many orchestras start with wind instruments
(from high to low) followed by the double bass and the other string instruments. Some musicians like drummers
or harp players may use their own electronic device and do the tuning independently from the other members
of the orchestra.

<h4>Let us recognize some simple pitch differences!</h4>
Click on the <b>[~]</b> symbol in the yellow area to start the oscillator. It will produce a reference tone ("a"=443 Hz)
and after a very short pause it will produce another tone which is slightly higher or lower. After a longer pause
you will hear the next pair of tones. The reference tone will always be the same, the "deviating" tones are randomly
chosen by <i>Tunator</i>.
<p/> Close your eyes and try to decide whether the second tone is higher or lower than the reference tone. Then open
your eyes and check! You can look at the "cents" indicator below the large note name, at the frequency numbers in the
yellow area or in the green area. There is also a tiny "+" or "-" sign directly behind the "generator mode setting"
in the yellow area. The mode is currently set to "compare (easy)". Look there and you will se a small "+" or "-"
sign appear and disappear. "+" means that the second was too high, "-" means it was too low. By the way, you can also
use the timeline to "see" th epitch differences.
<p/>
This lesson was "easy" because:
<ul>
<li>the reference tone was always the same
<li>the differences were relatively large
<li>the sound character (harmonics) was identical for both tones
<li>there were no octave changes involved.
</ul>
In reality, however, you have to consider all these aspects.

<h4>Try the other three comparison modes: medium, difficult, very hard!</h4>
<ul>
<li><b>compare (easy)</b>: stable reference tone, large pitch differences, identical sound, same octave.</li>
<li><b>compare (medium)</b>: various reference tones, medium size pitch differences, different sound (harmonics),  same octave.</li>
<li><b>compare (difficult)</b>: various reference tones, small pitch differences, different sound, tones may be one octave apart.</li>
<li><b>compare (very hard)</b>: various reference tones, tiny pitch differences, different sound, tones may be up to two octaves apart.</li>
</ul>

You should get all exercises right at "medium level" and <b>most of them</b> in the "difficult" setting.
The "difficult" setting is more or less what you experience in a real instrument tuning session during
a rehearsal or before the concert.
<p/>
If you have a hit rate of 75% in the "very hard" level you should feel proud!

<h4>Find the octave</h4>
Switch the generator mode to "straight" and change its frequency to an "a" (443 Hz).
We are going to find the LOWER OCTAVE for that tone.
Click on the "auxiliary generator button" <b>[≈]</b> in the yellow area. This produces a second tone which
you can freely control. At the beginning its pitch is slightly above the main generator´s pitch.
<p/>
As soon as you HOLD DOWN the arrow button next to it FOR SOME TIME its pitch will go down and you can
hear the difference. Stay on the button until you think that you have more or less the LOWER OCTAVE.
Then FINE-ADJUST the tone of the auxiliary generator with the large slider next to the two arrow buttons.
<p/>
Once you think that you got the lower octave right PUT YOUR MOUSE OVER the button with the question mark!
As a response you will see the interval and the deviation in cents. Placing the mouse over the
<b>[≈]</b> button will give you the frequency of the aux generator in Hz.
<p/>
Try the octave upwards as well. You should be as close as 2..3 cents to the correct value. Pay attention
to the "fading effect" which you start to hear when you are close enough to the correct value.

<h4>Find partial tones of a chord</h4>

Stop the auxiliary generator. Switch the main generator to a "c" (263 Hz) and select the chord I-III-V
(which equals to "c-e-g"). Now activate the auxiliary generator again and move its frequency UPWARDS
until it matches the "e". Check how well you did and go further up to the fifth ("g") and then to the octave
("c" with 527 Hz).
<p>
It is rather easy to match the "e" but the "g" is a little bit harder. Sometimes you will get fooled into
the sixth ("a" instead of "g").

<h4>Follow your neighbor with drifting tones</h4>

Sometimes when two players hold a tone "unisonso" for a long time one of them may drift away a little. I such cases
the other player should follow him to keep the tone perfectly sounding together. Use the "drifting" generator
mode to simulate thios situation. You can open the timeline to see what happens. Try to notice the small
pitch variations of <i>Tunator</i> as fast as possible, decode whether you have to go up or down to follow
and try to match your tone with the changed tone! You can use a simple tone or a chord for this training.

<h4>Keep brave in wild environment</h4>
Select "major scale slow 1 octave" at the generator control, use a sept chord "I+II+V+VII" and play a constant tone.
Watch carefully for the monents when one of the tones form the generator matches your tone!
Use the timeline to check if you can withstand the tendency to get drawn away after those moments.
The most crucial moment is when the base tone of the scale goes down, matches your tone and then goes
a semitone lower. Keep your tone!
<p/>
If you like you can play the octave movement together with the generator, with your tone being !,II,V,VII or VIII
or even with II or IV (which is not easy to do). You can also start with the octave going in opposite direction.
Always watch out for the "matching moments" and if there is no match keep your tone bravely!
`/*-----------------------------------------------------------------------------------------*/ , de:`
`/*-----------------------------------------------------------------------------------------*/ , es:`
`,
		},


		"lesson-title-ASSISTED": {					// ##########################################################################################################################################
			en: "6. Assisted tone playing",
			de: "6. Töne spielen mit Unterstützung",
			es: "",
		},
		"lesson-ASSISTED": {
 /*-----------------------------------------------------------------------------------------*/   en:`

<h4>Put on a headset, sing or play a tone and try to stay precisely "in tune"</h4>

The green "intonation" button in the left area of the menu activated "assisted playing". This means
that <i>Tunator</i> now listens to the microphone; as soon as it detects a tone it <b>starts playing
the correct note</b> for this frequency.
<p/>
Through the headphones you hear the correct tone from <i>Tunator</i> and directly you hear your own sound -
adjust the volume of the headphones so that you can hear both sounds equally well.
<p/>
In the previous lessons you trained your ear to detect small differences in pitch. Now it is your tasks
to minimize the pitch difference by adjusting the frequency of your tone. We have also activated the "tell me"
checkbox. So you will hear the note name once you kept the difference small enough for some time.

<h4>Sing octave intervals or simple interval sequences!</h4>
Set the coloring mode of the timeline from "smoothed" to "simple". Sing octave intervals and try to minize
the percentage of false notes. Listen to the note being played and adjust your pitch.
A good sequence for practicing is "I -V -VIII I -i I". Starting from f (for example) this would mean "f-Bb-F-f-e-f".

<h4>Assisted interval playing</h4>
Choose one of the chords that DO NOT start with a "I", for example "+III". Now, when you sing or play <i>Tunator</i>
will play a tone which forms the mentioned interval with your tone (when played correctly). Let us say you sing or
play a frequency of 258 Hz - which is a very low "c" (-30 cts). If "+III" is chosen you will hear a tone which is
a pure major third above a perfect "c". It will be an "e" but slightly below the perfect chromatic "e" (331.9 Hz) because
it must have an integer ratio of 5:4 compared to a perfect "c" (263.4 Hz). So the tone you hear has a frequency of
263.4 Hz * 5 / 4 = 329.2 Hz. If you now aim for playing the correct "d" you will hear the consonance of a perfect (pure)
major third.
<p>
There are also triple chords available where one part is misssing. Especially useful is "-III +iii" which means that
we have a major triple chord where your note functions as the middle tone: The generator plays a pure major third
below your tone and a pure minor third above. When you look at the timeline you see what happens. Make sure that the
timeline window is high enough or use a small vertical resolution so that you see a range of one octave.

<h4>Free interval playing</h4>
This time the generator will play a constant chord and we will try to match one of the tones or add a missing tone.
Choose straight mode and a chord of "I+V" and SWITCH OFF "intonation" and SWITCH ON the microphone icon. You
hear a perfect fifth and now you can place your tone in relation to these tones. You can try to match the base tone,
then the fifth and finally you can place a minor third, a major third or add the octave. If you are ambitious
you could also try for a "tritone".
<p>
You could start with "c-g" being played by <i>Tunator</i> and you play or sing "c-g-c-e-c-eb-g-c'-c". The timeline
gives you optical feedback how good your intonation was. Then use "++"/"--" OR CLICK SOMEWHERE INTO THE TIMELIEN GRID
to choose another generator base tone.
Depending on your instrument and your capability to compensate for the weekness of some tones you will
observe greater deviations when you switch from "c-g" to "c#-g#" for instance.
`/*-----------------------------------------------------------------------------------------*/ , de:`
`/*-----------------------------------------------------------------------------------------*/ , es:`
`,
		},


		"lesson-title-SAMPLING": {					// ##########################################################################################################################################
			en: "7. Using sound samples",
			de: "7. Klangmuster benutzen",
			es: "",
		},
		"lesson-SAMPLING": {
 /*-----------------------------------------------------------------------------------------*/   en:`

<i>Tunator</i> can extract a periodic pattern from a sound sample and use it
for looped replay or even for configuring the oscillator.

<h4>Sing a tone and click on "1" in the blue sampling control area.</h4>
The oscillogram gets frozen and the "loop" button becomes yellow to indicate that there is a stored sample
available. Now press on "loop" and you will hear a steady repetition of the sound which you had produced.
<br/>(Note: the buttons "n","all" and "noise" are experimental and of little practical use at the moment).

<h4>Shape the oscillator</h4>
While the loop is playing open the generator (yellow control area) and press the <b>[&perp;]</b> button.
Now the harmonics are set in way that the generator (nearly) reproduces the sound from the loop.
If you click on the oscillator button <b>[~]</b> you can hear and see the wave form produced by the generator.
Pressing "loop" again lets you compare the generator tone to the recorded loop sample.
<p/>
Now that you have the tone in the generator you can change its pitch as you like, use it for chords etc.
You will notice that chords may sound strongly vibrating sometimes. A chord like "1+3+5" may sound more
comfortable than "I+III+V" in those cases.
`/*-----------------------------------------------------------------------------------------*/ , de:`
`/*-----------------------------------------------------------------------------------------*/ , es:`
`,
		},


		"lesson-title-RHYTHM": {						// ##########################################################################################################################################
			en: "8. Rhythmic exercise",
			de: "8. Rhythmus üben",
			es: "",
		},
		"lesson-RHYTHM": {
 /*-----------------------------------------------------------------------------------------*/   en:`

... text missing ...
`/*-----------------------------------------------------------------------------------------*/ , de:`
`/*-----------------------------------------------------------------------------------------*/ , es:`
`,
		},


		"lesson-title-MORE": {						// ##########################################################################################################################################
			en: "9. (more to come)",
			de: "9. (wird noch ergänzt)",
			es: "",
		},
		"lesson-MORE": {
 /*-----------------------------------------------------------------------------------------*/   en:`

... more to come ...
`/*-----------------------------------------------------------------------------------------*/ , de:`
`/*-----------------------------------------------------------------------------------------*/ , es:`
`,
		},


		"lesson-title-USER-MODE": {					// ##########################################################################################################################################
			en: "Let me use <i>Tunator</i> on my own!",
			de: "Die Komponenten von <i>Tunator</i> direkt benutzen",
			es: "",
		},


		"lesson-title-ABOUT": {						// ##########################################################################################################################################
			en: "About <i>Tunator</i>",
			de: "Über <i>Tunator</i>",
			es: "",
		},
		"lesson-ABOUT": {
 /*-----------------------------------------------------------------------------------------*/   en:`
*Tunator* is open source, hosted on [github](https://github.com/algorithmixx/tunator)

*Tunator* was created by Gero Scholz, Germany, Bad Nauheim.

*Tunator* is available online under [followthescore.org](https://followthescore.org/train/tunator)

If you want to add more lessons or contribute translations contact me at gero.scholz(at)gmail.com.

January 2019
`/*-----------------------------------------------------------------------------------------*/ , de:`
*Tunator* ist Open Source, gehostet auf[github](https://github.com/geschole/tunator)

*Tunator* wurde von Gero Scholz, Deutschland, Bad Nauheim, entwickelt.

*Tunator* ist online verfügbar unter[followthescore.org](https://followthescore.org/train/tunator)

Wenn du weitere Lektionen hinzufügen oder Übersetzungen beisteuern möchtest,
kontaktiere mich unter gero.scholz(at)gmail.com.

Januar 2019
`/*-----------------------------------------------------------------------------------------*/ , es:`
`,
		},

	}

}
