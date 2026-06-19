import { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { MonthlyReview } from './MonthlyReview';

export function Timeline() {
  const { timeline, works, subscribedWorkIds, getMonthlySummary } = useGameStore();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString());
  const [showAll, setShowAll] = useState(false);
  const [filterWorkId, setFilterWorkId] = useState<string>('all');
  const [showMonthlyReview, setShowMonthlyReview] = useState(false);

  const subscribedWorks = works.filter(w => subscribedWorkIds.includes(w.id));
  const filteredTimeline = filterWorkId === 'all'
    ? timeline
    : timeline.filter(e => e.workId === filterWorkId);

  const dates = [...new Set(
    filteredTimeline.map(e => {
      const d = new Date(e.timestamp);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
    })
  )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const selectedDayEvents = filteredTimeline.filter(e => {
    const eDate = new Date(e.timestamp);
    const sDate = new Date(selectedDate);
    return eDate.getFullYear() === sDate.getFullYear() &&
      eDate.getMonth() === sDate.getMonth() &&
      eDate.getDate() === sDate.getDate();
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const navigateDate = (dir: -1 | 1) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + dir);
    setSelectedDate(d.toISOString());
  };

  const formatDateLabel = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    const dStr = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (todayStr === dStr) return '今天';
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`;
    if (yStr === dStr) return '昨天';
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  };

  const displayDates = showAll ? dates : dates.slice(0, 7);

  const currentMonthSummary = (() => {
    const now = new Date();
    return getMonthlySummary(now.getFullYear(), now.getMonth(), filterWorkId !== 'all' ? filterWorkId : undefined);
  })();

  if (timeline.length === 0) return null;

  return (
    <>
      <div className="bg-white/70 backdrop-blur rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <CalendarDays size={18} className="text-coral-500" />
            追更时间线
          </h3>
          {currentMonthSummary && (
            <button
              onClick={() => setShowMonthlyReview(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-xs font-medium hover:bg-amber-100 transition-colors"
            >
              <BarChart3 size={14} />
              本月回顾
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          <button
            onClick={() => setFilterWorkId('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              filterWorkId === 'all'
                ? 'bg-gray-700 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            全部
          </button>
          {subscribedWorks.map(work => (
            <button
              key={work.id}
              onClick={() => setFilterWorkId(work.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                filterWorkId === work.id
                  ? 'bg-coral-100 text-coral-600'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {work.cover} {work.title}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          {displayDates.map(dateStr => (
            <button
              key={dateStr}
              onClick={() => setSelectedDate(dateStr)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                new Date(selectedDate).toDateString() === new Date(dateStr).toDateString()
                  ? 'bg-coral-100 text-coral-600'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {formatDateLabel(dateStr)}
            </button>
          ))}
          {dates.length > 7 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-2 py-1.5 text-xs text-coral-500 hover:text-coral-600 font-medium"
            >
              {showAll ? '收起' : '更多...'}
            </button>
          )}
        </div>

        <div className="flex items-center justify-between mb-3">
          <button onClick={() => navigateDate(-1)} className="p-1 hover:bg-gray-100 rounded">
            <ChevronLeft size={18} className="text-gray-400" />
          </button>
          <span className="text-sm font-medium text-gray-600">
            {formatDateLabel(selectedDate)}
          </span>
          <button onClick={() => navigateDate(1)} className="p-1 hover:bg-gray-100 rounded">
            <ChevronRight size={18} className="text-gray-400" />
          </button>
        </div>

        {selectedDayEvents.length > 0 ? (
          <div className="space-y-3">
            {selectedDayEvents.map(event => (
              <div key={event.id} className="flex items-start gap-3">
                <div className="text-lg mt-0.5">{event.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-gray-700">{event.workCover} {event.workTitle}</span>
                  </div>
                  <p className="text-xs text-gray-500">{event.description}</p>
                  <p className="text-xs text-gray-300 mt-0.5">
                    {new Date(event.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-gray-400 py-4">这天没有陪伴记录~</p>
        )}
      </div>

      {showMonthlyReview && currentMonthSummary && (
        <MonthlyReview summary={currentMonthSummary} onClose={() => setShowMonthlyReview(false)} />
      )}
    </>
  );
}
