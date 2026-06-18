import { create } from 'zustand';

import type { ActivityLevel, CreateRuleInput, Sex, WeightUnit } from '@process/shared';

/** Collects onboarding answers across steps; submitted on "Start my challenge". */
type OnboardingState = {
  days: number;
  rules: CreateRuleInput[];
  currentKg: number;
  goalKg: number;
  unit: WeightUnit;
  sex?: Sex;
  age?: number;
  heightCm?: number;
  activity?: ActivityLevel;
  setData: (partial: Partial<Omit<OnboardingState, 'setData'>>) => void;
};

export const useOnboarding = create<OnboardingState>((set) => ({
  days: 75,
  rules: [],
  currentKg: 80,
  goalKg: 72,
  unit: 'kg',
  setData: (partial) => set(partial),
}));
