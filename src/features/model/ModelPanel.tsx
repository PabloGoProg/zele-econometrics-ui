import { useEffect, useMemo } from 'react';
import { RotateCcw, Undo2, AlertCircle } from 'lucide-react';
import { useModelSchema } from '@/hooks/useModelSchema';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { InputControl } from './InputControl';
import { PredictButton } from './PredictButton';
import { ResultsPanel } from './ResultsPanel';
import { PredictionHistory } from './PredictionHistory';
import { Button } from '@/components/ui/Button';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { formatPredictionValue } from '@/lib/modelFormatting';

interface ModelPanelProps {
  modelId: number;
}

export function ModelPanel({ modelId }: ModelPanelProps) {
  const { data: schema, isLoading, isError, refetch } = useModelSchema(modelId);
  const {
    tabStates,
    initTabState,
    updateInput,
    updateCustomLimits,
    resetTab,
    undo,
    canUndo,
    pushSnapshot,
  } = useWorkspaceStore();

  const tabId = `model-${modelId}`;
  const tabState = tabStates[tabId];

  const defaults = useMemo(() => {
    if (!schema) return {};
    const d: Record<string, number> = {};
    for (const v of schema.variables) d[v.name] = v.default_value;
    return d;
  }, [schema]);

  const defaultLimits = useMemo(() => {
    if (!schema) return {};
    const l: Record<string, { min: number; max: number }> = {};
    for (const v of schema.variables) l[v.name] = { min: v.min, max: v.max };
    return l;
  }, [schema]);

  const variablesByName = useMemo(() => {
    if (!schema) return {};
    return Object.fromEntries(schema.variables.map((v) => [v.name, v]));
  }, [schema]);

  useEffect(() => {
    if (!schema) return;
    initTabState(modelId, defaults, defaultLimits);
  }, [schema, modelId, defaults, defaultLimits, initTabState]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-lg border border-slate-200 bg-slate-100" />
        ))}
      </div>
    );
  }

  if (isError || !schema) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <AlertCircle className="h-10 w-10 text-red-400" />
        <p className="text-sm text-slate-600">
          No se pudo cargar la configuración del modelo.
        </p>
        <Button variant="secondary" size="sm" onClick={() => refetch()}>
          Reintentar
        </Button>
      </div>
    );
  }

  if (!tabState) return null;

  const handleBeforeChange = () => pushSnapshot(modelId);

  return (
    <TooltipProvider>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Model header */}
        <div className="rounded-3xl border border-white/80 bg-white/85 p-5 shadow-sm shadow-slate-900/5 backdrop-blur md:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">
            {schema.name}
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-primary-950 md:text-3xl">
            {schema.display_name}
          </h2>
          <p className="mt-3 max-w-4xl text-sm leading-relaxed text-slate-600">{schema.description}</p>
          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="rounded-full border border-primary-100 bg-primary-50 px-3 py-1.5 text-primary-700">
              Objetivo: <strong>{schema.target_variable}</strong>
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">
              Resultado en pantalla: <strong>{formatPredictionValue(0.03, schema.target_variable)} aprox.</strong>
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">R²: <strong>{schema.r_squared}</strong></span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">Versión: {schema.version}</span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">Entrenado: {schema.trained_at}</span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
          {/* Input panel */}
          <div className="space-y-4">
            <div className="flex flex-col gap-3 rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm shadow-slate-900/5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Variables de entrada</h3>
                <p className="mt-1 text-xs text-slate-500">Ajusta valores, rangos y ejecuta una predicción.</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!canUndo(modelId)}
                  onClick={() => undo(modelId)}
                  className="gap-1"
                >
                  <Undo2 className="h-3.5 w-3.5" />
                  Deshacer
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    pushSnapshot(modelId);
                    resetTab(modelId, defaults, defaultLimits);
                  }}
                  className="gap-1"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Resetear
                </Button>
              </div>
            </div>

            {schema.variables.map((variable) => (
              <InputControl
                key={variable.name}
                variable={variable}
                value={tabState.inputs[variable.name] ?? variable.default_value}
                customMin={tabState.customLimits[variable.name]?.min ?? variable.min}
                customMax={tabState.customLimits[variable.name]?.max ?? variable.max}
                onValueChange={(v) => updateInput(modelId, variable.name, v)}
                onLimitsChange={(l) => updateCustomLimits(modelId, variable.name, l)}
                onBeforeChange={handleBeforeChange}
              />
            ))}

            <div className="pt-2">
              <PredictButton modelId={modelId} inputs={tabState.inputs} />
            </div>
          </div>

          {/* Results panel */}
          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <ResultsPanel
              prediction={tabState.lastPrediction}
              isStale={tabState.predictionStale}
              variablesByName={variablesByName}
            />
            <PredictionHistory history={tabState.history} variablesByName={variablesByName} />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
