// Get DOM elements
const textInput = document.getElementById('text-input');
const voiceSelect = document.getElementById('voice-select');
const rateInput = document.getElementById('rate');
const pitchInput = document.getElementById('pitch');
const rateValue = document.getElementById('rate-value');
const pitchValue = document.getElementById('pitch-value');
const playBtn = document.getElementById('play-btn');
const pauseBtn = document.getElementById('pause-btn');
const resumeBtn = document.getElementById('resume-btn');
const stopBtn = document.getElementById('stop-btn');
const status = document.getElementById('status');

// Initialize Speech Synthesis
const synth = window.speechSynthesis;
let voices = [];
let currentUtterance = null;

// Load available voices
function loadVoices() {
    voices = synth.getVoices();
    voiceSelect.innerHTML = '';
    
    voices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.textContent = `${voice.name} (${voice.lang})`;
        option.value = index;
        voiceSelect.appendChild(option);
    });
}

// Load voices on page load and when they change
loadVoices();
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoices;
}

// Update rate and pitch display values
rateInput.addEventListener('input', () => {
    rateValue.textContent = rateInput.value;
});

pitchInput.addEventListener('input', () => {
    pitchValue.textContent = pitchInput.value;
});

// Show status message
function showStatus(message, type) {
    status.textContent = message;
    status.className = 'status show ' + type;
}

// Hide status message
function hideStatus() {
    status.className = 'status';
}

// Update button states
function updateButtons(playing, paused) {
    playBtn.disabled = playing && !paused;
    pauseBtn.disabled = !playing || paused;
    resumeBtn.disabled = !paused;
    stopBtn.disabled = !playing;
}

// Play text
playBtn.addEventListener('click', () => {
    const text = textInput.value.trim();
    
    if (!text) {
        showStatus('Please enter some text to convert to speech', 'error');
        setTimeout(hideStatus, 3000);
        return;
    }
    
    // Cancel any ongoing speech
    synth.cancel();
    
    // Create new utterance
    currentUtterance = new SpeechSynthesisUtterance(text);
    
    // Set voice
    const selectedVoiceIndex = voiceSelect.value;
    if (voices[selectedVoiceIndex]) {
        currentUtterance.voice = voices[selectedVoiceIndex];
    }
    
    // Set rate and pitch
    currentUtterance.rate = parseFloat(rateInput.value);
    currentUtterance.pitch = parseFloat(pitchInput.value);
    
    // Event listeners
    currentUtterance.onstart = () => {
        showStatus('Speaking...', 'speaking');
        updateButtons(true, false);
    };
    
    currentUtterance.onend = () => {
        showStatus('Finished speaking', 'speaking');
        updateButtons(false, false);
        setTimeout(hideStatus, 2000);
    };
    
    currentUtterance.onerror = (event) => {
        showStatus('Error: ' + event.error, 'error');
        updateButtons(false, false);
        setTimeout(hideStatus, 3000);
    };
    
    // Speak
    synth.speak(currentUtterance);
});

// Pause speech
pauseBtn.addEventListener('click', () => {
    if (synth.speaking && !synth.paused) {
        synth.pause();
        showStatus('Paused', 'paused');
        updateButtons(true, true);
    }
});

// Resume speech
resumeBtn.addEventListener('click', () => {
    if (synth.paused) {
        synth.resume();
        showStatus('Speaking...', 'speaking');
        updateButtons(true, false);
    }
});

// Stop speech
stopBtn.addEventListener('click', () => {
    synth.cancel();
    showStatus('Stopped', 'speaking');
    updateButtons(false, false);
    setTimeout(hideStatus, 2000);
});

// Initialize button states
updateButtons(false, false);
