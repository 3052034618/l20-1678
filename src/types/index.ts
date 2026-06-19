export interface Work {
  id: string;
  title: string;
  author: string;
  cover: string;
  type: '漫画' | '小说';
  description: string;
  lastChapter: string;
  lastUpdateDate: string;
  daysSinceUpdate: number;
  popularity: number;
  hasNewChapter: boolean;
}

export type BeastStatus = 'energetic' | 'normal' | 'sleepy' | 'sleeping';

export interface BeastLevel {
  level: number;
  exp: number;
  title: string;
}

export interface MoodEntry {
  date: string;
  mood: 'happy' | 'content' | 'lonely' | 'sleepy' | 'ecstatic';
  event: string;
  emoji: string;
}

export interface Beast {
  id: string;
  workId: string;
  name: string;
  color: string;
  vitality: number;
  status: BeastStatus;
  fedToday: boolean;
  lastFedDate: string;
  totalFedDays: number;
  consecutiveFedDays: number;
  waitDays: number;
  level: BeastLevel;
  moodDiary: MoodEntry[];
}

export interface Candy {
  total: number;
  fromCelebration: number;
  fromDaily: number;
}

export interface UrgeMessage {
  id: string;
  workId: string;
  userName: string;
  avatar: string;
  message: string;
  createdAt: string;
}

export interface SupportCard {
  id: string;
  workId: string;
  workTitle: string;
  currentCount: number;
  targetCount: number;
  slogan: string;
  selectedMessages: string[];
  createdAt: string;
  shared: boolean;
}

export interface UrgeState {
  workId: string;
  currentCount: number;
  targetCount: number;
  messages: UrgeMessage[];
  userHasUrged: boolean;
  supportCard: SupportCard | null;
}

export interface CelebrationRecord {
  id: string;
  workId: string;
  chapterTitle: string;
  waitDays: number;
  celebratedAt: string;
  candiesCollected: number;
}

export const MOOD_MAP: Record<BeastStatus, { mood: MoodEntry['mood']; emoji: string }> = {
  energetic: { mood: 'ecstatic', emoji: '😆' },
  normal: { mood: 'content', emoji: '😊' },
  sleepy: { mood: 'sleepy', emoji: '😪' },
  sleeping: { mood: 'lonely', emoji: '😢' },
};

export const LEVEL_TITLES: Record<number, string> = {
  1: '初遇小萌',
  2: '熟悉伙伴',
  3: '默契搭档',
  4: '挚友默契',
  5: '灵魂羁绊',
};

export function getLevelFromExp(exp: number): BeastLevel {
  const thresholds = [0, 30, 80, 160, 300];
  let level = 1;
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (exp >= thresholds[i]) {
      level = i + 1;
      break;
    }
  }
  return {
    level,
    exp,
    title: LEVEL_TITLES[level] || '灵魂羁绊',
  };
}

export function getExpForNextLevel(currentLevel: number): number {
  const thresholds = [0, 30, 80, 160, 300];
  if (currentLevel >= thresholds.length) return thresholds[thresholds.length - 1];
  return thresholds[currentLevel];
}
