import { create } from 'zustand';
import type { Work, Beast, BeastStatus, Candy, UrgeState, UrgeMessage, CelebrationRecord, SupportCard, MoodEntry, TimelineEvent, TimelineEventType, ShopItem, BondStats, MonthlySummary, WorkInteractionStats } from '../types';
import { MOOD_MAP, getLevelFromExp, getAvailableCandies, BEAST_DIALOGUES, generateMonthlyShortComment } from '../types';
import { mockWorks, urgeStates as mockUrgeStates, beastColors, encouragementMessages, supportCardSlogans, shopItems } from '../data/mockWorks';
import { loadFromStorage, saveToStorage, isSameDay, getDaysSince, generateBeastName } from '../utils/storage';

interface GameState {
  works: Work[];
  subscribedWorkIds: string[];
  beasts: Record<string, Beast>;
  candies: Candy;
  urgeStates: Record<string, UrgeState>;
  celebrationRecords: CelebrationRecord[];
  collectedChapterIds: string[];
  timeline: TimelineEvent[];
  shopItems: ShopItem[];

  subscribeWork: (workId: string) => void;
  unsubscribeWork: (workId: string) => void;
  feedBeast: (workId: string) => void;
  urgeUpdate: (workId: string, message: string) => void;
  markSupportCardShared: (workId: string) => void;
  collectCandy: (workId: string) => void;
  isChapterCollected: (workId: string, chapterTitle: string) => boolean;
  purchaseShopItem: (workId: string, itemId: string) => boolean;
  equipDecoration: (workId: string, itemId: string) => void;
  resetDecorations: (workId: string) => void;
  getBeastForWork: (workId: string) => Beast | undefined;
  getUrgeStateForWork: (workId: string) => UrgeState | undefined;
  getCelebrationHistory: (workId: string) => CelebrationRecord[];
  getTimelineForDay: (dateStr: string) => TimelineEvent[];
  getTimelineForWork: (workId: string) => TimelineEvent[];
  getBondProfile: (workId: string) => BondStats | null;
  getMonthlySummary: (year: number, month: number, workId?: string) => MonthlySummary | null;
  getWorkInteractionStats: (workId: string) => WorkInteractionStats;
  checkDailyReset: () => void;
  getEncouragementMessages: () => string[];
  getAvailableCandies: () => number;
}

function calculateVitality(daysSinceUpdate: number, hasFed: boolean): number {
  let vitality = 100 - daysSinceUpdate * 3;
  if (hasFed) vitality += 10;
  return Math.max(0, Math.min(100, vitality));
}

function getStatusFromVitality(vitality: number): BeastStatus {
  if (vitality > 80) return 'energetic';
  if (vitality > 50) return 'normal';
  if (vitality > 30) return 'sleepy';
  return 'sleeping';
}

function addMoodEntry(diary: MoodEntry[], entry: MoodEntry): MoodEntry[] {
  const today = new Date().toDateString();
  const filtered = diary.filter(d => new Date(d.date).toDateString() !== today);
  return [entry, ...filtered].slice(0, 30);
}

function addTimelineEvent(events: TimelineEvent[], event: TimelineEvent): TimelineEvent[] {
  return [event, ...events].slice(0, 200);
}

function buildSupportCardMessages(messages: UrgeMessage[]): string[] {
  const userMsgs = [...messages.filter(m => m.isUser)].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const otherMsgs = [...messages.filter(m => !m.isUser)].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const selected: string[] = [];
  for (const m of userMsgs) {
    if (selected.length >= 2) break;
    selected.push(m.message);
  }
  for (const m of otherMsgs) {
    if (selected.length >= 3) break;
    if (!selected.includes(m.message)) selected.push(m.message);
  }
  return selected.slice(0, 3);
}

function persist(state: Partial<GameState>) {
  const s = state as any;
  saveToStorage({
    subscribedWorkIds: s.subscribedWorkIds,
    beasts: s.beasts,
    candies: s.candies,
    urgeStates: s.urgeStates,
    celebrationRecords: s.celebrationRecords,
    collectedChapterIds: s.collectedChapterIds,
    timeline: s.timeline,
    lastCheckDate: new Date().toDateString(),
  });
}

