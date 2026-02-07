import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import type { RecurringInvestment } from '../hooks/useInvestments';

interface MarkContributedModalProps {
  investment: RecurringInvestment | null;
  onConfirm: (id: string, amount: number) => void;
  onClose: () => void;
}

export default function MarkContributedModal({ investment, onConfirm, onClose }: MarkContributedModalProps) {
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (investment) {
      setAmount(investment.amount.toFixed(2));
    }
  }, [investment]);

  if (!investment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) return;
    onConfirm(investment.id, parsed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="
        relative z-10 w-full max-w-sm mx-4
        bg-surface-1 border border-border-default rounded-2xl
        shadow-2xl shadow-black/10
        animate-fade-in-up
      ">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-dim">
          <h2 className="text-base font-semibold text-text-primary">Mark as Contributed</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-3 text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-text-secondary">
            Confirm contribution for <span className="font-medium text-text-primary">{investment.name}</span>
          </p>

          <div>
            <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">$</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                className="
                  w-full pl-7 pr-3 py-2.5 rounded-lg
                  bg-surface-2 border border-border-dim
                  text-sm text-text-primary font-mono placeholder:text-text-muted
                  focus:outline-none focus:border-accent-sky/50 focus:ring-1 focus:ring-accent-sky/20
                  transition-colors
                "
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="
                flex-1 py-2.5 rounded-lg
                bg-surface-2 hover:bg-surface-3
                text-text-secondary text-sm font-medium
                border border-border-dim
                transition-all duration-150
                cursor-pointer
              "
            >
              Cancel
            </button>
            <button
              type="submit"
              className="
                flex-1 py-2.5 rounded-lg
                bg-accent-mint/15 hover:bg-accent-mint/25
                text-accent-mint text-sm font-semibold
                border border-accent-mint/20 hover:border-accent-mint/30
                transition-all duration-150
                flex items-center justify-center gap-2
                cursor-pointer
              "
            >
              <Check className="w-4 h-4" />
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
