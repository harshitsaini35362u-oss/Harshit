import { Activity, Dumbbell, Scale, Utensils } from 'lucide-react';
import { useState } from 'react';
import type { AppTab } from '../types/fitness';

interface SidebarProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  athleteName: string;
  weeklyMinutes: number;
  weeklyGoalMinutes: number;
  streakDays: number;
}

const NAV_ITEMS: Array<{ id: AppTab; label: string; icon: typeof Activity }> = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'workouts', label: 'Workouts', icon: Dumbbell },
  { id: 'nutrition', label: 'Nutrition', icon: Utensils },
  { id: 'body', label: 'Body & Goals', icon: Scale },
];

export function Sidebar({
  activeTab,
  onSelectTab,
  athleteName,
  weeklyMinutes,
  weeklyGoalMinutes,
  streakDays,
}: SidebarProps) {
  const [imgError, setImgError] = useState(false);
  const weeklyPct = Math.min(100, Math.round((weeklyMinutes / Math.max(1, weeklyGoalMinutes)) * 100));
  const initials = athleteName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:shrink-0 border-r border-slate-200 bg-white min-h-screen sticky top-0 h-screen justify-between">
      <div className="p-6">
        <button
          type="button"
          onClick={() => onSelectTab('overview')}
          className="text-left block w-full mb-8 focus-visible:outline-2"
        >
          <span className="font-display text-xl font-bold tracking-tight text-slate-950 whitespace-nowrap shrink-0">
            Cadence
          </span>
        </button>

        <nav aria-label="Primary navigation" className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-orange-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-6 space-y-5 border-t border-slate-200">
        <div>
          <div className="flex items-baseline justify-between text-xs mb-2">
            <span className="font-medium text-slate-600">Weekly target</span>
            <span className="font-mono tabular-nums text-slate-900 font-medium">
              {weeklyMinutes} / {weeklyGoalMinutes} min
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-600 transition-all duration-300"
              style={{ width: `${weeklyPct}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500 tabular-nums">
            {weeklyPct}% complete · {streakDays}-day streak
          </p>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
          {!imgError ? (
            <img
              src="/src/assets/images/avatar_athlete_1795024192546.jpg"
              alt={athleteName}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-slate-900 text-white text-xs font-semibold flex items-center justify-center shrink-0">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{athleteName}</p>
            <p className="text-xs text-slate-500 truncate">Athlete profile</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
