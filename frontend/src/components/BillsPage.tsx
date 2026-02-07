import { useState, useMemo } from 'react';
import { getDaysInMonth, format } from 'date-fns';
import {
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
} from 'lucide-react';
import { type Bill } from '../data/mockBills';
import { useBills, useMarkBillPaid, useCreateBill, useUpdateBill, useBillPayments } from '../hooks/useBills';
import SummaryCards from './SummaryCards';
import BillRow from './BillRow';
import AddBillModal from './AddBillModal';
import MarkPaidModal from './MarkPaidModal';
import PeriodSelector from './PeriodSelector';
import CategoryBreakdown from './CategoryBreakdown';
import UpcomingTimeline from './UpcomingTimeline';

type FilterStatus = 'all' | 'unpaid' | 'paid' | 'overdue';

/** Snap a date to the start of its half-month: day 1 (1H) or day 16 (2H). */
function snapToHalf(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() <= 15 ? 1 : 16);
}

/** Step forward one half-month period. 1H→2H same month, 2H→1H next month. */
function stepForward(date: Date): Date {
  if (date.getDate() <= 15) {
    return new Date(date.getFullYear(), date.getMonth(), 16);
  }
  // 2H → 1H of next month
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

/** Step backward one half-month period. 1H→2H prev month, 2H→1H same month. */
function stepBackward(date: Date): Date {
  if (date.getDate() > 15) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }
  // 1H → 2H of prev month
  return new Date(date.getFullYear(), date.getMonth() - 1, 16);
}

