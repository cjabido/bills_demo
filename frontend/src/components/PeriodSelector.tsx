import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface PeriodSelectorProps {
  currentDate: Date;
  onPrev: () => void;
  onNext: () => void;
}

export default function PeriodSelector({ currentDate, onPrev, onNext }: PeriodSelectorProps) {
  const day = currentDate.getDate();
  const half = day <= 15 ? '1H' : '2H';

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onPrev}
        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-3 text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <div className="px-3 py-1.5 rounded-lg bg-surface-2 border border-border-dim">
        <span className="text-sm font-medium text-text-primary">
          {format(currentDate, 'MMMM yyyy')}
        </span>
        <span className="text-xs text-accent-sky ml-2 font-mono">
          {half}
        </span>
      </div>
      <button
        onClick={onNext}
        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-3 text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
