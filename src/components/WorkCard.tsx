import { Plus, Check, BookOpen, Sparkles } from 'lucide-react';
import type { Work } from '../types';
import { cn } from '../lib/utils';

interface WorkCardProps {
  work: Work;
  isSubscribed: boolean;
  onSubscribe: () => void;
  onUnsubscribe: () => void;
}

export function WorkCard({ work, isSubscribed, onSubscribe, onUnsubscribe }: WorkCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-peach-100 to-coral-100 flex items-center justify-center text-3xl flex-shrink-0">
          {work.cover}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-gray-800 truncate">{work.title}</h3>
            <span className="text-xs px-2 py-0.5 bg-mint-100 text-teal-600 rounded-full flex-shrink-0">
              {work.type}
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-2">{work.author}</p>
          <p className="text-xs text-gray-400 line-clamp-2">{work.description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Sparkles size={12} />
            {work.popularity.toLocaleString()} 人气
          </span>
          <span className="flex items-center gap-1">
            <BookOpen size={12} />
            更新于 {work.daysSinceUpdate} 天前
          </span>
        </div>

        <button
          onClick={isSubscribed ? onUnsubscribe : onSubscribe}
          className={cn(
            'flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
            isSubscribed
              ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              : 'bg-gradient-to-r from-coral-500 to-peach-500 text-white hover:shadow-md hover:-translate-y-0.5'
          )}
        >
          {isSubscribed ? (
            <>
              <Check size={16} />
              已订阅
            </>
          ) : (
            <>
              <Plus size={16} />
              订阅
            </>
          )}
        </button>
      </div>
    </div>
  );
}
