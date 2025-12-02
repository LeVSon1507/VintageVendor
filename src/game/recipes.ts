import { getItemImage, getIngredientImage } from '../game/assets';
import { getIngredientName, getItemName } from '../i18n/names';
import { OrderItem, Ingredient } from '../types';

export type Temperature = 'Hot' | 'Cold';

export type Recipe = {
  id: string;
  name: string;
  requiredIngredients: string[];
  temperature: Temperature;
  resultIcon: any;
};

export const Recipes: Recipe[] = [
  {
    id: 'cafe_vot',
    name: 'Cà phê nóng',
    requiredIngredients: ['bot_ca_phe', 'nuoc_soi'],
    temperature: 'Hot',
    resultIcon: getItemImage('cafe_vot'),
  },
  {
    id: 'sua_dau_nanh',
    name: 'Sữa đậu nành lạnh',
    requiredIngredients: ['dau_nanh', 'nuoc_duong', 'da_vien'],
    temperature: 'Cold',
    resultIcon: getItemImage('sua_dau_nanh'),
  },
  {
    id: 'soda_da_chanh',
    name: 'Soda đá chanh',
    requiredIngredients: ['soda', 'chanh', 'nuoc_duong', 'da_vien'],
    temperature: 'Cold',
    resultIcon: getItemImage('soda_da_chanh'),
  },
  {
    id: 'banh_mi_thit',
    name: 'Bánh mì thịt',
    requiredIngredients: ['banh_mi', 'thit_nguoi', 'do_chua', 'tuong_ot'],
    temperature: 'Hot',
    resultIcon: getItemImage('banh_mi_thit'),
  },
  {
    id: 'che',
    name: 'Chè',
    requiredIngredients: ['hat_che', 'nuoc_duong', 'nuoc_cot_dua', 'da_vien'],
    temperature: 'Cold',
    resultIcon: getItemImage('che'),
  },
  {
    id: 'xien_que',
    name: 'Xiên que',
    requiredIngredients: ['thit_xien', 'gia_vi'],
    temperature: 'Hot',
    resultIcon: getItemImage('xien_que'),
  },
];

export type RecipeDefinition = {
  id: string;
  name: string;
  ingredients: Ingredient[];
  basePrice: number;
  preparationTime: number;
  temperature: 'Hot' | 'Cold';
};

export const RECIPE_CATALOG: RecipeDefinition[] = Recipes.map(function toDef(r) {
  const ingredients: Ingredient[] = r.requiredIngredients.map(function toIng(id) {
    return {
      id,
      name: getIngredientName(id),
      type: 'solid',
      quantity: 1,
      unit: 'piece',
    };
  });
  const basePrice =
    r.id === 'banh_mi_thit' ? 15000 : r.id === 'che' ? 12000 : r.id === 'xien_que' ? 10000 : r.id === 'soda_da_chanh' ? 8000 : r.id === 'sua_dau_nanh' ? 7000 : 10000;
  const preparationTime = r.id === 'banh_mi_thit' ? 18 : r.id === 'xien_que' ? 14 : r.id === 'che' ? 12 : 10;
  return {
    id: r.id,
    name: getItemName(r.id),
    ingredients,
    basePrice,
    preparationTime,
    temperature: r.temperature,
  };
});

export function getIngredientIcon(id: string): any {
  return getIngredientImage(id);
}

export function getRecipeById(id: string): RecipeDefinition | undefined {
  return RECIPE_CATALOG.find(function byId(recipe) {
    return recipe.id === id;
  });
}

export function toOrderItem(recipe: RecipeDefinition | undefined): OrderItem {
  if (!recipe) {
    return {
      id: 'unknown',
      name: 'Món không xác định',
      ingredients: [],
      price: 0,
      preparationTime: 0,
    };
  }
  return {
    id: recipe.id,
    name: recipe.name,
    ingredients: recipe.ingredients,
    price: recipe.basePrice,
    preparationTime: recipe.preparationTime,
  };
}
