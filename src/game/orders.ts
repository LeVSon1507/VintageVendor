import { Difficulty, Order, OrderItem, Customer, Ingredient } from '../types';
import { RECIPE_CATALOG, toOrderItem } from './recipes';
import { createRng } from './rng';

export type OrderOptions = {
  difficulty: Difficulty;
  seed?: number;
  excludeItemIds?: string[];
  customerType?: Customer['type'];
  forceRecipeId?: string;
};

function pickRecipeId(options: OrderOptions): string {
  if (options.forceRecipeId) {
    const forced = RECIPE_CATALOG.find(r => r.id === options.forceRecipeId);
    if (forced) return forced.id;
  }
  const exclude = new Set(options.excludeItemIds ?? []);
  const candidates = RECIPE_CATALOG.filter(function allow(r) {
    return !exclude.has(r.id);
  });
  const rng = createRng(options.seed);
  const idx = rng.nextInt(0, Math.max(0, candidates.length - 1));
  const chosen = candidates[idx] ?? RECIPE_CATALOG[0];
  return chosen.id;
}

function generateRequirements(
  id: string,
  seed?: number,
  customerType?: Customer['type'],
): string[] {
  const pool: Record<string, string[]> = {
    soda_da_chanh: ['Ít đá', 'Thêm chanh'],
    soda_chai: ['Ướp lạnh', 'Không đá'],
    soda_chanh_muoi: ['Ít đá', 'Ít muối', 'Thêm chanh', 'Không muối'],
    xien_que: ['Ít gia vị', 'Cay'],
    xien_que_tuong_ot: ['Ít tiêu', 'Thêm tương ớt', 'Không cay', 'Cay'],
    ca_vien_chien: ['Không rau', 'Thêm dưa leo'],
    banh_mi_thit: ['Ít tương ớt', 'Thêm đồ chua'],
    che: ['Ít ngọt', 'Thêm đá'],
    cafe_vot: ['Nóng', 'Lạnh'],
    sua_dau_nanh: ['Ít ngọt', 'Nóng', 'Lạnh', 'Thêm đá'],
  };
  const base = pool[id] ?? [];
  if (base.length === 0) return [];
  const rng = createRng(seed);
  const count = rng.nextInt(0, Math.min(2, base.length));
  const shuffled = [...base].sort(function shuffle() {
    return rng.nextInt(0, 100) % 2 === 0 ? 1 : -1;
  });
  const picked = shuffled.slice(0, count);
  const forced = new Set<string>();
  if (customerType === 'elderly') {
    if (id === 'xien_que_tuong_ot' && !picked.includes('Không cay')) {
      picked.push('Không cay');
      forced.add('Không cay');
    }
    if (id === 'cafe_vot' && !picked.includes('Nóng')) {
      picked.push('Nóng');
      forced.add('Nóng');
    }
    if (id === 'sua_dau_nanh' && !picked.includes('Nóng')) {
      picked.push('Nóng');
      forced.add('Nóng');
    }
  }
  if (customerType === 'student') {
    if (
      (id === 'soda_da_chanh' || id === 'soda_chai' || id === 'sua_dau_nanh') &&
      !picked.includes('Thêm đá')
    )
      { picked.push('Thêm đá'); forced.add('Thêm đá'); }
    if (id.startsWith('xien_que') && !picked.includes('Cay')) {
      picked.push('Cay');
      forced.add('Cay');
    }
  }
  const unique = Array.from(new Set(picked));
  const groups: string[][] = [
    ['Không cay', 'Cay'],
    ['Nóng', 'Lạnh', 'Ướp lạnh'],
    ['Không đá', 'Ít đá', 'Thêm đá'],
  ];
  function resolveGroup(list: string[]): void {
    const present = unique.filter(x => list.includes(x));
    if (present.length <= 1) return;
    let keep: string | undefined;
    const forcedPresent = present.filter(x => forced.has(x));
    if (forcedPresent.length > 0) {
      const priorityOrder = list;
      keep = forcedPresent.sort((a, b) => priorityOrder.indexOf(a) - priorityOrder.indexOf(b))[0];
    } else {
      keep = present.sort((a, b) => list.indexOf(a) - list.indexOf(b))[0];
    }
    for (const item of present) {
      if (item !== keep) {
        const idx = unique.indexOf(item);
        if (idx >= 0) unique.splice(idx, 1);
      }
    }
  }
  groups.forEach(resolveGroup);
  return unique;
}

