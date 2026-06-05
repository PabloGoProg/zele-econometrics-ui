import { X, Home } from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspaceStore';

export function TabBar() {
  const { tabs, activeTabId, setActiveTab, closeTab } = useWorkspaceStore();

  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-200/80 bg-white/60 px-2 pt-2 backdrop-blur">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        const isHome = tab.id === 'home';

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`group relative flex shrink-0 items-center gap-1.5 rounded-t-xl border px-3 py-2 text-sm font-medium transition-all ${
              isActive
                ? 'border-slate-200 bg-white text-primary-800 shadow-sm'
                : 'border-transparent text-slate-500 hover:border-slate-200 hover:bg-white/70 hover:text-slate-700'
            }`}
          >
            {isHome && <Home className="h-3.5 w-3.5" />}
            <span className="max-w-[160px] truncate">{tab.displayName}</span>
            {!isHome && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }
                }}
                className="ml-1 rounded-md p-0.5 opacity-0 transition-opacity hover:bg-slate-100 group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
