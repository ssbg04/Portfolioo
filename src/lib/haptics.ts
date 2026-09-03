/**
 * Mobile Haptic Feedback Utility using the standard W3C Vibration API.
 * Provides tactile micro-vibrations for phone browsers (Android Chrome, Edge, Firefox, Samsung Internet).
 * Safely no-ops on desktop and iOS Safari without errors or overhead.
 */

const canVibrate = (): boolean => {
  return typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'vibrate' in navigator;
};

export const haptic = {
  /**
   * Ultra-short 8ms tick for tabs, category filters, and small toggle switches.
   */
  tick: () => {
    if (canVibrate()) {
      try {
        navigator.vibrate(8);
      } catch {
        // Safe no-op on devices with restricted permissions
      }
    }
  },

  /**
   * Crisp 15ms tap for standard buttons, theme switcher, and FAB buttons.
   */
  tap: () => {
    if (canVibrate()) {
      try {
        navigator.vibrate(15);
      } catch {
        // Safe no-op
      }
    }
  },

  /**
   * 20ms tactile pulse when opening modals, full-screen certificates, or photos.
   */
  openModal: () => {
    if (canVibrate()) {
      try {
        navigator.vibrate(20);
      } catch {
        // Safe no-op
      }
    }
  },

  /**
   * Double-pulse [15ms, 40ms, 20ms] confirming actions like copy to clipboard, download, or form submit.
   */
  success: () => {
    if (canVibrate()) {
      try {
        navigator.vibrate([15, 40, 20]);
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
