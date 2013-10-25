Array.prototype.is = function(item) {
    return this.indexOf(item) != -1;
};
function noteFromInt(i) {
    i += 2; // 0 is C
    return String.fromCharCode(i % 7 + 65); // 65 is 'A'
}
var intervals_ = {
    "1st" : {"perfect": 0, "augmented": 1},
    "2nd" : {"diminished": 0, "minor": 1, "major": 2, "augmented": 3},
    "3rd" : {"diminished": 2, "minor": 3, "major": 4, "augmented": 5},
    "4th" : {"diminished": 4, "perfect": 5, "augmented": 6},
    "5th" : {"diminished": 6, "perfect": 7, "augmented": 8},
    "6th" : {"diminished": 7, "minor": 8, "major": 9, "augmented": 10},
    "7th" : {"diminished": 9, "minor": 10, "major": 11, "augmented": 12},
    "8th" : {"diminished": 11, "perfect": 12, "augmented": 13},
    "9th" : {"diminished": 12, "minor": 13, "major": 14},
    "10th" : {"diminished": 14, "minor": 15, "major": 16},
    "11th" : {"diminished": 16, "perfect": 17, "augmented": 18},
    "12th" : {"diminished": 17, "perfect": 18, "augmented": 19},
    "13th" : {"diminished": 19, "minor": 20, "major": 21},
    "14th" : {"diminished": 21, "minor": 22, "major": 23},
    "15th" : {"diminished": 23, "perfect": 24}
};
var intervals = {
    "1st" : {"perfect": 0},
    "2nd" : {"minor": 1, "major": 2},
    "3rd" : {"minor": 3, "major": 4},
    "4th" : {"perfect": 5, "augmented": 6},
    "5th" : {"perfect": 7},
    "6th" : {"minor": 8, "major": 9},
    "7th" : {"minor": 10, "major": 11},
    "8th" : {"perfect": 12},
    "9th" : {"minor": 13, "major": 14},
    "10th" : {"minor": 15, "major": 16},
    "11th" : {"perfect": 17},
    "12th" : {"perfect": 18, "augmented": 19},
    "13th" : {"minor": 20, "major": 21},
    "14th" : {"minor": 22, "major": 23},
    "15th" : {"perfect": 24}
};
var accidental = [1,3,  6,8,10];
var whole =     [0,2,4,5,7,9,11];
var chords = {
    "5" : [0,7],
    "maj" : [0,4,7],
    "min" : [0,3,7],
    "aug" : [0,4,8],
    "dim" : [0,3,6],
    "sus4" : [0,5,7],
    "sus2" : [0,2,7],
    
    "6" : [0,4,7,9],
    "min6" : [0,3,7,9],
    
    "dom7" : [0,4,7,10],
    "maj7" : [0,4,7,11],
    "min7" : [0,3,7,10],
    "min/maj7" : [0,3,7,11],
    "aug/maj7" : [0, 4, 8, 11],
    "aug7" : [0, 4, 8, 10],
    "min7b5" : [0, 3, 6, 10],
    "1/2 dim7" : [0, 3, 6, 10],
    "dim7" : [0, 3, 6, 9],
    "dom7b5" : [0, 4, 6, 10],
    
    "maj9" : [0,4,7,11,14],
    "dom9" : [0,4,7,10,14],
    "min/maj9" : [0,3,7,11,14],
    "min9" : [0,3,7,10,14],
    "aug/maj9" : [0, 4, 8, 11, 14],
    "aug9" : [0, 4, 8, 10, 14],
    "1/2 dim9" : [0, 3, 6, 10, 14],
    "1/2 dim/min9" : [0, 3, 6, 10, 13],
    "dim9" : [0, 3, 6, 9, 14],
    "dimb9" : [0, 3, 6, 9, 13]
};
var sharps = [];
var flats = [];
var stepIntervals = [];
for (var interval in intervals) {
    for (var quality in intervals[interval]) {
        var steps = intervals[interval][quality];
        if (stepIntervals[steps] === undefined) stepIntervals.push([]);
        stepIntervals[steps].push(quality + " " + interval);
    }
}
var note = "";
for (var i = 0; i < 12; i++) {
    if (whole.is(i)) {
        note = noteFromInt(whole.indexOf(i));
    }
    if (accidental.is(i)) {
        note += "#";
    }
    sharps.push(note);
}
var note = "";
for (var i = 0; i < 12; i++) {
    if (whole.is(i)) {
        note = noteFromInt(whole.indexOf(i));
    }
    if (accidental.is(i)) {
        note = noteFromInt(whole.indexOf(i + 1)) + "b";
    }
    flats.push(note);
}
var upArrowKey = 38;
var downArrowKey = 40;
$('.steps').keyup(function(code) {
    if (code.keyCode === 38) 
        $('.steps').val(new Number($('.steps').val()) + 1);
    if (code.keyCode === 40) 
        $('.steps').val(new Number($('.steps').val()) - 1);
    $('.steps_results').text(
        $('.steps').val() && stepIntervals[$('.steps').val()] ? 
            stepIntervals[$('.steps').val()].join(" & ") :
            "");
});
$('.sharps').text(sharps);
$('.flats').text(flats);
$('.stepIntervals').text(JSON.stringify(stepIntervals, null, ' '));
$.each(chords, function(item) {
    $('.chords').append($('<option>'+item+'</option>'));
});
$('.chords').change(function() {
    var chosen = chords[$('option:checked').val()];
    var fout = "";
    var sout = "";
    var iout = "";
    var space = "";
    var ispace = "";
    $.each(keyboard, function(i) {$(keyboard[i]).removeClass('pressed');});
    for (var i = 0; i < chosen.length; i++) {
        fout += space + flats[chosen[i] % flats.length];
        sout += space + sharps[chosen[i] % sharps.length];
        iout += ispace + stepIntervals[chosen[i]];
        space = " ";
        ispace = " - ";
        $(keyboard[chosen[i]]).addClass('pressed');
    }
    $('.with_flats').text(fout);
    $('.with_sharps').text(sout);
    $('.with_intervals').text(iout);
});
var wholeLeft = 0;
var accidLeft = 14;
var accidCounter = 0;
var keyboard = [];
var delta = 19;
for (var i = 0; i < 36; i++) {
    var key = $('<div></div>');
    if (whole.is(i % 12)) {
        $(key).addClass('key');
        $(key).css({"left": wholeLeft});
        wholeLeft += delta;
    }
    if (accidental.is(i % 12)) {
        $(key).addClass('accid');
        $(key).css({"left": accidLeft});
        accidLeft += delta;
        if (++accidCounter == 2) {
            accidCounter = -3;
            accidLeft += delta;            
        } else if (accidCounter === 0) {
            accidLeft += delta;
        }
    }
    $('.keyboard').append(key);
    keyboard.push(key);
}
