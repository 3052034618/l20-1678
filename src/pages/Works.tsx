import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { WorkCard } from '../components/WorkCard';

export function Works() {
  const { works, subscribedWorkIds, subscribeWork, unsubscribeWork } = useGameStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | '漫画' | '小说'>('all');

  const filteredWorks = works.filter(work => {
    const matchesSearch = work.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      work.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || work.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-peach-50 pb-24">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">发现作品</h1>
          <p className="text-gray-500 text-sm">找到你喜欢的作品，生成专属小兽吧~</p>
        </header>

        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="搜索作品名或作者..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-coral-200 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex items-center gap-2 mb-6">
          <Filter size={16} className="text-gray-400" />
          {(['all', '漫画', '小说'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === type
                  ? 'bg-coral-100 text-coral-600'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              {type === 'all' ? '全部' : type}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredWorks.map(work => (
            <WorkCard
              key={work.id}
              work={work}
              isSubscribed={subscribedWorkIds.includes(work.id)}
              onSubscribe={() => subscribeWork(work.id)}
              onUnsubscribe={() => unsubscribeWork(work.id)}
            />
          ))}
        </div>

        {filteredWorks.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-500">没有找到相关作品</p>
          </div>
        )}
      </div>
    </div>
  );
}
