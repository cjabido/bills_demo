import { useState } from 'react';
import {
  Settings,
  User,
  Palette,
  Bell,
  Tag,
  Download,
  Link2,
  X,
  Plus,
  Trash2,
  Pencil,
  Check,
  Sun,
  Moon,
  Monitor,
  AlertTriangle,
  FileJson,
  FileSpreadsheet,
  Lock,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../hooks/useCategories';
import type { Category } from '../hooks/useCategories';
import { getIconComponent, CURATED_ICONS } from '../lib/categoryIcons';
import { api } from '../lib/api';
import { useQueryClient } from '@tanstack/react-query';

// --- Types ---

type Theme = 'light' | 'dark' | 'system';
type Density = 'comfortable' | 'compact';
type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY';

interface SettingsState {
  profile: {
    name: string;
    email: string;
    currency: Currency;
  };
  appearance: {
    theme: Theme;
    density: Density;
  };
  notifications: {
    billReminderDays: number;
    overdueAlerts: boolean;
    syncFailureAlerts: boolean;
  };
}

// --- Constants ---

const CURRENCY_OPTIONS: { key: Currency; label: string; symbol: string }[] = [
  { key: 'USD', label: 'US Dollar', symbol: '$' },
  { key: 'EUR', label: 'Euro', symbol: '€' },
  { key: 'GBP', label: 'British Pound', symbol: '£' },
  { key: 'CAD', label: 'Canadian Dollar', symbol: 'C$' },
  { key: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
  { key: 'JPY', label: 'Japanese Yen', symbol: '¥' },
];

const THEME_OPTIONS: { key: Theme; label: string; icon: React.ElementType }[] = [
  { key: 'light', label: 'Light', icon: Sun },
  { key: 'dark', label: 'Dark', icon: Moon },
  { key: 'system', label: 'System', icon: Monitor },
];

const AVAILABLE_COLORS = [
  '#10b981', '#f59e0b', '#0284c7', '#7c3aed', '#e84393', '#8a8aa0',
];

const COLOR_LABELS: Record<string, string> = {
  '#10b981': 'Green',
  '#f59e0b': 'Amber',
  '#0284c7': 'Blue',
  '#7c3aed': 'Violet',
  '#e84393': 'Rose',
  '#8a8aa0': 'Gray',
};

// --- Toggle Switch ---

function ToggleSwitch({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`w-10 h-6 rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${
        enabled ? 'bg-accent-mint' : 'bg-surface-4'
      }`}
    >
      <div
        className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          enabled ? 'translate-x-[18px]' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

// --- Icon Picker ---

function IconPicker({ selected, onSelect }: { selected: string; onSelect: (name: string) => void }) {
  return (
    <div className="grid grid-cols-6 gap-1.5 max-h-40 overflow-y-auto p-2 bg-surface-2 rounded-lg">
      {CURATED_ICONS.map(({ name, icon: IconComp }) => (
        <button
          key={name}
          onClick={() => onSelect(name)}
          title={name}
          className={`w-8 h-8 rounded-md flex items-center justify-center transition-all duration-150 cursor-pointer
            ${selected === name
              ? 'bg-accent-sky/15 text-accent-sky ring-1 ring-accent-sky/30 scale-110'
              : 'text-text-muted hover:text-text-secondary hover:bg-surface-3'
            }`}
        >
          <IconComp className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
}

// --- Section Nav ---

type Section = 'profile' | 'appearance' | 'notifications' | 'categories' | 'banks' | 'data';

const SECTIONS: { key: Section; label: string; icon: React.ElementType }[] = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'appearance', label: 'Appearance', icon: Palette },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'categories', label: 'Categories', icon: Tag },
  { key: 'banks', label: 'Bank Connections', icon: Link2 },
  { key: 'data', label: 'Data & Export', icon: Download },
];

// --- Category List Component ---

function CategoryList({ title, categories, onEdit, onDelete, onAdd }: {
  title: string;
  categories: Category[];
  onEdit: (id: string, data: { name?: string; color?: string; icon?: string }) => void;
  onDelete: (id: string) => void;
  onAdd: (data: { name: string; type: 'income' | 'expense'; color: string; icon: string }) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editIcon, setEditIcon] = useState('');
  const [showIconPicker, setShowIconPicker] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#10b981');
  const [newIcon, setNewIcon] = useState('Tag');
  const [showNewIconPicker, setShowNewIconPicker] = useState(false);

  const categoryType = categories[0]?.type ?? 'expense';

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color);
    setEditIcon(cat.icon);
    setShowIconPicker(false);
  };

  const saveEdit = (cat: Category) => {
    if (!editingId) return;
    const updates: { name?: string; color?: string; icon?: string } = {};
    if (!cat.isDefault && editName.trim() && editName.trim() !== cat.name) updates.name = editName.trim();
    if (editColor !== cat.color) updates.color = editColor;
    if (editIcon !== cat.icon) updates.icon = editIcon;
    if (Object.keys(updates).length > 0) onEdit(editingId, updates);
    setEditingId(null);
    setShowIconPicker(false);
  };

  const handleAdd = () => {
    if (newName.trim()) {
      onAdd({ name: newName.trim(), type: categoryType, color: newColor, icon: newIcon });
      setNewName('');
      setNewColor('#10b981');
      setNewIcon('Tag');
      setShowAdd(false);
      setShowNewIconPicker(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-text-muted uppercase tracking-wider">{title}</span>
        <button
          onClick={() => { setShowAdd(!showAdd); setShowNewIconPicker(false); }}
          className="flex items-center gap-1 text-[11px] font-semibold text-accent-sky hover:text-accent-sky/80 transition-colors cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          Add
        </button>
      </div>

      {/* Add new row */}
      {showAdd && (
        <div className="mb-3 p-3 bg-surface-2/50 rounded-lg border border-border-dim space-y-2 animate-fade-in-up">
          <div className="flex items-center gap-2">
            {/* Icon preview button */}
            <button
              onClick={() => setShowNewIconPicker(!showNewIconPicker)}
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-border-dim hover:bg-surface-3 transition-colors cursor-pointer"
              style={{ color: newColor }}
              title="Pick icon"
            >
              {(() => { const I = getIconComponent(newIcon); return <I className="w-4 h-4" />; })()}
            </button>
            {/* Color dots */}
            <div className="flex items-center gap-1">
              {AVAILABLE_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  className={`w-5 h-5 rounded-full cursor-pointer transition-all duration-150 ${
                    newColor === c ? 'ring-2 ring-offset-1 ring-current scale-110' : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                  title={COLOR_LABELS[c] ?? c}
                />
              ))}
            </div>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Category name"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              className="flex-1 px-3 py-1.5 rounded-lg bg-surface-2 border border-border-dim text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-sky/50 transition-colors"
            />
            <button onClick={handleAdd} className="w-7 h-7 rounded-lg flex items-center justify-center bg-accent-sky/10 text-accent-sky hover:bg-accent-sky/20 transition-colors cursor-pointer">
              <Check className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => { setShowAdd(false); setShowNewIconPicker(false); }} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-surface-3 text-text-muted transition-colors cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          {showNewIconPicker && (
            <IconPicker selected={newIcon} onSelect={setNewIcon} />
          )}
        </div>
      )}

      {/* Category items */}
      <div className="space-y-1">
        {categories.map(cat => {
          const CatIcon = getIconComponent(cat.icon);
          const isEditing = editingId === cat.id;

          return (
            <div key={cat.id}>
              <div className="group/cat flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-2/60 transition-colors">
                {isEditing ? (
                  <>
                    {/* Icon preview button */}
                    <button
                      onClick={() => setShowIconPicker(!showIconPicker)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-border-dim hover:bg-surface-3 transition-colors cursor-pointer"
                      style={{ color: editColor }}
                      title="Pick icon"
                    >
                      {(() => { const I = getIconComponent(editIcon); return <I className="w-4 h-4" />; })()}
                    </button>
                    {/* Color dots */}
                    <div className="flex items-center gap-1">
                      {AVAILABLE_COLORS.map(c => (
                        <button
                          key={c}
                          onClick={() => setEditColor(c)}
                          className={`w-4 h-4 rounded-full cursor-pointer transition-all duration-150 ${
                            editColor === c ? 'ring-2 ring-offset-1 ring-current scale-110' : 'opacity-50 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    {cat.isDefault ? (
                      <span className="flex-1 text-sm text-text-primary flex items-center gap-1.5">
                        <Lock className="w-3 h-3 text-text-muted" />
                        {cat.name}
                      </span>
                    ) : (
                      <input
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && saveEdit(cat)}
                        autoFocus
                        className="flex-1 px-2 py-1 rounded-md bg-surface-2 border border-border-dim text-sm text-text-primary focus:outline-none focus:border-accent-sky/50 transition-colors"
                      />
                    )}
                    <button onClick={() => saveEdit(cat)} className="w-6 h-6 rounded-md flex items-center justify-center bg-accent-sky/10 text-accent-sky hover:bg-accent-sky/20 transition-colors cursor-pointer">
                      <Check className="w-3 h-3" />
                    </button>
                    <button onClick={() => { setEditingId(null); setShowIconPicker(false); }} className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-surface-3 text-text-muted transition-colors cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <>
                    {/* Icon + color dot */}
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                      style={{ backgroundColor: cat.color + '1a' }}
                    >
                      <CatIcon className="w-3.5 h-3.5" style={{ color: cat.color }} />
                    </div>
                    <span className="flex-1 text-sm text-text-primary">{cat.name}</span>
                    {cat.isDefault && (
                      <span className="text-[10px] font-medium text-text-muted bg-surface-3 px-1.5 py-0.5 rounded">Default</span>
                    )}
                    <div className="flex items-center gap-1 opacity-0 group-hover/cat:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(cat)}
                        className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-surface-3 text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      {!cat.isDefault && (
                        <button
                          onClick={() => onDelete(cat.id)}
                          className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-accent-rose-dim text-text-muted hover:text-accent-rose transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
              {/* Icon picker dropdown when editing */}
              {isEditing && showIconPicker && (
                <div className="mx-3 mt-1 mb-2 animate-fade-in-up">
                  <IconPicker selected={editIcon} onSelect={setEditIcon} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- Main Page ---

export default function SettingsPage({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [activeSection, setActiveSection] = useState<Section>('profile');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Settings state
  const [settings, setSettings] = useState<SettingsState>({
    profile: {
      name: '',
      email: '',
      currency: 'USD',
    },
    appearance: {
      theme: 'light',
      density: 'comfortable',
    },
    notifications: {
      billReminderDays: 3,
      overdueAlerts: true,
      syncFailureAlerts: true,
    },
  });

  // Category hooks
  const { data: categories, isLoading: categoriesLoading, isError: categoriesError } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const expenseCategories = (categories ?? []).filter(c => c.type === 'expense');
  const incomeCategories = (categories ?? []).filter(c => c.type === 'income');

  // --- Profile handlers ---
  const updateProfile = <K extends keyof SettingsState['profile']>(key: K, value: SettingsState['profile'][K]) => {
    setSettings(prev => ({ ...prev, profile: { ...prev.profile, [key]: value } }));
  };

  // --- Appearance handlers ---
  const updateAppearance = <K extends keyof SettingsState['appearance']>(key: K, value: SettingsState['appearance'][K]) => {
    setSettings(prev => ({ ...prev, appearance: { ...prev.appearance, [key]: value } }));
  };

  // --- Notification handlers ---
  const updateNotifications = <K extends keyof SettingsState['notifications']>(key: K, value: SettingsState['notifications'][K]) => {
    setSettings(prev => ({ ...prev, notifications: { ...prev.notifications, [key]: value } }));
  };

  // --- Category handlers ---
  const handleEditCategory = (id: string, data: { name?: string; color?: string; icon?: string }) => {
    updateCategory.mutate({ id, ...data });
  };

  const handleDeleteCategory = (id: string) => {
    deleteCategory.mutate(id);
  };

  const handleAddCategory = (data: { name: string; type: 'income' | 'expense'; color: string; icon: string }) => {
    createCategory.mutate(data);
  };

  // --- Export handlers (mock) ---
  const handleExportCSV = () => {
    const blob = new Blob(['Mock CSV export data'], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'finance-tracker-export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const data = { settings, categories };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'finance-tracker-export.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setSettings({
      profile: { name: '', email: '', currency: 'USD' },
      appearance: { theme: 'light', density: 'comfortable' },
      notifications: { billReminderDays: 3, overdueAlerts: true, syncFailureAlerts: true },
    });
    setShowResetConfirm(false);
  };

  // Demo reset
  const qc = useQueryClient();
  const [demoResetting, setDemoResetting] = useState(false);
  const [demoResetMsg, setDemoResetMsg] = useState('');

  const handleDemoReset = async () => {
    setDemoResetting(true);
    setDemoResetMsg('');
    try {
      const res = await api.post<{ data: { message: string } }>('/api/demo/reset');
      setDemoResetMsg(res.data.message);
      qc.invalidateQueries();
    } catch (err) {
      setDemoResetMsg(err instanceof Error ? err.message : 'Reset failed.');
    } finally {
      setDemoResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-0">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-surface-0/80 backdrop-blur-xl border-b border-border-dim">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-3 flex items-center justify-center">
                <Settings className="w-4 h-4 text-text-secondary" />
              </div>
              <h1 className="text-base font-semibold text-text-primary">Settings</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6">

          {/* Section nav sidebar */}
          <nav className="animate-fade-in-up">
            <div className="lg:sticky lg:top-20 space-y-1">
              {SECTIONS.map(s => {
                const Icon = s.icon;
                const isBanks = s.key === 'banks';
                return (
                  <button
                    key={s.key}
                    onClick={() => isBanks && onNavigate ? onNavigate('banks') : setActiveSection(s.key)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 cursor-pointer text-left
                      ${activeSection === s.key && !isBanks
                        ? 'bg-surface-1 text-text-primary font-medium shadow-sm border border-border-dim'
                        : 'text-text-muted hover:text-text-secondary hover:bg-surface-2/60'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    {s.label}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Content area */}
          <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '60ms' }}>

            {/* Profile */}
            {activeSection === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">Profile</h2>
                  <p className="text-sm text-text-muted mt-1">Your personal information and preferences.</p>
                </div>

                <div className="bg-surface-1 border border-border-dim rounded-xl p-6 space-y-5">
                  <div>
                    <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">Name</label>
                    <input
                      type="text"
                      value={settings.profile.name}
                      onChange={e => updateProfile('name', e.target.value)}
                      placeholder="Your name"
                      className="w-full max-w-md px-3 py-2.5 rounded-lg bg-surface-2 border border-border-dim text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-sky/50 focus:ring-1 focus:ring-accent-sky/20 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">Email</label>
                    <input
                      type="email"
                      value={settings.profile.email}
                      onChange={e => updateProfile('email', e.target.value)}
                      placeholder="you@example.com"
                      className="w-full max-w-md px-3 py-2.5 rounded-lg bg-surface-2 border border-border-dim text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-sky/50 focus:ring-1 focus:ring-accent-sky/20 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">Currency</label>
                    <div className="flex flex-wrap gap-2">
                      {CURRENCY_OPTIONS.map(opt => (
                        <button
                          key={opt.key}
                          onClick={() => updateProfile('currency', opt.key)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer
                            ${settings.profile.currency === opt.key
                              ? 'bg-accent-sky-dim text-accent-sky ring-1 ring-accent-sky/20'
                              : 'bg-surface-2 text-text-muted hover:text-text-secondary hover:bg-surface-3'
                            }`}
                        >
                          <span className="font-mono mr-1">{opt.symbol}</span>
                          {opt.key}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance */}
            {activeSection === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">Appearance</h2>
                  <p className="text-sm text-text-muted mt-1">Customize how the app looks.</p>
                </div>

                <div className="bg-surface-1 border border-border-dim rounded-xl p-6 space-y-6">
                  {/* Theme */}
                  <div>
                    <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-3">Theme</label>
                    <div className="grid grid-cols-3 gap-3 max-w-md">
                      {THEME_OPTIONS.map(opt => {
                        const Icon = opt.icon;
                        const selected = settings.appearance.theme === opt.key;
                        return (
                          <button
                            key={opt.key}
                            onClick={() => updateAppearance('theme', opt.key)}
                            className={`flex flex-col items-center gap-2 px-4 py-4 rounded-xl border transition-all duration-200 cursor-pointer
                              ${selected
                                ? 'bg-accent-sky-dim border-accent-sky/30 text-accent-sky'
                                : 'bg-surface-2/50 border-border-dim text-text-muted hover:text-text-secondary hover:border-border-default'
                              }`}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="text-xs font-medium">{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Density */}
                  <div>
                    <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-3">Display Density</label>
                    <div className="flex items-center gap-1 p-1 bg-surface-2 border border-border-dim rounded-lg max-w-xs">
                      {(['comfortable', 'compact'] as Density[]).map(d => (
                        <button
                          key={d}
                          onClick={() => updateAppearance('density', d)}
                          className={`flex-1 px-4 py-2 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer capitalize
                            ${settings.appearance.density === d
                              ? 'bg-surface-1 text-text-primary shadow-sm'
                              : 'text-text-muted hover:text-text-secondary'
                            }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-text-muted mt-2">
                      {settings.appearance.density === 'comfortable'
                        ? 'More spacing between elements for easier reading.'
                        : 'Tighter spacing to fit more content on screen.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">Notifications</h2>
                  <p className="text-sm text-text-muted mt-1">Configure alerts and reminders.</p>
                </div>

                <div className="bg-surface-1 border border-border-dim rounded-xl divide-y divide-border-dim">
                  {/* Bill reminder days */}
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-text-primary">Bill reminders</span>
                        <p className="text-xs text-text-muted mt-0.5">Get reminded before bills are due</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateNotifications('billReminderDays', Math.max(1, settings.notifications.billReminderDays - 1))}
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-surface-2 text-text-muted hover:text-text-secondary hover:bg-surface-3 transition-colors cursor-pointer text-sm font-semibold"
                        >
                          −
                        </button>
                        <span className="w-16 text-center text-sm font-mono font-semibold text-text-primary tabular-nums">
                          {settings.notifications.billReminderDays} day{settings.notifications.billReminderDays !== 1 ? 's' : ''}
                        </span>
                        <button
                          onClick={() => updateNotifications('billReminderDays', Math.min(14, settings.notifications.billReminderDays + 1))}
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-surface-2 text-text-muted hover:text-text-secondary hover:bg-surface-3 transition-colors cursor-pointer text-sm font-semibold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Overdue alerts */}
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-text-primary">Overdue alerts</span>
                        <p className="text-xs text-text-muted mt-0.5">Alert when a bill passes its due date unpaid</p>
                      </div>
                      <ToggleSwitch
                        enabled={settings.notifications.overdueAlerts}
                        onChange={() => updateNotifications('overdueAlerts', !settings.notifications.overdueAlerts)}
                      />
                    </div>
                  </div>

                  {/* Sync failure alerts */}
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-text-primary">Sync failure alerts</span>
                        <p className="text-xs text-text-muted mt-0.5">Alert when a bank connection fails to sync</p>
                      </div>
                      <ToggleSwitch
                        enabled={settings.notifications.syncFailureAlerts}
                        onChange={() => updateNotifications('syncFailureAlerts', !settings.notifications.syncFailureAlerts)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Categories */}
            {activeSection === 'categories' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">Categories</h2>
                  <p className="text-sm text-text-muted mt-1">Manage transaction categories. Default categories can have their icon and color changed.</p>
                </div>

                {categoriesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-5 h-5 text-text-muted animate-spin" />
                    <span className="ml-2 text-sm text-text-muted">Loading categories...</span>
                  </div>
                ) : categoriesError ? (
                  <div className="bg-accent-rose-dim border border-accent-rose/20 rounded-xl p-6 text-center">
                    <p className="text-sm text-accent-rose">Failed to load categories. Please try refreshing.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-surface-1 border border-border-dim rounded-xl p-5">
                      <CategoryList
                        title="Expense Categories"
                        categories={expenseCategories}
                        onEdit={handleEditCategory}
                        onDelete={handleDeleteCategory}
                        onAdd={handleAddCategory}
                      />
                    </div>

                    <div className="bg-surface-1 border border-border-dim rounded-xl p-5">
                      <CategoryList
                        title="Income Categories"
                        categories={incomeCategories}
                        onEdit={handleEditCategory}
                        onDelete={handleDeleteCategory}
                        onAdd={handleAddCategory}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Data & Export */}
            {activeSection === 'data' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">Data & Export</h2>
                  <p className="text-sm text-text-muted mt-1">Export your data or reset the application.</p>
                </div>

                {/* Export */}
                <div className="bg-surface-1 border border-border-dim rounded-xl p-6">
                  <span className="text-xs font-medium text-text-muted uppercase tracking-wider block mb-4">Export</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={handleExportCSV}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-border-dim hover:border-border-default hover:bg-surface-2/40 transition-all duration-200 cursor-pointer text-left"
                    >
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent-mint-dim shrink-0">
                        <FileSpreadsheet className="w-5 h-5 text-accent-mint" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-text-primary block">Export as CSV</span>
                        <span className="text-xs text-text-muted">Spreadsheet-compatible format</span>
                      </div>
                    </button>

                    <button
                      onClick={handleExportJSON}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-border-dim hover:border-border-default hover:bg-surface-2/40 transition-all duration-200 cursor-pointer text-left"
                    >
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent-sky-dim shrink-0">
                        <FileJson className="w-5 h-5 text-accent-sky" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-text-primary block">Export as JSON</span>
                        <span className="text-xs text-text-muted">Full data backup format</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Demo Reset */}
                <div className="bg-surface-1 border border-accent-amber/20 rounded-xl p-6">
                  <span className="text-xs font-medium text-text-muted uppercase tracking-wider block mb-2">Demo</span>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-text-primary">Reset Demo Data</span>
                      <p className="text-xs text-text-muted mt-0.5">Restore all data to the original sample dataset.</p>
                      {demoResetMsg && (
                        <p className="text-xs text-accent-mint mt-1.5">{demoResetMsg}</p>
                      )}
                    </div>
                    <button
                      onClick={handleDemoReset}
                      disabled={demoResetting}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent-amber/10 hover:bg-accent-amber/20 text-accent-amber text-xs font-semibold border border-accent-amber/15 hover:border-accent-amber/25 transition-all duration-150 cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      {demoResetting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <RotateCcw className="w-3.5 h-3.5" />
                      )}
                      {demoResetting ? 'Resetting...' : 'Reset Demo'}
                    </button>
                  </div>
                </div>

                {/* Reset */}
                <div className="bg-surface-1 border border-accent-rose/20 rounded-xl p-6">
                  <span className="text-xs font-medium text-text-muted uppercase tracking-wider block mb-2">Danger Zone</span>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-text-primary">Reset all data</span>
                      <p className="text-xs text-text-muted mt-0.5">Clear all settings and return to defaults. This cannot be undone.</p>
                    </div>
                    <button
                      onClick={() => setShowResetConfirm(true)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent-rose/10 hover:bg-accent-rose/20 text-accent-rose text-xs font-semibold border border-accent-rose/15 hover:border-accent-rose/25 transition-all duration-150 cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Reset confirmation modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowResetConfirm(false)} />
          <div className="relative z-10 w-full max-w-sm mx-4 bg-surface-1 border border-border-default rounded-2xl shadow-2xl shadow-black/10 animate-fade-in-up">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-accent-rose-dim flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6 text-accent-rose" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-text-primary">Reset all data?</h3>
                <p className="text-sm text-text-muted mt-1">
                  This will clear all your settings and preferences. This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2.5 rounded-lg bg-surface-2 hover:bg-surface-3 text-sm font-medium text-text-secondary transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 py-2.5 rounded-lg bg-accent-rose/15 hover:bg-accent-rose/25 text-accent-rose text-sm font-semibold border border-accent-rose/20 transition-all duration-150 cursor-pointer"
                >
                  Reset Everything
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
