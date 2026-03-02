export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Model {
  id: number;
  name: string;
  display_name: string;
  description: string;
}

export interface VariableSchema {
  name: string;
  description: string;
  meaning: string;
  default_value: number;
  min: number;
  max: number;
  step: number;
}

export interface ModelSchema {
  id: number;
  name: string;
  display_name: string;
  description: string;
  version: string;
  trained_at: string;
  target_variable: string;
  r_squared: number;
  variables: VariableSchema[];
}

export interface PredictionResponse {
  model_name: string;
  prediction: number;
  variable: string;
  r_squared: number;
  values_used: Record<string, number>;
  contributions: Record<string, number>;
  version: string;
  trained_at: string;
}

export interface PredictionRequest {
  values: Record<string, number>;
}

export interface PredictionHistoryEntry {
  id: string;
  timestamp: number;
  inputs: Record<string, number>;
  result: PredictionResponse;
}

export interface TabState {
  modelId: number;
  modelName: string;
  displayName: string;
  inputs: Record<string, number>;
  customLimits: Record<string, { min: number; max: number }>;
  lastPrediction: PredictionResponse | null;
  predictionStale: boolean;
  history: PredictionHistoryEntry[];
  snapshots: TabSnapshot[];
}

export interface TabSnapshot {
  inputs: Record<string, number>;
  customLimits: Record<string, { min: number; max: number }>;
  lastPrediction: PredictionResponse | null;
}
