import { Ingredient } from '../types';

export const INGREDIENT_CATALOG: Ingredient[] = [
  { id: 'bot_ca_phe', name: 'Bột cà phê', type: 'powder', quantity: 15, unit: 'g' },
  { id: 'nuoc_soi', name: 'Nước sôi', type: 'liquid', quantity: 150, unit: 'ml' },
  { id: 'duong', name: 'Đường', type: 'powder', quantity: 10, unit: 'g' },
  { id: 'dau_nanh', name: 'Đậu nành', type: 'solid', quantity: 50, unit: 'g' },
  { id: 'nuoc', name: 'Nước', type: 'liquid', quantity: 200, unit: 'ml' },
  { id: 'banh_mi', name: 'Bánh mì', type: 'solid', quantity: 1, unit: 'piece' },
  { id: 'thit_nguoi', name: 'Thịt nguội', type: 'solid', quantity: 50, unit: 'g' },
  { id: 'do_chua', name: 'Đồ chua', type: 'solid', quantity: 30, unit: 'g' },
  { id: 'tuong_ot', name: 'Tương ớt', type: 'liquid', quantity: 10, unit: 'ml' },
  { id: 'hat_che', name: 'Hạt chè', type: 'solid', quantity: 50, unit: 'g' },
  { id: 'nuoc_duong', name: 'Nước đường', type: 'liquid', quantity: 150, unit: 'ml' },
  { id: 'da_vien', name: 'Đá viên', type: 'solid', quantity: 6, unit: 'piece' },
  { id: 'thit_xien', name: 'Thịt xiên', type: 'solid', quantity: 60, unit: 'g' },
  { id: 'gia_vi', name: 'Gia vị', type: 'powder', quantity: 5, unit: 'g' },
  { id: 'banh_bo_nguyen_lieu', name: 'Bánh bò', type: 'solid', quantity: 1, unit: 'piece' },
  { id: 'nuoc_cot_dua', name: 'Nước cốt dừa', type: 'liquid', quantity: 20, unit: 'ml' },
  { id: 'soda', name: 'Soda', type: 'liquid', quantity: 200, unit: 'ml' },
  { id: 'chanh', name: 'Chanh', type: 'solid', quantity: 1, unit: 'piece' },
  { id: 'ca_vien', name: 'Cá viên', type: 'solid', quantity: 60, unit: 'g' },
  { id: 'dua_leo', name: 'Dưa leo', type: 'solid', quantity: 20, unit: 'g' },
  { id: 'rau_que', name: 'Rau quế', type: 'garnish', quantity: 5, unit: 'g' },
  { id: 'muoi', name: 'Muối', type: 'powder', quantity: 2, unit: 'g' },
  { id: 'tieu', name: 'Tiêu', type: 'powder', quantity: 2, unit: 'g' },
];

export function getIngredientById(id: string): Ingredient | undefined {
  return INGREDIENT_CATALOG.find(function findIngredient(ingredient) {
    return ingredient.id === id;
  });
}
