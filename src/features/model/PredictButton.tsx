import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Play, AlertCircle } from 'lucide-react';
import { predict } from '@/api/models';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useRateLimit } from '@/hooks/useRateLimit';
import { extractApiError } from '@/lib/errors';
import { Button } from '@/components/ui/Button';
import type { PredictionHistoryEntry } from '@/types';

interface PredictButtonProps {
  modelId: number;
  inputs: Record<string, number>;
}

export function PredictButton({ modelId, inputs }: PredictButtonProps) {
  const { setPredictionResult, addHistoryEntry, pushSnapshot } = useWorkspaceStore();
  const { isLimited, remaining, formattedTime, record, setLimitedFromServer } = useRateLimit();
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: () => predict(modelId, { values: inputs }),
    onSuccess: (result) => {
      record();
      pushSnapshot(modelId);
      setPredictionResult(modelId, result);

      const entry: PredictionHistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: Date.now(),
        inputs: { ...inputs },
        result,
      };
      addHistoryEntry(modelId, entry);
      setError('');
    },
    onError: (err: unknown) => {
      const resp = (err as { response?: { status?: number; headers?: Record<string, string> } }).response;
      if (resp?.status === 429) {
        const retryAfter = parseInt(resp.headers?.['retry-after'] ?? '60', 10);
        setLimitedFromServer(retryAfter);
        setError(`Has alcanzado el límite. Intenta de nuevo en ${Math.ceil(retryAfter / 60)} min.`);
      } else {
        setError(extractApiError(err));
      }
    },
  });

  const handlePredict = () => {
    if (isLimited) return;
    setError('');
    mutation.mutate();
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handlePredict}
        isLoading={mutation.isPending}
        disabled={isLimited || mutation.isPending}
        className="w-full gap-2"
        size="lg"
      >
        <Play className="h-4 w-4" />
        Predecir
      </Button>

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

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <div>
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={handlePredict}
              className="mt-1 text-sm font-medium text-red-600 hover:text-red-800"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
