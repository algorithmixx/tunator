\version "2.10.33"
	#(set-default-paper-size "a5")
	\paper { 
	   indent = 0\cm} 
	
	pause 	= { c'''8 r8 c'''8 r8 c'''8 r8 c'''8 r8 }
	
	melody = { \pause { c' 4 d'  r2 } { c' 4 f'  r2 } { c' 4 f'  r2 } { c' 4 b'  r2 } }
	
	% create pdf score
	\score {
		\layout {
			top-margin = 0\mm
			left-margin = 30\mm
			head-separation = 0\mm
		}
		\context Staff = horn { \set Staff.instrumentName = "(F)" 
		       \clef "G"
		       \transpose c g \melody
		}

	}
	% cretae midi output
	\score  {
	        \unfoldRepeats <<

	          \context Staff= horn { \melody }
	        >>
	        \midi {
				tempoWholesPerMinute = #(ly:make-moment 100 4)
		}
	}
	