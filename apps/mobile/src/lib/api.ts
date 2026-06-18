import type {
  AddWeightInput,
  AnalyzeMealInput,
  Challenge,
  CreateChallengeInput,
  CreateRuleInput,
  MealAnalysis,
  NutritionTargets,
  Profile,
  Rule,
  RuleLog,
  SaveMealInput,
  SetRuleStateInput,
  StreaksSummary,
  StreaksCalendar,
  UpsertProfileInput,
  WeightEntry,
} from '@process/shared';
import { authClient } from './auth';

/** Flattened meal row as returned by GET /meals. */
export type MealRow = {
  id: string;
  type: string;
  eatenAt: string;
  dishName: string;
  kcal: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  score: number | null;
  band: string | null;
};

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
  getStreaksCalendar: (month: string) =>
    request<StreaksCalendar>(`/streaks/calendar?month=${month}`),
  getProfile: () => request<Profile | null>('/profile'),
  upsertProfile: (body: UpsertProfileInput) => request<Profile>('/profile', { method: 'PUT', body: JSON.stringify(body) }),
  getNutritionTargets: () => request<NutritionTargets | null>('/nutrition-targets'),
  getChallenge: () => request<Challenge | null>('/challenge'),
  createChallenge: (body: CreateChallengeInput) => request<Challenge>('/challenge', { method: 'POST', body: JSON.stringify(body) }),
  analyzeMeal: (body: AnalyzeMealInput) => request<MealAnalysis>('/meals/analyze', { method: 'POST', body: JSON.stringify(body) }),
  saveMeal: (body: SaveMealInput) => request<{ id: string }>('/meals', { method: 'POST', body: JSON.stringify(body) }),
  listMeals: (date: string) => request<MealRow[]>(`/meals?date=${date}`),
};
