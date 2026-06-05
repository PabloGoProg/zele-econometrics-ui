import { useEffect, useState } from 'react';
import { TabBar } from './TabBar';
import { HomePage } from '@/features/home/HomePage';
import { ModelConsolePanel } from '@/features/model/ModelConsolePanel';
import { ModelPanel } from '@/features/model/ModelPanel';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useModels } from '@/hooks/useModels';

export function AppLayout() {
  const { tabs, activeTabId, openModel, removeInvalidTabs } = useWorkspaceStore();
  const { data: models } = useModels();
  const [removedNotice, setRemovedNotice] = useState<string[]>([]);

  useEffect(() => {
    if (!models) return;
    const validIds = models.map((m) => m.id);
    const removed = removeInvalidTabs(validIds);
    if (removed.length > 0) {
      const noticeTimer = setTimeout(() => setRemovedNotice(removed), 0);
      const timer = setTimeout(() => setRemovedNotice([]), 5000);
      return () => {
        clearTimeout(noticeTimer);
        clearTimeout(timer);
      };
    }
  }, [models, removeInvalidTabs]);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <TabBar />

      {removedNotice.length > 0 && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
          Los siguientes modelos ya no están disponibles y sus tabs se cerraron:{' '}
          {removedNotice.join(', ')}
        </div>
      )}

      <div className="flex-1 overflow-auto p-6">
        {activeTabId === 'home' ? (
          <HomePage onOpenModel={openModel} />
        ) : activeTabId === 'model-console' ? (
          <ModelConsolePanel />
        ) : activeTab?.modelId ? (
          <ModelPanel modelId={activeTab.modelId} />
        ) : null}
      </div>
    </div>
  );
}
