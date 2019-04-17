\version "2.10.33"
\language "deutsch"

%-------------------------------------------------------------------------------------------------- lead	
lead   = { \transpose c c' {  \partial 4 r4\pp | c8 r c r c r c r  } }
	
%-------------------------------------------------------------------------------------------------- SATB	
sopran = { c'1\mf	| c'	| c'2\f h2	| c'1\mp	|| g\mf	| a		| a2\ff g	| g1\mp	| }
alto   = { g1\mf	| a	| g2\f g2	| g1\mp		|| e\mf	| f		| f2\ff f	| e1\mp	| }
tenor  = { e1\mf	| f	| e2\f d2	| e1\mp		|| c\mf	| c		| c2\ff h	| c1\mp	| }
bass   = { c1\mf	| f	| g2\f g2	| c1\mp		|| c\mf	| f2\ff e	| d2\ff g2	| c1\mp	| }

%----------------------------------------------------- create pdf score
#(set-default-paper-size "a6" 'landscape)
\paper {
    indent = 0\cm
} 
\score {
    \layout {
	top-margin 	= 0\mm
	left-margin 	= 30\mm
	head-separation	= 0\mm
    }
    <<
        \new Staff { \clef "G"	 \transpose c c'' \sopran	}
        \new Staff { \clef "G"	 \transpose c c' \alto		}
        \new Staff { \clef "G"	 \transpose c c' \tenor	}
        \new Staff { \clef "F" \transpose c c  \bass		}
    >>
}

%--------------------------------------------------- create midi output
#(define (myDynamics dynamic)
    (if (equal? dynamic "ffff"	)  1.0
    (if (equal? dynamic "fff"	)  0.9
    (if (equal? dynamic "ff" 	)  0.8
    (if (equal? dynamic "f"  	)  0.7
    (if (equal? dynamic "mf" 	)  0.6
    (if (equal? dynamic "mp" 	)  0.5
    (if (equal? dynamic "p"  	)  0.4
    (if (equal? dynamic "pp" 	)  0.3
    (if (equal? dynamic "ppp"	)  0.2
    (if (equal? dynamic "pppp" )  0.1
    (default-dynamic-absolute-volume dynamic)
    ))))))))))
)

\score  {
    <<
        \new Staff {
            \set Staff.midiInstrument = #"acoustic grand"
            \set Score.dynamicAbsoluteVolumeFunction = #myDynamics
            \new Voice
            \transpose c c' {
                \lead
            }
        }

        \new Staff {
            \set Staff.midiInstrument = #"flute"
            \set Score.dynamicAbsoluteVolumeFunction = #myDynamics
            \new Voice
            \transpose c c'' {
                r1 r4 \sopran
            }
        }
        
        \new Staff {
            \set Staff.midiInstrument = #"clarinet"
            \set Score.dynamicAbsoluteVolumeFunction = #myDynamics
            \new Voice
            \transpose c c' {
                r1 r4 \alto
            }
        }
        
        \new Staff {
            \set Staff.midiInstrument = #"french horn"
            \set Score.dynamicAbsoluteVolumeFunction = #myDynamics
            \new Voice
            \transpose c c' {
                r1 r4 \tenor
            }
        }
        
        \new Staff {
            \set Staff.midiInstrument = #"tuba"
            \set Score.dynamicAbsoluteVolumeFunction = #myDynamics
            \new Voice
            \transpose c c, {
                r1 r4 \bass
            }
        }
    >>
    \midi {
        \tempo 4 = 90
        tempoWholesPerMinute = #(ly:make-moment 30 4)
    }
}
