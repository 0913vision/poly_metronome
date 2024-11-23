// 오디오 설정
const highSynth = new Tone.Synth({
  oscillator: { type: "triangle" },
  envelope: {
      attack: 0.001,
      decay: 0.03,
      sustain: 0,
      release: 0.01
  }
}).toDestination();

const lowSynth = new Tone.Synth({
  oscillator: { type: "triangle" },
  envelope: {
      attack: 0.001,
      decay: 0.03,
      sustain: 0,
      release: 0.01
  }
}).toDestination();

const kickSynth = new Tone.MembraneSynth({
  pitchDecay: 0.05,
  octaves: 4,
  oscillator: { type: "sine" },
  envelope: {
      attack: 0.001,
      decay: 0.2,
      sustain: 0,
      release: 0.2
  }
}).toDestination();

const woodSynth = new Tone.MembraneSynth({
  pitchDecay: 0.008,
  octaves: 2,
  oscillator: { type: "sine" },
  envelope: {
      attack: 0.001,
      decay: 0.05,
      sustain: 0,
      release: 0.01
  }
}).toDestination();

// 상태 변수
let isPlaying = false;
let bpm = 68;
let step = 0;
let interval;
let currentMode = 'full16';

// DOM 요소
const toggleButton = document.querySelector('.toggle-button');
const bpmInput = document.querySelector('.bpm-value');
const bpmSlider = document.querySelector('.bpm-slider');
const bpmDecreaseBtn = document.querySelector('.bpm-button:first-child');
const bpmIncreaseBtn = document.querySelector('.bpm-button:last-child');
const kickToggle = document.getElementById('kickToggle');
const beat4Toggle = document.getElementById('beat4');
const rhythmButtons = {
  full16: document.getElementById('full16'),
  accent16: document.getElementById('accent16')
};
const leds = document.querySelectorAll('.led');

// 초기 설정
rhythmButtons.full16.classList.add('active');

// BPM 업데이트
function updateBPM(newBPM) {
  bpm = Math.min(Math.max(newBPM, 40), 208);
  bpmInput.value = bpm;
  bpmSlider.value = bpm;
  if (isPlaying) {
      restartMetronome();
  }
}

// LED 업데이트
function updateLEDs(currentStep) {
  leds.forEach(led => {
      const ledStep = parseInt(led.dataset.step);
      if (ledStep === currentStep) {
          if (led.classList.contains('blue') || 
              led.classList.contains('red') || 
              led.classList.contains('green')) {
              led.classList.add('active');
          } else {
              led.classList.add('active');
          }
      } else {
          led.classList.remove('active');
      }
  });
}

// 메트로놈 틱 함수
function tick() {
  // 기본 폴리리듬 패턴
  const isAccentStep = [0, 3, 6, 9, 12].includes(step);
  
  // 16비트 폴리 (전체)
  if (currentMode === 'full16') {
      if (isAccentStep) {
          highSynth.triggerAttackRelease("E5", "32n", undefined, 0.7);
      } else {
          lowSynth.triggerAttackRelease("A4", "32n", undefined, 0.4);
      }
  }
  // 16비트 폴리 (강세만)
  else if (currentMode === 'accent16') {
      if (step === 0) {
          highSynth.triggerAttackRelease("E5", "32n", undefined, 0.7);
      } else if (isAccentStep) {
          lowSynth.triggerAttackRelease("A4", "32n", undefined, 0.5);
      }
  }

  // 킥 사운드
  if (kickToggle.checked && (step === 0 || step === 8)) {
      kickSynth.triggerAttackRelease("C1", "32n", undefined, 0.7);
  }

  // 4비트 우드 사운드
  if (beat4Toggle.checked) {
    if (step === 0) {
        woodSynth.triggerAttackRelease("G5", "32n", undefined, 0.7);
    } else if ([4, 8, 12].includes(step)) {
        woodSynth.triggerAttackRelease("G4", "32n", undefined, 0.5);
    }
  }

  updateLEDs(step);
  step = (step + 1) % 16;
}

// 메트로놈 시작/재시작
function restartMetronome() {
  if (interval) clearInterval(interval);
  const intervalTime = (60 / bpm) * 1000 / 4; // 16분음표 간격
  interval = setInterval(tick, intervalTime);
}

// 메트로놈 토글
function toggleMetronome() {
  isPlaying = !isPlaying;
  toggleButton.textContent = isPlaying ? "정지" : "시작";
  
  if (isPlaying) {
      step = 0;
      Tone.start();
      restartMetronome();
  } else {
      clearInterval(interval);
      leds.forEach(led => led.classList.remove('active'));
  }
}

// 리듬 모드 변경
function changeRhythmMode(mode) {
  currentMode = mode;
  Object.values(rhythmButtons).forEach(btn => btn.classList.remove('active'));
  rhythmButtons[mode].classList.add('active');
}

// 이벤트 리스너
toggleButton.addEventListener('click', toggleMetronome);

rhythmButtons.full16.addEventListener('click', () => changeRhythmMode('full16'));
rhythmButtons.accent16.addEventListener('click', () => changeRhythmMode('accent16'));

bpmInput.addEventListener('change', (e) => updateBPM(parseInt(e.target.value)));
bpmSlider.addEventListener('input', (e) => updateBPM(parseInt(e.target.value)));
bpmDecreaseBtn.addEventListener('click', () => updateBPM(bpm - 1));
bpmIncreaseBtn.addEventListener('click', () => updateBPM(bpm + 1));

// 페이지 로드 시 초기화
window.addEventListener('load', () => {
  updateBPM(68);
  changeRhythmMode('full16');
});