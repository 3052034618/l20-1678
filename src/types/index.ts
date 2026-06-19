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

export interface BeastDecorations {
  background: string | null;
  toy: string | null;
  title: string | null;
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
  decorations: BeastDecorations;
  ownedDecorations: string[];
  totalUrgeCount: number;
  totalCelebrateCount: number;
  bondStartDate: string;
}

export interface Candy {
  total: number;
  spent: number;
  fromCelebration: number;
  fromDaily: number;
}

export function getAvailableCandies(candy: Candy): number {
  return candy.total - candy.spent;
}

export interface UrgeMessage {
  id: string;
  workId: string;
  userName: string;
  avatar: string;
  message: string;
  isUser: boolean;
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

export type TimelineEventType = 'feed' | 'urge' | 'share' | 'celebrate' | 'subscribe' | 'decorate';

export interface TimelineEvent {
  id: string;
  workId: string;
  workTitle: string;
  workCover: string;
  type: TimelineEventType;
  description: string;
  emoji: string;
  timestamp: string;
}

export type ShopItemCategory = 'background' | 'toy' | 'title';

export interface ShopItem {
  id: string;
  name: string;
  category: ShopItemCategory;
  price: number;
  emoji: string;
  description: string;
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

export const EVENT_EMOJI: Record<TimelineEventType, string> = {
  feed: '💕',
  urge: '📣',
  share: '💌',
  celebrate: '🎉',
  subscribe: '🐾',
  decorate: '🏠',
};

export interface BeastDialogue {
  id: string;
  condition: 'level' | 'consecutive' | 'urge' | 'celebrate' | 'decorate' | 'fed';
  threshold: number;
  text: string;
}

export const BEAST_DIALOGUES: BeastDialogue[] = [
  { id: 'd1', condition: 'level', threshold: 1, text: '你好呀！以后请多关照啦~' },
  { id: 'd2', condition: 'fed', threshold: 1, text: '第一次被投喂，好温暖！' },
  { id: 'd3', condition: 'consecutive', threshold: 3, text: '连续三天都来看我，好开心呀~' },
  { id: 'd4', condition: 'urge', threshold: 1, text: '原来你在帮我催更呀，谢谢！' },
  { id: 'd5', condition: 'level', threshold: 2, text: '我们已经不是陌生人了呢！' },
  { id: 'd6', condition: 'consecutive', threshold: 7, text: '一周都没落下！你是最棒的陪伴者~' },
  { id: 'd7', condition: 'celebrate', threshold: 1, text: '等到了！一起庆祝吧！🎉' },
  { id: 'd8', condition: 'decorate', threshold: 1, text: '小窝变漂亮了！你有心啦~' },
  { id: 'd9', condition: 'level', threshold: 3, text: '和你在一起的日子，每天都值得期待！' },
  { id: 'd10', condition: 'consecutive', threshold: 14, text: '两周了...你是我的超级守护者！' },
  { id: 'd11', condition: 'celebrate', threshold: 3, text: '已经是第三次庆祝新章了！我们的默契越来越好了~' },
  { id: 'd12', condition: 'level', threshold: 4, text: '不管等多久，有你陪着就不孤单。' },
  { id: 'd13', condition: 'consecutive', threshold: 30, text: '一个月！你是我最重要的朋友！' },
  { id: 'd14', condition: 'urge', threshold: 5, text: '催更第5次了！你是催更小能手~' },
  { id: 'd15', condition: 'level', threshold: 5, text: '我们已经是灵魂羁绊了，永远陪着你！💖' },
];

export interface BondStats {
  companionshipDays: number;
  consecutiveFedDays: number;
  totalFedDays: number;
  totalUrgeCount: number;
  totalCelebrateCount: number;
  ownedDecoCount: number;
  level: number;
  levelTitle: string;
  unlockedDialogues: BeastDialogue[];
  nextDialogueHint: string | null;
}

export interface MonthlySummary {
  year: number;
  month: number;
  feedCount: number;
  urgeCount: number;
  shareCount: number;
  celebrateCount: number;
  decorateCount: number;
  totalCandyEarned: number;
  topWorkTitle: string;
  topWorkCover: string;
  consecutiveRecord: number;
}
