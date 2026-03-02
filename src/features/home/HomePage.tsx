import { useState, useMemo } from 'react';
import { Search, AlertCircle, Inbox } from 'lucide-react';
import { useModels } from '@/hooks/useModels';
import { ModelCard } from './ModelCard';
import { SEARCH_THRESHOLD } from '@/lib/constants';
import type { Model } from '@/types';
import { Button } from '@/components/ui/Button';

interface HomePageProps {
  onOpenModel: (model: Model) => void;
}

export function HomePage({ onOpenModel }: HomePageProps) {
  const { data: models, isLoading, isError, refetch } = useModels();
  const [search, setSearch] = useState('');

  const showSearch = (models?.length ?? 0) > SEARCH_THRESHOLD;

  const filtered = useMemo(() => {
    if (!models) return [];
    if (!search.trim()) return models;
    const q = search.toLowerCase();
    return models.filter(
      (m) =>
        m.display_name.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q),
    );
  }, [models, search]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-primary-900">Modelos disponibles</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <AlertCircle className="h-10 w-10 text-red-400" />
        <p className="text-sm text-slate-600">No se pudieron cargar los modelos.</p>
        <Button variant="secondary" size="sm" onClick={() => refetch()}>
          Reintentar
        </Button>
      </div>
    );
  }

  if (!models || models.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <Inbox className="h-10 w-10 text-slate-300" />
        <p className="text-sm text-slate-500">No hay modelos disponibles aún.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-primary-900">Modelos disponibles</h2>
        {showSearch && (
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar modelo..."
              className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((model) => (
          <ModelCard key={model.id} model={model} onOpen={onOpenModel} />
        ))}
      </div>

      {filtered.length === 0 && search && (
        <p className="py-8 text-center text-sm text-slate-400">
          No se encontraron modelos para "{search}"
        </p>
      )}
    </div>
  );
}
