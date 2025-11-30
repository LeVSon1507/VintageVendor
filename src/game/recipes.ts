import { Ingredient, OrderItem } from '../types';

export type RecipeDefinition = {
  id: string;
  name: string;
  ingredients: Ingredient[];
  basePrice: number;
  preparationTime: number;
};

export const RECIPE_CATALOG: RecipeDefinition[] = [
  {
    id: 'cafe_vot',
    name: 'Cà phê vợt',
    ingredients: [
      { id: 'bot_ca_phe', name: 'Bột cà phê', type: 'powder', quantity: 15, unit: 'g' },
      { id: 'nuoc_soi', name: 'Nước sôi', type: 'liquid', quantity: 150, unit: 'ml' },
      { id: 'duong', name: 'Đường', type: 'powder', quantity: 10, unit: 'g' },
    ],
    basePrice: 12000,
    preparationTime: 18,
  },
  {
    id: 'sua_dau_nanh',
    name: 'Sữa đậu nành',
    ingredients: [
      { id: 'dau_nanh', name: 'Đậu nành', type: 'solid', quantity: 50, unit: 'g' },
      { id: 'nuoc', name: 'Nước', type: 'liquid', quantity: 200, unit: 'ml' },
      { id: 'duong', name: 'Đường', type: 'powder', quantity: 10, unit: 'g' },
    ],
    basePrice: 8000,
    preparationTime: 12,
  },
  {
    id: 'banh_mi_thit',
    name: 'Bánh mì thịt',
    ingredients: [
      { id: 'banh_mi', name: 'Bánh mì', type: 'solid', quantity: 1, unit: 'piece' },
      { id: 'thit_nguoi', name: 'Thịt nguội', type: 'solid', quantity: 50, unit: 'g' },
      { id: 'do_chua', name: 'Đồ chua', type: 'solid', quantity: 30, unit: 'g' },
      { id: 'tuong_ot', name: 'Tương ớt', type: 'liquid', quantity: 10, unit: 'ml' },
    ],
    basePrice: 18000,
    preparationTime: 15,
  },
  {
    id: 'che',
    name: 'Chè',
    ingredients: [
      { id: 'hat_che', name: 'Hạt chè', type: 'solid', quantity: 50, unit: 'g' },
      { id: 'nuoc_duong', name: 'Nước đường', type: 'liquid', quantity: 150, unit: 'ml' },
      { id: 'da_vien', name: 'Đá viên', type: 'solid', quantity: 6, unit: 'piece' },
    ],
    basePrice: 10000,
    preparationTime: 10,
  },
  {
    id: 'xien_que',
    name: 'Xiên que',
    ingredients: [
      { id: 'thit_xien', name: 'Thịt xiên', type: 'solid', quantity: 60, unit: 'g' },
      { id: 'gia_vi', name: 'Gia vị', type: 'powder', quantity: 5, unit: 'g' },
    ],
    basePrice: 15000,
    preparationTime: 8,
  },
  {
    id: 'banh_bo',
    name: 'Bánh bò',
    ingredients: [
      { id: 'banh_bo_nguyen_lieu', name: 'Bánh bò', type: 'solid', quantity: 1, unit: 'piece' },
      { id: 'nuoc_cot_dua', name: 'Nước cốt dừa', type: 'liquid', quantity: 20, unit: 'ml' },
    ],
    basePrice: 7000,
    preparationTime: 6,
  },
  {
    id: 'soda_da_chanh',
    name: 'Soda đá chanh',
    ingredients: [
      { id: 'soda', name: 'Soda', type: 'liquid', quantity: 200, unit: 'ml' },
      { id: 'chanh', name: 'Chanh', type: 'solid', quantity: 1, unit: 'piece' },
      { id: 'da_vien', name: 'Đá viên', type: 'solid', quantity: 6, unit: 'piece' },
    ],
    basePrice: 12000,
    preparationTime: 9,
  },
  {
    id: 'soda_chai',
    name: 'Soda chai',
    ingredients: [
      { id: 'soda', name: 'Soda', type: 'liquid', quantity: 330, unit: 'ml' },
    ],
    basePrice: 10000,
    preparationTime: 3,
  },
  {
    id: 'xien_que_tuong_ot',
    name: 'Xiên que tương ớt',
    ingredients: [
      { id: 'thit_xien', name: 'Thịt xiên', type: 'solid', quantity: 60, unit: 'g' },
      { id: 'tuong_ot', name: 'Tương ớt', type: 'liquid', quantity: 10, unit: 'ml' },
      { id: 'tieu', name: 'Tiêu', type: 'powder', quantity: 2, unit: 'g' },
    ],
    basePrice: 17000,
    preparationTime: 9,
  },
  {
    id: 'ca_vien_chien',
    name: 'Cá viên chiên',
    ingredients: [
      { id: 'ca_vien', name: 'Cá viên', type: 'solid', quantity: 80, unit: 'g' },
      { id: 'dua_leo', name: 'Dưa leo', type: 'solid', quantity: 20, unit: 'g' },
      { id: 'rau_que', name: 'Rau quế', type: 'garnish', quantity: 5, unit: 'g' },
    ],
    basePrice: 16000,
    preparationTime: 8,
  },
  {
    id: 'soda_chanh_muoi',
    name: 'Soda chanh muối',
    ingredients: [
      { id: 'soda', name: 'Soda', type: 'liquid', quantity: 200, unit: 'ml' },
      { id: 'chanh', name: 'Chanh', type: 'solid', quantity: 1, unit: 'piece' },
      { id: 'muoi', name: 'Muối', type: 'powder', quantity: 2, unit: 'g' },
    ],
    basePrice: 13000,
    preparationTime: 9,
  },
];

export function getRecipeById(id: string): RecipeDefinition | undefined {
  return RECIPE_CATALOG.find(recipe => recipe.id === id);
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
