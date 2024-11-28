const midiReceiver = function (event) {
    console.log(event); // Log the MIDI message data
};




navigator.requestMIDIAccess()
    .then(function(midiAccess) {
        const inputs = midiAccess.inputs.values();


        for (let input of inputs) {
            input.onmidimessage = midiReceiver;
        }
    })
    .catch(function(err) {
        console.error('Failed to get MIDI access', err);
    });


const init = function () {
    console.log('DOM has been loaded')
    midiReceiver();
}

document.addEventListener('DOMContentLoaded', init);