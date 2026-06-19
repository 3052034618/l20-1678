import { Heart, Megaphone, Sparkles, Palette, Calendar, MessageCircle, Lock } from 'lucide-react';
import type { BondStats, BeastDialogue } from '../types';
import { LEVEL_TITLES } from '../types';

interface BondProfileProps {
  bond: BondStats;
  beastName: string;
}

export function BondProfile({ bond, beastName }: BondProfileProps) {
  return (
    <div className="bg-white/60 rounded-2xl p-4 space-y-4">
      <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
        <Sparkles size={16} className="text-amber-500" />
        羁绊档案
      </h4>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-coral-50 rounded-xl p-3 text-center">
          <Calendar size={14} className="mx-auto text-coral-400 mb-1" />
          <div className="text-lg font-bold text-coral-600">{bond.companionshipDays}</div>
          <div className="text-xs text-gray-500">陪伴天数</div>
        </div>
        <div className="bg-peach-50 rounded-xl p-3 text-center">
          <Heart size={14} className="mx-auto text-peach-400 mb-1" fill="currentColor" />
          <div className="text-lg font-bold text-peach-600">{bond.totalFedDays}</div>
          <div className="text-xs text-gray-500">累计投喂</div>
        </div>
        <div className="bg-amber-50 rounded-xl p-3 text-center">
          <span className="text-sm">🔥</span>
          <div className="text-lg font-bold text-amber-600">{bond.consecutiveFedDays}</div>
          <div className="text-xs text-gray-500">连续投喂</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-mint-50 rounded-xl p-3 text-center">
          <Megaphone size={14} className="mx-auto text-teal-400 mb-1" />
          <div className="text-lg font-bold text-teal-600">{bond.totalUrgeCount}</div>
          <div className="text-xs text-gray-500">催更次数</div>
        </div>
        <div className="bg-purple-50 rounded-xl p-3 text-center">
          <Sparkles size={14} className="mx-auto text-purple-400 mb-1" />
          <div className="text-lg font-bold text-purple-600">{bond.totalCelebrateCount}</div>
          <div className="text-xs text-gray-500">庆祝次数</div>
        </div>
        <div className="bg-rose-50 rounded-xl p-3 text-center">
          <Palette size={14} className="mx-auto text-rose-400 mb-1" />
          <div className="text-lg font-bold text-rose-600">{bond.ownedDecoCount}</div>
          <div className="text-xs text-gray-500">装饰收藏</div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-coral-50 to-peach-50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle size={14} className="text-coral-500" />
          <span className="text-sm font-medium text-gray-700">{beastName}的独白</span>
          <span className="text-xs text-gray-400 ml-auto">
            已解锁 {bond.unlockedDialogues.length}/{15}
          </span>
        </div>

        {bond.unlockedDialogues.length > 0 && (
          <div className="space-y-2 mb-3">
            {bond.unlockedDialogues.slice(-3).map(d => (
              <DialogueBubble key={d.id} dialogue={d} />
            ))}
            {bond.unlockedDialogues.length > 3 && (
              <div className="text-center">
                <span className="text-xs text-gray-400">还有 {bond.unlockedDialogues.length - 3} 条对白...</span>
              </div>
            )}
          </div>
        )}

        {bond.nextDialogueHint && (
          <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/50 rounded-lg px-3 py-2">
            <Lock size={12} />
            {bond.nextDialogueHint}
          </div>
        )}
      </div>
    </div>
  );
}

function DialogueBubble({ dialogue }: { dialogue: BeastDialogue }) {
  return (
    <div className="flex items-start gap-2">
      <div className="w-6 h-6 rounded-full bg-coral-100 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
        🐾
      </div>
      <div className="bg-white/70 rounded-xl px-3 py-2 text-sm text-gray-600 flex-1">
        {dialogue.text}
      </div>
    </div>
  );
}
