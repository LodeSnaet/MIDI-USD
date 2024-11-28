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

    console.log(`MIDI Message received:
        Status: ${status}
        Data1: ${data1}
        Data2: ${data2}`);

    if (status >= 144 && status < 160) {
        const note = data1;
        const velocity = data2;
        console.log(`Note On: ${note} with velocity ${velocity}`);
        const abcNote = midiToAbc(note);
        console.log(abcNote);
        document.querySelector('.js-note').innerText = abcNote;
    }
}

const  midiToAbc = function(midiNote) {
    const noteMap = {
        60: 'C', 61: 'C#', 62: 'D', 63: 'D#', 64: 'E', 65: 'F', 66: 'F#',
        67: 'G', 68: 'G#', 69: 'A', 70: 'A#', 71: 'B'
    };

    // Adjust the MIDI note number to fit within the map's range
    const adjustedNote = (midiNote - 60) % 12 + 60;

    return noteMap[adjustedNote];
}


