import ABCJS from "abcjs";

let playedNotes = [];


if (navigator.requestMIDIAccess) {
    console.log("Web MIDI API is supported in your browser.");

    navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
} else {
    console.log("Web MIDI API is not supported in your browser.");
}

function onMIDISuccess(midiAccess) {
    console.log("MIDI Access Object:", midiAccess);

    const inputs = midiAccess.inputs;

    for (let input of inputs.values()) {
        console.log(`Connected to MIDI device: ${input.name}`);

        input.onmidimessage = handleMIDIMessage;
    }
}

function onMIDIFailure() {
    console.log("Failed to access MIDI devices.");
}

function handleMIDIMessage(event) {
    const [status, data1, data2] = event.data;

    if (status >= 144 && status < 160) { // Note On event
        const note = data1;
        const velocity = data2;
        const abcNote = midiToAbc(note);

        // Voeg de noot alleen toe als deze nog niet in de array staat
        if (!playedNotes.includes(abcNote)) {
            playedNotes.push(abcNote);
            console.log(`Note Added: ${abcNote}`);
        } else {
            console.log(`Duplicate Note Ignored: ${abcNote}`);
        }

        console.log(playedNotes); // Controleer de array-inhoud in de console

        // Optioneel: Update de weergave op de pagina
        document.querySelector('.js-note').innerText = abcNote;
    }
}

export const midiToAbc = function(midiNotes) {
    const noteMap = {
        60: 'C', 61: 'C#', 62: 'D', 63: 'D#', 64: 'E', 65: 'F', 66: 'F#',
        67: 'G', 68: 'G#', 69: 'A', 70: 'A#', 71: 'B'
    };

    // Handle single notes and chords
    if (Array.isArray(midiNotes)) {
        // Process a chord
        return '[' + midiNotes.map(note => noteMap[(note - 60) % 12 + 60]).join(' ') + ']';
    } else {
        // Process a single note
        return noteMap[(midiNotes - 60) % 12 + 60];
    }
};

console.log(playedNotes);

let abcNotationTemplate = `
X: 1
T: Dynamic MIDI Notes
M: 4/4
L: 1/4
K: C
V: RH clef=treble
[V: RH] A B C | D E F | G A B | C D E |
`;

// ABCJS-notatie dynamisch invullen met de gespeelde noten
const updateAbcNotation = () => {
    // Voeg de gespeelde noten samen in ABC-notatie
    const notation = playedNotes.join(' ');

    // Combineer de dynamische noten met de statische template
    const abcNotation = abcNotationTemplate + notation;

    // Render de bijgewerkte notatie via ABCJS
    ABCJS.renderAbc("abc-sheet", abcNotation);
};

const init = function() {
    playedNotes = []
    updateAbcNotation();

}

document.addEventListener('DOMContentLoaded', init)

