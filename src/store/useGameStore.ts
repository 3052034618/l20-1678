import { create } from 'zustand';
import type { Work, Beast, BeastStatus, Candy, UrgeState, UrgeMessage, CelebrationRecord, SupportCard, MoodEntry } from '../types';
import { MOOD_MAP, getLevelFromExp, getExpForNextLevel } from '../types';
import { mockWorks, urgeStates as mockUrgeStates, beastColors, encouragementMessages, supportCardSlogans } from '../data/mockWorks';
import { loadFromStorage, saveToStorage, isSameDay, getDaysSince, generateBeastName } from '../utils/storage';

interface GameState {
  works: Work[];
  subscribedWorkIds: string[];
  beasts: Record<string, Beast>;
  candies: Candy;
  urgeStates: Record<string, UrgeState>;
  celebrationRecords: CelebrationRecord[];
  collectedChapterIds: string[];

  subscribeWork: (workId: string) => void;
  unsubscribeWork: (workId: string) => void;
  feedBeast: (workId: string, message: string) => void;
  urgeUpdate: (workId: string, message: string) => void;
  generateSupportCard: (workId: string) => void;
  markSupportCardShared: (workId: string) => void;
  collectCandy: (workId: string) => void;
  isChapterCollected: (workId: string, chapterTitle: string) => boolean;
  getBeastForWork: (workId: string) => Beast | undefined;
  getUrgeStateForWork: (workId: string) => UrgeState | undefined;
  getCelebrationHistory: (workId: string) => CelebrationRecord[];
  checkDailyReset: () => void;
  getEncouragementMessages: () => string[];
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

function persist(state: Partial<GameState>) {
  const s = state as any;
  saveToStorage({
    subscribedWorkIds: s.subscribedWorkIds,
    beasts: s.beasts,
    candies: s.candies,
    urgeStates: s.urgeStates,
    celebrationRecords: s.celebrationRecords,
    collectedChapterIds: s.collectedChapterIds,
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
  };
});

export const useGameStore = create<GameState>((set, get) => ({
  works: mockWorks,
  subscribedWorkIds: storageData.subscribedWorkIds,
  beasts: initialBeasts,
  candies: storageData.candies,
  urgeStates: storageData.urgeStates,
  celebrationRecords: storageData.celebrationRecords,
  collectedChapterIds: storageData.collectedChapterIds,

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
      const newState = {
        subscribedWorkIds: [...state.subscribedWorkIds, workId],
        beasts: { ...state.beasts, [workId]: beast },
        urgeStates: { ...state.urgeStates, [workId]: urgeState },
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
      const moodInfo = MOOD_MAP[newStatus];

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

      const newBeasts = { ...state.beasts, [workId]: newBeast };
      const updated = { beasts: newBeasts, candies: newCandies };
      persist({ ...state, ...updated });
      return updated;
    });
  },

  urgeUpdate: (workId: string, message: string) => {
    set(state => {
      const urgeState = state.urgeStates[workId];
      if (!urgeState || urgeState.userHasUrged) return state;

      const newMessage: UrgeMessage = {
        id: `msg-${Date.now()}`,
        workId,
        userName: '我',
        avatar: '😊',
        message,
        createdAt: new Date().toISOString(),
      };

      const newCurrentCount = urgeState.currentCount + 1;
      let newSupportCard = urgeState.supportCard;

      if (newCurrentCount >= urgeState.targetCount && !urgeState.supportCard) {
        const allMessages = [...urgeState.messages, newMessage];
        const selectedMsgs = allMessages.slice(0, 3).map(m => m.message);
        newSupportCard = {
          id: `card-${Date.now()}`,
          workId,
          workTitle: state.works.find(w => w.id === workId)?.title || '',
          currentCount: newCurrentCount,
          targetCount: urgeState.targetCount,
          slogan: supportCardSlogans[Math.floor(Math.random() * supportCardSlogans.length)],
          selectedMessages: selectedMsgs,
          createdAt: new Date().toISOString(),
          shared: false,
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
          moodDiary: addMoodEntry(beast.moodDiary, {
            date: new Date().toISOString(),
            mood: 'content',
            event: '参加了集体催更，为作者加油！',
            emoji: '📣',
          }),
        };
      }

      const updated = { urgeStates: newUrgeStates, beasts: newBeasts };
      persist({ ...state, ...updated });
      return updated;
    });
  },

  generateSupportCard: (workId: string) => {
    set(state => {
      const urgeState = state.urgeStates[workId];
      if (!urgeState || urgeState.currentCount < urgeState.targetCount) return state;

      if (urgeState.supportCard) return state;

      const selectedMsgs = urgeState.messages.slice(0, 3).map(m => m.message);
      const newSupportCard: SupportCard = {
        id: `card-${Date.now()}`,
        workId,
        workTitle: state.works.find(w => w.id === workId)?.title || '',
        currentCount: urgeState.currentCount,
        targetCount: urgeState.targetCount,
        slogan: supportCardSlogans[Math.floor(Math.random() * supportCardSlogans.length)],
        selectedMessages: selectedMsgs,
        createdAt: new Date().toISOString(),
        shared: false,
      };

      const newUrgeState = { ...urgeState, supportCard: newSupportCard };
      const newUrgeStates = { ...state.urgeStates, [workId]: newUrgeState };
      const updated = { urgeStates: newUrgeStates };
      persist({ ...state, ...updated });
      return updated;
    });
  },

  markSupportCardShared: (workId: string) => {
    set(state => {
      const urgeState = state.urgeStates[workId];
      if (!urgeState?.supportCard) return state;

      const newSupportCard = { ...urgeState.supportCard, shared: true };
      const newUrgeState = { ...urgeState, supportCard: newSupportCard };
      const newUrgeStates = { ...state.urgeStates, [workId]: newUrgeState };

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

      const updated = { urgeStates: newUrgeStates, beasts: newBeasts };
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

      const updated = {
        works: newWorks,
        beasts: newBeasts,
        candies: newCandies,
        celebrationRecords: newRecords,
        collectedChapterIds: newCollectedChapterIds,
      };
      persist({ ...state, ...updated });
      return updated;
    });
  },

  isChapterCollected: (workId: string, chapterTitle: string) => {
    const chapterId = `${workId}-${chapterTitle}`;
    return get().collectedChapterIds.includes(chapterId);
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

  checkDailyReset: () => {
    const today = new Date().toDateString();
    const stored = loadFromStorage();
    const lastDate = stored.lastCheckDate;

    if (lastDate && !isSameDay(lastDate, today)) {
      set(state => {
        const newBeasts = { ...state.beasts };
        Object.keys(newBeasts).forEach(workId => {
          const beast = newBeasts[workId];
          const work = state.works.find(w => w.id === workId);
          if (work) {
            const daysSinceUpdate = getDaysSince(work.lastUpdateDate);
            const newVitality = calculateVitality(daysSinceUpdate, false);
            const newStatus = getStatusFromVitality(newVitality);
            const moodInfo = MOOD_MAP[newStatus];

            let waitEvent = '';
            if (daysSinceUpdate > 14) {
              waitEvent = `已经等了${daysSinceUpdate}天了，好想作者大大...`;
            } else if (daysSinceUpdate > 7) {
              waitEvent = `等了${daysSinceUpdate}天啦，继续守候~`;
            }

            const newDiary = waitEvent
              ? addMoodEntry(beast.moodDiary, {
                  date: new Date().toISOString(),
                  mood: moodInfo.mood,
                  event: waitEvent,
                  emoji: moodInfo.emoji,
                })
              : beast.moodDiary;

            newBeasts[workId] = {
              ...beast,
              fedToday: false,
              vitality: newVitality,
              status: newStatus,
              waitDays: daysSinceUpdate,
              moodDiary: newDiary,
            };
          }
        });

        const newUrgeStates = { ...state.urgeStates };
        Object.keys(newUrgeStates).forEach(workId => {
          newUrgeStates[workId] = {
            ...newUrgeStates[workId],
            userHasUrged: false,
          };
        });

        const updated = { beasts: newBeasts, urgeStates: newUrgeStates };
        persist({ ...state, ...updated });
        saveToStorage({
          subscribedWorkIds: state.subscribedWorkIds,
          beasts: newBeasts,
          candies: state.candies,
          urgeStates: newUrgeStates,
          celebrationRecords: state.celebrationRecords,
          collectedChapterIds: state.collectedChapterIds,
          lastCheckDate: today,
        });
        return updated;
      });
    }
  },

  getEncouragementMessages: () => encouragementMessages,
}));
