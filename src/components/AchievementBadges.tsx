import type { Beast, Achievement } from '../types';
import { getUnlockedAchievements, ACHIEVEMENT_LIST } from '../types';
import { cn } from '../lib/utils';

interface AchievementBadgesProps {
  beast: Beast;
  size?: 'sm' | 'md';
  showAll?: boolean;
}

const categoryPriority: Record<string, number> = {
  consecutive: 1,
  celebrate: 2,
  urge: 3,
  feed: 4,
  decorate: 5,
  level: 6,
};

export function AchievementBadges({ beast, size = 'md', showAll = false }: AchievementBadgesProps) {
  const unlocked = getUnlockedAchievements(beast);

  if (unlocked.length === 0 && !showAll) return null;

  const topBadges = unlocked
    .slice()
    .sort((a, b) => {
      const pc = categoryPriority[a.category] - categoryPriority[b.category];
      if (pc !== 0) return pc;
      return b.tier - a.tier;
    })
    .slice(0, showAll ? 99 : 4);

  const Badge = ({ a, locked = false }: { a: Achievement; locked?: boolean }) => {
    const iconSize = size === 'sm' ? 'text-sm w-6 h-6' : 'text-base w-8 h-8';
    const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs';

    return (
      <div
        className={cn(
          'flex flex-col items-center gap-0.5',
          size === 'sm' ? 'w-12' : 'w-16'
        )}
        title={locked ? `${a.name} - 未解锁 (${a.description})` : `${a.name} - ${a.description}`}
      >
        <div
          className={cn(
            'flex items-center justify-center rounded-full',
            iconSize,
            locked
              ? 'bg-gray-100 grayscale opacity-40'
              : a.tier >= 4
              ? 'bg-gradient-to-br from-amber-100 to-rose-100 ring-2 ring-amber-300'
              : a.tier >= 3
              ? 'bg-gradient-to-br from-amber-50 to-purple-50 ring-1 ring-amber-200'
              : a.tier >= 2
              ? 'bg-gradient-to-br from-coral-50 to-peach-50'
              : 'bg-gray-50'
          )}
        >
          <span>{a.icon}</span>
        </div>
        {size !== 'sm' && (
          <span className={cn('text-gray-500 text-center leading-tight', textSize, locked && 'opacity-40')}>
            {a.name}
          </span>
        )}
      </div>
    );
  };

  if (showAll) {
    const unlockedIds = new Set(unlocked.map(a => a.id));
    return (
      <div className="space-y-4">
        {(['consecutive', 'celebrate', 'urge', 'feed', 'decorate', 'level'] as const).map(cat => {
          const catBadges = ACHIEVEMENT_LIST.filter(a => a.category === cat);
          return (
            <div key={cat}>
              <h5 className="text-xs font-bold text-gray-500 mb-2">
                {cat === 'consecutive' && '🔥 连续投喂'}
                {cat === 'celebrate' && '🎉 庆祝新章'}
                {cat === 'urge' && '📣 催更应援'}
                {cat === 'feed' && '💕 累计投喂'}
                {cat === 'decorate' && '🏠 装饰收藏'}
                {cat === 'level' && '🌟 等级成长'}
              </h5>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {catBadges.map(a => (
                  <Badge key={a.id} a={a} locked={!unlockedIds.has(a.id)} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {topBadges.map(a => (
        <Badge key={a.id} a={a} />
      ))}
      {unlocked.length > 4 && (
        <div className="text-xs text-gray-400 ml-1">+{unlocked.length - 4}</div>
      )}
    </div>
  );
}
