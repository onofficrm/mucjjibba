import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { audioManager } from '@/utils/audio';
import { triggerHaptic } from '@/utils/haptics';
import { gameSettings } from '@/utils/gameSettings';
import { resolveAssetUrl } from '@/utils/assetUrl';
import { HandGlyph } from '@/components/game/HandGlyph';
import {
  getMatchupKind,
  getWinningHand,
  MATCHUP_LABEL,
  VICTORY_CLASH_MS,
  type MatchupKind,
  type RpsHand,
} from '@/game/rpsMatchup';

import cutWebm from '@/assets/clash/cut.webm';
import cutMp4 from '@/assets/clash/cut.mp4';
import wrapWebm from '@/assets/clash/wrap.webm';
import wrapMp4 from '@/assets/clash/wrap.mp4';
import crushWebm from '@/assets/clash/crush.webm';
import crushMp4 from '@/assets/clash/crush.mp4';

const reduce = () =>
  gameSettings.shouldReduceAnimations() || gameSettings.options.performanceMode === 'low';

type Side = 'left' | 'right';

const CLASH_VIDEO: Record<MatchupKind, { webm: string; mp4: string }> = {
  cut: { webm: cutWebm, mp4: cutMp4 },
  wrap: { webm: wrapWebm, mp4: wrapMp4 },
  crush: { webm: crushWebm, mp4: crushMp4 },
};

const SUBTITLE: Record<MatchupKind, string> = {
  cut: '찌가 빠를 가위질!',
  wrap: '빠가 묵을 감싸버림!',
  crush: '묵이 찌를 부숴버림!',
};

/** 영상 실패 시 손 충돌 모션 폴백 */
function ClashMotionFallback({
  kind,
  leftHand,
  rightHand,
}: {
  kind: MatchupKind;
  leftHand: RpsHand;
  rightHand: RpsHand;
}) {
  return (
    <div className="relative w-full aspect-video max-h-[min(58vh,520px)] flex items-center justify-center overflow-hidden bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.35)_0%,transparent_55%)]" />
      <motion.div
        className="absolute left-[8%] sm:left-[14%]"
        initial={{ x: -120, rotate: -28, scale: 0.7, opacity: 0.5 }}
        animate={{ x: 28, rotate: 0, scale: 1.15, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        <HandGlyph hand={leftHand} theme="classic" size={96} />
      </motion.div>
      <motion.span
        className="relative z-10 font-display text-2xl sm:text-3xl font-black text-arena-gold"
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: [0.4, 1.35, 1], opacity: [0, 1, 0.85] }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {MATCHUP_LABEL[kind]}
      </motion.span>
      <motion.div
        className="absolute right-[8%] sm:right-[14%]"
        initial={{ x: 120, rotate: 28, scale: 0.7, opacity: 0.5 }}
        animate={{ x: -28, rotate: 0, scale: 1.15, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
        style={{ transform: 'scaleX(-1)' }}
      >
        <span className="inline-block" style={{ transform: 'scaleX(-1)' }}>
          <HandGlyph hand={rightHand} theme="classic" size={96} />
        </span>
      </motion.div>
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.55, 0] }}
        transition={{ duration: 0.45, delay: 0.42 }}
        style={{
          background:
            'radial-gradient(circle at center, rgba(255,200,80,0.85) 0%, transparent 45%)',
        }}
      />
    </div>
  );
}

/**
 * 전체화면 승부 영상 연출 — 찌>빠 / 빠>묵 / 묵>찌
 * 듀얼·심플 공통 (body 포털, 사이드바 제외 콘텐츠 영역)
 */