function getIngredientByIdLocal(id: string): Ingredient | undefined {
  const rec = RECIPE_CATALOG.find(r =>
    r.ingredients.some(ing => ing.id === id),
  );
  if (rec) {
    const found = rec.ingredients.find(ing => ing.id === id);
    if (found) return found;
  }
  // Fallback minimal definitions
  const fallback: Record<string, Ingredient> = {
    da_vien: {
      id: 'da_vien',
      name: 'Đá viên',
      type: 'solid',
      quantity: 6,
      unit: 'piece',
    },
    tuong_ot: {
      id: 'tuong_ot',
      name: 'Tương ớt',
      type: 'liquid',
      quantity: 10,
      unit: 'ml',
    },
    tieu: { id: 'tieu', name: 'Tiêu', type: 'powder', quantity: 2, unit: 'g' },
    muoi: { id: 'muoi', name: 'Muối', type: 'powder', quantity: 2, unit: 'g' },
    nuoc_soi: {
      id: 'nuoc_soi',
      name: 'Nước sôi',
      type: 'liquid',
      quantity: 150,
      unit: 'ml',
    },
  };
  return fallback[id];
}

function adjustIngredientsForRequirements(
  id: string,
  base: Ingredient[],
  requirements: string[],
): Ingredient[] {
  let result = [...base];
  function ensureIngredient(ingId: string): void {
    if (!result.some(i => i.id === ingId)) {
      const ing = getIngredientByIdLocal(ingId);
      if (ing) result.push(ing);
    }
  }
  function removeIngredient(ingId: string): void {
    result = result.filter(i => i.id !== ingId);
  }
  if (id === 'cafe_vot') {
    if (requirements.includes('Lạnh') || requirements.includes('Thêm đá')) {
      ensureIngredient('da_vien');
    }
    if (requirements.includes('Đen đá')) {
      removeIngredient('bot_ca_phe');
      removeIngredient('duong');
      removeIngredient('nuoc_soi');
      ensureIngredient('da_vien');
    }
    if (requirements.includes('Nâu đá')) {
      ensureIngredient('da_vien');
      removeIngredient('dau_nanh');
    }
  }
  if (id === 'sua_dau_nanh') {
    if (requirements.includes('Lạnh') || requirements.includes('Thêm đá')) {
      ensureIngredient('da_vien');
    }
    if (requirements.includes('Nâu đá')) {
      removeIngredient('dau_nanh');
    }
  }
  if (id === 'xien_que') {
    if (requirements.includes('Cay')) {
      ensureIngredient('tuong_ot');
      ensureIngredient('tieu');
    }
  }
  if (id === 'xien_que_tuong_ot') {
    if (requirements.includes('Không cay')) {
      removeIngredient('tieu');
      removeIngredient('tuong_ot');
    }
  }
  if (id === 'soda_chanh_muoi') {
    if (requirements.includes('Không muối')) {
      removeIngredient('muoi');
    }
  }
  return result;
}

export function generateOrderItem(options: OrderOptions): OrderItem {
  const recipeId = pickRecipeId(options);
  const recipe =
    RECIPE_CATALOG.find(r => r.id === recipeId) ?? RECIPE_CATALOG[0];
  const base = toOrderItem(recipe);

  const multiplier =
    options.difficulty === 'easy'
      ? 0.9
      : options.difficulty === 'hard'
      ? 1.15
      : 1.0;
  const reqs = generateRequirements(
    recipe.id,
    options.seed,
    options.customerType,
  );
  const adjustedIngredients = adjustIngredientsForRequirements(
    recipe.id,
    base.ingredients,
    reqs,
  );
  return {
    ...base,
    price: Math.round(base.price * multiplier),
    preparationTime: Math.round(base.preparationTime * multiplier),
    ingredients: adjustedIngredients,
    requirements: reqs,
  };
}

export function generateOrder(options: OrderOptions): Order {
  const itemCount = options.difficulty === 'easy' ? 1 : options.difficulty === 'hard' ? 2 : 1;
  const items: OrderItem[] = [];
  const picked = new Set<string>();
  for (let i = 0; i < itemCount; i++) {
    const nextSeed = (options.seed ?? Date.now()) + i;
    const forceId = i === 0 ? options.forceRecipeId : undefined;
    const item = generateOrderItem({ ...options, seed: nextSeed, excludeItemIds: [...(options.excludeItemIds ?? []), ...picked], forceRecipeId: forceId });
    items.push(item);
    picked.add(item.id);
  }

  const totalPrice = items.reduce((sum, current) => sum + current.price, 0);
  const complexity = items.reduce(
    (sum, current) => sum + current.ingredients.length,
    0,
  );
  const timeLimit = Math.max(
    25,
    items.reduce((sum, current) => sum + current.preparationTime, 0) + 10,
  );

  return {
    id: `order_${Date.now()}`,
    items,
    totalPrice,
    timeLimit,
    complexity,
  };
}
