import { useState, useEffect } from 'react';
import { X, Plus, Save } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import { useAccounts } from '../hooks/useAccounts';
import type { IncomeSource } from '../data/incomeTypes';

export interface IncomeFormPayload {
  name: string;
  amount: number;
  frequency: string;
  nextDueDate: string;
  categoryId: string;
  accountId: string;
  notes?: string;
}

interface AddIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRecurring: (data: IncomeFormPayload) => void;
  onAddOneOff: (data: {
    description: string;
    merchant: string;
    amount: number;
    date: string;
    categoryId: string;
    accountId: string;
    notes?: string;
  }) => void;
  editSource?: IncomeSource | null;
  onEdit?: (id: string, data: IncomeFormPayload) => void;
}

const FREQUENCY_OPTIONS = [
  { value: 'semi_monthly', label: 'Semi-Monthly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'biweekly', label: 'Biweekly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annual', label: 'Annual' },
];

export default function AddIncomeModal({
  isOpen,
  onClose,
  onAddRecurring,
  onAddOneOff,
  editSource,
  onEdit,
}: AddIncomeModalProps) {
  const { data: categories = [] } = useCategories();
  const { data: accounts = [] } = useAccounts();

  const isEditMode = !!editSource;

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [frequency, setFrequency] = useState('semi_monthly');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [isRecurring, setIsRecurring] = useState(true);
  const [notes, setNotes] = useState('');

  const incomeCategories = categories.filter(c => c.type === 'income');

  useEffect(() => {
    if (editSource) {
      setName(editSource.name);
      setAmount(String(editSource.amount));
      setDate(editSource.expectedDate);
      setFrequency(editSource.frequency ?? 'semi_monthly');
      setCategoryId(editSource.categoryId ?? '');
      setAccountId(editSource.accountId ?? '');
      setIsRecurring(true);
      setNotes(editSource.notes ?? '');
    }
  }, [editSource]);

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setAmount('');
    setDate('');
    setFrequency('semi_monthly');
    setCategoryId('');
    setAccountId('');
    setIsRecurring(true);
    setNotes('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !date || !categoryId || !accountId) return;

    const parsedAmount = parseFloat(amount);

    if (isEditMode && onEdit) {
      onEdit(editSource.id, {
        name,
        amount: parsedAmount,
        frequency,
        nextDueDate: date,
        categoryId,
        accountId,
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      });
    } else if (isRecurring) {
      onAddRecurring({
        name,
        amount: parsedAmount,
        frequency,
        nextDueDate: date,
        categoryId,
        accountId,
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      });
    } else {
      onAddOneOff({
        description: name,
        merchant: name,
        amount: parsedAmount,
        date,
        categoryId,
        accountId,
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      });
    }
    resetForm();
    onClose();
  };

  const selectClass = `
    w-full px-3 py-2.5 rounded-lg appearance-none
    bg-surface-2 border border-border-dim
    text-sm text-text-primary
    focus:outline-none focus:border-accent-mint/50 focus:ring-1 focus:ring-accent-mint/20
    transition-colors cursor-pointer
  `;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md mx-4 bg-surface-1 border border-border-default rounded-2xl shadow-2xl shadow-black/10 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-dim">
          <h2 className="text-base font-semibold text-text-primary">
            {isEditMode ? 'Edit Income Source' : 'Add Income'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-3 text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">
              Source Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Paycheck, Freelance Project"
              className="w-full px-3 py-2.5 rounded-lg bg-surface-2 border border-border-dim text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-mint/50 focus:ring-1 focus:ring-accent-mint/20 transition-colors"
              required
            />
          </div>

          {/* Amount + Date */}
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
                  className="w-full pl-7 pr-3 py-2.5 rounded-lg bg-surface-2 border border-border-dim text-sm text-text-primary font-mono placeholder:text-text-muted focus:outline-none focus:border-accent-mint/50 focus:ring-1 focus:ring-accent-mint/20 transition-colors"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">
                {isRecurring ? 'Next Expected Date' : 'Date Received'}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-surface-2 border border-border-dim text-sm text-text-primary focus:outline-none focus:border-accent-mint/50 focus:ring-1 focus:ring-accent-mint/20 transition-colors [color-scheme:light]"
                required
              />
            </div>
          </div>

          {/* Frequency + Account */}
          <div className="grid grid-cols-2 gap-3">
            {isRecurring && (
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
            )}
            <div className={isRecurring ? '' : 'col-span-2'}>
              <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">
                Deposit Account
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

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={selectClass}
              required
            >
              <option value="" disabled>Select category</option>
              {incomeCategories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
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
              className="w-full px-3 py-2.5 rounded-lg resize-none bg-surface-2 border border-border-dim text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-mint/50 focus:ring-1 focus:ring-accent-mint/20 transition-colors"
            />
          </div>

          {/* Recurring toggle (hidden in edit mode) */}
          {!isEditMode && (
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="w-4 h-4 rounded border-border-default bg-surface-2 text-accent-mint focus:ring-accent-mint/30 cursor-pointer accent-accent-mint"
                />
                <span className="text-sm text-text-secondary">Recurring</span>
              </label>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full mt-2 py-2.5 rounded-lg bg-accent-mint/15 hover:bg-accent-mint/25 text-accent-mint text-sm font-semibold border border-accent-mint/20 hover:border-accent-mint/30 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isEditMode ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {isEditMode ? 'Save Changes' : isRecurring ? 'Add Income Source' : 'Add Income'}
          </button>
        </form>
      </div>
    </div>
  );
}
