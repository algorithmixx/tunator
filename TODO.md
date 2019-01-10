<h1>To Do</h1>

### Karaoke

Offer small pieces (musical scores) which the user shall play. Optional play along with a given melody.
*Tunator* listens and gives feedback afterwards.
20 seconds are sufficient, probably. *Tunator* calculates an overall score and mentions the biggest problems.

Technically one could integrate lilypond notation for melody definition, create a score from the .ly failed
and a midi file.

### midi

*Tunator* should be able to play midi tunes using soundbanks. There are good libaries for this available.

### chord progressions

*Tunator* should play a series of chords where teh user's tone has different functions and must be intonated
differently (assuming that the resp. base tone of each chord is correct in a tempered scale).

### distractions

*Tunator* could play various notes around the user's tone (+/+ 200 cents in arbitrary distances).
The user must try to keep his tone stable and gets a score rating for his stability after 10 seconds.

### imitate the user
*Tunator* could replay what it heard from the user - using the user´s pitches and the sound generator.
This would not be a "record and replay" but a "listen and reflect" approach. Maybe this way the user can
hear more clearly where he has had problems.

### volume
*Tunator* should use its information on loudness (signal energy). It could teach the user to play a
clean diminuendo/crescendo observing volume and pitch at the same time.
The musician can learn to compensate for pitch changes caused by volume changes.

### offer Midi chords with mixed instruments

e.g. for wind quintet
