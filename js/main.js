// Configuration function for intervals
function getIntervals() {
    return simpleIntervals;
}

// Configuration function for chords
function getChords() {
    return chordsNiceNames;
}

// Configuration function for scales
function getScales() {
    return fewerScales;
}

var accidentalIdx = [1,3,  6,8,10];
var wholeIdx =     [0,2,4,5,7,9,11];
var keyboard = [];
var intervals = getIntervals();
var chords = getChords();
var stepIntervals;
var sharps = [];
var flats = [];
var scales = getScales();
var lastPicked;
var root = 0;
var upArrowKey = 38;
var downArrowKey = 40;
var minorChordName = "Minor";
var majorChordName = "Major";

function noteFromInt(i) {
    i += 2; // 0 is C
    return String.fromCharCode(i % 7 + 65); // 65 is 'A'
}

function createIntervals() {
    stepIntervals = [];
    for (var interval in intervals) {
        for (var quality in intervals[interval]) {
            var steps = intervals[interval][quality];
            if (stepIntervals[steps] === undefined) stepIntervals.push([]);
            stepIntervals[steps].push(quality + " " + interval);
        }
    }
}

function createNotes() {
    for (var i = 0; i < 12; i++) {
        if ($.inArray(i, wholeIdx) !== -1) {
            sharps.push(noteFromInt(wholeIdx.indexOf(i)));
            flats.push(noteFromInt(wholeIdx.indexOf(i)));
        }
        if ($.inArray(i, accidentalIdx) !== -1) {
            sharps.push(noteFromInt(wholeIdx.indexOf(i - 1)) + "#");
            flats.push(noteFromInt(wholeIdx.indexOf(i + 1)) + "b");
        }
    }
}

function semitonesKeyupEvent(event) {
    var semitonesTxtbox = $('.semitones');
    var semitones = semitonesTxtbox.val();
    var number = new Number(semitones);
    if (isNaN(number)) number = 0;

    if (event.which === upArrowKey) {
        number++;
        var max = stepIntervals.length - 1;
        number = number > max ? max : number;
    }
    if (event.which === downArrowKey) {
        number--;
        number = number <= 0 ? 0 : number;
    }

    semitonesTxtbox.val(number);
    semitones = semitonesTxtbox.val();
    $('.semitones_results').text(stepIntervals[semitones].join(" & "));
}

function createKeyboard() {
    var wholeLeft = 0;
    var accidLeft = 14;
    var accidCounter = 0;
    var delta = 19;
    for (var i = 0; i < 48; i++) {
        var key = $('<div></div>');
        if ($.inArray(i % 12, wholeIdx) !== -1) {
            $(key).addClass('key');
            $(key).css({"left": wholeLeft});
            wholeLeft += delta;
        }
        if ($.inArray(i % 12, accidentalIdx) !== -1) {
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
}

function clearKeyboard() {
    $.each(keyboard, function (i) {
        $(keyboard[i]).removeClass('pressed');
    });
}

function chordsChangeEvent() {
    var chosen = chords[$('.chords option:checked').val()];
    if (!chosen) return;
    clearKeyboard();
    var fout = "";
    var sout = "";
    var iout = "";
    var space = "";
    var ispace = "";
    for (var i = 0; i < chosen.length; i++) {
        var idx = root + chosen[i];
        fout += space + flats[idx % flats.length];
        sout += space + sharps[idx % sharps.length];
        iout += ispace + stepIntervals[idx - root];
        space = " ";
        ispace = " - ";
        $(keyboard[idx]).addClass('pressed');
    }
    $('.with_flats').text(fout);
    $('.with_sharps').text(sout);
    $('.with_intervals').text(iout);

    lastPicked = chordsChangeEvent;
}

function notesIn(notes, idx, chosen, iterations) {
    if (iterations === undefined) {
        iterations = 2;
    }

    var out = [notes[idx % notes.length]];
    for (var i = 0; i < chosen.length * iterations; i++) {
        idx += chosen[i % chosen.length];
        out.push(notes[idx % notes.length]);
    }
    return out;
}

function pushKeyboardKeys(chosen, iterations, idx) {
    var iterated = [];
    for (var i = 0; i < chosen.length * iterations; i++) {
        idx += chosen[i % chosen.length];
        $(keyboard[idx]).addClass('pressed');
        if (iterations > 1
            && (i % chosen.length) + 1 == chosen.length
            && iterated[i / chosen.length] === undefined) {
            idx = (12 * (iterated.length + 1)) + root;
            iterated.push(true);
            $(keyboard[idx]).addClass('pressed');
        }
    }
}

function scalesChangeEvent() {
    var chosen = scales[$('.scales option:checked').text()];
    if (!chosen) return;
    clearKeyboard();
    var iterations = 2;
    $(keyboard[root]).addClass('pressed');
    pushKeyboardKeys(chosen, iterations, root);
    var fout = notesIn(flats, root, chosen, iterations).join(" ");
    $('.with_flats').text(fout);
    var sout = notesIn(sharps, root, chosen, iterations).join(" ");
    $('.with_sharps').text(sout);

    $('.with_intervals').text("");

    lastPicked = scalesChangeEvent;
}

function notesChangeEvent() {
    root = flats.indexOf($('.notes option:checked').val());
    if (lastPicked) lastPicked();
}

function keyWhichIs(key, e) {
    return key === String.fromCharCode(e.which);
}

$(document).ready(
    function() {
        createIntervals();
        createNotes();
        createKeyboard();
        $('.sharps').text(sharps);
        $('.flats').text(flats);

        $('.semitones').keyup(semitonesKeyupEvent);

        //$('.stepIntervals').text(JSON.stringify(stepIntervals, null, ' '));

        $.each(flats, function(item) {
            var note;
            if (flats[item] === sharps[item])
                note = flats[item];
            else
                note = flats[item] + " " + sharps[item];
            $('.notes').append(
                $('<option value="' + flats[item] + '">'+ note+'</option>'));
        });

        $('.notes').change(notesChangeEvent);

        var chordsSelectbox = $('.chords');
        $.each(chords, function(item) {
            chordsSelectbox.append($('<option>'+item+'</option>'));
        });
        chordsSelectbox.change(chordsChangeEvent);
        chordsSelectbox.focus(chordsChangeEvent);

        var scalesSelectbox = $('.scales');
        $.each(scales, function(item) {
            scalesSelectbox.append($('<option>'+item+'</option>'));
        });
        $('.scales option').each(function (e, a) {
            if (/^Major$/i.test($(a).val())) {
                $(a).attr('value', majorChordName);
            }
            if (/^Natural Minor$/i.test($(a).val())) {
                $(a).attr('value', minorChordName);
            }
        });
        scalesSelectbox.change(scalesChangeEvent);
        scalesSelectbox.focus(scalesChangeEvent);

        $('body').on('keydown', function(e) {
            if (e.altKey) {
                var theScales = $('.scales');
                if (keyWhichIs('M', e)) {
                    theScales.val(majorChordName);
                    theScales.change();
                }
                if (keyWhichIs('N', e)) {
                    theScales.val(minorChordName);
                    theScales.change();
                }
            }
        })

    }
);
