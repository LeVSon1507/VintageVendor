import { Animated } from 'react-native';
import { Ingredient, Customer } from '../../types';
import { INGREDIENT_CATEGORIES } from '../../game/categories';
import { t } from '../../i18n';

export function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

export function buildProvidedIngredients(
  currentOrderItem: { ingredients: Ingredient[] },
  selectedIds: string[],
): Ingredient[] {
  return currentOrderItem.ingredients.filter(function ingredientSelected(
    ingredient: Ingredient,
  ) {
    return selectedIds.includes(ingredient.id);
  });
}

export function animateCoinChange(
  anim: Animated.Value,
  onEnd: () => void,
): void {
  anim.setValue(0);
  Animated.timing(anim, {
    toValue: 1,
    duration: 1200,
    useNativeDriver: true,
  }).start(function onAnimEnd() {
    onEnd();
  });
}

export function computePenalty(basePrice: number): number {
  return Math.max(0, Math.round(basePrice * 0.1));
}

export function getConfirmContent(
  kind: 'HINT' | 'ENERGY' | 'MONEY',
): { title: string; message: string } {
  if (kind === 'HINT') {
    return { title: 'Thêm gợi ý', message: 'Xem video để nhận thêm gợi ý' };
  }
  if (kind === 'ENERGY') {
    return { title: 'Hồi năng lượng', message: 'Xem video để nhận 5 năng lượng' };
  }
  return { title: 'Nhận tiền', message: 'Xem video để nhận tiền thưởng' };
}

export function getCategoryLabel(key: string): string {
  if (key === 'base') return t('categoryBase');
  if (key === 'protein') return t('categoryProtein');
  if (key === 'liquid') return t('categoryLiquid');
  if (key === 'topping') return t('categoryTopping');
  return t('categorySpices');
}

export function getNpcHintMessage(
  requirements: string[],
  recipe: any,
): string | null {
  const map: Record<string, string> = {
    'Thêm đá': 'Nhớ cho đúng phần đá nghen!',
    'Ít đá': 'Cho ít đá thôi nghen!',
    'Không đá': 'Không cho đá nhé!',
    'Ít đường': 'Ít đường thôi!',
    'Không cay': 'Không cay dùm nhé!',
    Cay: 'Cho cay cay nhé!',
    Nóng: 'Làm nóng nhé!',
    Lạnh: 'Làm lạnh nhé!',
  };
  const allowed = requirements.filter(function isAllowed(requirement) {
    if (!recipe) return typeof map[requirement] === 'string';
    const isHot = recipe.temperature === 'Hot';
    const isCold = recipe.temperature === 'Cold';
    if (isHot) {
      const blockedHot =
        requirement === 'Lạnh' ||
        requirement === 'Thêm đá' ||
        requirement === 'Ít đá' ||
        requirement === 'Không đá';
      if (blockedHot) return false;
    }
    if (isCold) {
      const blockedCold = requirement === 'Nóng';
      if (blockedCold) return false;
    }
    return typeof map[requirement] === 'string';
  });
  if (allowed.length > 0) return map[allowed[0]];
  if (recipe)
    return recipe.temperature === 'Hot'
      ? 'Làm nóng giùm nhé!'
      : 'Nhớ cho đúng phần đá nhé!';
  return 'Nhớ pha cho đúng nhé!';
}

export function getMissingRequiredIds(
  requiredIdsInput: string[],
  selectedIdsInput: string[],
  hintIdsInput: string[],
): string[] {
  return requiredIdsInput.filter(function needsHint(ingredientId) {
    const isNotSelected = !selectedIdsInput.includes(ingredientId);
    const isNotHinted = !hintIdsInput.includes(ingredientId);
    return isNotSelected && isNotHinted;
  });
}

export function getCandidateRequiredId(
  requiredIdsInput: string[],
  hintIdsInput: string[],
): string | null {
  const found = requiredIdsInput.find(function notHinted(ingredientId) {
    return !hintIdsInput.includes(ingredientId);
  });
  return found || requiredIdsInput[0] || null;
}

export function getCategoryKeyForIngredient(ingredientId: string): string | null {
  const categoryEntry = Object.entries(INGREDIENT_CATEGORIES).find(function findCategory(entry) {
    const categoryList = entry[1] as string[];
    return categoryList.includes(ingredientId);
  });
  return categoryEntry ? (categoryEntry[0] as string) : null;
}

export function getTotalTime(difficulty: string): number {
  if (difficulty === 'easy') return 90;
  if (difficulty === 'hard') return 45;
  return 60;
}

export function computeTimeRatio(timeRemaining: number, totalTime: number): number {
  return clamp01(timeRemaining / totalTime);
}

export function getTimerFillColor(timeRatio: number): string {
  if (timeRatio > 0.5) return '#8B4513';
  if (timeRatio > 0.2) return '#D38B5D';
  return '#C75050';
}

export function getRequiredIngredientIds(customers: Customer[]): string[] {
  if (!customers || customers.length === 0) return [];
  return customers[0].order.items[0].ingredients.map(function toId(ingredient) {
    return ingredient.id;
  });
}
