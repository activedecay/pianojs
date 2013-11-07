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

var MAX_ITERATIONS = 3;

var ACCIDENTAL_LEFT_BEGIN = 14;
var NOTE_WIDTH = 19;
var keyboardKeys = 48;

var iterations = 1;
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
var pageUpKey = 33;
var pageDownKey = 34;
var minorChordName = "Natural Minor";
var majorChordName = "Major";


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

function createKeyboard() {
    var wholeLeft = 0;
    var accidLeft = ACCIDENTAL_LEFT_BEGIN;
    var accidCounter = 0;
    var delta = NOTE_WIDTH;
    for (var i = 0; i < keyboardKeys; i++) {
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
    $('.keyboard div').remove();
    keyboard = [];
}

function clearKeyboardPressed() {
    $.each(keyboard, function (i) {
        $(keyboard[i]).removeClass('pressed');
    });
}

function noteFromInt(i) {
    i += 2; // 0 is C
    return String.fromCharCode(i % 7 + 65); // 65 is 'A'
}

function notesInScale(notes, rootIdx, scale, iterations) {
    if (iterations === undefined) {
        iterations = 2;
    }

    var idxs = idxInScale(rootIdx, scale, iterations);
    var out = [];
    for (var i = 0; i < idxs.length; i++) {
        var idx = idxs[i];
        out.push(notes[idx % notes.length]);
    }
    return out;
}

function idxInScale(idx, scale, iterations) {
    if (iterations === undefined) {
        iterations = 2;
    }

    var out = [idx];
    for (var i = 0; i < scale.length * iterations; i++) {
        idx += scale[i % scale.length];
        out.push(idx);
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

function keyWhichIs(key, e) {
    return key === String.fromCharCode(e.which);
}

function getNumberFromText(text, event, max, min) {
    var number = new Number(text);
    if (isNaN(number)) number = min;

    if (event.which === upArrowKey) { number++; }
    if (event.which === downArrowKey) { number--; }
    if (event.which === pageUpKey) { number+=12; }
    if (event.which === pageDownKey) { number-=12; }
    number = number > max ? max : number;
    number = number <= min ? min : number;
    return number;
}

function updateDiatonic() {
    var scale = scales[$('.scales option:checked').val()];
    var chord = chords[$('.chords option:checked').val()];
    if (!scale || !chord) return;
    var idxs = idxInScale(root, scale, 4);
    var chordSpan = chord.length * 2;
    var keyboardIdxs = [];
    var diatonicQualities = [];
    for (var roman = 0; roman < 8; roman++) {
        var triad = [];
        // find keyboard indexes
        for (var i = 0; i < chordSpan; i += 2) {
            triad.push(idxs[roman + i]);
        }
        keyboardIdxs.push(triad);
        // find triad quality
        var quality = [];
        var triadRoot = triad[0];
        for (i = 0; i < triad.length; i++) {
            quality.push(triad[i] - triadRoot);
        }
        diatonicQualities.push(quality);
    }
    var diatonicSelect = $('.diatonic');
    diatonicSelect.find('option').remove();
    for (var q = 0; q < diatonicQualities.length; q++) {
        var qNotes = diatonicQualities[q];
        for (var obj in chords) {
            if ($(qNotes).not(chords[obj]).length === 0
                && $(chords[obj]).not(qNotes).length === 0) {
                diatonicSelect.append($('<option val='+keyboardIdxs[q]+'>'+obj+'</option>'))
            }
        }
    }
}

// EVENTS
function semitonesKeyupEvent(event) {
    var semitonesTxtbox = $('.semitones');
    var semitones = semitonesTxtbox.val();
    var number = getNumberFromText(semitones, event,
        stepIntervals.length - 1, 0);
    semitonesTxtbox.val(number);
    $('.semitones_results').text(stepIntervals[number].join(" & "));
}

function iterationsKeyupEvent(event) {
    var iterationsTxtbox = $('.iterations');
    var textValue = iterationsTxtbox.val();
    var number = getNumberFromText(textValue, event, keyboardKeys/12, 1);

    iterationsTxtbox.val(number);
    iterations = number;

    if (lastPicked) lastPicked();
}

function keyboardKeysKeyupEvent(event) {
    var keyboardKeysTxtbox = $('.keyboardKeys');
    var textValue = keyboardKeysTxtbox.val();
    var number = getNumberFromText(textValue, event, 144, 12);

    keyboardKeysTxtbox.val(number);
    keyboardKeys = number;

    clearKeyboard();
    createKeyboard();
}

function chordsChangeEvent() {
    var chosen = chords[$('.chords option:checked').val()];
    if (!chosen) return;
    clearKeyboardPressed();
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

    updateDiatonic();

    lastPicked = chordsChangeEvent;
}

function scalesChangeEvent() {
    var chosen = scales[$('.scales option:checked').val()];
    if (!chosen) return;
    clearKeyboardPressed();
    $(keyboard[root]).addClass('pressed');
    pushKeyboardKeys(chosen, iterations, root);
    var fout = notesInScale(flats, root, chosen, iterations).join(" ");
    $('.with_flats').text(fout);
    var sout = notesInScale(sharps, root, chosen, iterations).join(" ");
    $('.with_sharps').text(sout);

    $('.with_intervals').text("");

    updateDiatonic();

    lastPicked = scalesChangeEvent;
}

function notesChangeEvent() {
    root = flats.indexOf($('.notes option:checked').val());
    if (lastPicked) lastPicked();
}

function diatonicChangeEvent() {
    clearKeyboardPressed();
    var keyboardIdxs = $.parseJSON("[" +
        $('.diatonic option:checked').attr('val') + "]");
    for (var i = 0; i < keyboardIdxs.length; i++) {
        $(keyboard[keyboardIdxs[i]]).addClass('pressed');
    }
}

function bodyKeyboardEvent(e) {
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
}

$(document).ready(
    function() {
        createIntervals();
        createNotes();
        createKeyboard();
        $('.sharps').text(sharps);
        $('.flats').text(flats);

        $('.semitones').keyup(semitonesKeyupEvent);
        $('.iterations').keyup(iterationsKeyupEvent);
        $('.keyboardKeys').keyup(keyboardKeysKeyupEvent);

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
                $(a).text('Major (alt+M)');
            }
            if (/^Natural Minor$/i.test($(a).val())) {
                $(a).attr('value', minorChordName);
                $(a).text('Natural Minor (alt+N)');
            }
        });
        scalesSelectbox.change(scalesChangeEvent);
        scalesSelectbox.focus(scalesChangeEvent);

        $('.diatonic').change(diatonicChangeEvent);

        $('body').on('keydown', bodyKeyboardEvent)

    }
);
