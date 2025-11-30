import { Ingredient, OrderItem } from '../types';

export type ServeResult = {
  ok: boolean;
  missing: string[];
  extra: string[];
};

export function validateServe(expectedItem: OrderItem, providedIngredients: Ingredient[]): ServeResult {
  const expectedNames = expectedItem.ingredients.map(ingredient => ingredient.name.toLowerCase());
  const providedNames = providedIngredients.map(ingredient => ingredient.name.toLowerCase());

  const missing = expectedNames.filter(name => !providedNames.includes(name));
  const extra = providedNames.filter(name => !expectedNames.includes(name));

  return {
    ok: missing.length === 0 && extra.length === 0,
    missing,
    extra,
  };
}

export function calculateServeScore(expectedItem: OrderItem, timeRemaining: number, combo: number): number {
  const base = 100 + expectedItem.ingredients.length * 20;
  const timeBonus = Math.max(0, Math.round(timeRemaining * 0.5));
  const comboMultiplier = combo > 0 ? 1 + combo * 0.1 : 1;
  return Math.round((base + timeBonus) * comboMultiplier);
}

