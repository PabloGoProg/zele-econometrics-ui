import type { VariableSchema } from '@/types';

const NUMBER_FORMAT = new Intl.NumberFormat('es-CO', {
  maximumFractionDigits: 2,
});

const PRECISE_NUMBER_FORMAT = new Intl.NumberFormat('es-CO', {
  maximumFractionDigits: 6,
});

export function isLogChangeRate(variableOrName: VariableSchema | string) {
  if (typeof variableOrName === 'string') return variableOrName.startsWith('delta_ln_');
  return variableOrName.value_type === 'log_change_rate';
}

export function formatModelNumber(value: number) {
  return PRECISE_NUMBER_FORMAT.format(value);
}

export function displayValueForInput(value: number, variable: VariableSchema) {
  if (isLogChangeRate(variable)) return NUMBER_FORMAT.format(value * 100);
  return NUMBER_FORMAT.format(value);
}

export function parseValueFromInput(value: string, variable: VariableSchema) {
  const parsed = Number.parseFloat(value.replace('%', '').replace(',', '.'));
  if (Number.isNaN(parsed)) return null;
  return isLogChangeRate(variable) ? parsed / 100 : parsed;
}

export function formatVariableValue(value: number, variable: VariableSchema) {
  if (isLogChangeRate(variable)) return `${NUMBER_FORMAT.format(value * 100)}%`;
  if (variable.value_type === 'percentage') return `${NUMBER_FORMAT.format(value)}%`;
  return NUMBER_FORMAT.format(value);
}

export function formatPredictionValue(value: number, variableName: string) {
  if (isLogChangeRate(variableName)) {
    return `${NUMBER_FORMAT.format(value * 100)}%`;
  }
  return formatModelNumber(value);
}

export function valueTypeLabel(variable: VariableSchema) {
  if (isLogChangeRate(variable)) return 'Variación aproximada (%)';
  if (variable.value_type === 'percentage') return 'Porcentaje directo (%)';
  if (variable.value_type === 'normalized_index') return 'Índice normalizado';
  return 'Valor numérico';
}

export function variableLabel(
  variableName: string,
  variablesByName: Record<string, VariableSchema>,
) {
  return variablesByName[variableName]?.display_name || variableName;
}
