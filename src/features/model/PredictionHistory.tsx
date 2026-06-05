import { useState } from 'react';
import { Clock, ChevronDown, ChevronRight } from 'lucide-react';
import type { PredictionHistoryEntry, VariableSchema } from '@/types';
import { formatPredictionValue, formatVariableValue, variableLabel } from '@/lib/modelFormatting';

interface PredictionHistoryProps {
  history: PredictionHistoryEntry[];
  variablesByName: Record<string, VariableSchema>;
}

export function PredictionHistory({ history, variablesByName }: PredictionHistoryProps) {
  if (history.length === 0) return null;

  return (
    <div className="rounded-3xl border border-white/80 bg-white/90 p-5 shadow-sm shadow-slate-900/5">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
          <Clock className="h-4 w-4" />
        </span>
        <h4 className="text-sm font-semibold text-slate-700">
          Historial ({history.length})
        </h4>
      </div>
      <div className="mt-3 max-h-80 space-y-2 overflow-y-auto">
        {history.map((entry) => (
          <HistoryItem key={entry.id} entry={entry} variablesByName={variablesByName} />
        ))}
      </div>
    </div>
  );
}

function HistoryItem({
  entry,
  variablesByName,
}: {
  entry: PredictionHistoryEntry;
  variablesByName: Record<string, VariableSchema>;
}) {
  const [expanded, setExpanded] = useState(false);
  const time = new Date(entry.timestamp).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const date = new Date(entry.timestamp).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
  });

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-2 transition-colors hover:bg-white">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          {expanded ? (
            <ChevronDown className="h-3 w-3 text-slate-400" />
          ) : (
            <ChevronRight className="h-3 w-3 text-slate-400" />
          )}
          <span className="text-sm font-bold tabular-nums text-primary-900">
            {formatPredictionValue(entry.result.prediction, entry.result.variable)}
          </span>
        </div>
        <span className="text-[11px] text-slate-400">
          {date} {time}
        </span>
      </button>

      {expanded && (
        <div className="mt-2 space-y-1 border-t border-slate-200 pt-2">
          {Object.entries(entry.inputs).map(([key, val]) => (
            <div key={key} className="flex justify-between text-xs text-slate-500">
              <span>{variableLabel(key, variablesByName)}</span>
              <span className="tabular-nums">
                {variablesByName[key] ? formatVariableValue(val, variablesByName[key]) : val}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
