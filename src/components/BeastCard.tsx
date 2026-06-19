import { Link } from 'react-router-dom';
import { Heart, Megaphone, Clock } from 'lucide-react';
import { BeastSvg } from './BeastSvg';
import type { Beast, Work } from '../types';
import { cn } from '../lib/utils';

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

export function BeastCard({ work, beast, className }: BeastCardProps) {
  const statusInfo = statusLabels[beast.status];

  return (
    <div
      className={cn(
        'bg-white rounded-3xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer relative overflow-hidden',
        className
      )}
    >
      {work.hasNewChapter && (
        <div className="absolute top-3 right-3 bg-gradient-to-r from-coral-500 to-peach-500 text-white text-xs px-3 py-1 rounded-full animate-pulse font-medium">
          🎉 更新啦
        </div>
      )}

      <div className="flex justify-center mb-3">
        <BeastSvg color={beast.color} status={beast.status} size={100} />
      </div>

      <div className="text-center mb-3">
        <h3 className="font-bold text-gray-800 text-lg mb-1">{work.title}</h3>
        <p className="text-sm text-gray-500">{work.author}</p>
      </div>

      <div className="flex justify-center mb-3">
        <span className={cn('text-xs px-3 py-1 rounded-full font-medium', statusInfo.color)}>
          {statusInfo.label}
        </span>
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-4">
        <Clock size={14} />
        <span>已等待 {beast.waitDays} 天</span>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{
            width: `${beast.vitality}%`,
            backgroundColor: beast.vitality > 50 ? '#98D8C8' : beast.vitality > 30 ? '#FFE66D' : '#FFB5C5',
          }}
        />
      </div>

      <div className="flex gap-2">
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
      </div>

      {work.hasNewChapter && (
        <Link
          to={`/celebrate/${work.id}`}
          className="block mt-2 text-center py-2 bg-gradient-to-r from-coral-500 to-peach-500 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
        >
          🎊 领取新章糖果
        </Link>
      )}
    </div>
  );
}
