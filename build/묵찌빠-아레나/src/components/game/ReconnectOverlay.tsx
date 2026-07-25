import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WifiOff, RefreshCw } from 'lucide-react';
import type { ConnectionStatus } from '@/realtime/types';
import { gameSettings } from '@/utils/gameSettings';

const LABELS: Record<ConnectionStatus, string> = {
  connected: '연결됨',
  disconnected: '연결 끊김',
  reconnecting: '자동 재접속 중…',
  restoring: '서버 스냅샷 복구 중…',
  resumed: '게임 재개',
  failed: '재연결 실패',
};

export function ReconnectOverlay({
  status,
  onRetry,
}: {
  status: ConnectionStatus;
  onRetry?: () => void;
}) {
  const visible = status === 'disconnected' || status === 'reconnecting' || status === 'restoring' || status === 'failed';
  const reduce = gameSettings.options.reduceAnimations;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
        >
          <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-gray-900 p-5 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
              {status === 'failed' ? (
                <WifiOff className="w-6 h-6 text-arena-error" />
              ) : (
                <RefreshCw className={`w-6 h-6 text-arena-cyan ${status !== 'disconnected' ? 'animate-spin' : ''}`} />
              )}
            </div>
            <p className="text-sm font-black text-white mb-1">{LABELS[status]}</p>
            <p className="text-[11px] text-gray-400 font-bold mb-4">
              게임 화면은 유지됩니다. 점수·공격권·타이머를 서버 기준으로 복구합니다.
            </p>
            {status === 'failed' && onRetry && (
              <button
                onClick={onRetry}
                className="w-full py-3 rounded-xl bg-arena-cyan text-black text-xs font-black"
              >
                다시 시도
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ConnectionBadge({ status }: { status: ConnectionStatus }) {
  const color =
    status === 'connected' || status === 'resumed'
      ? 'bg-arena-success'
      : status === 'failed'
        ? 'bg-arena-error'
        : 'bg-arena-warning';
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-gray-300">
      <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
      {LABELS[status]}
    </span>
  );
}
