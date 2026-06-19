import { X, Heart, Megaphone, Share2, Sparkles, Palette, Candy } from 'lucide-react';
import type { MonthlySummary } from '../types';

interface MonthlyReviewProps {
  summary: MonthlySummary;
  onClose: () => void;
}

export function MonthlyReview({ summary, onClose }: MonthlyReviewProps) {
  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm">
        <div className="bg-gradient-to-br from-coral-50 via-peach-50 to-amber-50 rounded-3xl overflow-hidden shadow-2xl border-2 border-coral-200">
          <div className="relative p-6">
            <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-white/50 rounded-lg">
              <X size={18} className="text-gray-400" />
            </button>

            <div className="text-center mb-5">
              <div className="text-4xl mb-2">🐾</div>
              <h3 className="text-lg font-bold text-gray-800">
                {summary.year}年{monthNames[summary.month]}
              </h3>
              <p className="text-sm text-gray-500">本月陪伴总结</p>
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

            {summary.decorateCount > 0 && (
              <div className="text-center">
                <span className="text-xs text-gray-400">
                  还为小兽装饰了 {summary.decorateCount} 次小窝 🏠
                </span>
              </div>
            )}

            <div className="text-center mt-4 pt-4 border-t border-coral-100">
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
