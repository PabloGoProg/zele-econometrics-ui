import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import type { VariableSchema } from '@/types';
import { formatPredictionValue, variableLabel } from '@/lib/modelFormatting';

interface ContributionsChartProps {
  contributions: Record<string, number>;
  targetVariable: string;
  variablesByName: Record<string, VariableSchema>;
}

export function ContributionsChart({ contributions, targetVariable, variablesByName }: ContributionsChartProps) {
  const data = useMemo(() => {
    return Object.entries(contributions)
      .map(([name, value]) => ({
        name,
        label: variableLabel(name, variablesByName),
        value,
      }))
      .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  }, [contributions, variablesByName]);

  if (data.length === 0) return null;

  return (
    <div className="rounded-3xl border border-white/80 bg-white/90 p-5 shadow-sm shadow-slate-900/5">
      <h4 className="text-sm font-bold text-slate-800">
        Contribución por variable
      </h4>
      <p className="mb-4 text-[11px] text-slate-400">
        Contribuciones calculadas por el modelo entrenado
      </p>

      <ResponsiveContainer width="100%" height={data.length * 40 + 40}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickFormatter={(value) => formatPredictionValue(Number(value), targetVariable)}
          />
          <YAxis
            type="category"
            dataKey="label"
            tick={{ fontSize: 11, fill: '#64748b' }}
            width={150}
          />
          <RechartsTooltip
            contentStyle={{
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              fontSize: '12px',
              boxShadow: '0 12px 30px rgba(15, 23, 42, 0.10)',
            }}
            formatter={(value) => [
              formatPredictionValue(Number(value ?? 0), targetVariable),
              'Contribución',
            ]}
          />
          <ReferenceLine x={0} stroke="#94a3b8" strokeDasharray="3 3" />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.value >= 0 ? '#1d4ed8' : '#dc2626'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
