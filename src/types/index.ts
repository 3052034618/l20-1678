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

export interface UrgeState {
  workId: string;
  currentCount: number;
  targetCount: number;
  messages: UrgeMessage[];
  userHasUrged: boolean;
}

export interface CelebrationRecord {
  workId: string;
  chapterTitle: string;
  waitDays: number;
  celebratedAt: string;
  candiesCollected: number;
}
