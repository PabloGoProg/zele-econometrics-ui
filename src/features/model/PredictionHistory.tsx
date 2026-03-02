import { useState } from 'react';
import { Clock, ChevronDown, ChevronRight } from 'lucide-react';
import type { PredictionHistoryEntry } from '@/types';

interface PredictionHistoryProps {
  history: PredictionHistoryEntry[];
}

export function PredictionHistory({ history }: PredictionHistoryProps) {
  if (history.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-slate-400" />
        <h4 className="text-sm font-semibold text-slate-700">
          Historial ({history.length})
        </h4>
      </div>
      <div className="mt-3 max-h-80 space-y-2 overflow-y-auto">
        {history.map((entry) => (
          <HistoryItem key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}

function HistoryItem({ entry }: { entry: PredictionHistoryEntry }) {
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
    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
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
          <span className="text-sm font-semibold tabular-nums text-primary-800">
            {entry.result.prediction.toFixed(6)}
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
              <span>{key}</span>
              <span className="tabular-nums">{val}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
