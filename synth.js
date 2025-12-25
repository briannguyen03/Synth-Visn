const wave = new Tone.Waveform(2048);

const synth = new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: { sustain: 1, release: 0.1 }
}).connect(wave);

const gainNode = new Tone.Gain(0.5).toDestination();
synth.connect(gainNode); 

// Visualization Setup
const cnv = document.getElementById("oscillator-view");
const ctx = cnv.getContext("2d");

function drawOscilloscope() {
    requestAnimationFrame(drawOscilloscope);
    const values = wave.getValue();
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#00ffcc";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#00ffcc";

    for (let i = 0; i < values.length; i++) {
        const x = (i / values.length) * cnv.width;
        const y = (0.5 + values[i] / 2) * cnv.height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
}
drawOscilloscope();

let isTriggered = false;

function updateSynthFromVision(x, y, isApart) {
    if (isApart && !isTriggered) {
        synth.triggerAttack(synth.frequency.value);
        isTriggered = true;
    } else if (!isApart && isTriggered) {
        synth.triggerRelease();
        isTriggered = false;
    }

    // Only update sliders/pitch if hand is open
    if (isTriggered) {
        const freq = x * 900 + 100;
        synth.frequency.setTargetAtTime(freq, Tone.now(), 0.05);
        gainNode.gain.rampTo(y, 0.05);

        document.getElementById("freq-slider").value = freq;
        document.getElementById("gain-slider").value = y;
    }
}

// 1. Waveform Select
document.getElementById("waveform-type").addEventListener("change", (e) => {
    synth.oscillator.type = e.target.value;
});

// 2. Frequency Slider
document.getElementById("freq-slider").addEventListener("input", (e) => {
    synth.frequency.setTargetAtTime(e.target.value, Tone.now(), 0.1);
});


document.getElementById("gain-slider").addEventListener("input", (e) => {
    gainNode.gain.rampTo(e.target.value, 0.1);
});

// 3. Play/Stop Toggle
let isplaying = false;
document.getElementById("play-button").addEventListener("click", async () => {
    await Tone.start();
    if (isplaying) {    
        synth.triggerRelease();
        document.getElementById("play-button").innerText = "Start";
        isplaying = false;
    } else {
        // Start playing whatever frequency the slider is currently at
        const currentFreq = document.getElementById("freq-slider").value;
        synth.triggerAttack(currentFreq);
        document.getElementById("play-button").innerText = "Stop";
        isplaying = true;
    }
});

