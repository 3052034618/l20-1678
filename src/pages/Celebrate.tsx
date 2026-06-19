import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Gift, Calendar, Sparkles } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { BeastSvg } from '../components/BeastSvg';

interface Candy {
  id: number;
  left: number;
  delay: number;
  duration: number;
  emoji: string;
  size: number;
}

const candyEmojis = ['🍬', '🍭', '🍫', '🍩', '🧁', '🍪', '🌈', '✨', '💫', '⭐'];

export function Celebrate() {
  const { workId } = useParams<{ workId: string }>();
  const navigate = useNavigate();
  const { works, beasts, collectCandy, celebrationRecords } = useGameStore();
  const [candies, setCandies] = useState<Candy[]>([]);
  const [collected, setCollected] = useState(false);
  const [reward, setReward] = useState(0);
  const [showContent, setShowContent] = useState(false);

  const work = works.find(w => w.id === workId);
  const beast = beasts[workId || ''];

  useEffect(() => {
    if (!work?.hasNewChapter) return;

    const newCandies: Candy[] = [];
    for (let i = 0; i < 40; i++) {
      newCandies.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 3 + Math.random() * 3,
        emoji: candyEmojis[Math.floor(Math.random() * candyEmojis.length)],
        size: 20 + Math.random() * 20,
      });
    }
    setCandies(newCandies);

    const timer = setTimeout(() => setShowContent(true), 500);
    return () => clearTimeout(timer);
  }, [work?.hasNewChapter]);

  if (!work || !beast) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream-50 to-peach-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">找不到这个作品...</p>
          <Link to="/" className="text-coral-500 font-medium">返回首页</Link>
        </div>
      </div>
    );
  }

  const waitDays = beast.waitDays || work.daysSinceUpdate;
  const lastRecord = celebrationRecords.filter(r => r.workId === workId).pop();

  const handleCollect = () => {
    if (collected || !work.hasNewChapter) return;

    const candyReward = Math.min(10, Math.max(3, Math.floor(10 - waitDays / 3)));
    setReward(candyReward);
    collectCandy(work.id);
    setCollected(true);
  };

  if (!work.hasNewChapter && !lastRecord) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream-50 to-peach-50 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-6xl mb-4">😴</div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">还没有新章节哦</h2>
          <p className="text-gray-500 mb-6">继续等待，小兽会陪你的~</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gradient-to-r from-coral-500 to-peach-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-peach-50 to-coral-50 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
        {candies.map(candy => (
          <div
            key={candy.id}
            className="absolute candy-fall"
            style={{
              left: `${candy.left}%`,
              fontSize: `${candy.size}px`,
              animationDelay: `${candy.delay}s`,
              animationDuration: `${candy.duration}s`,
            }}
          >
            {candy.emoji}
          </div>
        ))}
      </div>

      <div className="relative z-20 max-w-lg mx-auto px-4 py-12">
        <div className={`text-center transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-5xl mb-4 animate-bounce">🎉</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">新章更新啦！</h1>
          <p className="text-gray-600 mb-6">{work.title} · {work.lastChapter}</p>
        </div>

        <div className={`bg-white/80 backdrop-blur rounded-3xl p-8 shadow-lg mb-6 transition-all duration-700 delay-200 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex justify-center mb-6">
            <div className="animate-bounce">
              <BeastSvg color={beast.color} status="energetic" size={120} animated={false} />
            </div>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              {beast.name} 超级开心！
            </h2>
            <p className="text-gray-500 text-sm">活力值已回满 ✨</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-peach-50 rounded-2xl p-4 text-center">
              <Calendar size={20} className="mx-auto text-coral-500 mb-2" />
              <div className="text-2xl font-bold text-gray-800">{waitDays}</div>
              <div className="text-xs text-gray-500">等待天数</div>
            </div>
            <div className="bg-amber-50 rounded-2xl p-4 text-center">
              <Gift size={20} className="mx-auto text-amber-500 mb-2" />
              <div className="text-2xl font-bold text-amber-600">
                {collected ? reward : '?'}
              </div>
              <div className="text-xs text-gray-500">糖果奖励</div>
            </div>
          </div>

          {collected ? (
            <div className="text-center">
              <div className="text-4xl mb-3">🎊</div>
              <p className="text-gray-700 font-medium mb-1">糖果已领取！</p>
              <p className="text-sm text-gray-500">获得 {reward} 颗糖果 🍬</p>
            </div>
          ) : (
            <button
              onClick={handleCollect}
              className="w-full py-4 bg-gradient-to-r from-amber-400 via-orange-400 to-coral-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles size={22} />
              领取新章糖果
            </button>
          )}
        </div>

        {collected && (
          <Link
            to="/"
            className="block w-full py-4 bg-white text-gray-700 rounded-2xl font-medium text-center shadow-sm hover:shadow-md transition-all"
          >
            返回首页
          </Link>
        )}

        {!collected && (
          <p className="text-center text-xs text-gray-400 mt-4">
            等待越久，惊喜越多哦~
          </p>
        )}
      </div>
    </div>
  );
}
