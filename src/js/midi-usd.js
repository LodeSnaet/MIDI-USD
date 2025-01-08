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
        updateAbcNotation(abcNote);

        // Optioneel: Update de weergave op de pagina
        document.querySelector('.js-note').innerText = abcNote;
    }
}

const midiToAbc = function(midiNotes) {
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

// const updateAbcNotation = (abcNotesArray) => {
//     // Controleer of er noten zijn om weer te geven
//     const notation = abcNotesArray.length > 0 ? abcNotesArray.join(' ') : 'z';
//
//     // Dynamisch aanvullen van de volledige ABC-notatie
//     const abcNotation = `
// X: 1
// T: Dynamic MIDI Notes
// M: 4/4
// L: 1/4
// K: C
// V: RH clef=treble
// [V: RH] ${notation}
// `;
//
//     // Render de ABCJS-notatie
//     ABCJS.renderAbc("abc-sheet", abcNotation);
// };

const updateAbcNotation = (abcNotes) => {
    // Controleer of abcNotes een array is
    let notation = '';

    if (Array.isArray(abcNotes)) {
        // Als het een array is, verbind de noten met een spatie
        notation += abcNotes.join(' ');
    } else {
        // Als het geen array is, gebruik de string direct
        notation += abcNotes || 'z'; // Geef "z" (rust) weer als niets is doorgegeven
    }

    // Maak de volledige ABC-notatie
    const abcNotation = `
X: 1
T: Dynamic MIDI Notes
M: 4/4
L: 1/4
K: C
V: RH clef=treble
[V: RH] ${notation}
`;

    // Render de ABC-notatie
    ABCJS.renderAbc("abc-sheet", abcNotation);
};
const init = function() {
    playedNotes = []
    updateAbcNotation();

}

document.addEventListener('DOMContentLoaded', init)

