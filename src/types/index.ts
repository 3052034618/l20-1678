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
  shortComment: string;
}

export interface Achievement {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'consecutive' | 'feed' | 'urge' | 'celebrate' | 'decorate' | 'level';
  tier: number;
  threshold: number;
}

export const ACHIEVEMENT_LIST: Achievement[] = [
  { id: 'consecutive-1', name: '初遇守候', icon: '🌱', description: '连续投喂 3 天', category: 'consecutive', tier: 1, threshold: 3 },
  { id: 'consecutive-2', name: '一周陪伴', icon: '⭐', description: '连续投喂 7 天', category: 'consecutive', tier: 2, threshold: 7 },
  { id: 'consecutive-3', name: '半月守护', icon: '🌟', description: '连续投喂 15 天', category: 'consecutive', tier: 3, threshold: 15 },
  { id: 'consecutive-4', name: '月度羁绊', icon: '💫', description: '连续投喂 30 天', category: 'consecutive', tier: 4, threshold: 30 },

  { id: 'feed-1', name: '初次投喂', icon: '🍬', description: '累计投喂 5 天', category: 'feed', tier: 1, threshold: 5 },
  { id: 'feed-2', name: '投喂达人', icon: '🍭', description: '累计投喂 20 天', category: 'feed', tier: 2, threshold: 20 },
  { id: 'feed-3', name: '守护天使', icon: '💝', description: '累计投喂 50 天', category: 'feed', tier: 3, threshold: 50 },

  { id: 'urge-1', name: '温柔催促', icon: '💌', description: '催更 3 次', category: 'urge', tier: 1, threshold: 3 },
  { id: 'urge-2', name: '催更小能手', icon: '📣', description: '催更 10 次', category: 'urge', tier: 2, threshold: 10 },
  { id: 'urge-3', name: '应援队长', icon: '🏆', description: '催更 25 次', category: 'urge', tier: 3, threshold: 25 },

  { id: 'celebrate-1', name: '初次相遇', icon: '🎉', description: '庆祝 1 次新章', category: 'celebrate', tier: 1, threshold: 1 },
  { id: 'celebrate-2', name: '盼更守望', icon: '🎊', description: '庆祝 5 次新章', category: 'celebrate', tier: 2, threshold: 5 },
  { id: 'celebrate-3', name: '不离不弃', icon: '🌈', description: '庆祝 10 次新章', category: 'celebrate', tier: 3, threshold: 10 },

  { id: 'decorate-1', name: '初次装饰', icon: '🎨', description: '拥有 2 件装饰', category: 'decorate', tier: 1, threshold: 2 },
  { id: 'decorate-2', name: '温馨小窝', icon: '🏠', description: '拥有 5 件装饰', category: 'decorate', tier: 2, threshold: 5 },
  { id: 'decorate-3', name: '收藏家', icon: '👑', description: '拥有 9 件装饰', category: 'decorate', tier: 3, threshold: 9 },

  { id: 'level-1', name: '熟悉伙伴', icon: '🐾', description: '达到 Lv.2', category: 'level', tier: 1, threshold: 2 },
  { id: 'level-2', name: '默契搭档', icon: '🤝', description: '达到 Lv.3', category: 'level', tier: 2, threshold: 3 },
  { id: 'level-3', name: '灵魂羁绊', icon: '💖', description: '达到 Lv.5', category: 'level', tier: 3, threshold: 5 },
];

export interface WorkInteractionStats {
  favoriteAction: 'feed' | 'urge' | 'celebrate' | 'decorate';
  favoriteCount: number;
  recent7Days: TimelineEvent[];
}

export function getUnlockedAchievements(beast: Beast): Achievement[] {
  return ACHIEVEMENT_LIST.filter(a => {
    switch (a.category) {
      case 'consecutive': return beast.consecutiveFedDays >= a.threshold;
      case 'feed': return beast.totalFedDays >= a.threshold;
      case 'urge': return beast.totalUrgeCount >= a.threshold;
      case 'celebrate': return beast.totalCelebrateCount >= a.threshold;
      case 'decorate': return beast.ownedDecorations.length >= a.threshold;
      case 'level': return beast.level.level >= a.threshold;
      default: return false;
    }
  });
}

export function generateMonthlyShortComment(summary: MonthlySummary, isSingleWork: boolean, workTitle?: string): string {
  const actions = summary.feedCount + summary.urgeCount + summary.celebrateCount + summary.decorateCount;

  if (actions === 0) {
    return isSingleWork
      ? `这个月还没和《${workTitle || ''}》的小兽互动，下个月要多陪陪它哦~`
      : '这个月几乎没打开追更陪伴，下个月希望能多见到你呀！';
  }

  const highlights: string[] = [];

  if (summary.feedCount > 0) {
    if (summary.consecutiveRecord >= 30) highlights.push(`连续投喂了${summary.consecutiveRecord}天，真是超级守护者！`);
    else if (summary.consecutiveRecord >= 7) highlights.push(`创下${summary.consecutiveRecord}天连投纪录，毅力可嘉~`);
    else highlights.push(`投喂了${summary.feedCount}次，小兽肚子圆滚滚的啦`);
  }

  if (summary.celebrateCount > 0) {
    highlights.push(`等到了${summary.celebrateCount}次新章，${isSingleWork ? '它' : '作者们'}没有辜负你的期待！`);
  }

  if (summary.urgeCount > 0 && summary.shareCount > 0) {
    highlights.push(`催更${summary.urgeCount}次还分享了${summary.shareCount}次，是热情的应援者！`);
  } else if (summary.urgeCount > 0) {
    highlights.push(`温柔催更${summary.urgeCount}次，是默默支持的小可爱~`);
  }

  if (summary.decorateCount > 0) {
    highlights.push(`给小窝添了${summary.decorateCount}件装饰，经营得有声有色！`);
  }

  if (summary.totalCandyEarned >= 50) {
    highlights.push(`赚了${summary.totalCandyEarned}颗糖果，小钱包鼓鼓的~`);
  }

  if (isSingleWork && workTitle && summary.topWorkTitle) {
    return `【${workTitle}】这个月${highlights.slice(0, 2).join('，')}。继续一起等更新吧！`;
  }

  if (summary.topWorkTitle) {
    return `本月最陪伴${summary.topWorkCover}《${summary.topWorkTitle}》，${highlights.slice(0, 2).join('，')}。下月也请多多关照~`;
  }

  return highlights.slice(0, 2).join('，') + '。下月见！';
}
