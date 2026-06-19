const STORAGE_KEY = 'update-beast-game';

export interface StorageData {
  subscribedWorkIds: string[];
  beasts: Record<string, import('../types').Beast>;
  candies: import('../types').Candy;
  urgeStates: Record<string, import('../types').UrgeState>;
  celebrationRecords: import('../types').CelebrationRecord[];
  lastCheckDate: string;
}

export const defaultStorageData: StorageData = {
  subscribedWorkIds: [],
  beasts: {},
  candies: {
    total: 0,
    fromCelebration: 0,
    fromDaily: 0,
  },
  urgeStates: {},
  celebrationRecords: [],
  lastCheckDate: new Date().toDateString(),
};

export function loadFromStorage(): StorageData {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load from storage', e);
  }
  return defaultStorageData;
}

export function saveToStorage(data: StorageData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to storage', e);
  }
}

export function isSameDay(date1: string, date2: string): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function getDaysSince(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function generateBeastName(): string {
  const prefixes = ['小', '奶', '糖', '软', '胖', '圆', '毛', '绒'];
  const suffixes = ['团', '球', '宝', '兽', '仔', '酱', '喵', '汪'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  return prefix + suffix;
}
