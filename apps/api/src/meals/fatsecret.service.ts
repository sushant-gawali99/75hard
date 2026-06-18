import { Injectable } from '@nestjs/common';

import { type Nutrients } from '@process/shared';

type Json = Record<string, unknown>;

/** FatSecret Platform API client (OAuth2 client-credentials). Throws on any failure so callers can fall back. */
@Injectable()
export class FatSecretService {
  private readonly id = process.env.FATSECRET_CLIENT_ID;
  private readonly secret = process.env.FATSECRET_CLIENT_SECRET;
  private token?: { value: string; expires: number };

  get enabled() {
    return !!(this.id && this.secret);
  }

  private async getToken(): Promise<string> {
    if (this.token && this.token.expires > Date.now()) return this.token.value;
    const auth = Buffer.from(`${this.id}:${this.secret}`).toString('base64');
    const res = await fetch('https://oauth.fatsecret.com/connect/token', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded', authorization: `Basic ${auth}` },
      body: 'grant_type=client_credentials&scope=basic',
    });
    if (!res.ok) throw new Error(`fatsecret token ${res.status}`);
    const json = (await res.json()) as { access_token: string; expires_in: number };
    this.token = { value: json.access_token, expires: Date.now() + (json.expires_in - 60) * 1000 };
    return this.token.value;
  }

  private async call(params: Record<string, string>): Promise<Json> {
    const token = await this.getToken();
    const qs = new URLSearchParams({ ...params, format: 'json' }).toString();
    const res = await fetch(`https://platform.fatsecret.com/rest/server.api?${qs}`, {
      headers: { authorization: `Bearer ${token}` },
    });
    const json = (await res.json()) as Json;
    if ((json as { error?: { message?: string } }).error) {
      throw new Error(`fatsecret: ${(json as { error: { message: string } }).error.message}`);
    }
    return json;
  }

  /** Resolve nutrition for a query, scaled to `grams`. */
  async nutrition(query: string, grams: number): Promise<Nutrients> {
    const search = await this.call({ method: 'foods.search', search_expression: query, max_results: '1' });
    const foods = (search.foods as { food?: unknown })?.food;
    const first = (Array.isArray(foods) ? foods[0] : foods) as { food_id?: string } | undefined;
    if (!first?.food_id) throw new Error('fatsecret: no match');

    const detail = await this.call({ method: 'food.get.v4', food_id: first.food_id });
    const servings = (detail.food as { servings?: { serving?: unknown } })?.servings?.serving;
    const list = (Array.isArray(servings) ? servings : [servings]) as Array<Record<string, string>>;
    const serving = list.find((s) => s?.metric_serving_unit === 'g') ?? list[0];
    if (!serving) throw new Error('fatsecret: no serving');

    const base = parseFloat(serving.metric_serving_amount ?? '100');
    const factor = serving.metric_serving_unit === 'g' && base > 0 ? grams / base : grams / 100;
    const n = (v: string | undefined) => (v != null ? parseFloat(v) * factor : undefined);
    return {
      kcal: n(serving.calories) ?? 0,
      proteinG: n(serving.protein) ?? 0,
      carbsG: n(serving.carbohydrate) ?? 0,
      fatG: n(serving.fat) ?? 0,
      fiberG: n(serving.fiber),
      sugarG: n(serving.sugar),
      sodiumMg: n(serving.sodium),
    };
  }
}
