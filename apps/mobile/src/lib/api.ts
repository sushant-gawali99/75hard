import type {
  AddWeightInput,
  CreateRuleInput,
  Rule,
  RuleLog,
  SetRuleStateInput,
  StreaksSummary,
  WeightEntry,
} from '@process/shared';
import { authClient } from './auth';

const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:3000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const cookie = authClient.getCookie();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${await res.text().catch(() => res.statusText)}`);
  }
  return (await res.json()) as T;
}

export const api = {
  listRules: () => request<Rule[]>('/rules'),
  createRule: (body: CreateRuleInput) => request<Rule>('/rules', { method: 'POST', body: JSON.stringify(body) }),
  listRuleLogs: (date: string) => request<RuleLog[]>(`/rule-logs?date=${date}`),
  setRuleState: (body: SetRuleStateInput) => request<RuleLog>('/rule-logs', { method: 'POST', body: JSON.stringify(body) }),
  listWeights: () => request<WeightEntry[]>('/weights'),
  addWeight: (body: AddWeightInput) => request<WeightEntry>('/weights', { method: 'POST', body: JSON.stringify(body) }),
  getStreaks: () => request<StreaksSummary>('/streaks'),
};
