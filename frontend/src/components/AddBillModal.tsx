import { useState, useEffect } from 'react';
import { X, Plus, Save } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import { useAccounts } from '../hooks/useAccounts';
import type { Bill } from '../data/mockBills';

export interface BillPayload {
  name: string;
  amount: number;
  frequency: string;
  nextDueDate: string;
  categoryId: string;
  accountId: string;
  isAutopay: boolean;
  notes?: string;
}

interface AddBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (bill: BillPayload) => void;
  editBill?: Bill | null;
  onEdit?: (id: string, bill: BillPayload) => void;
}

const FREQUENCY_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'semi_monthly', label: 'Semi-Monthly' },
  { value: 'biweekly', label: 'Biweekly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annual', label: 'Annual' },
  { value: 'one_time', label: 'One-Time' },
];

export default function AddBillModal({ isOpen, onClose, onAdd, editBill, onEdit }: AddBillModalProps) {
  const { data: categories = [] } = useCategories();
  const { data: accounts = [] } = useAccounts();

  const isEditMode = !!editBill;

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [isRecurring, setIsRecurring] = useState(true);
  const [isAutopay, setIsAutopay] = useState(false);
  const [notes, setNotes] = useState('');

  const expenseCategories = categories.filter(c => c.type === 'expense');

  // Pre-fill form when editing
  useEffect(() => {
    if (editBill) {
      setName(editBill.name);
      setAmount(String(editBill.amount));
      setDueDate(editBill.dueDate);
      setFrequency(editBill.frequency ?? 'monthly');
      setCategoryId(editBill.categoryId ?? '');
      setAccountId(editBill.accountId ?? '');
      setIsRecurring(editBill.frequency !== 'one_time');
      setIsAutopay(editBill.autopay);
      setNotes(editBill.notes ?? '');
    }
  }, [editBill]);

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setAmount('');
    setDueDate('');
    setFrequency('monthly');
    setCategoryId('');
    setAccountId('');
    setIsRecurring(true);
    setIsAutopay(false);
    setNotes('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !dueDate || !categoryId || !accountId) return;
    const payload: BillPayload = {
      name,
      amount: parseFloat(amount),
      frequency: isRecurring ? frequency : 'one_time',
      nextDueDate: dueDate,
      categoryId,
      accountId,
      isAutopay,
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    };
    if (isEditMode && onEdit) {
      onEdit(editBill.id, payload);
    } else {
      onAdd(payload);
    }
    resetForm();
    onClose();
  };

  const selectClass = `
    w-full px-3 py-2.5 rounded-lg appearance-none
    bg-surface-2 border border-border-dim
    text-sm text-text-primary
    focus:outline-none focus:border-accent-sky/50 focus:ring-1 focus:ring-accent-sky/20
    transition-colors cursor-pointer
  `;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="
        relative z-10 w-full max-w-md mx-4
        bg-surface-1 border border-border-default rounded-2xl
        shadow-2xl shadow-black/10
        animate-fade-in-up
      ">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-dim">
          <h2 className="text-base font-semibold text-text-primary">{isEditMode ? 'Edit Bill' : 'Add New Bill'}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-3 text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Row 1: Bill Name */}
          <div>
            <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">
              Bill Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Electric Bill"
              className="
                w-full px-3 py-2.5 rounded-lg
                bg-surface-2 border border-border-dim
                text-sm text-text-primary placeholder:text-text-muted
                focus:outline-none focus:border-accent-sky/50 focus:ring-1 focus:ring-accent-sky/20
                transition-colors
              "
              required
            />
          </div>

          {/* Row 2: Amount + Due Date */}
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
                    focus:outline-none focus:border-accent-sky/50 focus:ring-1 focus:ring-accent-sky/20
                    transition-colors
                  "
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="
                  w-full px-3 py-2.5 rounded-lg
                  bg-surface-2 border border-border-dim
                  text-sm text-text-primary
                  focus:outline-none focus:border-accent-sky/50 focus:ring-1 focus:ring-accent-sky/20
                  transition-colors
                  [color-scheme:light]
                "
                required
              />
            </div>
          </div>

          {/* Row 3: Frequency + Account */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">
                Frequency
              </label>
              <select
                value={isRecurring ? frequency : 'one_time'}
                onChange={(e) => {
                  if (e.target.value === 'one_time') {
                    setIsRecurring(false);
                    setFrequency('one_time');
                  } else {
                    setIsRecurring(true);
                    setFrequency(e.target.value);
                  }
                }}
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

          {/* Row 4: Category */}
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
              {expenseCategories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Row 5: Notes */}
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
                focus:outline-none focus:border-accent-sky/50 focus:ring-1 focus:ring-accent-sky/20
                transition-colors
              "
            />
          </div>

          {/* Row 6: Recurring + Autopay toggles */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => {
                  setIsRecurring(e.target.checked);
                  if (!e.target.checked) setFrequency('one_time');
                  else setFrequency('monthly');
                }}
                className="
                  w-4 h-4 rounded border-border-default bg-surface-2
                  text-accent-sky focus:ring-accent-sky/30
                  cursor-pointer accent-accent-sky
                "
              />
              <span className="text-sm text-text-secondary">Recurring</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAutopay}
                onChange={(e) => setIsAutopay(e.target.checked)}
                className="
                  w-4 h-4 rounded border-border-default bg-surface-2
                  text-accent-sky focus:ring-accent-sky/30
                  cursor-pointer accent-accent-sky
                "
              />
              <span className="text-sm text-text-secondary">Autopay</span>
            </label>
          </div>

          {/* Row 7: Submit */}
          <button
            type="submit"
            className="
              w-full mt-2 py-2.5 rounded-lg
              bg-accent-sky/15 hover:bg-accent-sky/25
              text-accent-sky text-sm font-semibold
              border border-accent-sky/20 hover:border-accent-sky/30
              transition-all duration-150
              flex items-center justify-center gap-2
              cursor-pointer
            "
          >
            {isEditMode ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {isEditMode ? 'Save Changes' : 'Add Bill'}
          </button>
        </form>
      </div>
    </div>
  );
}