function createBeast(work: Work): Beast {
  const colorIndex = Math.floor(Math.random() * beastColors.length);
  const vitality = calculateVitality(work.daysSinceUpdate, false);
  const status = getStatusFromVitality(vitality);
  const moodInfo = MOOD_MAP[status];

  return {
    id: `beast-${work.id}`,
    workId: work.id,
    name: generateBeastName(),
    color: beastColors[colorIndex],
    vitality,
    status,
    fedToday: false,
    lastFedDate: '',
    totalFedDays: 0,
    consecutiveFedDays: 0,
    waitDays: work.daysSinceUpdate,
    level: getLevelFromExp(0),
    moodDiary: [{
      date: new Date().toISOString(),
      mood: moodInfo.mood,
      event: `和 ${work.title} 的小兽初遇了！`,
      emoji: '🐾',
    }],
    decorations: { background: null, toy: null, title: null },
    ownedDecorations: [],
    totalUrgeCount: 0,
    totalCelebrateCount: 0,
    bondStartDate: new Date().toISOString(),
  };
}

const storageData = loadFromStorage();

const initialBeasts: Record<string, Beast> = {};
Object.keys(storageData.beasts).forEach(key => {
  const b = storageData.beasts[key];
  initialBeasts[key] = {
    ...b,
    level: b.level || getLevelFromExp(b.totalFedDays * 2),
    moodDiary: b.moodDiary || [],
    decorations: b.decorations || { background: null, toy: null, title: null },
    ownedDecorations: b.ownedDecorations || [],
    totalUrgeCount: b.totalUrgeCount || 0,
    totalCelebrateCount: b.totalCelebrateCount || 0,
    bondStartDate: b.bondStartDate || new Date().toISOString(),
  };
});

function runDailyResetOnLoad() {
  const today = new Date().toDateString();
  if (storageData.lastCheckDate && !isSameDay(storageData.lastCheckDate, today)) {
    Object.keys(initialBeasts).forEach(workId => {
      const beast = initialBeasts[workId];
      const work = mockWorks.find(w => w.id === workId);
      if (work) {
        const daysSinceUpdate = getDaysSince(work.lastUpdateDate);
        const newVitality = calculateVitality(daysSinceUpdate, false);
        const newStatus = getStatusFromVitality(newVitality);
        initialBeasts[workId] = {
          ...beast,
          fedToday: false,
          vitality: newVitality,
          status: newStatus,
          waitDays: daysSinceUpdate,
        };
      }
    });

    Object.keys(storageData.urgeStates).forEach(workId => {
      storageData.urgeStates[workId] = {
        ...storageData.urgeStates[workId],
        userHasUrged: false,
      };
    });

    saveToStorage({
      ...storageData,
      beasts: initialBeasts,
      urgeStates: storageData.urgeStates,
      lastCheckDate: today,
    });
  }
}

runDailyResetOnLoad();

function getUnlockedDialogues(beast: Beast): typeof BEAST_DIALOGUES {
  return BEAST_DIALOGUES.filter(d => {
    switch (d.condition) {
      case 'level': return beast.level.level >= d.threshold;
      case 'consecutive': return beast.consecutiveFedDays >= d.threshold;
      case 'urge': return beast.totalUrgeCount >= d.threshold;
      case 'celebrate': return beast.totalCelebrateCount >= d.threshold;
      case 'decorate': return beast.ownedDecorations.length >= d.threshold;
      case 'fed': return beast.totalFedDays >= d.threshold;
      default: return false;
    }
  });
}

function getNextDialogueHint(beast: Beast): string | null {
  const unlocked = getUnlockedDialogues(beast);
  const unlockedIds = new Set(unlocked.map(d => d.id));
  const next = BEAST_DIALOGUES.find(d => !unlockedIds.has(d.id));
  if (!next) return null;
  const labels: Record<string, string> = {
    level: `等级达到 ${next.threshold}`,
    consecutive: `连续投喂 ${next.threshold} 天`,
    urge: `催更 ${next.threshold} 次`,
    celebrate: `庆祝新章 ${next.threshold} 次`,
    decorate: `拥有 ${next.threshold} 件装饰`,
    fed: `累计投喂 ${next.threshold} 天`,
  };
  return `解锁条件：${labels[next.condition] || ''}`;
}

