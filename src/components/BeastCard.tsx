import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Megaphone, Clock, Star, BookHeart, ShoppingBag } from 'lucide-react';
import { BeastSvg } from './BeastSvg';
import { MoodDiary } from './MoodDiary';
import { CandyShop } from './CandyShop';
import type { Beast, Work } from '../types';
import { getExpForNextLevel, getAvailableCandies } from '../types';
import { cn } from '../lib/utils';
import { useGameStore } from '../store/useGameStore';

interface BeastCardProps {
  work: Work;
  beast: Beast;
  className?: string;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  energetic: { label: '活力满满', color: 'bg-green-100 text-green-700' },
  normal: { label: '状态良好', color: 'bg-blue-100 text-blue-700' },
  sleepy: { label: '有点困了', color: 'bg-yellow-100 text-yellow-700' },
  sleeping: { label: '呼呼大睡', color: 'bg-gray-100 text-gray-600' },
};

const backgroundEmoji: Record<string, string> = {
  'bg-stars': '🌌',
  'bg-meadow': '🌿',
  'bg-clouds': '☁️',
  'bg-sakura': '🌸',
};

const toyEmoji: Record<string, string> = {
  'toy-ball': '🧶',
  'toy-fish': '🐟',
  'toy-pillow': '🛋️',
  'toy-book': '📖',
  'toy-lantern': '🏮',
};

export function BeastCard({ work, beast, className }: BeastCardProps) {
  const statusInfo = statusLabels[beast.status];
  const [showDiary, setShowDiary] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const { isChapterCollected } = useGameStore();

  const expForNext = getExpForNextLevel(beast.level.level);
  const expProgress = beast.level.level >= 5 ? 100 : Math.min(100, (beast.level.exp / expForNext) * 100);

  const hasNewChapter = work.hasNewChapter && !isChapterCollected(work.id, work.lastChapter);

  const decos = beast.decorations;
  const hasDecos = decos.background || decos.toy || decos.title;

  return (
    <>
      <div
        className={cn(
          'bg-white rounded-3xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative overflow-hidden',
          decos.background === 'bg-stars' && 'bg-gradient-to-b from-indigo-50 to-white',
          decos.background === 'bg-meadow' && 'bg-gradient-to-b from-green-50 to-white',
          decos.background === 'bg-clouds' && 'bg-gradient-to-b from-sky-50 to-white',
          decos.background === 'bg-sakura' && 'bg-gradient-to-b from-pink-50 to-white',
          className
        )}
      >
        {hasNewChapter && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-coral-500 to-peach-500 text-white text-xs px-3 py-1 rounded-full animate-pulse font-medium">
            🎉 更新啦
          </div>
        )}

        <div className="flex justify-center mb-3 relative">
          <BeastSvg color={beast.color} status={beast.status} size={100} />
          {decos.toy && toyEmoji[decos.toy] && (
            <div className="absolute -right-1 bottom-0 text-xl">{toyEmoji[decos.toy]}</div>
          )}
        </div>

        <div className="text-center mb-2">
          <h3 className="font-bold text-gray-800 text-lg mb-1">
            {work.title}
          </h3>
          <p className="text-sm text-gray-500">{work.author}</p>
          {decos.title && (
            <p className="text-xs text-coral-500 font-medium mt-1">
              👑 {decos.title === 'title-waiter' ? '守候之星' : decos.title === 'title-fan' ? '忠实读者' : '甜蜜守护'}
            </p>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 mb-2">
          <span className={cn('text-xs px-3 py-1 rounded-full font-medium', statusInfo.color)}>
            {statusInfo.label}
          </span>
        </div>

        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="flex items-center gap-1.5">
            <Star size={14} className="text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold text-amber-600">Lv.{beast.level.level}</span>
            <span className="text-xs text-gray-400">{beast.level.title}</span>
          </div>
        </div>

        <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{
              width: `${beast.vitality}%`,
              backgroundColor: beast.vitality > 50 ? '#98D8C8' : beast.vitality > 30 ? '#FFE66D' : '#FFB5C5',
            }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
          <span>活力 {beast.vitality}%</span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            等待 {beast.waitDays} 天
          </span>
        </div>

        <div className="w-full bg-amber-50 rounded-full h-1.5 mb-3">
          <div
            className="h-1.5 rounded-full bg-gradient-to-r from-amber-300 to-amber-500 transition-all duration-500"
            style={{ width: `${expProgress}%` }}
          />
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mb-4">
          <span>🔥 连续{beast.consecutiveFedDays}天</span>
          <span>·</span>
          <span>累计{beast.totalFedDays}天</span>
        </div>

        <div className="flex gap-2 mb-2">
          <Link
            to={`/feed/${work.id}`}
            className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-peach-50 text-coral-600 rounded-xl text-sm font-medium hover:bg-peach-100 transition-colors"
          >
            <Heart size={16} />
            投喂
          </Link>
          <Link
            to={`/urge/${work.id}`}
            className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-mint-50 text-teal-600 rounded-xl text-sm font-medium hover:bg-mint-100 transition-colors"
          >
            <Megaphone size={16} />
            催更
          </Link>
          <button
            onClick={() => setShowShop(true)}
            className="flex items-center justify-center py-2 px-3 bg-amber-50 text-amber-600 rounded-xl text-sm font-medium hover:bg-amber-100 transition-colors"
          >
            <ShoppingBag size={16} />
          </button>
          <button
            onClick={() => setShowDiary(!showDiary)}
            className={cn(
              'flex items-center justify-center py-2 px-3 rounded-xl text-sm font-medium transition-colors',
              showDiary ? 'bg-coral-50 text-coral-600' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            )}
          >
            <BookHeart size={16} />
          </button>
        </div>

        {hasNewChapter && (
          <Link
            to={`/celebrate/${work.id}`}
            className="block mt-2 text-center py-2 bg-gradient-to-r from-coral-500 to-peach-500 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
          >
            🎊 领取新章糖果
          </Link>
        )}

        {showDiary && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <MoodDiary diary={beast.moodDiary} beastName={beast.name} />
          </div>
        )}
      </div>

      {showShop && (
        <CandyShop workId={work.id} onClose={() => setShowShop(false)} />
      )}
    </>
  );
}
