import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Check } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { BeastSvg } from '../components/BeastSvg';

export function Feed() {
  const { workId } = useParams<{ workId: string }>();
  const navigate = useNavigate();
  const { works, beasts, feedBeast, getEncouragementMessages } = useGameStore();
  const [selectedMessage, setSelectedMessage] = useState<string>('');
  const [isFeeding, setIsFeeding] = useState(false);
  const [feedSuccess, setFeedSuccess] = useState(false);

  const work = works.find(w => w.id === workId);
  const beast = beasts[workId || ''];
  const messages = getEncouragementMessages();

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

  const handleFeed = () => {
    if (!selectedMessage || beast.fedToday || isFeeding) return;

    setIsFeeding(true);
    setTimeout(() => {
      feedBeast(work.id, selectedMessage);
      setFeedSuccess(true);
      setIsFeeding(false);
    }, 800);
  };

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

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">投喂 {beast.name}</h1>
          <p className="text-gray-500">{work.title}</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm mb-6 relative overflow-hidden">
          <div className="flex justify-center mb-6">
            <div className={isFeeding || feedSuccess ? 'animate-bounce' : ''}>
              <BeastSvg color={beast.color} status={feedSuccess ? 'energetic' : beast.status} size={140} />
            </div>
          </div>

          {feedSuccess ? (
            <div className="text-center">
              <div className="text-5xl mb-4 animate-bounce">💕</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">投喂成功！</h2>
              <p className="text-gray-500 mb-4">{beast.name} 很开心~</p>
              <p className="text-sm text-mint-600 font-medium">活力值 +10，糖果 +1 🍬</p>
            </div>
          ) : (
            <>
              <p className="text-center text-gray-600 mb-4">
                {beast.fedToday
                  ? '今天已经喂过啦，明天再来吧~'
                  : '选一句鼓励的话投喂吧！'}
              </p>

              {!beast.fedToday && (
                <div className="space-y-3 mb-6">
                  {messages.map((msg, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedMessage(msg)}
                      className={`w-full p-4 rounded-2xl text-left transition-all duration-200 ${
                        selectedMessage === msg
                          ? 'bg-peach-100 border-2 border-coral-300 text-coral-700'
                          : 'bg-gray-50 border-2 border-transparent text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {selectedMessage === msg && (
                          <Check size={18} className="text-coral-500 flex-shrink-0" />
                        )}
                        <span className="text-sm">{msg}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {feedSuccess ? (
          <Link
            to="/"
            className="block w-full py-4 bg-gradient-to-r from-coral-500 to-peach-500 text-white rounded-2xl font-bold text-center shadow-lg hover:shadow-xl transition-all"
          >
            返回看看其他小兽
          </Link>
        ) : (
          <button
            onClick={handleFeed}
            disabled={!selectedMessage || beast.fedToday || isFeeding}
            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
              selectedMessage && !beast.fedToday && !isFeeding
                ? 'bg-gradient-to-r from-coral-500 to-peach-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isFeeding ? (
              '投喂中...'
            ) : beast.fedToday ? (
              '今日已投喂'
            ) : (
              <>
                <Heart size={20} />
                投喂 {beast.name}
              </>
            )}
          </button>
        )}

        <div className="mt-6 bg-white/60 rounded-2xl p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">累计投喂</span>
            <span className="font-bold text-gray-700">{beast.totalFedDays} 天</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-500">连续投喂</span>
            <span className="font-bold text-coral-500">{beast.consecutiveFedDays} 天</span>
          </div>
        </div>
      </div>
    </div>
  );
}
