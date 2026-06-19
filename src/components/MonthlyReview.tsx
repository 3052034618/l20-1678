import { useState } from 'react';
import { X, Heart, Megaphone, Share2, Sparkles, Palette, Candy, ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';

interface MonthlyReviewProps {
  year?: number;
  month?: number;
  workId?: string;
  workTitle?: string;
  onClose: () => void;
}

export function MonthlyReview({ year, month, workId, workTitle, onClose }: MonthlyReviewProps) {
  const { getMonthlySummary } = useGameStore();
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(year ?? now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(month ?? now.getMonth());
  const [copied, setCopied] = useState(false);

  const summary = getMonthlySummary(currentYear, currentMonth, workId);
  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  const isSingleWork = !!workId;
  const isCurrentMonth = currentYear === now.getFullYear() && currentMonth === now.getMonth();

  const navigateMonth = (dir: -1 | 1) => {
    let y = currentYear;
    let m = currentMonth + dir;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    if (y > now.getFullYear() || (y === now.getFullYear() && m > now.getMonth())) return;
    setCurrentYear(y);
    setCurrentMonth(m);
  };

  const buildShareText = () => {
    if (!summary) return '';
    const title = isSingleWork && workTitle ? `【${workTitle}】` : '【追更陪伴小结】';
    const lines = [
      `${title}${currentYear}年${currentMonth + 1}月`,
      summary.shortComment,
      '',
      `💕 投喂 ${summary.feedCount}次  |  📣 催更 ${summary.urgeCount}次`,
      `🎉 庆祝 ${summary.celebrateCount}次  |  🏠 装饰 ${summary.decorateCount}次`,
      `🍬 本月糖果 ${summary.totalCandyEarned}颗`,
      summary.consecutiveRecord > 0 ? `🔥 连续投喂纪录 ${summary.consecutiveRecord} 天` : '',
      summary.topWorkTitle && !isSingleWork ? `👑 最陪伴作品：${summary.topWorkCover}《${summary.topWorkTitle}》` : '',
      '',
      '——来自更新小兽 🐾',
    ].filter(Boolean);
    return lines.join('\n');
  };

  const handleCopy = async () => {
    const text = buildShareText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  if (!summary) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm">
        <div className="bg-gradient-to-br from-coral-50 via-peach-50 to-amber-50 rounded-3xl overflow-hidden shadow-2xl border-2 border-coral-200">
          <div className="relative p-6 max-h-[85vh] overflow-y-auto">
            <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-white/50 rounded-lg z-10">
              <X size={18} className="text-gray-400" />
            </button>

            <div className="text-center mb-5">
              <div className="text-4xl mb-2">{isSingleWork ? '�' : '�🐾'}</div>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-1 hover:bg-white/50 rounded-lg disabled:opacity-30"
                  disabled={currentYear < 2020}
                >
                  <ChevronLeft size={18} className="text-gray-500" />
                </button>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    {currentYear}年{monthNames[currentMonth]}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {isSingleWork ? '单作品陪伴总结' : isCurrentMonth ? '本月陪伴总结' : '本月陪伴总结'}
                  </p>
                </div>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-1 hover:bg-white/50 rounded-lg disabled:opacity-30"
                  disabled={isCurrentMonth}
                >
                  <ChevronRight size={18} className="text-gray-500" />
                </button>
              </div>
            </div>

            <div className="bg-white/60 rounded-2xl p-4 mb-4">
              <div className="grid grid-cols-2 gap-3">
                <StatItem icon={<Heart size={14} className="text-coral-500" />} label="投喂" value={summary.feedCount} />
                <StatItem icon={<Megaphone size={14} className="text-teal-500" />} label="催更" value={summary.urgeCount} />
                <StatItem icon={<Share2 size={14} className="text-peach-500" />} label="分享" value={summary.shareCount} />
                <StatItem icon={<Sparkles size={14} className="text-amber-500" />} label="庆祝" value={summary.celebrateCount} />
              </div>
            </div>

            <div className="bg-white/60 rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 flex items-center gap-1.5">
                  🍬 本月糖果
                </span>
                <span className="text-lg font-bold text-amber-600">{summary.totalCandyEarned}</span>
              </div>
              {summary.topWorkTitle && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-1.5">
                    👑 最陪伴作品
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {summary.topWorkCover} {summary.topWorkTitle}
                  </span>
                </div>
              )}
              {summary.consecutiveRecord > 0 && (
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-600 flex items-center gap-1.5">
                    🔥 连投纪录
                  </span>
                  <span className="text-sm font-bold text-coral-500">{summary.consecutiveRecord} 天</span>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-r from-white/80 to-white/60 rounded-2xl p-4 mb-4 border border-coral-100">
              <div className="flex items-start gap-2">
                <span className="text-lg">💭</span>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {summary.shortComment}
                </p>
              </div>
            </div>

            {summary.decorateCount > 0 && (
              <div className="text-center mb-3">
                <span className="text-xs text-gray-400">
                  还为小兽装饰了 {summary.decorateCount} 次小窝 🏠
                </span>
              </div>
            )}

            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-coral-500 to-peach-500 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity mb-3"
            >
              {copied ? (
                <><Check size={16} /> 已复制分享文案</>
              ) : (
                <><Copy size={16} /> 复制为分享文案</>
              )}
            </button>

            <div className="text-center pt-3 border-t border-coral-100">
              <p className="text-xs text-gray-400">
                🐾 来自「更新小兽」追更陪伴
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-bold text-gray-700 ml-auto">{value}</span>
    </div>
  );
}
