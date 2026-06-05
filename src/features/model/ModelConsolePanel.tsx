import { useMemo, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { AlertCircle, Boxes, CheckCircle2, Lock, Play, TrendingUp } from 'lucide-react';
import { getModelSchema, predict } from '@/api/models';
import { Button } from '@/components/ui/Button';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { useModels } from '@/hooks/useModels';
import { useRateLimit } from '@/hooks/useRateLimit';
import { extractApiError } from '@/lib/errors';
import {
  formatPredictionValue,
  formatVariableValue,
} from '@/lib/modelFormatting';
import type { ModelSchema, PredictionResponse, VariableSchema } from '@/types';
import { ContributionsChart } from './ContributionsChart';
import { InputControl } from './InputControl';

const MODEL_FLOW = [
  {
    key: 'econ_growth',
    letter: 'A',
    dependency: null,
    helper: 'Punto de partida: predice el crecimiento económico de Pereira.',
  },
  {
    key: 'unemployment',
    letter: 'B',
    dependency: 'econ_growth',
    helper: 'Usa el crecimiento del PIB predicho por A como insumo automático.',
  },
  {
    key: 'business_growth',
    letter: 'C',
    dependency: 'econ_growth',
    helper: 'Usa el crecimiento del PIB predicho por A como insumo automático.',
  },
] as const;

type ModelKey = (typeof MODEL_FLOW)[number]['key'];

const GDP_VARIABLE = 'delta_ln_PIB';

export function ModelConsolePanel() {
  const { data: models, isLoading: modelsLoading, isError: modelsError, refetch } = useModels();
  const { isLimited, remaining, formattedTime, record, setLimitedFromServer } = useRateLimit();
  const [inputs, setInputs] = useState<Record<string, Record<string, number>>>({});
  const [customLimits, setCustomLimits] = useState<
    Record<string, Record<string, { min: number; max: number }>>
  >({});
  const [results, setResults] = useState<Partial<Record<ModelKey, PredictionResponse>>>({});
  const [errors, setErrors] = useState<Partial<Record<ModelKey, string>>>({});
  const [pendingModel, setPendingModel] = useState<ModelKey | null>(null);

  const modelIdsByKey = useMemo(() => {
    if (!models) return {} as Partial<Record<ModelKey, number>>;
    return Object.fromEntries(
      MODEL_FLOW.map((item) => [item.key, models.find((model) => model.name === item.key)?.id]),
    ) as Partial<Record<ModelKey, number>>;
  }, [models]);

  const schemaQueries = useQueries({
    queries: MODEL_FLOW.map((item) => {
      const modelId = modelIdsByKey[item.key] ?? 0;
      return {
        queryKey: ['modelSchema', modelId],
        queryFn: () => getModelSchema(modelId),
        enabled: modelId > 0,
      };
    }),
  });

  const schemasByKey = useMemo(() => {
    return Object.fromEntries(
      MODEL_FLOW.map((item, index) => [item.key, schemaQueries[index].data]),
    ) as Partial<Record<ModelKey, ModelSchema>>;
  }, [schemaQueries]);

  const isLoading = modelsLoading || schemaQueries.some((query) => query.isLoading);
  const isError = modelsError || schemaQueries.some((query) => query.isError);
  const aResult = results.econ_growth;

  const getValue = (modelKey: ModelKey, variable: VariableSchema) => {
    if (modelKey !== 'econ_growth' && variable.name === GDP_VARIABLE && aResult) {
      return aResult.prediction;
    }
    return inputs[modelKey]?.[variable.name] ?? variable.default_value;
  };

  const getLimits = (modelKey: ModelKey, variable: VariableSchema) => {
    return customLimits[modelKey]?.[variable.name] ?? { min: variable.min, max: variable.max };
  };

  const variablesByName = (schema: ModelSchema) => {
    return Object.fromEntries(schema.variables.map((variable) => [variable.name, variable]));
  };

  const handleInputChange = (modelKey: ModelKey, variableName: string, value: number) => {
    setInputs((current) => ({
      ...current,
      [modelKey]: { ...current[modelKey], [variableName]: value },
    }));
    setResults((current) => {
      if (modelKey === 'econ_growth') return {};
      return { ...current, [modelKey]: undefined };
    });
  };

  const handleLimitsChange = (
    modelKey: ModelKey,
    variableName: string,
    limits: { min: number; max: number },
  ) => {
    setCustomLimits((current) => ({
      ...current,
      [modelKey]: { ...current[modelKey], [variableName]: limits },
    }));
  };

  const handlePredict = async (modelKey: ModelKey, schema: ModelSchema) => {
    if (isLimited || pendingModel) return;
    setPendingModel(modelKey);
    setErrors((current) => ({ ...current, [modelKey]: '' }));

    const values = Object.fromEntries(
      schema.variables.map((variable) => [variable.name, getValue(modelKey, variable)]),
    );

    try {
      const result = await predict(schema.id, { values });
      record();
      setResults((current) => {
        if (modelKey === 'econ_growth') return { econ_growth: result };
        return { ...current, [modelKey]: result };
      });
    } catch (err) {
      const resp = (err as { response?: { status?: number; headers?: Record<string, string> } }).response;
      if (resp?.status === 429) {
        const retryAfter = Number.parseInt(resp.headers?.['retry-after'] ?? '60', 10);
        setLimitedFromServer(retryAfter);
        setErrors((current) => ({
          ...current,
          [modelKey]: `Has alcanzado el límite. Intenta de nuevo en ${Math.ceil(retryAfter / 60)} min.`,
        }));
      } else {
        setErrors((current) => ({ ...current, [modelKey]: extractApiError(err) }));
      }
    } finally {
      setPendingModel(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-44 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
        ))}
      </div>
    );
  }

  if (isError || !models) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <AlertCircle className="h-10 w-10 text-red-400" />
        <p className="text-sm text-slate-600">No se pudo cargar la consola de modelos.</p>
        <Button variant="secondary" size="sm" onClick={() => refetch()}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-2xl border border-primary-100 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
              <Boxes className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Flujo integrado
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-primary-900">Consola de Modelos</h2>
              <p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-600">
                Ejecuta primero el modelo A. Su predicción de crecimiento del PIB habilita los modelos B y C, que pueden ejecutarse en cualquier orden usando ese valor como insumo automático.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-3">
          {MODEL_FLOW.map((item) => {
            const schema = schemasByKey[item.key];
            if (!schema) return null;

            const enabled = item.key === 'econ_growth' || Boolean(aResult);
            const result = results[item.key];

            return (
              <section
                key={item.key}
                className={`rounded-2xl border p-5 shadow-sm transition-colors ${
                  enabled
                    ? 'border-slate-200 bg-white'
                    : 'border-slate-300 bg-slate-200 text-slate-500'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                          enabled ? 'bg-primary-700 text-white' : 'bg-slate-500 text-slate-100'
                        }`}
                      >
                        {item.letter}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {schema.name}
                      </span>
                    </div>
                    <h3 className={`mt-3 text-base font-semibold ${enabled ? 'text-primary-900' : 'text-slate-600'}`}>
                      {schema.display_name}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.helper}</p>
                  </div>

                  <StatusBadge enabled={enabled} hasResult={Boolean(result)} />
                </div>

                <div className="mt-5 space-y-3">
                  {schema.variables.map((variable) => {
                    const value = getValue(item.key, variable);
                    const limits = getLimits(item.key, variable);
                    const isDerivedFromA = item.key !== 'econ_growth' && variable.name === GDP_VARIABLE;

                    if (!enabled || isDerivedFromA) {
                      return (
                        <DerivedOrDisabledVariable
                          key={variable.name}
                          variable={variable}
                          value={value}
                          isDerived={isDerivedFromA && Boolean(aResult)}
                          waitingForA={isDerivedFromA && !aResult}
                        />
                      );
                    }

                    return (
                      <InputControl
                        key={variable.name}
                        variable={variable}
                        value={value}
                        customMin={limits.min}
                        customMax={limits.max}
                        onValueChange={(newValue) => handleInputChange(item.key, variable.name, newValue)}
                        onLimitsChange={(newLimits) => handleLimitsChange(item.key, variable.name, newLimits)}
                        onBeforeChange={() => undefined}
                      />
                    );
                  })}
                </div>

                <div className="mt-5 space-y-2">
                  <Button
                    onClick={() => handlePredict(item.key, schema)}
                    isLoading={pendingModel === item.key}
                    disabled={!enabled || isLimited || Boolean(pendingModel)}
                    className="w-full gap-2"
                  >
                    {enabled ? <Play className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    {enabled ? `Predecir modelo ${item.letter}` : 'Esperando predicción de A'}
                  </Button>

                  {result && (
                    <div className="rounded-lg border border-primary-100 bg-primary-50 px-3 py-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-primary-500">
                        Resultado
                      </p>
                      <p className="mt-0.5 text-lg font-bold tabular-nums text-primary-900">
                        {formatPredictionValue(result.prediction, result.variable)}
                      </p>
                      <p className="text-xs text-primary-700">{result.variable}</p>
                    </div>
                  )}

                  {errors[item.key] && (
                    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      {errors[item.key]}
                    </p>
                  )}
                </div>
              </section>
            );
          })}
        </div>

        {isLimited && (
          <p className="text-center text-sm text-amber-600">
            Has alcanzado el límite de predicciones. Intenta de nuevo en {formattedTime}.
          </p>
        )}
        {!isLimited && remaining <= 5 && (
          <p className="text-center text-xs text-slate-400">
            {remaining} predicciones restantes en esta ventana
          </p>
        )}

        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary-700" />
            <h3 className="text-lg font-semibold text-primary-900">Resumen de predicción</h3>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {MODEL_FLOW.map((item) => {
              const schema = schemasByKey[item.key];
              const result = results[item.key];
              if (!schema) return null;

              return (
                <div key={item.key} className="rounded-xl border border-slate-200 bg-white p-4">
                  <h4 className="text-sm font-semibold text-slate-700">
                    Modelo {item.letter}: {schema.display_name}
                  </h4>
                  {result?.contributions && Object.keys(result.contributions).length > 0 ? (
                    <div className="mt-3">
                      <ContributionsChart
                        contributions={result.contributions}
                        targetVariable={result.variable}
                        variablesByName={variablesByName(schema)}
                      />
                    </div>
                  ) : (
                    <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-100 p-6 text-center text-sm text-slate-500">
                      Pendiente de predicción
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </TooltipProvider>
  );
}

function StatusBadge({ enabled, hasResult }: { enabled: boolean; hasResult: boolean }) {
  if (hasResult) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Predicción lista
      </span>
    );
  }

  if (enabled) {
    return <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700">Disponible</span>;
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-400 px-2.5 py-1 text-xs font-semibold text-white">
      <Lock className="h-3.5 w-3.5" />
      Bloqueado
    </span>
  );
}

function DerivedOrDisabledVariable({
  variable,
  value,
  isDerived,
  waitingForA,
}: {
  variable: VariableSchema;
  value: number;
  isDerived: boolean;
  waitingForA: boolean;
}) {
  return (
    <div className="rounded-lg border border-slate-300 bg-slate-100 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-700">{variable.display_name || variable.name}</p>
          <p className="mt-1 text-xs text-slate-500">{variable.name}</p>
        </div>
        <span className="rounded-full bg-slate-300 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
          {isDerived ? 'Calculado por A' : 'No disponible'}
        </span>
      </div>
      <p className="mt-3 text-lg font-bold tabular-nums text-slate-700">
        {waitingForA ? 'Esperando A' : formatVariableValue(value, variable)}
      </p>
    </div>
  );
}
