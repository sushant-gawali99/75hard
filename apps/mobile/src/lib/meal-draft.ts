import { create } from 'zustand';

import type { MealAnalysis, MealType } from '@process/shared';

/** Holds the in-progress meal analysis between Capture and the Analysis review screen. */
type MealDraftState = {
  analysis?: MealAnalysis;
  photoUri?: string;
  mealType: MealType;
  set: (partial: Partial<Omit<MealDraftState, 'set'>>) => void;
};

export const useMealDraft = create<MealDraftState>((set) => ({
  mealType: 'lunch',
  set: (partial) => set(partial),
}));
