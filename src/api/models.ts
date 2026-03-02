import { api } from './client';
import type { Model, ModelSchema, PredictionRequest, PredictionResponse } from '@/types';

export async function getModels(): Promise<Model[]> {
  const { data } = await api.get<Model[]>('/models');
  return data;
}

export async function getModelSchema(modelId: number): Promise<ModelSchema> {
  const { data } = await api.get<ModelSchema>(`/models/${modelId}/schema`);
  return data;
}

export async function predict(
  modelId: number,
  payload: PredictionRequest,
): Promise<PredictionResponse> {
  const { data } = await api.post<PredictionResponse>(
    `/models/${modelId}/predict`,
    payload,
  );
  return data;
}
