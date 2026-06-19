import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Gift, Calendar, Sparkles, History } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { BeastSvg } from '../components/BeastSvg';
import { getExpForNextLevel, getAvailableCandies } from '../types';

interface FallingCandy {
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
  const { works, beasts, collectCandy, isChapterCollected, getCelebrationHistory, getAvailableCandies } = useGameStore();
  const [fallingCandies, setFallingCandies] = useState<FallingCandy[]>([]);
  const [collected, setCollected] = useState(false);
  const [reward, setReward] = useState(0);
  const [showContent, setShowContent] = useState(false);

  const work = works.find(w => w.id === workId);
  const beast = beasts[workId || ''];
  const history = getCelebrationHistory(workId || '');
  const alreadyCollected = work ? isChapterCollected(work.id, work.lastChapter) : false;

  const canShowCelebration = work?.hasNewChapter && !alreadyCollected;

  useEffect(() => {
    if (!canShowCelebration) {
      setShowContent(true);
      return;
    }

    const newCandies: FallingCandy[] = [];
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
    setFallingCandies(newCandies);

    const timer = setTimeout(() => setShowContent(true), 500);
    return () => clearTimeout(timer);
  }, [canShowCelebration]);

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
  const canCollect = canShowCelebration && !collected;
  const availableCandies = getAvailableCandies();

  const handleCollect = () => {
    if (collected || !canCollect) return;

    const candyReward = Math.min(10, Math.max(3, Math.floor(10 - waitDays / 3)));
    setReward(candyReward);
    collectCandy(work.id);
    setCollected(true);
  };

  const expForNext = getExpForNextLevel(beast.level.level);
  const expProgress = beast.level.level >= 5 ? 100 : Math.min(100, ((beast.level.exp) / expForNext) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-peach-50 to-coral-50 relative overflow-hidden">
      {canShowCelebration && !collected && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
          {fallingCandies.map(candy => (
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
      )}

      <div className="relative z-20 max-w-lg mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          ← 返回
        </button>

        {canShowCelebration && (
          <div className={`transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="text-center mb-6">
              <div className="text-5xl mb-4 animate-bounce">🎉</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">新章更新啦！</h1>
              <p className="text-gray-600 mb-2">{work.title} · {work.lastChapter}</p>
            </div>

            <div className={`bg-white/80 backdrop-blur rounded-3xl p-8 shadow-lg mb-6 transition-all duration-700 delay-200 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="flex justify-center mb-6">
                <div className={collected ? 'animate-bounce' : ''}>
                  <BeastSvg color={beast.color} status="energetic" size={120} animated={false} />
                </div>
              </div>

              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-1">
                  {beast.name} 超级开心！
                </h2>
                <p className="text-gray-500 text-sm mb-2">活力值已回满 ✨</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm font-medium text-coral-600">Lv.{beast.level.level}</span>
                  <span className="text-sm text-gray-500">{beast.level.title}</span>
                </div>
                <div className="w-32 mx-auto bg-gray-100 rounded-full h-1.5 mt-2">
                  <div
                    className="h-1.5 rounded-full bg-gradient-to-r from-coral-400 to-peach-400 transition-all"
                    style={{ width: `${expProgress}%` }}
                  />
                </div>
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
                  <p className="text-sm text-gray-500">获得 {reward} 颗糖果 🍬 + 5 成长经验</p>
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
          </div>
        )}

        {!canShowCelebration && alreadyCollected && (
          <div className={`transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="bg-white/80 backdrop-blur rounded-3xl p-8 shadow-lg mb-6 text-center">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">糖果已领取</h2>
              <p className="text-gray-500 mb-1">{work.lastChapter}</p>
              <p className="text-sm text-gray-400">这一章的糖果已经领过啦，刷新不会再出现~</p>
            </div>
          </div>
        )}

        {!canShowCelebration && !alreadyCollected && history.length === 0 && (
          <div className="text-center py-16">
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
        )}

        {history.length > 0 && (
          <div className={`transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="bg-white/70 backdrop-blur rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <History size={18} className="text-amber-500" />
                庆祝记录
              </h3>
              <div className="space-y-3">
                {history.slice().reverse().map(record => (
                  <div key={record.id} className="flex items-center gap-4 p-3 bg-white/60 rounded-xl">
                    <div className="text-2xl">🍬</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{record.chapterTitle}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                        <span>等了 {record.waitDays} 天</span>
                        <span>·</span>
                        <span>{record.candiesCollected} 颗糖果</span>
                        <span>·</span>
                        <span>{formatDate(record.celebratedAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {(collected || !canShowCelebration) && (
          <Link
            to="/"
            className="block mt-6 w-full py-4 bg-white text-gray-700 rounded-2xl font-medium text-center shadow-sm hover:shadow-md transition-all"
          >
            返回首页
          </Link>
        )}
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}
