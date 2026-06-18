import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { and, eq, gte, lt } from 'drizzle-orm';

import {
  scoreMeal,
  type AnalyzeMealInput,
  type MealAnalysis,
  type MealItem,
  type Nutrients,
  type SaveMealInput,
} from '@process/shared';
import { type Db } from '../db/client';
import { DRIZZLE } from '../db/db.module';
import { mealItems, meals } from '../db/schema';
import { FatSecretService } from './fatsecret.service';
import { VisionService } from './vision.service';

const r1 = (x: number) => Math.round(x * 10) / 10;

function sumNutrients(list: Nutrients[]): Nutrients {
  const t = { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0, fiber: 0, sugar: 0, sodium: 0 };
  let hasFiber = false;
  let hasSugar = false;
  let hasSodium = false;
  for (const n of list) {
    t.kcal += n.kcal;
    t.proteinG += n.proteinG;
    t.carbsG += n.carbsG;
    t.fatG += n.fatG;
    if (n.fiberG != null) { t.fiber += n.fiberG; hasFiber = true; }
    if (n.sugarG != null) { t.sugar += n.sugarG; hasSugar = true; }
    if (n.sodiumMg != null) { t.sodium += n.sodiumMg; hasSodium = true; }
  }
  return {
    kcal: Math.round(t.kcal),
    proteinG: r1(t.proteinG),
    carbsG: r1(t.carbsG),
    fatG: r1(t.fatG),
    fiberG: hasFiber ? r1(t.fiber) : undefined,
    sugarG: hasSugar ? r1(t.sugar) : undefined,
    sodiumMg: hasSodium ? Math.round(t.sodium) : undefined,
  };
}

@Injectable()
export class MealsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Db,
    private readonly vision: VisionService,
    private readonly fatsecret: FatSecretService,
  ) {}

  async analyze(_userId: string, input: AnalyzeMealInput): Promise<MealAnalysis> {
    const v = await this.vision.analyze(input.image, input.name ?? 'none');
    if (!v.isFood) {
      return {
        isFood: false,
        dishName: v.dishName,
        notes: v.notes,
        items: [],
        totals: { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 },
        score: { value: 0, band: 'red', rationale: 'Not a meal.', tip: v.tip },
      };
    }

    const items: MealItem[] = [];
    for (const it of v.items) {
      let nutrients: Nutrients;
      let source: 'fatsecret' | 'estimate';
      try {
        if (!this.fatsecret.enabled) throw new Error('fatsecret disabled');
        nutrients = await this.fatsecret.nutrition(it.fatsecretQuery, it.quantityGrams);
        source = 'fatsecret';
      } catch {
        nutrients = { kcal: it.estKcal, proteinG: it.estProteinG, carbsG: it.estCarbsG, fatG: it.estFatG };
        source = 'estimate';
      }
      items.push({ id: randomUUID(), name: it.name, quantityGrams: it.quantityGrams, nutrients, source });
    }

    const totals = sumNutrients(items.map((i) => i.nutrients));
    const sc = scoreMeal(totals);
    return { isFood: true, dishName: v.dishName, notes: v.notes, items, totals, score: { ...sc, tip: v.tip } };
  }

  async save(userId: string, input: SaveMealInput) {
    const [meal] = await this.db
      .insert(meals)
      .values({
        userId,
        type: input.type,
        eatenAt: new Date(),
        dishName: input.dishName,
        photoKey: input.photoKey,
        kcal: input.totals.kcal,
        proteinG: input.totals.proteinG,
        carbsG: input.totals.carbsG,
        fatG: input.totals.fatG,
        fiberG: input.totals.fiberG,
        sugarG: input.totals.sugarG,
        sodiumMg: input.totals.sodiumMg,
        score: input.score.value,
        band: input.score.band,
        rationale: input.score.rationale,
        tip: input.score.tip,
      })
      .returning();

    if (meal && input.items.length) {
      await this.db.insert(mealItems).values(
        input.items.map((it) => ({
          mealId: meal.id,
          name: it.name,
          quantityGrams: it.quantityGrams,
          kcal: it.nutrients.kcal,
          proteinG: it.nutrients.proteinG,
          carbsG: it.nutrients.carbsG,
          fatG: it.nutrients.fatG,
          fiberG: it.nutrients.fiberG,
          sugarG: it.nutrients.sugarG,
          sodiumMg: it.nutrients.sodiumMg,
          source: it.source,
        })),
      );
    }
    return meal;
  }

  listByDate(userId: string, date: string) {
    const start = new Date(`${date}T00:00:00Z`);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    return this.db
      .select()
      .from(meals)
      .where(and(eq(meals.userId, userId), gte(meals.eatenAt, start), lt(meals.eatenAt, end)))
      .orderBy(meals.eatenAt);
  }
}
