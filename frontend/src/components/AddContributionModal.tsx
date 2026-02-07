import { useState } from 'react';
import { X, TrendingUp } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import { useAccounts } from '../hooks/useAccounts';

interface NewContributionPayload {
  name: string;
  amount: number;
  frequency: string;
  nextDueDate: string;
  categoryId: string;
  accountId: string;
  isAutopay: boolean;
  notes?: string;
}

interface AddContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: NewContributionPayload) => void;
}

const FREQUENCY_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'semi_monthly', label: 'Semi-Monthly' },
  { value: 'biweekly', label: 'Biweekly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annual', label: 'Annual' },
];

export default function AddContributionModal({ isOpen, onClose, onAdd }: AddContributionModalProps) {
  const { data: categories = [] } = useCategories();
  const { data: accounts = [] } = useAccounts();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [accountId, setAccountId] = useState('');
  const [isAutopay, setIsAutopay] = useState(false);
  const [notes, setNotes] = useState('');

  const investmentCategory = categories.find(c => c.name === 'Investment Contribution');

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setAmount('');
    setDueDate('');
    setFrequency('monthly');
    setAccountId('');
    setIsAutopay(false);
    setNotes('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !dueDate || !accountId || !investmentCategory) return;
    onAdd({
      name,
      amount: parseFloat(amount),
      frequency,
      nextDueDate: dueDate,
      categoryId: investmentCategory.id,
      accountId,
      isAutopay,
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    });
    resetForm();
    onClose();
  };

  const selectClass = `
    w-full px-3 py-2.5 rounded-lg appearance-none
    bg-surface-2 border border-border-dim
    text-sm text-text-primary
    focus:outline-none focus:border-accent-violet/50 focus:ring-1 focus:ring-accent-violet/20
    transition-colors cursor-pointer
  `;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="
        relative z-10 w-full max-w-md mx-4
        bg-surface-1 border border-border-default rounded-2xl
        shadow-2xl shadow-black/10
        animate-fade-in-up
      ">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-dim">
          <h2 className="text-base font-semibold text-text-primary">Add Contribution</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-3 text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Contribution Name */}
          <div>
            <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">
              Contribution Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 401k Contribution"
              className="
                w-full px-3 py-2.5 rounded-lg
                bg-surface-2 border border-border-dim
                text-sm text-text-primary placeholder:text-text-muted
                focus:outline-none focus:border-accent-violet/50 focus:ring-1 focus:ring-accent-violet/20
                transition-colors
              "
              required
            />
          </div>

          {/* Amount + Next Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="
                    w-full pl-7 pr-3 py-2.5 rounded-lg
                    bg-surface-2 border border-border-dim
                    text-sm text-text-primary font-mono placeholder:text-text-muted
                    focus:outline-none focus:border-accent-violet/50 focus:ring-1 focus:ring-accent-violet/20
                    transition-colors
                  "
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">
                Next Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="
                  w-full px-3 py-2.5 rounded-lg
                  bg-surface-2 border border-border-dim
                  text-sm text-text-primary
                  focus:outline-none focus:border-accent-violet/50 focus:ring-1 focus:ring-accent-violet/20
                  transition-colors
                  [color-scheme:light]
                "
                required
              />
            </div>
          </div>

          {/* Frequency + Account */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className={selectClass}
              >
                {FREQUENCY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">
                Account
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className={selectClass}
                required
              >
                <option value="" disabled>Select account</option>
                {accounts.filter(a => a.isActive).map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} {a.lastFour ? `(${a.lastFour})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">
              Notes <span className="normal-case text-text-muted/60">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional details..."
              rows={2}
              className="
                w-full px-3 py-2.5 rounded-lg resize-none
                bg-surface-2 border border-border-dim
                text-sm text-text-primary placeholder:text-text-muted
                focus:outline-none focus:border-accent-violet/50 focus:ring-1 focus:ring-accent-violet/20
                transition-colors
              "
            />
          </div>

          {/* Autopay toggle */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAutopay}
                onChange={(e) => setIsAutopay(e.target.checked)}
                className="
                  w-4 h-4 rounded border-border-default bg-surface-2
                  text-accent-violet focus:ring-accent-violet/30
                  cursor-pointer accent-accent-violet
                "
              />
              <span className="text-sm text-text-secondary">Autopay</span>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="
              w-full mt-2 py-2.5 rounded-lg
              bg-accent-violet/15 hover:bg-accent-violet/25
              text-accent-violet text-sm font-semibold
              border border-accent-violet/20 hover:border-accent-violet/30
              transition-all duration-150
              flex items-center justify-center gap-2
              cursor-pointer
            "
          >
            <TrendingUp className="w-4 h-4" />
            Add Contribution
          </button>
        </form>
      </div>
    </div>
  );
}
