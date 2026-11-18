import { Activity, Dumbbell, Plus, Scale, Utensils } from 'lucide-react';
import type { AppTab } from '../types/fitness';

interface MobileNavProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onOpenLogWorkout: () => void;
}

const TABS: Array<{ id: AppTab; label: string; icon: typeof Activity }> = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'workouts', label: 'Workouts', icon: Dumbbell },
  { id: 'nutrition', label: 'Nutrition', icon: Utensils },
  { id: 'body', label: 'Body', icon: Scale },
];

export function MobileHeader({ onOpenLogWorkout }: { onOpenLogWorkout: () => void }) {
  return (
    <header className="lg:hidden sticky top-0 z-30 h-13 px-4 bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between gap-4">
      <span className="font-display text-lg font-bold tracking-tight text-slate-950 whitespace-nowrap shrink-0">
        Cadence
      </span>
      <button
        type="button"
        onClick={onOpenLogWorkout}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 active:scale-[0.98] transition-all whitespace-nowrap shrink-0"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Log Workout</span>
      </button>
    </header>
  );
}

export function MobileBottomNav({ activeTab, onSelectTab }: Pick<MobileNavProps, 'activeTab' | 'onSelectTab'>) {
  return (
    <nav
      aria-label="Mobile navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200"
    >
      <div className="grid grid-cols-4 h-15">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`min-h-[44px] flex flex-col items-center justify-center gap-1 transition-colors whitespace-nowrap shrink-0 ${
                isActive ? 'text-orange-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[11px] font-medium leading-none">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
