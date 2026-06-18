import Anthropic from '@anthropic-ai/sdk';
import { Injectable } from '@nestjs/common';

import { MealVision } from '@process/shared';

const SYSTEM = `You are a nutrition vision assistant. Look at the meal photo and identify each distinct food.
For each item: a short generic FatSecret search query (no brands), an estimated portion in grams, a human-readable
portion, and fallback estimates for calories/protein/carbs/fat. Give one short, encouraging, actionable tip.
If the image is not food, set isFood to false. Always call the report_meal tool.`;

const TOOL: Anthropic.Tool = {
  name: 'report_meal',
  description: 'Report the identified meal and per-item nutrition estimates.',
  input_schema: {
    type: 'object',
    properties: {
      isFood: { type: 'boolean' },
      dishName: { type: 'string' },
      notes: { type: 'string' },
      tip: { type: 'string' },
      overallConfidence: { type: 'string', enum: ['high', 'medium', 'low'] },
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            fatsecretQuery: { type: 'string' },
            quantityGrams: { type: 'number' },
            quantityDisplay: { type: 'string' },
            confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
            estKcal: { type: 'number' },
            estProteinG: { type: 'number' },
            estCarbsG: { type: 'number' },
            estFatG: { type: 'number' },
          },
          required: ['name', 'fatsecretQuery', 'quantityGrams', 'quantityDisplay', 'confidence', 'estKcal', 'estProteinG', 'estCarbsG', 'estFatG'],
        },
      },
    },
    required: ['isFood', 'dishName', 'notes', 'tip', 'overallConfidence', 'items'],
  },
};

@Injectable()
export class VisionService {
  private readonly client = new Anthropic();

  get enabled() {
    return !!process.env.ANTHROPIC_API_KEY;
  }

  async analyze(imageBase64: string, context: string): Promise<MealVision> {
    const msg = await this.client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: SYSTEM,
      tools: [TOOL],
      tool_choice: { type: 'tool', name: 'report_meal' },
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 } },
            { type: 'text', text: `Analyze this meal. Context: ${context}` },
          ],
        },
      ],
    });
    const block = msg.content.find((b) => b.type === 'tool_use');
    if (!block || block.type !== 'tool_use') throw new Error('vision: no tool_use returned');
    return MealVision.parse(block.input);
  }
}