export function HandVictoryClash({
  playKey,
  leftHand,
  rightHand,
  winnerSide,
  onComplete,
}: {
  playKey: number;
  leftHand: RpsHand | null;
  rightHand: RpsHand | null;
  winnerSide?: Side | null;
  skinId?: string;
  onComplete?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<MatchupKind | null>(null);
  const [useFallback, setUseFallback] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const doneRef = useRef(false);

  const sources = useMemo(() => {
    if (!kind) return null;
    const raw = CLASH_VIDEO[kind];
    return {
      webm: resolveAssetUrl(raw.webm),
      mp4: resolveAssetUrl(raw.mp4),
    };
  }, [kind]);

  useEffect(() => {
    if (!playKey || !leftHand || !rightHand || reduce()) return;
    const winHand = getWinningHand(leftHand, rightHand);
    if (!winHand) return;
    const loseHand = winHand === leftHand ? rightHand : leftHand;
    const matchup = getMatchupKind(winHand, loseHand);
    if (!matchup) return;

    void winnerSide;
    doneRef.current = false;
    setUseFallback(false);
    setKind(matchup);
    setOpen(true);

    // 공개 스냅에서 이미 충돌음 — 영상 시작 시 관중 레이어만 추가
    audioManager.playSFX('crowd_swell', { intensity: 0.85 });
    triggerHaptic('heavy');
    window.setTimeout(() => triggerHaptic('medium'), 480);

    const t = window.setTimeout(() => {
      setOpen(false);
      if (!doneRef.current) {
        doneRef.current = true;
        window.setTimeout(() => onComplete?.(), 280);
      }
    }, VICTORY_CLASH_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playKey]);

  useEffect(() => {
    if (!open || !kind || !sources || useFallback) return;
    const v = videoRef.current;
    if (!v) return;

    const onError = () => setUseFallback(true);
    v.addEventListener('error', onError);

    // mp4 우선 (Safari/iOS) — source 태그 순서보다 src 직접 지정이 안정적
    v.muted = true;
    v.defaultMuted = true;
    v.playsInline = true;
    v.setAttribute('playsinline', 'true');
    v.setAttribute('webkit-playsinline', 'true');
    v.preload = 'auto';
    v.src = sources.mp4 || sources.webm;
    v.load();
    const play = v.play();
    if (play && typeof play.catch === 'function') {
      play.catch(() => {
        // 자동재생 실패 시 webm 재시도 → 그래도 실패하면 모션 폴백
        if (sources.webm && v.src !== sources.webm) {
          v.src = sources.webm;
          v.load();
          v.play().catch(() => setUseFallback(true));
        } else {
          setUseFallback(true);
        }
      });
    }

    // 로딩이 너무 느리면 폴백 (빈 화면 방지)
    const slow = window.setTimeout(() => {
      if (v.readyState < 2) setUseFallback(true);
    }, 900);

    return () => {
      v.removeEventListener('error', onError);
      window.clearTimeout(slow);
    };
  }, [open, kind, playKey, sources, useFallback]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && kind && leftHand && rightHand && (
        <motion.div
          key={`clash-vid-${playKey}`}
          className="overlay-area pointer-events-none z-[110] flex flex-col items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.28 } }}
          transition={{ duration: 0.2 }}
          aria-hidden
        >
          <motion.div
            className="absolute inset-0 bg-black/85 backdrop-blur-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.22)_0%,transparent_58%)]" />

          <motion.div
            className="relative z-10 w-full max-w-4xl flex flex-col items-center px-3 sm:px-6"
            initial={{ scale: 0.9, y: 24 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 1.04, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.28, duration: 0.5 }}
          >
            <motion.p
              className="font-display text-[11px] sm:text-xs font-black tracking-[0.35em] text-arena-gold mb-1.5"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              CLASH
            </motion.p>
            <motion.h2
              className="font-display text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight mb-1 text-center"
              style={{
                WebkitTextStroke: '2px #000',
                textShadow: '0 4px 0 #000, 0 0 40px rgba(245,158,11,0.45)',
              }}
              initial={{ opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: [0.75, 1.1, 1] }}
              transition={{ duration: 0.45 }}
            >
              {MATCHUP_LABEL[kind]}
            </motion.h2>
            <motion.p
              className="text-sm sm:text-base font-bold text-white/75 mb-4 sm:mb-5 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.12 }}
            >
              {SUBTITLE[kind]}
            </motion.p>

            {useFallback || !sources ? (
              <ClashMotionFallback kind={kind} leftHand={leftHand} rightHand={rightHand} />
            ) : (
              <motion.div
                className="relative w-full aspect-video max-h-[min(58vh,520px)] overflow-hidden bg-black"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.08, duration: 0.35 }}
              >
                <video
                  key={`vid-${playKey}-${kind}`}
                  ref={videoRef}
                  className="w-full h-full object-contain bg-black"
                  muted
                  playsInline
                  autoPlay
                  preload="auto"
                  disablePictureInPicture
                />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.45)_100%)]" />
              </motion.div>
            )}
          </motion.div>

          <motion.div
            className="absolute inset-0 bg-white pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 0.35, 0] }}
            transition={{ duration: 1.0, times: [0, 0.35, 0.42, 0.55] }}
          />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
