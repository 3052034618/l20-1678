import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Sparkles, Heart, History } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { BeastCard } from '../components/BeastCard';

export function Home() {
  const { works, subscribedWorkIds, beasts, checkDailyReset, candies, celebrationRecords } = useGameStore();
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    checkDailyReset();
  }, [checkDailyReset]);

  const subscribedWorks = works.filter(w => subscribedWorkIds.includes(w.id));
  const hasNewChapters = subscribedWorks.filter(w => w.hasNewChapter).length;
  const totalFedToday = subscribedWorks.filter(w => beasts[w.id]?.fedToday).length;

  const recentCelebrations = celebrationRecords
    .slice()
    .sort((a, b) => new Date(b.celebratedAt).getTime() - new Date(a.celebratedAt).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-peach-50 pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-1">
                我的小兽们 🐾
              </h1>
              <p className="text-gray-500 text-sm">
                今天也要好好陪伴它们哦~
              </p>
            </div>
            <Link
              to="/works"
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-coral-500 to-peach-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <Plus size={20} />
              添加作品
            </Link>
          </div>

          {subscribedWorks.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/70 backdrop-blur rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-coral-500 mb-1">
                  {subscribedWorks.length}
                </div>
                <div className="text-xs text-gray-500">订阅作品</div>
              </div>
              <div className="bg-white/70 backdrop-blur rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-mint-600 mb-1 flex items-center justify-center gap-1">
                  <Heart size={18} fill="currentColor" />
                  {totalFedToday}
                </div>
                <div className="text-xs text-gray-500">今日已投喂</div>
              </div>
              <div className="bg-white/70 backdrop-blur rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-amber-500 mb-1 flex items-center justify-center gap-1">
                  <Sparkles size={18} />
                  {hasNewChapters}
                </div>
                <div className="text-xs text-gray-500">新更新</div>
              </div>
            </div>
          )}
        </header>

        {subscribedWorks.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🐾</div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">
              还没有订阅作品哦
            </h2>
            <p className="text-gray-500 mb-6">
              添加你喜欢的作品，生成专属更新小兽吧！
            </p>
            <Link
              to="/works"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-coral-500 to-peach-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              <Plus size={20} />
              去发现作品
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subscribedWorks.map(work => {
              const beast = beasts[work.id];
              if (!beast) return null;
              return (
                <BeastCard key={work.id} work={work} beast={beast} />
              );
            })}
          </div>
        )}

        {candies.total > 0 && subscribedWorks.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🍬</div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 mb-1">我的糖果罐</h3>
                <p className="text-sm text-gray-500">
                  已经收集了 <span className="font-bold text-amber-600">{candies.total}</span> 颗糖果
                </p>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                  <span>投喂 {candies.fromDaily} 颗</span>
                  <span>庆祝 {candies.fromCelebration} 颗</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {recentCelebrations.length > 0 && (
          <div className="mt-6">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-coral-500 transition-colors mb-3"
            >
              <History size={16} />
              {showHistory ? '收起庆祝记录' : '查看庆祝记录'}
              <span className="text-xs text-gray-400">({recentCelebrations.length})</span>
            </button>

            {showHistory && (
              <div className="bg-white/70 backdrop-blur rounded-2xl p-5">
                <div className="space-y-3">
                  {recentCelebrations.map(record => {
                    const work = works.find(w => w.id === record.workId);
                    return (
                      <div key={record.id} className="flex items-center gap-4 p-3 bg-white/60 rounded-xl">
                        <div className="text-2xl">{work?.cover || '📖'}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700 truncate">
                            {work?.title || '未知作品'} · {record.chapterTitle}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                            <span>等了 {record.waitDays} 天</span>
                            <span>·</span>
                            <span>🍬 {record.candiesCollected} 颗</span>
                            <span>·</span>
                            <span>{formatDate(record.celebratedAt)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}
