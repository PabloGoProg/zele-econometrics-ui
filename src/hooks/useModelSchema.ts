import { useQuery } from '@tanstack/react-query';
import { getModelSchema } from '@/api/models';

export function useModelSchema(modelId: number) {
  return useQuery({
    queryKey: ['modelSchema', modelId],
    queryFn: () => getModelSchema(modelId),
    enabled: modelId > 0,
  });
}
