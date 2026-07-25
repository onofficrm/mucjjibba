import { Search } from 'lucide-react';

export function SearchInput({ value, onChange, placeholder = '검색...', className = '' }: { value: string, onChange: (val: string) => void, placeholder?: string, className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-arena-text-muted" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-arena-card border border-white/10 focus:border-arena-gold/50 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-arena-text-muted outline-none transition-colors"
      />
    </div>
  );
}

export function TabMenu({ tabs, activeTab, onChange, className = '' }: { tabs: { id: string, label: string }[], activeTab: string, onChange: (id: string) => void, className?: string }) {
  return (
    <div className={`flex p-1 bg-arena-card border border-white/5 rounded-xl ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
            activeTab === tab.id
              ? 'bg-white/10 text-white shadow-sm'
              : 'text-arena-text-muted hover:text-white hover:bg-white/5'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
