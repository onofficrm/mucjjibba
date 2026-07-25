/**
 * Web Audio 합성 헬퍼 — 샘플 파일 없이 다층 임팩트·노이즈·코드 생성
 */

export function createNoiseBuffer(ctx: AudioContext, durationSec: number): AudioBuffer {
  const len = Math.max(1, Math.floor(ctx.sampleRate * durationSec));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buf;
}

export function connectPan(
  ctx: AudioContext,
  source: AudioNode,
  pan?: number,
): AudioNode {
  if (pan === undefined || !ctx.createStereoPanner) return source;
  const panner = ctx.createStereoPanner();
  panner.pan.value = Math.max(-1, Math.min(1, pan));
  source.connect(panner);
  return panner;
}

export interface ToneOpts {
  type?: OscillatorType;
  freq: number;
  endFreq?: number;
  start: number;
  duration: number;
  peak: number;
  attack?: number;
  curve?: 'exp' | 'lin';
  pan?: number;
  detune?: number;
}

export function playTone(ctx: AudioContext, dest: AudioNode, opts: ToneOpts) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = opts.type ?? 'sine';
  osc.frequency.setValueAtTime(opts.freq, opts.start);
  if (opts.detune) osc.detune.setValueAtTime(opts.detune, opts.start);
  if (opts.endFreq != null) {
    if (opts.curve === 'lin') {
      osc.frequency.linearRampToValueAtTime(opts.endFreq, opts.start + opts.duration);
    } else {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(20, opts.endFreq),
        opts.start + opts.duration,
      );
    }
  }
  const attack = opts.attack ?? 0.008;
  const peak = Math.max(0.0001, opts.peak);
  gain.gain.setValueAtTime(0.0001, opts.start);
  gain.gain.exponentialRampToValueAtTime(peak, opts.start + attack);
  if (opts.curve === 'lin') {
    gain.gain.linearRampToValueAtTime(0.0001, opts.start + opts.duration);
  } else {
    gain.gain.exponentialRampToValueAtTime(0.0001, opts.start + opts.duration);
  }
  osc.connect(gain);
  const out = connectPan(ctx, gain, opts.pan);
  out.connect(dest);
  osc.start(opts.start);
  osc.stop(opts.start + opts.duration + 0.02);
  return osc;
}

export interface NoiseOpts {
  start: number;
  duration: number;
  peak: number;
  filterFreq?: number;
  filterType?: BiquadFilterType;
  pan?: number;
}

export function playNoise(ctx: AudioContext, dest: AudioNode, opts: NoiseOpts) {
  const src = ctx.createBufferSource();
  src.buffer = createNoiseBuffer(ctx, Math.max(0.05, opts.duration + 0.05));
  const filter = ctx.createBiquadFilter();
  filter.type = opts.filterType ?? 'bandpass';
  filter.frequency.setValueAtTime(opts.filterFreq ?? 1200, opts.start);
  filter.Q.value = 0.8;
  const gain = ctx.createGain();
  const peak = Math.max(0.0001, opts.peak);
  gain.gain.setValueAtTime(0.0001, opts.start);
  gain.gain.exponentialRampToValueAtTime(peak, opts.start + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, opts.start + opts.duration);
  src.connect(filter);
  filter.connect(gain);
  const out = connectPan(ctx, gain, opts.pan);
  out.connect(dest);
  src.start(opts.start);
  src.stop(opts.start + opts.duration + 0.02);
}

/** 짧은 피드백 딜레이로 공간감 */
export function createRoomBus(ctx: AudioContext, wet = 0.18): {
  input: GainNode;
  output: GainNode;
} {
  const input = ctx.createGain();
  const output = ctx.createGain();
  const dry = ctx.createGain();
  dry.gain.value = 1;
  input.connect(dry);
  dry.connect(output);

  const delay = ctx.createDelay(0.4);
  delay.delayTime.value = 0.08;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.22;
  const wetGain = ctx.createGain();
  wetGain.gain.value = wet;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 2800;

  input.connect(delay);
  delay.connect(filter);
  filter.connect(wetGain);
  wetGain.connect(output);
  filter.connect(feedback);
  feedback.connect(delay);

  return { input, output };
}

export function jitter(base: number, ratio: number): number {
  return base * (1 + (Math.random() * 2 - 1) * ratio);
}

export function pickVariant(count: number, last: number): number {
  if (count <= 1) return 0;
  let next = Math.floor(Math.random() * count);
  if (next === last) next = (next + 1 + Math.floor(Math.random() * (count - 1))) % count;
  return next;
}
