import { TrendingUp, Info } from 'lucide-react';
import type { PredictionResponse, VariableSchema } from '@/types';
import { ContributionsChart } from './ContributionsChart';
import { formatPredictionValue } from '@/lib/modelFormatting';

interface ResultsPanelProps {
  prediction: PredictionResponse | null;
  isStale: boolean;
  variablesByName: Record<string, VariableSchema>;
}

export function ResultsPanel({ prediction, isStale, variablesByName }: ResultsPanelProps) {
  if (!prediction) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center shadow-sm shadow-slate-900/5">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
          <TrendingUp className="h-6 w-6 text-slate-400" />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-slate-500">
          Ajusta las variables y haz clic en "Predecir" para ver resultados.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className={`rounded-3xl border bg-white/90 p-5 shadow-lg shadow-slate-900/5 ${
          isStale ? 'border-amber-300' : 'border-white/80'
        }`}
      >
        {isStale && (
          <div className="mb-3 flex items-center gap-1.5 rounded-md bg-amber-50 px-3 py-1.5">
            <Info className="h-3.5 w-3.5 text-amber-500" />
            <p className="text-xs font-medium text-amber-600">
              Los inputs han cambiado. Este resultado puede no estar actualizado.
            </p>
          </div>
        )}

        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-600">
          Predicción aproximada
        </p>
        <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-primary-950">
          {formatPredictionValue(prediction.prediction, prediction.variable)}
        </p>
        <p className="mt-1 text-sm font-medium text-slate-500">{prediction.variable}</p>

        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-[11px] font-medium text-slate-400">R²</p>
            <p className="text-sm font-semibold text-slate-700">
              {prediction.r_squared}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-[11px] font-medium text-slate-400">Versión</p>
            <p className="text-sm font-semibold text-slate-700">
              {prediction.version}
            </p>
          </div>
          <div className="col-span-2 rounded-2xl bg-slate-50 p-3">
            <p className="text-[11px] font-medium text-slate-400">
              Fecha de entrenamiento
            </p>
            <p className="text-sm font-semibold text-slate-700">
              {prediction.trained_at}
            </p>
          </div>
        </div>
      </div>

      {prediction.contributions &&
        Object.keys(prediction.contributions).length > 0 && (
          <ContributionsChart
            contributions={prediction.contributions}
            targetVariable={prediction.variable}
            variablesByName={variablesByName}
          />
        )}
    </div>
  );
}