export const useGameStore = create<GameState>((set, get) => ({
  works: mockWorks,
  subscribedWorkIds: storageData.subscribedWorkIds,
  beasts: initialBeasts,
  candies: storageData.candies,
  urgeStates: storageData.urgeStates,
  celebrationRecords: storageData.celebrationRecords,
  collectedChapterIds: storageData.collectedChapterIds,
  timeline: storageData.timeline,
  shopItems,

  subscribeWork: (workId: string) => {
    const work = get().works.find(w => w.id === workId);
    if (!work) return;

    const beast = createBeast(work);
    const urgeState = mockUrgeStates[workId] || {
      workId,
      currentCount: Math.floor(Math.random() * 200) + 50,
      targetCount: 500,
      messages: [],
      userHasUrged: false,
      supportCard: null,
    };

    set(state => {
      const newTimeline = addTimelineEvent(state.timeline, {
        id: `tl-${Date.now()}`,
        workId,
        workTitle: work.title,
        workCover: work.cover,
        type: 'subscribe',
        description: `订阅了《${work.title}》，${beast.name}出生啦！`,
        emoji: '🐾',
        timestamp: new Date().toISOString(),
      });

      const newState = {
        subscribedWorkIds: [...state.subscribedWorkIds, workId],
        beasts: { ...state.beasts, [workId]: beast },
        urgeStates: { ...state.urgeStates, [workId]: urgeState },
        timeline: newTimeline,
      };
      persist({ ...state, ...newState });
      return newState;
    });
  },

  unsubscribeWork: (workId: string) => {
    set(state => {
      const newBeasts = { ...state.beasts };
      delete newBeasts[workId];
      const newUrgeStates = { ...state.urgeStates };
      delete newUrgeStates[workId];
      const newState = {
        subscribedWorkIds: state.subscribedWorkIds.filter(id => id !== workId),
        beasts: newBeasts,
        urgeStates: newUrgeStates,
      };
      persist({ ...state, ...newState });
      return newState;
    });
  },

  feedBeast: (workId: string) => {
    const today = new Date().toDateString();
    set(state => {
      const beast = state.beasts[workId];
      if (!beast || beast.fedToday) return state;

      const work = state.works.find(w => w.id === workId);
      if (!work) return state;

      const daysSinceUpdate = getDaysSince(work.lastUpdateDate);
      const newVitality = calculateVitality(daysSinceUpdate, true);

      let consecutiveDays = beast.consecutiveFedDays;
      if (beast.lastFedDate) {
        const lastFed = new Date(beast.lastFedDate);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (isSameDay(lastFed.toDateString(), yesterday.toDateString())) {
          consecutiveDays += 1;
        } else if (!isSameDay(beast.lastFedDate, today)) {
          consecutiveDays = 1;
        }
      } else {
        consecutiveDays = 1;
      }

      const newExp = beast.level.exp + 2;
      const newLevel = getLevelFromExp(newExp);
      const newStatus = getStatusFromVitality(newVitality);

      const newBeast: Beast = {
        ...beast,
        vitality: newVitality,
        status: newStatus,
        fedToday: true,
        lastFedDate: today,
        totalFedDays: beast.totalFedDays + 1,
        consecutiveFedDays: consecutiveDays,
        level: newLevel,
        moodDiary: addMoodEntry(beast.moodDiary, {
          date: new Date().toISOString(),
          mood: 'happy',
          event: consecutiveDays > 1 ? `连续投喂第${consecutiveDays}天！` : '今天也来投喂啦~',
          emoji: consecutiveDays >= 7 ? '🔥' : '💕',
        }),
      };

      const newCandies = {
        ...state.candies,
        total: state.candies.total + 1,
        fromDaily: state.candies.fromDaily + 1,
      };

      const newTimeline = addTimelineEvent(state.timeline, {
        id: `tl-${Date.now()}`,
        workId,
        workTitle: work.title,
        workCover: work.cover,
        type: 'feed',
        description: `投喂了${beast.name}，连续第${consecutiveDays}天`,
        emoji: '💕',
        timestamp: new Date().toISOString(),
      });

      const newBeasts = { ...state.beasts, [workId]: newBeast };
      const updated = { beasts: newBeasts, candies: newCandies, timeline: newTimeline };
      persist({ ...state, ...updated });
      return updated;
    });
  },

  urgeUpdate: (workId: string, message: string) => {
    set(state => {
      const urgeState = state.urgeStates[workId];
      if (!urgeState || urgeState.userHasUrged) return state;

      const work = state.works.find(w => w.id === workId);
      if (!work) return state;

      const newMessage: UrgeMessage = {
        id: `msg-${Date.now()}`,
        workId,
        userName: '我',
        avatar: '😊',
        message,
        isUser: true,
        createdAt: new Date().toISOString(),
      };

      const newCurrentCount = urgeState.currentCount + 1;
      let newSupportCard = urgeState.supportCard;

      if (newCurrentCount >= urgeState.targetCount && !urgeState.supportCard) {
        const allMessages = [...urgeState.messages, newMessage];
        const selectedMsgs = buildSupportCardMessages(allMessages);
        newSupportCard = {
          id: `card-${Date.now()}`,
          workId,
          workTitle: work.title,
          currentCount: newCurrentCount,
          targetCount: urgeState.targetCount,
          slogan: supportCardSlogans[Math.floor(Math.random() * supportCardSlogans.length)],
          selectedMessages: selectedMsgs,
          createdAt: new Date().toISOString(),
          shared: false,
        };
      } else if (urgeState.supportCard) {
        const allMessages = [...urgeState.messages, newMessage];
        const selectedMsgs = buildSupportCardMessages(allMessages);
        newSupportCard = {
          ...urgeState.supportCard,
          currentCount: newCurrentCount,
          selectedMessages: selectedMsgs,
        };
      }

      const newUrgeState: UrgeState = {
        ...urgeState,
        currentCount: newCurrentCount,
        messages: [...urgeState.messages, newMessage],
        userHasUrged: true,
        supportCard: newSupportCard,
      };

      const newUrgeStates = { ...state.urgeStates, [workId]: newUrgeState };

      const beast = state.beasts[workId];
      const newBeasts = { ...state.beasts };
      if (beast) {
        const newExp = beast.level.exp + 1;
        newBeasts[workId] = {
          ...beast,
          level: getLevelFromExp(newExp),
          totalUrgeCount: beast.totalUrgeCount + 1,
          moodDiary: addMoodEntry(beast.moodDiary, {
            date: new Date().toISOString(),
            mood: 'content',
            event: '参加了集体催更，为作者加油！',
            emoji: '📣',
          }),
        };
      }

      const newTimeline = addTimelineEvent(state.timeline, {
        id: `tl-${Date.now()}`,
        workId,
        workTitle: work.title,
        workCover: work.cover,
        type: 'urge',
        description: `为《${work.title}》催更：${message}`,
        emoji: '📣',
        timestamp: new Date().toISOString(),
      });

      const updated = { urgeStates: newUrgeStates, beasts: newBeasts, timeline: newTimeline };
      persist({ ...state, ...updated });
      return updated;
    });
  },

  markSupportCardShared: (workId: string) => {
    set(state => {
      const urgeState = state.urgeStates[workId];
      if (!urgeState?.supportCard) return state;

      if (urgeState.supportCard.shared) return state;

      const newSupportCard = { ...urgeState.supportCard, shared: true };
      const newUrgeState = { ...urgeState, supportCard: newSupportCard };
      const newUrgeStates = { ...state.urgeStates, [workId]: newUrgeState };

      const work = state.works.find(w => w.id === workId);
      const beast = state.beasts[workId];
      const newBeasts = { ...state.beasts };
      if (beast) {
        const newExp = beast.level.exp + 3;
        newBeasts[workId] = {
          ...beast,
          level: getLevelFromExp(newExp),
          moodDiary: addMoodEntry(beast.moodDiary, {
            date: new Date().toISOString(),
            mood: 'ecstatic',
            event: '应援卡分享成功！大家的期待送达了~',
            emoji: '🎊',
          }),
        };
      }

      const newTimeline = addTimelineEvent(state.timeline, {
        id: `tl-${Date.now()}`,
        workId,
        workTitle: work?.title || '',
        workCover: work?.cover || '📖',
        type: 'share',
        description: `分享《${work?.title || ''}》应援卡`,
        emoji: '💌',
        timestamp: new Date().toISOString(),
      });

      const updated = { urgeStates: newUrgeStates, beasts: newBeasts, timeline: newTimeline };
      persist({ ...state, ...updated });
      return updated;
    });
  },

  collectCandy: (workId: string) => {
    set(state => {
      const work = state.works.find(w => w.id === workId);
      if (!work) return state;

      const chapterId = `${workId}-${work.lastChapter}`;
      if (state.collectedChapterIds.includes(chapterId)) return state;

      const beast = state.beasts[workId];
      const waitDays = beast ? beast.waitDays : work.daysSinceUpdate;
      const candyReward = Math.min(10, Math.max(3, Math.floor(10 - waitDays / 3)));

      const newRecord: CelebrationRecord = {
        id: `cele-${Date.now()}`,
        workId,
        chapterTitle: work.lastChapter,
        waitDays,
        celebratedAt: new Date().toISOString(),
        candiesCollected: candyReward,
      };

      const newCandies = {
        ...state.candies,
        total: state.candies.total + candyReward,
        fromCelebration: state.candies.fromCelebration + candyReward,
      };

      const newBeasts = { ...state.beasts };
      if (newBeasts[workId]) {
        const newExp = newBeasts[workId].level.exp + 5;
        newBeasts[workId] = {
          ...newBeasts[workId],
          vitality: 100,
          status: 'energetic' as BeastStatus,
          waitDays: 0,
          level: getLevelFromExp(newExp),
          totalCelebrateCount: newBeasts[workId].totalCelebrateCount + 1,
          moodDiary: addMoodEntry(newBeasts[workId].moodDiary, {
            date: new Date().toISOString(),
            mood: 'ecstatic',
            event: `${work.lastChapter} 更新了！等了${waitDays}天，领到${candyReward}颗糖果！`,
            emoji: '🎉',
          }),
        };
      }

      const newWorks = state.works.map(w =>
        w.id === workId ? { ...w, hasNewChapter: false, daysSinceUpdate: 0, lastUpdateDate: new Date().toISOString() } : w
      );

      const newRecords = [...state.celebrationRecords, newRecord];
      const newCollectedChapterIds = [...state.collectedChapterIds, chapterId];

      const newTimeline = addTimelineEvent(state.timeline, {
        id: `tl-${Date.now()}`,
        workId,
        workTitle: work.title,
        workCover: work.cover,
        type: 'celebrate',
        description: `《${work.title}》${work.lastChapter}更新！等了${waitDays}天，领到${candyReward}颗糖果`,
        emoji: '🎉',
        timestamp: new Date().toISOString(),
      });

      const updated = {
        works: newWorks,
        beasts: newBeasts,
        candies: newCandies,
        celebrationRecords: newRecords,
        collectedChapterIds: newCollectedChapterIds,
        timeline: newTimeline,
      };
      persist({ ...state, ...updated });
      return updated;
    });
  },

  isChapterCollected: (workId: string, chapterTitle: string) => {
    const chapterId = `${workId}-${chapterTitle}`;
    return get().collectedChapterIds.includes(chapterId);
  },

  purchaseShopItem: (workId: string, itemId: string): boolean => {
    const item = shopItems.find(i => i.id === itemId);
    if (!item) return false;

    const beast = get().beasts[workId];
    if (!beast) return false;

    if (beast.ownedDecorations.includes(itemId)) {
      return false;
    }

    const available = getAvailableCandies(get().candies);
    if (available < item.price) return false;

    let success = false;
    set(state => {
      const b = state.beasts[workId];
      if (!b) return state;

      if (b.ownedDecorations.includes(itemId)) return state;

      const avail = getAvailableCandies(state.candies);
      if (avail < item.price) return state;

      const newDecorations = { ...b.decorations, [item.category]: itemId };
      const newOwnedDecorations = [...b.ownedDecorations, itemId];
      const newBeast: Beast = {
        ...b,
        decorations: newDecorations,
        ownedDecorations: newOwnedDecorations,
        moodDiary: addMoodEntry(b.moodDiary, {
          date: new Date().toISOString(),
          mood: 'ecstatic',
          event: `小窝换上了${item.name}！${item.description}`,
          emoji: '🏠',
        }),
      };

      const newCandies = {
        ...state.candies,
        spent: state.candies.spent + item.price,
      };

      const work = state.works.find(w => w.id === workId);

      const newTimeline = addTimelineEvent(state.timeline, {
        id: `tl-${Date.now()}`,
        workId,
        workTitle: work?.title || '',
        workCover: work?.cover || '📖',
        type: 'decorate',
        description: `为${b.name}兑换了${item.name}`,
        emoji: '🏠',
        timestamp: new Date().toISOString(),
      });

      const newBeasts = { ...state.beasts, [workId]: newBeast };
      const updated = { beasts: newBeasts, candies: newCandies, timeline: newTimeline };
      persist({ ...state, ...updated });
      success = true;
      return updated;
    });
    return success;
  },

  equipDecoration: (workId: string, itemId: string) => {
    set(state => {
      const beast = state.beasts[workId];
      if (!beast) return state;

      const item = shopItems.find(i => i.id === itemId);
      if (!item) return state;

      if (!beast.ownedDecorations.includes(itemId)) return state;

      const newDecorations = { ...beast.decorations, [item.category]: itemId };
      const newBeast: Beast = {
        ...beast,
        decorations: newDecorations,
      };

      const newBeasts = { ...state.beasts, [workId]: newBeast };
      const updated = { beasts: newBeasts };
      persist({ ...state, ...updated });
      return updated;
    });
  },

  resetDecorations: (workId: string) => {
    set(state => {
      const beast = state.beasts[workId];
      if (!beast) return state;

      const newBeast: Beast = {
        ...beast,
        decorations: { background: null, toy: null, title: null },
      };

      const newBeasts = { ...state.beasts, [workId]: newBeast };
      const updated = { beasts: newBeasts };
      persist({ ...state, ...updated });
      return updated;
    });
  },

  getBeastForWork: (workId: string) => {
    return get().beasts[workId];
  },

  getUrgeStateForWork: (workId: string) => {
    return get().urgeStates[workId];
  },

  getCelebrationHistory: (workId: string) => {
    return get().celebrationRecords.filter(r => r.workId === workId);
  },

  getTimelineForDay: (dateStr: string) => {
    const date = new Date(dateStr);
    return get().timeline.filter(e => {
      const eDate = new Date(e.timestamp);
      return eDate.getFullYear() === date.getFullYear() &&
        eDate.getMonth() === date.getMonth() &&
        eDate.getDate() === date.getDate();
    });
  },

  getTimelineForWork: (workId: string) => {
    return get().timeline.filter(e => e.workId === workId);
  },

  getBondProfile: (workId: string) => {
    const beast = get().beasts[workId];
    if (!beast) return null;

    const bondStart = new Date(beast.bondStartDate);
    const now = new Date();
    const companionshipDays = Math.max(1, Math.floor((now.getTime() - bondStart.getTime()) / (1000 * 60 * 60 * 24)));

    return {
      companionshipDays,
      consecutiveFedDays: beast.consecutiveFedDays,
      totalFedDays: beast.totalFedDays,
      totalUrgeCount: beast.totalUrgeCount,
      totalCelebrateCount: beast.totalCelebrateCount,
      ownedDecoCount: beast.ownedDecorations.length,
      level: beast.level.level,
      levelTitle: beast.level.title,
      unlockedDialogues: getUnlockedDialogues(beast),
      nextDialogueHint: getNextDialogueHint(beast),
    };
  },

  getMonthlySummary: (year: number, month: number, workId?: string) => {
    const state = get();
    const monthEvents = state.timeline.filter(e => {
      const d = new Date(e.timestamp);
      if (d.getFullYear() !== year || d.getMonth() !== month) return false;
      if (workId && e.workId !== workId) return false;
      return true;
    });

    if (monthEvents.length === 0) {
      const dummy: MonthlySummary = {
        year, month, feedCount: 0, urgeCount: 0, shareCount: 0,
        celebrateCount: 0, decorateCount: 0, totalCandyEarned: 0,
        topWorkTitle: '', topWorkCover: '📖', consecutiveRecord: 0,
        shortComment: '',
      };
      dummy.shortComment = generateMonthlyShortComment(dummy, !!workId,
        workId ? state.works.find(w => w.id === workId)?.title : undefined);
      return dummy;
    }

    const feedCount = monthEvents.filter(e => e.type === 'feed').length;
    const urgeCount = monthEvents.filter(e => e.type === 'urge').length;
    const shareCount = monthEvents.filter(e => e.type === 'share').length;
    const celebrateCount = monthEvents.filter(e => e.type === 'celebrate').length;
    const decorateCount = monthEvents.filter(e => e.type === 'decorate').length;

    const candyFromDaily = feedCount;
    const celebrateEvents = state.celebrationRecords.filter(r => {
      const d = new Date(r.celebratedAt);
      if (d.getFullYear() !== year || d.getMonth() !== month) return false;
      if (workId && r.workId !== workId) return false;
      return true;
    });
    const totalCandyEarned = candyFromDaily + celebrateEvents.reduce((s, r) => s + r.candiesCollected, 0);

    const workCounts: Record<string, number> = {};
    monthEvents.forEach(e => {
      workCounts[e.workId] = (workCounts[e.workId] || 0) + 1;
    });
    const topWorkId = Object.entries(workCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    const topWork = state.works.find(w => w.id === topWorkId);

    const relevantBeasts = workId
      ? [state.beasts[workId]].filter(Boolean)
      : Object.values(state.beasts);
    const consecutiveRecord = Math.max(...relevantBeasts.map(b => b?.consecutiveFedDays || 0), 0);

    const summary: MonthlySummary = {
      year,
      month,
      feedCount,
      urgeCount,
      shareCount,
      celebrateCount,
      decorateCount,
      totalCandyEarned,
      topWorkTitle: topWork?.title || '',
      topWorkCover: topWork?.cover || '📖',
      consecutiveRecord,
      shortComment: '',
    };
    summary.shortComment = generateMonthlyShortComment(summary, !!workId,
      workId ? state.works.find(w => w.id === workId)?.title : undefined);
    return summary;
  },

  getWorkInteractionStats: (workId: string) => {
    const state = get();
    const workEvents = state.timeline.filter(e => e.workId === workId);
    const feedCount = workEvents.filter(e => e.type === 'feed').length;
    const urgeCount = workEvents.filter(e => e.type === 'urge').length;
    const celebrateCount = workEvents.filter(e => e.type === 'celebrate').length;
    const decorateCount = workEvents.filter(e => e.type === 'decorate').length;

    const counts = [
      { key: 'feed' as const, value: feedCount },
      { key: 'urge' as const, value: urgeCount },
      { key: 'celebrate' as const, value: celebrateCount },
      { key: 'decorate' as const, value: decorateCount },
    ];
    const favorite = counts.slice().sort((a, b) => b.value - a.value)[0];
    const favoriteAction = favorite.value > 0 ? favorite.key : 'feed';
    const favoriteCount = favorite.value > 0 ? favorite.value : 0;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recent7Days = workEvents
      .filter(e => new Date(e.timestamp) >= sevenDaysAgo)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      favoriteAction,
      favoriteCount,
      recent7Days,
    };
  },

  checkDailyReset: () => {
  },

  getEncouragementMessages: () => encouragementMessages,

  getAvailableCandies: () => {
    return getAvailableCandies(get().candies);
  },
}));
