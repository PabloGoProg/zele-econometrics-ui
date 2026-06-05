import { useState, useCallback, useRef } from 'react';
import { Info, Settings2 } from 'lucide-react';
import { Slider } from '@/components/ui/Slider';
import { Tooltip } from '@/components/ui/Tooltip';
import type { VariableSchema } from '@/types';
import {
  displayValueForInput,
  formatVariableValue,
  parseValueFromInput,
  valueTypeLabel,
} from '@/lib/modelFormatting';

interface InputControlProps {
  variable: VariableSchema;
  value: number;
  customMin: number;
  customMax: number;
  onValueChange: (value: number) => void;
  onLimitsChange: (limits: { min: number; max: number }) => void;
  onBeforeChange: () => void;
}

export function InputControl({
  variable,
  value,
  customMin,
  customMax,
  onValueChange,
  onLimitsChange,
  onBeforeChange,
}: InputControlProps) {
  const [inputText, setInputText] = useState(displayValueForInput(value, variable));
  const [editingValue, setEditingValue] = useState(false);
  const [rangeError, setRangeError] = useState('');
  const [editingLimits, setEditingLimits] = useState(false);
  const [tempMin, setTempMin] = useState(displayValueForInput(customMin, variable));
  const [tempMax, setTempMax] = useState(displayValueForInput(customMax, variable));
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const visibleInputText = editingValue ? inputText : displayValueForInput(value, variable);

  const handleSliderChange = useCallback(
    (newVal: number) => {
      onBeforeChange();
      setInputText(displayValueForInput(newVal, variable));
      setEditingValue(false);
      setRangeError('');
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onValueChange(newVal);
      }, 150);
    },
    [onValueChange, onBeforeChange, variable],
  );

  const handleInputBlur = useCallback(() => {
    const parsed = parseValueFromInput(visibleInputText, variable);
    setEditingValue(false);
    if (parsed === null) {
      setInputText(displayValueForInput(value, variable));
      setRangeError('');
      return;
    }
    if (parsed < customMin || parsed > customMax) {
      setRangeError(
        `Fuera de rango (${formatVariableValue(customMin, variable)} - ${formatVariableValue(customMax, variable)})`,
      );
      setInputText(displayValueForInput(value, variable));
      return;
    }
    if (parsed !== value) {
      onBeforeChange();
      onValueChange(parsed);
    }
    setInputText(displayValueForInput(parsed, variable));
    setRangeError('');
  }, [visibleInputText, value, variable, customMin, customMax, onValueChange, onBeforeChange]);

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleInputBlur();
  };

  const handleSaveLimits = () => {
    const newMin = parseValueFromInput(tempMin, variable);
    const newMax = parseValueFromInput(tempMax, variable);
    if (newMin === null || newMax === null || newMin >= newMax) return;
    if (value < newMin || value > newMax) return;
    onBeforeChange();
    onLimitsChange({ min: newMin, max: newMax });
    setEditingLimits(false);
  };

  const limitsValid = (() => {
    const newMin = parseValueFromInput(tempMin, variable);
    const newMax = parseValueFromInput(tempMax, variable);
    if (newMin === null || newMax === null) return false;
    if (newMin >= newMax) return false;
    if (value < newMin || value > newMax) return false;
    return true;
  })();

  const warnOutOfRecommended =
    value < variable.min || value > variable.max;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-medium text-slate-700">
            {variable.display_name || variable.name}
          </label>
          <Tooltip content={`${variable.meaning}\n\n${variable.description}`}>
            <button className="text-slate-400 hover:text-slate-500">
              <Info className="h-3.5 w-3.5" />
            </button>
          </Tooltip>
          {warnOutOfRecommended && (
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
              Fuera del rango recomendado
            </span>
          )}
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
          {valueTypeLabel(variable)}
        </span>
        <button
          onClick={() => {
            setTempMin(displayValueForInput(customMin, variable));
            setTempMax(displayValueForInput(customMax, variable));
            setEditingLimits(!editingLimits);
          }}
          className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          title="Editar rango"
        >
          <Settings2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Slider
            value={value}
            min={customMin}
            max={customMax}
            step={variable.step}
            onValueChange={handleSliderChange}
          />
        </div>
        <input
          type="text"
          value={visibleInputText}
          onChange={(e) => {
            setEditingValue(true);
            setInputText(e.target.value);
            setRangeError('');
          }}
          onFocus={() => {
            setEditingValue(true);
            setInputText(displayValueForInput(value, variable));
            setRangeError('');
          }}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          className="w-24 rounded-md border border-slate-300 px-2 py-1 text-right text-sm tabular-nums text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
        <span>Mín: {formatVariableValue(customMin, variable)}</span>
        <span>Actual: {formatVariableValue(value, variable)}</span>
        <span>Máx: {formatVariableValue(customMax, variable)}</span>
      </div>

      {rangeError && (
        <p className="mt-1 text-xs text-red-500">{rangeError}</p>
      )}

      {editingLimits && (
        <div className="mt-3 flex items-end gap-2 rounded-md border border-slate-200 bg-slate-50 p-3">
          <div className="flex-1">
            <label className="text-[11px] font-medium text-slate-500">Nuevo mín</label>
            <input
              type="text"
              value={tempMin}
              onChange={(e) => setTempMin(e.target.value)}
              className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/20"
            />
          </div>
          <div className="flex-1">
            <label className="text-[11px] font-medium text-slate-500">Nuevo máx</label>
            <input
              type="text"
              value={tempMax}
              onChange={(e) => setTempMax(e.target.value)}
              className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/20"
            />
          </div>
          <button
            onClick={handleSaveLimits}
            disabled={!limitsValid}
            className="rounded-md bg-primary-700 px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-primary-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Aplicar
          </button>
        </div>
      )}
      {editingLimits && !limitsValid && (
        <p className="mt-1 text-xs text-red-500">
          Mín debe ser menor que Máx, y el valor actual ({formatVariableValue(value, variable)}) debe estar dentro del nuevo rango.
        </p>
      )}
    </div>
  );
}
