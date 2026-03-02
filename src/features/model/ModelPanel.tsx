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
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header del modelo */}
        <div>
          <h2 className="text-lg font-semibold text-primary-900">
            {schema.display_name}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{schema.description}</p>
          <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
            <span>Variable objetivo: <strong className="text-slate-600">{schema.target_variable}</strong></span>
            <span>R²: <strong className="text-slate-600">{schema.r_squared}</strong></span>
            <span>Versión: {schema.version}</span>
            <span>Entrenado: {schema.trained_at}</span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Panel de inputs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">Variables de entrada</h3>
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

          {/* Panel de resultados */}
          <div className="space-y-4">
            <ResultsPanel
              prediction={tabState.lastPrediction}
              isStale={tabState.predictionStale}
            />
            <PredictionHistory history={tabState.history} />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
