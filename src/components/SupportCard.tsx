import { useState } from 'react';
import { Copy, Share2, Check, Image } from 'lucide-react';
import type { SupportCard as SupportCardType } from '../types';
import { cn } from '../lib/utils';

interface SupportCardProps {
  card: SupportCardType;
  onShare: () => void;
  workCover: string;
}

export function SupportCardView({ card, onShare, workCover }: SupportCardProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `💌 ${card.workTitle} 应援卡\n👥 ${card.currentCount}/${card.targetCount} 人已催更\n📝 "${card.slogan}"\n\n${card.selectedMessages.map((m, i) => `${i + 1}. ${m}`).join('\n')}\n\n——来自「更新小兽」追更陪伴`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = shareText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${card.workTitle} 应援卡`,
        text: shareText,
      }).then(() => {
        onShare();
      }).catch(() => {});
    } else {
      handleCopy();
      onShare();
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-coral-50 via-peach-50 to-amber-50 rounded-2xl p-6 border-2 border-coral-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-coral-200/30 to-transparent rounded-bl-full" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-3xl">{workCover}</div>
            <div>
              <h4 className="font-bold text-gray-800 text-lg">{card.workTitle}</h4>
              <p className="text-xs text-gray-500">粉丝应援卡</p>
            </div>
          </div>

          <div className="bg-white/60 rounded-xl p-4 mb-4 text-center">
            <p className="text-lg font-medium text-coral-700 italic">
              "{card.slogan}"
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-3xl font-bold text-coral-500">{card.currentCount}</span>
            <span className="text-gray-400">/</span>
            <span className="text-lg text-gray-500">{card.targetCount}</span>
            <span className="text-sm text-gray-500 ml-1">人催更</span>
          </div>

          {card.selectedMessages.length > 0 && (
            <div className="space-y-2 mb-4">
              <p className="text-xs text-gray-500 font-medium">精选留言：</p>
              {card.selectedMessages.map((msg, i) => (
                <div key={i} className="bg-white/50 rounded-lg px-3 py-2 text-sm text-gray-600">
                  💬 {msg}
                </div>
              ))}
            </div>
          )}

          <div className="text-center">
            <p className="text-xs text-gray-400">
              🐾 来自「更新小兽」追更陪伴
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleCopy}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all',
            copied
              ? 'bg-mint-100 text-mint-700'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          )}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? '已复制' : '复制文案'}
        </button>
        <button
          onClick={handleShare}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all',
            card.shared
              ? 'bg-mint-100 text-mint-700'
              : 'bg-gradient-to-r from-coral-500 to-peach-500 text-white shadow-md hover:shadow-lg'
          )}
        >
          {card.shared ? <Check size={16} /> : <Share2 size={16} />}
          {card.shared ? '已分享' : '分享应援'}
        </button>
      </div>

      {card.shared && (
        <div className="text-center text-xs text-mint-600 font-medium">
          ✨ 分享成功！小兽获得 +3 成长经验
        </div>
      )}
    </div>
  );
}
