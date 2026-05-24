/*
 * Copyright (c) 2026 Kidsplates/UsenVideoCallApp
 * Created: 2026-05-24
 * Description: Web Audio APIを使用したゲーム効果音の生成・再生ロジック
 */

let audioCtx = null;
let masterVolumeNode = null;
let isMuted = false;

// AudioContextを初期化または取得する（ユーザーインタラクション時に呼び出す）
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterVolumeNode = audioCtx.createGain();
    masterVolumeNode.gain.setValueAtTime(0.3, audioCtx.currentTime); // 初期音量を0.3に設定
    masterVolumeNode.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

// ミュートの切り替え
function toggleMute() {
  isMuted = !isMuted;
  if (masterVolumeNode) {
    masterVolumeNode.gain.setValueAtTime(isMuted ? 0 : 0.3, audioCtx ? audioCtx.currentTime : 0);
  }
  return isMuted;
}

// ミュート状態を直接設定する
function setMute(mute) {
  isMuted = mute;
  if (masterVolumeNode) {
    masterVolumeNode.gain.setValueAtTime(isMuted ? 0 : 0.3, audioCtx ? audioCtx.currentTime : 0);
  }
}

// 音量設定 (0.0 ~ 1.0)
function setVolume(volume) {
  if (masterVolumeNode && !isMuted) {
    masterVolumeNode.gain.setValueAtTime(volume * 0.3, audioCtx.currentTime); // 最大0.3に制限
  }
}

// 軽いタップ音（ポン！）
function playTap() {
  initAudio();
  if (isMuted) return;
  
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.connect(gain);
  gain.connect(masterVolumeNode);
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(500, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 0.08);
  
  gain.gain.setValueAtTime(0.8, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
  
  osc.start();
  osc.stop(audioCtx.currentTime + 0.1);
}

// 正解音（ピンポン！）
function playCorrect() {
  initAudio();
  if (isMuted) return;

  const now = audioCtx.currentTime;
  
  // 1つ目の音（ミ）
  const osc1 = audioCtx.createOscillator();
  const gain1 = audioCtx.createGain();
  osc1.connect(gain1);
  gain1.connect(masterVolumeNode);
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(659.25, now); // E5
  gain1.gain.setValueAtTime(0.5, now);
  gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
  osc1.start(now);
  osc1.stop(now + 0.3);

  // 2つ目の音（ソ）少し遅れて
  const osc2 = audioCtx.createOscillator();
  const gain2 = audioCtx.createGain();
  osc2.connect(gain2);
  gain2.connect(masterVolumeNode);
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(783.99, now + 0.1); // G5
  gain2.gain.setValueAtTime(0.5, now + 0.1);
  gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
  osc2.start(now + 0.1);
  osc2.stop(now + 0.45);
}

// 不正解音（ブブー）
function playIncorrect() {
  initAudio();
  if (isMuted) return;

  const now = audioCtx.currentTime;
  const osc1 = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(masterVolumeNode);
  
  // 不協和音を作る
  osc1.type = 'sawtooth';
  osc2.type = 'sawtooth';
  osc1.frequency.setValueAtTime(150, now);
  osc2.frequency.setValueAtTime(154, now); // 少しズラす
  
  gain.gain.setValueAtTime(0.5, now);
  gain.gain.setValueAtTime(0.5, now + 0.15);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
  
  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 0.4);
  osc2.stop(now + 0.4);
}

// パズルピース吸着音（ピタッ！）
function playSuccess() {
  initAudio();
  if (isMuted) return;

  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.connect(gain);
  gain.connect(masterVolumeNode);
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, now); // A5
  osc.frequency.exponentialRampToValueAtTime(1320, now + 0.1); // E6
  
  gain.gain.setValueAtTime(0.6, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
  
  osc.start(now);
  osc.stop(now + 0.12);
}

// ゲームクリア・ファンファーレ（パッパラー！）
function playLevelUp() {
  initAudio();
  if (isMuted) return;

  const now = audioCtx.currentTime;
  const notes = [
    { freq: 523.25, time: 0 },     // C5
    { freq: 659.25, time: 0.12 },  // E5
    { freq: 783.99, time: 0.24 },  // G5
    { freq: 1046.50, time: 0.36 }  // C6 (長め)
  ];
  
  notes.forEach((note, index) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(masterVolumeNode);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(note.freq, now + note.time);
    
    const duration = index === notes.length - 1 ? 0.6 : 0.12;
    gain.gain.setValueAtTime(0.4, now + note.time);
    gain.gain.exponentialRampToValueAtTime(0.01, now + note.time + duration);
    
    osc.start(now + note.time);
    osc.stop(now + note.time + duration);
  });
}
