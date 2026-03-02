import { TrendingUp, Info } from 'lucide-react';
import type { PredictionResponse } from '@/types';
import { ContributionsChart } from './ContributionsChart';

interface ResultsPanelProps {
  prediction: PredictionResponse | null;
  isStale: boolean;
}

export function ResultsPanel({ prediction, isStale }: ResultsPanelProps) {
  if (!prediction) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <TrendingUp className="mx-auto h-8 w-8 text-slate-300" />
        <p className="mt-3 text-sm text-slate-400">
          Ajusta las variables y haz clic en "Predecir" para ver resultados.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className={`rounded-xl border bg-white p-5 shadow-sm ${
          isStale ? 'border-amber-300' : 'border-slate-200'
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

        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
          Predicción
        </p>
        <p className="mt-1 text-3xl font-bold tabular-nums text-primary-800">
          {prediction.prediction.toFixed(6)}
        </p>
        <p className="mt-1 text-sm text-slate-500">{prediction.variable}</p>

        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
          <div>
            <p className="text-[11px] font-medium text-slate-400">R²</p>
            <p className="text-sm font-semibold text-slate-700">
              {prediction.r_squared}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Versión</p>
            <p className="text-sm font-semibold text-slate-700">
              {prediction.version}
            </p>
          </div>
          <div className="col-span-2">
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
          <ContributionsChart contributions={prediction.contributions} />
        )}
    </div>
  );
}
