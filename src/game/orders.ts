import { Difficulty, Order, OrderItem } from '../types';
import { RECIPE_CATALOG, toOrderItem } from './recipes';
import { createRng } from './rng';

export type OrderOptions = {
  difficulty: Difficulty;
  seed?: number;
};

export function generateOrderItem(options: OrderOptions): OrderItem {
  const rng = createRng(options.seed);
  const index = rng.nextInt(0, RECIPE_CATALOG.length - 1);
  const recipe = RECIPE_CATALOG[index] ?? RECIPE_CATALOG[0];
  const base = toOrderItem(recipe);

  const multiplier = options.difficulty === 'easy' ? 0.9 : options.difficulty === 'hard' ? 1.15 : 1.0;
  return {
    ...base,
    price: Math.round(base.price * multiplier),
    preparationTime: Math.round(base.preparationTime * multiplier),
  };
}

export function generateOrder(options: OrderOptions): Order {
  const itemCount = options.difficulty === 'easy' ? 1 : options.difficulty === 'hard' ? 2 : 1;
  const items: OrderItem[] = [];
  for (let i = 0; i < itemCount; i++) {
    items.push(generateOrderItem({ ...options, seed: (options.seed ?? Date.now()) + i }));
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
