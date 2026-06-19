import { create } from 'zustand';
import type { Work, Beast, BeastStatus, Candy, UrgeState, UrgeMessage, CelebrationRecord } from '../types';
import { mockWorks, urgeStates as mockUrgeStates, beastColors, encouragementMessages } from '../data/mockWorks';
import { loadFromStorage, saveToStorage, isSameDay, getDaysSince, generateBeastName } from '../utils/storage';

interface GameState {
  works: Work[];
  subscribedWorkIds: string[];
  beasts: Record<string, Beast>;
  candies: Candy;
  urgeStates: Record<string, UrgeState>;
  celebrationRecords: CelebrationRecord[];

  subscribeWork: (workId: string) => void;
  unsubscribeWork: (workId: string) => void;
  feedBeast: (workId: string, message: string) => void;
  urgeUpdate: (workId: string, message: string) => void;
  collectCandy: (workId: string) => void;
  getBeastForWork: (workId: string) => Beast | undefined;
  getUrgeStateForWork: (workId: string) => UrgeState | undefined;
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

function createBeast(work: Work): Beast {
  const colorIndex = Math.floor(Math.random() * beastColors.length);
  const vitality = calculateVitality(work.daysSinceUpdate, false);
  return {
    id: `beast-${work.id}`,
    workId: work.id,
    name: generateBeastName(),
    color: beastColors[colorIndex],
    vitality,
    status: getStatusFromVitality(vitality),
    fedToday: false,
    lastFedDate: '',
    totalFedDays: 0,
    consecutiveFedDays: 0,
    waitDays: work.daysSinceUpdate,
  };
}

const storageData = loadFromStorage();

export const useGameStore = create<GameState>((set, get) => ({
  works: mockWorks,
  subscribedWorkIds: storageData.subscribedWorkIds,
  beasts: storageData.beasts,
  candies: storageData.candies,
  urgeStates: storageData.urgeStates,
  celebrationRecords: storageData.celebrationRecords,

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
    };

    set(state => {
      const newState = {
        subscribedWorkIds: [...state.subscribedWorkIds, workId],
        beasts: { ...state.beasts, [workId]: beast },
        urgeStates: { ...state.urgeStates, [workId]: urgeState },
      };
      saveToStorage({
        subscribedWorkIds: newState.subscribedWorkIds,
        beasts: newState.beasts,
        candies: state.candies,
        urgeStates: newState.urgeStates,
        celebrationRecords: state.celebrationRecords,
        lastCheckDate: new Date().toDateString(),
      });
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
      saveToStorage({
        subscribedWorkIds: newState.subscribedWorkIds,
        beasts: newState.beasts,
        candies: state.candies,
        urgeStates: newState.urgeStates,
        celebrationRecords: state.celebrationRecords,
        lastCheckDate: new Date().toDateString(),
      });
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

      const newBeast = {
        ...beast,
        vitality: newVitality,
        status: getStatusFromVitality(newVitality),
        fedToday: true,
        lastFedDate: today,
        totalFedDays: beast.totalFedDays + 1,
        consecutiveFedDays: consecutiveDays,
      };

      const newCandies = {
        ...state.candies,
        total: state.candies.total + 1,
        fromDaily: state.candies.fromDaily + 1,
      };

      const newBeasts = { ...state.beasts, [workId]: newBeast };
      saveToStorage({
        subscribedWorkIds: state.subscribedWorkIds,
        beasts: newBeasts,
        candies: newCandies,
        urgeStates: state.urgeStates,
        celebrationRecords: state.celebrationRecords,
        lastCheckDate: today,
      });

      return { beasts: newBeasts, candies: newCandies };
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

      const newUrgeState = {
        ...urgeState,
        currentCount: urgeState.currentCount + 1,
        messages: [...urgeState.messages, newMessage],
        userHasUrged: true,
      };

      const newUrgeStates = { ...state.urgeStates, [workId]: newUrgeState };
      saveToStorage({
        subscribedWorkIds: state.subscribedWorkIds,
        beasts: state.beasts,
        candies: state.candies,
        urgeStates: newUrgeStates,
        celebrationRecords: state.celebrationRecords,
        lastCheckDate: new Date().toDateString(),
      });

      return { urgeStates: newUrgeStates };
    });
  },

  collectCandy: (workId: string) => {
    set(state => {
      const work = state.works.find(w => w.id === workId);
      if (!work || !work.hasNewChapter) return state;

      const beast = state.beasts[workId];
      const waitDays = beast ? beast.waitDays : work.daysSinceUpdate;
      const candyReward = Math.min(10, Math.max(3, Math.floor(10 - waitDays / 3)));

      const newRecord: CelebrationRecord = {
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
        newBeasts[workId] = {
          ...newBeasts[workId],
          vitality: 100,
          status: 'energetic' as BeastStatus,
          waitDays: 0,
        };
      }

      const newWorks = state.works.map(w =>
        w.id === workId ? { ...w, hasNewChapter: false, daysSinceUpdate: 0, lastUpdateDate: new Date().toISOString() } : w
      );

      const newRecords = [...state.celebrationRecords, newRecord];

      saveToStorage({
        subscribedWorkIds: state.subscribedWorkIds,
        beasts: newBeasts,
        candies: newCandies,
        urgeStates: state.urgeStates,
        celebrationRecords: newRecords,
        lastCheckDate: new Date().toDateString(),
      });

      return {
        works: newWorks,
        beasts: newBeasts,
        candies: newCandies,
        celebrationRecords: newRecords,
      };
    });
  },

  getBeastForWork: (workId: string) => {
    return get().beasts[workId];
  },

  getUrgeStateForWork: (workId: string) => {
    return get().urgeStates[workId];
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
            newBeasts[workId] = {
              ...beast,
              fedToday: false,
              vitality: newVitality,
              status: getStatusFromVitality(newVitality),
              waitDays: daysSinceUpdate,
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

        saveToStorage({
          subscribedWorkIds: state.subscribedWorkIds,
          beasts: newBeasts,
          candies: state.candies,
          urgeStates: newUrgeStates,
          celebrationRecords: state.celebrationRecords,
          lastCheckDate: today,
        });

        return { beasts: newBeasts, urgeStates: newUrgeStates };
      });
    }
  },

  getEncouragementMessages: () => encouragementMessages,
}));
