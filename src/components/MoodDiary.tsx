import { BookHeart } from 'lucide-react';
import type { MoodEntry } from '../types';

interface MoodDiaryProps {
  diary: MoodEntry[];
  beastName: string;
}

const moodLabels: Record<string, string> = {
  ecstatic: '超开心',
  happy: '开心',
  content: '满足',
  sleepy: '犯困',
  lonely: '孤单',
};

export function MoodDiary({ diary, beastName }: MoodDiaryProps) {
  if (diary.length === 0) return null;

  const recentEntries = diary.slice(0, 7);

  return (
    <div className="bg-white/60 rounded-2xl p-4">
      <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
        <BookHeart size={16} className="text-coral-500" />
        {beastName}的心情日记
      </h4>
      <div className="space-y-2">
        {recentEntries.map((entry, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="text-lg mt-0.5">{entry.emoji}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-medium text-gray-600">
                  {moodLabels[entry.mood] || entry.mood}
                </span>
                <span className="text-xs text-gray-400">
                  {formatDate(entry.date)}
                </span>
              </div>
              <p className="text-sm text-gray-500">{entry.event}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return '今天';
  if (days === 1) return '昨天';
  if (days < 7) return `${days}天前`;
  return `${date.getMonth() + 1}/${date.getDate()}`;
}
