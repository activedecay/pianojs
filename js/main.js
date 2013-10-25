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

function stepsKeyupEvent(code) {
    var semitones = $('.semitones').val();
    if (code.keyCode === upArrowKey)
        $('.semitones').val(new Number(semitones) + 1);
    if (code.keyCode === downArrowKey)
        $('.semitones').val(new Number(semitones) - 1);

    semitones = $('.semitones').val();
    $('.semitones_results').text(
        semitones && stepIntervals[semitones] ?
            stepIntervals[semitones].join(" & ") :
            "");
}

function createKeyboard() {
    var wholeLeft = 0;
    var accidLeft = 14;
    var accidCounter = 0;
    var delta = 19;
    for (var i = 0; i < 36; i++) {
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
        fout += space + flats[chosen[i] % flats.length];
        sout += space + sharps[chosen[i] % sharps.length];
        iout += ispace + stepIntervals[chosen[i]];
        space = " ";
        ispace = " - ";
        $(keyboard[chosen[i] + root]).addClass('pressed');
    }
    $('.with_flats').text(fout);
    $('.with_sharps').text(sout);
    $('.with_intervals').text(iout);

    lastPicked = chordsChangeEvent;
}

function scalesChangeEvent() {
    var chosen = scales[$('.scales option:checked').val()];
    if (!chosen) return;
    clearKeyboard();
    var idx = root;
    $(keyboard[idx]).addClass('pressed');
    for (var i = 0; i < chosen.length; i++) {
        idx += chosen[i];
        $(keyboard[idx]).addClass('pressed');
    }

    lastPicked = scalesChangeEvent;
}

function notesChangeEvent() {
    root = flats.indexOf($('.notes option:checked').val());
    if (lastPicked) lastPicked();
}

$(document).ready(
    function() {
        createIntervals();
        createNotes();
        createKeyboard();
        $('.sharps').text(sharps);
        $('.flats').text(flats);

        $('.semitones').keyup(stepsKeyupEvent);


        $('.stepIntervals').text(JSON.stringify(stepIntervals, null, ' '));

        $.each(flats, function(item) {
            var note;
            if (flats[item] === sharps[item])
                note = flats[item];
            else
                note = flats[item] + " " + sharps[item];
            $('.notes').append($('<option value="' + flats[item] + '">'+ note+'</option>'));
        });
        $('.notes').change(notesChangeEvent);

        $.each(chords, function(item) {
            $('.chords').append($('<option>'+item+'</option>'));
        });
        $('.chords').change(chordsChangeEvent);
        $('.chords').focus(chordsChangeEvent);

        $.each(scales, function(item) {
            $('.scales').append($('<option>'+item+'</option>'));
        });
        $('.scales').change(scalesChangeEvent);
        $('.scales').focus(scalesChangeEvent);
    }
);
