import { useCallback, useEffect, useState } from 'react';
import { audioManager, AUDIO_SETTINGS_EVENT, type VolumeSettings } from '@/utils/audio';
import { triggerHaptic } from '@/utils/haptics';

/** 음소거 상태를 화면 간 동기화하는 훅 */
export function useSoundMuted() {
  const [muted, setMuted] = useState<boolean>(() => audioManager.settings.mute);

  useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<VolumeSettings>).detail;
      setMuted(detail ? detail.mute : audioManager.settings.mute);
    };
    // 다른 탭/프레임에서 바꾼 경우도 반영 (같은 창은 커스텀 이벤트로 즉시 동기화)
    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key !== 'arena_audio_settings') return;
      audioManager.reloadAndApplySettings();
    };
    window.addEventListener(AUDIO_SETTINGS_EVENT, onChange);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(AUDIO_SETTINGS_EVENT, onChange);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const setMutedValue = useCallback((next: boolean) => {
    audioManager.updateSetting('mute', next);
  }, []);

  const toggleMuted = useCallback(() => {
    triggerHaptic('light');
    audioManager.updateSetting('mute', !audioManager.settings.mute);
  }, []);

  return { muted, soundEnabled: !muted, setMuted: setMutedValue, toggleMuted };
}
