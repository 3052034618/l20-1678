import { useState } from 'react';
import { X, ShoppingBag, Check } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import type { ShopItemCategory, ShopItem } from '../types';
import { cn } from '../lib/utils';

interface CandyShopProps {
  workId: string;
  onClose: () => void;
}

const categoryLabels: Record<ShopItemCategory, { label: string; icon: string }> = {
  background: { label: '背景', icon: '🖼️' },
  toy: { label: '玩具', icon: '🧸' },
  title: { label: '称号', icon: '👑' },
};

export function CandyShop({ workId, onClose }: CandyShopProps) {
  const { shopItems, beasts, purchaseShopItem, getAvailableCandies } = useGameStore();
  const [activeCategory, setActiveCategory] = useState<ShopItemCategory>('background');
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);

  const beast = beasts[workId];
  const availableCandies = getAvailableCandies();

  if (!beast) return null;

  const filteredItems = shopItems.filter(item => item.category === activeCategory);

  const handlePurchase = (item: ShopItem) => {
    const success = purchaseShopItem(workId, item.id);
    if (success) {
      setPurchaseSuccess(item.id);
      setTimeout(() => setPurchaseSuccess(null), 2000);
    }
  };

  const isEquipped = (item: ShopItem) => beast.decorations[item.category] === item.id;
  const canAfford = (item: ShopItem) => availableCandies >= item.price;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} className="text-coral-500" />
              <h3 className="font-bold text-gray-800">小兽小窝</h3>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">为 {beast.name} 装扮小窝</span>
            <span className="ml-auto text-amber-600 font-bold">🍬 {availableCandies}</span>
          </div>

          <div className="flex gap-2 mt-3">
            {(Object.keys(categoryLabels) as ShopItemCategory[]).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  activeCategory === cat
                    ? 'bg-coral-100 text-coral-600'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                )}
              >
                <span>{categoryLabels[cat].icon}</span>
                {categoryLabels[cat].label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {filteredItems.map(item => {
            const equipped = isEquipped(item);
            const affordable = canAfford(item);

            return (
              <div
                key={item.id}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-xl border-2 transition-all',
                  equipped
                    ? 'border-coral-200 bg-coral-50'
                    : purchaseSuccess === item.id
                    ? 'border-mint-200 bg-mint-50'
                    : 'border-transparent bg-gray-50'
                )}
              >
                <div className="text-3xl">{item.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-700">{item.name}</span>
                    {equipped && (
                      <span className="text-xs bg-coral-100 text-coral-500 px-2 py-0.5 rounded-full">
                        装备中
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                </div>
                <button
                  onClick={() => handlePurchase(item)}
                  disabled={equipped || !affordable}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    equipped
                      ? 'bg-coral-100 text-coral-500 cursor-default'
                      : purchaseSuccess === item.id
                      ? 'bg-mint-100 text-mint-600'
                      : affordable
                      ? 'bg-gradient-to-r from-coral-500 to-peach-500 text-white hover:shadow-md'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  )}
                >
                  {equipped ? (
                    <span className="flex items-center gap-1"><Check size={12} /> 已装备</span>
                  ) : purchaseSuccess === item.id ? (
                    <span className="flex items-center gap-1"><Check size={12} /> 成功</span>
                  ) : (
                    `🍬 ${item.price}`
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
