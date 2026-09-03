/**
 * Mobile Haptic Feedback Utility using the standard W3C Vibration API.
 * Provides tactile physical vibrations for mobile phone browsers (Android Chrome, Edge, Firefox, Samsung Internet).
 * Note: iOS Safari restricts navigator.vibrate() by Apple system policy.
 */

const canVibrate = (): boolean => {
  return typeof window !== 'undefined' && typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
};

export const haptic = {
  /**
   * Crisp 35ms pulse for tabs, category filters, and small toggles.
   * Long enough for physical vibration motors (ERM & LRA) to overcome inertia.
   */
  tick: () => {
    if (canVibrate()) {
      try {
        navigator.vibrate(35);
      } catch {
        // Safe no-op
      }
    }
  },

  /**
   * Solid 55ms pulse for standard buttons, theme switcher, and FAB buttons.
   */
  tap: () => {
    if (canVibrate()) {
      try {
        navigator.vibrate(55);
      } catch {
        // Safe no-op
      }
    }
  },

  /**
   * 75ms tactile pulse when opening modals, full-screen certificates, or photos.
   */
  openModal: () => {
    if (canVibrate()) {
      try {
        navigator.vibrate(75);
      } catch {
        // Safe no-op
      }
    }
  },

  /**
   * Distinct double-pulse [45ms, 60ms, 45ms] confirming actions like copy, download, or form submit.
   */
  success: () => {
    if (canVibrate()) {
      try {
        navigator.vibrate([45, 60, 45]);
      } catch {
        // Safe no-op
      }
    }
  },

  /**
   * Custom vibration pattern in milliseconds.
   */
  custom: (pattern: number | number[]) => {
    if (canVibrate()) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Safe no-op
      }
    }
  }
};

export default haptic;
