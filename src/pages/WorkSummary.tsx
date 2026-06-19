import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Megaphone, Sparkles, BarChart3, Star, Trophy } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { BeastSvg } from '../components/BeastSvg';
import { AchievementBadges } from '../components/AchievementBadges';
import { BondProfile } from '../components/BondProfile';
import { MonthlyReview } from '../components/MonthlyReview';
import { cn } from '../lib/utils';
import { EVENT_EMOJI, getUnlockedAchievements as getU, ACHIEVEMENT_LIST } from '../types';

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

const actionLabels: Record<string, string> = {
  feed: '投喂',
  urge: '催更',
  celebrate: '庆祝',
  decorate: '装饰',
};

export function WorkSummary() {
  const { workId = '' } = useParams();
  const navigate = useNavigate();
  const { works, beasts, celebrationRecords, getBondProfile, getWorkInteractionStats, shopItems, isChapterCollected } = useGameStore();
  const [showMonthly, setShowMonthly] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  const work = works.find(w => w.id === workId);
  const beast = beasts[workId];
  const bond = getBondProfile(workId);
  const stats = getWorkInteractionStats(workId);

  if (!work || !beast) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream-50 to-peach-50 p-8">
        <p className="text-gray-500 text-center">没有找到这部作品的陪伴记录~</p>
        <Link to="/" className="block text-center text-coral-500 mt-4">
          返回首页
        </Link>
      </div>
    );
  }

  const history = celebrationRecords
    .filter(r => r.workId === workId)
    .sort((a, b) => new Date(b.celebratedAt).getTime() - new Date(a.celebratedAt).getTime());

  const decos = beast.decorations;
  const bgItem = decos.background ? shopItems.find(i => i.id === decos.background) : null;
  const toyItem = decos.toy ? shopItems.find(i => i.id === decos.toy) : null;
  const titleItem = decos.title ? shopItems.find(i => i.id === decos.title) : null;

  const favoriteLabel = actionLabels[stats.favoriteAction] || '投喂';
  const hasNewChapter = work.hasNewChapter && !isChapterCollected(work.id, work.lastChapter);

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-peach-50 pb-24">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft size={18} />
          返回
        </button>

        <div
          className={cn(
            'rounded-3xl p-6 mb-6 relative overflow-hidden',
            decos.background === 'bg-stars' && 'bg-gradient-to-br from-indigo-100 via-white to-amber-50',
            decos.background === 'bg-meadow' && 'bg-gradient-to-br from-green-100 via-white to-amber-50',
            decos.background === 'bg-clouds' && 'bg-gradient-to-br from-sky-100 via-white to-amber-50',
            decos.background === 'bg-sakura' && 'bg-gradient-to-br from-pink-100 via-white to-amber-50',
            (!decos.background) && 'bg-white'
          )}
        >
          {bgItem && (
            <div className="absolute top-4 right-4 text-3xl opacity-30">
              {backgroundEmoji[bgItem.id] || bgItem.emoji}
            </div>
          )}

          <div className="flex items-start gap-5">
            <div className="relative">
              <BeastSvg color={beast.color} status={beast.status} size={120} animated />
              {toyItem && (
                <div className="absolute -right-1 bottom-0 text-2xl">
                  {toyEmoji[toyItem.id] || toyItem.emoji}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 mb-1">
                <h1 className="text-xl font-bold text-gray-800 truncate">{work.title}</h1>
              </div>
              <p className="text-sm text-gray-500">{work.author} · {beast.name}</p>
              {titleItem && (
                <p className="text-xs text-coral-500 font-medium mt-1">
                  👑 {titleItem.name}
                </p>
              )}

              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1.5">
                  <Star size={14} className="text-amber-500 fill-amber-500" />
                  <span className="text-sm font-bold text-amber-600">Lv.{beast.level.level}</span>
                  <span className="text-xs text-gray-400">{beast.level.title}</span>
                </div>
              </div>

              <div className="mt-3 w-full bg-gray-100 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${beast.vitality}%`,
                    backgroundColor: beast.vitality > 50 ? '#98D8C8' : beast.vitality > 30 ? '#FFE66D' : '#FFB5C5',
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>活力 {beast.vitality}%</span>
                <span>等待 {beast.waitDays} 天</span>
              </div>

              <div className="mt-4">
                <AchievementBadges beast={beast} size="sm" />
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 flex gap-2">
            <Link
              to={`/feed/${workId}`}
              className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-peach-50 text-coral-600 rounded-xl text-sm font-medium hover:bg-peach-100 transition-colors"
            >
              <Heart size={16} />
              投喂
            </Link>
            <Link
              to={`/urge/${workId}`}
              className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-mint-50 text-teal-600 rounded-xl text-sm font-medium hover:bg-mint-100 transition-colors"
            >
              <Megaphone size={16} />
              催更
            </Link>
            {hasNewChapter ? (
              <Link
                to={`/celebrate/${workId}`}
                className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-gradient-to-r from-coral-500 to-peach-500 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Sparkles size={16} />
                领取糖果
              </Link>
            ) : (
              <button
                onClick={() => setShowMonthly(true)}
                className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-amber-50 text-amber-600 rounded-xl text-sm font-medium hover:bg-amber-100 transition-colors"
              >
                <BarChart3 size={16} />
                月度回顾
              </button>
            )}
          </div>
        </div>

        {stats.favoriteCount > 0 && (
          <div className="bg-white/70 backdrop-blur rounded-2xl p-4 mb-4">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <BarChart3 size={16} className="text-coral-500" />
              互动概览
            </h3>
            <div className="grid grid-cols-4 gap-3 mb-3">
              <StatCard label="投喂" value={bond?.totalFedDays || 0} icon="💕" color="text-coral-600 bg-coral-50" />
              <StatCard label="催更" value={bond?.totalUrgeCount || 0} icon="📣" color="text-teal-600 bg-teal-50" />
              <StatCard label="庆祝" value={bond?.totalCelebrateCount || 0} icon="🎉" color="text-purple-600 bg-purple-50" />
              <StatCard label="装饰" value={bond?.ownedDecoCount || 0} icon="🏠" color="text-rose-600 bg-rose-50" />
            </div>
            <div className="text-sm text-gray-500 bg-peach-50/60 rounded-xl px-3 py-2.5">
              🦋 最常用互动：<span className="font-medium text-gray-700">{favoriteLabel}</span>（{stats.favoriteCount} 次）
            </div>
          </div>
        )}

        <div className="bg-white/70 backdrop-blur rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500" />
              近7天陪伴
            </h3>
          </div>
          {stats.recent7Days.length > 0 ? (
            <div className="space-y-3">
              {stats.recent7Days.slice(0, 8).map(event => (
                <div key={event.id} className="flex items-start gap-3">
                  <div className="text-lg mt-0.5">{event.emoji || EVENT_EMOJI[event.type] || '✨'}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600">{event.description}</p>
                    <p className="text-xs text-gray-300 mt-0.5">
                      {new Date(event.timestamp).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">近7天还没有陪伴记录~</p>
          )}
        </div>

        {beast.ownedDecorations.length > 0 && (
          <div className="bg-white/70 backdrop-blur rounded-2xl p-4 mb-4">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              🏠 当前小窝
            </h3>
            <div className="flex flex-wrap gap-3">
              {bgItem && (
                <div className="flex items-center gap-2 bg-indigo-50 rounded-lg px-3 py-2">
                  <span className="text-xl">{backgroundEmoji[bgItem.id] || bgItem.emoji}</span>
                  <span className="text-sm text-gray-700">{bgItem.name}</span>
                </div>
              )}
              {toyItem && (
                <div className="flex items-center gap-2 bg-amber-50 rounded-lg px-3 py-2">
                  <span className="text-xl">{toyEmoji[toyItem.id] || toyItem.emoji}</span>
                  <span className="text-sm text-gray-700">{toyItem.name}</span>
                </div>
              )}
              {titleItem && (
                <div className="flex items-center gap-2 bg-rose-50 rounded-lg px-3 py-2">
                  <span className="text-xl">👑</span>
                  <span className="text-sm text-gray-700">{titleItem.name}</span>
                </div>
              )}
              {beast.ownedDecorations.length > 0 && (
                <div className="text-xs text-gray-400 self-center">
                  共 {beast.ownedDecorations.length} 件收藏
                </div>
              )}
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="bg-white/70 backdrop-blur rounded-2xl p-4 mb-4">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              🎊 庆祝历史
            </h3>
            <div className="space-y-2">
              {history.slice(0, 5).map(r => (
                <div key={r.id} className="flex items-center justify-between bg-purple-50/60 rounded-xl px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{r.chapterTitle}</p>
                    <p className="text-xs text-gray-400">{new Date(r.celebratedAt).toLocaleDateString('zh-CN')}</p>
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    <span className="text-xs text-gray-400">等待 {r.waitDays} 天</span>
                    <span className="text-sm font-bold text-amber-500">🍬 {r.candiesCollected}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white/70 backdrop-blur rounded-2xl p-4 mb-4">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            💖 羁绊档案
          </h3>
          {bond && <BondProfile bond={bond} beastName={beast.name} />}
        </div>

        <div className="bg-white/70 backdrop-blur rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Trophy size={16} className="text-amber-500" />
              成就徽章
              <span className="text-xs text-gray-400 font-normal ml-1">
                {getU(beast).length} / {ACHIEVEMENT_LIST.length}
              </span>
            </h3>
            <button
              onClick={() => setShowAchievements(!showAchievements)}
              className="text-xs text-coral-500 hover:text-coral-600 font-medium"
            >
              {showAchievements ? '收起' : '查看全部'}
            </button>
          </div>
          <AchievementBadges beast={beast} showAll={showAchievements} />
          {!showAchievements && getU(beast).length === 0 && (
            <p className="text-xs text-gray-400 text-center py-4">
              继续陪伴就会解锁成就徽章哦~
            </p>
          )}
        </div>
      </div>

      {showMonthly && (
        <MonthlyReview
          year={new Date().getFullYear()}
          month={new Date().getMonth()}
          workId={workId}
          workTitle={work.title}
          onClose={() => setShowMonthly(false)}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  return (
    <div className={cn('rounded-xl p-3 text-center', color)}>
      <div className="text-base">{icon}</div>
      <div className="text-lg font-bold mt-1">{value}</div>
      <div className="text-xs opacity-70 mt-0.5">{label}</div>
    </div>
  );
}

