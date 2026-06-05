import { useState, useMemo } from 'react';
import { Search, AlertCircle, Inbox, Boxes, ArrowRight } from 'lucide-react';
import { useModels } from '@/hooks/useModels';
import { ModelCard } from './ModelCard';
import { SEARCH_THRESHOLD } from '@/lib/constants';
import type { Model } from '@/types';
import { Button } from '@/components/ui/Button';
import { useWorkspaceStore } from '@/stores/workspaceStore';

interface HomePageProps {
  onOpenModel: (model: Model) => void;
}

export function HomePage({ onOpenModel }: HomePageProps) {
  const { data: models, isLoading, isError, refetch } = useModels();
  const openModelConsole = useWorkspaceStore((s) => s.openModelConsole);
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
        <div className="h-32 animate-pulse rounded-3xl border border-slate-200 bg-white/70" />
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
      <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-3 rounded-3xl border border-red-100 bg-white/80 px-6 py-16 text-center shadow-sm">
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
      <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-slate-300 bg-white/70 px-6 py-16 text-center">
        <Inbox className="h-10 w-10 text-slate-300" />
        <p className="text-sm text-slate-500">No hay modelos disponibles aún.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="rounded-3xl border border-white/80 bg-white/80 p-5 shadow-sm shadow-slate-900/5 backdrop-blur md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">Workspace</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-primary-950 md:text-3xl">
              Modelos disponibles
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Ejecuta predicciones econométricas, compara resultados y conserva el contexto de trabajo en pestañas.
            </p>
          </div>
          <div className="rounded-2xl border border-primary-100 bg-primary-50 px-4 py-3 text-primary-800">
            <p className="text-2xl font-bold tabular-nums">{models.length}</p>
            <p className="text-xs font-medium uppercase tracking-wide">modelos activos</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-base font-semibold text-slate-700">Catálogo</h2>
        {showSearch && (
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar modelo..."
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm shadow-sm placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
            />
          </div>
        )}
      </div>

      <button
        onClick={openModelConsole}
        className="group relative flex w-full overflow-hidden rounded-3xl border border-primary-300 bg-gradient-to-br from-primary-950 via-primary-800 to-primary-700 p-5 text-left text-white shadow-xl shadow-primary-950/15 transition-all hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-primary-950/20 sm:flex-row sm:items-center sm:justify-between md:p-6"
      >
        <div className="absolute -right-20 -top-24 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
            <Boxes className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary-100">
              Opción principal
            </p>
            <h3 className="mt-1 text-xl font-semibold">Consola de Modelos</h3>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-primary-50/90">
              Ejecuta los tres modelos en una sola vista. Primero predice crecimiento económico y usa ese resultado como insumo automático para desempleo y tejido empresarial.
            </p>
          </div>
        </div>
        <span className="relative mt-4 inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary-800 shadow-sm transition-colors group-hover:bg-primary-50 sm:mt-0">
          Abrir consola
          <ArrowRight className="h-4 w-4" />
        </span>
      </button>

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
