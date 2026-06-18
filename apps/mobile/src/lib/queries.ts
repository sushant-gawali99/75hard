import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  ActivityLevel,
  AddWeightInput,
  CreateRuleInput,
  SetRuleStateInput,
  Sex,
  WeightUnit,
} from '@process/shared';
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

export function useStreaks() {
  return useQuery({ queryKey: ['streaks'], queryFn: api.getStreaks });
}

export function useProfile() {
  return useQuery({ queryKey: ['profile'], queryFn: api.getProfile });
}

export function useChallenge() {
  return useQuery({ queryKey: ['challenge'], queryFn: api.getChallenge });
}

export function useNutritionTargets() {
  return useQuery({ queryKey: ['nutrition-targets'], queryFn: api.getNutritionTargets });
}

type OnboardingPayload = {
  days: number;
  rules: CreateRuleInput[];
  currentKg: number;
  goalKg: number;
  unit: WeightUnit;
  sex?: Sex;
  age?: number;
  heightCm?: number;
  activity?: ActivityLevel;
};

export function useCompleteOnboarding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (d: OnboardingPayload) => {
      await api.createChallenge({ days: d.days });
      for (const r of d.rules) await api.createRule(r);
      const today = new Date().toISOString().slice(0, 10);
      await api.addWeight({ date: today, value: d.currentKg, unit: 'kg' });
      await api.upsertProfile({
        sex: d.sex,
        age: d.age,
        heightCm: d.heightCm,
        activity: d.activity,
        startWeightKg: d.currentKg,
        goalWeightKg: d.goalKg,
        unit: d.unit,
        onboardingCompleted: true,
      });
    },
    onSuccess: () => qc.invalidateQueries(),
  });
}

export function useSetRuleState() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SetRuleStateInput) => api.setRuleState(body),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['rule-logs', vars.date] });
      qc.invalidateQueries({ queryKey: ['streaks'] });
    },
  });
}
