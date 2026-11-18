import { Check, Flag, Pause, Play, RotateCcw, Timer } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LiveTimerCardProps {
  onFinishSession: (durationMin: number, estimatedCalories: number) => void;
}

export function LiveTimerCard({ onFinishSession }: LiveTimerCardProps) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const [restSecondsLeft, setRestSecondsLeft] = useState<number>(0);
  const [restActive, setRestActive] = useState(false);

  useEffect(() => {
    if (!running) return;
    const startRef = Date.now() - elapsedMs;
    const id = window.setInterval(() => {
      setElapsedMs(Date.now() - startRef);
    }, 100);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (!restActive) return;
    if (restSecondsLeft <= 0) {
      setRestActive(false);
      return;
    }
    const id = window.setTimeout(() => {
      setRestSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearTimeout(id);
  }, [restActive, restSecondsLeft]);

  const totalSeconds = Math.floor(elapsedMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((elapsedMs % 1000) / 100);

  const formattedClock =
    hours > 0
      ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${tenths}`;

  const handleReset = () => {
    setRunning(false);
    setElapsedMs(0);
    setLaps([]);
  };

  const handleLap = () => {
    setLaps((prev) => [elapsedMs, ...prev].slice(0, 4));
  };

  const startRest = (secs: number) => {
    setRestSecondsLeft(secs);
    setRestActive(true);
  };

  const handleLogElapsed = () => {
    const mins = Math.max(1, Math.round(elapsedMs / 60000));
    const estCalories = Math.round(mins * 8.5);
    setRunning(false);
    onFinishSession(mins, estCalories);
  };

  const formatLap = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const remS = s % 60;
    return `${String(m).padStart(2, '0')}:${String(remS).padStart(2, '0')}`;
  };

  return (
    <section className="bg-slate-950 text-slate-50 border border-slate-800 rounded-xl p-5 sm:p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-orange-400" />
            <h2 className="font-display text-sm font-semibold tracking-wide text-slate-100">
              Live Session Timer
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400 tabular-nums">
            {running ? 'Recording' : elapsedMs > 0 ? 'Paused' : 'Standby'}
          </span>
        </div>

        <div className="mt-5 py-4 px-4 rounded-lg bg-slate-900 border border-slate-800 text-center">
          <p className="font-mono text-4xl sm:text-5xl font-bold tracking-tight text-white tabular-nums">
            {formattedClock}
          </p>
          <p className="mt-1.5 text-xs font-mono text-slate-400 tabular-nums">
            {laps.length > 0 ? `Last split: ${formatLap(laps[0])}` : 'Ready for sets or intervals'}
          </p>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            className={`flex-1 min-h-[42px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              running
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                : 'bg-orange-600 text-white hover:bg-orange-500'
            }`}
          >
            {running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{running ? 'Pause' : elapsedMs > 0 ? 'Resume' : 'Start'}</span>
          </button>

          <button
            type="button"
            onClick={handleLap}
            disabled={elapsedMs === 0}
            className="min-h-[42px] px-3.5 py-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Split</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={elapsedMs === 0 && !running}
            aria-label="Reset timer"
            className="min-h-[42px] min-w-[42px] inline-flex items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-800 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-slate-400">Rest countdown</span>
          <span className="font-mono text-xs font-semibold text-orange-400 tabular-nums">
            {restActive
              ? `${String(Math.floor(restSecondsLeft / 60)).padStart(2, '0')}:${String(restSecondsLeft % 60).padStart(2, '0')}`
              : 'Idle'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[60, 90, 120].map((secs) => (
            <button
              key={secs}
              type="button"
              onClick={() => startRest(secs)}
              className="py-2 rounded-md bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-200 transition-colors tabular-nums"
            >
              {secs}s
            </button>
          ))}
        </div>

        {elapsedMs >= 10000 && (
          <button
            type="button"
            onClick={handleLogElapsed}
            className="w-full min-h-[40px] inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save {Math.max(1, Math.round(elapsedMs / 60000))} min to Workout Log</span>
          </button>
        )}
      </div>
    </section>
  );
}
