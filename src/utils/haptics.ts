export const triggerHaptic = (
  type: 'click' | 'scrub',
  enabled: boolean
) => {
  if (!enabled || typeof navigator === 'undefined' || !navigator.vibrate) {
    return;
  }

  if (type === 'click') {
    navigator.vibrate(20);
  } else if (type === 'scrub') {
    navigator.vibrate(10);
  }
};
