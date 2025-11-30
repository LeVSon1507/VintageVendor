import { Difficulty, Order, OrderItem } from '../types';
import { RECIPE_CATALOG, toOrderItem } from './recipes';
import { createRng } from './rng';

export type OrderOptions = {
  difficulty: Difficulty;
  seed?: number;
  excludeItemIds?: string[];
};

function pickRecipeId(options: OrderOptions): string {
  const exclude = new Set(options.excludeItemIds ?? []);
  const candidates = RECIPE_CATALOG.filter(function allow(r) {
    return !exclude.has(r.id);
  });
  const rng = createRng(options.seed);
  const idx = rng.nextInt(0, Math.max(0, candidates.length - 1));
  const chosen = candidates[idx] ?? RECIPE_CATALOG[0];
  return chosen.id;
}

function generateRequirements(id: string, seed?: number): string[] {
  const pool: Record<string, string[]> = {
    soda_da_chanh: ['Ít đá', 'Thêm chanh'],
    soda_chai: ['Ướp lạnh', 'Không đá'],
    soda_chanh_muoi: ['Ít đá', 'Ít muối', 'Thêm chanh'],
    xien_que: ['Ít gia vị'],
    xien_que_tuong_ot: ['Ít tiêu', 'Thêm tương ớt'],
    ca_vien_chien: ['Không rau', 'Thêm dưa leo'],
    banh_mi_thit: ['Ít tương ớt', 'Thêm đồ chua'],
    che: ['Ít ngọt', 'Thêm đá'],
    cafe_vot: ['Ít ngọt'],
    sua_dau_nanh: ['Ít ngọt'],
  };
  const base = pool[id] ?? [];
  if (base.length === 0) return [];
  const rng = createRng(seed);
  const count = rng.nextInt(0, Math.min(2, base.length));
  const shuffled = [...base].sort(function shuffle() {
    return rng.nextInt(0, 100) % 2 === 0 ? 1 : -1;
  });
  return shuffled.slice(0, count);
}

export function generateOrderItem(options: OrderOptions): OrderItem {
  const recipeId = pickRecipeId(options);
  const recipe = RECIPE_CATALOG.find(r => r.id === recipeId) ?? RECIPE_CATALOG[0];
  const base = toOrderItem(recipe);

  const multiplier = options.difficulty === 'easy' ? 0.9 : options.difficulty === 'hard' ? 1.15 : 1.0;
  return {
    ...base,
    price: Math.round(base.price * multiplier),
    preparationTime: Math.round(base.preparationTime * multiplier),
    requirements: generateRequirements(recipe.id, options.seed),
  };
}

export function generateOrder(options: OrderOptions): Order {
  const itemCount = options.difficulty === 'easy' ? 1 : options.difficulty === 'hard' ? 2 : 1;
  const items: OrderItem[] = [];
  const picked = new Set<string>();
  for (let i = 0; i < itemCount; i++) {
    const nextSeed = (options.seed ?? Date.now()) + i;
    const item = generateOrderItem({ ...options, seed: nextSeed, excludeItemIds: [...(options.excludeItemIds ?? []), ...picked] });
    items.push(item);
    picked.add(item.id);
  }

  const totalPrice = items.reduce((sum, current) => sum + current.price, 0);
  const complexity = items.reduce((sum, current) => sum + current.ingredients.length, 0);
  const timeLimit = Math.max(25, items.reduce((sum, current) => sum + current.preparationTime, 0) + 10);

  return {
    id: `order_${Date.now()}`,
    items,
    totalPrice,
    timeLimit,
    complexity,
  };
}
