import ABCJS from "abcjs";

let playedNotes = []; // Alle gespeelde noten (met correct genoteerde pitches)
let heldNotes = new Map(); // Vastgehouden noten met starttijd


// Dynamische maatsoort en tempo
let tempo = 120; // Standaard BPM
let beatDurationMs = 60000 / tempo; // Duur van een beat
let meter = [4, 4]; // Standaard maatsoort (bijv. 4/4)

// Voortgang binnen een maat
let measureProgress = 0; // Hoeveel beats zijn voltooid in de huidige maat





// MIDI-toegang geslaagd
function onMIDISuccess(midiAccess) {
    for (let input of midiAccess.inputs.values()) {
        connectInput(input); // Verbind elke input-poort
    }

    // Meer apparaten dynamisch verbinden als ze aangesloten worden
    midiAccess.onstatechange = e => {
        if (e.port.type === "input" && e.port.state === "connected") {
            connectInput(e.port);
        }
    };
}

function connectInput(input) {
    console.log(`Verbinden met MIDI-apparaat: ${input.name}`);
    input.onmidimessage = handleMIDIMessage;
}

// MIDI-toegang mislukt
function onMIDIFailure() {
    console.error("Geen toegang tot MIDI-apparaten.");
}

// Behandel MIDI-berichten
function handleMIDIMessage(event) {
    const [status, note, velocity] = event.data;

    if (status >= 144 && status < 160 && velocity > 0) {
        handleNoteOn(note);
    } else if (
        (status >= 144 && status < 160 && velocity === 0) ||
        (status >= 128 && status < 144)
    ) {
        handleNoteOff(note);
    }
}

// Note On - een noot wordt ingedrukt
function handleNoteOn(midiNote) {
    const abcNote = midiToAbc(midiNote); // Gebruik muziektheorieconversie
    const startTime = performance.now();

    if (!heldNotes.has(abcNote)) {
        heldNotes.set(abcNote, startTime);
        console.log(`Noot gestart: ${abcNote} om ${startTime}`);
    } else {
        console.log(`Note On genegeerd, noot al actief: ${abcNote}`);
    }
}

// Note Off - een noot wordt losgelaten
function handleNoteOff(midiNote) {
    const abcNote = midiToAbc(midiNote); // Gebruik muziektheorieconversie
    const endTime = performance.now();

    if (heldNotes.has(abcNote)) {
        const startTime = heldNotes.get(abcNote);
        const duration = endTime - startTime;
        heldNotes.delete(abcNote);

        addNoteToPlayedNotes(abcNote, duration);
        console.log(`Noot gestopt: ${abcNote} om ${endTime} (Duur: ${duration}ms)`);

        updateAbcNotation();
updateAbcNotation();
        console.log(`Note Off genegeerd, noot niet bijgehouden: ${abcNote}`);
    }
}

// Voeg een noot (met duur en slurs) toe aan de gespeelde noten
function addNoteToPlayedNotes(abcNote, duration) {
    const abcDuration = durationToAbc(duration);
    const noteValue = durationToBeats(duration);

playedNotes.push(abcNote + abcDuration);

    handleMeasureProgress(noteValue);
}

// Verwerk de maat (voeg een maatstreep toe indien nodig)
function handleMeasureProgress(noteValue) {
    measureProgress += noteValue;

    if (measureProgress >= meter[0]) {
        playedNotes.push("|"); // Voeg een maatstreep toe
        measureProgress %= meter[0]; // Resterende beats voor de volgende maat
    }
}

// Converteert een duur in milliseconden naar ABC-duur
function durationToAbc(duration) {
    const beatLength = beatDurationMs;

    if (duration < beatLength * 0.25) {
        return "/4"; // Zestiende noot
    } else if (duration < beatLength * 0.5) {
        return "/2"; // Achtste noot
    } else if (duration < beatLength) {
        return ""; // Kwartnoot
    } else if (duration < beatLength * 2) {
        return "2"; // Halve noot
    } else {
        return "4"; // Hele noot
    }
}

// Converteert een duur naar de waarde in beats
function durationToBeats(duration) {
    const beatLength = beatDurationMs;

    if (duration < beatLength * 0.25) {
        return 0.25; // Zestiende noot
    } else if (duration < beatLength * 0.5) {
        return 0.5; // Achtste noot
    } else if (duration < beatLength) {
        return 1; // Kwartnoot
    } else if (duration < beatLength * 2) {
        return 2; // Halve noot
    } else {
        return 4; // Hele noot
    }
}

function midiToAbc(midiNote) {
    const noteMap = {
        0: "C", 1: "^C", 2: "D", 3: "^D", 4: "E", 5: "F", 6: "^F", 7: "G",
        8: "^G", 9: "A", 10: "^A", 11: "B"
    };

    const baseNote = midiNote % 12; // Haal de chromatische noot op uit de map
    const octave = Math.floor(midiNote / 12) - 4; // Bereken welk octaaf het is

    let abcNote = noteMap[baseNote]; // Vind de juiste noot in de map

    // Voeg octaafinformatie toe (apostrofs voor hoog, komma's voor laag)
    if (octave > 0) {
        abcNote += "'".repeat(octave); // Toevoegen voor hogere octaven
    } else if (octave < 0) {
        abcNote += ",".repeat(Math.abs(octave)); // Toevoegen voor lagere octaven
    }

    return abcNote; // Geef de geconverteerde noot terug
}

// Update de ABC-notatie en render deze op de pagina
function updateAbcNotation() {
    // Voeg een regel beëindiging \n na elke 4 maatstrepen toe
    const maxBarsPerLine = 4;
    let measureCount = 0;
    const notationWithLineBreaks = playedNotes
        .map(note => {
            if (note === "|") {
                measureCount++;
                if (measureCount % maxBarsPerLine === 0) {
                    return note + "\n"; // Voeg een nieuwe regel toe
                }
            }
            return note;
        })
        .join(" ");

    const abcNotation = `
X: 1
T: Live MIDI-to-ABC Notation
M: ${meter[0]}/${meter[1]}
L: 1/${meter[1]}
Q: 1/${meter[1]}=${tempo}
K: C
[V: RH] ${notationWithLineBreaks}
    `;
    ABCJS.renderAbc("abc-sheet", abcNotation);
    console.log("ABC Notatie bijgewerkt:\n", abcNotation);
}

// Initialiseer de applicatie
function init() {
    // Check of Web MIDI wordt ondersteund
    if (navigator.requestMIDIAccess) {
        console.log("Web MIDI API is beschikbaar in deze browser.");
        navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
    } else {
        console.log("Web MIDI API wordt niet ondersteund.");
    }


    playedNotes = [];

    measureProgress = 0;
    updateAbcNotation();
    console.log("Applicatie geïnitialiseerd.");
}

document.addEventListener("DOMContentLoaded", init);