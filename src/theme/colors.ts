/**
 * FitTrack — dark palette (Twinkle-inspired reference).
 */
export const colors = {
  background: '#1F222B',
  /** Cards / secondary surfaces */
  surface: '#515D6E',
  surfaceElevated: '#5a6577',
  /** Muted teal-gray */
  sage: '#91A1A2',
  /** Warm sand — headings, progress, CTAs */
  accent: '#B99C7C',
  /** Body text on dark */
  text: '#F4F1EC',
  textMuted: '#C4C9CC',
  /** Hairlines / borders */
  border: '#3a3f4a',
  /** Hero gradients (charcoal → slate / tan) */
  heroSteps: ['#1F222B', '#2a303c', '#515D6E'] as const,
  heroCalories: ['#1F222B', '#323642', '#B99C7C'] as const,
  /** Ring + unit label when current exceeds goal (calories / steps) */
  goalExceeded: '#D96666',
  /** Ring (full-screen hero) */
  ringTrack: 'rgba(145, 161, 162, 0.35)',
  ringProgress: '#B99C7C',
  /** Compact ring on slate cards */
  ringTrackOnCard: 'rgba(31, 34, 43, 0.45)',
  /** Tab bar */
  tabBar: '#252830',
  tabActivePill: 'rgba(185, 156, 124, 0.22)',
} as const;
