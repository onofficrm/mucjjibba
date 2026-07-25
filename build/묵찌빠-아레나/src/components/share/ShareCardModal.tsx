import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Link2, Check } from 'lucide-react';
import { ShareCard } from './ShareCard';
import { buildShareCardData, buildShareLink, copyText } from '@/game/shareCard';
import type { GameLog, SharePrivacyOptions, ShareSettlementExtras } from '@/types/gameLog';
import { PrimaryButton, SecondaryButton } from '@/components/common/Buttons';
import { triggerHaptic } from '@/utils/haptics';
import { gameSettings } from '@/utils/gameSettings';
import { trackMission } from '@/services/mission';

interface Props {
  open: boolean;
  log: GameLog | null;
  settlement?: ShareSettlementExtras;
  onClose: () => void;
}

export function ShareCardModal({ open, log, settlement, onClose }: Props) {
  const [privacy, setPrivacy] = useState<SharePrivacyOptions>({
    maskOpponentNickname: true,
    hidePoints: false,
    hideProfileImage: false,
  });
  const [copied, setCopied] = useState(false);

  const card = useMemo(
    () => (log ? buildShareCardData(log, privacy, settlement) : null),
    [log, privacy, settlement],
  );

  useEffect(() => {
    if (open && log) {
      void trackMission('SHARE_CARD_OPENED');
    }
  }, [open, log?.gameId]);

  const toggle = (key: keyof SharePrivacyOptions) => {
    triggerHaptic('light');
    setPrivacy((p) => ({ ...p, [key]: !p[key] }));
  };

  const handleCopy = async () => {
    if (!log) return;
    triggerHaptic('medium');
    const ok = await copyText(buildShareLink(log.gameId));
    setCopied(ok);
    if (ok) setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {open && log && card && (
        <div className="overlay-area z-[60] flex items-end md:items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={
              gameSettings.options.reduceAnimations
                ? { opacity: 0 }
                : { y: 40, opacity: 0 }
            }
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-gray-900 border border-white/10 rounded-t-3xl md:rounded-3xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-white">하이라이트 카드</h2>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex justify-center mb-5">
              <ShareCard data={card} />
            </div>

            <div className="space-y-2 mb-5">
              <p className="text-xs text-gray-400 font-bold">개인정보 옵션</p>
              {(
                [
                  ['maskOpponentNickname', '상대 닉네임 마스킹'],
                  ['hidePoints', '포인트 숨기기'],
                  ['hideProfileImage', '프로필 이미지 숨기기'],
                ] as const
              ).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center justify-between bg-black/40 border border-white/5 rounded-xl px-3 py-2.5 text-sm text-white"
                >
                  <span>{label}</span>
                  <input
                    type="checkbox"
                    checked={privacy[key]}
                    onChange={() => toggle(key)}
                    className="w-4 h-4 accent-arena-cyan"
                  />
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <PrimaryButton onClick={() => void handleCopy()} className="flex-1 py-3 flex items-center justify-center gap-2">
                {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                {copied ? '복사됨' : '링크 복사'}
              </PrimaryButton>
              <SecondaryButton onClick={onClose} className="flex-1 py-3">
                닫기
              </SecondaryButton>
            </div>
            <p className="text-[10px] text-gray-500 text-center mt-3 font-bold">
              하이라이트 자동 생성 · 외부 공유 API 준비 전
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
