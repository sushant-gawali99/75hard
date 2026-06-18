import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { AddWeightInput, SetRuleStateInput } from '@process/shared';
import { api } from './api';

export const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export function useWeights() {
  return useQuery({ queryKey: ['weights'], queryFn: api.listWeights });
}

export function useAddWeight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AddWeightInput) => api.addWeight(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['weights'] }),
  });
}

export function useRules() {
  return useQuery({ queryKey: ['rules'], queryFn: api.listRules });
}

export function useRuleLogs(date: string) {
  return useQuery({ queryKey: ['rule-logs', date], queryFn: () => api.listRuleLogs(date) });
}

export function useSetRuleState() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SetRuleStateInput) => api.setRuleState(body),
    onSuccess: (_data, vars) => qc.invalidateQueries({ queryKey: ['rule-logs', vars.date] }),
  });
}