export default function BillsPage() {
  const { data: bills = [], isLoading, isError } = useBills();
  const markPaidMutation = useMarkBillPaid();
  const createBillMutation = useCreateBill();
  const updateBillMutation = useUpdateBill();
  const [currentDate, setCurrentDate] = useState(() => snapToHalf(new Date()));
  const [showAddModal, setShowAddModal] = useState(false);
  const [editBill, setEditBill] = useState<Bill | null>(null);
  const [markPaidBill, setMarkPaidBill] = useState<Bill | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [showSearch, setShowSearch] = useState(false);

  // Compute period date range for payment queries
  const periodRange = useMemo(() => {
    const is1H = currentDate.getDate() <= 15;
    const from = new Date(currentDate.getFullYear(), currentDate.getMonth(), is1H ? 1 : 16);
    const to = new Date(currentDate.getFullYear(), currentDate.getMonth(), is1H ? 15 : getDaysInMonth(currentDate));
    return { from: format(from, 'yyyy-MM-dd'), to: format(to, 'yyyy-MM-dd') };
  }, [currentDate]);

  const { data: paidBillPayments = [] } = useBillPayments(periodRange.from, periodRange.to);

  const handleMarkPaid = (bill: Bill) => {
    setMarkPaidBill(bill);
  };

  const confirmMarkPaid = (id: string, amount: number) => {
    markPaidMutation.mutate({ id, amount });
    setMarkPaidBill(null);
  };

  const handleAddBill = (newBill: {
    name: string;
    amount: number;
    frequency: string;
    nextDueDate: string;
    categoryId: string;
    accountId: string;
    isAutopay: boolean;
    notes?: string;
  }) => {
    createBillMutation.mutate(newBill);
  };

  const handleEditBill = (id: string, data: {
    name: string;
    amount: number;
    frequency: string;
    nextDueDate: string;
    categoryId: string;
    accountId: string;
    isAutopay: boolean;
    notes?: string;
  }) => {
    updateBillMutation.mutate({ id, ...data });
  };

  // Filter upcoming bills (from recurring templates) to the selected half-month period
  const periodBills = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const is1H = currentDate.getDate() <= 15;

    const rangeStart = is1H ? 1 : 16;
    const rangeEnd = is1H ? 15 : getDaysInMonth(currentDate);

    const upcoming = bills.filter((b: Bill) => {
      const d = new Date(b.dueDate + 'T00:00:00');
      return (
        d.getFullYear() === year &&
        d.getMonth() === month &&
        d.getDate() >= rangeStart &&
        d.getDate() <= rangeEnd
      );
    });

    // Merge upcoming bills with paid bill payments for this period
    return [...upcoming, ...paidBillPayments];
  }, [bills, paidBillPayments, currentDate]);

  const filtered = useMemo(() => {
    let result = periodBills;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b =>
        b.name.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q)
      );
    }

    if (filterStatus === 'unpaid') result = result.filter(b => b.status !== 'paid');
    else if (filterStatus === 'paid') result = result.filter(b => b.status === 'paid');
    else if (filterStatus === 'overdue') result = result.filter(b => b.status === 'overdue');

    return result;
  }, [periodBills, searchQuery, filterStatus]);

  const unpaidBills = useMemo(
    () => filtered
      .filter(b => b.status !== 'paid')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()),
    [filtered]
  );

  const paidBills = useMemo(
    () => filtered
      .filter(b => b.status === 'paid')
      .sort((a, b) => new Date(b.paidDate || b.dueDate).getTime() - new Date(a.paidDate || a.dueDate).getTime()),
    [filtered]
  );

  if (isLoading) return <div className="flex-1 p-6"><p className="text-text-muted text-sm">Loading...</p></div>;
  if (isError) return <div className="flex-1 p-6"><p className="text-accent-rose text-sm">Failed to load data.</p></div>;

  const filterButtons: { key: FilterStatus; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'unpaid', label: 'Unpaid' },
    { key: 'paid', label: 'Paid' },
    { key: 'overdue', label: 'Overdue' },
  ];

  return (
    <div className="min-h-screen bg-surface-0">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-surface-0/80 backdrop-blur-xl border-b border-border-dim">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent-sky-dim flex items-center justify-center">
                <LayoutGrid className="w-4 h-4 text-accent-sky" />
              </div>
              <h1 className="text-base font-semibold text-text-primary">Bills</h1>
            </div>
            <div className="flex items-center gap-2">
              <PeriodSelector
                currentDate={currentDate}
                onPrev={() => setCurrentDate(prev => stepBackward(prev))}
                onNext={() => setCurrentDate(prev => stepForward(prev))}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Summary Cards */}
        <SummaryCards bills={periodBills} />

        {/* Main content area */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          {/* Bills list */}
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {/* Filter pills */}
                <div className="flex items-center gap-1 p-1 bg-surface-1 border border-border-dim rounded-lg">
                  {filterButtons.map(fb => (
                    <button
                      key={fb.key}
                      onClick={() => setFilterStatus(fb.key)}
                      className={`
                        px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer
                        ${filterStatus === fb.key
                          ? 'bg-surface-3 text-text-primary shadow-sm'
                          : 'text-text-muted hover:text-text-secondary'
                        }
                      `}
                    >
                      {fb.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Search */}
                {showSearch ? (
                  <div className="relative animate-fade-in-up">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onBlur={() => { if (!searchQuery) setShowSearch(false); }}
                      placeholder="Search bills..."
                      autoFocus
                      className="
                        w-48 pl-9 pr-3 py-2 rounded-lg
                        bg-surface-1 border border-border-dim
                        text-sm text-text-primary placeholder:text-text-muted
                        focus:outline-none focus:border-accent-sky/40
                        transition-colors
                      "
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => setShowSearch(true)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-2 text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                )}

                {/* Add bill */}
                <button
                  onClick={() => { setEditBill(null); setShowAddModal(true); }}
                  className="
                    flex items-center gap-1.5 px-3 py-2 rounded-lg
                    bg-accent-sky/10 hover:bg-accent-sky/20
                    text-accent-sky text-xs font-semibold
                    border border-accent-sky/15 hover:border-accent-sky/25
                    transition-all duration-150 cursor-pointer
                  "
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Bill
                </button>
              </div>
            </div>

            {/* Unpaid / Due */}
            {(filterStatus === 'all' || filterStatus === 'unpaid' || filterStatus === 'overdue') && unpaidBills.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-2">
                  <List className="w-3.5 h-3.5 text-text-muted" />
                  <h2 className="text-xs font-medium text-text-muted uppercase tracking-wider">
                    Upcoming & Due ({unpaidBills.length})
                  </h2>
                </div>
                <div className="space-y-2">
                  {unpaidBills.map((bill, i) => (
                    <BillRow
                      key={bill.id}
                      bill={bill}
                      onMarkPaid={handleMarkPaid}
                      onEdit={(b) => { setEditBill(b); setShowAddModal(true); }}
                      style={{ animationDelay: `${i * 40}ms` }}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Paid */}
            {(filterStatus === 'all' || filterStatus === 'paid') && paidBills.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-2 mt-2">
                  <Filter className="w-3.5 h-3.5 text-text-muted" />
                  <h2 className="text-xs font-medium text-text-muted uppercase tracking-wider">
                    Recently Paid ({paidBills.length})
                  </h2>
                </div>
                <div className="space-y-2">
                  {paidBills.map((bill, i) => (
                    <BillRow
                      key={bill.id}
                      bill={bill}
                      onMarkPaid={handleMarkPaid}
                      style={{ animationDelay: `${i * 40}ms` }}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Empty state */}
            {unpaidBills.length === 0 && paidBills.length === 0 && (
              <div className="py-16 text-center">
                <div className="w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center mx-auto mb-3">
                  <LayoutGrid className="w-5 h-5 text-text-muted" />
                </div>
                <p className="text-sm text-text-muted">No bills match your filter</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            <UpcomingTimeline bills={periodBills} />
            <CategoryBreakdown bills={periodBills} />
          </aside>
        </div>
      </main>

      {/* Add / Edit Bill Modal */}
      <AddBillModal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setEditBill(null); }}
        onAdd={handleAddBill}
        editBill={editBill}
        onEdit={handleEditBill}
      />

      {/* Mark Paid Modal */}
      <MarkPaidModal
        bill={markPaidBill}
        onConfirm={confirmMarkPaid}
        onClose={() => setMarkPaidBill(null)}
      />
    </div>
  );
}
