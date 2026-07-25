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
    window.addEventListener(AUDIO_SETTINGS_EVENT, onChange);
    return () => window.removeEventListener(AUDIO_SETTINGS_EVENT, onChange);
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
