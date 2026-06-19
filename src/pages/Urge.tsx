import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Megaphone, Send, Users } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { BeastSvg } from '../components/BeastSvg';
import { cn } from '../lib/utils';

const urgeMessageOptions = [
  '太太加油！我们都在等你~',
  '蹲一个更新，不急慢慢来',
  '好期待下一章！',
  '每天都来刷新，希望有惊喜',
  '辛苦了，注意身体哦',
  '催一下下，轻轻的那种~',
];

export function Urge() {
  const { workId } = useParams<{ workId: string }>();
  const navigate = useNavigate();
  const { works, beasts, urgeStates, urgeUpdate } = useGameStore();
  const [selectedMessage, setSelectedMessage] = useState('');
  const [isUrging, setIsUrging] = useState(false);
  const [urgeSuccess, setUrgeSuccess] = useState(false);

  const work = works.find(w => w.id === workId);
  const beast = beasts[workId || ''];
  const urgeState = urgeStates[workId || ''];

  if (!work || !beast || !urgeState) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream-50 to-peach-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">找不到这个作品...</p>
          <button onClick={() => navigate('/')} className="text-coral-500 font-medium">返回首页</button>
        </div>
      </div>
    );
  }

  const progress = Math.min(100, (urgeState.currentCount / urgeState.targetCount) * 100);
  const isNearTarget = urgeState.currentCount >= urgeState.targetCount;

  const handleUrge = () => {
    if (!selectedMessage || urgeState.userHasUrged || isUrging) return;

    setIsUrging(true);
    setTimeout(() => {
      urgeUpdate(work.id, selectedMessage);
      setUrgeSuccess(true);
      setIsUrging(false);
    }, 600);
  };

  const sortedMessages = [...urgeState.messages].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-peach-50 pb-8">
      <div className="max-w-lg mx-auto px-4 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          返回
        </button>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">集体催更</h1>
          <p className="text-gray-500">{work.title}</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
          <div className="flex items-center justify-center mb-4">
            <BeastSvg color={beast.color} status={beast.status} size={80} animated={false} />
          </div>

          <div className="flex items-center justify-center gap-2 mb-4">
            <Users size={18} className="text-coral-500" />
            <span className="text-sm text-gray-600">
              已有 <span className="font-bold text-coral-500">{urgeState.currentCount}</span> 人催更
            </span>
          </div>

          <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden mb-2">
            <div
              className={cn(
            'h-full rounded-full transition-all duration-1000 ease-out',
            isNearTarget
              ? 'bg-gradient-to-r from-amber-400 to-orange-500'
              : 'bg-gradient-to-r from-coral-400 to-peach-500'
            )}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>0</span>
            <span>目标 {urgeState.targetCount} 人</span>
          </div>

          {isNearTarget && (
            <div className="mt-4 p-3 bg-amber-50 rounded-xl text-center">
              <p className="text-sm text-amber-700 font-medium">
                🎉 快达成目标啦！可以生成应援卡分享咯~
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Megaphone size={18} className="text-coral-500" />
            留言墙
          </h3>

          {urgeSuccess ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-3">✨</div>
              <p className="text-gray-700 font-medium mb-1">催更成功！</p>
              <p className="text-sm text-gray-500">你的留言已经送上~</p>
            </div>
          ) : urgeState.userHasUrged ? (
            <div className="text-center py-6">
              <p className="text-gray-500 text-sm">今天已经催过啦，明天再来吧~</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">选一句温和的催更留言吧</p>

              <div className="space-y-2 mb-6">
                {urgeMessageOptions.map((msg, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedMessage(msg)}
                    className={cn(
                      'w-full p-3 rounded-xl text-left text-sm transition-all duration-200',
                      selectedMessage === msg
                        ? 'bg-peach-100 border-2 border-coral-300 text-coral-700'
                        : 'bg-gray-50 border-2 border-transparent text-gray-600 hover:bg-gray-100'
                    )}
                  >
                    {msg}
                  </button>
                ))}
              </div>

              <button
                onClick={handleUrge}
                disabled={!selectedMessage || isUrging}
                className={cn(
                  'w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all',
                  selectedMessage && !isUrging
                    ? 'bg-gradient-to-r from-coral-500 to-peach-500 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                )}
              >
                {isUrging ? (
                  '发送中...'
                ) : (
                  <>
                    <Send size={16} />
                    发送催更
                  </>
                )}
              </button>
            </>
          )}
        </div>

        {sortedMessages.length > 0 && (
          <div className="bg-white/60 rounded-2xl p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">最新留言</h4>
          <div className="space-y-3">
            {sortedMessages.slice(0, 5).map(msg => (
              <div key={msg.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-peach-100 flex items-center justify-center text-lg flex-shrink-0">
                  {msg.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700">{msg.userName}</p>
                  <p className="text-sm text-gray-500">{msg.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
