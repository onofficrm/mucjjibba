export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') => {
  if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
    // Check if animations/haptics are disabled in user settings
    const hapticsEnabled = localStorage.getItem('arena_haptics') !== 'false';
    if (!hapticsEnabled) return;

    switch (type) {
      case 'light':
        window.navigator.vibrate(10);
        break;
      case 'medium':
        window.navigator.vibrate(20);
        break;
      case 'heavy':
        window.navigator.vibrate(40);
        break;
      case 'success':
        window.navigator.vibrate([10, 30, 20]);
        break;
      case 'warning':
        window.navigator.vibrate([20, 20, 20]);
        break;
      case 'error':
        window.navigator.vibrate([30, 40, 30, 40, 30]);
        break;
    }
  }
};
